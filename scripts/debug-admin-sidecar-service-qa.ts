/**
 * Claude C8B3 — service-level structured-sidecar protection QA.
 *
 * Drives the REAL shared article service against an in-memory repository, proving the
 * guarantee holds on the path every body write shares — the Desk action, autosave and the
 * direct `PATCH /api/admin/articles/[id]` route alike. No database, no migration, no import.
 */
import { readFileSync } from "node:fs";
import {
  createArticle,
  updateArticle,
  transitionArticle,
  getArticle,
  SIDECAR_MALFORMED_ERROR,
  type ArticleServiceDeps,
} from "@/modules/admin/articles/service-core";
import { withoutSidecar } from "@/modules/admin/articles/api-sanitize";
import { inspectDeskBody, encodeDeskMeta } from "@/modules/desk-sidecar/sidecar";
import { buildImportBody } from "@/modules/content/desk-import-core";
import { curatedContentEntries } from "@/modules/content/catalog";
import type { ArticleRecord, ArticleActor } from "@/modules/admin/articles/types";
import type { ArticleRepository } from "@/modules/admin/articles/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const RASHIFAL = curatedContentEntries.find((e) => e.slug === "daily-rashifal-26-april-2026")!;
const SIDECAR_BODY = buildImportBody(RASHIFAL);
const STORED_SIDECAR = inspectDeskBody(SIDECAR_BODY).sidecar!;
const VISIBLE = inspectDeskBody(SIDECAR_BODY).visibleBody;

const founder: ArticleActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };

function makeRepo(): ArticleRepository & { rows: ArticleRecord[] } {
  const rows: ArticleRecord[] = [];
  let seq = 0;
  const clone = (r: ArticleRecord): ArticleRecord => ({ ...r });
  return {
    rows,
    async list(f) { return { items: rows.slice(f.skip, f.skip + f.take).map(clone), total: rows.length }; },
    async findById(id) { const r = rows.find((x) => x.id === id); return r ? clone(r) : null; },
    async findBySlug(slug) { const r = rows.find((x) => x.slug === slug); return r ? clone(r) : null; },
    async create(data) {
      seq += 1;
      const at = new Date(Date.UTC(2026, 0, 1, 0, 0, seq));
      const rec = { id: `a${seq}`, publishedAt: null, unpublishedAt: null, archivedAt: null, createdAt: at, updatedAt: at, ...data } as ArticleRecord;
      rows.push(rec);
      return clone(rec);
    },
    async update(id, data) {
      const r = rows.find((x) => x.id === id);
      if (!r) throw new Error("not found");
      Object.assign(r, data, { updatedAt: new Date(Date.UTC(2026, 5, 1)) });
      return clone(r);
    },
    async remove(id) { const i = rows.findIndex((x) => x.id === id); if (i >= 0) rows.splice(i, 1); },
    async listRecentByUpdated(limit) { return [...rows].slice(0, limit).map(clone); },
  };
}

function makeDeps() {
  const repo = makeRepo();
  const deps: ArticleServiceDeps = { repo, audit: async () => ({ ok: true, id: "x" }), now: () => new Date(Date.UTC(2026, 5, 1)) };
  return { deps, repo };
}

/** Seed a stored article whose body carries the sidecar (as the trusted import would). */
async function seedWithSidecar(body: string = SIDECAR_BODY) {
  const { deps, repo } = makeDeps();
  repo.rows.push({
    id: "a1", slug: "daily-rashifal-26-april-2026", title: "Daily Rashifal", excerpt: "e",
    summary: "s", body, language: "en", category: "astrology", coverImageAssetId: null,
    status: "DRAFT", seoTitle: null, seoDescription: null, readingTimeMinutes: 4,
    isFeatured: false, displayOrder: 0, publishedAt: null, unpublishedAt: null, archivedAt: null,
    authorId: null, createdAt: new Date(), updatedAt: new Date(),
  } as ArticleRecord);
  return { deps, repo };
}
const storedBody = (repo: { rows: ArticleRecord[] }) => repo.rows[0]!.body ?? "";
const sidecarCount = (body: string) => (body.match(/navagraha:desk-meta/g) ?? []).length;

