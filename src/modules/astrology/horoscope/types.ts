// Card 8B — Premium Daily Horoscope Engine V1: versioned type / output contract.
//
// Pure aggregation layer. Consumes the authoritative outputs of Cards 2/4/5/6/7;
// never recomputes their math. No persistence, no route, no interpretation prose.
//
// Locked conventions (Card 8A.1): sidereal LAHIRI, whole-sign houses, TRUE node
// (Ketu = Rahu + 180), Vimshottari daysPerDashaYear = 365.2425, BPHS/Parashari,
// Ashtakavarga checksum-pinned tables (SAV 337). One convention per rule.

export const HOROSCOPE_CONTRACT_VERSION = "1.0.0" as const;

export const HOROSCOPE_CONVENTIONS = {
  zodiac: "sidereal",
  ayanamsa: "LAHIRI",
  houseSystem: "whole_sign",
  nodeModel: "TRUE_NODE",
  ketuRule: "RAHU_PLUS_180",
  daysPerDashaYear: 365.2425,
  ashtakavargaSavChecksum: 337,
  basis: "BPHS_PARASHARI",
} as const;

export const HOROSCOPE_CATEGORY_KEYS = [
  "general_day_quality",
  "career_work",
  "finance_resources",
  "relationships",
  "health_routine",
  "study_planning",
  "travel_mobility",
] as const;

export type HoroscopeCategoryKey = (typeof HOROSCOPE_CATEGORY_KEYS)[number];

export type EvidenceTier = -2 | -1 | 0 | 1 | 2;

export type SourceSystem =
  | "vimshottari"
  | "gocharFromMoon"
  | "gocharFromLagna"
  | "sadeSati"
  | "ashtakavargaBAV"
  | "ashtakavargaSAV"
  | "panchang"
  | "divisional";

export type RuleBasis = "classical" | "product";

export type EvidenceFrame = "lagna" | "moon" | "sign" | "day";

export type EvidenceReference = {
  frame: EvidenceFrame;
  house?: number;
  sign?: number;
  planet?: string;
};

/** Immutable evidence token. Every field is required; no unregistered rule may
 *  produce one (the rule registry is the single source of ruleId + basis). */
export type EvidenceToken = {
  evidenceId: string;
  ruleId: string;
  sourceSystem: SourceSystem;
  category: HoroscopeCategoryKey | "global";
  tier: EvidenceTier;
  basis: string;
  classicalOrProduct: RuleBasis;
  reference: EvidenceReference;
  conditionKey: string;
  calculationReference: string;
};

export type RatingBand =
  | "strongly_supportive"
  | "supportive"
  | "mixed"
  | "cautionary"
  | "strongly_cautionary";

export type ConfidenceLevel = "high" | "moderate" | "low";

export type CategoryStatus = "available" | "unavailable";

export type EngineStatus = "ok" | "partial" | "unavailable";

export type SystemReadiness = "ready" | "degraded" | "unavailable";

export type CategoryConfidence = {
  completenessRatio: number;
  ruleCoverageRatio: number;
  contradictionPenalty: number;
  value: number;
  level: ConfidenceLevel | "insufficient";
  missingCriticalSystems: string[];
  unavailableLayers: string[];
};

export type HoroscopeCategoryResult = {
  category: HoroscopeCategoryKey;
  status: CategoryStatus;
  ratingBand: RatingBand | null;
  internalNetTier: number | null;
  confidence: CategoryConfidence;
  supportiveEvidence: EvidenceToken[];
  cautionEvidence: EvidenceToken[];
  /** Tier-0 informational tokens (e.g. BAV gate applied), kept for traceability. */
  neutralEvidence: EvidenceToken[];
  contradictionFlags: string[];
  calculationReferences: string[];
  unavailableReason: string | null;
};

export type HoroscopeTimeWindow = {
  label: string;
  kind: "supportive" | "caution";
  startLocal: string;
  endLocal: string;
  startUtc: string;
  endUtc: string;
};

export type HoroscopeUnavailableReason = {
  system: string;
  code: string;
  message: string;
};

export type HoroscopeDashaContext = {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  sookshma: string;
  prana: string;
  lineagePath: string;
};

export type HoroscopeSadeSatiContext = {
  active: boolean;
  phase: "rising" | "peak" | "setting" | null;
  saturnHouseFromMoon: number;
  saturnAffliction: "none" | "kantaka_4th" | "ashtama_8th";
};

export type DailyHoroscopeSnapshot = {
  status: EngineStatus;
  contractVersion: typeof HOROSCOPE_CONTRACT_VERSION;
  periodType: "DAILY";
  queryInstant: string | null;
  timezone: string | null;
  localDate: string;
  conventions: typeof HOROSCOPE_CONVENTIONS;
  sourceSystems: Record<string, SystemReadiness>;
  chartContextStatus: "verified" | "unverified" | "invalid";
  dashaContext: HoroscopeDashaContext | null;
  sadeSati: HoroscopeSadeSatiContext | null;
  generalDayQuality: HoroscopeCategoryResult | null;
  categories: HoroscopeCategoryResult[];
  timeWindows: HoroscopeTimeWindow[];
  confidence: {
    level: ConfidenceLevel | "insufficient";
    value: number;
  };
  unavailableReasons: HoroscopeUnavailableReason[];
  calculationReferences: string[];
  flags: {
    dayInstantFallback: boolean;
    anyContradiction: boolean;
    degradedConfidence: boolean;
    ephemerisBackedLayersAvailable: boolean;
  };
  disclaimer: string;
};

export const HOROSCOPE_DISCLAIMER =
  "Calculation reference generated from classical Vedic factors for planning guidance only. " +
  "It describes computed astrological factors, not outcomes, and is not medical, legal, or financial advice.";
