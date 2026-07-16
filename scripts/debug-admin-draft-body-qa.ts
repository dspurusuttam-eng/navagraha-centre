/**
 * Claude Admin Console C4B1B — Empty draft body preservation QA.
 * Proves the DRAFT autosave path distinguishes an OMITTED body (untouched) from an
 * EXPLICITLY EMPTY body (intentional clear → "" persists), that omitted fields never
 * reset stored values, and that an empty body still cannot be PUBLISHED. Pure: FormData
 * mapping checks + service-level checks over an in-memory repository.
 */
import { readFileSync } from "node:fs";
import { formDataToArticleInput } from "@/modules/admin/desk/article-form-config";
import {
  createArticle,
  updateArticle,
  transitionArticle,
  getArticle,
  type ArticleServiceDeps,
} from "@/modules/admin/articles/service-core";
import type { ArticleRecord, ArticleActor } from "@/modules/admin/articles/types";
import type { ArticleRepository } from "@/modules/admin/articles/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

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
    async remove(id) { const i = rows.findIndex((x) => x.id === id); if (i >= 0) rows.splice(i, 1); },
    async listRecentByUpdated(limit) { return [...rows].slice(0, limit).map(clone); },
  };
}

const founder: ArticleActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };

function makeDeps() {
  const deps: ArticleServiceDeps = {
    repo: makeRepo(),
    audit: async () => ({ ok: true, id: "audit" }),
    now: () => new Date(Date.UTC(2025, 5, 1, 12, 0, 0)),
  };
  return { deps };
}

const completeDraft = (over: Record<string, unknown> = {}) => ({
  title: "Sade Sati explained",
  slug: "sade-sati-explained",
  summary: "A calm overview.",
  body: "word ".repeat(400),
  language: "en",
  category: "astrology",
  ...over,
});

// A full editor snapshot (all fields present, like the real autosave form).
function editorForm(over: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const base: Record<string, string> = {
    title: "Sade Sati explained", slug: "sade-sati-explained", summary: "A calm overview.",
    body: "Original body content.", language: "en", category: "astrology",
    coverImageAssetId: "", isFeatured: "", displayOrder: "0", seoTitle: "", seoDescription: "", readingTimeMinutes: "",
  };
  for (const [k, v] of Object.entries({ ...base, ...over })) fd.set(k, v);
  return fd;
}

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "B1 mapping: present-empty body → \"\" (draft); absent → undefined; create keeps empty→omitted",
    run: () => {
      // DRAFT path (preserveEmptyBody): present-but-empty body persists as "".
      const cleared = formDataToArticleInput(editorForm({ body: "" }), { preserveEmptyBody: true });
      assert(cleared.body === "", "draft: present-empty body → \"\"");
      // DRAFT path: whitespace-only body is an intentional clear too.
      const ws = formDataToArticleInput(editorForm({ body: "   " }), { preserveEmptyBody: true });
      assert(ws.body === "", "draft: whitespace body → \"\"");
      // DRAFT path: absent body key → omitted (undefined).
      const noBodyForm = editorForm(); noBodyForm.delete("body");
      const omitted = formDataToArticleInput(noBodyForm, { preserveEmptyBody: true });
      assert(omitted.body === undefined, "draft: absent body → undefined");
      // DRAFT path: present non-empty body → trimmed value.
      const filled = formDataToArticleInput(editorForm({ body: "  Hello  " }), { preserveEmptyBody: true });
      assert(filled.body === "Hello", "draft: non-empty body trimmed");
      // CREATE path (default): empty body → omitted (create requires non-empty).
      const createEmpty = formDataToArticleInput(editorForm({ body: "" }));
      assert(createEmpty.body === undefined, "create: empty body → omitted");
      const createFilled = formDataToArticleInput(editorForm({ body: "Real body" }));
      assert(createFilled.body === "Real body", "create: non-empty body kept");
    },
  },
  {
    name: "B2 service: clearing an existing DRAFT body persists body=\"\"",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, completeDraft());
      assert(c.ok, "seed draft created");
      if (!c.ok) return;
      assert(typeof c.data.body === "string" && c.data.body.length > 0, "seed has body");
      const cleared = await updateArticle(deps, founder, c.data.id, { body: "" });
      assert(cleared.ok && cleared.data.body === "", "cleared body persists as \"\"");
      const got = await getArticle(deps, c.data.id);
      assert(got.ok && got.data.body === "", "reload confirms body=\"\"");
    },
  },
  {
    name: "B3 service: an omitted body leaves the stored body unchanged",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, completeDraft());
      assert(c.ok, "seed created");
      if (!c.ok) return;
      const original = c.data.body;
      // Update other fields WITHOUT a body key.
      const updated = await updateArticle(deps, founder, c.data.id, { title: "A new working title" });
      assert(updated.ok && updated.data.body === original, "omitted body unchanged");
      assert(updated.ok && updated.data.title === "A new working title", "other field applied");
    },
  },
  {
    name: "B4 service: an empty-body draft cannot be PUBLISHED; a bodied draft can",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, completeDraft({ slug: "body-gate" }));
      assert(c.ok, "seed created");
      if (!c.ok) return;
      await updateArticle(deps, founder, c.data.id, { body: "" });
      const blocked = await transitionArticle(deps, founder, c.data.id, "PUBLISH");
      assert(!blocked.ok && blocked.status === 422 && blocked.code === "INCOMPLETE_DRAFT", "empty body → publish blocked");
      await updateArticle(deps, founder, c.data.id, { body: "Now there is real body content." });
      const pub = await transitionArticle(deps, founder, c.data.id, "PUBLISH");
      assert(pub.ok && pub.data.status === "PUBLISHED", "bodied draft publishes");
    },
  },
  {
    name: "B5 static: update action preserves empty body; create does not",
    run: () => {
      const actions = readFileSync("src/modules/admin/desk/article-actions.ts", "utf8");
      assert(actions.includes("preserveEmptyBody: true"), "update passes preserveEmptyBody");
      // Create action must NOT preserve empty body (empty create body stays omitted).
      const createBlock = actions.slice(actions.indexOf("createArticleAction"), actions.indexOf("updateArticleAction"));
      assert(!createBlock.includes("preserveEmptyBody"), "create does not preserve empty body");
    },
  },
  {
    name: "B6 static: stale-save protection, retry and preview security preserved (unchanged)",
    run: () => {
      const core = readFileSync("src/modules/admin/desk/autosave-core.ts", "utf8");
      assert(core.includes("seq !== inFlightSeq") && core.includes("retry"), "stale-save rejection + retry intact");
      const preview = readFileSync("src/app/(admin)/admin/desk/[id]/preview/page.tsx", "utf8");
      assert(preview.includes("index: false") && preview.includes('fetchCache = "force-no-store"'), "preview noindex + no-store intact");
    },
  },
];

async function main() {
  console.log("Admin Console C4B1B — Empty draft body preservation QA:");
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
  console.log(`\nadmin draft body QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
