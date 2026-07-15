// Claude Admin Console C1A — Article validation schemas + helpers (pure Zod).
import { z } from "zod";
import {
  adminArticleCategorySchema,
  adminArticleLocaleSchema,
  mediaReferenceIdSchema,
} from "@/modules/admin/domain/types";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");
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
