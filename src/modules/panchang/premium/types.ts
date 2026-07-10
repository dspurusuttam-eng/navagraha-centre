// Card 9.2 — Premium Panchang / Hora / Choghadiya engine: versioned contract.
//
// Pure mathematical timing engine extending the Card 2 Panchang foundation.
// No interpretation, no prediction, no remedy, no festival content. Engine-only:
// no route, no persistence, no migration.
//
// Locked conventions (Card 9.1 contract): sidereal LAHIRI; geocentric apparent
// Sun/Moon longitudes; topocentric refracted upper-limb rise/set at 0 m
// elevation; sunrise-to-next-sunrise Panchang day; pre-sunrise instant belongs
// to the previous Vara; start-inclusive/end-exclusive intervals; transition
// solver tolerance <= 1 s; minute-level presentation only after calculation;
// supported dates 1900-01-01..2100-12-31; no silent fallback.

export const PREMIUM_PANCHANG_CONTRACT_VERSION = "1.0.0" as const;

export const PREMIUM_PANCHANG_CONVENTIONS = {
  zodiac: "sidereal",
  ayanamsa: "LAHIRI",
  riseModel: "TOPOCENTRIC_UPPER_LIMB_REFRACTION",
  observerElevationMeters: 0,
  dayBoundary: "SUNRISE_TO_SUNRISE",
  intervalRule: "START_INCLUSIVE_END_EXCLUSIVE",
  transitionPrecisionSeconds: 1,
  brahmaMuhurtaConvention: "FIXED_48MIN_MUHURTA",
  supportedDateRange: { from: "1900-01-01", to: "2100-12-31" },
} as const;

export type HoraPlanet =
  | "SUN"
  | "MOON"
  | "MARS"
  | "MERCURY"
  | "JUPITER"
  | "VENUS"
  | "SATURN";

export type ChoghadiyaKey =
  | "AMRIT"
  | "SHUBH"
  | "LABH"
  | "CHAL"
  | "ROG"
  | "KAAL"
  | "UDVEG";

export type ChoghadiyaClassification =
  | "supportive"
  | "neutral_movable"
  | "caution";

export type PremiumTimedPeriod = {
  type: string;
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
  timezone: string;
  status: "available";
  ruleId: string;
  calculationReference: string;
};

export type HoraInterval = PremiumTimedPeriod & {
  index: number; // 1..24 across the Panchang day
  half: "day" | "night";
  lord: HoraPlanet;
};

export type ChoghadiyaInterval = PremiumTimedPeriod & {
  index: number; // 1..8 within its half
  half: "day" | "night";
  key: ChoghadiyaKey;
  name: string;
  classification: ChoghadiyaClassification;
};

export type PremiumElementState = {
  index: number;
  name: string;
  startUtc: string;
  endUtc: string;
  progressPercent: number;
  next: { index: number; name: string };
  ruleId: string;
  calculationReference: string;
};

export type PremiumNakshatraState = PremiumElementState & {
  pada: 1 | 2 | 3 | 4;
};

export type PremiumTransition = {
  element: "tithi" | "nakshatra" | "yoga" | "karana";
  atUtc: string;
  atLocal: string;
  fromIndex: number;
  fromName: string;
  toIndex: number;
  toName: string;
  ruleId: string;
};

export type PremiumSunEvent = {
  utc: string;
  local: string;
};

export type PremiumVara = {
  index: number; // 0=Sunday..6=Saturday, weekday of the Panchang day
  name: string;
  panchangDayDate: string; // local date whose sunrise starts the Panchang day
  ruleId: string;
};

export type PremiumFlags = {
  preSunriseInstant: boolean;
  moonEventsPartial: boolean;
  nightSpanUnavailable: boolean;
  elevationApplied: false;
  timezoneCoordinateSuspect: boolean;
};

export type PremiumUnavailableReason = {
  system: string;
  code: string;
  message: string;
};

export type PremiumPanchangSnapshot = {
  status: "ok" | "degraded" | "unavailable";
  contractVersion: typeof PREMIUM_PANCHANG_CONTRACT_VERSION;
  conventions: typeof PREMIUM_PANCHANG_CONVENTIONS;
  queryInstant: string | null;
  localDate: string;
  timezone: string;
  coordinates: { latitude: number; longitude: number };
  panchangDay: { startUtc: string; endUtc: string } | null;
  sunrise: PremiumSunEvent | null;
  sunset: PremiumSunEvent | null;
  nextSunrise: PremiumSunEvent | null;
  moonrise: PremiumSunEvent | null;
  moonset: PremiumSunEvent | null;
  vara: PremiumVara | null;
  paksha: "Shukla" | "Krishna" | null;
  tithi: PremiumElementState | null;
  nakshatra: PremiumNakshatraState | null;
  yoga: PremiumElementState | null;
  karana: PremiumElementState | null;
  transitions: PremiumTransition[];
  rahuKaal: PremiumTimedPeriod | null;
  yamaganda: PremiumTimedPeriod | null;
  gulika: PremiumTimedPeriod | null;
  abhijit: (PremiumTimedPeriod & { wednesdayExclusionConvention: boolean }) | null;
  brahmaMuhurta: (PremiumTimedPeriod & { convention: "FIXED_48MIN_MUHURTA" }) | null;
  horas: HoraInterval[];
  choghadiyaDay: ChoghadiyaInterval[];
  choghadiyaNight: ChoghadiyaInterval[];
  sourceSystemReadiness: Record<string, "ready" | "degraded" | "unavailable">;
  calculationReferences: string[];
  unavailableReasons: PremiumUnavailableReason[];
  flags: PremiumFlags;
};

export type PremiumPanchangInput = {
  localDate?: string;
  queryInstant?: string;
  latitude: number;
  longitude: number;
  timezoneIana: string;
  /** Accepted for forward-compatibility; V1 calculation is locked at 0 m. */
  elevationMeters?: number;
  /** Display names only; never affects calculation. */
  locale?: string;
};

export type PremiumPanchangFailureCode =
  | "MISSING_DATE_OR_INSTANT"
  | "INVALID_DATE"
  | "INVALID_QUERY_INSTANT"
  | "DATE_INSTANT_MISMATCH"
  | "INVALID_COORDINATES"
  | "INVALID_TIMEZONE"
  | "UNSUPPORTED_DATE_RANGE"
  | "EPHEMERIS_UNAVAILABLE"
  | "SUN_EVENT_CALCULATION_FAILED"
  | "TRANSITION_CALCULATION_FAILED";

export type PremiumPanchangResult =
  | { success: true; data: PremiumPanchangSnapshot }
  | {
      success: false;
      error: { code: PremiumPanchangFailureCode; message: string };
    };

// --- Injectable ephemeris seams (deterministic Node 24 QA) -------------------

/** Sidereal geocentric Sun/Moon longitudes at a UTC instant, or null. */
export type SunMoonSampler = (
  utc: Date
) => { sunLongitude: number; moonLongitude: number } | null;

export type RiseSetBundle = {
  sunriseUtc: string | null;
  sunsetUtc: string | null;
  nextSunriseUtc: string | null;
  moonriseUtc: string | null;
  moonsetUtc: string | null;
};

/** Rise/set events for a local calendar date at a location, or per-field null. */
export type RiseSetProvider = (input: {
  dateLocal: string;
  latitude: number;
  longitude: number;
  timezoneIana: string;
}) => RiseSetBundle;
