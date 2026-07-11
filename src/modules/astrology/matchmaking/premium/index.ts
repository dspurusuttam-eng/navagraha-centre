// Card 10.2 — Premium Matchmaking & Ashtakoot engine (internal, engine-only).
// Single authoritative scoring implementation. No public route, no persistence.

export { buildAshtakootMatchSnapshot } from "@/modules/astrology/matchmaking/premium/engine";
export {
  buildMatchPersonContext,
  nakshatraIndexOf,
  padaOf,
  signIndexOf,
  houseFromSign,
  normalizeLongitude,
} from "@/modules/astrology/matchmaking/premium/chart-context";
export {
  buildManglikComparison,
  buildManglikChartResult,
} from "@/modules/astrology/matchmaking/premium/manglik";
export {
  MATCH_RULE_REGISTRY,
  getMatchRule,
  type MatchRule,
} from "@/modules/astrology/matchmaking/premium/rule-registry";
export {
  GANA_BY_NAKSHATRA,
  NADI_BY_NAKSHATRA,
  YONI_BY_NAKSHATRA,
  VARNA_BY_SIGN,
  SIGN_LORDS,
  BHAKOOT_DOSHA_DISTANCES,
  MANGLIK_HOUSES,
} from "@/modules/astrology/matchmaking/premium/constants";
export { signDistance } from "@/modules/astrology/matchmaking/premium/bhakoot";
export { taraCount } from "@/modules/astrology/matchmaking/premium/tara";
export {
  MATCHMAKING_CONTRACT_VERSION,
  MATCHMAKING_CONVENTIONS,
  MATCHMAKING_DISCLAIMER,
  type AshtakootMatchInput,
  type AshtakootMatchSnapshot,
  type KootaComponentResult,
  type KootaKey,
  type CalculationRole,
  type ManglikComparison,
  type ManglikChartResult,
  type MatchPersonContext,
  type ExceptionResult,
} from "@/modules/astrology/matchmaking/premium/types";
