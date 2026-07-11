// Card 10A.2 — Advanced Matchmaking Completion engine: versioned contract.
//
// Adds SEPARATE advanced layers on top of the closed Card 10 Ashtakoot engine.
// Never modifies the Card 10 raw score, exception overlays or raw Manglik
// evidence. Pure (no ephemeris). No route, no persistence, no interpretation
// prose, no marriage/fertility/divorce guarantee, no caste/gender inference.

import type {
  AshtakootMatchSnapshot,
  CalculationRole,
} from "@/modules/astrology/matchmaking/premium";

export const ADVANCED_MATCH_CONTRACT_VERSION = "1.0.0" as const;

export const ADVANCED_MATCH_CONVENTIONS = {
  zodiac: "sidereal",
  ayanamsa: "LAHIRI",
  houseSystem: "whole_sign",
  nodeModel: "TRUE_NODE",
  aspectModel: "PARASHARI",
  d9Role: "CONTEXTUAL_CONFIRMS_D1_NEVER_OVERRIDES",
  dashaMahaSandhiDays: 45,
  dashaAntarSandhiDays: 10,
  karakaPolicy: "VENUS_AND_JUPITER_NON_GENDERED",
  ashtakootHandling: "CONSUMED_VERBATIM_UNCHANGED",
  basis: "BPHS_PARASHARI",
} as const;

export type { CalculationRole } from "@/modules/astrology/matchmaking/premium";

export type EvidenceTier = -2 | -1 | 0 | 1 | 2;
export type SourceLayer = "MANGLIK" | "D1" | "D9" | "DASHA";
export type SourceChart = "D1" | "D9" | "dasha" | "none";
export type PersonScope = "personA" | "personB" | "mutual";
export type RuleBasis = "classical" | "product";

export type AdvancedEvidenceToken = {
  evidenceId: string;
  ruleId: string;
  sourceLayer: SourceLayer;
  sourceChart: SourceChart;
  personScope: PersonScope;
  category: string;
  tier: EvidenceTier;
  basis: string;
  classicalOrProduct: RuleBasis;
  conditionKey: string;
  calculationReference: string;
};

export type LayerStatus = "available" | "degraded" | "unavailable";

// --- Advanced Manglik ---------------------------------------------------------

export type ManglikMitigation = {
  ruleId: string;
  personScope: "personA" | "personB";
  detail: string;
  effect: "mitigation" | "contextual";
  calculationReference: string;
};

export type AdvancedManglikResult = {
  status: LayerStatus;
  rawStatusA: "flagged" | "clear" | "unavailable";
  rawStatusB: "flagged" | "clear" | "unavailable";
  finalStatus:
    | "raw_present"
    | "mitigated"
    | "balanced"
    | "unbalanced"
    | "mixed"
    | "unavailable";
  mutualComparison: string; // mirrors Card 10 manglikComparison.status
  mitigations: ManglikMitigation[];
  d9Context: string[];
  ruleId: string;
  detail: string;
};

// --- D1 / D9 factor snapshots -------------------------------------------------

export type PlanetCondition = {
  planet: string;
  signIndex: number | null;
  house: number | null;
  dignity: "own" | "exalted" | "debilitated" | "neutral" | "unavailable";
};

export type NatalPersonFactors = {
  lagnaSignIndex: number | null;
  lagnaLord: string | null;
  seventhSignIndex: number | null;
  seventhLord: string | null;
  seventhLordHouse: number | null;
  seventhLordDignity: PlanetCondition["dignity"];
  seventhHouseOccupants: string[];
  beneficAspectsSeventh: boolean;
  maleficAspectsSeventh: boolean;
  venus: PlanetCondition;
  jupiter: PlanetCondition;
  mars: PlanetCondition;
  moon: PlanetCondition;
};

export type NatalCompatibilityResult = {
  status: LayerStatus;
  personAFactors: NatalPersonFactors | null;
  personBFactors: NatalPersonFactors | null;
  mutualFactors: AdvancedEvidenceToken[];
  evidenceTokens: AdvancedEvidenceToken[];
};

