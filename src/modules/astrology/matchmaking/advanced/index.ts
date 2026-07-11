// Card 10A.2 — Advanced Matchmaking Completion engine (internal, engine-only).
// Consumes Cards 10/4/5; adds separate advanced layers. No route, no persistence.

export { buildAdvancedMatchmakingSnapshot } from "@/modules/astrology/matchmaking/advanced/engine";
export { buildAdvancedChartContext, type AdvancedChartContext } from "@/modules/astrology/matchmaking/advanced/chart-context";
export { buildAdvancedManglik } from "@/modules/astrology/matchmaking/advanced/manglik-advanced";
export { buildNatalCompatibility } from "@/modules/astrology/matchmaking/advanced/natal-compatibility";
export { buildNavamshaCompatibility } from "@/modules/astrology/matchmaking/advanced/navamsha-compatibility";
export { buildDashaCompatibility } from "@/modules/astrology/matchmaking/advanced/dasha-compatibility";
export { resolveContradictions } from "@/modules/astrology/matchmaking/advanced/contradiction-resolver";
export { makeToken, dedupeTokens, splitEvidence } from "@/modules/astrology/matchmaking/advanced/evidence";
export {
  aspectsHouse,
  dignityOf,
  signLordOf,
  houseFromSign,
} from "@/modules/astrology/matchmaking/advanced/constants";
export {
  ADVANCED_RULE_REGISTRY,
  getAdvancedRule,
  type AdvancedRule,
} from "@/modules/astrology/matchmaking/advanced/rule-registry";
export {
  ADVANCED_MATCH_CONTRACT_VERSION,
  ADVANCED_MATCH_CONVENTIONS,
  ADVANCED_MATCH_DISCLAIMER,
  type AdvancedMatchInput,
  type AdvancedMatchSnapshot,
  type AdvancedEvidenceToken,
  type EvidenceTier,
  type OverallBand,
  type CalculationRole,
  type AdvancedManglikResult,
  type NatalCompatibilityResult,
  type NavamshaCompatibilityResult,
  type DashaCompatibilityResult,
} from "@/modules/astrology/matchmaking/advanced/types";
