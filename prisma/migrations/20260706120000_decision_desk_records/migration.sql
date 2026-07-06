-- Card 3: Decision Desk Records — new model only. Additive (new enum + new table);
-- no changes to existing tables. Non-destructive; deploy-only rollback.

-- CreateEnum
CREATE TYPE "public"."DecisionRecordStatus" AS ENUM ('PLANNED', 'DONE', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."decision_desk_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "decisionCategory" TEXT NOT NULL,
    "status" "public"."DecisionRecordStatus" NOT NULL DEFAULT 'PLANNED',
    "decisionRating" TEXT,
    "date" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "locationLabel" TEXT,
    "panchangSnapshot" JSONB,
    "goodTimeBlocks" JSONB,
    "avoidTimeBlocks" JSONB,
    "horaAvailable" BOOLEAN NOT NULL DEFAULT false,
    "userNote" TEXT,
    "outcomeNote" TEXT,
    "followUpDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decision_desk_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "decision_desk_record_userId_status_idx" ON "public"."decision_desk_record"("userId", "status");

-- CreateIndex
CREATE INDEX "decision_desk_record_userId_createdAt_idx" ON "public"."decision_desk_record"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."decision_desk_record" ADD CONSTRAINT "decision_desk_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
