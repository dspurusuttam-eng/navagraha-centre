-- CreateTable
CREATE TABLE "analytics_event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "route" TEXT,
    "locale" TEXT,
    "source" TEXT,
    "section" TEXT,
    "status" TEXT,
    "cid" TEXT,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_event_day_name_idx" ON "analytics_event"("day", "name");

-- CreateIndex
CREATE INDEX "analytics_event_name_createdAt_idx" ON "analytics_event"("name", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_event_createdAt_idx" ON "analytics_event"("createdAt");
