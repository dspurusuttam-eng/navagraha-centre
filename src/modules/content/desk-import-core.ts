// Claude C8B — legacy Desk import: mapping + idempotent import algorithm (pure).
//
// Shared by the dry-run plan (C8A) and the import runner (C8B) so the plan and the
// execution can never drift apart. All database access is injected (`DeskImportRepo`),
// which keeps this file pure, deterministic and directly testable in memory — no database,
// no migration and no Preview/Production contact required to prove the behaviour.
import {
  PUBLIC_DESK_LOCALES,
  DESK_BASE_PATH,
  deskPathForSlug,
  appendDeskMeta,
  toDeskCategory,
  type DeskMeta,
} from "@/modules/content/desk-article-core";
import type { ContentEntry } from "@/modules/content/types";

/** Admin slug rule (mirrors the Admin domain schema). */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Static ContentCategory -> Admin authoring category. Total: unknown falls back to astrology. */
const REVERSE_CATEGORY: Readonly<Record<string, string>> = {
  "Vedic Astrology": "astrology",
  Panchang: "panchang",
  Remedies: "remedies",
  Festivals: "festivals",
  "Spiritual Guidance": "spiritual-discipline",
  "NAVAGRAHA Intelligence Updates": "announcements",
  "Daily Rashifal": "astrology",
  "Monthly Rashifal": "astrology",
  Graha: "astrology",
  Nakshatra: "astrology",
  Kundli: "astrology",
  Marriage: "astrology",
  Career: "astrology",
  Finance: "astrology",
  Health: "astrology",
  Numerology: "astrology",
  Compatibility: "astrology",
  Gemstones: "remedies",
};
export const DEFAULT_IMPORT_CATEGORY = "astrology";

export function toAdminCategory(category: string): string {
  return REVERSE_CATEGORY[category] ?? DEFAULT_IMPORT_CATEGORY;
}

/** The Article payload an import item would write. */
export type DeskImportArticlePayload = {
  slug: string;
  title: string;
  excerpt: string;
  summary: string | null;
  body: string;
  language: string;
  category: string;
  status: "PUBLISHED";
  seoTitle: string | null;
  seoDescription: string | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  displayOrder: number;
  publishedAt: Date;
  updatedAt: Date;
};

export type DeskImportCover = { url: string; altText: string };

export type DeskImportItem = {
  /** Public URL that MUST be preserved byte-for-byte. */
  url: string;
  sourceId: string;
  article: DeskImportArticlePayload;
  /** Cover image to register as a URL-reference MediaAsset, when the source has one. */
  coverImage: DeskImportCover | null;
  /** Fidelity notes: source data the Admin model cannot carry. */
  notes: string[];
};

/** Static sections -> an Admin body using `##` headings the Desk adapter parses back. */
export function sectionsToBody(entry: ContentEntry): string {
  const blocks: string[] = [];
  for (const section of entry.sections) {
    blocks.push(`## ${section.title}`);
    for (const paragraph of section.paragraphs) blocks.push(paragraph);
  }
  if (!blocks.length && entry.content) blocks.push(entry.content);
  return blocks.join("\n\n");
}

/**
 * C8B1 — the sidecar an entry needs so the round trip is lossless.
 * `displayCategory` is only carried when the category round trip would actually lose the
 * original label, so cleanly-mapping articles keep a sidecar-free body.
 */
export function buildDeskMeta(entry: ContentEntry): DeskMeta {
  const roundTripped = toDeskCategory(toAdminCategory(entry.category));
  return {
    v: 1,
    ...(roundTripped === entry.category ? {} : { displayCategory: entry.category }),
    ...(entry.faqItems?.length ? { faqItems: [...entry.faqItems] } : {}),
    ...(entry.dailyRashifal ? { dailyRashifal: entry.dailyRashifal } : {}),
  };
}

/** The full Admin body: prose sections plus the reversible structured sidecar. */
export function buildImportBody(entry: ContentEntry): string {
  return appendDeskMeta(sectionsToBody(entry), buildDeskMeta(entry));
}

