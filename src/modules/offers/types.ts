export const offerRecommendationKinds = [
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
