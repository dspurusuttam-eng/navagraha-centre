// Claude C8A — Public Desk article policy + mapping (pure; no DB, no server-only).
// Projects Admin-managed Articles onto the existing public ContentEntry shape so the
// /from-the-desk routes keep rendering through the proven content/SEO pipeline unchanged.
//
// Exposure contract (deliberately strict — this is the public/private boundary):
//   * status must be exactly PUBLISHED (DRAFT / UNPUBLISHED / ARCHIVED never leak)
//   * language must be one of the public Desk locales (EN / AS / HI)
//   * publishedAt must exist and must not be in the future
// Anything failing any check is absent from listings and 404s on detail.
import { extractDeskMeta } from "@/modules/desk-sidecar/sidecar";
import type {
  ContentCategory,
  ContentEntry,
  ContentSection,
} from "@/modules/content/types";
import type { SupportedLocale } from "@/modules/localization/config";

/** Locales the public Desk serves (subset of the Admin authoring locales, which add `bn`). */
export const PUBLIC_DESK_LOCALES = ["en", "as", "hi"] as const;
export type PublicDeskLocale = (typeof PUBLIC_DESK_LOCALES)[number];

/** The only Article status that may ever reach the public Desk. */
export const PUBLIC_DESK_STATUS = "PUBLISHED";

export const DESK_BASE_PATH = "/from-the-desk";

/** Author byline used when an Article has no resolvable author (matches existing copy). */
export const DEFAULT_DESK_AUTHOR = {
  name: "J P Sarmah",
  title: "Vedic Astrologer and Spiritual Guide",
  bio: "",
} as const;

/** The Admin-managed Article projection this module consumes (no user PII beyond a byline). */
export type DeskArticleSource = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  summary: string | null;
  body: string | null;
  language: string;
  category: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  displayOrder: number;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImage: { url: string; altText: string | null } | null;
  authorName: string | null;
};

export function isPublicDeskLocale(value: string | null | undefined): value is PublicDeskLocale {
  return typeof value === "string" && (PUBLIC_DESK_LOCALES as readonly string[]).includes(value);
}

/**
 * The single source of truth for public visibility. Returns false for anything that is not
 * a PUBLISHED, public-locale article with a non-future publication date.
 */
export function isPubliclyVisibleArticle(article: DeskArticleSource, now: Date): boolean {
  if (article.status !== PUBLIC_DESK_STATUS) return false;
  if (!isPublicDeskLocale(article.language)) return false;
  if (!article.publishedAt) return false;
  return article.publishedAt.getTime() <= now.getTime();
}

/** Deterministic public ordering: display order, then newest first, then slug as a tiebreak. */
export function comparePublicDeskArticles(a: DeskArticleSource, b: DeskArticleSource): number {
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
  const aTime = a.publishedAt?.getTime() ?? 0;
  const bTime = b.publishedAt?.getTime() ?? 0;
  if (aTime !== bTime) return bTime - aTime;
  return a.slug.localeCompare(b.slug);
}

/** Filter to publicly visible articles and apply the deterministic public order. */
export function selectPublicDeskArticles(
  articles: readonly DeskArticleSource[],
  now: Date,
): DeskArticleSource[] {
  return articles
    .filter((article) => isPubliclyVisibleArticle(article, now))
    .sort(comparePublicDeskArticles);
}

// --- Category projection ----------------------------------------------------
// Admin authoring categories -> the public ContentCategory union. Deterministic, total.
const DESK_CATEGORY_MAP: Readonly<Record<string, ContentCategory>> = {
  astrology: "Vedic Astrology",
  panchang: "Panchang",
  remedies: "Remedies",
  festivals: "Festivals",
  "spiritual-discipline": "Spiritual Guidance",
  lifestyle: "Spiritual Guidance",
  announcements: "NAVAGRAHA Intelligence Updates",
};
export const DEFAULT_DESK_CATEGORY: ContentCategory = "Vedic Astrology";

export function toDeskCategory(category: string | null | undefined): ContentCategory {
  if (!category) return DEFAULT_DESK_CATEGORY;
  return DESK_CATEGORY_MAP[category] ?? DEFAULT_DESK_CATEGORY;
}

// --- Body projection --------------------------------------------------------
/** Public Desk URL for a slug — unchanged from the static era, so every URL is preserved. */
export function deskPathForSlug(slug: string): string {
  return `${DESK_BASE_PATH}/${slug}`;
}

/** Title given to body content that appears before the first heading. */
export const DESK_LEAD_SECTION_TITLE = "Overview";

// --- Reversible structured sidecar (C8B1/C8B2) -----------------------------
// The codec is shared with the Admin editor via the neutral `desk-sidecar` module, so the
// exact same representation is written, hidden, reattached and recovered on both sides.
// Re-exported here so existing public-Desk callers keep one import site.
export {
  stableStringify,
  isEmptyDeskMeta,
  encodeDeskMeta,
  extractDeskMeta,
  appendDeskMeta,
  inspectDeskBody,
  joinBodyAndSidecar,
  type DeskMeta,
  type DeskBodyParts,
  type DeskSidecarState,
} from "@/modules/desk-sidecar/sidecar";

