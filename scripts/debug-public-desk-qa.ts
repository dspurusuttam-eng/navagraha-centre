/**
 * Claude C8A — Public Desk data cutover QA.
 * Deterministic policy tests (locale, ordering, no-leakage, 404, SEO projection, body
 * parsing, DB-failure degradation) over the pure Desk core, plus static wiring checks on
 * the server-only adapter, the two Desk routes and the untouched Codex sitemap.
 */
import { readFileSync } from "node:fs";
import {
  PUBLIC_DESK_LOCALES,
  PUBLIC_DESK_STATUS,
  isPublicDeskLocale,
  isPubliclyVisibleArticle,
  comparePublicDeskArticles,
  selectPublicDeskArticles,
  toPublicDeskEntries,
  mapArticleToContentEntry,
  parseBodyToSections,
  toDeskCategory,
  deskPathForSlug,
  estimateReadingMinutes,
  safeDeskRead,
  DESK_LEAD_SECTION_TITLE,
  type DeskArticleSource,
} from "@/modules/content/desk-article-core";
import { buildContentMetadata, getContentStructuredData } from "@/modules/content/seo";
import { buildDeskImportPlan, sectionsToBody } from "../scripts/debug-desk-import-plan";
import { curatedContentEntries } from "@/modules/content/catalog";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const NOW = new Date("2026-07-16T12:00:00.000Z");
const PAST = new Date("2026-06-01T00:00:00.000Z");
const FUTURE = new Date("2026-09-01T00:00:00.000Z");

