import "server-only";

import { ConsultationStatus } from "@prisma/client";
import { getCurrentCycleSummary } from "@/lib/ai/current-cycle";
import { getPrisma } from "@/lib/prisma";
import { getChartOverview } from "@/modules/onboarding/service";
import { getRemedyRecommendationService } from "@/modules/remedies/service";

const remedyFollowUpWindowDays = 7;
const timingFollowUpWindowDays = 14;
const rebookingWindowDays = 21;

export const postConsultationRetentionStateKeys = [
  "SESSION_COMPLETED",
  "REPORT_DELIVERED",
  "REMEDY_FOLLOW_UP_DUE",
  "TIMING_FOLLOW_UP_RECOMMENDED",
  "REBOOKING_OPPORTUNITY",
] as const;

export type PostConsultationRetentionStateKey =
  (typeof postConsultationRetentionStateKeys)[number];

export type PostConsultationRetentionStateStatus =
  | "ACHIEVED"
  | "ACTION_DUE"
  | "NOT_READY";

export type PostConsultationRetentionState = {
  key: PostConsultationRetentionStateKey;
  status: PostConsultationRetentionStateStatus;
  title: string;
  summary: string;
  dueAtUtc: string | null;
  href: string | null;
  supportingSignals: string[];
};

export type NextRecommendedMemberActionKey =
  | "COMPLETE_FIRST_CONSULTATION"
  | "OPEN_REPORT"
  | "REVIEW_REMEDY_FOLLOW_UP"
  | "REVIEW_CURRENT_TIMING"
  | "BOOK_FOLLOW_UP_CONSULTATION"
  | "NO_IMMEDIATE_ACTION";

export type NextRecommendedMemberAction = {
  key: NextRecommendedMemberActionKey;
  title: string;
  description: string;
  href: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  rationale: string;
};

export type PostConsultationRetentionSnapshot = {
  status: "pending-session" | "ready";
  generatedAtUtc: string;
  consultation: {
    id: string;
    confirmationCode: string;
    serviceLabel: string;
    completedAtUtc: string;
  } | null;
  states: PostConsultationRetentionState[];
  nextRecommendedAction: NextRecommendedMemberAction;
  context: {
    chartReady: boolean;
    currentCycleStatus: "ready" | "unavailable";
    cautionWindowCount: number;
    topRemedySlugs: string[];
  };
};

function addDays(baseDate: Date, days: number) {
  return new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
}

