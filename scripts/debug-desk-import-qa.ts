/**
 * Claude C8B — legacy Desk import QA.
 * Exercises the real import algorithm end-to-end against an in-memory repository:
 * deterministic mapping, idempotent reruns, media registration/linking, conflict handling
 * and dry-run safety. No database, no migration, no Preview/Production contact.
 */
import { readFileSync } from "node:fs";
import { curatedContentEntries } from "@/modules/content/catalog";
import { deskPathForSlug, PUBLIC_DESK_LOCALES, parseBodyToSections } from "@/modules/content/desk-article-core";
import {
  buildDeskImportPlan,
  runDeskImport,
  validateImportItem,
  articleMatchesPayload,
  sectionsToBody,
  toAdminCategory,
  buildImportBody,
  PENDING_MEDIA_ID,
  type DeskImportItem,
  type DeskImportRepo,
  type ExistingArticle,
} from "@/modules/content/desk-import-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

// --- in-memory repo ---------------------------------------------------------
type Store = {
  articles: (ExistingArticle & { coverImageAssetId: string | null })[];
  media: { id: string; url: string; altText: string }[];
  writes: string[];
};

function makeRepo(seed: Partial<Store> = {}): { repo: DeskImportRepo; store: Store } {
  const store: Store = { articles: seed.articles ?? [], media: seed.media ?? [], writes: [] };
  let seq = 0;
  const repo: DeskImportRepo = {
    async findArticleBySlug(slug) {
      return store.articles.find((a) => a.slug === slug) ?? null;
    },
    async createArticle(payload) {
      seq += 1;
      const id = `art${seq}`;
      store.writes.push(`createArticle:${payload.slug}`);
      store.articles.push({
        id, slug: payload.slug, title: payload.title, excerpt: payload.excerpt,
        summary: payload.summary, body: payload.body, language: payload.language,
        category: payload.category, status: payload.status, seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription, readingTimeMinutes: payload.readingTimeMinutes,
        isFeatured: payload.isFeatured, displayOrder: payload.displayOrder,
        publishedAt: payload.publishedAt, coverImageAssetId: payload.coverImageAssetId,
      });
      return id;
    },
    async updateArticle(id, payload) {
      const row = store.articles.find((a) => a.id === id);
      if (!row) throw new Error("not found");
      store.writes.push(`updateArticle:${payload.slug}`);
      Object.assign(row, payload);
    },
    async findMediaByUrl(url) {
      return store.media.find((m) => m.url === url)?.id ?? null;
    },
    async createMedia(input) {
      seq += 1;
      const id = `med${seq}`;
      store.writes.push(`createMedia:${input.url}`);
      store.media.push({ id, url: input.url, altText: input.altText });
      return id;
    },
  };
  return { repo, store };
}

const PLAN = () => buildDeskImportPlan(curatedContentEntries);

