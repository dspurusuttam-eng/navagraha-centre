// Card 12.1 — immutable numerology rule registry. Every emitted ruleId is registered here.

export type NumerologyRule = {
  ruleId: string;
  system: "NORM" | "REDUCE" | "DATE" | "CHALDEAN" | "PYTHAGOREAN" | "LOSHU" | "COMPAT";
  description: string;
};

const RULES: readonly NumerologyRule[] = [
  { ruleId: "NORM_LATIN_A_Z_V1", system: "NORM", description: "Uppercase, fold diacritics, strip non-A-Z; Latin A-Z is the V1 alphabet." },
  { ruleId: "NORM_TRANSLITERATION_REQUIRED_V1", system: "NORM", description: "Name with letters but no Latin A-Z after folding -> TRANSLITERATION_REQUIRED (never guessed)." },
  { ruleId: "NORM_INVALID_INPUT_V1", system: "NORM", description: "Empty / number-only / punctuation-only name -> INVALID_INPUT." },
  { ruleId: "NORM_PART_SPLIT_V1", system: "NORM", description: "Split name into parts on whitespace/hyphen; apostrophes removed; parts preserved in order." },

  { ruleId: "REDUCE_SINGLE_DIGIT_V1", system: "REDUCE", description: "Repeatedly sum digits until a single digit 1-9." },
  { ruleId: "REDUCE_MASTER_RETAIN_V1", system: "REDUCE", description: "Stop reduction at 11/22/33 (master numbers retained)." },
  { ruleId: "REDUCE_COMPOUND_PRESERVED_V1", system: "REDUCE", description: "Compound total preserved before reduction." },

  { ruleId: "DATE_GREGORIAN_VALIDATION_V1", system: "DATE", description: "Validate Gregorian date incl. leap-year February; invalid -> INVALID_INPUT." },
  { ruleId: "DATE_MOOLANK_PSYCHIC_V1", system: "DATE", description: "Psychic/Moolank/Birth Number = day-of-month reduced to single digit (no master)." },
  { ruleId: "DATE_BHAGYANK_LIFEPATH_V1", system: "DATE", description: "Destiny/Life Path/Bhagyank = component reduction (reduce day, month, 4-digit year; sum; reduce) with master preserved." },
  { ruleId: "DATE_COMPOUND_TOTAL_V1", system: "DATE", description: "Compound total = sum of ALL digits of the full date, before reduction." },

  { ruleId: "CHALDEAN_TABLE_V1", system: "CHALDEAN", description: "Chaldean (Cheiro) letter values 1-8." },
  { ruleId: "CHALDEAN_NO_9_LETTER_V1", system: "CHALDEAN", description: "No letter maps to 9 in Chaldean; 9 appears only as a compound total." },
  { ruleId: "CHALDEAN_EXPRESSION_V1", system: "CHALDEAN", description: "Chaldean full-name compound total, reduced (single digit; master not applied in Chaldean V1)." },

  { ruleId: "PYTHAGOREAN_TABLE_V1", system: "PYTHAGOREAN", description: "Pythagorean letter values 1-9." },
  { ruleId: "PYTHAGOREAN_EXPRESSION_V1", system: "PYTHAGOREAN", description: "Expression/Destiny = full-name total, reduced (master 11/22/33 retained)." },
  { ruleId: "PYTHAGOREAN_SOUL_URGE_V1", system: "PYTHAGOREAN", description: "Soul Urge = vowels only (AEIOU; Y consonant), reduced (master retained)." },
  { ruleId: "PYTHAGOREAN_PERSONALITY_V1", system: "PYTHAGOREAN", description: "Personality = consonants only, reduced (master retained)." },

  { ruleId: "LOSHU_BASE_DOB_ONLY_V1", system: "LOSHU", description: "Base grid uses DOB digits only, zeros excluded." },
  { ruleId: "LOSHU_FREQUENCY_V1", system: "LOSHU", description: "Digit frequency, missing numbers, repeated numbers." },
  { ruleId: "LOSHU_LINES_V1", system: "LOSHU", description: "Rows/columns/diagonals completed when all three cells present." },
  { ruleId: "LOSHU_OVERLAY_SEPARATE_V1", system: "LOSHU", description: "Driver (Psychic) and Conductor (Destiny) reported separately; base grid never modified." },

  { ruleId: "COMPAT_MATRIX_SYMMETRIC_V1", system: "COMPAT", description: "Symmetric 1-9 relationship matrix (supportive/neutral/challenging); no percentage." },
  { ruleId: "COMPAT_SYSTEM_SEPARATE_V1", system: "COMPAT", description: "Each system's compatibility kept separate; never mixed or averaged." },
  { ruleId: "COMPAT_UNAVAILABLE_V1", system: "COMPAT", description: "Missing/invalid inputs -> structured UNAVAILABLE, never fabricated." },
] as const;

const INDEX = new Map(RULES.map((r) => [r.ruleId, r] as const));

export const NUMEROLOGY_RULE_REGISTRY: readonly NumerologyRule[] = RULES;

export function getNumerologyRule(ruleId: string): NumerologyRule {
  const rule = INDEX.get(ruleId);
  if (!rule) {
    throw new Error(`Unregistered numerology rule "${ruleId}". Every emitted rule must be registered.`);
  }
  return rule;
}
