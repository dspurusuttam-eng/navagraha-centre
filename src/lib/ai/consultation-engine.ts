import "server-only";

import { generateChartInsights, loadChartAnalysisContext } from "@/lib/ai/chart-analysis";
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

export async function generateConsultationReply(
  question: string,
  userId: string
): Promise<ConsultationReply> {
  const normalizedQuestion = normalizeQuestion(question);
  const [context, insights, remedies] = await Promise.all([
    loadChartAnalysisContext(userId),
    generateChartInsights(userId),
    suggestRemedies(userId),
  ]);

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
    return {
      answer: [
        "Your protected workspace is ready, but a stored natal chart is not available yet.",
        "Complete onboarding first so Ask My Chart can respond from saved birth details instead of improvised interpretation.",
      ].join("\n\n"),
      followUpSuggestions: [
        "Complete onboarding to generate your first chart.",
        "Return here after the chart is saved to ask about placements or remedies.",
      ],
      sourceLabels: ["chart-onboarding"],
      remedies,
      providerKey: "mock-consultation-engine",
      model: null,
      supported: true,
    };
  }

  const latestConsultationNote = context.consultationNotes[0];
  const leadRemedy = remedies[0];
  const questionLower = normalizedQuestion.toLowerCase();

  if (/remedy|recommend/i.test(questionLower) && leadRemedy) {
    return {
      answer: [
        insights.summary,
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
        insights.summary,
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
      insights.summary,
      insights.strengths[0],
      insights.challenges[0],
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
}