export type NavamshaPersonFactors = {
  d9LagnaSignIndex: number | null;
  d9LagnaLord: string | null;
  d9SeventhSignIndex: number | null;
  d9SeventhLord: string | null;
  d9Venus: PlanetCondition;
  d9Jupiter: PlanetCondition;
  d9Mars: PlanetCondition;
  vargottamaBodies: string[];
};

export type NavamshaCompatibilityResult = {
  status: LayerStatus;
  personAFactors: NavamshaPersonFactors | null;
  personBFactors: NavamshaPersonFactors | null;
  mutualFactors: AdvancedEvidenceToken[];
  d1d9Reinforcement: AdvancedEvidenceToken[];
};

// --- Dasha compatibility ------------------------------------------------------

export type DashaPeriodContext = {
  mahadashaLord: string | null;
  antardashaLord: string | null;
  pratyantardashaLord: string | null;
  relationshipActivation: string[]; // which relationship significators are active
  mahaSandhi: boolean;
  antarSandhi: boolean;
  lineagePath: string | null;
};

export type DashaCompatibilityResult = {
  status: LayerStatus;
  personA: DashaPeriodContext | null;
  personB: DashaPeriodContext | null;
  simultaneousSandhi: boolean;
  oneSidedSandhi: boolean;
  overlapFindings: AdvancedEvidenceToken[];
  sandhiFindings: AdvancedEvidenceToken[];
};

// --- Engine input / output ----------------------------------------------------

export type AdvancedMatchInput = {
  personAChart: unknown;
  personBChart: unknown;
  calculationRoleA?: CalculationRole;
  calculationRoleB?: CalculationRole;
  evaluationInstant?: string;
  evaluationWindow?: { fromUtc: string; toUtc: string };
  mode?: "full" | "ashtakoot_only";
  locale?: string;
};

export type OverallBand =
  | "supportive"
  | "mixed"
  | "caution"
  | "incomplete"
  | "unavailable";

export type AdvancedMatchSnapshot = {
  status: "ok" | "partial" | "unavailable";
  contractVersion: typeof ADVANCED_MATCH_CONTRACT_VERSION;
  conventions: typeof ADVANCED_MATCH_CONVENTIONS;
  evaluationInstant: string;
  evaluationWindow: { fromUtc: string; toUtc: string } | null;
  calculationRoles: {
    personA: CalculationRole | null;
    personB: CalculationRole | null;
  };
  card10AshtakootResult: AshtakootMatchSnapshot;
  advancedManglik: AdvancedManglikResult;
  natalCompatibility: NatalCompatibilityResult;
  navamshaCompatibility: NavamshaCompatibilityResult;
  dashaCompatibility: DashaCompatibilityResult;
  supportiveEvidence: AdvancedEvidenceToken[];
  cautionEvidence: AdvancedEvidenceToken[];
  neutralEvidence: AdvancedEvidenceToken[];
  contradictionFlags: string[];
  sourceSystemReadiness: Record<string, LayerStatus>;
  completeness: {
    availableLayers: number;
    totalLayers: 4; // advanced layers (excluding Ashtakoot which is verbatim)
  };
  overallBand: OverallBand;
  requiresAcharyaReview: boolean;
  unavailableReasons: Array<{ layer: string; code: string; message: string }>;
  calculationReferences: string[];
  flags: {
    ashtakootOnlyMode: boolean;
    d9LayerReady: boolean;
    dashaLayerReady: boolean;
    birthTimeDependentDegraded: boolean;
  };
  disclaimer: string;
};

export const ADVANCED_MATCH_DISCLAIMER =
  "Advanced traditional matchmaking calculation: separate structural layers (Ashtakoot, Manglik, D1, D9, Dasha) " +
  "with raw scores and structured evidence only. It requires qualified Acharya review and is not a substitute for " +
  "personal, medical, legal or relationship judgement.";
