import "server-only";

import { ChartStatus, ChartType, type AiMessageRole, type Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getPreferredLanguageLabel } from "@/modules/onboarding/constants";
import {
  formatConsultationScheduleLine,
  getUserConsultations,
  type ConsultationListItem,
} from "@/modules/consultations/service";
import { ensureUserProfile } from "@/modules/account/service";

export type DashboardAiCategory =
  | "career"
  | "marriage"
  | "finance"
  | "daily guidance"
  | "general";

export type DashboardAiHistoryItem = {
  id: string;
  question: string;
  responsePreview: string;
  category: DashboardAiCategory;
  updatedAtUtc: string;
  resumeHref: string;
};

export type DashboardSavedReportItem = {
  id: string;
  title: string;
  statusLabel: "Ready" | "Preview" | "Limit Reached";
  generatedAtUtc: string;
  viewHref: string;
  downloadHref: string | null;
};

export type DashboardCompatibilityHistoryItem = {
  id: string;
  pairLabel: string;
  generatedAtUtc: string;
  quickResultSummary: string;
  reopenHref: string;
};

export type DashboardConsultationHistory = {
  upcoming: Array<{
    id: string;
    label: string;
    scheduleLine: string;
    status: ConsultationListItem["status"];
    openHref: string;
  }>;
  past: Array<{
    id: string;
    label: string;
    completedLine: string;
    followUpNote: string | null;
    openHref: string;
  }>;
  preparationGuidance: readonly string[];
  followUpNotes: string[];
};

export type DashboardPreferencePrep = {
  dailyUpdates: boolean;
  consultationReminders: boolean;
  aiSuggestions: boolean;
  serviceAnnouncements: boolean;
  timezone: string;
  language: string;
  communicationPreference: string;
  settingsHref: string;
};

export type DashboardEcosystemData = {
  aiHistory: DashboardAiHistoryItem[];
  savedReports: DashboardSavedReportItem[];
  compatibilityHistory: DashboardCompatibilityHistoryItem[];
  consultationHistory: DashboardConsultationHistory;
  preferences: DashboardPreferencePrep;
};

type ConversationRecord = {
  id: string;
  title: string | null;
  updatedAt: Date;
  messages: Array<{
    role: AiMessageRole;
    content: string;
    createdAt: Date;
  }>;
};

type ReportRunRecord = {
  id: string;
  createdAt: Date;
  outputPayload: Prisma.JsonValue | null;
  inputPayload: Prisma.JsonValue | null;
};

type CompatibilityChartRecord = {
  id: string;
  generatedAt: Date | null;
  updatedAt: Date;
  chartPayload: Prisma.JsonValue | null;
};

function toObjectRecord(value: Prisma.JsonValue | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizePreview(value: string, maxLength = 120) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "No response preview available yet.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
}

function inferAiCategory(sourceText: string): DashboardAiCategory {
  const normalized = sourceText.toLowerCase();

  if (/\b(career|job|promotion|profession|work)\b/.test(normalized)) {
    return "career";
  }

  if (/\b(marriage|relationship|partner|compatibility|love)\b/.test(normalized)) {
    return "marriage";
  }

  if (/\b(finance|money|wealth|income|business)\b/.test(normalized)) {
    return "finance";
  }

  if (/\b(daily|today|current cycle|day)\b/.test(normalized)) {
    return "daily guidance";
  }

  return "general";
}

function mapConversationToHistoryItem(record: ConversationRecord): DashboardAiHistoryItem {
  const latestUserMessage = record.messages.find((message) => message.role === "USER");
  const latestAssistantMessage = record.messages.find(
    (message) => message.role === "ASSISTANT"
  );

  const question =
    normalizePreview(
      latestUserMessage?.content ??
        record.title ??
        "Continue your chart conversation."
    );
  const responsePreview = normalizePreview(
    latestAssistantMessage?.content ??
      "Structured chart-aware response will appear after your first question."
  );

  return {
    id: record.id,
    question,
    responsePreview,
    category: inferAiCategory(`${question} ${record.title ?? ""}`),
    updatedAtUtc: record.updatedAt.toISOString(),
    resumeHref: `/dashboard/ask-my-chart?session=${record.id}`,
  };
}

function toReportTitle(reportType: string | null) {
  switch (reportType) {
    case "CAREER":
      return "Career Report";
    case "MARRIAGE":
      return "Marriage Report";
    case "FINANCE":
      return "Finance Report";
    case "HEALTH":
      return "Health Report";
    default:
      return "Premium Report";
  }
}

function mapReportRunToSavedReportItem(run: ReportRunRecord): DashboardSavedReportItem {
  const inputPayload = toObjectRecord(run.inputPayload);
  const outputPayload = toObjectRecord(run.outputPayload);
  const reportType = toStringValue(inputPayload?.reportType) ?? null;
  const reportStatus = toStringValue(outputPayload?.status) ?? "PREVIEW_LOCKED";
  const statusLabel =
    reportStatus === "FULL_ACCESS"
      ? "Ready"
      : reportStatus === "LIMIT_REACHED"
        ? "Limit Reached"
        : "Preview";

  return {
    id: run.id,
    title: toReportTitle(reportType),
    statusLabel,
    generatedAtUtc: run.createdAt.toISOString(),
    viewHref: "/dashboard/report",
    downloadHref:
      reportStatus === "FULL_ACCESS"
        ? `/dashboard/report?download=${reportType?.toLowerCase() ?? "latest"}`
        : null,
  };
}

