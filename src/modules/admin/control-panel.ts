import "server-only";

import {
  ArticleStatus,
  ChartStatus,
  ConsultationStatus,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { curatedContentEntries } from "@/modules/content/catalog";
import { getContentAdapter } from "@/modules/content/server";
import type { ContentEntry } from "@/modules/content/types";

type JsonRecord = Record<string, unknown>;

function toJsonRecord(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function formatDateLabel(value: Date | string | null) {
  if (!value) {
    return "Not available";
  }

  const parsed = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(parsed);
}

function formatDateTimeLabel(value: Date | string | null) {
  if (!value) {
    return "Not available";
  }

  const parsed = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
}

function toTitleCase(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function toReportTitle(reportType: string | null) {
  switch (reportType) {
    case "CAREER":
      return "Career Report";
    case "MARRIAGE":
      return "Marriage / Compatibility Report";
    case "FINANCE":
      return "Finance / Wealth Report";
    case "HEALTH":
      return "Health / Wellness Report";
    case "EDUCATION":
      return "Education Report";
    case "BUSINESS":
      return "Business Report";
    default:
      return "Full Kundli Report";
  }
}

function toContentSummary(entry: ContentEntry) {
  return {
    slug: entry.slug,
    title: entry.title,
    type: entry.type,
    typeLabel: entry.type === "DAILY_RASHIFAL" ? "Daily Rashifal" : toTitleCase(entry.type),
    status: entry.status,
    category: entry.category,
    authorName: entry.authorName,
    seoTitle: entry.seoTitle,
    seoDescription: entry.seoDescription,
    publishedAt: entry.publishedAt,
    publishedAtLabel: formatDateTimeLabel(entry.publishedAt),
    updatedAt: entry.updatedAt,
    updatedAtLabel: formatDateTimeLabel(entry.updatedAt),
    path: entry.path,
  };
}

function buildChartSummary(payload: Prisma.JsonValue | null) {
  const record = toJsonRecord(payload);
  const summary = toJsonRecord(record?.summary as Prisma.JsonValue | null);
  const planets = Array.isArray(record?.planets)
    ? (record?.planets as unknown[])
    : [];

  const moonPlanet = planets.find((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return false;
    }

    return (item as JsonRecord).body === "MOON";
  }) as JsonRecord | undefined;

  return {
    ascendantSign: toStringValue(record?.ascendantSign),
    moonSign: toStringValue(moonPlanet?.sign),
    narrative:
      toStringValue(summary?.narrative) ??
      "Chart summary is not available in the safe admin surface.",
    dominantBodies: Array.isArray(summary?.dominantBodies)
      ? (summary?.dominantBodies as unknown[])
          .map((item) => (typeof item === "string" ? item : null))
          .filter((item): item is string => Boolean(item))
      : [],
  };
}

export type AdminLaunchMetrics = {
  users: number;
  savedKundlis: number;
  readyKundlis: number;
  consultations: number;
  pendingConsultations: number;
  orders: number;
  paidOrders: number;
  activeProducts: number;
  editorialRecords: number;
  dailyRashifalEntries: number;
  premiumReportRuns: number;
  unlockedPremiumReportRuns: number;
  previewPremiumReportRuns: number;
};

export type AdminKundliOverviewItem = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  label: string;
  birthDateLabel: string;
  birthPlace: string;
  isPrimary: boolean;
  chartType: string;
  chartStatus: string;
  ascendantSign: string | null;
  moonSign: string | null;
  chartSummary: string;
  generatedAtLabel: string;
  updatedAtLabel: string;
  detailHref: string;
};

export type AdminKundliDetail = AdminKundliOverviewItem & {
  birthTimeLabel: string;
  timezone: string;
  providerKey: string;
  calculationVersion: string | null;
};

export type AdminReportOverviewItem = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  title: string;
  reportType: string;
  accessState: "Unlocked" | "Preview" | "Limit Reached";
  paymentState: "Paid" | "Preview" | "Pending" | "Limit Reached";
  generatedAtLabel: string;
  updatedAtLabel: string;
  detailHref: string;
};

export type AdminReportDetail = AdminReportOverviewItem & {
  planType: string | null;
  promptVersionLabel: string | null;
  providerKey: string;
  normalizedOutputState: string | null;
};

export type AdminContentOverview = {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    authorName: string;
    updatedAtLabel: string;
  }>;
  publishedCatalogEntries: ReturnType<typeof toContentSummary>[];
  rashifalEntries: ReturnType<typeof toContentSummary>[];
  draftRashifalTemplates: ReturnType<typeof toContentSummary>[];
};

export type AdminHealthOverview = {
  generatedAtLabel: string;
  counts: AdminLaunchMetrics;
  readySignals: string[];
  followUps: string[];
};