function daysSince(date: Date, now = new Date()) {
  return (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
}

function getCompletionAnchor(consultation: {
  scheduledEnd: Date | null;
  scheduledFor: Date | null;
  updatedAt: Date;
}) {
  return consultation.scheduledEnd ?? consultation.scheduledFor ?? consultation.updatedAt;
}

function createPendingSessionSnapshot(): PostConsultationRetentionSnapshot {
  return {
    status: "pending-session",
    generatedAtUtc: new Date().toISOString(),
    consultation: null,
    states: [
      {
        key: "SESSION_COMPLETED",
        status: "ACTION_DUE",
        title: "Session completed",
        summary:
          "Post-consultation retention starts after at least one consultation is marked completed.",
        dueAtUtc: null,
        href: "/dashboard/consultations/book",
        supportingSignals: [],
      },
      {
        key: "REPORT_DELIVERED",
        status: "NOT_READY",
        title: "Report delivered",
        summary:
          "A post-session report state appears after a completed consultation and stored chart context.",
        dueAtUtc: null,
        href: "/dashboard/report",
        supportingSignals: [],
      },
      {
        key: "REMEDY_FOLLOW_UP_DUE",
        status: "NOT_READY",
        title: "Remedy follow-up due",
        summary:
          "Remedy follow-up reminders are activated only after a completed session and approved chart grounding.",
        dueAtUtc: null,
        href: "/dashboard/report",
        supportingSignals: [],
      },
      {
        key: "TIMING_FOLLOW_UP_RECOMMENDED",
        status: "NOT_READY",
        title: "Timing follow-up recommended",
        summary:
          "Timing follow-up appears when completed consultation context and current-cycle data are both available.",
        dueAtUtc: null,
        href: "/dashboard",
        supportingSignals: [],
      },
      {
        key: "REBOOKING_OPPORTUNITY",
        status: "NOT_READY",
        title: "Rebooking opportunity",
        summary:
          "Follow-up rebooking guidance appears after a completed consultation history exists.",
        dueAtUtc: null,
        href: "/dashboard/consultations/book",
        supportingSignals: [],
      },
    ],
    nextRecommendedAction: {
      key: "COMPLETE_FIRST_CONSULTATION",
      title: "Complete your first consultation",
      description:
        "Book and complete a consultation so retention guidance can track report, remedy, and timing follow-up safely.",
      href: "/dashboard/consultations/book",
      priority: "HIGH",
      rationale:
        "No completed consultation is on file yet, so post-session retention should not infer next steps.",
    },
    context: {
      chartReady: false,
      currentCycleStatus: "unavailable",
      cautionWindowCount: 0,
      topRemedySlugs: [],
    },
  };
}

export async function getPostConsultationRetentionSnapshot(
  userId: string
): Promise<PostConsultationRetentionSnapshot> {
  const prisma = getPrisma();
  const latestCompletedConsultation = await prisma.consultation.findFirst({
    where: {
      userId,
      status: ConsultationStatus.COMPLETED,
    },
    orderBy: [{ scheduledFor: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      confirmationCode: true,
      serviceLabel: true,
      scheduledFor: true,
      scheduledEnd: true,
      updatedAt: true,
    },
  });

  if (!latestCompletedConsultation) {
    return createPendingSessionSnapshot();
  }

  const completionAnchor = getCompletionAnchor(latestCompletedConsultation);
  const [overview, currentCycle] = await Promise.all([
    getChartOverview(userId),
    getCurrentCycleSummary(userId),
  ]);

  const reportDelivered = Boolean(overview.chart && overview.chartRecord);
  const remedyRecommendations =
    overview.chart && overview.chartRecord
      ? await getRemedyRecommendationService().getRecommendations({
          chart: overview.chart,
        })
      : null;
  const followUpRemedies =
    remedyRecommendations?.recommendations.filter(
      (recommendation) =>
        recommendation.priorityTier !== "OPTIONAL" &&
        recommendation.confidenceLabel !== "OPTIONAL_SUPPORT"
    ) ?? [];
  const remedyFollowUpDue = followUpRemedies.length > 0;
  const timingFollowUpRecommended =
    currentCycle.status === "ready" &&
    (currentCycle.synthesis.cautionWindows.length > 0 ||
      currentCycle.synthesis.activeAreas.some(
        (area) => area.intensity === "HIGH"
      ));
  const hasRebookingOpportunity =
    daysSince(completionAnchor) >= rebookingWindowDays ||
    (timingFollowUpRecommended && daysSince(completionAnchor) >= timingFollowUpWindowDays);

  const states: PostConsultationRetentionState[] = [
    {
      key: "SESSION_COMPLETED",
      status: "ACHIEVED",
      title: "Session completed",
      summary:
        "The latest consultation is marked completed and is ready for calm, structured follow-up.",
      dueAtUtc: null,
      href: `/dashboard/consultations/${latestCompletedConsultation.id}`,
      supportingSignals: [latestCompletedConsultation.confirmationCode],
    },
    {
      key: "REPORT_DELIVERED",
      status: reportDelivered ? "ACHIEVED" : "ACTION_DUE",
      title: "Report delivered",
      summary: reportDelivered
        ? "Structured chart report context is available for post-session review."
        : "Open the report surface to complete post-session documentation and context delivery.",
      dueAtUtc: reportDelivered
        ? null
        : addDays(completionAnchor, remedyFollowUpWindowDays).toISOString(),
      href: "/dashboard/report",
      supportingSignals: reportDelivered
        ? [overview.chartRecord?.id ?? "chart-record-ready"]
        : [],
    },
    {
      key: "REMEDY_FOLLOW_UP_DUE",
      status: !reportDelivered
        ? "NOT_READY"
        : remedyFollowUpDue
          ? "ACTION_DUE"
          : "ACHIEVED",
      title: "Remedy follow-up due",
      summary: !reportDelivered
        ? "Remedy follow-up remains on hold until chart report context is available."
        : remedyFollowUpDue
          ? "Approved remedy guidance should now be reviewed as gentle post-session follow-up."
          : "No urgent remedy follow-up is currently required beyond steady practice.",
      dueAtUtc:
        reportDelivered && remedyFollowUpDue
          ? addDays(completionAnchor, remedyFollowUpWindowDays).toISOString()
          : null,
      href: "/dashboard/report",
      supportingSignals: followUpRemedies
        .slice(0, 3)
        .map((recommendation) => recommendation.slug),
    },
    {
      key: "TIMING_FOLLOW_UP_RECOMMENDED",
      status:
        currentCycle.status !== "ready"
          ? "NOT_READY"
          : timingFollowUpRecommended
            ? "ACTION_DUE"
            : "ACHIEVED",
      title: "Timing follow-up recommended",
      summary:
        currentCycle.status !== "ready"
          ? "Current timing context is unavailable, so this follow-up remains paused."
          : timingFollowUpRecommended
            ? "Current cycle timing shows meaningful emphasis that is worth a follow-up review."
            : "Timing indicators are stable and do not require immediate follow-up.",
      dueAtUtc:
        currentCycle.status === "ready" && timingFollowUpRecommended
          ? addDays(completionAnchor, timingFollowUpWindowDays).toISOString()
          : null,
      href: "/dashboard",
      supportingSignals:
        currentCycle.status === "ready"
          ? currentCycle.synthesis.timeSensitiveHighlights.slice(0, 3)
          : [],
    },
    {
      key: "REBOOKING_OPPORTUNITY",
      status: hasRebookingOpportunity ? "ACTION_DUE" : "ACHIEVED",
      title: "Rebooking opportunity",
      summary: hasRebookingOpportunity
        ? "A follow-up session window is open for deeper clarification and refinement."
        : "No immediate rebooking pressure; review current guidance first and return when needed.",
      dueAtUtc: hasRebookingOpportunity
        ? addDays(completionAnchor, rebookingWindowDays).toISOString()
        : null,
      href: "/dashboard/consultations/book",
      supportingSignals: hasRebookingOpportunity
        ? [latestCompletedConsultation.serviceLabel]
        : [],
    },
  ];

  const nextRecommendedAction: NextRecommendedMemberAction = !reportDelivered
    ? {
        key: "OPEN_REPORT",
        title: "Review your post-session report",
        description:
          "Open your report to anchor follow-up guidance in structured chart and consultation context.",
        href: "/dashboard/report",
        priority: "HIGH",
        rationale:
          "Report context should be completed before remedy or timing follow-up is emphasized.",
      }
    : remedyFollowUpDue
      ? {
          key: "REVIEW_REMEDY_FOLLOW_UP",
          title: "Review remedy follow-up",
          description:
            "Revisit approved remedies first and focus on practical, non-absolute implementation.",
          href: "/dashboard/report",
          priority: "HIGH",
          rationale:
            "Primary/supportive remedy guidance is available and now due for post-session follow-up.",
        }
      : timingFollowUpRecommended
        ? {
            key: "REVIEW_CURRENT_TIMING",
            title: "Review current timing context",
            description:
              "Check the current-cycle section for active themes, caution windows, and follow-up focus areas.",
            href: "/dashboard",
            priority: "MEDIUM",
            rationale:
              "Dasha and transit synthesis shows timing signals that should be reviewed with perspective.",
          }
        : hasRebookingOpportunity
          ? {
              key: "BOOK_FOLLOW_UP_CONSULTATION",
              title: "Book a follow-up consultation",
              description:
                "If you want deeper interpretation, schedule a follow-up session for personalized refinement.",
              href: "/dashboard/consultations/book",
              priority: "MEDIUM",
              rationale:
                "Enough time has passed since completion to make a follow-up session useful.",
            }
          : {
              key: "NO_IMMEDIATE_ACTION",
              title: "Continue steady integration",
              description:
                "No urgent post-session action is required right now. Continue with measured follow-through.",
              href: "/dashboard/consultations",
              priority: "LOW",
              rationale:
                "Current report, remedy, and timing signals do not indicate a near-term escalation.",
            };

  return {
    status: "ready",
    generatedAtUtc: new Date().toISOString(),
    consultation: {
      id: latestCompletedConsultation.id,
      confirmationCode: latestCompletedConsultation.confirmationCode,
      serviceLabel: latestCompletedConsultation.serviceLabel,
      completedAtUtc: completionAnchor.toISOString(),
    },
    states,
    nextRecommendedAction,
    context: {
      chartReady: reportDelivered,
      currentCycleStatus: currentCycle.status,
      cautionWindowCount:
        currentCycle.status === "ready"
          ? currentCycle.synthesis.cautionWindows.length
          : 0,
      topRemedySlugs: followUpRemedies
        .slice(0, 3)
        .map((recommendation) => recommendation.slug),
    },
  };
}

export async function getNextRecommendedMemberAction(userId: string) {
  const snapshot = await getPostConsultationRetentionSnapshot(userId);

  return snapshot.nextRecommendedAction;
}
