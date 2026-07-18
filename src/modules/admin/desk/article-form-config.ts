// Claude Admin Console C4A — Desk article form config + helpers (pure).
import { inspectDeskBody } from "@/modules/desk-sidecar/sidecar";
import type { ArticleRecord } from "@/modules/admin/articles/types";

export const ARTICLE_FORM_FIELDS = [
  "title",
  "slug",
  "summary",
  "body",
  "language",
  "category",
  "coverImageAssetId",
  "isFeatured",
  "displayOrder",
  "seoTitle",
  "seoDescription",
  "readingTimeMinutes",
] as const;
export type ArticleFormField = (typeof ARTICLE_FORM_FIELDS)[number];

export const ARTICLE_LANGUAGE_OPTIONS = ["en", "as", "hi", "bn"] as const;
export const ARTICLE_CATEGORY_OPTIONS = [
  "astrology",
  "panchang",
  "remedies",
  "festivals",
  "spiritual-discipline",
  "lifestyle",
  "announcements",
] as const;

/** Flat string values used to seed the form (edit mode) and track dirty state. */
export type ArticleFormValues = Record<ArticleFormField, string>;

export function emptyArticleFormValues(): ArticleFormValues {
  return {
    title: "", slug: "", summary: "", body: "", language: "en", category: "",
    coverImageAssetId: "", isFeatured: "", displayOrder: "0", seoTitle: "",
    seoDescription: "", readingTimeMinutes: "",
  };
}

export function articleToFormValues(article: ArticleRecord): ArticleFormValues {
  // C8B2: the editor only ever sees the human-readable body. Any structured sidecar is
  // withheld here and reattached on save, so it cannot be shown, edited or deleted.
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary ?? "",
    body: inspectDeskBody(article.body).visibleBody,
    language: article.language,
    category: article.category ?? "",
    coverImageAssetId: article.coverImageAssetId ?? "",
    isFeatured: article.isFeatured ? "on" : "",
    displayOrder: String(article.displayOrder),
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? "",
    readingTimeMinutes: article.readingTimeMinutes == null ? "" : String(article.readingTimeMinutes),
  };
}

/** Kebab-case slug from a title (matches the createArticleSchema slug rule). */
export function deriveSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

/** True when any field differs from the initial values (unsaved-change detection). */
export function hasUnsavedChanges(initial: ArticleFormValues, current: ArticleFormValues): boolean {
  return ARTICLE_FORM_FIELDS.some((field) => (initial[field] ?? "") !== (current[field] ?? ""));
}

const cleaned = (form: FormData, key: string): string | undefined => {
  const value = form.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? undefined : text;
};

/**
 * Build a raw payload for createArticleSchema/updateArticleSchema (server validates).
 *
 * C4B1B — body handling distinguishes an OMITTED field from an EXPLICITLY EMPTY one:
 *  - `preserveEmptyBody: true` (DRAFT autosave/update): a present-but-empty body persists
 *    as `""` (the user intentionally cleared it); an absent `body` key stays `undefined`
 *    (omitted → the service leaves the stored body untouched).
 *  - default (create): an empty body is treated as "not provided" so create — which
 *    requires a non-empty body — is unaffected.
 */
export function formDataToArticleInput(
  form: FormData,
  options: { preserveEmptyBody?: boolean } = {},
): Record<string, unknown> {
  const displayOrder = cleaned(form, "displayOrder");
  const readingTime = cleaned(form, "readingTimeMinutes");
  const bodyRaw = form.get("body");
  const bodyText = typeof bodyRaw === "string" ? bodyRaw.trim() : "";
  const body = options.preserveEmptyBody
    ? form.has("body")
      ? bodyText // present → explicit value, including "" (cleared)
      : undefined // absent → omitted (do not reset)
    : cleaned(form, "body"); // create: empty body → omitted
  return {
    title: cleaned(form, "title") ?? "",
    slug: cleaned(form, "slug") ?? "",
    summary: cleaned(form, "summary"),
    body,
    language: cleaned(form, "language") ?? "en",
    category: cleaned(form, "category"),
    coverImageAssetId: cleaned(form, "coverImageAssetId") ?? null,
    seoTitle: cleaned(form, "seoTitle") ?? null,
    seoDescription: cleaned(form, "seoDescription") ?? null,
    isFeatured: form.get("isFeatured") === "on" || form.get("isFeatured") === "true",
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    readingTimeMinutes: readingTime !== undefined ? Number(readingTime) : undefined,
  };
}
