-- Claude Admin Console (C1A schema, regenerated in C7B post-Subscription rebase) — ADDITIVE ONLY.
--
-- Ordering: this migration is timestamped AFTER 20260716120000_phase12b_subscription_backfill,
-- so the Codex Subscription migration always applies first. This migration was generated
-- from a database that already had every committed main migration (Subscription included)
-- applied, which is why it contains no Subscription content whatsoever.
--
-- Scope: Article additive columns + indexes, the ArticleStatus UNPUBLISHED value, and the
-- three standalone Admin tables (media_asset, consultation_settings, brand_settings).
--
-- Safety contract — this migration contains NO:
--   * DROP TABLE / DROP COLUMN / DROP TYPE / DROP INDEX / DROP CONSTRAINT
--   * RENAME of any table, column, type or constraint
--   * type change or widening/narrowing of an existing column
--   * NOT NULL added to an existing column, and no NOT NULL column without a DEFAULT
--   * UPDATE / DELETE / INSERT (no data backfill, no data loss)
--   * SubscriptionStatus, subscription table, subscription index or subscription foreign key
--   * content duplicated from any existing Codex migration
--   * change to any table outside the Admin surface
-- Every new Article column is nullable or carries a DEFAULT, so the migration is safe on a
-- populated article table. The new tables are standalone: they hold only soft (id)
-- references to user/article/media and declare no foreign keys, so applying — or reverting —
-- this migration cannot cascade into existing rows.
--
-- NOTE (PostgreSQL): "ALTER TYPE ... ADD VALUE" is only transaction-safe on PostgreSQL 12+.
-- The new value is added here but never USED in this migration, which is the condition
-- PostgreSQL requires. Target servers are PostgreSQL 12+ (verified against 17.10).
--
-- Rollback / recovery notes: see prisma/migrations/20260716130000_admin_console_additive_v1/ROLLBACK.md

-- CreateEnum
CREATE TYPE "MediaAssetKind" AS ENUM ('IMAGE');

-- AlterEnum
ALTER TYPE "ArticleStatus" ADD VALUE 'UNPUBLISHED';

-- AlterTable
ALTER TABLE "article" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "coverImageAssetId" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "readingTimeMinutes" INTEGER,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "unpublishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "media_asset" (
    "id" TEXT NOT NULL,
    "kind" "MediaAssetKind" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT,
    "byteSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_settings" (
    "id" TEXT NOT NULL,
    "singletonKey" TEXT NOT NULL DEFAULT 'default',
    "settingsJson" JSONB,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_settings" (
    "id" TEXT NOT NULL,
    "singletonKey" TEXT NOT NULL DEFAULT 'default',
    "settingsJson" JSONB,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_asset_kind_createdAt_idx" ON "media_asset"("kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_settings_singletonKey_key" ON "consultation_settings"("singletonKey");

-- CreateIndex
CREATE UNIQUE INDEX "brand_settings_singletonKey_key" ON "brand_settings"("singletonKey");

-- CreateIndex
CREATE INDEX "article_status_isFeatured_displayOrder_idx" ON "article"("status", "isFeatured", "displayOrder");

-- CreateIndex
CREATE INDEX "article_language_status_idx" ON "article"("language", "status");