const article = (over: Partial<DeskArticleSource> = {}): DeskArticleSource => ({
  id: "a1",
  slug: "sade-sati-explained",
  title: "Sade Sati explained",
  excerpt: "A calm overview.",
  summary: "A calm overview of Sade Sati.",
  body: "## Why it matters\n\nFirst paragraph.\n\nSecond paragraph.",
  language: "en",
  category: "astrology",
  status: "PUBLISHED",
  seoTitle: null,
  seoDescription: null,
  readingTimeMinutes: 5,
  isFeatured: false,
  displayOrder: 0,
  publishedAt: PAST,
  updatedAt: PAST,
  coverImage: null,
  authorName: null,
  ...over,
});

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "L1 locale: only EN/AS/HI are public; bn and unknown locales are excluded",
    run: () => {
      assert(JSON.stringify(PUBLIC_DESK_LOCALES) === JSON.stringify(["en", "as", "hi"]), "public locales are en/as/hi");
      for (const locale of ["en", "as", "hi"]) assert(isPublicDeskLocale(locale), `${locale} public`);
      // bn is an Admin authoring locale but NOT a public Desk locale.
      for (const locale of ["bn", "sa", "fr", "", null, undefined]) assert(!isPublicDeskLocale(locale as string), `${String(locale)} not public`);
      assert(isPubliclyVisibleArticle(article({ language: "as" }), NOW), "as visible");
      assert(isPubliclyVisibleArticle(article({ language: "hi" }), NOW), "hi visible");
      assert(!isPubliclyVisibleArticle(article({ language: "bn" }), NOW), "bn NOT visible");
      assert(!isPubliclyVisibleArticle(article({ language: "fr" }), NOW), "unknown locale NOT visible");
      // A bn article never reaches the public projection.
      assert(toPublicDeskEntries([article({ language: "bn" })], NOW).length === 0, "bn absent from entries");
    },
  },
  {
    name: "N1 no-leakage: DRAFT / UNPUBLISHED / ARCHIVED / REVIEW never public",
    run: () => {
      assert(PUBLIC_DESK_STATUS === "PUBLISHED", "only PUBLISHED is public");
      for (const status of ["DRAFT", "UNPUBLISHED", "ARCHIVED", "REVIEW", "published", "", "ANYTHING"]) {
        assert(!isPubliclyVisibleArticle(article({ status }), NOW), `${status} NOT visible`);
        assert(toPublicDeskEntries([article({ status })], NOW).length === 0, `${status} absent from entries`);
      }
      assert(isPubliclyVisibleArticle(article({ status: "PUBLISHED" }), NOW), "PUBLISHED visible");
      // A mixed set leaks nothing but the published one.
      const mixed = toPublicDeskEntries(
        [article({ slug: "d", status: "DRAFT" }), article({ slug: "u", status: "UNPUBLISHED" }), article({ slug: "a", status: "ARCHIVED" }), article({ slug: "p", status: "PUBLISHED" })],
        NOW,
      );
      assert(mixed.length === 1 && mixed[0]!.slug === "p", "only the published article is exposed");
    },
  },
  {
    name: "N2 no-leakage: missing or future publication date is never public",
    run: () => {
      assert(!isPubliclyVisibleArticle(article({ publishedAt: null }), NOW), "null publishedAt NOT visible");
      assert(!isPubliclyVisibleArticle(article({ publishedAt: FUTURE }), NOW), "future publishedAt NOT visible");
      assert(isPubliclyVisibleArticle(article({ publishedAt: NOW }), NOW), "publishedAt == now IS visible (boundary)");
      assert(isPubliclyVisibleArticle(article({ publishedAt: new Date(NOW.getTime() - 1) }), NOW), "1ms in the past visible");
      assert(!isPubliclyVisibleArticle(article({ publishedAt: new Date(NOW.getTime() + 1) }), NOW), "1ms in the future NOT visible");
      assert(toPublicDeskEntries([article({ publishedAt: FUTURE })], NOW).length === 0, "scheduled article absent");
    },
  },
  {
    name: "O1 ordering: displayOrder, then newest first, then slug (deterministic)",
    run: () => {
      const a = article({ slug: "a", displayOrder: 1, publishedAt: new Date("2026-01-01") });
      const b = article({ slug: "b", displayOrder: 0, publishedAt: new Date("2026-01-01") });
      const c = article({ slug: "c", displayOrder: 1, publishedAt: new Date("2026-05-01") });
      const d = article({ slug: "d", displayOrder: 1, publishedAt: new Date("2026-01-01") });
      const ordered = selectPublicDeskArticles([a, b, c, d], NOW).map((x) => x.slug);
      assert(JSON.stringify(ordered) === JSON.stringify(["b", "c", "a", "d"]), `order: got ${ordered.join(",")}`);
      assert(comparePublicDeskArticles(b, a) < 0, "lower displayOrder first");
      assert(comparePublicDeskArticles(c, d) < 0, "newer first within an order");
      assert(comparePublicDeskArticles(a, d) < 0, "slug breaks the final tie");
      // Stability: same input, same output.
      const again = selectPublicDeskArticles([a, b, c, d], NOW).map((x) => x.slug);
      assert(JSON.stringify(again) === JSON.stringify(ordered), "deterministic across runs");
    },
  },
  {
    name: "M1 preservation: slug/URL, category, dates, cover media, author, summary/excerpt, order",
    run: () => {
      const entry = mapArticleToContentEntry(
        article({
          slug: "my-article", category: "remedies", isFeatured: true, displayOrder: 3,
          coverImage: { url: "https://cdn.example.com/c.webp", altText: "Cover alt" },
          authorName: "Acharya Purusuttam", summary: "The summary.", excerpt: "The excerpt.",
          publishedAt: PAST, updatedAt: NOW,
        }),
      );
      assert(entry.slug === "my-article" && entry.path === "/from-the-desk/my-article", "slug + URL preserved");
      assert(deskPathForSlug("my-article") === "/from-the-desk/my-article", "URL shape unchanged from the static era");
      assert(entry.category === "Remedies", "category projected");
      assert(entry.publishedAt === PAST.toISOString() && entry.updatedAt === NOW.toISOString(), "dates preserved");
      assert(entry.featuredImage?.src === "https://cdn.example.com/c.webp" && entry.featuredImage?.alt === "Cover alt", "cover media preserved");
      assert(entry.authorName === "Acharya Purusuttam" && entry.author.name === "Acharya Purusuttam", "author preserved");
      assert(entry.excerpt === "The excerpt." && entry.description === "The summary.", "excerpt + summary preserved");
      assert(entry.isFeatured === true, "featured preserved");
      assert(entry.status === "published" && entry.type === "BLOG_ARTICLE", "public shape");
      // Fallbacks
      const bare = mapArticleToContentEntry(article({ authorName: null, summary: null, coverImage: null }));
      assert(bare.author.name === "J P Sarmah", "default byline when no author");
      assert(bare.description === "A calm overview.", "description falls back to excerpt");
      assert(bare.featuredImage === undefined, "no cover -> no featuredImage");
      // Category mapping is total.
      assert(toDeskCategory("panchang") === "Panchang" && toDeskCategory("festivals") === "Festivals", "known categories");
      assert(toDeskCategory("announcements") === "NAVAGRAHA Intelligence Updates", "announcements");
      assert(toDeskCategory(null) === "Vedic Astrology" && toDeskCategory("bogus") === "Vedic Astrology", "unknown -> default");
    },
  },
  {
    name: "B1 body projection: headings -> sections, lead section, reading time",
    run: () => {
      const sections = parseBodyToSections("Lead para.\n\n## First\n\nOne.\n\nTwo.\n\n## Second\n\nThree.");
      assert(sections.length === 3, `3 sections, got ${sections.length}`);
      assert(sections[0]!.title === DESK_LEAD_SECTION_TITLE && sections[0]!.paragraphs[0] === "Lead para.", "lead section");
      assert(sections[1]!.title === "First" && sections[1]!.paragraphs.length === 2, "first heading section");
      assert(sections[2]!.title === "Second" && sections[2]!.paragraphs[0] === "Three.", "second heading section");
      assert(parseBodyToSections("").length === 0 && parseBodyToSections(null).length === 0, "empty body -> no sections");
      // Soft wraps collapse inside a paragraph.
      assert(parseBodyToSections("a\nb")[0]!.paragraphs[0] === "a b", "soft wrap collapsed");
      assert(estimateReadingMinutes("word ".repeat(400)) === 2 && estimateReadingMinutes("") === 1, "reading time");
      // An empty-body article still renders (no sections) rather than breaking.
      assert(mapArticleToContentEntry(article({ body: null })).sections.length === 0, "null body -> empty sections");
    },
  },
  {
    name: "S1 SEO: title/description fallbacks, canonical, Open Graph, Article structured data",
    run: () => {
      const entry = mapArticleToContentEntry(
        article({ seoTitle: "Custom SEO title", seoDescription: "Custom SEO description", coverImage: { url: "https://cdn.example.com/c.webp", altText: "Alt" } }),
      );
      assert(entry.seoTitle === "Custom SEO title" && entry.seoDescription === "Custom SEO description", "explicit SEO fields used");
      const fallback = mapArticleToContentEntry(article({ seoTitle: null, seoDescription: null }));
      assert(fallback.seoTitle === "Sade Sati explained", "seoTitle falls back to title");
      assert(fallback.seoDescription === "A calm overview of Sade Sati.", "seoDescription falls back to summary");

      const metadata = buildContentMetadata(entry, { locale: "en" });
      assert(metadata.title === "Custom SEO title", "metadata title");
      assert(metadata.description === "Custom SEO description", "metadata description");
      assert(Boolean(metadata.alternates?.canonical), "canonical present");
      assert(String(metadata.alternates?.canonical).includes("/from-the-desk/sade-sati-explained"), "canonical points at the Desk URL");
      assert(Boolean(metadata.openGraph), "Open Graph present");
      assert(JSON.stringify(metadata.openGraph).includes("/from-the-desk/sade-sati-explained"), "OG url");

      const schemas = getContentStructuredData(entry, { locale: "en" });
      const types = schemas.map((s) => (s as { "@type"?: string })["@type"]);
      assert(types.includes("Article") || types.includes("BlogPosting"), `Article structured data present (got ${types.join(",")})`);
      assert(types.includes("BreadcrumbList"), "breadcrumb structured data present");
      const articleSchema = JSON.stringify(schemas);
      assert(articleSchema.includes("Sade Sati explained"), "schema carries the title");
    },
  },
  {
    name: "F1 404 + DB failure: unknown slug yields nothing; a failed read degrades to no content",
    run: async () => {
      // 404 path: an unknown slug simply is not in the projection (route calls notFound()).
      const entries = toPublicDeskEntries([article({ slug: "known" })], NOW);
      assert(entries.find((e) => e.slug === "missing") === undefined, "unknown slug not found -> route 404s");
      assert(entries.find((e) => e.slug === "known") !== undefined, "known slug found");

      // Controlled DB failure: the read throws, the public surface degrades to empty/null
      // and the error (including any connection detail) never escapes.
      let leaked: unknown = null;
      const list = await safeDeskRead(async () => { throw new Error("connect ECONNREFUSED password=secret"); }, [] as string[]);
      assert(Array.isArray(list) && list.length === 0, "listing degrades to []");
      const single = await safeDeskRead(async () => { throw new Error("db down"); }, null);
      assert(single === null, "entry degrades to null -> 404");
      const alternates = await safeDeskRead(async () => { throw new Error("db down"); }, {} as Record<string, string>);
      assert(Object.keys(alternates).length === 0, "alternates degrade to {}");
      try {
        await safeDeskRead(async () => { throw new Error("boom"); }, "fallback");
      } catch (error) { leaked = error; }
      assert(leaked === null, "no error propagates to the caller");
      assert((await safeDeskRead(async () => "ok", "fallback")) === "ok", "success passes through unchanged");
    },
  },
  {
    name: "A1 static adapter: server-only, Admin-model backed, gated query, safe reads, no PII",
    run: () => {
      const src = read("src/modules/content/desk-article-adapter.ts");
      assert(src.includes('import "server-only"'), "adapter is server-only");
      assert(src.includes("getPrisma().article.findMany"), "reads the Admin-managed Article model");
      assert(src.includes("status: PUBLIC_DESK_STATUS"), "query gates on PUBLISHED");
      assert(src.includes("language: { in: [...PUBLIC_DESK_LOCALES] }"), "query gates on public locales");
      assert(src.includes("publishedAt: { not: null, lte: now }"), "query gates on a non-future publication date");
      assert(src.includes("toPublicDeskEntries(sources, now)"), "pure gate re-applied over the query result");
      assert((src.match(/safeDeskRead\(/g) ?? []).length === 4, "every public read is failure-safe");
      // No PII / internal fields selected (check executable code, not prose comments).
      const code = src.split(String.fromCharCode(10)).filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*") && !line.trim().startsWith("/*")).join(String.fromCharCode(10));
      assert(!/email/i.test(code) && !/passwordHash/i.test(code) && !/settingsJson/i.test(code), "no user PII or internal fields selected");
      assert(src.includes("author: { select: { name: true } }"), "author byline only");
      assert(src.includes('key: "admin-article"'), "adapter identifies itself");
    },
  },
  {
    name: "A2 static routes: both Desk routes wired, URLs unchanged, other surfaces untouched",
    run: () => {
      const list = read("src/app/(marketing)/from-the-desk/page.tsx");
      const detail = read("src/app/(marketing)/from-the-desk/[slug]/page.tsx");
      for (const [name, src] of [["list", list], ["detail", detail]] as const) {
        assert(src.includes("getDeskContentAdapter"), `${name} route uses the Desk adapter`);
        assert(!src.includes("getContentAdapter()"), `${name} route no longer uses the static catalog adapter`);
      }
      assert(detail.includes("notFound()"), "detail route 404s a missing entry");
      assert(detail.includes("buildContentMetadata") && detail.includes("getContentStructuredData"), "SEO pipeline preserved");
      assert(list.includes('action={localizeHref("/from-the-desk")}'), "list URL unchanged");
      assert(detail.includes("/from-the-desk/${entry.slug}"), "detail URL unchanged");
      // Other public surfaces still read the static catalog (no unintended cutover).
      for (const other of ["src/app/(marketing)/articles/page.tsx"]) {
        assert(read(other).includes("getContentAdapter"), `${other} still uses the static catalog`);
        assert(!read(other).includes("getDeskContentAdapter"), `${other} not cut over`);
      }
    },
  },
  {
    name: "A3 isolation: Codex sitemap untouched and still on the static catalog",
    run: () => {
      const sitemap = read("src/app/sitemap.ts");
      assert(!sitemap.includes("getDeskContentAdapter"), "sitemap does not use the Desk adapter");
      assert(!sitemap.includes("desk-article"), "sitemap untouched by the cutover");
      // The Desk adapter deliberately does not implement listSitemapEntries.
      const adapter = read("src/modules/content/desk-article-adapter.ts");
      assert(!adapter.includes("listSitemapEntries"), "Desk adapter exposes no sitemap surface");
      // Static content is still present (not deleted).
      const catalog = read("src/modules/content/catalog.ts");
      assert(catalog.includes("/from-the-desk/"), "static Desk content still present (not deleted)");
    },
  },
  {
    name: "I1 import plan: deterministic, URL-preserving, dry-run only",
    run: () => {
      const plan = buildDeskImportPlan(curatedContentEntries);
      assert(plan.length > 0, "plan covers the static Desk articles");
      assert(plan.every((item) => item.url.startsWith("/from-the-desk/")), "only Desk entries");
      assert(plan.every((item) => deskPathForSlug(item.article.slug) === item.url), "every existing URL is preserved");
      const slugs = plan.map((item) => item.article.slug);
      assert(new Set(slugs).size === slugs.length, "slugs unique (no import collision)");
      assert(plan.every((item) => item.article.status === "PUBLISHED"), "only published entries planned");
      assert(plan.every((item) => (PUBLIC_DESK_LOCALES as readonly string[]).includes(item.article.language)), "planned locales are public");
      // Deterministic: identical across runs.
      assert(JSON.stringify(buildDeskImportPlan(curatedContentEntries)) === JSON.stringify(plan), "plan is deterministic");
      // Round-trip: planned body re-parses into the sections it came from.
      const sample = curatedContentEntries.find((e) => e.path.startsWith("/from-the-desk/") && e.sections.length > 0)!;
      const parsed = parseBodyToSections(sectionsToBody(sample));
      assert(parsed.length === sample.sections.length, "body round-trips to the same section count");
      assert(parsed[0]!.title === sample.sections[0]!.title, "section titles round-trip");
      // The plan script must not touch a database.
      const planSrc = read("scripts/debug-desk-import-plan.ts");
      assert(!/getPrisma|prisma\.|migrate|INSERT|createMany/i.test(planSrc), "import plan performs no database access or writes");
    },
  },
];

async function main() {
  console.log("Claude C8A — Public Desk data cutover QA:");
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
  console.log(`\npublic desk QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
