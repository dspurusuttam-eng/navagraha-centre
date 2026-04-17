import type {
  CoreGrahaName,
  CoreGrahaSiderealLongitude,
  SwissPlanetaryCalculationResult,
} from "@/lib/astrology/swiss-planetary-service";

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

const GRAHA_DISPLAY_NAMES: Record<CoreGrahaName, string> = {
  SUN: "Sun",
  MOON: "Moon",
  MARS: "Mars",
  MERCURY: "Mercury",
  JUPITER: "Jupiter",
  VENUS: "Venus",
  SATURN: "Saturn",
  RAHU: "Rahu",
  KETU: "Ketu",
};

const COMBUSTION_THRESHOLDS: Partial<Record<CoreGrahaName, number>> = {
  MERCURY: 14,
  VENUS: 10,
  MARS: 17,
  JUPITER: 11,
  SATURN: 15,
};

const FULL_CIRCLE_DEGREES = 360;
const SIGN_SPAN_DEGREES = 30;
const NAKSHATRA_SPAN_DEGREES = FULL_CIRCLE_DEGREES / 27;
const PADA_SPAN_DEGREES = NAKSHATRA_SPAN_DEGREES / 4;

export type ZodiacSignName = (typeof ZODIAC_SIGNS)[number];
export type NakshatraName = (typeof NAKSHATRAS)[number];
export type NakshatraPada = 1 | 2 | 3 | 4;

export type FormattedGrahaPosition = {
  name: string;
  longitude: number;
  sign: ZodiacSignName;
  degree_in_sign: number;
  nakshatra: NakshatraName;
  pada: NakshatraPada;
  is_retrograde: boolean;
  is_combust: boolean;
};

type AstrologyFormattingFailureCode =
  | "RAW_PLANETARY_DATA_UNAVAILABLE"
  | "MISSING_SUN_LONGITUDE"
  | "INVALID_PLANET_LONGITUDE";

export type AstrologyFormattingFailure = {
  success: false;
  issue: {
    code: AstrologyFormattingFailureCode;
    message: string;
  };
};

export type AstrologyFormattingSuccess = {
  success: true;
  data: {
    sidereal_mode: "LAHIRI";
    zodiac_mode: "SIDEREAL";
    planets: FormattedGrahaPosition[];
  };
};

export type AstrologyFormattingResult =
  | AstrologyFormattingFailure
  | AstrologyFormattingSuccess;

function normalizeLongitude(value: number) {
  const normalized = value % FULL_CIRCLE_DEGREES;

  return normalized < 0 ? normalized + FULL_CIRCLE_DEGREES : normalized;
}

function getAngularDistanceDegrees(a: number, b: number) {
  const difference = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));

  return difference > 180 ? FULL_CIRCLE_DEGREES - difference : difference;
}

function formatOneGraha(
  planet: CoreGrahaSiderealLongitude,
  sunLongitude: number
): FormattedGrahaPosition {
  const normalizedLongitude = normalizeLongitude(planet.sidereal_longitude);
  const signIndex = Math.floor(normalizedLongitude / SIGN_SPAN_DEGREES);
  const degreeInSign = normalizedLongitude - signIndex * SIGN_SPAN_DEGREES;
  const nakshatraIndex = Math.floor(normalizedLongitude / NAKSHATRA_SPAN_DEGREES);
  const safeNakshatraIndex = Math.min(NAKSHATRAS.length - 1, nakshatraIndex);
  const nakshatraOffset =
    normalizedLongitude - safeNakshatraIndex * NAKSHATRA_SPAN_DEGREES;
  const padaValue = Math.floor(nakshatraOffset / PADA_SPAN_DEGREES) + 1;
  const pada = Math.min(4, Math.max(1, padaValue)) as NakshatraPada;
  const combustionThreshold = COMBUSTION_THRESHOLDS[planet.graha];
  const isCombust =
    typeof combustionThreshold === "number"
      ? getAngularDistanceDegrees(normalizedLongitude, sunLongitude) <
        combustionThreshold
      : false;

  return {
    name: GRAHA_DISPLAY_NAMES[planet.graha],
    longitude: normalizedLongitude,
    sign: ZODIAC_SIGNS[signIndex] ?? "Aries",
    degree_in_sign: degreeInSign,
    nakshatra: NAKSHATRAS[safeNakshatraIndex],
    pada,
    is_retrograde: planet.longitude_speed < 0,
    is_combust: isCombust,
  };
}

export function formatRawGrahaLongitudes(
  planets: CoreGrahaSiderealLongitude[]
): AstrologyFormattingResult {
  const sun = planets.find((planet) => planet.graha === "SUN");

  if (!sun || !Number.isFinite(sun.sidereal_longitude)) {
    return {
      success: false,
      issue: {
        code: "MISSING_SUN_LONGITUDE",
        message:
          "Sun longitude is required for combustion checks in astrology formatting.",
      },
    };
  }

  for (const planet of planets) {
    if (!Number.isFinite(planet.sidereal_longitude)) {
      return {
        success: false,
        issue: {
          code: "INVALID_PLANET_LONGITUDE",
          message: `Invalid sidereal longitude for ${planet.graha}.`,
        },
      };
    }
  }

  const formatted = planets.map((planet) =>
    formatOneGraha(planet, normalizeLongitude(sun.sidereal_longitude))
  );

  return {
    success: true,
    data: {
      sidereal_mode: "LAHIRI",
      zodiac_mode: "SIDEREAL",
      planets: formatted,
    },
  };
}

export function formatSwissPlanetaryResult(
  result: SwissPlanetaryCalculationResult
): AstrologyFormattingResult {
  if (!result.success) {
    return {
      success: false,
      issue: {
        code: "RAW_PLANETARY_DATA_UNAVAILABLE",
        message: result.issue.message,
      },
    };
  }

  return formatRawGrahaLongitudes(result.data.planets);
}
