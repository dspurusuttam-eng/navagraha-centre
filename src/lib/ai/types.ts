import type { ChartReportState } from "@/modules/report/service";

export type ChartInsights = {
  summary: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
};

export type RemedyCategory =
  | "mantra"
  | "rudraksha"
  | "mala"
  | "gemstone"
  | "yantra"
  | "puja"
  | "donation"
  | "fasting"
  | "spiritual discipline"
  | "lifestyle support";

export type RemedySuggestion = {
  id: string;
  title: string;
  category: RemedyCategory;
  reason: string;
  note: string;
  purchaseNote: string;
};

export type ConsultationNoteSummary = {
  id: string;
  serviceLabel: string;
  statusLabel: string;
  scheduledForUtc: string | null;
  note: string;
};

export type ConsultationReply = {
  answer: string;
  followUpSuggestions: string[];
  sourceLabels: string[];
  remedies: RemedySuggestion[];
  providerKey: "mock-consultation-engine";
  model: null;
  supported: boolean;
};

export type GeneratedUserReport = {
  chartReport: ChartReportState;
  insights: ChartInsights;
  consultationNotes: ConsultationNoteSummary[];
  remedies: RemedySuggestion[];
  reportSummary: {
    headline: string;
    overview: string;
  };
};