function withCover(item: DeskImportItem, url: string, altText = "Cover"): DeskImportItem {
  return { ...item, coverImage: { url, altText } };
}

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "M1 mapping: 7 published Desk articles, URLs preserved, deterministic",
    run: () => {
      const plan = PLAN();
      assert(plan.length === 7, `7 published Desk articles, got ${plan.length}`);
      assert(plan.every((i) => i.url.startsWith("/from-the-desk/")), "only Desk entries");
      assert(plan.every((i) => deskPathForSlug(i.article.slug) === i.url), "every existing URL preserved");
      const slugs = plan.map((i) => i.article.slug);
      assert(new Set(slugs).size === slugs.length, "slugs unique");
      assert(JSON.stringify(buildDeskImportPlan(curatedContentEntries)) === JSON.stringify(plan), "plan deterministic across runs");
      // displayOrder preserved deterministically 0..n
      assert(JSON.stringify(plan.map((i) => i.article.displayOrder)) === JSON.stringify([0, 1, 2, 3, 4, 5, 6]), "display order assigned deterministically");
    },
  },
  {
    name: "M2 mapping preserves title/summary/excerpt/body/language/category/dates/SEO",
    run: () => {
      const plan = PLAN();
      const source = curatedContentEntries.find((e) => e.slug === "understanding-premium-consultation-journeys")!;
      const item = plan.find((i) => i.article.slug === source.slug)!;
      const a = item.article;
      assert(a.title === source.title, "title preserved");
      assert(a.excerpt === source.excerpt, "excerpt preserved");
      assert(a.summary === source.description, "summary preserved (from description)");
      assert(a.language === "en" && (PUBLIC_DESK_LOCALES as readonly string[]).includes(a.language), "EN language preserved");
      assert(a.category === "astrology", "category mapped");
      assert(a.status === "PUBLISHED", "status PUBLISHED");
      assert(a.seoTitle === source.seoTitle && a.seoDescription === source.seoDescription, "SEO fields preserved");
      assert(a.readingTimeMinutes === source.readingTimeMinutes, "reading time preserved");
      assert(a.isFeatured === source.isFeatured, "featured preserved");
      assert(a.publishedAt.toISOString() === source.publishedAt, "publication date preserved");
      assert(a.updatedAt.toISOString() === source.updatedAt, "updated date preserved");
      // Body round-trips back into the same sections the public Desk renders.
      const parsed = parseBodyToSections(sectionsToBody(source));
      assert(parsed.length === source.sections.length, "body round-trips to the same section count");
      assert(parsed[0]!.title === source.sections[0]!.title, "section titles round-trip");
      assert(a.body === buildImportBody(source), "body is the shared mapping (prose + reversible sidecar)");
      // Byline is carried as a fidelity note (Admin links authors by relation).
      assert(item.notes.some((n) => n.includes("byline")), "byline preserved/noted");
      // Category mapping is total.
      assert(toAdminCategory("Remedies") === "remedies" && toAdminCategory("Unknown Cat") === "astrology", "category map total");
    },
  },
  {
    name: "D1 dry run: default mode writes nothing but reports full totals",
    run: async () => {
      const { repo, store } = makeRepo();
      const report = await runDeskImport(PLAN(), repo, { apply: false });
      assert(report.apply === false, "dry run");
      assert(store.writes.length === 0, "NO writes performed in dry run");
      assert(store.articles.length === 0, "nothing persisted");
      assert(report.totals.created === 7, `would create 7, got ${report.totals.created}`);
      assert(report.totals.updated === 0 && report.totals.skipped === 0 && report.totals.conflict === 0, "no updates/skips/conflicts");
      assert(report.results.length === 7 && report.results.every((r) => r.articleId === undefined), "dry run assigns no ids");
    },
  },
  {
    name: "I1 idempotency: apply creates 7; an immediate rerun skips all 7 and writes nothing",
    run: async () => {
      const { repo, store } = makeRepo();
      const first = await runDeskImport(PLAN(), repo, { apply: true });
      assert(first.totals.created === 7, `first run creates 7, got ${first.totals.created}`);
      assert(store.articles.length === 7, "7 articles persisted");
      const writesAfterFirst = store.writes.length;

      // Rerun: no duplicates, no writes, everything skipped.
      const second = await runDeskImport(PLAN(), repo, { apply: true });
      assert(second.totals.skipped === 7, `rerun skips 7, got ${second.totals.skipped}`);
      assert(second.totals.created === 0 && second.totals.updated === 0 && second.totals.conflict === 0, "rerun changes nothing");
      assert(store.articles.length === 7, "still 7 articles — NO duplicates");
      assert(store.writes.length === writesAfterFirst, "rerun performed no writes");

      // A third run is equally inert.
      const third = await runDeskImport(PLAN(), repo, { apply: true });
      assert(third.totals.skipped === 7 && store.articles.length === 7, "third run still inert");
      const slugs = store.articles.map((a) => a.slug);
      assert(new Set(slugs).size === 7, "no duplicate slugs after 3 runs");
    },
  },
  {
    name: "I2 drift: an edited field is realigned as `updated`, then settles back to skipped",
    run: async () => {
      const { repo, store } = makeRepo();
      await runDeskImport(PLAN(), repo, { apply: true });
      // Simulate drift from the static source.
      store.articles[0]!.title = "Drifted title";
      const rerun = await runDeskImport(PLAN(), repo, { apply: true });
      assert(rerun.totals.updated === 1, `1 updated, got ${rerun.totals.updated}`);
      assert(rerun.totals.skipped === 6, `6 skipped, got ${rerun.totals.skipped}`);
      assert(store.articles.length === 7, "still no duplicates");
      const settled = await runDeskImport(PLAN(), repo, { apply: true });
      assert(settled.totals.skipped === 7, "settles back to fully skipped");
    },
  },
  {
    name: "C1 conflicts: duplicate slug, invalid language, malformed content are blocked",
    run: async () => {
      const base = PLAN()[0]!;
      // Duplicate slug within the plan.
      const dup = await runDeskImport([base, { ...base }], makeRepo().repo, { apply: true });
      assert(dup.totals.created === 1 && dup.totals.conflict === 1, "duplicate slug -> 1 created, 1 conflict");
      assert(dup.results[1]!.code === "DUPLICATE_SLUG", "duplicate slug code");

      // Invalid language (bn is an Admin locale but NOT a public Desk locale).
      const bn: DeskImportItem = { ...base, article: { ...base.article, language: "bn" } };
      const bnRun = await runDeskImport([bn], makeRepo().repo, { apply: true });
      assert(bnRun.totals.conflict === 1 && bnRun.results[0]!.code === "INVALID_LANGUAGE", "bn blocked");

      // Malformed content.
      const cases: [string, DeskImportItem][] = [
        ["empty title", { ...base, article: { ...base.article, title: "   " } }],
        ["empty body", { ...base, article: { ...base.article, body: "" } }],
        ["empty excerpt", { ...base, article: { ...base.article, excerpt: "" } }],
        ["bad slug", { ...base, url: "/from-the-desk/Bad Slug", article: { ...base.article, slug: "Bad Slug" } }],
        ["bad date", { ...base, article: { ...base.article, publishedAt: new Date("nonsense") } }],
      ];
      for (const [label, item] of cases) {
        const { repo, store } = makeRepo();
        const run = await runDeskImport([item], repo, { apply: true });
        assert(run.totals.conflict === 1 && run.results[0]!.code === "MALFORMED_CONTENT", `${label} -> MALFORMED_CONTENT`);
        assert(store.writes.length === 0, `${label} wrote nothing`);
      }

      // A slug that would not preserve its URL is malformed.
      const badUrl: DeskImportItem = { ...base, url: "/from-the-desk/other-url" };
      const badUrlRun = await runDeskImport([badUrl], makeRepo().repo, { apply: true });
      assert(badUrlRun.results[0]!.code === "MALFORMED_CONTENT", "URL/slug mismatch blocked");
      assert(validateImportItem(base, new Set()) === null, "a valid item validates");
    },
  },
  {
    name: "C2 conflicts: never overwrite another language's slug or an editorial decision",
    run: async () => {
      const base = PLAN()[0]!;
      const existing = (over: Partial<ExistingArticle>): ExistingArticle => ({
        id: "x1", slug: base.article.slug, title: "Other", excerpt: "e", summary: null, body: "b",
        language: "as", category: "astrology", status: "PUBLISHED", seoTitle: null, seoDescription: null,
        readingTimeMinutes: null, isFeatured: false, displayOrder: 0, publishedAt: new Date(), coverImageAssetId: null,
        ...over,
      });

      // Slug held by a different-language article.
      const { repo: r1, store: s1 } = makeRepo({ articles: [existing({ language: "as" })] });
      const run1 = await runDeskImport([base], r1, { apply: true });
      assert(run1.totals.conflict === 1 && run1.results[0]!.code === "SLUG_OWNED_BY_OTHER", "other-language slug blocked");
      assert(s1.writes.length === 0, "nothing written");

      // An editor archived/unpublished it: never silently republish.
      for (const status of ["ARCHIVED", "UNPUBLISHED", "DRAFT"]) {
        const { repo, store } = makeRepo({ articles: [existing({ language: "en", status })] });
        const run = await runDeskImport([base], repo, { apply: true });
        assert(run.totals.conflict === 1 && run.results[0]!.code === "STATUS_DIVERGED", `${status} blocked`);
        assert(store.writes.length === 0, `${status} wrote nothing`);
      }
    },
  },
  {
    name: "MED1 media: valid https cover registered once, reused on rerun, linked to the article",
    run: async () => {
      const base = withCover(PLAN()[0]!, "https://cdn.example.com/cover.webp", "Cover alt");
      const { repo, store } = makeRepo();

      const first = await runDeskImport([base], repo, { apply: true });
      assert(first.results[0]!.mediaOutcome === "created", "media created");
      assert(store.media.length === 1 && store.media[0]!.url === "https://cdn.example.com/cover.webp", "media registered as a URL reference");
      assert(store.media[0]!.altText === "Cover alt", "alt text preserved");
      const linked = store.articles[0]!.coverImageAssetId;
      assert(linked === store.media[0]!.id, "article linked to the media asset");

      // Rerun: media reused, no duplicate asset, article unchanged.
      const second = await runDeskImport([base], repo, { apply: true });
      assert(second.results[0]!.mediaOutcome === "reused", "media reused on rerun");
      assert(store.media.length === 1, "NO duplicate media asset");
      assert(second.totals.skipped === 1, "article skipped on rerun");
      assert(store.articles[0]!.coverImageAssetId === linked, "link stable");

      // An existing asset with the same URL is reused rather than re-registered.
      const { repo: r2, store: s2 } = makeRepo({ media: [{ id: "pre1", url: "https://cdn.example.com/cover.webp", altText: "Pre" }] });
      const run = await runDeskImport([base], r2, { apply: true });
      assert(run.results[0]!.mediaOutcome === "reused" && s2.media.length === 1, "pre-existing asset reused");
      assert(s2.articles[0]!.coverImageAssetId === "pre1", "linked to the pre-existing asset");
    },
  },
  {
    name: "MED2 media: invalid URLs are never registered or linked; dry run registers nothing",
    run: async () => {
      for (const url of ["http://cdn.example.com/c.png", "javascript:alert(1)", "not a url", "ftp://x/y.png"]) {
        const { repo, store } = makeRepo();
        const run = await runDeskImport([withCover(PLAN()[0]!, url)], repo, { apply: true });
        assert(run.results[0]!.mediaOutcome === "invalid", `${url} -> invalid`);
        assert(store.media.length === 0, `${url} not registered`);
        assert(store.articles[0]!.coverImageAssetId === null, `${url} not linked (article still imported safely)`);
        assert(run.totals.created === 1, `${url} article still created`);
      }
      // Dry run never registers media.
      const { repo, store } = makeRepo();
      const dry = await runDeskImport([withCover(PLAN()[0]!, "https://cdn.example.com/c.webp")], repo, { apply: false });
      assert(dry.results[0]!.mediaOutcome === "created" && dry.results[0]!.mediaId === PENDING_MEDIA_ID, "dry run reports a pending asset");
      assert(store.media.length === 0 && store.writes.length === 0, "dry run wrote no media");
    },
  },
  {
    name: "MED3 media: an existing cover is never cleared by a source without one",
    run: async () => {
      const base = PLAN()[0]!;
      assert(base.coverImage === null, "the legacy corpus carries no cover images");
      const { repo, store } = makeRepo();
      await runDeskImport([base], repo, { apply: true });
      // An editor later attaches a cover in the Admin console.
      store.articles[0]!.coverImageAssetId = "editor-choice";
      const rerun = await runDeskImport([base], repo, { apply: true });
      assert(store.articles[0]!.coverImageAssetId === "editor-choice", "editor's cover preserved, never cleared");
      assert(rerun.totals.skipped === 1, "rerun still a no-op");
      assert(articleMatchesPayload(store.articles[0]!, base.article, "editor-choice"), "match accounts for the retained cover");
    },
  },
  {
    name: "S1 static source untouched + runner safety (dry-run default, --apply explicit)",
    run: () => {
      // The static catalog still holds every Desk entry; the import only reads it.
      const catalog = read("src/modules/content/catalog.ts");
      assert((catalog.match(/path: "\/from-the-desk\//g) ?? []).length === 11, "all 11 static Desk entries still present");

      const runner = read("scripts/debug-desk-import.ts");
      assert(runner.includes('const apply = process.argv.includes("--apply")'), "apply is opt-in");
      assert(runner.includes("MODE: DRY RUN"), "dry run is the default and is announced");
      assert(runner.includes("runDeskImport(plan, createPrismaImportRepo(), { apply })"), "runner delegates to the pure core");
      assert(!/writeFileSync|unlink|rm\b/.test(runner), "runner never modifies source files");

      const core = read("src/modules/content/desk-import-core.ts");
      assert(!core.includes("@prisma/client") && !core.includes("getPrisma"), "core is pure (no database import)");
      assert(!core.includes('import "server-only"'), "core stays testable");

      // This QA file must not import a database client (checked by import site, since the
      // assertions above legitimately mention the symbol names as strings).
      const qa = read("scripts/debug-desk-import-qa.ts");
      assert(!/from "@\/lib\/prisma"/.test(qa) && !/from "@prisma\/client"/.test(qa), "QA imports no database client");
    },
  },
];

async function main() {
  console.log("Claude C8B — legacy Desk import QA:");
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
  console.log(`\ndesk import QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
