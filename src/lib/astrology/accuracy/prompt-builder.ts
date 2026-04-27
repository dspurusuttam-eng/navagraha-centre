import { getAllowedToneGuidance, predictionPolicyRules } from "@/lib/astrology/accuracy/prediction-policy";
import { remedySafetyGuidelines, gemstoneSafetyNote } from "@/lib/astrology/accuracy/remedy-safety";

export type AstrologyToolType =
  | "KUNDLI"
  | "DAILY_RASHIFAL"
  | "PANCHANG"
  | "NUMEROLOGY"
  | "COMPATIBILITY"
  | "REMEDIES"
  | "REPORT"
  | "NAVAGRAHA_CHAT";

export type BuildPredictionPromptInput = {
  toolType: AstrologyToolType;
  locale: string;
  baseSystemPrompt: string;
  planInstruction?: string | null;
  preferredLanguageLabel?: string | null;
  astrologyDataSummary: unknown;
  missingDataWarnings?: string[];
  outputFormatRequirements: string[];
  extraDirectives?: string[];
};

export type PredictionPromptBundle = {
  instructions: string;
  input: string;
};

function localeLanguageDirective(locale: string) {
  const normalized = locale.toLowerCase();

  if (normalized === "as") {
    return "Respond in natural Assamese (public-friendly, not Bengali-style spelling).";
  }

  if (normalized === "hi") {
    return "Respond in clear Hindi (Devanagari), not Hinglish.";
  }

  return "Respond in clear English.";
}

function toolBoundaryDirective(toolType: AstrologyToolType) {
  switch (toolType) {
    case "KUNDLI":
      return "Kundli mode: use chart context only. If birth-time precision is weak, explicitly lower confidence for house-specific claims.";
    case "DAILY_RASHIFAL":
      return "Daily rashifal mode: keep tone balanced and practical, avoid deterministic future claims.";
    case "PANCHANG":
      return "Panchang mode: interpret only supplied tithi/nakshatra/yoga/karana/timing values.";
    case "NUMEROLOGY":
      return "Numerology mode: use only provided numerology values. Do not overstate certainty.";
    case "COMPATIBILITY":
      return "Compatibility mode: if partner birth context is partial, state that confidence is reduced.";
    case "REMEDIES":
      return "Remedy mode: suggest only safe, optional, non-coercive remedies.";
    case "REPORT":
      return "Report mode: keep structured section-first output with conservative interpretation framing.";
    case "NAVAGRAHA_CHAT":
    default:
      return "NAVAGRAHA AI chat mode: answer only from supplied chart/tool data and request missing birth details when needed.";
  }
}

export function buildPredictionPrompt(
  input: BuildPredictionPromptInput
): PredictionPromptBundle {
  const missingDataWarnings = input.missingDataWarnings ?? [];
  const instructions = [
    input.baseSystemPrompt,
    input.planInstruction ?? "",
    toolBoundaryDirective(input.toolType),
    localeLanguageDirective(input.locale),
    "Use only supplied astrology data. Never invent planetary positions, dasha values, houses, or transits.",
    "If required data is missing, state limitations gently and only provide validated partial guidance.",
    "Do not make medical, legal, or financial certainty claims.",
    "Avoid fear language, panic framing, and deterministic outcomes.",
    predictionPolicyRules.avoidGuarantees,
    predictionPolicyRules.avoidFear,
    predictionPolicyRules.avoidHighRiskClaims,
    predictionPolicyRules.avoidManipulativeRemedies,
    predictionPolicyRules.avoidHarmfulRituals,
    ...remedySafetyGuidelines,
    `Gemstone note: ${gemstoneSafetyNote}`,
    ...getAllowedToneGuidance(input.locale),
    ...input.outputFormatRequirements,
    ...(input.extraDirectives ?? []),
  ]
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  const payload = {
    toolType: input.toolType,
    locale: input.locale,
    preferredLanguage: input.preferredLanguageLabel ?? null,
    missingDataWarnings,
    astrologyDataSummary: input.astrologyDataSummary,
    outputRequirements: input.outputFormatRequirements,
  };

  return {
    instructions,
    input: JSON.stringify(payload, null, 2),
  };
}
