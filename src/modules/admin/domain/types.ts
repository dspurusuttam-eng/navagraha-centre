// Claude Admin Console C1A — shared Admin domain types (framework-agnostic, pure).
// No DB, no auth, no UI. Used by validation schemas + services (C1B+).
import { z } from "zod";

/** Locales the Admin console can author content in (subset of the site localization set). */
export const ADMIN_ARTICLE_LOCALES = ["en", "as", "hi", "bn"] as const;
export type AdminArticleLocale = (typeof ADMIN_ARTICLE_LOCALES)[number];
export const adminArticleLocaleSchema = z.enum(ADMIN_ARTICLE_LOCALES);

/** Editorial categories for Desk articles (validated set; stored as String on Article.category). */
export const ADMIN_ARTICLE_CATEGORIES = [
  "astrology",
  "panchang",
  "remedies",
  "festivals",
  "spiritual-discipline",
  "lifestyle",
  "announcements",
] as const;
export type AdminArticleCategory = (typeof ADMIN_ARTICLE_CATEGORIES)[number];
export const adminArticleCategorySchema = z.enum(ADMIN_ARTICLE_CATEGORIES);

/**
 * Article lifecycle states used by the Admin console V1.
 * NOTE: the Prisma `ArticleStatus` enum also carries a legacy `REVIEW` value that
 * predates this console; the V1 flow is DRAFT → PUBLISHED → UNPUBLISHED → ARCHIVED
 * and does not use REVIEW.
 */
export const ADMIN_ARTICLE_STATES = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"] as const;
export type AdminArticleState = (typeof ADMIN_ARTICLE_STATES)[number];
export const adminArticleStateSchema = z.enum(ADMIN_ARTICLE_STATES);

/** A soft reference to a MediaAsset (its cuid id); reference storage only, no binary upload. */
export const mediaReferenceIdSchema = z.string().trim().min(1).max(64);
