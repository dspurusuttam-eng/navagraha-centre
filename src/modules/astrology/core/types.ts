import type {
  HouseNumber,
  HousePlacement,
  NakshatraPlacement,
  PlanetaryBody,
  ZodiacSign,
} from "@/modules/astrology/types";

export type AstrologyReadinessStatus = "ready" | "partial" | "unavailable";

export type AstrologySafeError = {
  code: string;
  message: string;
  details?: unknown;
};

export type AstrologyPlanetPlacement = {
  body: PlanetaryBody;
  sign: ZodiacSign;
  longitude: number;
  degree: number;
  minute: number;
  house: HouseNumber;
  retrograde: boolean;
  speed?: number;
  nakshatra?: NakshatraPlacement;
  is_combust?: boolean;
};

export type AstrologyChartSummary = {
  version: "2026-05";
  chart_kind: "NATAL" | "TRANSIT_SNAPSHOT" | "DIVISIONAL" | "READINESS";
  ascendant_sign: ZodiacSign | null;
  moon_sign: ZodiacSign | null;
  dominant_bodies: PlanetaryBody[];
  supportive_bodies: PlanetaryBody[];
  challenging_bodies: PlanetaryBody[];
  active_houses: HouseNumber[];
  note: string;
};

export type AstrologyHousePlacementSummary = {
  house: HouseNumber;
  sign: ZodiacSign;
  ruler: PlanetaryBody;
  label: string;
};

export type AstrologyDignityStatus =
  | "OWN_SIGN"
  | "EXALTED"
  | "DEBILITATED"
  | "FRIEND_SIGN"
  | "ENEMY_SIGN"
  | "NEUTRAL";

export type AstrologyDignitySnapshot = {
  body: PlanetaryBody;
  sign: ZodiacSign;
  status: AstrologyDignityStatus;
  source: "standard" | "outer-planet-default";
};

export type AstrologyRuleEvaluationInput = {
  chart_kind: "NATAL" | "TRANSIT_SNAPSHOT" | "DIVISIONAL";
  as_of_utc?: string;
  planets: readonly AstrologyPlanetPlacement[];
  houses: readonly HousePlacement[];
  summary?: AstrologyChartSummary;
};

export type AstrologyInsightOutput = {
  status: AstrologyReadinessStatus;
  summary: AstrologyChartSummary;
  highlights: string[];
  cautions: string[];
  next_steps: string[];
  warnings: string[];
  error: AstrologySafeError | null;
};

export type AstrologyInfrastructureSnapshot<T> = {
  status: AstrologyReadinessStatus;
  data: T | null;
  warnings: string[];
  error: AstrologySafeError | null;
};

export type AstrologyChartLike = {
  verification?: {
    is_verified_for_chart_logic?: boolean;
  };
  lagna?: {
    sign: ZodiacSign;
    longitude: number;
    degree?: number;
    minute?: number;
    nakshatra?: NakshatraPlacement;
  };
  planets: readonly AstrologyPlanetPlacement[];
  houses: readonly HousePlacement[];
  summary?: {
    dominantBodies?: PlanetaryBody[];
    narrative?: string;
    strongestPlanets?: PlanetaryBody[];
    challengingPlanets?: PlanetaryBody[];
    challengingHouses?: HouseNumber[];
  };
  currentDasha?: {
    lord: PlanetaryBody | string;
    nextLord?: PlanetaryBody | string;
  } | null;
  remedySignals?: Array<{
    key: string;
    title: string;
    category: string;
    level: string;
    rationale: string;
    relatedBodies: PlanetaryBody[];
  }>;
  yogas?: readonly {
    key: string;
    title?: string;
    strength?: string;
  }[];
};
