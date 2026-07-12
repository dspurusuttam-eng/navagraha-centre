// Card 12.1 — name input normalizer (pure). Fail-closed; never invents transliterations.
import type { NameNormalization, ResultStatus } from "@/modules/numerology/premium/types";

/** Fold common Latin diacritics to A-Z; anything else is dropped (not guessed). */
function foldToLatin(input: string): string {
  return input
    .normalize("NFKD") // decompose accents
    .replace(/[̀-ͯ]/g, "") // strip combining marks
    .toUpperCase();
}

/**
 * Normalize a raw name. Preserves original + normalized. Splits into parts on
 * whitespace/hyphen (apostrophes removed). Returns a structured status:
 * - INVALID_INPUT: empty, number-only, or punctuation-only.
 * - TRANSLITERATION_REQUIRED: contains letters but yields no Latin A-Z after folding.
 * - CALCULATED: has usable Latin A-Z letters.
 */
export function normalizeName(raw: string | undefined | null): NameNormalization {
  const original = raw ?? "";
  const hasLetters = /\p{L}/u.test(original);
  const hasDigits = /\p{Nd}/u.test(original);

  // trim; collapse internal whitespace; unify hyphen variants to a space for splitting;
  // remove apostrophes/quotes (O'Brien -> OBRIEN as one part).
  const cleaned = original
    .replace(/[‘’'`]/g, "")
    .replace(/[-‐-―]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const folded = foldToLatin(cleaned);
  const latinLetters = folded.replace(/[^A-Z]/g, "");

  let status: ResultStatus = "CALCULATED";
  let reason: string | undefined;

  if (cleaned.length === 0 || (!hasLetters && !latinLetters)) {
    status = "INVALID_INPUT";
    reason = hasDigits && !hasLetters ? "Name is number-only." : "Name is empty or punctuation-only.";
  } else if (latinLetters.length === 0 && hasLetters) {
    status = "TRANSLITERATION_REQUIRED";
    reason = "Name contains non-Latin letters and no Latin transliteration was supplied.";
  }

  const parts =
    status === "CALCULATED"
      ? folded
          .split(" ")
          .map((p) => p.replace(/[^A-Z]/g, ""))
          .filter((p) => p.length > 0)
      : [];

  return {
    ruleId:
      status === "TRANSLITERATION_REQUIRED"
        ? "NORM_TRANSLITERATION_REQUIRED_V1"
        : status === "INVALID_INPUT"
          ? "NORM_INVALID_INPUT_V1"
          : "NORM_LATIN_A_Z_V1",
    original,
    normalized: folded,
    latinLetters,
    parts,
    status,
    reason,
  };
}
