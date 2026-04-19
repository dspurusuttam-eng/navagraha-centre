import "server-only";

import { getPrisma } from "@/lib/prisma";
import type { ChartInsights, GeneratedUserReport } from "@/lib/ai/types";
import type { ChartOverview } from "@/modules/onboarding/service";
import type {
  SubscriptionRetentionIntelligenceSnapshot,
  UserPlanModel,
} from "@/modules/subscriptions";
import type {
  RetentionDashboardSnapshot,
  RetentionLifecycleStage,
} from "@/modules/retention/types";

const premiumInactiveDaysThreshold = 10;

type GetRetentionDashboardSnapshotInput = {
  userId: string;
  chartOverview: ChartOverview;
  insights: ChartInsights;
  report: GeneratedUserReport;
  subscriptionState: SubscriptionRetentionIntelligenceSnapshot;
  userPlan: UserPlanModel;
};

function getDaysSince(value: Date | null) {
  if (!value) {
    return null;
  }

  return Math.floor((Date.now() - value.getTime()) / (1000 * 60 * 60 * 24));
}

function getLifecycleStage(input: {
  hasChart: boolean;
  assistantSessionCount: number;
  subscriptionState: SubscriptionRetentionIntelligenceSnapshot;
  daysSinceAssistantActivity: number | null;
}): RetentionLifecycleStage {
  if (!input.hasChart) {
    return "SIGNED_UP_NO_CHART";
  }

  if (
    input.subscriptionState.lifecycleState === "EXPIRED" ||
    input.subscriptionState.lifecycleState === "CANCELLED" ||
    input.subscriptionState.lifecycleState === "PAUSED"
  ) {
    return "PREMIUM_EXPIRED";
  }

  if (input.assistantSessionCount === 0) {
    return "CHART_READY_NO_ASSISTANT";
  }

  if (!input.subscriptionState.access.isSubscribed) {
    return "ASSISTANT_USED_NO_PREMIUM";
  }

  if (
    input.daysSinceAssistantActivity === null ||
    input.daysSinceAssistantActivity >= premiumInactiveDaysThreshold
  ) {
    return "PREMIUM_INACTIVE";
  }

  return "PREMIUM_ACTIVE";
}

function getLifecycleLabel(stage: RetentionLifecycleStage) {
  switch (stage) {
    case "SIGNED_UP_NO_CHART":
      return "Chart Setup Pending";
    case "CHART_READY_NO_ASSISTANT":
      return "Chart Ready";
    case "ASSISTANT_USED_NO_PREMIUM":
      return "Free Member";
    case "PREMIUM_ACTIVE":
      return "Premium Active";
    case "PREMIUM_INACTIVE":
      return "Premium Paused";
    case "PREMIUM_EXPIRED":
      return "Premium Expired";
  }
}

function buildDailyInsight(
  input: GetRetentionDashboardSnapshotInput,
  stage: RetentionLifecycleStage
) {
  if (stage === "SIGNED_UP_NO_CHART") {
    return {
      title: "Today's Insight",
      summary:
        "Your chart foundation is still incomplete, so the dashboard is holding back deeper interpretation intentionally.",
      supportingLine:
        "Complete your birth profile once to unlock chart-backed daily and assistant guidance.",
    };
  }

  if (input.subscriptionState.access.isSubscribed) {
    const premiumDetail =
      input.report.currentCycle.guidanceCalendar.overview ||
      input.report.currentCycle.synthesis.followUpThemes[0]?.note ||
      input.insights.summary;

    return {
      title: "Today's Insight",
      summary: premiumDetail,
      supportingLine:
        "Premium timing and report continuity are available whenever you want a deeper follow-up.",
    };
  }

  return {
    title: "Today's Insight",
    summary:
      input.report.currentCycle.status === "ready"
        ? input.report.currentCycle.synthesis.overview
        : input.insights.summary,
    supportingLine:
      "Free access keeps the daily surface light. Deeper timing layers remain optional.",
  };
}

function buildCurrentEnergy(input: GetRetentionDashboardSnapshotInput) {
  const currentCycle = input.report.currentCycle;

  if (currentCycle.status === "ready" && currentCycle.synthesis.activeAreas[0]) {
    const activeArea = currentCycle.synthesis.activeAreas[0];

    return {
      title: "Current Energy",
      summary: activeArea.summary,
      supportingLine: activeArea.timeframeLabel,
    };
  }

  if (input.chartOverview.chart) {
    return {
      title: "Current Energy",
      summary:
        "Your chart is ready, but today’s timing layer is currently lighter than the saved natal context.",
      supportingLine:
        input.insights.recommendations[0] ??
        "Return to Ask My Chart when you want to clarify what feels active.",
    };
  }

  return {
    title: "Current Energy",
    summary:
      "A clearer energy snapshot appears after the chart has been generated and saved.",
    supportingLine:
      "The onboarding flow will unlock the timing layer once birth details are complete.",
  };
}

