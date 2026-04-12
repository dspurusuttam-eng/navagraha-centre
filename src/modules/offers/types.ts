export const offerRecommendationKinds = [
  "SUBSCRIPTION_MEMBERSHIP",
  "CONSULTATION_FOLLOW_UP",
  "REPORT_UPGRADE",
  "COMPATIBILITY_ADD_ON",
  "REMEDY_GUIDANCE_FOLLOW_UP",
  "SPIRITUAL_PRODUCT_RELEVANCE",
] as const;

export type OfferRecommendationKind =
  (typeof offerRecommendationKinds)[number];

export const offerRecommendationPriorities = [
  "PRIMARY",
  "SUPPORTIVE",
  "OPTIONAL",
] as const;

export type OfferRecommendationPriority =
  (typeof offerRecommendationPriorities)[number];

export const offerRecommendationSurfaceKeys = [
  "dashboard",
  "report",
  "consultation-detail",
] as const;

export type OfferRecommendationSurfaceKey =
  (typeof offerRecommendationSurfaceKeys)[number];

export type OfferRecommendation = {
  key: string;
  kind: OfferRecommendationKind;
  priority: OfferRecommendationPriority;
  title: string;
  summary: string;
  description: string;
  href: string;
  ctaLabel: string;
  rationale: string;
  safetyNote: string;
  supportingSignals: string[];
  kindLabel: string;
  optionalPurchase: boolean;
};

export type OfferRecommendationContextSummary = {
  surfaceKey: OfferRecommendationSurfaceKey;
  chartReady: boolean;
  reportReady: boolean;
  completedConsultationCount: number;
  latestConsultationServiceLabel: string | null;
  retentionStatus: "pending-session" | "ready";
  retentionNextActionKey: string;
  hasDueFollowUp: boolean;
  remedyRecommendationCount: number;
  productRelevantCount: number;
  compatibilityContextDetected: boolean;
  subscriptionStatus: "NONE" | "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED";
  subscriptionPlanId: string | null;
  subscriptionRecommendationPlanId: string | null;
};

export type OfferRecommendationResult = {
  generatedAtUtc: string;
  primaryRecommendation: OfferRecommendation | null;
  secondaryRecommendations: OfferRecommendation[];
  contextSummary: OfferRecommendationContextSummary;
};

export type OfferRecommendationInput = {
  userId: string;
  surfaceKey: OfferRecommendationSurfaceKey;
  consultationId?: string | null;
};

export const premiumOfferCategories = [
  "consultation",
  "report",
  "compatibility",
  "follow-up",
  "remedy",
  "timing",
] as const;

export type PremiumOfferCategory = (typeof premiumOfferCategories)[number];

export const premiumOfferLevels = [
  "CORE",
  "PREMIUM",
  "SIGNATURE",
] as const;

export type PremiumOfferLevel = (typeof premiumOfferLevels)[number];

export const premiumOfferContextTags = [
  "career",
  "marriage",
  "finance",
  "family",
  "health",
  "timing",
  "remedies",
  "compatibility",
  "spiritual-discipline",
] as const;

export type PremiumOfferContextTag = (typeof premiumOfferContextTags)[number];

export const premiumOfferEligibilityRuleKeys = [
  "ALWAYS",
  "CHART_AVAILABLE",
  "REPORT_READY",
  "COMPLETED_CONSULTATION_EXISTS",
  "FOLLOW_UP_DUE",
  "RELATIONSHIP_CONTEXT_DETECTED",
  "REMEDY_SIGNALS_PRESENT",
  "TIMING_CONTEXT_READY",
] as const;

export type PremiumOfferEligibilityRuleKey =
  (typeof premiumOfferEligibilityRuleKeys)[number];

export type PremiumOfferEligibilityRule = {
  key: PremiumOfferEligibilityRuleKey;
  description: string;
};

export const premiumOfferSurfaceTargets = [
  "dashboard",
  "checkout",
  "recommendation-engine",
] as const;

export type PremiumOfferSurfaceTarget =
  (typeof premiumOfferSurfaceTargets)[number];

export type PremiumOfferCatalogItem = {
  id: string;
  title: string;
  category: PremiumOfferCategory;
  shortDescription: string;
  contextTags: PremiumOfferContextTag[];
  eligibilityRules: PremiumOfferEligibilityRule[];
  premiumLevel: PremiumOfferLevel;
  surfaceTargets: PremiumOfferSurfaceTarget[];
};

export const premiumReportProductTypes = [
  "career",
  "marriage",
  "timing",
  "remedies",
  "annual",
] as const;

export type PremiumReportProductType = (typeof premiumReportProductTypes)[number];

export type PremiumReportProduct = {
  id: string;
  reportType: PremiumReportProductType;
  title: string;
  shortDescription: string;
  sellable: true;
  category: "report";
  linkedOfferId: string;
  priceFromMinor: number | null;
  currencyCode: "INR" | null;
};

export type PremiumOfferEligibilityContext = {
  hasChart: boolean;
  hasReport: boolean;
  hasCompletedConsultation: boolean;
  hasFollowUpDue: boolean;
  hasRelationshipContext: boolean;
  hasRemedySignals: boolean;
  hasTimingContext: boolean;
};
