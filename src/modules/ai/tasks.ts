import type {
  NatalChartResponse,
  TransitChartResponse,
} from "@/modules/astrology/types";
import type { ContentType } from "@/modules/content/types";
import type { ReportChartSignal } from "@/modules/remedies/types";
import type {
  ChartInterpretationRequest,
  ChartInterpretationResult,
} from "@/modules/ai/types";

export const aiTaskKinds = [
  "CHART_EXPLANATION",
  "TRANSIT_EXPLANATION",
  "REMEDY_EXPLANATION",
  "CONSULTATION_BRIEF_GENERATION",
  "CONTENT_DRAFT_GENERATION",
] as const;

export type AiTaskKind = (typeof aiTaskKinds)[number];

export type ChartExplanationTaskInput = {
  kind: "CHART_EXPLANATION";
  request: ChartInterpretationRequest;
};

export type ChartExplanationTaskResult = {
  kind: "CHART_EXPLANATION";
  output: ChartInterpretationResult;
};

export type TransitExplanationTaskInput = {
  kind: "TRANSIT_EXPLANATION";
  chart: TransitChartResponse;
  subjectName: string;
  preferredLanguageLabel: string;
};

export type TransitExplanationTaskResult = {
  kind: "TRANSIT_EXPLANATION";
  output: {
    summary: string;
    guidance: string;
    caution: string;
  };
};

export type RemedyExplanationTaskInput = {
  kind: "REMEDY_EXPLANATION";
  chart: NatalChartResponse;
  signals: ReportChartSignal[];
  approvedRemedyIds: string[];
  preferredLanguageLabel: string;
};

export type RemedyExplanationTaskResult = {
  kind: "REMEDY_EXPLANATION";
  output: {
    summary: string;
    rationale: string;
    caution: string;
  };
};

export type ConsultationBriefTaskInput = {
  kind: "CONSULTATION_BRIEF_GENERATION";
  userId: string;
  consultationId: string;
  subjectName: string;
  preferredLanguageLabel: string;
  topicFocus: string;
  intakeSummary: string;
};

export type ConsultationBriefTaskResult = {
  kind: "CONSULTATION_BRIEF_GENERATION";
  output: {
    headline: string;
    brief: string;
    recommendedAgenda: readonly string[];
  };
};

export type ContentDraftTaskInput = {
  kind: "CONTENT_DRAFT_GENERATION";
  contentType: ContentType;
  slug: string;
  title: string;
  audience: string;
  outline: readonly string[];
  keywords: readonly string[];
};

export type ContentDraftTaskResult = {
  kind: "CONTENT_DRAFT_GENERATION";
  output: {
    excerpt: string;
    draft: string;
    reviewerNotes: readonly string[];
  };
};

export type AiTaskInput =
  | ChartExplanationTaskInput
  | TransitExplanationTaskInput
  | RemedyExplanationTaskInput
  | ConsultationBriefTaskInput
  | ContentDraftTaskInput;

export type AiTaskOutput =
  | ChartExplanationTaskResult
  | TransitExplanationTaskResult
  | RemedyExplanationTaskResult
  | ConsultationBriefTaskResult
  | ContentDraftTaskResult;

export type UnsupportedAiTaskResult = {
  kind: Exclude<AiTaskKind, "CHART_EXPLANATION">;
  output: null;
  status: "not-implemented";
  message: string;
};

export type AiTaskRunResult =
  | ChartExplanationTaskResult
  | UnsupportedAiTaskResult;
