import type {
  aspectTypes,
  chartPoints,
  divisionalChartCodes,
  houseNumbers,
  houseSystems,
  planetaryBodies,
  remedySignalCategories,
  signalStrengths,
  zodiacSigns,
} from "@/modules/astrology/constants";

export type ZodiacSign = (typeof zodiacSigns)[number];
export type PlanetaryBody = (typeof planetaryBodies)[number];
export type ChartPoint = (typeof chartPoints)[number];
export type AspectType = (typeof aspectTypes)[number];
export type HouseSystem = (typeof houseSystems)[number];
export type HouseNumber = (typeof houseNumbers)[number];
export type DivisionalChartCode = (typeof divisionalChartCodes)[number];
export type RemedySignalCategory = (typeof remedySignalCategories)[number];
export type SignalStrength = (typeof signalStrengths)[number];

export type BirthPlaceInput = {
  city: string;
  region?: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type BirthPlace = {
  city: string;
  region?: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type BirthDetailsInput = {
  dateLocal: string;
  timeLocal: string;
  timezone: string;
  place: BirthPlaceInput;
};

export type BirthDetails = {
  dateLocal: string;
  timeLocal: string;
  timezone: string;
  place: BirthPlace;
};

export type ChartRequestContext = {
  requestId: string;
  subjectId?: string;
  locale?: string;
};

export type TransitWindow = {
  fromDateUtc: string;
  toDateUtc: string;
};

export type NatalChartRequestInput = ChartRequestContext & {
  kind: "NATAL";
  birthDetails: BirthDetailsInput;
  houseSystem?: HouseSystem;
  requestedDivisionalCharts?: DivisionalChartCode[];
};

export type NatalChartRequest = ChartRequestContext & {
  kind: "NATAL";
  birthDetails: BirthDetails;
  houseSystem: HouseSystem;
  requestedDivisionalCharts: DivisionalChartCode[];
};

export type TransitChartRequestInput = ChartRequestContext & {
  kind: "TRANSIT_SNAPSHOT";
  birthDetails: BirthDetailsInput;
  houseSystem?: HouseSystem;
  window: TransitWindow;
};

export type TransitChartRequest = ChartRequestContext & {
  kind: "TRANSIT_SNAPSHOT";
  birthDetails: BirthDetails;
  houseSystem: HouseSystem;
  window: TransitWindow;
};

export type DivisionalChartRequestInput = ChartRequestContext & {
  kind: "DIVISIONAL";
  birthDetails: BirthDetailsInput;
  houseSystem?: HouseSystem;
  chartCode: DivisionalChartCode;
};

export type DivisionalChartRequest = ChartRequestContext & {
  kind: "DIVISIONAL";
  birthDetails: BirthDetails;
  houseSystem: HouseSystem;
  chartCode: DivisionalChartCode;
};

export type ChartRequestInput =
  | NatalChartRequestInput
  | TransitChartRequestInput
  | DivisionalChartRequestInput;

export type ChartRequest =
  | NatalChartRequest
  | TransitChartRequest
  | DivisionalChartRequest;

export type PlanetPosition = {
  body: PlanetaryBody;
  sign: ZodiacSign;
  degree: number;
  minute: number;
  house: HouseNumber;
  retrograde: boolean;
};

export type HousePlacement = {
  house: HouseNumber;
  sign: ZodiacSign;
  ruler: PlanetaryBody;
};

export type AstrologicalAspect = {
  type: AspectType;
  source: PlanetaryBody | ChartPoint;
  target: PlanetaryBody | ChartPoint;
  orb: number;
  applying: boolean;
  exact: boolean;
};

export type TransitEvent = {
  id: string;
  body: PlanetaryBody;
  sign: ZodiacSign;
  house: HouseNumber;
  startsAtUtc: string;
  endsAtUtc?: string;
  summary: string;
  intensity: SignalStrength;
};

export type DivisionalChart = {
  code: DivisionalChartCode;
  title: string;
  focus: string;
  ascendantSign: ZodiacSign;
  planets: PlanetPosition[];
  houses: HousePlacement[];
  highlights: string[];
};

export type RemedySignal = {
  key: string;
  title: string;
  category: RemedySignalCategory;
  level: SignalStrength;
  rationale: string;
  relatedBodies: PlanetaryBody[];
};

export type AstrologyResponseMetadata = {
  providerKey: string;
  fixtureKey: string;
  requestId: string;
  generatedAtUtc: string;
  deterministic: true;
  disclaimer: string;
};

export type NatalChartResponse = {
  kind: "NATAL";
  metadata: AstrologyResponseMetadata;
  birthDetails: BirthDetails;
  houseSystem: HouseSystem;
  ascendantSign: ZodiacSign;
  planets: PlanetPosition[];
  houses: HousePlacement[];
  aspects: AstrologicalAspect[];
  divisionalCharts: DivisionalChart[];
  remedySignals: RemedySignal[];
  summary: {
    dominantBodies: PlanetaryBody[];
    narrative: string;
  };
};

export type TransitChartResponse = {
  kind: "TRANSIT_SNAPSHOT";
  metadata: AstrologyResponseMetadata;
  birthDetails: BirthDetails;
  houseSystem: HouseSystem;
  window: TransitWindow;
  transits: TransitEvent[];
  aspects: AstrologicalAspect[];
  remedySignals: RemedySignal[];
};

export type DivisionalChartResponse = {
  kind: "DIVISIONAL";
  metadata: AstrologyResponseMetadata;
  birthDetails: BirthDetails;
  houseSystem: HouseSystem;
  chart: DivisionalChart;
  remedySignals: RemedySignal[];
};

export type ChartResponse =
  | NatalChartResponse
  | TransitChartResponse
  | DivisionalChartResponse;

export type AstrologyValidationIssue = {
  field: string;
  code: string;
  message: string;
};

export type AstrologyValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      issues: AstrologyValidationIssue[];
    };