function mapCompatibilityChartToHistoryItem(
  chart: CompatibilityChartRecord,
  index: number
): DashboardCompatibilityHistoryItem {
  const payload = toObjectRecord(chart.chartPayload);
  const summaryRecord = toObjectRecord(payload?.summary as Prisma.JsonValue | null);
  const narrative = toStringValue(summaryRecord?.narrative);
  const subjects = Array.isArray((payload?.subjects as unknown[] | undefined))
    ? (payload?.subjects as unknown[])
    : [];
  const subjectNames = subjects
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const candidate = toStringValue((item as Record<string, unknown>).name);

      return candidate;
    })
    .filter((value): value is string => Boolean(value));
  const pairLabel =
    subjectNames.length >= 2
      ? `${subjectNames[0]} + ${subjectNames[1]}`
      : `Compatibility Pair ${index + 1}`;

  return {
    id: chart.id,
    pairLabel,
    generatedAtUtc: (chart.generatedAt ?? chart.updatedAt).toISOString(),
    quickResultSummary:
      narrative ??
      "Saved compatibility context is available for review and continuation.",
    reopenHref: "/compatibility",
  };
}

function buildConsultationHistory(
  consultations: ConsultationListItem[]
): DashboardConsultationHistory {
  const now = Date.now();
  const upcoming: DashboardConsultationHistory["upcoming"] = [];
  const past: DashboardConsultationHistory["past"] = [];

  consultations.forEach((consultation) => {
    const scheduledMs = consultation.scheduledForUtc
      ? Date.parse(consultation.scheduledForUtc)
      : Number.NaN;
    const hasPastSchedule = Number.isFinite(scheduledMs) && scheduledMs < now;
    const isPast =
      consultation.status === "COMPLETED" ||
      consultation.status === "CANCELLED" ||
      hasPastSchedule;
    const scheduleLine = formatConsultationScheduleLine(
      consultation.scheduledForUtc,
      consultation.scheduledEndUtc,
      consultation.clientTimezone
    );

    if (isPast) {
      past.push({
        id: consultation.id,
        label: consultation.serviceLabel,
        completedLine: scheduleLine,
        followUpNote: consultation.intakeSummary ?? consultation.topicFocus ?? null,
        openHref: `/dashboard/consultations/${consultation.id}`,
      });
    } else {
      upcoming.push({
        id: consultation.id,
        label: consultation.serviceLabel,
        scheduleLine,
        status: consultation.status,
        openHref: `/dashboard/consultations/${consultation.id}`,
      });
    }
  });

  return {
    upcoming: upcoming.slice(0, 3),
    past: past.slice(0, 3),
    preparationGuidance: [
      "Bring one clear topic focus and one practical outcome you want from the session.",
      "Review your chart and recent AI notes before the session for stronger continuity.",
      "Note follow-up questions in advance so guidance can stay specific and actionable.",
    ],
    followUpNotes: past
      .map((item) => item.followUpNote)
      .filter((value): value is string => Boolean(value))
      .slice(0, 3),
  };
}

export function createEmptyDashboardEcosystemData(): DashboardEcosystemData {
  return {
    aiHistory: [],
    savedReports: [],
    compatibilityHistory: [],
    consultationHistory: {
      upcoming: [],
      past: [],
      preparationGuidance: [
        "Prepare your topic focus before booking so guidance can stay specific.",
      ],
      followUpNotes: [],
    },
    preferences: {
      dailyUpdates: true,
      consultationReminders: true,
      aiSuggestions: true,
      serviceAnnouncements: true,
      timezone: "Pending",
      language: "English",
      communicationPreference: "Email updates",
      settingsHref: "/settings",
    },
  };
}

export async function getDashboardEcosystemData(
  userId: string
): Promise<DashboardEcosystemData> {
  const prisma = getPrisma();
  const [profile, aiConversations, reportRuns, compatibilityCharts, consultations] =
    await Promise.all([
      ensureUserProfile(userId),
      prisma.aiConversationSession.findMany({
        where: {
          userId,
          channelKey: "ask-my-chart",
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 6,
        select: {
          id: true,
          title: true,
          updatedAt: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 6,
            select: {
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.aiTaskRun.findMany({
        where: {
          userId,
          taskKind: "CONTENT_DRAFT_GENERATION",
          status: "SUCCEEDED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
        select: {
          id: true,
          createdAt: true,
          inputPayload: true,
          outputPayload: true,
        },
      }),
      prisma.chart.findMany({
        where: {
          userId,
          type: ChartType.COMPATIBILITY,
          status: ChartStatus.READY,
        },
        orderBy: [{ generatedAt: "desc" }, { updatedAt: "desc" }],
        take: 6,
        select: {
          id: true,
          generatedAt: true,
          updatedAt: true,
          chartPayload: true,
        },
      }),
      getUserConsultations(userId),
    ]);

  return {
    aiHistory: aiConversations.map(mapConversationToHistoryItem),
    savedReports: reportRuns.map(mapReportRunToSavedReportItem),
    compatibilityHistory: compatibilityCharts.map(mapCompatibilityChartToHistoryItem),
    consultationHistory: buildConsultationHistory(consultations),
    preferences: {
      dailyUpdates: true,
      consultationReminders: Boolean(profile.timezone),
      aiSuggestions: true,
      serviceAnnouncements: true,
      timezone: profile.timezone ?? "Not set",
      language: getPreferredLanguageLabel(profile.preferredLanguage),
      communicationPreference: profile.phone
        ? "Email and phone updates"
        : "Email updates",
      settingsHref: "/settings",
    },
  };
}

