CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');

CREATE TABLE "public"."subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextBillingDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sourceOrderId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscription_sourceOrderId_key" ON "public"."subscription"("sourceOrderId" ASC);

CREATE INDEX "subscription_userId_status_idx" ON "public"."subscription"("userId" ASC, "status" ASC);

CREATE INDEX "subscription_planId_status_idx" ON "public"."subscription"("planId" ASC, "status" ASC);

ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_sourceOrderId_fkey" FOREIGN KEY ("sourceOrderId") REFERENCES "public"."order"("id") ON DELETE SET NULL ON UPDATE CASCADE;