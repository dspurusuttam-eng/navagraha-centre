// Card 8B — Premium Daily Horoscope Engine V1 (internal, engine-only).
// No public route, no persistence, no interpretation prose.

export { buildDailyHoroscopeSnapshot } from "@/modules/astrology/horoscope/engine";
export {
  buildHoroscopeChartContext,
  type BuildHoroscopeChartContextInput,
  type HoroscopeChartContext,
  type LayerState,
  type ResolvedNatal,
} from "@/modules/astrology/horoscope/context";
export {
  evaluateCategory,
  dedupeTokens,
  detectContradictions,
  resolveBand,
  resolveConfidence,
} from "@/modules/astrology/horoscope/aggregate";
export {
  buildAllCategoryEvidence,
  buildDashaEvidence,
  buildSadeSatiEvidence,
  buildGocharEvidence,
  buildSavEvidence,
  buildPanchangEvidence,
  buildDivisionalEvidence,
  applyBavGate,
} from "@/modules/astrology/horoscope/evidence";
export {
  RULE_REGISTRY,
  RULE_PREFIXES,
  getRule,
  CATEGORY_SIGNIFICATORS,
  type RuleDefinition,
  type CategorySignificator,
} from "@/modules/astrology/horoscope/rules";
export {
  HOROSCOPE_CONTRACT_VERSION,
  HOROSCOPE_CONVENTIONS,
  HOROSCOPE_CATEGORY_KEYS,
  HOROSCOPE_DISCLAIMER,
  type DailyHoroscopeSnapshot,
  type HoroscopeCategoryResult,
  type HoroscopeCategoryKey,
  type HoroscopeTimeWindow,
  type EvidenceToken,
  type EvidenceTier,
  type RatingBand,
  type ConfidenceLevel,
  type SourceSystem,
  type CategoryConfidence,
} from "@/modules/astrology/horoscope/types";