function buildRecommendedNextStep(
  input: GetRetentionDashboardSnapshotInput,
  stage: RetentionLifecycleStage
) {
  switch (stage) {
    case "SIGNED_UP_NO_CHART":
      return {
        title: "Complete your chart to unlock insights.",
        summary:
          "The protected chart, report, and assistant surfaces all become more useful after the first chart is saved.",
        href: "/dashboard/onboarding",
        ctaLabel: input.chartOverview.birthProfile
          ? "Update Birth Details"
          : "Complete Chart Setup",
        emphasis: "FREE" as const,
      };
    case "CHART_READY_NO_ASSISTANT":
      return {
        title: "Ask your chart a question.",
        summary:
          "Your chart is already stored. The next useful step is usually one focused question in Ask My Chart.",
        href: "/dashboard/ask-my-chart",
        ctaLabel: "Use Ask My Chart",
        emphasis: "FREE" as const,
      };
    case "ASSISTANT_USED_NO_PREMIUM":
      return {
        title: "Unlock deeper guidance when the free layer feels too light.",
        summary:
          input.subscriptionState.recommendation?.summary ??
          "Your recent assistant usage suggests that deeper report and timing continuity may now be useful.",
        href: input.subscriptionState.recommendation?.href ?? "/settings",
        ctaLabel:
          input.subscriptionState.recommendation?.ctaLabel ??
          "Review Membership",
        emphasis: "PREMIUM" as const,
      };
    case "PREMIUM_ACTIVE":
      return {
        title: "Continue with your premium insight rhythm.",
        summary:
          input.report.currentCycle.synthesis.followUpThemes[0]?.note ??
          "Use your current plan to continue with report depth, timing context, and assistant follow-up.",
        href: "/dashboard/report",
        ctaLabel: "Open Premium Insights",
        emphasis: "PREMIUM" as const,
      };
    case "PREMIUM_INACTIVE":
      return {
        title: "Your premium insights are waiting.",
        summary:
          "Your premium access is active, but recent assistant use has gone quiet. A short return through report or Ask My Chart is the cleanest next step.",
        href: "/dashboard/report",
        ctaLabel: "Resume Premium Flow",
        emphasis: "PREMIUM" as const,
      };
    case "PREMIUM_EXPIRED":
      return {
        title: "Resume continuity if premium depth is still useful.",
        summary:
          input.subscriptionState.nudge.summary ||
          "You can continue free, or renew premium access when deeper chart continuity matters again.",
        href: input.subscriptionState.recommendation?.href ?? "/settings",
        ctaLabel:
          input.subscriptionState.recommendation?.ctaLabel ??
          "Review Membership",
        emphasis: "PREMIUM" as const,
      };
  }
}

export async function getRetentionDashboardSnapshot(
  input: GetRetentionDashboardSnapshotInput
): Promise<RetentionDashboardSnapshot> {
  const prisma = getPrisma();
  const [assistantSessionCount, lastAssistantSession] = await Promise.all([
    prisma.aiConversationSession.count({
      where: {
        userId: input.userId,
        channelKey: "ask-my-chart",
      },
    }),
    prisma.aiConversationSession.findFirst({
      where: {
        userId: input.userId,
        channelKey: "ask-my-chart",
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        updatedAt: true,
      },
    }),
  ]);

  const hasChart = Boolean(input.chartOverview.chart && input.chartOverview.chartRecord);
  const daysSinceAssistantActivity = getDaysSince(
    lastAssistantSession?.updatedAt ?? null
  );
  const lifecycleStage = getLifecycleStage({
    hasChart,
    assistantSessionCount,
    subscriptionState: input.subscriptionState,
    daysSinceAssistantActivity,
  });

  return {
    generatedAtUtc: new Date().toISOString(),
    lifecycleStage,
    lifecycleLabel: getLifecycleLabel(lifecycleStage),
    dailyInsight: buildDailyInsight(input, lifecycleStage),
    currentEnergy: buildCurrentEnergy(input),
    recommendedNextStep: buildRecommendedNextStep(input, lifecycleStage),
    activity: {
      hasChart,
      hasAssistantUsage: assistantSessionCount > 0,
      assistantSessionCount,
      lastAssistantActivityUtc:
        lastAssistantSession?.updatedAt.toISOString() ?? null,
      daysSinceAssistantActivity,
      isSubscribed: input.subscriptionState.access.isSubscribed,
      subscriptionLifecycle: input.subscriptionState.lifecycleState,
    },
    analytics: {
      showChartIncompleteNudge: lifecycleStage === "SIGNED_UP_NO_CHART",
      showPremiumFollowupNudge:
        lifecycleStage === "PREMIUM_ACTIVE" ||
        lifecycleStage === "PREMIUM_INACTIVE" ||
        lifecycleStage === "PREMIUM_EXPIRED",
    },
  };
}
