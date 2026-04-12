import "server-only";

import { getSubscriptionPlan } from "@/modules/subscriptions/plans";
import { getSubscriptionService } from "@/modules/subscriptions/service";
import type {
  SubscriptionAccessSnapshot,
  SubscriptionFeatureKey,
  SubscriptionPlanFeatureAccess,
} from "@/modules/subscriptions/types";

function createEmptyFeatureAccess(): SubscriptionPlanFeatureAccess {
  return {
    DAILY_PERSONALIZED_INSIGHTS: false,
    TIMING_ALERTS: false,
    PREMIUM_REPORTS_ACCESS: false,
    PRIORITY_CONSULTATION_ACCESS: false,
  };
}

export async function getSubscriptionAccessSnapshot(
  userId: string
): Promise<SubscriptionAccessSnapshot> {
  const subscription = await getSubscriptionService().getActiveSubscription(userId);

  if (!subscription) {
    return {
      isSubscribed: false,
      plan: null,
      subscription: null,
      features: createEmptyFeatureAccess(),
      usageLimits: {},
    };
  }

  const plan = getSubscriptionPlan(subscription.planId);

  return {
    isSubscribed: true,
    plan,
    subscription,
    features: plan.featureAccess,
    usageLimits: plan.usageLimits,
  };
}

export async function isUserSubscribed(userId: string) {
  return getSubscriptionService().hasActiveSubscription(userId);
}

export async function getUserSubscriptionPlan(userId: string) {
  const access = await getSubscriptionAccessSnapshot(userId);

  return access.plan;
}

export async function canUseSubscriptionFeature(
  userId: string,
  feature: SubscriptionFeatureKey
) {
  const access = await getSubscriptionAccessSnapshot(userId);

  return access.features[feature];
}
