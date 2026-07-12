// Card 12.1 — Premium Numerology Core Engine (internal, engine-only).
// Additive; does not touch the existing src/modules/numerology/engine.ts baseline.
// No public API, frontend, or persistence in V1.

export { buildPremiumNumerologySnapshot } from "@/modules/numerology/premium/engine";
export { calculateDateNumerology } from "@/modules/numerology/premium/date-engine";
export { calculateChaldeanNumerology } from "@/modules/numerology/premium/chaldean-engine";
export { calculatePythagoreanNumerology } from "@/modules/numerology/premium/pythagorean-engine";
export { calculateLoShu } from "@/modules/numerology/premium/loshu-engine";
export { compareNumbers } from "@/modules/numerology/premium/compatibility-engine";
export { normalizeName } from "@/modules/numerology/premium/normalizer";
export { reduce, digitSum } from "@/modules/numerology/premium/reduction";
export {
  CHALDEAN_TABLE,
  PYTHAGOREAN_TABLE,
  VOWELS_V1,
  MASTER_NUMBERS,
  LO_SHU_ARRANGEMENT,
  LO_SHU_LINES,
  COMPATIBILITY_MATRIX_V1,
  DIGIT_PLANET,
} from "@/modules/numerology/premium/constants";
export {
  NUMEROLOGY_RULE_REGISTRY,
  getNumerologyRule,
  type NumerologyRule,
} from "@/modules/numerology/premium/rule-registry";
export {
  NUMEROLOGY_PREMIUM_CONTRACT_VERSION,
  NUMEROLOGY_PREMIUM_CONVENTIONS,
  NUMEROLOGY_PREMIUM_DISCLAIMER,
  type NumerologySystem,
  type ResultStatus,
  type CompatibilityStatus,
  type ReductionResult,
  type NameNormalization,
  type NamePartValue,
  type NameNumerologyResult,
  type DateNumerologyResult,
  type LoShuResult,
  type CompatibilityResult,
  type PremiumNumerologyInput,
  type PremiumNumerologySnapshot,
} from "@/modules/numerology/premium/types";
