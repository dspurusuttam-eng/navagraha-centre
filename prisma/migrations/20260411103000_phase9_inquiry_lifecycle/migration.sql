-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM (
  'GENERAL_INQUIRY',
  'CONSULTATION_READY',
  'COMPATIBILITY_FOCUSED',
  'REMEDY_FOCUSED',
  'RETURNING_FOLLOW_UP'
);

-- CreateEnum
CREATE TYPE "InquiryUrgencyLevel" AS ENUM (
  'LOW',
  'STANDARD',
  'ELEVATED'
);

-- CreateEnum
CREATE TYPE "InquiryLifecycleStage" AS ENUM (
  'NEW_INQUIRY',
  'CONSULTATION_INTEREST',
  'AWAITING_RESPONSE',
  'BOOKED',
  'POST_SESSION',
  'FOLLOW_UP_ELIGIBLE'
);

-- CreateTable
CREATE TABLE "inquiry_lead" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "timezone" TEXT,
  "inquiryType" "InquiryType" NOT NULL,
  "urgencyLevel" "InquiryUrgencyLevel" NOT NULL DEFAULT 'STANDARD',
  "desiredServiceSlug" TEXT,
  "message" TEXT NOT NULL,
  "sourcePath" TEXT,
  "lifecycleStage" "InquiryLifecycleStage" NOT NULL,
  "lastLifecycleAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "inquiry_lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_lifecycle_event" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "fromStage" "InquiryLifecycleStage",
  "toStage" "InquiryLifecycleStage" NOT NULL,
  "note" TEXT,
  "actorUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "inquiry_lifecycle_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inquiry_lead_email_createdAt_idx" ON "inquiry_lead"("email", "createdAt");

-- CreateIndex
CREATE INDEX "inquiry_lead_userId_createdAt_idx" ON "inquiry_lead"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "inquiry_lead_lifecycleStage_updatedAt_idx" ON "inquiry_lead"("lifecycleStage", "updatedAt");

-- CreateIndex
CREATE INDEX "inquiry_lifecycle_event_leadId_createdAt_idx" ON "inquiry_lifecycle_event"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "inquiry_lifecycle_event_toStage_createdAt_idx" ON "inquiry_lifecycle_event"("toStage", "createdAt");

-- CreateIndex
CREATE INDEX "inquiry_lifecycle_event_actorUserId_createdAt_idx" ON "inquiry_lifecycle_event"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "inquiry_lead" ADD CONSTRAINT "inquiry_lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_lifecycle_event" ADD CONSTRAINT "inquiry_lifecycle_event_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "inquiry_lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_lifecycle_event" ADD CONSTRAINT "inquiry_lifecycle_event_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
