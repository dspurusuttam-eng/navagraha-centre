// Claude Admin Console C1A — Article validation schemas + helpers (pure Zod).
import { z } from "zod";
import {
  adminArticleCategorySchema,
  adminArticleLocaleSchema,
  mediaReferenceIdSchema,
} from "@/modules/admin/domain/types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(SLUG_PATTERN, "slug must be lowercase kebab-case");
const titleSchema = z.string().trim().min(3).max(200);
const shortTextSchema = z.string().trim().min(1).max(500);
const bodySchema = z.string().trim().min(1).max(50_000);

export const createArticleSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  summary: shortTextSchema.optional(),
  excerpt: shortTextSchema.optional(),
  body: bodySchema.optional(),
  language: adminArticleLocaleSchema.default("en"),
  category: adminArticleCategorySchema.optional(),
  coverImageAssetId: mediaReferenceIdSchema.nullish(),
  seoTitle: z.string().trim().max(200).nullish(),
  seoDescription: z.string().trim().max(400).nullish(),
  readingTimeMinutes: z.number().int().min(1).max(120).nullish(),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(100_000).default(0),
});
export type CreateArticleInput = z.infer<typeof createArticleSchema>;

export const updateArticleSchema = createArticleSchema.partial();
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;

// --- DRAFT autosave (relaxed) ----------------------------------------------
// C4B1A: an in-progress DRAFT may be autosaved while still incomplete. These field
// schemas DROP the min-length floors on title/slug/summary/body (so a half-typed draft
// saves) but PRESERVE every safety guard: max-length caps, value types, the media
// reference bound, numeric ranges, the locale/category enums, and — crucially — the
// slug kebab format whenever a slug IS present (URL/security). An empty string is only
// ever "not yet filled in", never an invalid or unsafe value.
const draftTitleSchema = z.string().trim().max(200);
const draftSlugSchema = z
  .string()
  .trim()
  .max(160)
  .refine((v) => v === "" || SLUG_PATTERN.test(v), "slug must be lowercase kebab-case");
const draftShortTextSchema = z.string().trim().max(500);
const draftBodySchema = z.string().trim().max(50_000);

// NB: every field is optional with NO default. A relaxed autosave is a PATCH — it must
// only ever touch the fields it actually carries, never silently reset an untouched field
// (language/featured/order) to a default. The editor sends a full snapshot, so real saves
// still set every field; this keeps a partial payload safe too.
export const draftAutosaveSchema = z.object({
  title: draftTitleSchema.optional(),
  slug: draftSlugSchema.optional(),
  summary: draftShortTextSchema.optional(),
  excerpt: draftShortTextSchema.optional(),
  body: draftBodySchema.optional(),
  language: adminArticleLocaleSchema.optional(),
  category: adminArticleCategorySchema.optional(),
  coverImageAssetId: mediaReferenceIdSchema.nullish(),
  seoTitle: z.string().trim().max(200).nullish(),
  seoDescription: z.string().trim().max(400).nullish(),
  readingTimeMinutes: z.number().int().min(1).max(120).nullish(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(100_000).optional(),
});
export type DraftAutosaveInput = z.infer<typeof draftAutosaveSchema>;

// --- Publish completeness (strict) -----------------------------------------
// C4B1A: the gate a DRAFT must clear before it can become PUBLISHED. Re-applies the
// STRICT (complete) field requirements — a real title, a valid non-empty slug, and body
// content — so an incomplete relaxed draft can never be published.
export const publishableArticleSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  body: bodySchema,
  language: adminArticleLocaleSchema,
});
export type PublishableArticleInput = z.infer<typeof publishableArticleSchema>;

/** True when a record has the complete fields required to be PUBLISHED (strict gate). */
export function isPublishableArticle(record: {
  title?: string | null;
  slug?: string | null;
  body?: string | null;
  language?: string | null;
}): boolean {
  return publishableArticleSchema.safeParse({
    title: record.title ?? "",
    slug: record.slug ?? "",
    body: record.body ?? "",
    language: record.language ?? "en",
  }).success;
}

/** Zod issues explaining why a record is not yet publishable (empty array when ready). */
export function publishableIssues(record: {
  title?: string | null;
  slug?: string | null;
  body?: string | null;
  language?: string | null;
}) {
  const parsed = publishableArticleSchema.safeParse({
    title: record.title ?? "",
    slug: record.slug ?? "",
    body: record.body ?? "",
    language: record.language ?? "en",
  });
  return parsed.success ? [] : parsed.error.issues;
}

export const articleTransitionSchema = z.object({
  action: z.enum(["PUBLISH", "UNPUBLISH", "REPUBLISH", "ARCHIVE", "RESTORE"]),
});
export type ArticleTransitionInput = z.infer<typeof articleTransitionSchema>;

/** Deterministic reading-time estimate (~200 words/min, min 1) from a body string. */
export function estimateReadingTimeMinutes(body: string | null | undefined): number | null {
  if (!body) return null;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  return Math.max(1, Math.round(words / 200));
}