/**
 * Split a prose body into the rendered section shape.
 * Blank lines separate blocks; a markdown-style `#`..`######` block starts a new section;
 * everything before the first heading becomes the lead section. Deterministic and total.
 * Callers pass the sidecar-free body, so structured metadata can never render as prose.
 */
export function parseBodyToSections(body: string | null | undefined): ContentSection[] {
  const text = (body ?? "").trim();
  if (!text) return [];

  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  const sections: { title: string; paragraphs: string[] }[] = [];
  let current: { title: string; paragraphs: string[] } | null = null;

  for (const block of blocks) {
    const heading = /^#{1,6}\s+(.+)$/.exec(block);
    if (heading) {
      current = { title: heading[1]!.trim(), paragraphs: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { title: DESK_LEAD_SECTION_TITLE, paragraphs: [] };
      sections.push(current);
    }
    // Collapse soft wraps inside a paragraph block.
    current.paragraphs.push(block.replace(/\s*\n\s*/g, " "));
  }

  return sections.map((section) => ({ title: section.title, paragraphs: section.paragraphs }));
}

/** ~200 words/minute, min 1 — mirrors the Admin estimate. */
export function estimateReadingMinutes(body: string | null | undefined): number {
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.round(words / 200));
}

// --- ContentEntry projection ------------------------------------------------
/**
 * Project a publicly visible Admin Article onto the public ContentEntry shape.
 * Preserves slug, category, dates, cover media, author, summary/excerpt and display order.
 * Callers MUST have filtered with `isPubliclyVisibleArticle` first — this function assumes
 * visibility and always reports `status: "published"`.
 */
export function mapArticleToContentEntry(article: DeskArticleSource): ContentEntry {
  const publishedAt = (article.publishedAt ?? article.updatedAt).toISOString();
  const description = article.summary?.trim() || article.excerpt;
  const authorName = article.authorName?.trim() || DEFAULT_DESK_AUTHOR.name;
  // C8B1: recover the structured sidecar; prose and extras are handled separately so
  // nothing structured is ever rendered as prose and nothing prose is lost to the sidecar.
  const { body: proseBody, meta } = extractDeskMeta(article.body);
  const readingTimeMinutes = article.readingTimeMinutes ?? estimateReadingMinutes(proseBody);

  return {
    id: article.id,
    slug: article.slug,
    localizedSlug: article.slug,
    path: deskPathForSlug(article.slug),
    locale: article.language as SupportedLocale,
    // The Admin model has no translation grouping; each article stands alone.
    translationGroup: article.slug,
    // The original displayed category when the sidecar carries one (the Admin enum is a
    // coarser set); otherwise the Admin category projected onto the public union.
    category: (meta?.displayCategory as ContentCategory | undefined) ?? toDeskCategory(article.category),
    tags: [],
    type: "BLOG_ARTICLE",
    status: "published",
    title: article.title,
    excerpt: article.excerpt,
    content: proseBody,
    description,
    seoTitle: article.seoTitle?.trim() || article.title,
    seoDescription: article.seoDescription?.trim() || description,
    featuredImage: article.coverImage
      ? { src: article.coverImage.url, alt: article.coverImage.altText?.trim() || article.title }
      : undefined,
    isFeatured: article.isFeatured,
    keywords: [],
    publishedAt,
    updatedAt: article.updatedAt.toISOString(),
    readingTime: `${readingTimeMinutes} min read`,
    readingTimeMinutes,
    authorName,
    authorTitle: DEFAULT_DESK_AUTHOR.title,
    heroEyebrow: "From the Desk",
    heroHighlights: [],
    heroNote: "",
    author: { name: authorName, title: DEFAULT_DESK_AUTHOR.title, bio: DEFAULT_DESK_AUTHOR.bio },
    sections: parseBodyToSections(proseBody),
    // Structured extras recovered verbatim from the sidecar (absent when there are none).
    ...(meta?.faqItems?.length ? { faqItems: meta.faqItems } : {}),
    ...(meta?.dailyRashifal ? { dailyRashifal: meta.dailyRashifal } : {}),
    aiDraftReady: false,
    autoPublish: false,
  };
}

/** Filter + order + project, in one deterministic step. */
export function toPublicDeskEntries(
  articles: readonly DeskArticleSource[],
  now: Date,
): ContentEntry[] {
  return selectPublicDeskArticles(articles, now).map(mapArticleToContentEntry);
}

/**
 * Run a public Desk read, degrading to `fallback` on ANY failure.
 *
 * The public site must never 500 or expose a database error because the datastore is
 * unavailable: it renders as "no content" instead (empty listing, or a null entry which the
 * route turns into a 404). The error is deliberately swallowed here rather than rethrown or
 * returned, so no connection string, query or stack can reach a public response. Kept pure
 * (no `server-only`) so the failure path is directly testable.
 */
export async function safeDeskRead<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch {
    return fallback;
  }
}
