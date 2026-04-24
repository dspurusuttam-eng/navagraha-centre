import path from "node:path";
import type {
  AstronomyReadyBirthContext,
  BirthContextResolutionResult,
} from "@/lib/astrology/birth-context-engine";
import { getSwissEphModule } from "@/lib/astrology/swiss-module";
import {
  validateAstronomyReadyBirthContext,
  validateBirthContextResolutionResult,
  type BirthContextValidationResult,
} from "@/lib/astrology/birth-context-validator";

const CORE_GRAHA_IDS = [
  { graha: "SUN", key: "SE_SUN" },
  { graha: "MOON", key: "SE_MOON" },
  { graha: "MARS", key: "SE_MARS" },
  { graha: "MERCURY", key: "SE_MERCURY" },
  { graha: "JUPITER", key: "SE_JUPITER" },
  { graha: "VENUS", key: "SE_VENUS" },
  { graha: "SATURN", key: "SE_SATURN" },
  { graha: "RAHU", key: "SE_TRUE_NODE" },
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

type SwissPlanetaryTransitCalculationFailureCode =
  | "INVALID_AS_OF_UTC"
  | "SWISSEPH_CALCULATION_ERROR";

export type SwissPlanetaryTransitCalculationFailure = {
  success: false;
  issue: {
    code: SwissPlanetaryTransitCalculationFailureCode;
    message: string;
  };
};

export type SwissPlanetaryTransitCalculationSuccess = {
  success: true;
  data: {
    as_of_utc: string;
    julian_day_ut: number;
    sidereal_mode: "LAHIRI";
    zodiac_mode: "SIDEREAL";
    ephemeris_mode: "SWISSEPH";
    planets: CoreGrahaSiderealLongitude[];
  };
};

export type SwissPlanetaryTransitCalculationResult =
  | SwissPlanetaryTransitCalculationFailure
  | SwissPlanetaryTransitCalculationSuccess;

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

function loadSwissModule():
  | {
      success: true;
      data: ReturnType<typeof getSwissEphModule>;
    }
  | {
      success: false;
      message: string;
    } {
  try {
    return {
      success: true,
      data: getSwissEphModule(),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Swiss Ephemeris module is unavailable: ${error.message}`
          : "Swiss Ephemeris module is unavailable in this environment.",
    };
  }
}

function toJulianDayUt(
  birthUtcIso: string,
  swisseph: ReturnType<typeof getSwissEphModule>
) {
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

function parseDateInput(value: Date | string): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

function calculatePlanetsFromJulianDayUt(
  input: {
    julianDayUt: number;
    swisseph: ReturnType<typeof getSwissEphModule>;
  }
):
  | {
      success: true;
      data: CoreGrahaSiderealLongitude[];
    }
  | {
      success: false;
      message: string;
    } {
  const planets: CoreGrahaSiderealLongitude[] = [];
  const { swisseph, julianDayUt } = input;
  const calculationFlags =
    swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;

  swisseph.swe_set_ephe_path(resolveEphemerisPath());
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

  try {
    for (const entry of CORE_GRAHA_IDS) {
      const swissephId = swisseph[entry.key];
      const result = swisseph.swe_calc_ut(
        julianDayUt,
        swissephId,
        calculationFlags
      );

      if ("error" in result) {
        return {
          success: false,
          message: `Swiss Ephemeris failed for ${entry.graha}: ${result.error}`,
        };
      }

      if (!("longitude" in result) || !Number.isFinite(result.longitude)) {
        return {
          success: false,
          message: `Swiss Ephemeris returned invalid longitude for ${entry.graha}.`,
        };
      }

      if (
        !("longitudeSpeed" in result) ||
        !Number.isFinite(result.longitudeSpeed)
      ) {
        return {
          success: false,
          message: `Swiss Ephemeris returned invalid longitude speed for ${entry.graha}.`,
        };
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
    return {
      success: false,
      message: "Rahu longitude is missing from Swiss Ephemeris output.",
    };
  }

  planets.push({
    graha: "KETU",
    sidereal_longitude: normalizeLongitude(rahu.sidereal_longitude + 180),
    longitude_speed: rahu.longitude_speed,
  });

  return {
    success: true,
    data: planets,
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

  const swissModule = loadSwissModule();

  if (!swissModule.success) {
    return fail("SWISSEPH_CALCULATION_ERROR", swissModule.message, validation);
  }

  const julianDayUt = toJulianDayUt(context.birth_utc, swissModule.data);

  if (julianDayUt === null) {
    return fail(
      "INVALID_BIRTH_UTC",
      "Birth UTC timestamp is invalid and cannot be converted to Julian day.",
      validation
    );
  }

  const calculation = calculatePlanetsFromJulianDayUt({
    julianDayUt,
    swisseph: swissModule.data,
  });

  if (!calculation.success) {
    return fail(
      "SWISSEPH_CALCULATION_ERROR",
      calculation.message,
      validation
    );
  }

  return {
    success: true,
    data: {
      birth_utc: context.birth_utc,
      julian_day_ut: julianDayUt,
      sidereal_mode: "LAHIRI",
      zodiac_mode: "SIDEREAL",
      ephemeris_mode: "SWISSEPH",
      planets: calculation.data,
    },
    validation,
  };
}

export function calculateCoreGrahaSiderealLongitudesAtUtc(input: {
  asOfUtc: Date | string;
}): SwissPlanetaryTransitCalculationResult {
  const swissModule = loadSwissModule();

  if (!swissModule.success) {
    return {
      success: false,
      issue: {
        code: "SWISSEPH_CALCULATION_ERROR",
        message: swissModule.message,
      },
    };
  }

  const asOfDate = parseDateInput(input.asOfUtc);

  if (!asOfDate) {
    return {
      success: false,
      issue: {
        code: "INVALID_AS_OF_UTC",
        message:
          "asOfUtc is invalid. Provide a valid Date instance or UTC ISO string.",
      },
    };
  }

  const julianDayUt = toJulianDayUt(asOfDate.toISOString(), swissModule.data);

  if (julianDayUt === null) {
    return {
      success: false,
      issue: {
        code: "INVALID_AS_OF_UTC",
        message:
          "asOfUtc could not be converted to Julian day. Provide a valid UTC timestamp.",
      },
    };
  }

  const calculation = calculatePlanetsFromJulianDayUt({
    julianDayUt,
    swisseph: swissModule.data,
  });

  if (!calculation.success) {
    return {
      success: false,
      issue: {
        code: "SWISSEPH_CALCULATION_ERROR",
        message: calculation.message,
      },
    };
  }

  return {
    success: true,
    data: {
      as_of_utc: asOfDate.toISOString(),
      julian_day_ut: julianDayUt,
      sidereal_mode: "LAHIRI",
      zodiac_mode: "SIDEREAL",
      ephemeris_mode: "SWISSEPH",
      planets: calculation.data,
    },
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
