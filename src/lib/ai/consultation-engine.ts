import "server-only";

import {
  fallbackChartInsights,
  generateChartInsights,
  loadChartAnalysisContext,
} from "@/lib/ai/chart-analysis";
import { suggestRemedies } from "@/lib/ai/remedies-engine";
import type { ConsultationReply } from "@/lib/ai/types";

const supportedQuestionPattern =
  /\b(ascendant|rising|chart|theme|themes|planet|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu|house|aspect|cycle|transit|remedy|recommend)\b/i;

function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/g, " ");
}

function buildUnsupportedAnswer() {
  return [
    "I can help with stored chart themes, placements, remedies, and consultation context inside NAVAGRAHA CENTRE only.",
    "For broader life decisions or questions outside your saved chart context, please use the full report or a consultation with Joy Prakash Sarmah.",
  ].join("\n\n");
}

function createFallbackConsultationReply(): ConsultationReply {
  return {
    answer: "No chart data is available yet. Complete onboarding first so the assistant can respond from saved chart context.",
    followUpSuggestions: [
      "Complete onboarding to generate your first chart.",
      "Return here once chart data is available.",
    ],
    sourceLabels: ["fallback"],
    remedies: [],
    providerKey: "mock-consultation-engine",
    model: null,
    supported: true,
  };
}

export async function generateConsultationReply(
  question: string,
  userId: string
): Promise<ConsultationReply> {
  try {
    const normalizedQuestion = normalizeQuestion(question);
    const [context, insights, remedies] = await Promise.all([
      loadChartAnalysisContext(userId),
      generateChartInsights(userId),
      suggestRemedies(userId).catch((error) => {
        console.error("suggestRemedies failed", error);
        return [];
      }),
    ]);
    const safeInsights = insights ?? fallbackChartInsights;

    if (!supportedQuestionPattern.test(normalizedQuestion)) {
      return {
        answer: buildUnsupportedAnswer(),
        followUpSuggestions: [
          "Ask about your strongest chart themes.",
          "Ask why a remedy was suggested.",
        ],
        sourceLabels: ["chart-insights", "consultation-context"],
        remedies,
        providerKey: "mock-consultation-engine",
        model: null,
        supported: false,
      };
    }

    if (!context.overview.chart) {
      return createFallbackConsultationReply();
    }

    const latestConsultationNote = context.consultationNotes[0];
    const leadRemedy = remedies[0];
    const questionLower = normalizedQuestion.toLowerCase();
    const leadStrength =
      safeInsights.strengths[0] ?? "No chart-specific strengths are available yet.";
    const leadChallenge =
      safeInsights.challenges[0] ?? "No chart-specific cautions are available yet.";

    if (/remedy|recommend/i.test(questionLower) && leadRemedy) {
      return {
        answer: [
          safeInsights.summary,
          `${leadRemedy.title} appears here because ${leadRemedy.reason}`,
          leadRemedy.note,
          latestConsultationNote
            ? `Your latest consultation context also points toward: ${latestConsultationNote.note}`
            : "If you want this refined for your personal situation, the next best step is a consultation-led review.",
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask what the strongest chart themes are.",
          "Ask how to understand this remedy gently and realistically.",
        ],
        sourceLabels: ["chart-insights", "remedies", "consultation-context"],
        remedies,
        providerKey: "mock-consultation-engine",
        model: null,
        supported: true,
      };
    }

    if (/cycle|transit/i.test(questionLower)) {
      return {
        answer: [
          safeInsights.summary,
          "The current mock content layer does not calculate live transit timing yet, so I do not want to invent a cycle reading.",
          "For now, the safest interpretation is to treat the stored chart themes as your main reference and take timing-sensitive questions into consultation.",
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask what your strongest natal themes are.",
          "Review your report for the current chart summary.",
        ],
        sourceLabels: ["chart-insights"],
        remedies,
        providerKey: "mock-consultation-engine",
        model: null,
        supported: true,
      };
    }

    return {
      answer: [
        safeInsights.summary,
        leadStrength,
        leadChallenge,
        leadRemedy
          ? `A gentle support to keep in view is ${leadRemedy.title}. ${leadRemedy.note}`
          : "No remedy needs to be forced here; a calm review of the chart report is a good next step.",
      ].join("\n\n"),
      followUpSuggestions: [
        "Ask what the strongest themes are.",
        "Ask why a particular remedy was suggested.",
        "Ask how to prepare for consultation.",
      ],
      sourceLabels: ["chart-insights", "remedies"],
      remedies,
      providerKey: "mock-consultation-engine",
      model: null,
      supported: true,
    };
  } catch (error) {
    console.error("generateConsultationReply failed", error);

    return createFallbackConsultationReply();
  }
}
