-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AiConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."AiMessageRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT', 'TOOL');

-- CreateEnum
CREATE TYPE "public"."AiPromptArea" AS ENUM ('REPORT_INTERPRETATION');

-- CreateEnum
CREATE TYPE "public"."AiPromptVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."AiTaskKind" AS ENUM ('CHART_EXPLANATION', 'TRANSIT_EXPLANATION', 'REMEDY_EXPLANATION', 'CONSULTATION_BRIEF_GENERATION', 'CONTENT_DRAFT_GENERATION');

-- CreateEnum
CREATE TYPE "public"."AiTaskRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ArticleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ChartStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ChartType" AS ENUM ('NATAL', 'TRANSIT', 'COMPATIBILITY', 'SOLAR_RETURN');

-- CreateEnum
CREATE TYPE "public"."ConsultationSlotStatus" AS ENUM ('OPEN', 'BOOKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ConsultationStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ConsultationType" AS ENUM ('PRIVATE_READING', 'COMPATIBILITY', 'BUSINESS_ASTROLOGY', 'REMEDY_GUIDANCE', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('MANUAL_PLACEHOLDER', 'STRIPE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ProductCategory" AS ENUM ('RUDRAKSHA', 'MALAS', 'GEMSTONES', 'YANTRAS', 'IDOLS', 'MANTRA_REMEDIES');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'SERVICE');

-- CreateEnum
CREATE TYPE "public"."RemedyType" AS ENUM ('MANTRA', 'RUDRAKSHA', 'MALA', 'GEMSTONE', 'YANTRA', 'PUJA', 'DONATION', 'FASTING', 'SPIRITUAL_DISCIPLINE', 'LIFESTYLE_SUPPORT');

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_role_assignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_role_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_conversation_message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "public"."AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "toolName" TEXT,
    "toolPayload" JSONB,
    "model" TEXT,
    "providerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversation_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_conversation_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "channelKey" TEXT NOT NULL DEFAULT 'dashboard',
    "title" TEXT,
    "status" "public"."AiConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ai_conversation_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_prompt_template" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "area" "public"."AiPromptArea" NOT NULL DEFAULT 'REPORT_INTERPRETATION',
    "activeVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompt_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_prompt_version" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "model" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "status" "public"."AiPromptVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "releaseNotes" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompt_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_task_run" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "taskKind" "public"."AiTaskKind" NOT NULL,
    "status" "public"."AiTaskRunStatus" NOT NULL DEFAULT 'QUEUED',
    "providerKey" TEXT NOT NULL,
    "model" TEXT,
    "promptTemplateKey" TEXT,
    "promptVersionId" TEXT,
    "promptVersionLabel" TEXT,
    "inputHash" TEXT,
    "inputPayload" JSONB,
    "outputPayload" JSONB,
    "normalizedOutput" JSONB,
    "policyPassed" BOOLEAN NOT NULL DEFAULT true,
    "policyViolations" JSONB,
    "usageInputTokens" INTEGER,
    "usageOutputTokens" INTEGER,
    "usageTotalTokens" INTEGER,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_task_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT,
    "status" "public"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."astrologer_copilot_snapshot" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "astrologerUserId" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "model" TEXT,
    "promptTemplateKey" TEXT,
    "promptVersionLabel" TEXT,
    "inputHash" TEXT,
    "snapshotPayload" JSONB NOT NULL,
    "briefText" TEXT NOT NULL,
    "followUpDraft" TEXT NOT NULL,
    "recapDraft" TEXT NOT NULL,
    "astrologerNotesDraft" TEXT NOT NULL,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "lastCopiedAt" TIMESTAMP(3),
    "lastExportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "astrologer_copilot_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorRoleKey" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."birth_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "birthTime" TEXT,
    "timezone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birth_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDataId" TEXT NOT NULL,
    "type" "public"."ChartType" NOT NULL,
    "status" "public"."ChartStatus" NOT NULL DEFAULT 'DRAFT',
    "providerKey" TEXT NOT NULL DEFAULT 'deterministic-placeholder',
    "calculationVersion" TEXT,
    "chartPayload" JSONB,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consultation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDataId" TEXT,
    "packageId" TEXT,
    "slotId" TEXT,
    "type" "public"."ConsultationType" NOT NULL,
    "status" "public"."ConsultationStatus" NOT NULL DEFAULT 'REQUESTED',
    "confirmationCode" TEXT NOT NULL,
    "astrologerName" TEXT NOT NULL DEFAULT 'Joy Prakash Sarmah',
    "serviceLabel" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "clientTimezone" TEXT,
    "preferredLanguage" TEXT,
    "contactPhone" TEXT,
    "topicFocus" TEXT,
    "intakeSummary" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consultation_package" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."ConsultationType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "priceFromMinor" INTEGER,
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consultation_slot" (
    "id" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "status" "public"."ConsultationSlotStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentProvider" "public"."PaymentProvider" NOT NULL DEFAULT 'MANUAL_PLACEHOLDER',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "checkoutReference" TEXT,
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "subtotalAmount" INTEGER NOT NULL DEFAULT 0,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "shippingAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "billingName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "billingTimezone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_item" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "titleSnapshot" TEXT NOT NULL,
    "skuSnapshot" TEXT,
    "categorySnapshot" "public"."ProductCategory",
    "unitAmount" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_record" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "public"."PaymentProvider" NOT NULL DEFAULT 'MANUAL_PLACEHOLDER',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "providerReference" TEXT,
    "redirectUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."ProductCategory" NOT NULL,
    "type" "public"."ProductType" NOT NULL,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "priceInMinor" INTEGER,
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "imageUrl" TEXT,
    "badge" TEXT,
    "materialLabel" TEXT,
    "ritualFocus" TEXT,
    "inventoryCount" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "preferredLanguage" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "bio" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."remedy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."RemedyType" NOT NULL,
    "cautionNote" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remedy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."remedy_product_link" (
    "id" TEXT NOT NULL,
    "remedyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "relationshipNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remedy_product_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."remedy_recommendation_run" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "chartRecordId" TEXT,
    "surfaceKey" TEXT NOT NULL,
    "inputHash" TEXT,
    "signalKeys" TEXT[],
    "topRecommendationSlugs" TEXT[],
    "recommendationSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "remedy_recommendation_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_role_key_key" ON "public"."admin_role"("key" ASC);

-- CreateIndex
CREATE INDEX "admin_role_assignment_roleId_idx" ON "public"."admin_role_assignment"("roleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "admin_role_assignment_userId_roleId_key" ON "public"."admin_role_assignment"("userId" ASC, "roleId" ASC);

-- CreateIndex
CREATE INDEX "ai_conversation_message_sessionId_createdAt_idx" ON "public"."ai_conversation_message"("sessionId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ai_conversation_session_userId_status_updatedAt_idx" ON "public"."ai_conversation_session"("userId" ASC, "status" ASC, "updatedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompt_template_key_key" ON "public"."ai_prompt_template"("key" ASC);

-- CreateIndex
CREATE INDEX "ai_prompt_version_templateId_status_idx" ON "public"."ai_prompt_version"("templateId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompt_version_templateId_version_key" ON "public"."ai_prompt_version"("templateId" ASC, "version" ASC);

-- CreateIndex
CREATE INDEX "ai_task_run_promptTemplateKey_createdAt_idx" ON "public"."ai_task_run"("promptTemplateKey" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ai_task_run_sessionId_createdAt_idx" ON "public"."ai_task_run"("sessionId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "ai_task_run_userId_taskKind_createdAt_idx" ON "public"."ai_task_run"("userId" ASC, "taskKind" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "article_slug_key" ON "public"."article"("slug" ASC);

-- CreateIndex
CREATE INDEX "article_status_publishedAt_idx" ON "public"."article"("status" ASC, "publishedAt" ASC);

-- CreateIndex
CREATE INDEX "astrologer_copilot_snapshot_astrologerUserId_createdAt_idx" ON "public"."astrologer_copilot_snapshot"("astrologerUserId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "astrologer_copilot_snapshot_consultationId_createdAt_idx" ON "public"."astrologer_copilot_snapshot"("consultationId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "audit_log_actorUserId_createdAt_idx" ON "public"."audit_log"("actorUserId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_createdAt_idx" ON "public"."audit_log"("entityType" ASC, "entityId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "birth_data_userId_isPrimary_idx" ON "public"."birth_data"("userId" ASC, "isPrimary" ASC);

-- CreateIndex
CREATE INDEX "chart_userId_type_idx" ON "public"."chart"("userId" ASC, "type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "consultation_confirmationCode_key" ON "public"."consultation"("confirmationCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "consultation_slotId_key" ON "public"."consultation"("slotId" ASC);

-- CreateIndex
CREATE INDEX "consultation_status_scheduledFor_idx" ON "public"."consultation"("status" ASC, "scheduledFor" ASC);

-- CreateIndex
CREATE INDEX "consultation_userId_status_idx" ON "public"."consultation"("userId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "consultation_package_isActive_sortOrder_idx" ON "public"."consultation_package"("isActive" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "consultation_package_slug_key" ON "public"."consultation_package"("slug" ASC);

-- CreateIndex
CREATE INDEX "consultation_slot_status_startsAt_idx" ON "public"."consultation_slot"("status" ASC, "startsAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "order_checkoutReference_key" ON "public"."order"("checkoutReference" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "order_orderNumber_key" ON "public"."order"("orderNumber" ASC);

-- CreateIndex
CREATE INDEX "order_userId_status_idx" ON "public"."order"("userId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "public"."order_item"("orderId" ASC);

-- CreateIndex
CREATE INDEX "payment_record_orderId_status_idx" ON "public"."payment_record"("orderId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "public"."product"("sku" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "public"."product"("slug" ASC);

-- CreateIndex
CREATE INDEX "product_status_category_sortOrder_idx" ON "public"."product"("status" ASC, "category" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "public"."profile"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "remedy_slug_key" ON "public"."remedy"("slug" ASC);

-- CreateIndex
CREATE INDEX "remedy_product_link_productId_sortOrder_idx" ON "public"."remedy_product_link"("productId" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "remedy_product_link_remedyId_productId_key" ON "public"."remedy_product_link"("remedyId" ASC, "productId" ASC);

-- CreateIndex
CREATE INDEX "remedy_recommendation_run_chartRecordId_createdAt_idx" ON "public"."remedy_recommendation_run"("chartRecordId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "remedy_recommendation_run_surfaceKey_createdAt_idx" ON "public"."remedy_recommendation_run"("surfaceKey" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "remedy_recommendation_run_userId_createdAt_idx" ON "public"."remedy_recommendation_run"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_role_assignment" ADD CONSTRAINT "admin_role_assignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."admin_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_role_assignment" ADD CONSTRAINT "admin_role_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_conversation_message" ADD CONSTRAINT "ai_conversation_message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ai_conversation_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_conversation_session" ADD CONSTRAINT "ai_conversation_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_prompt_template" ADD CONSTRAINT "ai_prompt_template_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "public"."ai_prompt_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_prompt_version" ADD CONSTRAINT "ai_prompt_version_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."ai_prompt_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_task_run" ADD CONSTRAINT "ai_task_run_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "public"."ai_prompt_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_task_run" ADD CONSTRAINT "ai_task_run_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ai_conversation_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_task_run" ADD CONSTRAINT "ai_task_run_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."article" ADD CONSTRAINT "article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_data" ADD CONSTRAINT "birth_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chart" ADD CONSTRAINT "chart_birthDataId_fkey" FOREIGN KEY ("birthDataId") REFERENCES "public"."birth_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chart" ADD CONSTRAINT "chart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultation" ADD CONSTRAINT "consultation_birthDataId_fkey" FOREIGN KEY ("birthDataId") REFERENCES "public"."birth_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultation" ADD CONSTRAINT "consultation_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."consultation_package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultation" ADD CONSTRAINT "consultation_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."consultation_slot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultation" ADD CONSTRAINT "consultation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_record" ADD CONSTRAINT "payment_record_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."remedy_product_link" ADD CONSTRAINT "remedy_product_link_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."remedy_product_link" ADD CONSTRAINT "remedy_product_link_remedyId_fkey" FOREIGN KEY ("remedyId") REFERENCES "public"."remedy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
