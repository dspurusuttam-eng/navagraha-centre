// Card 13.2A — Premium Muhurat Core Engine (internal, engine-only).
// Additive; does not touch src/modules/muhurta-lite/**.
// V1 delivers types + constants + immutable rule registry only.
// Factor engines, ranker, and orchestrator arrive in Card 13.2B+.

export {
  MUHURAT_PREMIUM_CONTRACT_VERSION,
  MUHURAT_PREMIUM_CONVENTIONS,
  MUHURAT_PREMIUM_DISCLAIMER,
  type MuhuratEventCategory,
  type MuhuratResultStatus,
  type MuhuratFailureCode,
  type WindowStatus,
  type FactorStatus,
  type EvidenceTier,
  type RuleBasis,
  type MuhuratEvidenceToken,
  type MuhuratProvenance,
  type MuhuratFactorId,
  type PartialFlag,
} from "@/modules/muhurta/premium/types";

export {
  MUHURAT_EVENT_CATEGORIES,
  TARA_TABLE,
  CHANDRA_BALA_TABLE,
  TITHI_CLASSIFICATION,
  NAKSHATRA_GANA,
  NAKSHATRA_ACTIVITY_CLASS,
  YOGA_CLASSIFICATION_V1,
  VARA_ELIGIBILITY_V1,
  EVENT_KARAKA_V1,
  RASHI_QUALITY,
  CATEGORY_PREFERRED_LAGNA_QUALITY,
  CATEGORY_UNIVERSAL_PROHIBITIONS,
  HARD_PROHIBITION_BASIS,
  MUHURAT_RANKING_STAGES,
  RIKTA_TITHI_CATEGORY_CAUTION_V1,
  CATEGORY_SUPPORTIVE_OVERLAYS,
  type TaraEntry,
  type ChandraBalaEntry,
  type TithiClass,
  type NakshatraGana,
  type NakshatraActivityClass,
  type YogaTier,
  type VaraTier,
  type Karaka,
  type RashiQuality,
  type HardProhibitionId,
  type RankingStageId,
  type SupportiveOverlayId,
} from "@/modules/muhurta/premium/constants";

export {
  MUHURAT_RULE_REGISTRY,
  getMuhuratRule,
  computeRulebookHash,
  type MuhuratRule,
  type MuhuratRuleSection,
} from "@/modules/muhurta/premium/rule-registry";

// Card 13.2B1 — factor engines
export {
  makeEvidenceId,
  buildPanchangFactor,
  buildTaraBalaFactor,
  computeTaraIndex,
  buildChandraBalaFactor,
  computeChandraBalaHouse,
  buildDoshaFactor,
  type MuhuratFactorResult,
  type PanchangFactorInput,
  type TaraBalaFactorInput,
  type ChandraBalaFactorInput,
  type DoshaFactorInput,
  type DoshaExternalSignals,
  buildLagnaFactor,
  buildPlanetaryFactor,
  buildSegmentFactor,
  type LagnaFactorInput,
  type PlanetaryFactorInput,
  type KarakaState,
  type SegmentFactorInput,
} from "@/modules/muhurta/premium/factors";

// Card 13.2C — ranker + orchestrator
export {
  scoreBucketTokens,
  isHardProhibited,
  detectSegmentOverlaps,
  classifyBucketStatus,
  compareBucketsForRank,
  compareWindowsForRank,
  mergeBucketsIntoWindows,
  buildProvenance,
  type ScoredBucket,
  type MuhuratWindow,
} from "@/modules/muhurta/premium/ranker";
export {
  buildMuhuratSnapshot,
  type MuhuratBucketContext,
  type MuhuratOrchestratorInput,
  type MuhuratSnapshot,
  type MuhuratRankedWindow,
} from "@/modules/muhurta/premium/orchestrator";
