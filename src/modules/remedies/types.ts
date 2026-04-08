import type { RemedyType } from "@prisma/client";
import type { RemedyLinkedProduct } from "@/modules/shop";
import type {
  NatalChartResponse,
  PlanetaryBody,
  SignalStrength,
} from "@/modules/astrology";

export type ReportChartSignal = {
  key: string;
  title: string;
  level: SignalStrength;
  rationale: string;
  relatedBodies: PlanetaryBody[];
};

export const remedyPriorityTiers = ["PRIMARY", "SUPPORTIVE", "OPTIONAL"] as const;

export type RemedyPriorityTier = (typeof remedyPriorityTiers)[number];

export const remedyConfidenceLabels = [
  "HIGH_CONFIDENCE",
  "MODERATE_CONFIDENCE",
  "OPTIONAL_SUPPORT",
] as const;

export type RemedyConfidenceLabel = (typeof remedyConfidenceLabels)[number];

export const remedyCautionKeys = [
  "REQUIRES_EXPERT_CONSULTATION",
  "TIMING_SENSITIVE",
  "PRODUCT_PURCHASE_NOT_REQUIRED",
  "SPIRITUAL_SUPPORT_ONLY",
] as const;

export type RemedyCautionKey = (typeof remedyCautionKeys)[number];

export type RemedyEvidenceSignal = {
  signalKey: string;
  title: string;
  level: SignalStrength;
  rationale: string;
  relatedBodies: PlanetaryBody[];
  source: "CHART_SIGNAL" | "RULE_MATCH";
};

export type RemedyRecommendationCaution = {
  key: RemedyCautionKey;
  label: string;
  note: string;
};

export type RemedyProductMapping = {
  products: RemedyLinkedProduct[];
  purchaseRequired: false;
  note: string;
};

export type RemedyFollowUpSuggestion = {
  kind: "SELF_PRACTICE" | "CONSULTATION" | "REFLECTION" | "PRODUCT_OPTION";
  title: string;
  note: string;
  href?: string;
};

export type RemedyWhyThisRemedy = {
  summary: string;
  chartGrounding: string;
  approvedRecordBasis: string;
};

export type ApprovedRemedyRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  type: RemedyType;
  cautionNote: string | null;
};

export type RemedyRuleMatch = {
  remedySlug: string;
  signalKey: string;
  rationale: string;
  priority: number;
  confidenceScore: number;
  matchedSignalLevel: SignalStrength;
};

export type RemedyRecommendation = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  type: RemedyType;
  cautionNote: string | null;
  rationale: string;
  signalKey: string;
  priority: number;
  priorityTier: RemedyPriorityTier;
  confidenceLabel: RemedyConfidenceLabel;
  confidenceScore: number;
  evidence: RemedyEvidenceSignal[];
  whyThisRemedy: RemedyWhyThisRemedy;
  cautions: RemedyRecommendationCaution[];
  productMapping: RemedyProductMapping;
  followUpSuggestions: RemedyFollowUpSuggestion[];
  relatedProducts: RemedyLinkedProduct[];
};

export type RemedyRecommendationSummary = {
  generatedAtUtc: string;
  primaryCount: number;
  supportiveCount: number;
  optionalCount: number;
  topRecommendationSlugs: string[];
};

export type RemedyConsultationPreparation = {
  summary: string;
  topRecommendations: {
    slug: string;
    title: string;
    priorityTier: RemedyPriorityTier;
    confidenceLabel: RemedyConfidenceLabel;
    note: string;
  }[];
};

export type RemedyRecommendationResult = {
  signals: ReportChartSignal[];
  recommendations: RemedyRecommendation[];
  summary: RemedyRecommendationSummary;
  consultationPreparation: RemedyConsultationPreparation;
  loggedRunId: string | null;
};

export type RemedyRecommendationLogContext = {
  userId?: string;
  chartRecordId?: string;
  surfaceKey: string;
};

export type RemedyRecommendationInput = {
  chart: NatalChartResponse;
  logContext?: RemedyRecommendationLogContext;
};
