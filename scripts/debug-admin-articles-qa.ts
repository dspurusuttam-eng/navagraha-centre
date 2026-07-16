/**
 * Claude Admin Console C2A — Article service/API QA (pure, in-memory repository).
 * Covers authorization, CRUD, filters, lifecycle, validation and audit. No DB/route.
 * (Route handlers wire this service to the C1B guard; verified via typecheck/build.)
 */
import {
  listArticles, getArticle, createArticle, updateArticle, transitionArticle, deleteArticle,
  type ArticleServiceDeps,
} from "@/modules/admin/articles/service-core";
import type { ArticleRecord, ArticleActor } from "@/modules/admin/articles/types";
import type { ArticleRepository } from "@/modules/admin/articles/repository";
import type { AuditEntryInput } from "@/modules/admin/audit-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function makeRepo(): ArticleRepository & { rows: ArticleRecord[] } {
  const rows: ArticleRecord[] = [];
  let seq = 0;
  const clone = (r: ArticleRecord): ArticleRecord => ({ ...r });
  return {
    rows,
    async list(f) {
      const s = f.search?.toLowerCase();
      let items = rows.filter(
        (r) =>
          (!f.status || r.status === f.status) &&
          (!f.language || r.language === f.language) &&
          (!s || r.title.toLowerCase().includes(s) || (r.summary ?? "").toLowerCase().includes(s) || r.slug.includes(s)),
      );
      items = items.sort((a, b) => a.displayOrder - b.displayOrder || b.createdAt.getTime() - a.createdAt.getTime());
      return { items: items.slice(f.skip, f.skip + f.take).map(clone), total: items.length };
    },
    async findById(id) {
      const r = rows.find((x) => x.id === id);
      return r ? clone(r) : null;
    },
    async findBySlug(slug) {
      const r = rows.find((x) => x.slug === slug);
      return r ? clone(r) : null;
    },
    async create(data) {
      seq += 1;
      const at = new Date(Date.UTC(2025, 0, 1, 0, 0, seq));
      const rec: ArticleRecord = { id: `a${seq}`, publishedAt: null, unpublishedAt: null, archivedAt: null, createdAt: at, updatedAt: at, ...data };
      rows.push(rec);
      return clone(rec);
    },
    async update(id, data) {
      const r = rows.find((x) => x.id === id);
      if (!r) throw new Error("not found");
      Object.assign(r, data, { updatedAt: new Date(Date.UTC(2025, 5, 1, 12, 0, 0)) });
      return clone(r);
    },
    async remove(id) {
      const i = rows.findIndex((x) => x.id === id);
      if (i >= 0) rows.splice(i, 1);
    },
    async listRecentByUpdated(limit) {
      return [...rows].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, limit).map(clone);
    },
  };
}

const founder: ArticleActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: ArticleActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: ArticleActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

function makeDeps() {
  const audits: AuditEntryInput[] = [];
  const deps: ArticleServiceDeps = {
    repo: makeRepo(),
    audit: async (input) => { audits.push(input); return { ok: true, id: `audit${audits.length}` }; },
    now: () => new Date(Date.UTC(2025, 5, 1, 12, 0, 0)),
  };
  return { deps, audits };
}

const validArticle = (over: Record<string, unknown> = {}) => ({
  title: "Sade Sati explained",
  slug: "sade-sati-explained",
  summary: "A calm overview.",
  body: "word ".repeat(400),
  language: "en",
  category: "astrology",
  ...over,
});

