"use server";

import {
  AiPromptVersionStatus,
  ArticleStatus,
  ConsultationSlotStatus,
  ConsultationStatus,
  ProductStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { recordAuditLog } from "@/modules/admin/audit";
import { adminRoleKeys, type AdminRoleKey } from "@/modules/admin/permissions";
import { requireAdminSession } from "@/modules/auth/server";

const consultationStatuses = [
  ConsultationStatus.REQUESTED,
  ConsultationStatus.CONFIRMED,
  ConsultationStatus.COMPLETED,
  ConsultationStatus.CANCELLED,
] as const;

const bookingStatuses = [
  ConsultationSlotStatus.OPEN,
  ConsultationSlotStatus.BOOKED,
  ConsultationSlotStatus.CANCELLED,
] as const;

const productStatuses = [
  ProductStatus.DRAFT,
  ProductStatus.ACTIVE,
  ProductStatus.ARCHIVED,
] as const;

const articleStatuses = [
  ArticleStatus.DRAFT,
  ArticleStatus.REVIEW,
  ArticleStatus.PUBLISHED,
  ArticleStatus.ARCHIVED,
] as const;

const remedyPublicationStates = ["published", "hold"] as const;

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getRequiredStringValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function isAdminRoleKey(value: string): value is AdminRoleKey {
  return adminRoleKeys.includes(value as AdminRoleKey);
}

function isConsultationStatus(value: string): value is ConsultationStatus {
  return consultationStatuses.includes(value as ConsultationStatus);
}

function isConsultationSlotStatus(
  value: string
): value is ConsultationSlotStatus {
  return bookingStatuses.includes(value as ConsultationSlotStatus);
}

function isProductStatus(value: string): value is ProductStatus {
  return productStatuses.includes(value as ProductStatus);
}

function isArticleStatus(value: string): value is ArticleStatus {
  return articleStatuses.includes(value as ArticleStatus);
}

function isRemedyPublicationState(
  value: string
): value is (typeof remedyPublicationStates)[number] {
  return remedyPublicationStates.includes(
    value as (typeof remedyPublicationStates)[number]
  );
}

function revalidateAdminPaths(paths: readonly string[]) {
  const allPaths = new Set(["/admin", ...paths]);

  for (const path of allPaths) {
    revalidatePath(path);
  }
}

export async function assignAdminRoleAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder"],
  });
  const userId = getRequiredStringValue(formData, "userId");
  const roleKey = getRequiredStringValue(formData, "roleKey");

  if (!isAdminRoleKey(roleKey)) {
    throw new Error("Unsupported admin role.");
  }

  const prisma = getPrisma();
  const role = await prisma.adminRole.findUniqueOrThrow({
    where: {
      key: roleKey,
    },
    select: {
      id: true,
      name: true,
      key: true,
    },
  });

  await prisma.adminRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: role.id,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "user",
    entityId: userId,
    action: "role.assigned",
    summary: `Assigned ${role.name} access.`,
    metadata: {
      roleKey: role.key,
    },
  });

  revalidateAdminPaths(["/admin/users"]);
}

export async function removeAdminRoleAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder"],
  });
  const userId = getRequiredStringValue(formData, "userId");
  const roleKey = getRequiredStringValue(formData, "roleKey");

  if (!isAdminRoleKey(roleKey)) {
    throw new Error("Unsupported admin role.");
  }

  const prisma = getPrisma();
  const role = await prisma.adminRole.findUniqueOrThrow({
    where: {
      key: roleKey,
    },
    select: {
      id: true,
      name: true,
      key: true,
    },
  });

  await prisma.adminRoleAssignment.deleteMany({
    where: {
      userId,
      roleId: role.id,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "user",
    entityId: userId,
    action: "role.removed",
    summary: `Removed ${role.name} access.`,
    metadata: {
      roleKey: role.key,
    },
  });

  revalidateAdminPaths(["/admin/users"]);
}

