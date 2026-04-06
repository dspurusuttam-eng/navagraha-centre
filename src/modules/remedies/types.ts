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

export type RemedyRuleMatch = {
  remedySlug: string;
  signalKey: string;
  rationale: string;
  priority: number;
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
  relatedProducts: RemedyLinkedProduct[];
};

export type RemedyRecommendationResult = {
  signals: ReportChartSignal[];
  recommendations: RemedyRecommendation[];
};

export type RemedyRecommendationInput = {
  chart: NatalChartResponse;
};
