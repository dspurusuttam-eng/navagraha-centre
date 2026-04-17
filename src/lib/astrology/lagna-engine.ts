import "server-only";

import path from "node:path";
import swisseph from "swisseph";
import type {
  AstronomyReadyBirthContext,
  BirthContextResolutionResult,
} from "@/lib/astrology/birth-context-engine";
import {
  validateAstronomyReadyBirthContext,
  validateBirthContextResolutionResult,
  type BirthContextValidationResult,
} from "@/lib/astrology/birth-context-validator";

const SIDEREAL_MODE = swisseph.SE_SIDM_LAHIRI;
const HOUSE_FLAGS = swisseph.SEFLG_SIDEREAL;
const HOUSE_SYSTEM = "P";

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

const FULL_CIRCLE_DEGREES = 360;
const SIGN_SPAN_DEGREES = 30;
const NAKSHATRA_SPAN_DEGREES = FULL_CIRCLE_DEGREES / 27;
const PADA_SPAN_DEGREES = NAKSHATRA_SPAN_DEGREES / 4;

export type LagnaSignName = (typeof ZODIAC_SIGNS)[number];
export type LagnaNakshatraName = (typeof NAKSHATRAS)[number];
export type LagnaNakshatraPada = 1 | 2 | 3 | 4;

type LagnaCalculationFailureCode =
  | "INVALID_BIRTH_CONTEXT"
  | "INVALID_BIRTH_UTC"
  | "SWISSEPH_ASCENDANT_ERROR"
  | "INVALID_ASCENDANT_LONGITUDE";

export type LagnaCalculationFailure = {
  success: false;
  issue: {
    code: LagnaCalculationFailureCode;
    message: string;
  };
  validation: BirthContextValidationResult;
};

export type LagnaCalculationSuccess = {
  success: true;
  data: {
    birth_utc: string;
    sidereal_mode: "LAHIRI";
    ayanamsha: "LAHIRI";
    house_system: "PLACIDUS";
    longitude: number;
    sign: LagnaSignName;
    degree_in_sign: number;
    nakshatra: LagnaNakshatraName;
    pada: LagnaNakshatraPada;
    coordinates_used: {
      latitude: number;
      longitude: number;
      display_name: string;
    };
  };
  validation: BirthContextValidationResult;
};

export type LagnaCalculationResult =
  | LagnaCalculationFailure
  | LagnaCalculationSuccess;

function normalizeLongitude(value: number) {
  const normalized = value % FULL_CIRCLE_DEGREES;

  return normalized < 0 ? normalized + FULL_CIRCLE_DEGREES : normalized;
}

function resolveEphemerisPath() {
  return (
    process.env.SWISSEPH_EPHE_PATH?.trim() ||
    path.join(process.cwd(), "node_modules", "swisseph", "ephe")
  );
}

function toJulianDayUt(birthUtcIso: string) {
  const utcDate = new Date(birthUtcIso);

  if (Number.isNaN(utcDate.getTime())) {
    return null;
  }

  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const hourDecimal =
    utcDate.getUTCHours() +
    utcDate.getUTCMinutes() / 60 +
    utcDate.getUTCSeconds() / 3600 +
    utcDate.getUTCMilliseconds() / 3_600_000;

  return swisseph.swe_julday(
    year,
    month,
    day,
    hourDecimal,
    swisseph.SE_GREG_CAL
  );
}

function fail(
  code: LagnaCalculationFailureCode,
  message: string,
  validation: BirthContextValidationResult
): LagnaCalculationFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
    validation,
  };
}

function getSign(longitude: number) {
  const signIndex = Math.floor(longitude / SIGN_SPAN_DEGREES);

  return ZODIAC_SIGNS[signIndex] ?? "Aries";
}

function getDegreeInSign(longitude: number) {
  const signIndex = Math.floor(longitude / SIGN_SPAN_DEGREES);

  return longitude - signIndex * SIGN_SPAN_DEGREES;
}

function getNakshatra(longitude: number) {
  const index = Math.floor(longitude / NAKSHATRA_SPAN_DEGREES);
  const safeIndex = Math.min(NAKSHATRAS.length - 1, Math.max(0, index));

  return NAKSHATRAS[safeIndex];
}

function getPada(longitude: number): LagnaNakshatraPada {
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN_DEGREES);
  const safeNakshatraIndex = Math.min(
    NAKSHATRAS.length - 1,
    Math.max(0, nakshatraIndex)
  );
  const offset = longitude - safeNakshatraIndex * NAKSHATRA_SPAN_DEGREES;
  const padaValue = Math.floor(offset / PADA_SPAN_DEGREES) + 1;

  return Math.min(4, Math.max(1, padaValue)) as LagnaNakshatraPada;
}

export function calculateSiderealLagna(
  context: AstronomyReadyBirthContext
): LagnaCalculationResult {
  const validation = validateAstronomyReadyBirthContext(context);

  if (!validation.is_valid_for_chart) {
    return fail(
      "INVALID_BIRTH_CONTEXT",
      "Birth context validation failed. Resolve validation errors before Lagna calculation.",
      validation
    );
  }

  const julianDayUt = toJulianDayUt(context.birth_utc);

  if (julianDayUt === null) {
    return fail(
      "INVALID_BIRTH_UTC",
      "Birth UTC timestamp is invalid and cannot be converted to Julian day.",
      validation
    );
  }

  swisseph.swe_set_ephe_path(resolveEphemerisPath());
  swisseph.swe_set_sid_mode(SIDEREAL_MODE, 0, 0);

  try {
    const houseResult = swisseph.swe_houses_ex(
      julianDayUt,
      HOUSE_FLAGS,
      context.normalized_place.latitude,
      context.normalized_place.longitude,
      HOUSE_SYSTEM
    );

    if ("error" in houseResult) {
      return fail(
        "SWISSEPH_ASCENDANT_ERROR",
        `Swiss Ephemeris ascendant calculation failed: ${houseResult.error}`,
        validation
      );
    }

    if (
      !("ascendant" in houseResult) ||
      !Number.isFinite(houseResult.ascendant)
    ) {
      return fail(
        "INVALID_ASCENDANT_LONGITUDE",
        "Swiss Ephemeris returned an invalid ascendant longitude.",
        validation
      );
    }

    const lagnaLongitude = normalizeLongitude(houseResult.ascendant);
    const lagnaSign = getSign(lagnaLongitude);
    const lagnaDegreeInSign = getDegreeInSign(lagnaLongitude);
    const lagnaNakshatra = getNakshatra(lagnaLongitude);
    const lagnaPada = getPada(lagnaLongitude);

    return {
      success: true,
      data: {
        birth_utc: context.birth_utc,
        sidereal_mode: "LAHIRI",
        ayanamsha: "LAHIRI",
        house_system: "PLACIDUS",
        longitude: lagnaLongitude,
        sign: lagnaSign,
        degree_in_sign: lagnaDegreeInSign,
        nakshatra: lagnaNakshatra,
        pada: lagnaPada,
        coordinates_used: {
          latitude: context.normalized_place.latitude,
          longitude: context.normalized_place.longitude,
          display_name: context.normalized_place.display_name,
        },
      },
      validation,
    };
  } finally {
    swisseph.swe_close();
  }
}

export function calculateSiderealLagnaFromResolution(
  resolution: BirthContextResolutionResult
): LagnaCalculationResult {
  const validation = validateBirthContextResolutionResult(resolution);

  if (!resolution.success) {
    return fail("INVALID_BIRTH_CONTEXT", resolution.issue.message, validation);
  }

  return calculateSiderealLagna(resolution.data);
}
