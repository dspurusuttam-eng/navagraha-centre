import "server-only";

import {
  ArticleStatus,
  ConsultationSlotStatus,
  ConsultationStatus,
  InquiryLifecycleStage,
  PaymentProvider,
  Prisma,
  ProductStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getContentAdapter } from "@/modules/content/server";
import { getConsultationConversionFunnelSnapshot } from "@/modules/consultations/funnel-snapshot";
import {
  getFollowUpAutomationSnapshot,
  getFollowUpReminderQueue,
} from "@/modules/consultations/follow-up-automation";
import { formatAdminCurrency } from "@/modules/admin/format";

export async function getAdminDashboardData() {
  const prisma = getPrisma();

  const [
    totalUsers,
    activeConsultations,
    openSlots,
    activeProducts,
    publishedRemedies,
    contentInReview,
    promptTemplates,
    recentUsers,
    consultationQueue,
    reviewQueue,
    auditTrail,
    liveContentEntries,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.consultation.count({
      where: {
        status: {
          in: [ConsultationStatus.REQUESTED, ConsultationStatus.CONFIRMED],
        },
      },
    }),
    prisma.consultationSlot.count({
      where: {
        status: ConsultationSlotStatus.OPEN,
      },
    }),
    prisma.product.count({
      where: {
        status: ProductStatus.ACTIVE,
      },
    }),
    prisma.remedy.count({
      where: {
        publishedAt: {
          not: null,
        },
      },
    }),
    prisma.article.count({
      where: {
        status: ArticleStatus.REVIEW,
      },
    }),
    prisma.aiPromptTemplate.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        adminAssignments: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            role: {
              select: {
                key: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.consultation.findMany({
      take: 6,
      orderBy: [
        {
          scheduledFor: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      where: {
        status: {
          in: [ConsultationStatus.REQUESTED, ConsultationStatus.CONFIRMED],
        },
      },
      select: {
        id: true,
        confirmationCode: true,
        status: true,
        serviceLabel: true,
        scheduledFor: true,
        clientTimezone: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.article.findMany({
      take: 6,
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        status: {
          in: [ArticleStatus.DRAFT, ArticleStatus.REVIEW],
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        action: true,
        summary: true,
        actorRoleKey: true,
        createdAt: true,
        actor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    getContentAdapter().listPublishedEntries(),
  ]);

  return {
    counts: {
      totalUsers,
      activeConsultations,
      openSlots,
      activeProducts,
      publishedRemedies,
      contentInReview,
      promptTemplates,
      liveContentEntries: liveContentEntries.length,
    },
    recentUsers,
    consultationQueue,
    reviewQueue,
    auditTrail,
  };
}

export async function listAdminUsers() {
  return getPrisma().user.findMany({
    take: 18,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      profile: {
        select: {
          preferredLanguage: true,
          city: true,
          country: true,
          timezone: true,
        },
      },
      adminAssignments: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          role: {
            select: {
              key: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          charts: true,
          consultations: true,
          orders: true,
        },
      },
    },
  });
}

export async function listAdminConsultations() {
  return getPrisma().consultation.findMany({
    take: 18,
    orderBy: [
      {
        scheduledFor: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      confirmationCode: true,
      status: true,
      serviceLabel: true,
      scheduledFor: true,
      scheduledEnd: true,
      clientTimezone: true,
      preferredLanguage: true,
      topicFocus: true,
      internalNotes: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      slot: {
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          timezone: true,
          status: true,
        },
      },
    },
  });
}

export async function getAdminConsultationOpsSnapshot() {
  const prisma = getPrisma();
  const [
    inquiryStageCounts,
    followUpAutomationSnapshot,
    reminderQueue,
    funnelSnapshot,
  ] =
    await Promise.all([
      prisma.inquiryLead.groupBy({
        by: ["lifecycleStage"],
        _count: {
          _all: true,
        },
      }),
      getFollowUpAutomationSnapshot({
        limit: 80,
      }),
      getFollowUpReminderQueue({
        limit: 80,
      }),
      getConsultationConversionFunnelSnapshot(),
    ]);

  const lifecycleStageCounts = {
    NEW_INQUIRY: 0,
    CONSULTATION_INTEREST: 0,
    AWAITING_RESPONSE: 0,
    BOOKED: 0,
    POST_SESSION: 0,
    FOLLOW_UP_ELIGIBLE: 0,
  };

  for (const item of inquiryStageCounts) {
    lifecycleStageCounts[item.lifecycleStage] = item._count._all;
  }

  const activeFollowUpOpsCount =
    followUpAutomationSnapshot.skippedByReason.ACTIVE_FOLLOW_UP_ALREADY_BOOKED;
  const postSessionLeadCount =
    lifecycleStageCounts[InquiryLifecycleStage.POST_SESSION];
  const followUpEligibleLeadCount =
    lifecycleStageCounts[InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE];

  return {
    lifecycleStageCounts,
    postSessionLeadCount,
    followUpEligibleLeadCount,
    activeFollowUpOpsCount,
    followUpAutomationSnapshot,
    reminderQueuePreview: reminderQueue.slice(0, 6),
    funnelSnapshot,
  };
}

export async function listAdminFollowUpAutomationRuns() {
  return getPrisma().auditLog.findMany({
    where: {
      entityType: "INQUIRY_LEAD",
      entityId: "follow-up-automation",
      action: {
        in: ["FOLLOW_UP_AUTOMATION_RUN", "FOLLOW_UP_AUTOMATION_DRY_RUN"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
    select: {
      id: true,
      action: true,
      summary: true,
      actorRoleKey: true,
      createdAt: true,
      metadata: true,
      actor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function listAdminBookingSlots() {
  return getPrisma().consultationSlot.findMany({
    take: 18,
    orderBy: {
      startsAt: "asc",
    },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      timezone: true,
      status: true,
      note: true,
      consultation: {
        select: {
          id: true,
          confirmationCode: true,
          status: true,
          serviceLabel: true,
          clientTimezone: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function listAdminProducts() {
  return getPrisma().product.findMany({
    take: 18,
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      type: true,
      status: true,
      priceInMinor: true,
      currencyCode: true,
      inventoryCount: true,
      isFeatured: true,
      sortOrder: true,
      updatedAt: true,
      _count: {
        select: {
          orderItems: true,
          remedyLinks: true,
        },
      },
    },
  });
}

export async function listAdminRemedies() {
  return getPrisma().remedy.findMany({
    take: 18,
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      isFeatured: true,
      publishedAt: true,
      updatedAt: true,
      _count: {
        select: {
          productLinks: true,
        },
      },
    },
  });
}

export async function listAdminArticles() {
  const [articles, liveEntries] = await Promise.all([
    getPrisma().article.findMany({
      take: 18,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    getContentAdapter().listPublishedEntries(),
  ]);

  return {
    articles,
    liveEntries,
  };
}

export async function listAiPromptTemplates() {
  return getPrisma().aiPromptTemplate.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      key: true,
      title: true,
      description: true,
      area: true,
      updatedAt: true,
      activeVersionId: true,
      activeVersion: {
        select: {
          id: true,
          version: true,
          label: true,
          model: true,
          systemPrompt: true,
          userPrompt: true,
          status: true,
          activatedAt: true,
        },
      },
      versions: {
        orderBy: {
          version: "desc",
        },
        select: {
          id: true,
          version: true,
          label: true,
          model: true,
          status: true,
          releaseNotes: true,
          updatedAt: true,
          activatedAt: true,
        },
      },
    },
  });
}

type AdminOrderLifecycleState = "PENDING" | "PAID" | "FAILED";

const paymentProviderLabels: Record<PaymentProvider, string> = {
  MANUAL_PLACEHOLDER: "Centre Payment Review",
  STRIPE: "Stripe",
};

function readJsonObject(
  value: Prisma.JsonValue | null | undefined
): Prisma.JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Prisma.JsonObject;
}

function readStringFromObject(object: Prisma.JsonObject | null, key: string) {
  if (!object) {
    return null;
  }

  const value = object[key];

  return typeof value === "string" ? value : null;
}

function toAdminOrderLifecycleState(status: string, paymentStatus: string) {
  if (
    paymentStatus === "PAID" ||
    status === "PAID" ||
    status === "FULFILLED"
  ) {
    return "PAID" satisfies AdminOrderLifecycleState;
  }

  if (paymentStatus === "FAILED" || status === "CANCELLED") {
    return "FAILED" satisfies AdminOrderLifecycleState;
  }

  return "PENDING" satisfies AdminOrderLifecycleState;
}

export async function listAdminOrders() {
  const rows = await getPrisma().order.findMany({
    take: 36,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      paymentProvider: true,
      totalAmount: true,
      currencyCode: true,
      billingName: true,
      customerEmail: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return rows.map((row) => {
    const lifecycleState = toAdminOrderLifecycleState(
      row.status,
      row.paymentStatus
    );

    return {
      id: row.id,
      orderNumber: row.orderNumber,
      createdAt: row.createdAt,
      status: row.status,
      paymentStatus: row.paymentStatus,
      paymentProvider: row.paymentProvider,
      paymentProviderLabel: paymentProviderLabels[row.paymentProvider],
      totalAmount: row.totalAmount,
      currencyCode: row.currencyCode,
      totalLabel: formatAdminCurrency(row.totalAmount, row.currencyCode),
      itemCount: row._count.items,
      lifecycleState,
      customer: row.user
        ? {
            userId: row.user.id,
            name: row.user.name,
            email: row.user.email,
          }
        : {
            userId: null,
            name: row.billingName || "Guest checkout",
            email: row.customerEmail || "No email captured",
          },
    };
  });
}

export async function getAdminOrderDetail(orderNumber: string) {
  const row = await getPrisma().order.findFirst({
    where: {
      orderNumber,
    },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      paymentStatus: true,
      paymentProvider: true,
      checkoutReference: true,
      totalAmount: true,
      currencyCode: true,
      billingName: true,
      customerEmail: true,
      customerPhone: true,
      notes: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: [{ createdAt: "asc" }],
        select: {
          id: true,
          titleSnapshot: true,
          skuSnapshot: true,
          quantity: true,
          unitAmount: true,
        },
      },
      paymentRecords: {
        orderBy: [{ createdAt: "desc" }],
        take: 1,
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          currencyCode: true,
          providerReference: true,
          metadata: true,
          createdAt: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  const latestPayment = row.paymentRecords[0] ?? null;
  const paymentMetadata = readJsonObject(latestPayment?.metadata);
  const finalizedAtUtc = readStringFromObject(paymentMetadata, "finalizedAtUtc");

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: row.status,
    paymentStatus: row.paymentStatus,
    lifecycleState: toAdminOrderLifecycleState(row.status, row.paymentStatus),
    paymentProvider: row.paymentProvider,
    paymentProviderLabel: paymentProviderLabels[row.paymentProvider],
    checkoutReference: row.checkoutReference,
    totalAmount: row.totalAmount,
    totalLabel: formatAdminCurrency(row.totalAmount, row.currencyCode),
    currencyCode: row.currencyCode,
    trustedAmountSnapshot: latestPayment?.amount ?? row.totalAmount,
    trustedAmountCurrencyCode: latestPayment?.currencyCode ?? row.currencyCode,
    trustedAmountLabel: formatAdminCurrency(
      latestPayment?.amount ?? row.totalAmount,
      latestPayment?.currencyCode ?? row.currencyCode
    ),
    latestPaymentRecord: latestPayment
      ? {
          id: latestPayment.id,
          provider: latestPayment.provider,
          providerLabel: paymentProviderLabels[latestPayment.provider],
          status: latestPayment.status,
          providerReference: latestPayment.providerReference,
          createdAt: latestPayment.createdAt,
        }
      : null,
    finalizedAtUtc,
    internalNotes: row.notes ?? "",
    customer: row.user
      ? {
          userId: row.user.id,
          name: row.user.name,
          email: row.user.email,
        }
      : {
          userId: null,
          name: row.billingName || "Guest checkout",
          email: row.customerEmail || "No email captured",
        },
    customerPhone: row.customerPhone,
    items: row.items.map((item) => ({
      id: item.id,
      titleSnapshot: item.titleSnapshot,
      skuSnapshot: item.skuSnapshot,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      unitAmountLabel: formatAdminCurrency(item.unitAmount, row.currencyCode),
      lineTotal: item.unitAmount * item.quantity,
      lineTotalLabel: formatAdminCurrency(
        item.unitAmount * item.quantity,
        row.currencyCode
      ),
    })),
  };
}