type Group = { name: string; run: () => Promise<void> };
const groups: Group[] = [
  {
    name: "P1 PATCH bypass: a body that OMITS the sidecar cannot REMOVE it",
    run: async () => {
      const { deps, repo } = await seedWithSidecar();
      // Exactly what a naive PATCH would send: prose only.
      const result = await updateArticle(deps, founder, "a1", { body: "## Edited\n\nNew prose." });
      assert(result.ok, "update accepted");
      const body = storedBody(repo);
      assert(inspectDeskBody(body).sidecar === STORED_SIDECAR, "stored sidecar reattached VERBATIM");
      assert(inspectDeskBody(body).visibleBody === "## Edited\n\nNew prose.", "editor prose stored");
      assert(sidecarCount(body) === 1, "exactly one sidecar");
    },
  },
  {
    name: "P2 PATCH bypass: a body carrying a DIFFERENT sidecar cannot REPLACE the stored one",
    run: async () => {
      const { deps, repo } = await seedWithSidecar();
      const hostile = `## Prose\n\n${encodeDeskMeta({ v: 1, displayCategory: "Numerology", faqItems: [{ question: "injected", answer: "injected" }] })}`;
      const result = await updateArticle(deps, founder, "a1", { body: hostile });
      assert(result.ok, "update accepted");
      const body = storedBody(repo);
      assert(inspectDeskBody(body).sidecar === STORED_SIDECAR, "stored sidecar survives — submitted one DISCARDED");
      assert(!body.includes("injected"), "no injected sidecar content stored");
      assert(!body.includes("Numerology"), "no injected display category stored");
      assert(sidecarCount(body) === 1, "exactly one sidecar");
      assert(inspectDeskBody(body).meta?.displayCategory === "Daily Rashifal", "original meta intact");
    },
  },
  {
    name: "P3 PATCH bypass: resubmitting the full stored body cannot DUPLICATE the sidecar",
    run: async () => {
      const { deps, repo } = await seedWithSidecar();
      // GET-then-PATCH round trip with the raw body (pre-sanitisation client).
      const result = await updateArticle(deps, founder, "a1", { body: SIDECAR_BODY });
      assert(result.ok, "update accepted");
      const body = storedBody(repo);
      assert(sidecarCount(body) === 1, `exactly one sidecar, got ${sidecarCount(body)}`);
      assert(body === SIDECAR_BODY, "body is a fixed point (byte-identical)");
      // Repeat writes stay stable.
      for (let i = 0; i < 3; i += 1) await updateArticle(deps, founder, "a1", { body: storedBody(repo) });
      assert(sidecarCount(storedBody(repo)) === 1, "still exactly one sidecar after repeats");
      assert(storedBody(repo) === SIDECAR_BODY, "still a fixed point");
    },
  },
  {
    name: "P4 body CLEAR + autosave through the service preserve the sidecar",
    run: async () => {
      const { deps, repo } = await seedWithSidecar();
      // Autosave clearing the visible body entirely.
      const cleared = await updateArticle(deps, founder, "a1", { body: "" });
      assert(cleared.ok, "clear accepted");
      assert(inspectDeskBody(storedBody(repo)).visibleBody === "", "visible body cleared as intended");
      assert(inspectDeskBody(storedBody(repo)).sidecar === STORED_SIDECAR, "sidecar SURVIVES a full body clear");
      // Repeated autosave of the same visible body is byte-stable.
      const first = storedBody(repo);
      await updateArticle(deps, founder, "a1", { body: "" });
      assert(storedBody(repo) === first, "repeated autosave is byte-stable (no drift)");
      // Reading time is estimated from the VISIBLE body only, never inflated by the sidecar.
      // (The estimate runs only when readingTimeMinutes is omitted — which is exactly what
      // the editor form sends when the field is cleared.)
      const withProse = await updateArticle(deps, founder, "a1", { body: "word ".repeat(400) });
      assert(withProse.ok, "prose update accepted");
      assert(withProse.ok && withProse.data.readingTimeMinutes === 2, `400 visible words -> 2 min, got ${withProse.ok ? withProse.data.readingTimeMinutes : "?"}`);
      // Proof it is the sidecar-free estimate: the stored body (prose + a large JSON sidecar)
      // would estimate higher if the sidecar were counted.
      assert(inspectDeskBody(storedBody(repo)).sidecar === STORED_SIDECAR, "sidecar still attached during the estimate");
      const fullBodyWords = storedBody(repo).trim().split(/\s+/).length;
      assert(Math.round(fullBodyWords / 200) > 2, "the full stored body would have estimated higher — sidecar excluded");
      // An explicit null still means "clear it", not "estimate it".
      const cleared2 = await updateArticle(deps, founder, "a1", { body: "word ".repeat(400), readingTimeMinutes: null });
      assert(cleared2.ok && cleared2.data.readingTimeMinutes === null, "explicit null clears rather than estimates");
    },
  },
  {
    name: "P5 create: an ordinary create cannot introduce a sidecar; the trusted import can",
    run: async () => {
      const { deps, repo } = makeDeps();
      const hostile = `Prose here.\n\n${encodeDeskMeta({ v: 1, displayCategory: "Gemstones" })}`;
      const created = await createArticle(deps, founder, { title: "New article", slug: "new-article", body: hostile, altText: undefined });
      assert(created.ok, "create accepted");
      const body = repo.rows[0]!.body ?? "";
      assert(sidecarCount(body) === 0, "ordinary create STRIPPED the sidecar");
      assert(!body.includes("Gemstones"), "no injected meta stored");
      assert(body === "Prose here.", "visible prose kept");

      // The trusted legacy-import path may create a valid sidecar verbatim.
      const trusted = await createArticle(deps, founder, { title: "Imported", slug: "imported", body: SIDECAR_BODY }, { trustedSidecarWriter: true });
      assert(trusted.ok, "trusted create accepted");
      const importedBody = repo.rows[1]!.body ?? "";
      assert(importedBody === SIDECAR_BODY, "trusted writer stores the sidecar verbatim");
      assert(inspectDeskBody(importedBody).meta?.displayCategory === "Daily Rashifal", "imported meta valid");
    },
  },
  {
    name: "P6 trusted update: only the import authority may rewrite a sidecar",
    run: async () => {
      const { deps, repo } = await seedWithSidecar();
      const rewritten = `## Re-import\n\n${encodeDeskMeta({ v: 1, displayCategory: "Panchang" })}`;
      const trusted = await updateArticle(deps, founder, "a1", { body: rewritten }, { trustedSidecarWriter: true });
      assert(trusted.ok, "trusted update accepted");
      assert(storedBody(repo) === rewritten, "trusted writer rewrote the sidecar verbatim");
      // ...and the very same payload through the ordinary path would NOT have done so.
      const { deps: d2, repo: r2 } = await seedWithSidecar();
      await updateArticle(d2, founder, "a1", { body: rewritten });
      assert(inspectDeskBody(storedBody(r2)).sidecar === STORED_SIDECAR, "ordinary path refused the same rewrite");
    },
  },
  {
    name: "M1 malformed stored sidecar: body write BLOCKED, stored data retained, controlled error",
    run: async () => {
      const damaged = `${VISIBLE}\n\n<!--navagraha:desk-meta:v1\n{ broken json\n-->`;
      const { deps, repo } = await seedWithSidecar(damaged);
      const before = storedBody(repo);

      const blocked = await updateArticle(deps, founder, "a1", { body: "attempted overwrite" });
      assert(!blocked.ok, "body write rejected");
      assert(!blocked.ok && blocked.status === 409 && blocked.code === "SIDECAR_MALFORMED", `409 SIDECAR_MALFORMED, got ${!blocked.ok ? blocked.status + " " + blocked.code : "ok"}`);
      assert(!blocked.ok && blocked.message === SIDECAR_MALFORMED_ERROR, "controlled message");
      assert(storedBody(repo) === before, "stored data RETAINED byte-for-byte");

      // The controlled error exposes no raw sidecar/JSON.
      assert(!SIDECAR_MALFORMED_ERROR.includes("navagraha:desk-meta"), "error exposes no marker");
      assert(!SIDECAR_MALFORMED_ERROR.includes("{") && !SIDECAR_MALFORMED_ERROR.includes("broken"), "error exposes no JSON");
      // Even a trusted writer is blocked from a blind body write over damaged data.
      const trustedBlocked = await updateArticle(deps, founder, "a1", { body: "x" }, { trustedSidecarWriter: true });
      assert(!trustedBlocked.ok && trustedBlocked.code === "SIDECAR_MALFORMED", "trusted writer also blocked (repair is a deliberate act)");
    },
  },
  {
    name: "M2 malformed: NON-body updates and status-only lifecycle transitions still work",
    run: async () => {
      const damaged = `${VISIBLE}\n\n<!--navagraha:desk-meta:v1\n{ broken\n-->`;
      const { deps, repo } = await seedWithSidecar(damaged);

      // A metadata-only update is unaffected — only body writes are blocked.
      const meta = await updateArticle(deps, founder, "a1", { title: "Renamed" });
      assert(meta.ok && meta.data.title === "Renamed", "non-body update still allowed");
      assert(storedBody(repo) === damaged, "body untouched by a non-body update");

      // Status-only lifecycle transitions keep working and never touch the body.
      repo.rows[0]!.body = `${VISIBLE}\n\n${STORED_SIDECAR}`;
      repo.rows[0]!.status = "DRAFT";
      const published = await transitionArticle(deps, founder, "a1", "PUBLISH");
      assert(published.ok && published.data.status === "PUBLISHED", "publish works");
      assert(inspectDeskBody(storedBody(repo)).sidecar === STORED_SIDECAR, "publish preserved the sidecar");
      const unpublished = await transitionArticle(deps, founder, "a1", "UNPUBLISH");
      assert(unpublished.ok && unpublished.data.status === "UNPUBLISHED", "unpublish works");
      assert(inspectDeskBody(storedBody(repo)).sidecar === STORED_SIDECAR, "unpublish preserved the sidecar");
      assert((await getArticle(deps, "a1")).ok, "article still readable");
    },
  },
  {
    name: "L1 API leakage: responses expose the visible body only (single, list, array)",
    run: async () => {
      const article = { id: "a1", slug: "s", title: "t", body: SIDECAR_BODY, publishedAt: new Date("2026-01-01") };
      const single = withoutSidecar(article);
      assert(single.body === VISIBLE, "single article body stripped");
      assert(!single.body.includes("navagraha:desk-meta") && !single.body.includes("zodiacSections"), "no raw sidecar/JSON in the response");
      assert(single.publishedAt instanceof Date, "dates untouched");
      assert(single.slug === "s" && single.title === "t", "other fields untouched");

      const list = withoutSidecar({ items: [article, { ...article, id: "a2" }], total: 2, page: 1 });
      assert(list.items.every((i) => !String(i.body).includes("desk-meta")), "list payload stripped");
      assert(list.total === 2 && list.page === 1, "list metadata untouched");

      const bare = withoutSidecar([article]);
      assert(!String(bare[0]!.body).includes("desk-meta"), "bare array stripped");

      // Non-article payloads and null bodies pass through untouched.
      assert(withoutSidecar({ id: "x" }).id === "x", "non-article payload untouched");
      assert(withoutSidecar({ body: null }).body === null, "null body untouched");
      assert(withoutSidecar(null) === null && withoutSidecar("str") === "str", "primitives untouched");
    },
  },
  {
    name: "A1 static: every body-write path routes through the guarded service",
    run: async () => {
      const core = read("src/modules/admin/articles/service-core.ts");
      assert(core.includes("resolveGuardedBody"), "service resolves a guarded body");
      assert(core.includes('return err(409, "SIDECAR_MALFORMED"'), "service blocks a malformed sidecar");
      assert(core.includes("options?.trustedSidecarWriter"), "trusted-writer escape hatch exists");

      // The PATCH route goes through the service and does NOT grant trust.
      const route = read("src/app/api/admin/articles/[id]/route.ts");
      assert(route.includes("updateArticle(getAdminArticleDeps()"), "PATCH uses the shared service");
      assert(!route.includes("trustedSidecarWriter"), "PATCH does not grant sidecar-write authority");
      assert(route.includes("articleServiceResponse"), "PATCH responds through the sanitised helper");

      // No route or action anywhere grants trust — the import is the sole authority.
      for (const file of [
        "src/app/api/admin/articles/[id]/route.ts",
        "src/app/api/admin/articles/route.ts",
        "src/modules/admin/desk/article-actions.ts",
      ]) {
        assert(!read(file).includes("trustedSidecarWriter"), `${file} does not grant sidecar-write authority`);
      }

      // The Admin API response helper sanitises.
      const svc = read("src/modules/admin/articles/service.ts");
      assert(svc.includes("withoutSidecar(result.data)"), "API responses sanitised");
      const sanitize = read("src/modules/admin/articles/api-sanitize.ts");
      assert(!/^\s*import "server-only"/m.test(sanitize), "sanitiser is pure and testable");
      // The service depends only on the neutral codec, never the public content module.
      assert(!/@\/modules\/content\b/.test(core), "service does not import the public content module");
      assert(core.includes("@/modules/desk-sidecar/sidecar"), "service uses the neutral codec");
    },
  },
];

async function main() {
  console.log("Claude C8B3 — service-level sidecar protection QA:");
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
  console.log(`\nservice sidecar QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