function notesFor(entry: ContentEntry): string[] {
  const notes: string[] = [];
  if (entry.tags.length) notes.push(`tags dropped (no Admin field): ${entry.tags.join(", ")}`);
  if (entry.keywords.length) notes.push(`keywords dropped (${entry.keywords.length})`);
  if (entry.heroHighlights.length) notes.push(`heroHighlights dropped (${entry.heroHighlights.length})`);
  if (entry.heroNote) notes.push("heroNote dropped");
  if (entry.faqItems?.length) notes.push(`faqItems preserved verbatim in the reversible body sidecar (${entry.faqItems.length})`);
  if (entry.dailyRashifal) notes.push("dailyRashifal payload preserved verbatim in the reversible body sidecar");
  if (entry.relatedSlugs?.length) notes.push(`relatedSlugs dropped (${entry.relatedSlugs.length})`);
  if (entry.reviewer) notes.push("reviewer dropped — no Admin field");
  if (entry.authorName) notes.push(`byline "${entry.authorName}" preserved via the Article author relation when resolvable`);
  if (!REVERSE_CATEGORY[entry.category]) notes.push(`category "${entry.category}" has no Admin mapping -> ${DEFAULT_IMPORT_CATEGORY}`);
  if (toDeskCategory(toAdminCategory(entry.category)) !== entry.category) {
    notes.push(`displayed category "${entry.category}" preserved in the reversible body sidecar (Admin stores "${toAdminCategory(entry.category)}")`);
  }
  return notes;
}

/** Build the deterministic import plan (stable slug order; identical on every run). */
export function buildDeskImportPlan(entries: readonly ContentEntry[]): DeskImportItem[] {
  return entries
    .filter((entry) => entry.path.startsWith(`${DESK_BASE_PATH}/`))
    .filter((entry) => entry.status === "published")
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((entry, index) => ({
      url: entry.path,
      sourceId: entry.id,
      article: {
        slug: entry.slug,
        title: entry.title,
        excerpt: entry.excerpt,
        summary: entry.description || null,
        body: buildImportBody(entry),
        language: entry.locale ?? "en",
        category: toAdminCategory(entry.category),
        status: "PUBLISHED" as const,
        seoTitle: entry.seoTitle || null,
        seoDescription: entry.seoDescription || null,
        readingTimeMinutes: entry.readingTimeMinutes ?? null,
        isFeatured: entry.isFeatured,
        // Preserve the existing presentation order deterministically.
        displayOrder: index,
        publishedAt: new Date(entry.publishedAt),
        updatedAt: new Date(entry.updatedAt),
      },
      coverImage: entry.featuredImage
        ? { url: entry.featuredImage.src, altText: entry.featuredImage.alt?.trim() || entry.title }
        : null,
      notes: notesFor(entry),
    }));
}

// --- Validation -------------------------------------------------------------
export type ImportProblemCode =
  | "DUPLICATE_SLUG"
  | "INVALID_LANGUAGE"
  | "MALFORMED_CONTENT"
  | "SLUG_OWNED_BY_OTHER"
  | "STATUS_DIVERGED";

export type ImportProblem = { code: ImportProblemCode; message: string };

