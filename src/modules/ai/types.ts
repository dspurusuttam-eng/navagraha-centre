import type { NatalChartResponse } from "@/modules/astrology";
import type { ReportChartSignal } from "@/modules/remedies/types";

export type AiTaskContext = {
  sessionId?: string;
  taskRunId?: string;
  promptTemplateKey?: string;
  promptVersionLabel?: string;
};

export type ChartInterpretationRequest = {
  reportId: string;
  subjectName: string;
  preferredLanguageLabel: string;
  chart: NatalChartResponse;
  signals: ReportChartSignal[];
  context?: AiTaskContext;
};

export type ChartInterpretationSectionKey =
  | "orientation"
  | "strengths"
  | "considerations"
  | "integration";

export type ChartInterpretationSection = {
  key: ChartInterpretationSectionKey;
  title: string;
  body: string;
};

export type ChartInterpretationResult = {
  providerKey: string;
  model: string;
  generatedAtUtc: string;
  summary: string;
  sections: ChartInterpretationSection[];
  caution: string;
  promptTemplateKey?: string;
  promptVersionLabel?: string;
};
