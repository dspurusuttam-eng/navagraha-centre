// Card 13.2A — Premium Muhurat Core: versioned contract types (engine-only).
// Additive; does not touch src/modules/muhurta-lite/**.

export const MUHURAT_PREMIUM_CONTRACT_VERSION = "1.0.0" as const;

/** Six V1 event categories (contract §4). */
export type MuhuratEventCategory =
  | "GENERAL_DAILY_ACTIVITY"
  | "SPIRITUAL_PRACTICE"
  | "BUSINESS_WORK_START"
  | "TRAVEL_START"
  | "VEHICLE_PURCHASE"
  | "EDUCATION_START";

/** Overall snapshot status (contract §16). */
export type MuhuratResultStatus =
  | "CALCULATED"
  | "PARTIAL"
  | "UNSUPPORTED_CATEGORY"
  | "UNAVAILABLE_INVALID_LOCATION"
  | "UNAVAILABLE_INVALID_DATE"
  | "UNAVAILABLE_PANCHANG_FAILED"
  | "UNAVAILABLE_HIGH_LATITUDE";

export type MuhuratFailureCode =
  | "INVALID_LOCATION"
  | "INVALID_TIMEZONE"
  | "INVALID_DATE"
  | "MISSING_LOCATION"
  | "PANCHANG_UPSTREAM_FAILED"
  | "HIGH_LATITUDE_NO_SUNRISE_SUNSET"
  | "UNSUPPORTED_CATEGORY";

/** Per-window ranked status (contract §16). */
export type WindowStatus = "SUPPORTIVE" | "NEUTRAL" | "CAUTION" | "AVOID";

/** Per-factor status (contract §16). */
export type FactorStatus =
  | "SUPPORTIVE"
  | "NEUTRAL"
  | "CAUTION"
  | "PROHIBITED"
  | "UNAVAILABLE";

/** Discrete evidence tiers (contract §11.2; matches Card 10A / Card 8 convention). */
export type EvidenceTier = -2 | -1 | 0 | 1 | 2;

/** Basis label — governance rule from Card 13.1A:
 * `classical` requires a registered source ID; otherwise `PRODUCT_NORMALIZED`. */
export type RuleBasis = "classical" | "PRODUCT_NORMALIZED";

/** Every per-window evidence token (contract §15.1). */
export type MuhuratEvidenceToken = {
  ruleId: string;
  evidenceId: string;
  factor: string;
  category: MuhuratEventCategory;
  tier: EvidenceTier;
  basis: RuleBasis;
  status: FactorStatus;
  note?: string;
};

/** Provenance token attached to every snapshot (contract §15.2). */
export type MuhuratProvenance = {
  contractVersion: typeof MUHURAT_PREMIUM_CONTRACT_VERSION;
  runtime: { node: string };
  panchangProvenance: unknown | null; // passthrough of Card 9 provenance
  rulebookHash: string; // SHA-16 of the immutable rule registry
};

/** Locked disclaimer text (contract §15.4). */
export const MUHURAT_PREMIUM_DISCLAIMER =
  "Deterministic numerical & classical windows only. Not a prediction of outcomes. " +
  "No remedies, no product recommendations, no medical/financial/legal claims.";

/** Frozen conventions (contract §11, §12, §13, §15). */
export const MUHURAT_PREMIUM_CONVENTIONS = {
  bucketResolutionMinutes: 5,
  bucketResolutionRuleId: "BUCKET_RES_5_MIN_V1",
  bucketResolutionBasis: "PRODUCT_NORMALIZED" as RuleBasis,
  taraCycleLength: 9,
  taraSequenceLength: 27,
  chandraBalaHouseCount: 12,
  chandraBalaMode: "STRICT" as const, // no aspect override in V1
  chandraBalaModeRuleId: "CHANDRA_BALA_STRICT_V1",
  taraBalaIndexingRuleId: "TARA_BALA_INDEXING_V1",
  chandraBalaIndexingRuleId: "CHANDRA_BALA_INDEXING_V1",
  taraBalaWeightingRuleId: "TARA_BALA_WEIGHTING_V1",
  scoringRuleId: "MUHURAT_RANKING_V1",
  varaEligibilityRuleId: "VARA_ELIGIBILITY_V1",
  compatibilityPercentage: "NONE_STRUCTURED_STATUS_ONLY",
} as const;

/** Public factor identifiers (per contract §5–§9). */
export type MuhuratFactorId =
  | "VARA"
  | "TITHI"
  | "NAKSHATRA"
  | "YOGA"
  | "KARANA"
  | "ABHIJIT_MUHURTA"
  | "BRAHMA_MUHURTA"
  | "GODHULI"
  | "RAHU_KAAL"
  | "GULIKA_KAAL"
  | "YAMAGANDA"
  | "TARA_BALA"
  | "CHANDRA_BALA"
  | "LAGNA_QUALITY"
  | "LAGNA_LORD_PLACEMENT"
  | "EIGHTH_HOUSE_MALEFIC"
  | "SEVENTH_HOUSE_TRAVEL"
  | "ASHTAKAVARGA_BAV"
  | "DASHA_LORD_KARAKA"
  | "KARAKA_DIGNITY"
  | "KARAKA_RETROGRADE"
  | "KARAKA_COMBUST"
  | "ECLIPSE_DAY"
  | "BHADRA"
  | "GAND_ANTA"
  | "PANCHAKA"
  | "SADE_SATI_PHASE_2"
  | "ASHTAMA_SHANI"
  | "MRITYU_BHAGA"
  | "RIKTA_TITHI";

/** Categorical partial-token flags (contract §13). */
export type PartialFlag =
  | "MISSING_JANMA_NAKSHATRA"
  | "MISSING_JANMA_RASHI"
  | "MISSING_NATAL_CHART"
  | "MISSING_DASHA_LINEAGE"
  | "MISSING_ASHTAKAVARGA"
  | "TITHI_KSHAYA"
  | "TITHI_VRIDDHI";
