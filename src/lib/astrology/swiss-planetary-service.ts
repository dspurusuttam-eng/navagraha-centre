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

const SWISS_EPHEMERIS_CALCULATION_FLAGS =
  swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;
const SIDEREAL_MODE = swisseph.SE_SIDM_LAHIRI;

const CORE_GRAHA_IDS = [
  { graha: "SUN", swissephId: swisseph.SE_SUN },
  { graha: "MOON", swissephId: swisseph.SE_MOON },
  { graha: "MARS", swissephId: swisseph.SE_MARS },
  { graha: "MERCURY", swissephId: swisseph.SE_MERCURY },
  { graha: "JUPITER", swissephId: swisseph.SE_JUPITER },
  { graha: "VENUS", swissephId: swisseph.SE_VENUS },
  { graha: "SATURN", swissephId: swisseph.SE_SATURN },
  { graha: "RAHU", swissephId: swisseph.SE_TRUE_NODE },
] as const;

export type CoreGrahaName =
  | "SUN"
  | "MOON"
  | "MARS"
  | "MERCURY"
  | "JUPITER"
  | "VENUS"
  | "SATURN"
  | "RAHU"
  | "KETU";

export type CoreGrahaSiderealLongitude = {
  graha: CoreGrahaName;
  sidereal_longitude: number;
  longitude_speed: number;
};

type SwissPlanetaryCalculationFailureCode =
  | "INVALID_BIRTH_CONTEXT"
  | "INVALID_BIRTH_UTC"
  | "SWISSEPH_CALCULATION_ERROR";

export type SwissPlanetaryCalculationFailure = {
  success: false;
  issue: {
    code: SwissPlanetaryCalculationFailureCode;
    message: string;
  };
  validation: BirthContextValidationResult;
};

export type SwissPlanetaryCalculationSuccess = {
  success: true;
  data: {
    birth_utc: string;
    julian_day_ut: number;
    sidereal_mode: "LAHIRI";
    zodiac_mode: "SIDEREAL";
    ephemeris_mode: "SWISSEPH";
    planets: CoreGrahaSiderealLongitude[];
  };
  validation: BirthContextValidationResult;
};

export type SwissPlanetaryCalculationResult =
  | SwissPlanetaryCalculationFailure
  | SwissPlanetaryCalculationSuccess;

function normalizeLongitude(value: number) {
  const normalized = value % 360;

  return normalized < 0 ? normalized + 360 : normalized;
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
  code: SwissPlanetaryCalculationFailureCode,
  message: string,
  validation: BirthContextValidationResult
): SwissPlanetaryCalculationFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
    validation,
  };
}

export function calculateCoreGrahaSiderealLongitudes(
  context: AstronomyReadyBirthContext
): SwissPlanetaryCalculationResult {
  const validation = validateAstronomyReadyBirthContext(context);

  if (!validation.is_valid_for_chart) {
    return fail(
      "INVALID_BIRTH_CONTEXT",
      "Birth context validation failed. Resolve validation errors before planetary calculation.",
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

  const planets: CoreGrahaSiderealLongitude[] = [];

  swisseph.swe_set_ephe_path(resolveEphemerisPath());
  swisseph.swe_set_sid_mode(SIDEREAL_MODE, 0, 0);

  try {
    for (const entry of CORE_GRAHA_IDS) {
      const result = swisseph.swe_calc_ut(
        julianDayUt,
        entry.swissephId,
        SWISS_EPHEMERIS_CALCULATION_FLAGS
      );

      if ("error" in result) {
        return fail(
          "SWISSEPH_CALCULATION_ERROR",
          `Swiss Ephemeris failed for ${entry.graha}: ${result.error}`,
          validation
        );
      }

      if (!("longitude" in result) || !Number.isFinite(result.longitude)) {
        return fail(
          "SWISSEPH_CALCULATION_ERROR",
          `Swiss Ephemeris returned invalid longitude for ${entry.graha}.`,
          validation
        );
      }

      if (
        !("longitudeSpeed" in result) ||
        !Number.isFinite(result.longitudeSpeed)
      ) {
        return fail(
          "SWISSEPH_CALCULATION_ERROR",
          `Swiss Ephemeris returned invalid longitude speed for ${entry.graha}.`,
          validation
        );
      }

      planets.push({
        graha: entry.graha,
        sidereal_longitude: normalizeLongitude(result.longitude),
        longitude_speed: result.longitudeSpeed,
      });
    }
  } finally {
    swisseph.swe_close();
  }

  const rahu = planets.find((planet) => planet.graha === "RAHU");

  if (!rahu) {
    return fail(
      "SWISSEPH_CALCULATION_ERROR",
      "Rahu longitude is missing from Swiss Ephemeris output.",
      validation
    );
  }

  planets.push({
    graha: "KETU",
    sidereal_longitude: normalizeLongitude(rahu.sidereal_longitude + 180),
    longitude_speed: rahu.longitude_speed,
  });

  return {
    success: true,
    data: {
      birth_utc: context.birth_utc,
      julian_day_ut: julianDayUt,
      sidereal_mode: "LAHIRI",
      zodiac_mode: "SIDEREAL",
      ephemeris_mode: "SWISSEPH",
      planets,
    },
    validation,
  };
}

export function calculateCoreGrahaSiderealLongitudesFromResolution(
  resolution: BirthContextResolutionResult
): SwissPlanetaryCalculationResult {
  const validation = validateBirthContextResolutionResult(resolution);

  if (!resolution.success) {
    return fail(
      "INVALID_BIRTH_CONTEXT",
      resolution.issue.message,
      validation
    );
  }

  return calculateCoreGrahaSiderealLongitudes(resolution.data);
}
