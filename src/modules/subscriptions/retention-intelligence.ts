import "server-only";

import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCurrentCycleSummary } from "@/lib/ai/current-cycle";
import { getSubscriptionAccessSnapshot } from "@/modules/subscriptions/access";
import { getSubscriptionPlan } from "@/modules/subscriptions/plans";
import { getSubscriptionService } from "@/modules/subscriptions/service";
import type {
  SubscriptionPlanId,
  SubscriptionRecommendationPriority,
  SubscriptionRecommendationReason,
  SubscriptionRetentionIntelligenceSnapshot,
} from "@/modules/subscriptions/types";

const askMyChartChannelKey = "ask-my-chart";
const monthlyWindowDays = 30;

function toSubscriptionPriorityScore(priority: SubscriptionRecommendationPriority) {
  switch (priority) {
    case "HIGH":
      return 92;
    case "MEDIUM":
      return 76;
    default:
      return 60;
  }
}

function getFeatureBenefits(planId: SubscriptionPlanId | null) {
  if (!planId) {
    return [
      "Daily chart summaries remain available in the free workspace.",
      "Timing intelligence and deeper report interpretation can be unlocked when needed.",
    ];
  }

  const plan = getSubscriptionPlan(planId);
  const benefits = [plan.summary];

  if (plan.featureAccess.TIMING_ALERTS) {
    benefits.push("Timing signals stay visible with context-aware reminders.");
  }

  if (plan.featureAccess.PREMIUM_REPORTS_ACCESS) {
    benefits.push("Deeper report interpretation layers are available.");
  }

  if (plan.featureAccess.PRIORITY_CONSULTATION_ACCESS) {
    benefits.push("Priority consultation pathways remain available.");
  }

  return benefits;
}

