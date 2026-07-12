// Card 12.1 — Premium Numerology Core Engine (internal, engine-only).
// Deterministic, calculation-first. No prediction/fear/remedy/sales language.
// Additive: does not touch the existing src/modules/numerology/engine.ts baseline.

export const NUMEROLOGY_PREMIUM_CONTRACT_VERSION = "1.0.0";

/** Systems are kept strictly separate; Chaldean and Pythagorean outputs are never mixed. */
export type NumerologySystem = "CHALDEAN" | "PYTHAGOREAN" | "DATE" | "LOSHU";

export const NUMEROLOGY_PREMIUM_CONVENTIONS = {
  calculationAlphabet: "LATIN_A_Z",
  vowelSet: "AEIOU",
  yPolicy: "CONSONANT_V1", // Y (and W) are consonants in V1 (deterministic; documented)
  masterNumbers: [11, 22, 33] as const,
  chaldeanNineRule: "NO_LETTER_MAPS_TO_9", // 9 appears only as a compound total
  loShuBase: "DOB_DIGITS_ONLY_EXCLUDING_ZERO",
  loShuOverlay: "DRIVER_CONDUCTOR_SEPARATE_NEVER_MODIFY_BASE_GRID",
  lifePathMethod: "COMPONENT_REDUCTION_MASTER_PRESERVING",
  psychicMethod: "DAY_REDUCED_TO_SINGLE_DIGIT_NO_MASTER",
  compatibilityMatrix: "PLANETARY_RULERSHIP_SYMMETRIC_V1",
  // Card 12 governance: no classical source is explicitly registered for this specific
  // 81-cell matrix, so the basis is labelled honestly as product-normalized. A future
  // card may register a specific classical source (e.g., Cheiro chapter X, Sepharial
  // page Y) and relabel accordingly.
  compatibilityMatrixBasis: "PRODUCT_NORMALIZED",
  compatibilityPercentage: "NONE_STRUCTURED_STATUS_ONLY",
} as const;

export type ResultStatus =
  | "CALCULATED"
  | "TRANSLITERATION_REQUIRED"
  | "INVALID_INPUT"
  | "UNSUPPORTED"
  | "UNAVAILABLE";

export type CompatibilityStatus = "SUPPORTIVE" | "NEUTRAL" | "CHALLENGING" | "UNAVAILABLE";

// ---- Reduction ----
export type ReductionResult = {
  ruleId: string;
  input: number;
  compoundTotal: number; // pre-reduction sum where applicable
  steps: number[]; // successive sums until terminal
  value: number; // terminal single digit OR retained master number
  isMasterNumber: boolean;
};

// ---- Name normalization ----
export type NameNormalization = {
  ruleId: string;
  original: string;
  normalized: string; // uppercased, collapsed separators, diacritics folded
  latinLetters: string; // A-Z only, used for calculation
  parts: string[]; // name parts (first / middle / surname ...) after split
  status: ResultStatus;
  reason?: string;
};

// ---- Name numerology (per system) ----
export type NamePartValue = {
  part: string;
  compoundTotal: number;
  value: number; // reduced
  isMasterNumber: boolean;
};

export type NameNumerologyResult = {
  system: "CHALDEAN" | "PYTHAGOREAN";
  status: ResultStatus;
  reason?: string;
  normalization: NameNormalization;
  // Full-name numbers
  expression: ReductionResult | null; // full-name total (Destiny/Expression)
  soulUrge: ReductionResult | null; // vowels only (Pythagorean contract)
  personality: ReductionResult | null; // consonants only (Pythagorean contract)
  parts: NamePartValue[]; // per-part compound + reduced
  letterValues: Array<{ letter: string; value: number }>;
  ruleIds: string[];
};

// ---- Date numerology ----
export type DateNumerologyResult = {
  status: ResultStatus;
  reason?: string;
  input: { year: number; month: number; day: number; iso: string };
  valid: boolean;
  psychicNumber: ReductionResult | null; // Moolank / Birth Number (day reduced)
  destinyNumber: ReductionResult | null; // Bhagyank / Life Path (component reduction, master-preserving)
  compoundTotal: number | null; // sum of ALL digits before reduction
  components: {
    daySum: number;
    monthSum: number;
    yearSum: number;
    dayReduced: number;
    monthReduced: number;
    yearReduced: number;
  } | null;
  ruleIds: string[];
};

// ---- Lo Shu ----
export type LoShuResult = {
  status: ResultStatus;
  reason?: string;
  digitsUsed: number[]; // DOB digits, zeros excluded
  frequency: Record<string, number>; // "1".."9" -> count
  missingNumbers: number[];
  repeatedNumbers: number[];
  grid: number[][]; // 3x3 counts in Lo Shu arrangement
  completedLines: Array<{ id: string; type: "ROW" | "COLUMN" | "DIAGONAL"; cells: number[] }>;
  overlay: {
    // separate; does NOT modify the base grid
    driverNumber: number | null; // Psychic/Moolank
    conductorNumber: number | null; // Destiny/Bhagyank
    note: string;
  };
  ruleIds: string[];
};

// ---- Compatibility ----
export type CompatibilityResult = {
  status: CompatibilityStatus;
  system: string; // e.g. "DATE_PSYCHIC" | "PYTHAGOREAN_EXPRESSION"
  a: number | null;
  b: number | null;
  relationship: CompatibilityStatus;
  evidenceIds: string[];
  ruleIds: string[];
  reason?: string;
};

// ---- Orchestrated snapshot ----
export type PremiumNumerologyInput = {
  fullName?: string;
  nameParts?: { first?: string; middle?: string; surname?: string };
  birthDate?: string; // ISO YYYY-MM-DD
  partnerFullName?: string;
  partnerBirthDate?: string;
};

export type PremiumNumerologySnapshot = {
  status: ResultStatus;
  contractVersion: string;
  conventions: typeof NUMEROLOGY_PREMIUM_CONVENTIONS;
  date: DateNumerologyResult | null;
  chaldean: NameNumerologyResult | null;
  pythagorean: NameNumerologyResult | null;
  loShu: LoShuResult | null;
  compatibility: CompatibilityResult[];
  unavailableReasons: Array<{ system: string; code: string; message: string }>;
  disclaimer: string;
};

export const NUMEROLOGY_PREMIUM_DISCLAIMER =
  "Deterministic numerical structures only (number classifications and relationships). " +
  "Not a prediction of events, health, or outcomes; no remedies or product recommendations.";
