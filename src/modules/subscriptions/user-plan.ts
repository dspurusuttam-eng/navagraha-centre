import "server-only";

import { getSubscriptionService } from "@/modules/subscriptions/service";
import {
  getUpgradeHrefForSurface,
  type MonetizationSurface,
} from "@/modules/subscriptions/monetization-content";
import type { SubscriptionPlanId } from "@/modules/subscriptions/types";

export const userPlanTypes = ["FREE", "PREMIUM", "PRO"] as const;

export type UserPlanType = (typeof userPlanTypes)[number];

export type UserPlanUsageLimits = {
  aiQuestionsPerDay: number | null;
  premiumReportsPerMonth: number | null;
  premiumInsightsEnabled: boolean;
};

export type UserPlanModel = {
  plan_type: UserPlanType;
  plan_expiry: string | null;
  usage_limits: UserPlanUsageLimits;
  source_subscription_plan_id: SubscriptionPlanId | null;
};

const freePlanLimits: UserPlanUsageLimits = {
  aiQuestionsPerDay: 3,
  premiumReportsPerMonth: 1,
  premiumInsightsEnabled: false,
};

const premiumPlanLimits: UserPlanUsageLimits = {
  aiQuestionsPerDay: 60,
  premiumReportsPerMonth: 12,
  premiumInsightsEnabled: true,
};

const proPlanLimits: UserPlanUsageLimits = {
  aiQuestionsPerDay: null,
  premiumReportsPerMonth: null,
  premiumInsightsEnabled: true,
};

function getPlanExpiry(input: {
  nextBillingDateUtc: string | null;
  endDateUtc: string | null;
}) {
  if (input.nextBillingDateUtc) {
    return input.nextBillingDateUtc;
  }

  if (input.endDateUtc) {
    return input.endDateUtc;
  }

  return null;
}

function mapSubscriptionPlanToUserPlan(
  planId: SubscriptionPlanId | null
): UserPlanType {
  if (!planId) {
    return "FREE";
  }

  if (planId === "PRO") {
    return "PRO";
  }

  return "PREMIUM";
}

function getLimitsForPlan(planType: UserPlanType): UserPlanUsageLimits {
  if (planType === "PRO") {
    return proPlanLimits;
  }

  if (planType === "PREMIUM") {
    return premiumPlanLimits;
  }

  return freePlanLimits;
}

export function getUpgradeHrefForUserPlan(
  _planType: UserPlanType,
  surface: MonetizationSurface = "protected"
) {
  return getUpgradeHrefForSurface(surface);
}

export async function getUserPlanModel(userId: string): Promise<UserPlanModel> {
  const subscription = await getSubscriptionService().getActiveSubscription(userId);
  const planType = mapSubscriptionPlanToUserPlan(subscription?.planId ?? null);

  return {
    plan_type: planType,
    plan_expiry: getPlanExpiry({
      nextBillingDateUtc: subscription?.nextBillingDateUtc ?? null,
      endDateUtc: subscription?.endDateUtc ?? null,
    }),
    usage_limits: getLimitsForPlan(planType),
    source_subscription_plan_id: subscription?.planId ?? null,
  };
}
