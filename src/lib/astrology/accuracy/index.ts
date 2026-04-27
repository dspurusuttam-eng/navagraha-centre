import { normalizeLocaleCode } from "@/modules/localization/config";

export * from "@/lib/astrology/accuracy/input-validator";
export * from "@/lib/astrology/accuracy/astrology-data-validator";
export * from "@/lib/astrology/accuracy/prediction-policy";
export * from "@/lib/astrology/accuracy/prompt-builder";
export * from "@/lib/astrology/accuracy/output-validator";
export * from "@/lib/astrology/accuracy/remedy-safety";
export * from "@/lib/astrology/accuracy/confidence-score";
export * from "@/lib/astrology/accuracy/astrology-disclaimers";

const languageLabelToLocale = new Map<string, string>([
  ["english", "en"],
  ["assamese", "as"],
  ["hindi", "hi"],
  ["bengali", "bn"],
  ["sanskrit", "sa"],
]);

export function resolvePredictionLocale(input?: string | null) {
  const normalizedLocale = normalizeLocaleCode(input);

  if (normalizedLocale) {
    return normalizedLocale;
  }

  const fallbackFromLabel = input
    ? languageLabelToLocale.get(input.trim().toLowerCase())
    : null;

  return normalizeLocaleCode(fallbackFromLabel) ?? "en";
}

export function logAccuracyEvent(
  event: string,
  detail: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info(`[accuracy:${event}]`, detail);
}