export async function updateConsultationAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });
  const consultationId = getRequiredStringValue(formData, "consultationId");
  const nextStatus = getRequiredStringValue(formData, "status");
  const internalNotes = getStringValue(formData, "internalNotes");

  if (!isConsultationStatus(nextStatus)) {
    throw new Error("Unsupported consultation status.");
  }

  const consultation = await getPrisma().consultation.update({
    where: {
      id: consultationId,
    },
    data: {
      status: nextStatus,
      internalNotes: internalNotes || null,
    },
    select: {
      id: true,
      confirmationCode: true,
      serviceLabel: true,
      status: true,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "consultation",
    entityId: consultation.id,
    action: "consultation.updated",
    summary: `Updated ${consultation.serviceLabel} consultation ${consultation.confirmationCode} to ${consultation.status}.`,
    metadata: {
      status: consultation.status,
      hasInternalNotes: Boolean(internalNotes),
    },
  });

  revalidateAdminPaths(["/admin/consultations"]);
}

export async function updateBookingSlotAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });
  const slotId = getRequiredStringValue(formData, "slotId");
  const nextStatus = getRequiredStringValue(formData, "status");
  const note = getStringValue(formData, "note");

  if (!isConsultationSlotStatus(nextStatus)) {
    throw new Error("Unsupported booking status.");
  }

  const slot = await getPrisma().consultationSlot.update({
    where: {
      id: slotId,
    },
    data: {
      status: nextStatus,
      note: note || null,
    },
    select: {
      id: true,
      status: true,
      startsAt: true,
      timezone: true,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "booking-slot",
    entityId: slot.id,
    action: "booking-slot.updated",
    summary: `Updated booking slot ${slot.id} to ${slot.status}.`,
    metadata: {
      status: slot.status,
      startsAt: slot.startsAt.toISOString(),
      timezone: slot.timezone,
    },
  });

  revalidateAdminPaths(["/admin/bookings"]);
}

export async function updateProductAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder"],
  });
  const productId = getRequiredStringValue(formData, "productId");
  const nextStatus = getRequiredStringValue(formData, "status");
  const isFeatured = formData.get("isFeatured") === "on";

  if (!isProductStatus(nextStatus)) {
    throw new Error("Unsupported product status.");
  }

  const product = await getPrisma().product.update({
    where: {
      id: productId,
    },
    data: {
      status: nextStatus,
      isFeatured,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      isFeatured: true,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "product",
    entityId: product.id,
    action: "product.updated",
    summary: `Updated ${product.name} merchandising state.`,
    metadata: {
      slug: product.slug,
      status: product.status,
      isFeatured: product.isFeatured,
    },
  });

  revalidateAdminPaths(["/admin/products"]);
}

export async function updateRemedyAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });
  const remedyId = getRequiredStringValue(formData, "remedyId");
  const publicationState = getRequiredStringValue(formData, "publicationState");
  const isFeatured = formData.get("isFeatured") === "on";

  if (!isRemedyPublicationState(publicationState)) {
    throw new Error("Unsupported remedy publication state.");
  }

  const prisma = getPrisma();
  const currentRecord = await prisma.remedy.findUniqueOrThrow({
    where: {
      id: remedyId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
    },
  });

  const remedy = await prisma.remedy.update({
    where: {
      id: remedyId,
    },
    data: {
      isFeatured,
      publishedAt:
        publicationState === "published"
          ? (currentRecord.publishedAt ?? new Date())
          : null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      isFeatured: true,
      publishedAt: true,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "remedy",
    entityId: remedy.id,
    action: "remedy.updated",
    summary: `Updated remedy publishing for ${remedy.title}.`,
    metadata: {
      slug: remedy.slug,
      isFeatured: remedy.isFeatured,
      published: Boolean(remedy.publishedAt),
    },
  });

  revalidateAdminPaths(["/admin/remedies"]);
}

