/**
 * Claude Admin Console C4B1A — Partial DRAFT autosave contract QA.
 * Proves the relaxed DRAFT validator accepts incomplete edits while still enforcing
 * length/type/URL/security guards, that the strict validator still governs published
 * content and manual publish, and that an incomplete draft can never become PUBLISHED.
 * Pure: schema-level checks + service-level checks over an in-memory repository.
 */
import { readFileSync } from "node:fs";
import {
  draftAutosaveSchema,
  publishableArticleSchema,
  isPublishableArticle,
  publishableIssues,
} from "@/modules/admin/domain";
import {
  createArticle,
  updateArticle,
  transitionArticle,
  type ArticleServiceDeps,
} from "@/modules/admin/articles/service-core";
import type { ArticleRecord, ArticleActor } from "@/modules/admin/articles/types";
import type { ArticleRepository } from "@/modules/admin/articles/repository";
import type { AuditEntryInput } from "@/modules/admin/audit-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// --- In-memory repo/deps (mirrors debug-admin-articles-qa) ------------------
function makeRepo(): ArticleRepository & { rows: ArticleRecord[] } {
  const rows: ArticleRecord[] = [];
  let seq = 0;
  const clone = (r: ArticleRecord): ArticleRecord => ({ ...r });
  return {
    rows,
    async list(f) {
      const items = rows.slice(f.skip, f.skip + f.take).map(clone);
      return { items, total: rows.length };
    },
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
  const audits: AuditEntryInput[] = [];
  const deps: ArticleServiceDeps = {
    repo: makeRepo(),
    audit: async (input) => { audits.push(input); return { ok: true, id: `audit${audits.length}` }; },
    now: () => new Date(Date.UTC(2025, 5, 1, 12, 0, 0)),
  };
  return { deps, audits };
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

// Force a repo row into a given lifecycle state (bypassing the service transitions).
function setStatus(deps: ArticleServiceDeps, id: string, status: string) {
  const repo = deps.repo as ArticleRepository & { rows: ArticleRecord[] };
  const row = repo.rows.find((r) => r.id === id);
  if (row) row.status = status;
}

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "D1 relaxed draft: accepts incomplete title/slug/summary/body/SEO",
    run: () => {
      // Empty title + empty slug + missing body: an in-progress draft.
      const a = draftAutosaveSchema.safeParse({ title: "", slug: "", summary: "", body: "", seoTitle: "", seoDescription: "" });
      assert(a.success, "empty/blank fields accepted");
      // Short (below strict min) title + partial slug.
      const b = draftAutosaveSchema.safeParse({ title: "ab", slug: "sade" });
      assert(b.success, "short title + short slug accepted");
      // A truly partial patch (only one field) touches nothing else.
      const c = draftAutosaveSchema.safeParse({ title: "Half-typed heading" });
      assert(c.success && c.data.language === undefined && c.data.displayOrder === undefined, "partial patch → no defaulted fields");
    },
  },
  {
    name: "D2 relaxed draft: STILL enforces max length / type / range",
    run: () => {
      assert(!draftAutosaveSchema.safeParse({ title: "x".repeat(201) }).success, "title over 200 rejected");
      assert(!draftAutosaveSchema.safeParse({ summary: "x".repeat(501) }).success, "summary over 500 rejected");
      assert(!draftAutosaveSchema.safeParse({ body: "x".repeat(50_001) }).success, "body over 50k rejected");
      assert(!draftAutosaveSchema.safeParse({ seoTitle: "x".repeat(201) }).success, "seoTitle over 200 rejected");
      assert(!draftAutosaveSchema.safeParse({ seoDescription: "x".repeat(401) }).success, "seoDescription over 400 rejected");
      assert(!draftAutosaveSchema.safeParse({ readingTimeMinutes: 0 }).success, "readingTime 0 rejected");
      assert(!draftAutosaveSchema.safeParse({ readingTimeMinutes: 999 }).success, "readingTime 999 rejected");
      assert(!draftAutosaveSchema.safeParse({ displayOrder: -1 }).success, "negative displayOrder rejected");
      assert(!draftAutosaveSchema.safeParse({ isFeatured: "yes" }).success, "non-boolean isFeatured rejected");
    },
  },
  {
    name: "D3 relaxed draft: STILL enforces URL/security (slug format, media ref, enums)",
    run: () => {
      // Empty slug OK, but a non-empty slug must remain safe kebab-case (URL/security).
      assert(draftAutosaveSchema.safeParse({ slug: "" }).success, "empty slug allowed");
      assert(draftAutosaveSchema.safeParse({ slug: "valid-kebab-123" }).success, "valid kebab allowed");
      assert(!draftAutosaveSchema.safeParse({ slug: "Not Kebab!" }).success, "unsafe slug rejected");
      assert(!draftAutosaveSchema.safeParse({ slug: "../etc/passwd" }).success, "path-traversal slug rejected");
      assert(!draftAutosaveSchema.safeParse({ slug: "Upper-Case" }).success, "uppercase slug rejected");
      assert(!draftAutosaveSchema.safeParse({ coverImageAssetId: "x".repeat(65) }).success, "over-long media ref rejected");
      assert(!draftAutosaveSchema.safeParse({ language: "fr" }).success, "unknown locale rejected");
      assert(!draftAutosaveSchema.safeParse({ category: "malware" }).success, "unknown category rejected");
    },
  },
  {
    name: "P1 strict publishable schema: complete passes, incomplete fails w/ issues",
    run: () => {
      assert(publishableArticleSchema.safeParse({ title: "Real Title", slug: "real-title", body: "Body text.", language: "en" }).success, "complete → publishable");
      assert(!publishableArticleSchema.safeParse({ title: "ab", slug: "real-title", body: "Body.", language: "en" }).success, "short title → not publishable");
      assert(!publishableArticleSchema.safeParse({ title: "Real Title", slug: "", body: "Body.", language: "en" }).success, "empty slug → not publishable");
      assert(!publishableArticleSchema.safeParse({ title: "Real Title", slug: "real-title", body: "", language: "en" }).success, "empty body → not publishable");
      assert(isPublishableArticle({ title: "Real Title", slug: "real-title", body: "Body." }), "helper true when complete");
      assert(!isPublishableArticle({ title: "", slug: "", body: "" }), "helper false when blank");
      assert(publishableIssues({ title: "", slug: "", body: "" }).length >= 3, "issues list the missing fields");
      assert(publishableIssues({ title: "Real Title", slug: "real-title", body: "Body." }).length === 0, "no issues when complete");
    },
  },
  {
    name: "S1 service: DRAFT autosave accepts an incomplete edit (relaxed)",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, completeDraft());
      assert(c.ok, "seed draft created");
      if (!c.ok) return;
      // Blank the title while editing — a DRAFT must accept this.
      const cleared = await updateArticle(deps, founder, c.data.id, { title: "" });
      assert(cleared.ok && cleared.data.title === "", "DRAFT relaxed update accepted empty title");
      // A short title is also fine on a draft.
      const short = await updateArticle(deps, founder, c.data.id, { title: "ab" });
      assert(short.ok && short.data.title === "ab", "DRAFT relaxed update accepted short title");
      // But an unsafe slug is still rejected on a draft.
      const bad = await updateArticle(deps, founder, c.data.id, { slug: "Bad Slug!" });
      assert(!bad.ok && bad.status === 422, "DRAFT relaxed update still rejects unsafe slug");
    },
  },
  {
    name: "S2 service: PUBLISHED content keeps STRICT validation (no blanking)",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, completeDraft());
      assert(c.ok, "seed created");
      if (!c.ok) return;
      setStatus(deps, c.data.id, "PUBLISHED");
      const blanked = await updateArticle(deps, founder, c.data.id, { title: "" });
      assert(!blanked.ok && blanked.status === 422, "PUBLISHED cannot be blanked (strict)");
      const ok = await updateArticle(deps, founder, c.data.id, { title: "A proper new title" });
      assert(ok.ok && ok.data.title === "A proper new title", "PUBLISHED still accepts a complete edit");
    },
  },
  {
    name: "S3 service: incomplete DRAFT cannot be PUBLISHED; complete DRAFT can",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founder, completeDraft({ slug: "publish-gate" }));
      assert(c.ok, "seed created");
      if (!c.ok) return;
      // Relax it into an incomplete state via the draft path, then try to publish.
      await updateArticle(deps, founder, c.data.id, { title: "" });
      const blocked = await transitionArticle(deps, founder, c.data.id, "PUBLISH");
      assert(!blocked.ok && blocked.status === 422 && blocked.code === "INCOMPLETE_DRAFT", "incomplete draft → publish blocked");
      assert(!blocked.ok && Array.isArray(blocked.issues), "block carries completeness issues");
      // Restore completeness, then publish succeeds.
      await updateArticle(deps, founder, c.data.id, { title: "Now complete title" });
      const pub = await transitionArticle(deps, founder, c.data.id, "PUBLISH");
      assert(pub.ok && pub.data.status === "PUBLISHED", "complete draft → publishes");
    },
  },
  {
    name: "T1 static: relaxed validator wired into updateArticle (DRAFT-gated) + publish gate",
    run: () => {
      // Guard against a future refactor silently dropping the contract.
      const svc = readFileSync("src/modules/admin/articles/service-core.ts", "utf8");
      assert(svc.includes("draftAutosaveSchema") && svc.includes('current.status === "DRAFT"'), "draft-gated relaxed validator");
      assert(svc.includes("publishableIssues") && svc.includes("INCOMPLETE_DRAFT"), "publish completeness gate present");
    },
  },
];

async function main() {
  console.log("Admin Console C4B1A — Partial DRAFT autosave contract QA:");
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
  console.log(`\nadmin draft validation QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