function formatLifecycleLabel(status: "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED") {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getRecommendationReasonText(reason: SubscriptionRecommendationReason) {
  switch (reason) {
    case "REPEATED_FREE_USAGE":
      return "You are consistently using free member surfaces.";
    case "TIMING_ENGAGEMENT":
      return "Current timing engagement suggests ongoing cycle tracking needs.";
    case "MULTI_REPORT_PURCHASES":
      return "Repeated report purchases indicate sustained premium demand.";
  }
}

function mapReasonTitle(reasons: SubscriptionRecommendationReason[]) {
  if (reasons.includes("MULTI_REPORT_PURCHASES")) {
    return "Consolidate recurring report needs into membership access.";
  }

  if (reasons.includes("TIMING_ENGAGEMENT")) {
    return "Keep timing guidance continuous with membership support.";
  }

  return "Upgrade when your usage is becoming consistently deeper.";
}

function getDefaultNudge() {
  return {
    key: "continue-free-insights",
    title: "Continue with free insights at your own pace.",
    summary:
      "You can keep using the current free workspace and upgrade later only if deeper layers become useful.",
    priority: "LOW" as const,
  } satisfies SubscriptionRetentionIntelligenceSnapshot["nudge"];
}

function createEmptySnapshot(): SubscriptionRetentionIntelligenceSnapshot {
  return {
    generatedAtUtc: new Date().toISOString(),
    lifecycleState: "NO_SUBSCRIPTION",
    access: {
      isSubscribed: false,
      plan: null,
      subscription: null,
      features: {
        DAILY_PERSONALIZED_INSIGHTS: false,
        TIMING_ALERTS: false,
        PREMIUM_REPORTS_ACCESS: false,
        PRIORITY_CONSULTATION_ACCESS: false,
      },
      usageLimits: {},
    },
    latestSubscription: null,
    benefitsSummary: getFeatureBenefits(null),
    recommendation: null,
    nudge: getDefaultNudge(),
    engagementSignals: {
      askMyChartSessionCount: 0,
      transitQuestionCount: 0,
      paidReportOrderCount: 0,
      timingContextReady: false,
      repeatedFreeUsage: false,
      timingEngagement: false,
      multipleReportPurchases: false,
    },
    nextAction: {
      key: "CONTINUE_FREE",
      label: "Continue Free",
      href: "/dashboard",
    },
    featureGates: {
      advancedTimingInsights: false,
      deeperReportLayers: false,
    },
  };
}

export function createFallbackSubscriptionRetentionSnapshot() {
  return createEmptySnapshot();
}

export function toOfferSubscriptionCandidate(
  snapshot: SubscriptionRetentionIntelligenceSnapshot
) {
  if (!snapshot.recommendation) {
    return null;
  }

  return {
    score: toSubscriptionPriorityScore(snapshot.recommendation.priority),
    title: snapshot.recommendation.title,
    summary: snapshot.recommendation.summary,
    description: snapshot.recommendation.reasons
      .map(getRecommendationReasonText)
      .join(" "),
    href: snapshot.recommendation.href,
    ctaLabel: snapshot.recommendation.ctaLabel,
    rationale: mapReasonTitle(snapshot.recommendation.reasons),
    safetyNote:
      "Membership is optional. Continue with free guidance whenever that remains the better fit.",
  };
}

export async function getSubscriptionRetentionIntelligenceSnapshot(
  userId: string
): Promise<SubscriptionRetentionIntelligenceSnapshot> {
  const prisma = getPrisma();
  const access = await getSubscriptionAccessSnapshot(userId);
  const [latestSubscription, currentCycle, askMyChartSessionCount, transitQuestionCount, paidReportOrderCount] =
    await Promise.all([
      getSubscriptionService().getLatestSubscription(userId),
      getCurrentCycleSummary(userId),
      prisma.aiConversationSession.count({
        where: {
          userId,
          channelKey: askMyChartChannelKey,
          createdAt: {
            gte: new Date(Date.now() - monthlyWindowDays * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.aiTaskRun.count({
        where: {
          userId,
          taskKind: "TRANSIT_EXPLANATION",
          status: "SUCCEEDED",
          createdAt: {
            gte: new Date(Date.now() - monthlyWindowDays * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.order.count({
        where: {
          userId,
          status: {
            in: [OrderStatus.PAID, OrderStatus.FULFILLED],
          },
          paymentStatus: PaymentStatus.PAID,
          items: {
            some: {
              titleSnapshot: {
                contains: "report",
                mode: "insensitive",
              },
            },
          },
        },
      }),
    ]);

  const timingContextReady = currentCycle.status === "ready";
  const repeatedFreeUsage = !access.isSubscribed && askMyChartSessionCount >= 4;
  const timingEngagement =
    timingContextReady && (transitQuestionCount >= 2 || askMyChartSessionCount >= 3);
  const multipleReportPurchases = paidReportOrderCount >= 2;

  const lifecycleState = latestSubscription
    ? latestSubscription.status
    : "NO_SUBSCRIPTION";
  const featureGates = {
    advancedTimingInsights:
      Boolean(access.isSubscribed && access.plan && access.plan.id !== "BASIC"),
    deeperReportLayers: access.features.PREMIUM_REPORTS_ACCESS,
  };

  let recommendation: SubscriptionRetentionIntelligenceSnapshot["recommendation"] =
    null;
  let nudge: SubscriptionRetentionIntelligenceSnapshot["nudge"] =
    getDefaultNudge();
  let nextAction: SubscriptionRetentionIntelligenceSnapshot["nextAction"] = {
    key: "CONTINUE_FREE",
    label: "Continue Free",
    href: "/dashboard",
  };

  const reasons: SubscriptionRecommendationReason[] = [];

  if (repeatedFreeUsage) {
    reasons.push("REPEATED_FREE_USAGE");
  }
  if (timingEngagement) {
    reasons.push("TIMING_ENGAGEMENT");
  }
  if (multipleReportPurchases) {
    reasons.push("MULTI_REPORT_PURCHASES");
  }

  if (
    latestSubscription &&
    (latestSubscription.status === "CANCELLED" ||
      latestSubscription.status === "EXPIRED" ||
      latestSubscription.status === "PAUSED")
  ) {
    recommendation = {
      planId: latestSubscription.planId,
      title: `Renew ${getSubscriptionPlan(latestSubscription.planId).title}.`,
      summary:
        "Your previous subscription can be resumed for continued timing and report continuity.",
      ctaLabel: "Renew Membership",
      href: "/settings",
      priority: "HIGH",
      reasons: reasons.length ? reasons : ["REPEATED_FREE_USAGE"],
    };

    nudge = {
      key: "renew-membership",
      title: "Resume continuity where you left off.",
      summary:
        "Renewing keeps your premium insight flow consistent, while staying fully optional.",
      priority: "HIGH",
    };

    nextAction = {
      key: "RENEW",
      label: "Renew Membership",
      href: "/settings",
    };
  } else if (access.isSubscribed && access.plan) {
    const canUpgradeFromBasic =
      access.plan.id === "BASIC" && (timingEngagement || multipleReportPurchases);
    const canUpgradeFromPremium =
      access.plan.id === "PREMIUM" &&
      (multipleReportPurchases || transitQuestionCount >= 3);

    if (canUpgradeFromBasic) {
      recommendation = {
        planId: "PREMIUM",
        title: "Move to Premium Member for deeper report layers.",
        summary:
          "Your engagement pattern suggests you would benefit from richer report and timing depth.",
        ctaLabel: "Upgrade Membership",
        href: "/settings",
        priority: "MEDIUM",
        reasons: reasons.length ? reasons : ["TIMING_ENGAGEMENT"],
      };
      nextAction = {
        key: "UPGRADE",
        label: "Upgrade Plan",
        href: "/settings",
      };
    } else if (canUpgradeFromPremium) {
      recommendation = {
        planId: "PRO",
        title: "Upgrade to Pro Member for priority continuity.",
        summary:
          "Your current usage suggests that priority consultation readiness would be useful next.",
        ctaLabel: "Review Pro Upgrade",
        href: "/settings",
        priority: "MEDIUM",
        reasons: reasons.length ? reasons : ["MULTI_REPORT_PURCHASES"],
      };
      nextAction = {
        key: "UPGRADE",
        label: "Upgrade Plan",
        href: "/settings",
      };
    } else {
      nextAction = {
        key: "CONTINUE_PREMIUM",
        label: "Continue Insights",
        href: "/dashboard/report",
      };
    }

    nudge = {
      key: "continue-insights",
      title: "Continue your insight rhythm.",
      summary: timingContextReady
        ? "Current timing context is active. Continue with steady review and measured follow-up."
        : "Your current plan is active. Continue with steady report and consultation use.",
      priority: recommendation ? recommendation.priority : "LOW",
    };
  } else if (reasons.length) {
    recommendation = {
      planId: "PREMIUM",
      title: "Consider Premium Member access for continuity.",
      summary:
        "Your usage pattern indicates recurring need for deeper timing and report guidance.",
      ctaLabel: "Review Membership",
      href: "/settings",
      priority: reasons.includes("MULTI_REPORT_PURCHASES") ? "HIGH" : "MEDIUM",
      reasons,
    };
    nudge = {
      key: "subscription-contextual",
      title: "Continue your insights with optional membership support.",
      summary:
        "You can keep using free guidance or move to membership when deeper continuity becomes useful.",
      priority: recommendation.priority,
    };
    nextAction = {
      key: "UPGRADE",
      label: "Review Membership",
      href: "/settings",
    };
  }

  return {
    generatedAtUtc: new Date().toISOString(),
    lifecycleState,
    access,
    latestSubscription,
    benefitsSummary: getFeatureBenefits(access.plan?.id ?? null),
    recommendation,
    nudge,
    engagementSignals: {
      askMyChartSessionCount,
      transitQuestionCount,
      paidReportOrderCount,
      timingContextReady,
      repeatedFreeUsage,
      timingEngagement,
      multipleReportPurchases,
    },
    nextAction,
    featureGates,
  };
}

export function getSubscriptionLifecycleLabel(
  snapshot: SubscriptionRetentionIntelligenceSnapshot
) {
  if (snapshot.lifecycleState === "NO_SUBSCRIPTION") {
    return "Free Member";
  }

  return formatLifecycleLabel(snapshot.lifecycleState);
}
