/**
 * Claude C8B1 — legacy Desk import FIDELITY QA.
 *
 * Proves the full pipeline is lossless by driving the REAL code end to end:
 *     static source entry -> import payload -> stored Article -> public ContentEntry
 * and asserting exact structural equality for the Daily Rashifal payload, FAQ items,
 * the originally displayed category, and the prose sections. No database, no migration.
 */
import { curatedContentEntries } from "@/modules/content/catalog";
import {
  mapArticleToContentEntry,
  extractDeskMeta,
  encodeDeskMeta,
  appendDeskMeta,
  stableStringify,
  toDeskCategory,
  parseBodyToSections,
  isEmptyDeskMeta,
  type DeskArticleSource,
} from "@/modules/content/desk-article-core";
import {
  buildDeskImportPlan,
  buildImportBody,
  buildDeskMeta,
  sectionsToBody,
  toAdminCategory,
  runDeskImport,
  type DeskImportItem,
  type DeskImportRepo,
  type ExistingArticle,
} from "@/modules/content/desk-import-core";
import type { ContentEntry } from "@/modules/content/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const eq = (a: unknown, b: unknown) => stableStringify(a) === stableStringify(b);

const PLAN = () => buildDeskImportPlan(curatedContentEntries);
const sourceBySlug = (slug: string) => curatedContentEntries.find((e) => e.slug === slug)!;

/** Project an import payload onto the stored-article shape the public adapter reads. */
function storedFromItem(item: DeskImportItem): DeskArticleSource {
  const a = item.article;
  return {
    id: item.sourceId,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    summary: a.summary,
    body: a.body,
    language: a.language,
    category: a.category,
    status: a.status,
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
    readingTimeMinutes: a.readingTimeMinutes,
    isFeatured: a.isFeatured,
    displayOrder: a.displayOrder,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    coverImage: null,
    authorName: null,
  };
}

