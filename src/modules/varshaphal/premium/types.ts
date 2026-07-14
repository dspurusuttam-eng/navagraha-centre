// Card 14.2A — Premium Varshaphal / Tajika Core Engine (internal, engine-only).
// Additive; consumes certified engines read-only. V1 delivers types + constants +
// immutable rule/source registry ONLY. Solar-return, factor engines, ranker, and
// orchestrator arrive in Card 14.2B+. No public API, route, persistence, or UI.
// Contract: NAVAGRAHA-CARD-14-1 (+ 14.1A decision-lock).

export const VARSHAPHAL_PREMIUM_CONTRACT_VERSION = "1.0.0" as const;
export type VarshaphalContractVersion = typeof VARSHAPHAL_PREMIUM_CONTRACT_VERSION;

/** Source classification (Card 14.1 §16 / 14.1A). */
export type VarshaphalBasis = "CLASSICAL" | "REGISTERED_REFERENCE" | "PRODUCT_NORMALIZED";

/** Evidence tier (bounded −2..+2). */
export type VarshaphalTier = -2 | -1 | 0 | 1 | 2;

/** Per-factor evidence status. */
export type VarshaphalFactorStatus =
  | "SUPPORTIVE"
  | "NEUTRAL"
  | "CAUTION"
  | "PROHIBITED"
  | "UNAVAILABLE";

/** Snapshot-level result status. */
export type VarshaphalResultStatus =
  | "CALCULATED"
  | "PARTIAL"
  | "UNSUPPORTED"
  | "UNAVAILABLE_INVALID_INPUT";

/** Structured unavailable / partial reason codes (Card 14.1 §15.4, §13.1A). */
export type VarshaphalUnavailableCode =
  | "RETURN_NONCONVERGENCE"
  | "BIRTH_TIME_REQUIRED"
  | "HIGH_LATITUDE_ASCENDANT"
  | "EPHEMERIS_OUT_OF_RANGE"
  | "TIMEZONE_AMBIGUOUS"
  | "YEAR_LORD_INDETERMINATE"
  | "MUDDA_YEAR_LENGTH"
  | "MISSING_D3_D9"
  | "MISSING_ASHTAKAVARGA"
  | "DAY_NIGHT_INDETERMINATE";

export type VarshaphalPartialFlag = string;

/** Factor identifiers (registry sections). */
export type VarshaphalFactorId =
  | "SOLAR_RETURN"
  | "VARSHA_LAGNA"
  | "MUNTHA"
  | "TAJIKA_ASPECT"
  | "DIGNITY"
  | "COMBUSTION"
  | "RETROGRADE"
  | "PANCHAVARGEEYA_BALA"
  | "TAJIKA_YOGA"
  | "VARSHESHA"
  | "MUDDA_DASHA"
  | "ASHTAKAVARGA_OVERLAY"
  | "STATUS";

/** The seven classical grahas that carry deeptamsha / Panchavargeeya Bala. */
export type TajikaGraha =
  | "SUN"
  | "MOON"
  | "MARS"
  | "MERCURY"
  | "JUPITER"
  | "VENUS"
  | "SATURN";

/** Deterministic evidence token (Card 14.1 §15.3). */
export type VarshaphalEvidenceToken = {
  ruleId: string;
  /** Always shaped `VARSHAPHAL:...`. */
  evidenceId: string;
  factor: VarshaphalFactorId;
  tier: VarshaphalTier;
  basis: VarshaphalBasis;
  status: VarshaphalFactorStatus;
  note?: string;
};

/** Provenance block emitted on every snapshot (Card 14.1 §15.2). */
export type VarshaphalProvenance = {
  contractVersion: VarshaphalContractVersion;
  ayanamsa: "LAHIRI";
  node: "TRUE";
  houseSystem: "WHOLE_SIGN";
  returnToleranceArcsec: number;
  rulebookHash: string;
};

/** Disclaimer — declares the absence of prohibited claims (Card 14.1 §16). */
export const VARSHAPHAL_PREMIUM_DISCLAIMER: string =
  "Varshaphal (annual solar-return / Tajika) evidence is structured astrological " +
  "reference only. No remedies. Not a prediction of any life event. No medical, " +
  "financial, or mortality claim. No percentage or guaranteed certainty.";