export async function getAdminLaunchMetrics(): Promise<AdminLaunchMetrics> {
  const prisma = getPrisma();
  const [users, charts, readyKundlis, consultations, pendingConsultations, orders, paidOrders, products, articles, taskRuns] =
    await Promise.all([
      prisma.user.count(),
      prisma.chart.count(),
      prisma.chart.count({
        where: {
          status: ChartStatus.READY,
        },
      }),
      prisma.consultation.count(),
      prisma.consultation.count({
        where: {
          status: {
            in: [ConsultationStatus.REQUESTED, ConsultationStatus.CONFIRMED],
          },
        },
      }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          paymentStatus: PaymentStatus.PAID,
        },
      }),
      prisma.product.count({
        where: {
          status: ProductStatus.ACTIVE,
        },
      }),
      prisma.article.count({
        where: {
          status: {
            in: [ArticleStatus.DRAFT, ArticleStatus.REVIEW, ArticleStatus.PUBLISHED],
          },
        },
      }),
      prisma.aiTaskRun.findMany({
        where: {
          taskKind: "CONTENT_DRAFT_GENERATION",
          promptTemplateKey: "premium-report-generator",
          status: "SUCCEEDED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        select: {
          outputPayload: true,
        },
    }),
  ]);

  const premiumReportRuns = taskRuns.length;
  const unlockedPremiumReportRuns = taskRuns.filter((run) => {
    const output = toJsonRecord(run.outputPayload);

    return output?.status === "FULL_ACCESS";
  }).length;
  const previewPremiumReportRuns = taskRuns.filter((run) => {
    const output = toJsonRecord(run.outputPayload);

    return output?.status === "PREVIEW_LOCKED";
  }).length;

  const dailyRashifalEntries = curatedContentEntries.filter(
    (entry) => entry.type === "DAILY_RASHIFAL"
  ).length;

  return {
    users,
    savedKundlis: charts,
    readyKundlis,
    consultations,
    pendingConsultations,
    orders,
    paidOrders,
    activeProducts: products,
    editorialRecords: articles,
    dailyRashifalEntries,
    premiumReportRuns,
    unlockedPremiumReportRuns,
    previewPremiumReportRuns,
  };
}

