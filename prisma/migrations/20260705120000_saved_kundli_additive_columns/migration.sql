-- Card 1: Saved Kundli persistence — strictly additive nullable columns on birth_data.
-- No drops, renames, defaults-with-rewrite, or index changes. Safe for zero-downtime deploy.

-- AlterTable
ALTER TABLE "public"."birth_data" ADD COLUMN "gender" TEXT,
ADD COLUMN "ascendantSign" TEXT,
ADD COLUMN "moonSign" TEXT,
ADD COLUMN "chartSummary" TEXT;
