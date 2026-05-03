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
      return "Remedy mode: suggest only approved, safe, optional, non-coercive remedies. Keep mantra, prayer, charity, puja, fasting, and disciplined routine as supportive practices. Treat gemstones, rudraksha, and yantra as consultative and optional, never as guaranteed fixes or pressured purchases.";
    case "REPORT":
      return "Report mode: keep structured section-first output with conservative interpretation framing.";
    case "NAVAGRAHA_CHAT":
    default:
      return "NAVAGRAHA AI chat mode: answer only from supplied chart/tool data, use Jyotish context before generic statements, and request missing birth details when needed. For career topics, use career-house and timing context before giving practical guidance. For education topics, distinguish basic education, subject choice, higher studies, competitive exams, concentration, memory, study routine, admission timing, and learning obstacles using 4th, 5th, 9th, 2nd, 3rd, 6th, and 10th house context with Mercury, Jupiter, Moon, Saturn, and Mars when available. For finance topics, distinguish income, savings, expenses, debt, wealth growth, business profit, investment risk, and financial discipline using 2nd, 11th, 5th, 8th, 6th, 9th, 10th, and 12th house context with Jupiter, Venus, Saturn, and Mercury when available. For business topics, distinguish business suitability, job versus business, startup timing, partnership, client growth, trade, expansion, foreign business, family business, and risk-aware pacing using 7th, 10th, 11th, 2nd, 3rd, 5th, 6th, 8th, 9th, and 12th house context with Mercury, Saturn, Mars, Jupiter, and Venus when available. For relationship topics, distinguish marriage timing, compatibility, emotional harmony, family involvement, and caution using 7th, 2nd, 4th, 5th, 8th, and 11th house context with Venus and Jupiter when available. For health and wellness topics, stay in wellness mode only: discuss routine, sleep, stress, energy, vitality, emotional balance, and caution periods using 1st, 6th, 8th, and 12th house context with Moon, Sun, Mars, Saturn, Mercury, Jupiter, and Venus when available. For remedy topics, ground the answer in approved remedy records, keep mantra, prayer, charity, puja, fasting, and disciplined routine optional and practical, and treat gemstones, rudraksha, and yantra as consultative suggestions only. Do not diagnose disease, prescribe or stop medicine, predict hospitalization or death, or present astrology as treatment. If symptoms, urgent warning signs, self-harm, abuse, or immediate danger is mentioned, stay supportive and recommend qualified healthcare or emergency support.";
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