/** The full round trip: source entry -> import -> adapter -> public entry. */
function roundTrip(slug: string): { source: ContentEntry; item: DeskImportItem; result: ContentEntry } {
  const source = sourceBySlug(slug);
  const item = PLAN().find((i) => i.article.slug === slug)!;
  return { source, item, result: mapArticleToContentEntry(storedFromItem(item)) };
}

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "R1 Daily Rashifal payload survives source -> import -> adapter EXACTLY",
    run: () => {
      const { source, result } = roundTrip("daily-rashifal-26-april-2026");
      assert(source.dailyRashifal, "fixture actually has a dailyRashifal payload");
      assert(result.dailyRashifal, "payload recovered by the public adapter");
      // Exact structural equality of the whole payload.
      assert(eq(result.dailyRashifal, source.dailyRashifal), "dailyRashifal is byte-for-byte equal after the round trip");
      assert(result.dailyRashifal!.zodiacSections.length === 12, "all 12 zodiac sections preserved");
      assert(result.dailyRashifal!.date === source.dailyRashifal!.date, "date preserved");
      assert(eq(result.dailyRashifal!.remedies, source.dailyRashifal!.remedies), "remedies preserved");
      assert(result.dailyRashifal!.brandFooter === source.dailyRashifal!.brandFooter, "brandFooter preserved");
      // Every field of every zodiac section survives (not flattened to prose).
      for (const [index, section] of source.dailyRashifal!.zodiacSections.entries()) {
        assert(eq(result.dailyRashifal!.zodiacSections[index], section), `zodiac section ${section.sign} exact`);
      }
      // And it is NOT rendered as prose.
      const proseText = result.sections.flatMap((s) => [s.title, ...s.paragraphs]).join(" ");
      assert(!proseText.includes(source.dailyRashifal!.brandFooter), "structured payload is not flattened into prose");
      assert(!proseText.includes("zodiacSections") && !proseText.includes("navagraha:desk-meta"), "no sidecar leaks into prose");
    },
  },
  {
    name: "R2 FAQ items survive source -> import -> adapter EXACTLY",
    run: () => {
      const { source, result } = roundTrip("guidance-and-remedies-frequently-asked-questions");
      assert(source.faqItems?.length === 4, "fixture actually has 4 FAQ items");
      assert(result.faqItems?.length === 4, "4 FAQ items recovered");
      assert(eq(result.faqItems, source.faqItems), "faqItems are exactly equal after the round trip");
      for (const [index, item] of source.faqItems!.entries()) {
        assert(result.faqItems![index]!.question === item.question, `question ${index} preserved`);
        assert(result.faqItems![index]!.answer === item.answer, `answer ${index} preserved`);
      }
      const proseText = result.sections.flatMap((s) => [s.title, ...s.paragraphs]).join(" ");
      assert(!proseText.includes(source.faqItems![0]!.answer), "FAQ answers are not flattened into prose");
    },
  },
  {
    name: "R3 originally displayed category survives EXACTLY (incl. the lossy ones)",
    run: () => {
      // The two Daily Rashifal entries previously flattened to "Vedic Astrology".
      for (const slug of ["daily-horoscope-april-6-2026", "daily-rashifal-26-april-2026"]) {
        const { source, item, result } = roundTrip(slug);
        assert(source.category === "Daily Rashifal", `${slug} source category`);
        // Admin still stores a VALID Admin enum value (the console keeps working)...
        assert(item.article.category === "astrology", `${slug} stored as a valid Admin category`);
        // ...while the public Desk still displays the original label.
        assert(result.category === "Daily Rashifal", `${slug} displays "Daily Rashifal", not the flattened label`);
        assert(result.category === source.category, `${slug} category exactly equal`);
      }
      // Cleanly-mapping categories are unchanged and need no sidecar.
      for (const slug of ["understanding-premium-consultation-journeys", "how-to-approach-remedies-with-discernment"]) {
        const { source, result } = roundTrip(slug);
        assert(result.category === source.category, `${slug} category preserved`);
        assert(toDeskCategory(toAdminCategory(source.category)) === source.category, `${slug} maps cleanly without a sidecar`);
      }
    },
  },
  {
    name: "R4 EVERY published Desk article round-trips losslessly on all four axes",
    run: () => {
      const plan = PLAN();
      assert(plan.length === 7, "7 published Desk articles");
      for (const item of plan) {
        const source = sourceBySlug(item.article.slug);
        const result = mapArticleToContentEntry(storedFromItem(item));
        assert(result.category === source.category, `${source.slug}: category exact`);
        assert(eq(result.faqItems ?? undefined, source.faqItems ?? undefined), `${source.slug}: faqItems exact`);
        assert(eq(result.dailyRashifal ?? undefined, source.dailyRashifal ?? undefined), `${source.slug}: dailyRashifal exact`);
        assert(eq(result.sections, source.sections), `${source.slug}: sections exact`);
        // Slug/URL and public rendering inputs preserved.
        assert(result.slug === source.slug && result.path === source.path, `${source.slug}: slug + URL preserved`);
        assert(result.title === source.title && result.excerpt === source.excerpt, `${source.slug}: title/excerpt preserved`);
        assert(result.publishedAt === source.publishedAt, `${source.slug}: publication date preserved`);
        assert(result.seoTitle === source.seoTitle && result.seoDescription === source.seoDescription, `${source.slug}: SEO preserved`);
      }
    },
  },
  {
    name: "S1 sidecar encoding: deterministic, reversible, only present when needed",
    run: () => {
      // Only the three affected articles carry a sidecar; the rest stay clean.
      const withSidecar = PLAN().filter((i) => i.article.body.includes("navagraha:desk-meta"));
      assert(withSidecar.length === 3, `exactly 3 articles need a sidecar, got ${withSidecar.length}`);
      const clean = PLAN().filter((i) => !i.article.body.includes("navagraha:desk-meta"));
      assert(clean.length === 4, "the other 4 keep a sidecar-free body");
      for (const item of clean) {
        assert(item.article.body === sectionsToBody(sourceBySlug(item.article.slug)), "clean bodies are pure prose");
      }
      // Deterministic: identical input -> byte-identical output, across runs.
      const source = sourceBySlug("daily-rashifal-26-april-2026");
      assert(buildImportBody(source) === buildImportBody(source), "buildImportBody is deterministic");
      assert(encodeDeskMeta(buildDeskMeta(source)) === encodeDeskMeta(buildDeskMeta(source)), "encoding is deterministic");
      assert(stableStringify({ b: 1, a: 2 }) === stableStringify({ a: 2, b: 1 }), "stringify is key-order independent");
      // Reversible: extract returns the prose and the meta unchanged.
      const { body, meta } = extractDeskMeta(buildImportBody(source));
      assert(body === sectionsToBody(source), "prose recovered exactly");
      assert(eq(meta?.dailyRashifal, source.dailyRashifal), "meta recovered exactly");
      assert(isEmptyDeskMeta({ v: 1 }), "an empty sidecar is recognised");
      assert(encodeDeskMeta({ v: 1 }) === "", "an empty sidecar encodes to nothing");
      assert(appendDeskMeta("prose", { v: 1 }) === "prose", "append is a no-op with nothing to carry");
    },
  },
  {
    name: "S2 sidecar robustness: never renders as prose; corruption degrades safely",
    run: () => {
      const source = sourceBySlug("daily-rashifal-26-april-2026");
      const body = buildImportBody(source);
      // The sidecar is never parsed into a rendered section.
      const sections = parseBodyToSections(extractDeskMeta(body).body);
      assert(eq(sections, source.sections), "sections exclude the sidecar entirely");
      assert(!JSON.stringify(sections).includes("desk-meta"), "no marker inside sections");

      // A corrupted sidecar is still stripped (raw JSON must never reach the page) and the
      // article degrades to prose-only rather than breaking.
      const corrupted = `${sectionsToBody(source)}\n\n<!--navagraha:desk-meta:v1\n{ this is not json\n-->`;
      const extracted = extractDeskMeta(corrupted);
      assert(extracted.meta === null, "corrupt sidecar yields no meta");
      assert(extracted.body === sectionsToBody(source), "corrupt sidecar is still stripped from the prose");
      const degraded = mapArticleToContentEntry({ ...storedFromItem(PLAN()[0]!), body: corrupted });
      assert(degraded.dailyRashifal === undefined && degraded.faqItems === undefined, "extras absent, no crash");
      assert(!JSON.stringify(degraded.sections).includes("not json"), "corrupt JSON never renders as prose");

      // An unknown sidecar version is ignored rather than trusted.
      const future = `prose\n\n<!--navagraha:desk-meta:v1\n{"v":99,"faqItems":[{"question":"q","answer":"a"}]}\n-->`;
      assert(extractDeskMeta(future).meta === null, "unknown version ignored");
      // A body with no sidecar is untouched.
      assert(extractDeskMeta("just prose").body === "just prose" && extractDeskMeta("just prose").meta === null, "plain body untouched");
      assert(extractDeskMeta(null).body === "" && extractDeskMeta(null).meta === null, "null body safe");
    },
  },
  {
    name: "S3 sidecar stays within the Admin body limit and needs no schema change",
    run: () => {
      // The whole point: no new database field. Every body must fit the existing column rule.
      for (const item of PLAN()) {
        assert(item.article.body.length <= 50_000, `${item.article.slug}: body within the 50k Admin limit (${item.article.body.length})`);
      }
      const biggest = PLAN().reduce((max, i) => Math.max(max, i.article.body.length), 0);
      assert(biggest < 50_000, `largest body ${biggest} chars — comfortably inside the limit`);
      // The Admin category column keeps a valid Admin enum value for every article.
      const adminCategories = ["astrology", "panchang", "remedies", "festivals", "spiritual-discipline", "lifestyle", "announcements"];
      for (const item of PLAN()) {
        assert(adminCategories.includes(item.article.category), `${item.article.slug}: stored category is a valid Admin enum value`);
      }
    },
  },
  {
    name: "I1 idempotency and editor guards still hold with the sidecar in place",
    run: async () => {
      type Store = { articles: ExistingArticle[]; writes: string[] };
      const store: Store = { articles: [], writes: [] };
      let seq = 0;
      const repo: DeskImportRepo = {
        async findArticleBySlug(slug) { return store.articles.find((a) => a.slug === slug) ?? null; },
        async createArticle(p) {
          seq += 1; store.writes.push(`create:${p.slug}`);
          store.articles.push({ id: `a${seq}`, ...p, body: p.body, coverImageAssetId: p.coverImageAssetId });
          return `a${seq}`;
        },
        async updateArticle(id, p) {
          const row = store.articles.find((a) => a.id === id)!;
          store.writes.push(`update:${p.slug}`); Object.assign(row, p);
        },
        async findMediaByUrl() { return null; },
        async createMedia() { seq += 1; return `m${seq}`; },
      };

      const first = await runDeskImport(PLAN(), repo, { apply: true });
      assert(first.totals.created === 7, "7 created");
      const writes = store.writes.length;
      const second = await runDeskImport(PLAN(), repo, { apply: true });
      assert(second.totals.skipped === 7, "rerun skips 7 — sidecar bodies compare equal");
      assert(store.writes.length === writes && store.articles.length === 7, "rerun wrote nothing, no duplicates");

      // The stored article still round-trips losslessly through the public adapter.
      const stored = store.articles.find((a) => a.slug === "daily-rashifal-26-april-2026")!;
      const publicEntry = mapArticleToContentEntry({ ...storedFromItem(PLAN()[0]!), ...stored, coverImage: null, authorName: null, updatedAt: new Date() });
      assert(eq(publicEntry.dailyRashifal, sourceBySlug("daily-rashifal-26-april-2026").dailyRashifal), "stored row still round-trips exactly");

      // Editor protection unchanged.
      store.articles[0]!.status = "ARCHIVED";
      const guarded = await runDeskImport(PLAN(), repo, { apply: true });
      assert(guarded.totals.conflict === 1 && guarded.results.some((r) => r.code === "STATUS_DIVERGED"), "editorial decision still protected");
    },
  },
];

async function main() {
  console.log("Claude C8B1 — legacy Desk import fidelity QA:");
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
  console.log(`\ndesk fidelity QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
