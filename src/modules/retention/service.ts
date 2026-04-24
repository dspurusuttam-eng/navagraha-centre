import "server-only";

import { getPrisma } from "@/lib/prisma";
import type { ChartInsights, GeneratedUserReport } from "@/lib/ai/types";
import type { ChartOverview } from "@/modules/onboarding/service";
import { calculateDailyPanchangContext } from "@/modules/panchang";
import type {
  SubscriptionRetentionIntelligenceSnapshot,
  UserPlanModel,
} from "@/modules/subscriptions";
import type {
  RetentionDashboardSnapshot,
  RetentionLifecycleStage,
  RetentionPanchangSurface,
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

function getTodayDateInTimeZone(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (!year || !month || !day) {
      return null;
    }

    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

function createFallbackPanchangSurface(): RetentionPanchangSurface {
  return {
    isAvailable: false,
    asOfDate: null,
    locationLabel: null,
    highlight:
      "Daily Panchang highlights become available after adding a location-ready profile.",
    spiritualTone:
      "Use Panchang as a calm daily timing reference before deeper chart interpretation.",
    suitableFocus:
      "Check Tithi, Nakshatra, and transition windows for practical day planning.",
    returnPromptTitle: "Revisit today’s Panchang",
    returnPromptSummary:
      "Open Panchang to generate today’s timing context for your selected place.",
    returnPromptHref: "/panchang",
    returnPromptCtaLabel: "Open Panchang",
  };
}

function buildPanchangRetentionSurface(
  input: GetRetentionDashboardSnapshotInput
): RetentionPanchangSurface {
  const profile = input.chartOverview.birthProfile;
  const latitude = profile?.latitude;
  const longitude = profile?.longitude;

  if (
    !profile ||
    !profile.timezone ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return createFallbackPanchangSurface();
  }

  const dateLocal = getTodayDateInTimeZone(profile.timezone);

  if (!dateLocal) {
    return createFallbackPanchangSurface();
  }

  const placeLabel = [profile.city, profile.region, profile.country]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(", ");
  const panchang = calculateDailyPanchangContext({
    dateLocal,
    location: {
      displayName: placeLabel || "Profile location",
      latitude,
      longitude,
      timezoneIana: profile.timezone,
      city: profile.city,
      region: profile.region,
      countryName: profile.country,
    },
  });

  if (!panchang.success) {
    return createFallbackPanchangSurface();
  }

  const firstSpiritualTone = panchang.data.guidance.spiritual_tone[0];
  const firstSuitableFocus = panchang.data.guidance.suitable_focus[0];
  const nextTransition = panchang.data.transitions.next_tithi_change.local_date_time;

  return {
    isAvailable: true,
    asOfDate: panchang.data.as_of_date,
    locationLabel: panchang.data.location.display_name,
    highlight: `${panchang.data.tithi.name} | ${panchang.data.nakshatra.name} | ${panchang.data.yoga.name}`,
    spiritualTone:
      firstSpiritualTone ??
      "Today’s Panchang indicates a measured and reflective rhythm.",
    suitableFocus:
      firstSuitableFocus ??
      "Prioritize practical pacing and clear communication for important decisions.",
    returnPromptTitle: "Return for the next timing shift",
    returnPromptSummary: `Next Tithi transition: ${nextTransition}. Revisit Panchang for updated timing context.`,
    returnPromptHref: "/panchang",
    returnPromptCtaLabel: "Check Panchang",
  };
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
  const panchangSurface = buildPanchangRetentionSurface(input);

  return {
    generatedAtUtc: new Date().toISOString(),
    lifecycleStage,
    lifecycleLabel: getLifecycleLabel(lifecycleStage),
    dailyInsight: buildDailyInsight(input, lifecycleStage),
    currentEnergy: buildCurrentEnergy(input),
    panchang: panchangSurface,
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
      showPanchangReturnPrompt: true,
    },
  };
}