export async function listAdminKundliOverview() {
  const records = await getPrisma().chart.findMany({
    take: 24,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      type: true,
      status: true,
      providerKey: true,
      calculationVersion: true,
      generatedAt: true,
      updatedAt: true,
      chartPayload: true,
      birthData: {
        select: {
          id: true,
          label: true,
          birthDate: true,
          birthTime: true,
          timezone: true,
          city: true,
          region: true,
          country: true,
          isPrimary: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return records.map<AdminKundliOverviewItem>((record) => {
    const summary = buildChartSummary(record.chartPayload);
    const birthPlace = [
      record.birthData.city,
      record.birthData.region,
      record.birthData.country,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      id: record.id,
      ownerId: record.birthData.user.id,
      ownerName: record.birthData.user.name,
      ownerEmail: record.birthData.user.email,
      label: record.birthData.label,
      birthDateLabel: formatDateLabel(record.birthData.birthDate),
      birthPlace,
      isPrimary: record.birthData.isPrimary,
      chartType: record.type,
      chartStatus: record.status,
      ascendantSign: summary.ascendantSign,
      moonSign: summary.moonSign,
      chartSummary: summary.narrative,
      generatedAtLabel: formatDateTimeLabel(record.generatedAt),
      updatedAtLabel: formatDateTimeLabel(record.updatedAt),
      detailHref: `/admin/kundlis/${record.id}`,
    };
  });
}

export async function getAdminKundliDetail(chartId: string) {
  const record = await getPrisma().chart.findUnique({
    where: { id: chartId },
    select: {
      id: true,
      type: true,
      status: true,
      providerKey: true,
      calculationVersion: true,
      generatedAt: true,
      updatedAt: true,
      chartPayload: true,
      birthData: {
        select: {
          id: true,
          label: true,
          birthDate: true,
          birthTime: true,
          timezone: true,
          city: true,
          region: true,
          country: true,
          isPrimary: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!record) {
    return null;
  }

  const summary = buildChartSummary(record.chartPayload);
  const birthPlace = [
    record.birthData.city,
    record.birthData.region,
    record.birthData.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: record.id,
    ownerId: record.birthData.user.id,
    ownerName: record.birthData.user.name,
    ownerEmail: record.birthData.user.email,
    label: record.birthData.label,
    birthDateLabel: formatDateLabel(record.birthData.birthDate),
    birthTimeLabel: record.birthData.birthTime ?? "Not available",
    timezone: record.birthData.timezone,
    birthPlace,
    isPrimary: record.birthData.isPrimary,
    chartType: record.type,
    chartStatus: record.status,
    providerKey: record.providerKey,
    calculationVersion: record.calculationVersion,
    ascendantSign: summary.ascendantSign,
    moonSign: summary.moonSign,
    chartSummary: summary.narrative,
    generatedAtLabel: formatDateTimeLabel(record.generatedAt),
    updatedAtLabel: formatDateTimeLabel(record.updatedAt),
    detailHref: `/admin/kundlis/${record.id}`,
  } satisfies AdminKundliDetail;
}

export async function listAdminReportOverview() {
  const records = await getPrisma().aiTaskRun.findMany({
    take: 30,
    orderBy: {
      createdAt: "desc",
    },
    where: {
      taskKind: "CONTENT_DRAFT_GENERATION",
      promptTemplateKey: "premium-report-generator",
      status: "SUCCEEDED",
    },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      providerKey: true,
      promptVersionLabel: true,
      inputPayload: true,
      outputPayload: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return records.map<AdminReportOverviewItem>((record) => {
    const input = toJsonRecord(record.inputPayload);
    const output = toJsonRecord(record.outputPayload);
    const reportType = toStringValue(input?.reportType);
    const status = toStringValue(output?.status);

    return {
      id: record.id,
      ownerId: record.userId ?? "system",
      ownerName: record.user?.name ?? "Member",
      ownerEmail: record.user?.email ?? "Not available",
      title: toReportTitle(reportType),
      reportType: reportType ?? "FULL_KUNDLI",
      accessState:
        status === "FULL_ACCESS"
          ? "Unlocked"
          : status === "LIMIT_REACHED"
            ? "Limit Reached"
            : "Preview",
      paymentState:
        status === "FULL_ACCESS"
          ? "Paid"
          : status === "LIMIT_REACHED"
            ? "Limit Reached"
            : "Preview",
      generatedAtLabel: formatDateTimeLabel(record.createdAt),
      updatedAtLabel: formatDateTimeLabel(record.updatedAt),
      detailHref: `/admin/reports/${record.id}`,
    };
  });
}

export async function getAdminReportDetail(taskRunId: string) {
  const record = await getPrisma().aiTaskRun.findUnique({
    where: {
      id: taskRunId,
    },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      providerKey: true,
      promptTemplateKey: true,
      promptVersionLabel: true,
      inputPayload: true,
      outputPayload: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!record) {
    return null;
  }

  const input = toJsonRecord(record.inputPayload);
  const output = toJsonRecord(record.outputPayload);
  const reportType = toStringValue(input?.reportType);
  const status = toStringValue(output?.status);

  return {
    id: record.id,
    ownerId: record.userId ?? "system",
    ownerName: record.user?.name ?? "Member",
    ownerEmail: record.user?.email ?? "Not available",
    title: toReportTitle(reportType),
    reportType: reportType ?? "FULL_KUNDLI",
    accessState:
      status === "FULL_ACCESS"
        ? "Unlocked"
        : status === "LIMIT_REACHED"
          ? "Limit Reached"
          : "Preview",
    paymentState:
      status === "FULL_ACCESS"
        ? "Paid"
        : status === "LIMIT_REACHED"
          ? "Limit Reached"
          : "Preview",
    generatedAtLabel: formatDateTimeLabel(record.createdAt),
    updatedAtLabel: formatDateTimeLabel(record.updatedAt),
    detailHref: `/admin/reports/${record.id}`,
    planType: toStringValue(input?.planType),
    promptVersionLabel: record.promptVersionLabel,
    providerKey: record.providerKey,
    normalizedOutputState: status,
  } satisfies AdminReportDetail;
}

export async function getAdminContentOverview(): Promise<AdminContentOverview> {
  const [articles, liveEntries] = await Promise.all([
    getPrisma().article.findMany({
      take: 24,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    }),
    getContentAdapter().listPublishedEntries(),
  ]);

  const publishedCatalogEntries = liveEntries.map(toContentSummary);
  const rashifalEntries = publishedCatalogEntries.filter(
    (entry) => entry.type === "DAILY_RASHIFAL"
  );
  const draftRashifalTemplates = curatedContentEntries
    .filter((entry) => entry.type === "DAILY_RASHIFAL" && entry.status !== "published")
    .map(toContentSummary);

  return {
    articles: articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      authorName: article.author?.name ?? "Unassigned",
      updatedAtLabel: formatDateTimeLabel(article.updatedAt),
    })),
    publishedCatalogEntries,
    rashifalEntries,
    draftRashifalTemplates,
  };
}

export async function getAdminHealthOverview(): Promise<AdminHealthOverview> {
  const metrics = await getAdminLaunchMetrics();

  return {
    generatedAtLabel: formatDateTimeLabel(new Date()),
    counts: metrics,
    readySignals: [
      "Admin access is enforced server-side through role checks.",
      "Pure white admin surfaces are scoped to the internal shell only.",
      "Operational views avoid exposing raw chart, prompt, or payment secrets.",
    ],
    followUps: [
      "Add richer create/edit content workflows in a later phase if editorial speed becomes a bottleneck.",
      "Expand the report ledger only if a persistent report history table is introduced later.",
      "Keep destructive admin actions behind confirmation flows and audit logging.",
    ],
  };
}
