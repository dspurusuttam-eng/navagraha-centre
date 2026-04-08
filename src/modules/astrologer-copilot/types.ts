import type { SignalStrength } from "@/modules/astrology/types";
import type {
  RemedyConfidenceLabel,
  RemedyPriorityTier,
} from "@/modules/remedies/types";

export type CopilotClientSnapshot = {
  userId: string;
  name: string;
  email: string;
  consultationId: string;
  confirmationCode: string;
  serviceLabel: string;
  scheduledForUtc: string | null;
  clientTimezone: string | null;
  preferredLanguage: string | null;
  topicFocus: string | null;
  intakeSummary: string | null;
  consultationHistoryCount: number;
};

export type CopilotChartSummaryPacket = {
  chartId: string;
  ascendantSign: string;
  dominantBodies: string[];
  narrative: string;
  notablePlacements: {
    body: string;
    sign: string;
    house: number;
    retrograde: boolean;
  }[];
  notableAspects: {
    source: string;
    type: string;
    target: string;
    orb: number;
    exact: boolean;
  }[];
};

export type CopilotPriorityTheme = {
  key: string;
  title: string;
  level: SignalStrength;
  rationale: string;
  focusOrder: number;
  requiresManualJudgement: boolean;
};

export type CopilotRiskCautionFlag = {
  key: string;
  label: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  astrologerGuidance: string;
};

export type CopilotRecommendedDiscussionTopic = {
  title: string;
  question: string;
  rationale: string;
  priority: "PRIMARY" | "SUPPORTIVE" | "OPTIONAL";
};

export type CopilotRemedySummary = {
  generatedAtUtc: string;
  topRecommendations: {
    slug: string;
    title: string;
    priorityTier: RemedyPriorityTier;
    confidenceLabel: RemedyConfidenceLabel;
    whyThisRemedy: string;
    cautionLabels: string[];
  }[];
  consultationPreparationSummary: string;
};

export type CopilotStructuredSections = {
  focusFirst: string;
  questions: string;
  avoidOverstating: string;
};

export type CopilotAdvisoryDrafts = {
  headline: string;
  followUpDraft: string;
  recapDraft: string;
  astrologerNotesDraft: string;
};

export type AstrologerCopilotBrief = {
  id: string;
  generatedAtUtc: string;
  providerKey: string;
  model: string | null;
  promptTemplateKey: string;
  promptVersionLabel: string;
  clientSnapshot: CopilotClientSnapshot;
  chartSummaryPacket: CopilotChartSummaryPacket;
  priorityThemes: CopilotPriorityTheme[];
  riskCautionFlags: CopilotRiskCautionFlag[];
  remedySummary: CopilotRemedySummary;
  discussionTopics: CopilotRecommendedDiscussionTopic[];
  sections: CopilotStructuredSections;
  drafts: CopilotAdvisoryDrafts;
};

export type AstrologerCopilotConsultationOption = {
  consultationId: string;
  userId: string;
  clientName: string;
  confirmationCode: string;
  serviceLabel: string;
  scheduledForUtc: string | null;
  status: string;
  topicFocus: string | null;
};

export type AstrologerCopilotPageData = {
  consultationOptions: AstrologerCopilotConsultationOption[];
  selectedConsultationId: string | null;
  brief: AstrologerCopilotBrief | null;
  lastGeneratedSnapshotId: string | null;
};