type Group = { name: string; run: () => Promise<void> };
const groups: Group[] = [
  {
    name: "AUTH: support read-only; founder/editor write",
    run: async () => {
      const { deps } = makeDeps();
      const denied = await createArticle(deps, support, validArticle());
      assert(!denied.ok && denied.status === 403, "support create → 403");
      const created = await createArticle(deps, editor, validArticle());
      assert(created.ok && created.status === 201, "editor create → 201");
      // support may read
      const read = await getArticle(deps, created.ok ? created.data.id : "");
      assert(read.ok, "read works");
      const delDenied = await deleteArticle(deps, support, "a1", true);
      assert(!delDenied.ok && delDenied.status === 403, "support delete → 403");
      const transDenied = await transitionArticle(deps, support, "a1", "PUBLISH");
      assert(!transDenied.ok && transDenied.status === 403, "support publish → 403");
    },
  },
  {
    name: "CRUD: create DRAFT + authorId + reading time; update; get",
    run: async () => {
      const { deps } = makeDeps();
      const created = await createArticle(deps, founder, validArticle());
      assert(created.ok, "created");
      if (!created.ok) return;
      assert(created.data.status === "DRAFT", "status DRAFT");
      assert(created.data.authorId === "u-f", "authorId set");
      assert(created.data.readingTimeMinutes === 2, "reading time estimated (400 words → 2)");
      const updated = await updateArticle(deps, founder, created.data.id, { title: "Updated title here" });
      assert(updated.ok && updated.data.title === "Updated title here", "updated");
      const got = await getArticle(deps, created.data.id);
      assert(got.ok && got.data.title === "Updated title here", "get reflects update");
      const missing = await getArticle(deps, "nope");
      assert(!missing.ok && missing.status === 404, "missing → 404");
    },
  },
  {
    name: "FILTERS: status, language, search, pagination",
    run: async () => {
      const { deps } = makeDeps();
      await createArticle(deps, founder, validArticle({ slug: "a-one", title: "Alpha guide", language: "en" }));
      await createArticle(deps, founder, validArticle({ slug: "a-two", title: "Beta guide", language: "hi" }));
      await createArticle(deps, founder, validArticle({ slug: "a-three", title: "Gamma note", language: "en" }));
      const all = await listArticles(deps, {});
      assert(all.ok && all.data.total === 3, "3 total");
      const byLang = await listArticles(deps, { language: "en" });
      assert(byLang.ok && byLang.data.total === 2, "2 en");
      const bySearch = await listArticles(deps, { search: "beta" });
      assert(bySearch.ok && bySearch.data.total === 1 && bySearch.data.items[0]!.slug === "a-two", "search beta");
      const paged = await listArticles(deps, { page: 1, pageSize: 2 });
      assert(paged.ok && paged.data.items.length === 2 && paged.data.pageCount === 2, "pagination");
      const badStatus = await listArticles(deps, { status: "BOGUS" });
      assert(badStatus.ok && badStatus.data.total === 3, "invalid status filter ignored");
    },
  },
  {
    name: "LIFECYCLE: publish/unpublish/archive + illegal rejected + timestamps",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, validArticle());
      assert(c.ok, "created");
      if (!c.ok) return;
      const id = c.data.id;
      const pub = await transitionArticle(deps, founder, id, "PUBLISH");
      assert(pub.ok && pub.data.status === "PUBLISHED" && pub.data.publishedAt !== null, "published + timestamp");
      const illegal = await transitionArticle(deps, founder, id, "PUBLISH");
      assert(!illegal.ok && illegal.status === 409, "double publish → 409");
      const unpub = await transitionArticle(deps, founder, id, "UNPUBLISH");
      assert(unpub.ok && unpub.data.status === "UNPUBLISHED" && unpub.data.unpublishedAt !== null, "unpublished + timestamp");
      const arch = await transitionArticle(deps, founder, id, "ARCHIVE");
      assert(arch.ok && arch.data.status === "ARCHIVED" && arch.data.archivedAt !== null, "archived + timestamp");
      const restore = await transitionArticle(deps, founder, id, "RESTORE");
      assert(restore.ok && restore.data.status === "DRAFT", "restore → draft");
    },
  },
  {
    name: "VALIDATION: bad slug 422; duplicate slug 409; slug clash on update 409",
    run: async () => {
      const { deps } = makeDeps();
      const bad = await createArticle(deps, founder, validArticle({ slug: "Bad Slug!" }));
      assert(!bad.ok && bad.status === 422, "bad slug 422");
      await createArticle(deps, founder, validArticle({ slug: "unique-one" }));
      const dup = await createArticle(deps, founder, validArticle({ slug: "unique-one" }));
      assert(!dup.ok && dup.status === 409, "duplicate slug 409");
      const other = await createArticle(deps, founder, validArticle({ slug: "unique-two" }));
      assert(other.ok, "second created");
      if (!other.ok) return;
      const clash = await updateArticle(deps, founder, other.data.id, { slug: "unique-one" });
      assert(!clash.ok && clash.status === 409, "update slug clash 409");
    },
  },
  {
    name: "DELETE requires explicit confirmation",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, validArticle());
      assert(c.ok, "created");
      if (!c.ok) return;
      const noConfirm = await deleteArticle(deps, founder, c.data.id, false);
      assert(!noConfirm.ok && noConfirm.status === 400 && noConfirm.code === "CONFIRMATION_REQUIRED", "no confirm → 400");
      const confirmed = await deleteArticle(deps, founder, c.data.id, true);
      assert(confirmed.ok, "confirmed delete ok");
      const gone = await getArticle(deps, c.data.id);
      assert(!gone.ok && gone.status === 404, "gone after delete");
    },
  },
  {
    name: "AUDIT: every mutation recorded with actor + action",
    run: async () => {
      const { deps, audits } = makeDeps();
      const c = await createArticle(deps, founder, validArticle());
      assert(c.ok, "created");
      if (!c.ok) return;
      await updateArticle(deps, founder, c.data.id, { title: "New title value" });
      await transitionArticle(deps, founder, c.data.id, "PUBLISH");
      await deleteArticle(deps, founder, c.data.id, true);
      const actions = audits.map((a) => a.action);
      assert(actions.includes("article.create"), "create audited");
      assert(actions.includes("article.update"), "update audited");
      assert(actions.includes("article.publish"), "publish audited");
      assert(actions.includes("article.delete"), "delete audited");
      assert(audits.every((a) => a.actorUserId === "u-f" && a.entityType === "article"), "actor + entity recorded");
    },
  },
];

async function main() {
  console.log("Admin Console C2A — Article service/API QA (pure):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      await group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin articles QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
