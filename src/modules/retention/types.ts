export type RetentionLifecycleStage =
  | "SIGNED_UP_NO_CHART"
  | "CHART_READY_NO_ASSISTANT"
  | "ASSISTANT_USED_NO_PREMIUM"
  | "PREMIUM_ACTIVE"
  | "PREMIUM_INACTIVE"
  | "PREMIUM_EXPIRED";

export type RetentionSurfaceCard = {
  title: string;
  summary: string;
  supportingLine: string;
};

export type RetentionNextStep = {
  title: string;
  summary: string;
  href: string;
  ctaLabel: string;
  emphasis: "FREE" | "PREMIUM";
};

export type RetentionDashboardActivity = {
  hasChart: boolean;
  hasAssistantUsage: boolean;
  assistantSessionCount: number;
  lastAssistantActivityUtc: string | null;
  daysSinceAssistantActivity: number | null;
  isSubscribed: boolean;
  subscriptionLifecycle:
    | "NO_SUBSCRIPTION"
    | "ACTIVE"
    | "PAUSED"
    | "CANCELLED"
    | "EXPIRED";
};

export type RetentionDashboardSnapshot = {
  generatedAtUtc: string;
  lifecycleStage: RetentionLifecycleStage;
  lifecycleLabel: string;
  dailyInsight: RetentionSurfaceCard;
  currentEnergy: RetentionSurfaceCard;
  recommendedNextStep: RetentionNextStep;
  activity: RetentionDashboardActivity;
  analytics: {
    showChartIncompleteNudge: boolean;
    showPremiumFollowupNudge: boolean;
  };
};
