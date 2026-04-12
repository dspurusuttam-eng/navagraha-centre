import type {
  SubscriptionFeatureKey,
  SubscriptionPlanDefinition,
  SubscriptionPlanFeatureAccess,
  SubscriptionPlanId,
} from "@/modules/subscriptions/types";

function createFeatureAccess(
  enabled: readonly SubscriptionFeatureKey[]
): SubscriptionPlanFeatureAccess {
  return {
    DAILY_PERSONALIZED_INSIGHTS: enabled.includes(
      "DAILY_PERSONALIZED_INSIGHTS"
    ),
    TIMING_ALERTS: enabled.includes("TIMING_ALERTS"),
    PREMIUM_REPORTS_ACCESS: enabled.includes("PREMIUM_REPORTS_ACCESS"),
    PRIORITY_CONSULTATION_ACCESS: enabled.includes(
      "PRIORITY_CONSULTATION_ACCESS"
    ),
  };
}

const subscriptionPlanCatalog: Record<SubscriptionPlanId, SubscriptionPlanDefinition> =
  {
    BASIC: {
      id: "BASIC",
      title: "Basic Member",
      summary:
        "Core member tier with essential personalized insight and timing support.",
      featureAccess: createFeatureAccess([
        "DAILY_PERSONALIZED_INSIGHTS",
        "TIMING_ALERTS",
      ]),
      usageLimits: {
        timingAlertsPerMonth: 30,
      },
      eligibilityTags: ["timing", "foundational"],
    },
    PREMIUM: {
      id: "PREMIUM",
      title: "Premium Member",
      summary:
        "Extended member tier for deeper report access and richer timing context.",
      featureAccess: createFeatureAccess([
        "DAILY_PERSONALIZED_INSIGHTS",
        "TIMING_ALERTS",
        "PREMIUM_REPORTS_ACCESS",
      ]),
      usageLimits: {
        timingAlertsPerMonth: 60,
        premiumReportsPerMonth: 4,
      },
      eligibilityTags: ["timing", "reports", "growth"],
    },
    PRO: {
      id: "PRO",
      title: "Pro Member",
      summary:
        "Highest member tier with full report access and priority consultation readiness.",
      featureAccess: createFeatureAccess([
        "DAILY_PERSONALIZED_INSIGHTS",
        "TIMING_ALERTS",
        "PREMIUM_REPORTS_ACCESS",
        "PRIORITY_CONSULTATION_ACCESS",
      ]),
      usageLimits: {
        timingAlertsPerMonth: 90,
        premiumReportsPerMonth: 8,
        priorityConsultationRequestsPerMonth: 4,
      },
      eligibilityTags: ["timing", "reports", "consultation-priority"],
    },
  };

export const subscriptionPlans = Object.values(subscriptionPlanCatalog);

export function isSubscriptionPlanId(value: string): value is SubscriptionPlanId {
  return value in subscriptionPlanCatalog;
}

export function getSubscriptionPlan(planId: SubscriptionPlanId) {
  return subscriptionPlanCatalog[planId];
}

export function getSubscriptionPlans() {
  return subscriptionPlans;
}
