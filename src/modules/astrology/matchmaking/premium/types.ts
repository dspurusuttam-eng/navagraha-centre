// Card 10.2 — Premium Matchmaking & Ashtakoot engine: versioned contract types.
//
// Pure mathematical engine (no ephemeris, no persistence, no route). Consumes
// verified natal charts; Moon sign / nakshatra / pada are derived NUMERICALLY
// from the Moon longitude (never from display-name strings). Calculation
// roles are explicit symbolic inputs — never inferred from name, sex, gender,
// caste or identity. No marriage guarantee/rejection, no fear language, no
// remedies, no prediction prose.

export const MATCHMAKING_CONTRACT_VERSION = "1.0.0" as const;

export const MATCHMAKING_CONVENTIONS = {
  zodiac: "sidereal",
  ayanamsa: "LAHIRI",
  houseSystem: "whole_sign",
  boundaryRule: "START_INCLUSIVE_END_EXCLUSIVE",
  nakshatraDerivation: "NUMERIC_FROM_MOON_LONGITUDE",
  arithmetic: "INTEGER_AND_EXACT_HALF",
  manglikHouses: [1, 2, 4, 7, 8, 12],
  manglikCancellation: "DEFERRED",
  basis: "BPHS_PARASHARI_ASHTAKOOT",
} as const;

export type CalculationRole = "bride_role" | "groom_role";

export type KootaKey =
  | "VARNA"
  | "VASHYA"
  | "TARA"
  | "YONI"
  | "GRAHA_MAITRI"
  | "GANA"
  | "BHAKOOT"
  | "NADI";

export type Directionality = "symmetric" | "directional";

export type VarnaCategory = "BRAHMIN" | "KSHATRIYA" | "VAISHYA" | "SHUDRA";
export type VashyaClass =
  | "CHATUSHPADA"
  | "MANAVA"
  | "JALACHARA"
  | "VANACHARA"
  | "KEETA";
export type YoniAnimal =
  | "HORSE"
  | "ELEPHANT"
  | "SHEEP"
  | "SERPENT"
  | "DOG"
  | "CAT"
  | "RAT"
  | "COW"
  | "BUFFALO"
  | "TIGER"
  | "DEER"
  | "MONKEY"
  | "MONGOOSE"
  | "LION";
export type GanaGroup = "DEVA" | "MANUSHYA" | "RAKSHASA";
export type NadiGroup = "ADI" | "MADHYA" | "ANTYA";
export type ClassicalLord =
  | "SUN"
  | "MOON"
  | "MARS"
  | "MERCURY"
  | "JUPITER"
  | "VENUS"
  | "SATURN";

export type ExceptionResult = {
  exceptionId: string;
  koota: KootaKey;
  applicable: boolean;
  detail: string;
  ruleId: string;
  changesRawScore: false;
};

export type KootaComponentResult = {
  koota: KootaKey;
  rawScore: number | null;
  maximumScore: number;
  inputFactors: Record<string, string | number | null>;
  tableEntry: string;
  ruleId: string;
  calculationReference: string;
  directionality: Directionality;
  exceptionApplicable: boolean;
  exceptionResults: ExceptionResult[];
  status: "available" | "unavailable";
  unavailableReason: string | null;
};

export type ManglikReferenceResult = {
  reference: "LAGNA" | "MOON" | "VENUS";
  marsHouse: number | null;
  flagged: boolean | null;
  ruleId: string;
  status: "available" | "unavailable";
  unavailableReason: string | null;
};

export type ManglikChartResult = {
  status: "available" | "partial" | "unavailable";
  references: ManglikReferenceResult[];
  flaggedReferenceCount: number | null;
  /** Product presentation label only, never classical certainty. */
  productSeverityLabel: "none" | "single_reference" | "multi_reference" | "unavailable";
  unavailableReason: string | null;
};

export type ManglikComparison = {
  status: "balanced" | "unbalanced" | "mixed" | "unavailable";
  personA: ManglikChartResult;
  personB: ManglikChartResult;
  ruleId: string;
  detail: string;
};

export type MatchPersonContext = {
  verified: boolean;
  moonLongitude: number | null;
  moonSignIndex: number | null;
  moonSignName: string | null;
  nakshatraIndex: number | null;
  nakshatraName: string | null;
  padaIndex: number | null; // 1..4
  moonDegreeInSign: number | null;
  lagnaSignIndex: number | null;
  marsSignIndex: number | null;
  venusSignIndex: number | null;
  calculationRole: CalculationRole | null;
  unavailableReason: string | null;
};

export type AshtakootMatchInput = {
  personAChart: unknown;
  personBChart: unknown;
  calculationRoleA?: CalculationRole;
  calculationRoleB?: CalculationRole;
  includeManglik?: boolean;
  mode?: "full" | "ashtakoot_only";
  /** Display labels only; never affects calculation. */
  locale?: string;
};

export type AshtakootMatchSnapshot = {
  status: "ok" | "partial" | "unavailable";
  contractVersion: typeof MATCHMAKING_CONTRACT_VERSION;
  conventions: typeof MATCHMAKING_CONVENTIONS;
  personAContext: MatchPersonContext;
  personBContext: MatchPersonContext;
  calculationRoles: {
    personA: CalculationRole | null;
    personB: CalculationRole | null;
  };
  ashtakoot: {
    rawTotal: number;
    maximumTotal: 36;
    availableMaximumTotal: number;
    componentResults: KootaComponentResult[];
  };
  bhakootExceptionStatus: "not_applicable" | "cancellation_applicable" | "unavailable";
  nadiExceptionStatus: "not_applicable" | "cancellation_applicable" | "unavailable";
  exceptionResults: ExceptionResult[];
  manglikComparison: ManglikComparison | null;
  sourceSystemReadiness: Record<string, "ready" | "partial" | "unavailable">;
  completeness: {
    availableComponents: number;
    totalComponents: 8;
    manglikAvailable: boolean;
  };
  calculationReferences: string[];
  unavailableReasons: Array<{ system: string; code: string; message: string }>;
  flags: {
    rolesProvided: boolean;
    ashtakootOnlyMode: boolean;
    dashaCompatReady: false;
    navamshaReady: false;
    seventhHouseReady: false;
  };
  disclaimer: string;
};

export const MATCHMAKING_DISCLAIMER =
  "Traditional Ashtakoot calculation with raw scores and structured factors only. " +
  "It requires qualified Acharya review and is not a substitute for personal, medical, legal or relationship judgement.";
