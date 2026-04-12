export const subscriptionPlanIds = ["BASIC", "PREMIUM", "PRO"] as const;

export type SubscriptionPlanId = (typeof subscriptionPlanIds)[number];

export const subscriptionFeatureKeys = [
  "DAILY_PERSONALIZED_INSIGHTS",
  "TIMING_ALERTS",
  "PREMIUM_REPORTS_ACCESS",
  "PRIORITY_CONSULTATION_ACCESS",
] as const;

export type SubscriptionFeatureKey = (typeof subscriptionFeatureKeys)[number];

export const subscriptionUsageLimitKeys = [
  "timingAlertsPerMonth",
  "premiumReportsPerMonth",
  "priorityConsultationRequestsPerMonth",
] as const;

export type SubscriptionUsageLimitKey =
  (typeof subscriptionUsageLimitKeys)[number];

export type SubscriptionUsageLimits = Partial<
  Record<SubscriptionUsageLimitKey, number>
>;

export type SubscriptionPlanFeatureAccess = Record<
  SubscriptionFeatureKey,
  boolean
>;

export type SubscriptionPlanDefinition = {
  id: SubscriptionPlanId;
  title: string;
  summary: string;
  featureAccess: SubscriptionPlanFeatureAccess;
  usageLimits: SubscriptionUsageLimits;
  eligibilityTags: string[];
};

export type SubscriptionSnapshot = {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED";
  startDateUtc: string;
  nextBillingDateUtc: string | null;
  endDateUtc: string | null;
  sourceOrderId: string | null;
  metadata: Record<string, unknown> | null;
};

export type SubscriptionAccessSnapshot = {
  isSubscribed: boolean;
  plan: SubscriptionPlanDefinition | null;
  subscription: SubscriptionSnapshot | null;
  features: SubscriptionPlanFeatureAccess;
  usageLimits: SubscriptionUsageLimits;
};

export type SubscriptionLifecycleState =
  | "NO_SUBSCRIPTION"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED"
  | "EXPIRED";

export type SubscriptionRecommendationPriority = "HIGH" | "MEDIUM" | "LOW";

export type SubscriptionRecommendationReason =
  | "REPEATED_FREE_USAGE"
  | "TIMING_ENGAGEMENT"
  | "MULTI_REPORT_PURCHASES";

export type SubscriptionLifecycleNextAction =
  | "RENEW"
  | "UPGRADE"
  | "CONTINUE_FREE"
  | "CONTINUE_PREMIUM";

export type SubscriptionPlanRecommendation = {
  planId: SubscriptionPlanId;
  title: string;
  summary: string;
  ctaLabel: string;
  href: string;
  priority: SubscriptionRecommendationPriority;
  reasons: SubscriptionRecommendationReason[];
};

export type SubscriptionRetentionNudge = {
  key: string;
  title: string;
  summary: string;
  priority: SubscriptionRecommendationPriority;
};

export type SubscriptionEngagementSignals = {
  askMyChartSessionCount: number;
  transitQuestionCount: number;
  paidReportOrderCount: number;
  timingContextReady: boolean;
  repeatedFreeUsage: boolean;
  timingEngagement: boolean;
  multipleReportPurchases: boolean;
};

export type SubscriptionFeatureGateSnapshot = {
  advancedTimingInsights: boolean;
  deeperReportLayers: boolean;
};

export type SubscriptionRetentionIntelligenceSnapshot = {
  generatedAtUtc: string;
  lifecycleState: SubscriptionLifecycleState;
  access: SubscriptionAccessSnapshot;
  latestSubscription: SubscriptionSnapshot | null;
  benefitsSummary: string[];
  recommendation: SubscriptionPlanRecommendation | null;
  nudge: SubscriptionRetentionNudge;
  engagementSignals: SubscriptionEngagementSignals;
  nextAction: {
    key: SubscriptionLifecycleNextAction;
    label: string;
    href: string;
  };
  featureGates: SubscriptionFeatureGateSnapshot;
};
