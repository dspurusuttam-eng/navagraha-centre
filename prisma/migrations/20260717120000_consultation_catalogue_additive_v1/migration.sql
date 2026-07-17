-- Claude C10A — Consultation catalogue (structured tiers / utilities / modes) — ADDITIVE ONLY.
--
-- Ordering: this migration is timestamped AFTER 20260716130000_admin_console_additive_v1, so
-- every previously committed migration (Subscription, Admin console additive, etc.) always
-- applies first. It introduces the normalized Consultation catalogue that replaces the flat
-- global-topics model, without touching any existing table, column, type or migration.
--
-- Safety contract — this migration contains NO:
--   * DROP TABLE / DROP COLUMN / DROP TYPE / DROP INDEX / DROP CONSTRAINT
--   * RENAME of any table, column, type or constraint
--   * ALTER of any pre-existing table, column or type (no ALTER TYPE ... ADD VALUE either)
--   * type change or widening/narrowing of an existing column
--   * NOT NULL added to an existing column, and no NOT NULL column without a DEFAULT
--   * UPDATE / DELETE / INSERT (no data backfill, no data loss)
--   * Subscription content, or any change to a table outside the new catalogue surface
--   * content duplicated from any existing Codex or Admin migration
--
-- Every table created here is brand new. The two foreign keys reference ONLY the new
-- catalogue tables (utility -> tier, mode -> utility), never an existing table, so applying —
-- or reverting — this migration cannot cascade into or lock any pre-existing row.
--   * consultation_utility.tierId       -> consultation_tier(id)     ON DELETE RESTRICT
--   * consultation_utility_mode.utilityId -> consultation_utility(id) ON DELETE CASCADE
--
-- English-only: no locale column exists on any table (Consultation V1 is English-only; C10A
-- language lock). No intake / CRM / booking / payment table is created.
--
-- Rollback / recovery notes: see
-- prisma/migrations/20260717120000_consultation_catalogue_additive_v1/ROLLBACK.md

-- CreateEnum
CREATE TYPE "ConsultationPriceType" AS ENUM ('FIXED', 'FROM');

-- CreateEnum
CREATE TYPE "ConsultationAvailabilityStatus" AS ENUM ('AVAILABLE', 'LIMITED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "ConsultationPublicationState" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "consultation_tier" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "detailedScope" TEXT,
    "bestFor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availabilityStatus" "ConsultationAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publicationState" "ConsultationPublicationState" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_utility" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "detailedScope" TEXT,
    "bestFor" TEXT,
    "includedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "responseDescription" TEXT,
    "priceType" "ConsultationPriceType" NOT NULL DEFAULT 'FIXED',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "launchPrice" INTEGER,
    "regularPrice" INTEGER,
    "priceLabel" TEXT,
    "requiresScopeReview" BOOLEAN NOT NULL DEFAULT false,
    "travelExcluded" BOOLEAN NOT NULL DEFAULT false,
    "isPriority" BOOLEAN NOT NULL DEFAULT false,
    "hasModes" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availabilityStatus" "ConsultationAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publicationState" "ConsultationPublicationState" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_utility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_utility_mode" (
    "id" TEXT NOT NULL,
    "utilityId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "priceType" "ConsultationPriceType" NOT NULL DEFAULT 'FIXED',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "launchPrice" INTEGER,
    "regularPrice" INTEGER,
    "priceLabel" TEXT,
    "travelExcluded" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_utility_mode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consultation_tier_slug_key" ON "consultation_tier"("slug");

-- CreateIndex
CREATE INDEX "consultation_tier_publicationState_isActive_sortOrder_idx" ON "consultation_tier"("publicationState", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_utility_slug_key" ON "consultation_utility"("slug");

-- CreateIndex
CREATE INDEX "consultation_utility_tierId_publicationState_isActive_sortO_idx" ON "consultation_utility"("tierId", "publicationState", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "consultation_utility_mode_utilityId_sortOrder_idx" ON "consultation_utility_mode"("utilityId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_utility_mode_utilityId_slug_key" ON "consultation_utility_mode"("utilityId", "slug");

-- AddForeignKey
ALTER TABLE "consultation_utility" ADD CONSTRAINT "consultation_utility_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "consultation_tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_utility_mode" ADD CONSTRAINT "consultation_utility_mode_utilityId_fkey" FOREIGN KEY ("utilityId") REFERENCES "consultation_utility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