function isHttpsUrl(value: string): boolean {
  if (!/^https:\/\//i.test(value.trim())) return false;
  try {
    return new URL(value.trim()).protocol === "https:";
  } catch {
    return false;
  }
}

/** Static, per-item validation (duplicate slug is checked against slugs already seen). */
export function validateImportItem(item: DeskImportItem, seenSlugs: ReadonlySet<string>): ImportProblem | null {
  const { article } = item;
  if (seenSlugs.has(article.slug)) {
    return { code: "DUPLICATE_SLUG", message: `slug "${article.slug}" appears more than once in the plan` };
  }
  if (!(PUBLIC_DESK_LOCALES as readonly string[]).includes(article.language)) {
    return { code: "INVALID_LANGUAGE", message: `language "${article.language}" is not a public Desk locale (en/as/hi)` };
  }
  if (!article.slug || !SLUG_PATTERN.test(article.slug)) {
    return { code: "MALFORMED_CONTENT", message: `slug "${article.slug}" is not lowercase kebab-case` };
  }
  if (deskPathForSlug(article.slug) !== item.url) {
    return { code: "MALFORMED_CONTENT", message: `URL "${item.url}" would not be preserved by slug "${article.slug}"` };
  }
  if (!article.title.trim()) return { code: "MALFORMED_CONTENT", message: "title is empty" };
  if (!article.excerpt.trim()) return { code: "MALFORMED_CONTENT", message: "excerpt is empty" };
  if (!article.body.trim()) return { code: "MALFORMED_CONTENT", message: "body is empty" };
  if (Number.isNaN(article.publishedAt.getTime())) return { code: "MALFORMED_CONTENT", message: "publishedAt is not a valid date" };
  if (Number.isNaN(article.updatedAt.getTime())) return { code: "MALFORMED_CONTENT", message: "updatedAt is not a valid date" };
  return null;
}

// --- Repository boundary (injected) -----------------------------------------
export type ExistingArticle = {
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
  coverImageAssetId: string | null;
};

export type DeskImportRepo = {
  findArticleBySlug(slug: string): Promise<ExistingArticle | null>;
  createArticle(payload: DeskImportArticlePayload & { coverImageAssetId: string | null }): Promise<string>;
  updateArticle(id: string, payload: DeskImportArticlePayload & { coverImageAssetId: string | null }): Promise<void>;
  findMediaByUrl(url: string): Promise<string | null>;
  createMedia(input: { url: string; altText: string }): Promise<string>;
};

// --- Import -----------------------------------------------------------------
export type ItemOutcome = "created" | "updated" | "skipped" | "conflict";
export type MediaOutcome = "none" | "created" | "reused" | "invalid";

export type ItemResult = {
  url: string;
  slug: string;
  outcome: ItemOutcome;
  reason?: string;
  code?: ImportProblemCode;
  articleId?: string;
  mediaOutcome: MediaOutcome;
  mediaId?: string;
};

export type ImportTotals = { created: number; updated: number; skipped: number; conflict: number };
export type ImportReport = { apply: boolean; results: ItemResult[]; totals: ImportTotals };

/** Dry-run stand-in for an asset id that WOULD be created (never written anywhere). */
export const PENDING_MEDIA_ID = "<new-media>";

/** True when the stored article already matches everything this import would write. */
export function articleMatchesPayload(
  existing: ExistingArticle,
  payload: DeskImportArticlePayload,
  coverImageAssetId: string | null,
): boolean {
  return (
    existing.title === payload.title &&
    existing.excerpt === payload.excerpt &&
    (existing.summary ?? null) === payload.summary &&
    (existing.body ?? "") === payload.body &&
    existing.language === payload.language &&
    (existing.category ?? null) === payload.category &&
    existing.status === payload.status &&
    (existing.seoTitle ?? null) === payload.seoTitle &&
    (existing.seoDescription ?? null) === payload.seoDescription &&
    (existing.readingTimeMinutes ?? null) === payload.readingTimeMinutes &&
    existing.isFeatured === payload.isFeatured &&
    existing.displayOrder === payload.displayOrder &&
    (existing.publishedAt?.getTime() ?? null) === payload.publishedAt.getTime() &&
    (existing.coverImageAssetId ?? null) === coverImageAssetId
  );
}

/**
 * Register (or reuse) the cover image as a URL-reference MediaAsset.
 * Only valid https URLs are registered; anything else is reported `invalid` and is NOT
 * linked, so a bad source URL can never corrupt the article's cover reference.
 */
async function resolveCover(
  cover: DeskImportCover | null,
  repo: DeskImportRepo,
  apply: boolean,
): Promise<{ outcome: MediaOutcome; id: string | null }> {
  if (!cover) return { outcome: "none", id: null };
  if (!isHttpsUrl(cover.url)) return { outcome: "invalid", id: null };

  const existingId = await repo.findMediaByUrl(cover.url);
  if (existingId) return { outcome: "reused", id: existingId };

  if (!apply) return { outcome: "created", id: PENDING_MEDIA_ID };
  const id = await repo.createMedia({ url: cover.url, altText: cover.altText });
  return { outcome: "created", id };
}

/**
 * Run the import. Idempotent by slug:
 *   * absent            -> created
 *   * present, matching -> skipped   (a rerun writes nothing and creates no duplicates)
 *   * present, drifted  -> updated   (realigned to the static source)
 *   * unsafe            -> conflict  (never written: duplicate slug in the plan, invalid
 *                                     language, malformed content, the slug is held by a
 *                                     different-language article, or an editor has since
 *                                     moved the article off PUBLISHED)
 * With `apply: false` (the default everywhere) no write method is ever called.
 */
export async function runDeskImport(
  plan: readonly DeskImportItem[],
  repo: DeskImportRepo,
  options: { apply: boolean },
): Promise<ImportReport> {
  const apply = options.apply;
  const results: ItemResult[] = [];
  const seenSlugs = new Set<string>();

  for (const item of plan) {
    const { article } = item;

    const problem = validateImportItem(item, seenSlugs);
    if (problem) {
      results.push({ url: item.url, slug: article.slug, outcome: "conflict", code: problem.code, reason: problem.message, mediaOutcome: "none" });
      continue;
    }
    seenSlugs.add(article.slug);

    const existing = await repo.findArticleBySlug(article.slug);

    // The slug is the public URL: never take it from a different-language article.
    if (existing && existing.language !== article.language) {
      results.push({
        url: item.url, slug: article.slug, outcome: "conflict", code: "SLUG_OWNED_BY_OTHER",
        reason: `slug is held by a "${existing.language}" article; refusing to overwrite`,
        articleId: existing.id, mediaOutcome: "none",
      });
      continue;
    }

    // An editor has deliberately moved it off PUBLISHED — never silently republish.
    if (existing && existing.status !== article.status) {
      results.push({
        url: item.url, slug: article.slug, outcome: "conflict", code: "STATUS_DIVERGED",
        reason: `stored article is ${existing.status}; refusing to overwrite an editorial decision`,
        articleId: existing.id, mediaOutcome: "none",
      });
      continue;
    }

    const media = await resolveCover(item.coverImage, repo, apply);
    // Only ever SET a cover; never clear one the source does not know about.
    const coverImageAssetId = media.id ?? existing?.coverImageAssetId ?? null;

    if (!existing) {
      const articleId = apply ? await repo.createArticle({ ...article, coverImageAssetId }) : undefined;
      results.push({ url: item.url, slug: article.slug, outcome: "created", articleId, mediaOutcome: media.outcome, mediaId: media.id ?? undefined });
      continue;
    }

    if (articleMatchesPayload(existing, article, coverImageAssetId)) {
      results.push({ url: item.url, slug: article.slug, outcome: "skipped", reason: "already up to date", articleId: existing.id, mediaOutcome: media.outcome, mediaId: media.id ?? undefined });
      continue;
    }

    if (apply) await repo.updateArticle(existing.id, { ...article, coverImageAssetId });
    results.push({ url: item.url, slug: article.slug, outcome: "updated", articleId: existing.id, mediaOutcome: media.outcome, mediaId: media.id ?? undefined });
  }

  const totals: ImportTotals = {
    created: results.filter((r) => r.outcome === "created").length,
    updated: results.filter((r) => r.outcome === "updated").length,
    skipped: results.filter((r) => r.outcome === "skipped").length,
    conflict: results.filter((r) => r.outcome === "conflict").length,
  };

  return { apply, results, totals };
}