export async function updateArticleStatusAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });
  const articleId = getRequiredStringValue(formData, "articleId");
  const nextStatus = getRequiredStringValue(formData, "status");

  if (!isArticleStatus(nextStatus)) {
    throw new Error("Unsupported article status.");
  }

  const prisma = getPrisma();
  const currentArticle = await prisma.article.findUniqueOrThrow({
    where: {
      id: articleId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
    },
  });

  const article = await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === ArticleStatus.PUBLISHED
          ? (currentArticle.publishedAt ?? new Date())
          : nextStatus === ArticleStatus.ARCHIVED
            ? currentArticle.publishedAt
            : null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "article",
    entityId: article.id,
    action: "article.status.updated",
    summary: `Moved ${article.title} to ${article.status}.`,
    metadata: {
      slug: article.slug,
      publishedAt: article.publishedAt?.toISOString() ?? null,
    },
  });

  revalidateAdminPaths(["/admin/articles"]);
}

export async function createPromptVersionAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });
  const templateId = getRequiredStringValue(formData, "templateId");
  const label = getRequiredStringValue(formData, "label");
  const model = getStringValue(formData, "model");
  const systemPrompt = getRequiredStringValue(formData, "systemPrompt");
  const userPrompt = getRequiredStringValue(formData, "userPrompt");
  const releaseNotes = getStringValue(formData, "releaseNotes");
  const prisma = getPrisma();
  const template = await prisma.aiPromptTemplate.findUniqueOrThrow({
    where: {
      id: templateId,
    },
    select: {
      id: true,
      key: true,
      title: true,
      versions: {
        take: 1,
        orderBy: {
          version: "desc",
        },
        select: {
          version: true,
        },
      },
    },
  });

  const versionNumber = (template.versions[0]?.version ?? 0) + 1;
  const version = await prisma.aiPromptVersion.create({
    data: {
      templateId: template.id,
      version: versionNumber,
      label,
      model: model || null,
      systemPrompt,
      userPrompt,
      releaseNotes: releaseNotes || null,
      status: AiPromptVersionStatus.DRAFT,
    },
    select: {
      id: true,
      version: true,
    },
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "ai-prompt-template",
    entityId: template.id,
    action: "prompt-version.created",
    summary: `Created ${template.title} version ${version.version}.`,
    metadata: {
      templateKey: template.key,
      versionId: version.id,
      version: version.version,
    },
  });

  revalidateAdminPaths(["/admin/ai-settings"]);
}

export async function activatePromptVersionAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });
  const templateId = getRequiredStringValue(formData, "templateId");
  const versionId = getRequiredStringValue(formData, "versionId");
  const prisma = getPrisma();

  const activation = await prisma.$transaction(async (tx) => {
    const template = await tx.aiPromptTemplate.findUniqueOrThrow({
      where: {
        id: templateId,
      },
      select: {
        id: true,
        key: true,
        title: true,
      },
    });

    const version = await tx.aiPromptVersion.findFirstOrThrow({
      where: {
        id: versionId,
        templateId,
      },
      select: {
        id: true,
        version: true,
        label: true,
      },
    });

    await tx.aiPromptVersion.updateMany({
      where: {
        templateId,
        status: AiPromptVersionStatus.ACTIVE,
        id: {
          not: version.id,
        },
      },
      data: {
        status: AiPromptVersionStatus.ARCHIVED,
      },
    });

    await tx.aiPromptVersion.update({
      where: {
        id: version.id,
      },
      data: {
        status: AiPromptVersionStatus.ACTIVE,
        activatedAt: new Date(),
      },
    });

    await tx.aiPromptTemplate.update({
      where: {
        id: template.id,
      },
      data: {
        activeVersionId: version.id,
      },
    });

    return {
      template,
      version,
    };
  });

  await recordAuditLog({
    actorUserId: session.user.id,
    actorRoleKey: session.adminRole.key,
    entityType: "ai-prompt-template",
    entityId: activation.template.id,
    action: "prompt-version.activated",
    summary: `Activated ${activation.template.title} ${activation.version.label}.`,
    metadata: {
      templateKey: activation.template.key,
      versionId: activation.version.id,
      version: activation.version.version,
    },
  });

  revalidateAdminPaths(["/admin/ai-settings"]);
}
