export {
  getSubscriptionPlan,
  getSubscriptionPlans,
  isSubscriptionPlanId,
  subscriptionPlans,
} from "@/modules/subscriptions/plans";
export {
  createSubscriptionService,
  getSubscriptionService,
} from "@/modules/subscriptions/service";
export {
  canUseSubscriptionFeature,
  getSubscriptionAccessSnapshot,
  getUserSubscriptionPlan,
  isUserSubscribed,
} from "@/modules/subscriptions/access";
export { syncSubscriptionFromPaidOrder } from "@/modules/subscriptions/order-integration";
export {
  createFallbackSubscriptionRetentionSnapshot,
  getSubscriptionLifecycleLabel,
  getSubscriptionRetentionIntelligenceSnapshot,
  toOfferSubscriptionCandidate,
} from "@/modules/subscriptions/retention-intelligence";
export type {
  SubscriptionAccessSnapshot,
  SubscriptionEngagementSignals,
  SubscriptionFeatureGateSnapshot,
  SubscriptionFeatureKey,
  SubscriptionLifecycleNextAction,
  SubscriptionLifecycleState,
  SubscriptionPlanDefinition,
  SubscriptionPlanFeatureAccess,
  SubscriptionPlanId,
  SubscriptionPlanRecommendation,
  SubscriptionRecommendationPriority,
  SubscriptionRecommendationReason,
  SubscriptionRetentionIntelligenceSnapshot,
  SubscriptionRetentionNudge,
  SubscriptionSnapshot,
  SubscriptionUsageLimitKey,
  SubscriptionUsageLimits,
} from "@/modules/subscriptions/types";
