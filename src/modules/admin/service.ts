import "server-only";

import {
  ArticleStatus,
  ConsultationSlotStatus,
  ConsultationStatus,
  ProductStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getContentAdapter } from "@/modules/content/server";

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
