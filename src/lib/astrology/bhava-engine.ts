import "server-only";

import path from "node:path";
import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import {
  buildWholeSignHouseStructureFromContext,
  type HouseNumber,
  type WholeSignHouseEngineResult,
} from "@/lib/astrology/house-engine";
import { getSwissEphModule } from "@/lib/astrology/swiss-module";
import {
  calculateSiderealLagna,
  type LagnaCalculationResult,
} from "@/lib/astrology/lagna-engine";
import {
  validateAstronomyReadyBirthContext,
  type BirthContextValidationResult,
} from "@/lib/astrology/birth-context-validator";

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

const CUSP_LAGNA_ALIGNMENT_TOLERANCE_DEGREES = 0.5;

type BhavaSign = (typeof ZODIAC_SIGNS)[number];
type BhavaIntegrityStatus = "VERIFIED" | "WARNINGS" | "FAILED";

type BhavaCalculationFailureCode =
  | "INVALID_BIRTH_CONTEXT"
  | "INVALID_BIRTH_UTC"
  | "SWISSEPH_HOUSE_CUSP_ERROR"
  | "INVALID_CUSP_DATA";

type BhavaIntegrityCode =
  | "LAGNA_UNAVAILABLE"
  | "WHOLE_SIGN_UNAVAILABLE"
  | "CUSP_UNAVAILABLE"
  | "CUSP_COUNT_INVALID"
  | "CUSP_OUT_OF_RANGE"
  | "CUSP_LAGNA_MISMATCH"
  | "PLANET_PLACEMENT_INVALID_HOUSE"
  | "PLANET_PLACEMENT_DUPLICATE"
  | "PLANET_PLACEMENT_SIGN_MISMATCH"
  | "HOUSE_SIGN_DIVERGENCE";

export type BhavaCuspPoint = {
  house: HouseNumber;
  longitude: number;
  sign: BhavaSign;
  degree_in_sign: number;
  speed: number | null;
};

export type BhavaCuspCalculationFailure = {
  success: false;
  issue: {
    code: BhavaCalculationFailureCode;
    message: string;
  };
  validation: BirthContextValidationResult;
};

export type BhavaCuspCalculationSuccess = {
  success: true;
  data: {
    birth_utc: string;
    sidereal_mode: "LAHIRI";
    ayanamsha: "LAHIRI";
    house_system: "PLACIDUS";
    cusps: BhavaCuspPoint[];
  };
  validation: BirthContextValidationResult;
};

export type BhavaCuspCalculationResult =
  | BhavaCuspCalculationFailure
  | BhavaCuspCalculationSuccess;

export type BhavaIntegrityIssue = {
  code: BhavaIntegrityCode;
  message: string;
  house: HouseNumber | null;
  planet: string | null;
};

export type BhavaIntegrityResult = {
  is_verified_for_chart_logic: boolean;
  verification_status: BhavaIntegrityStatus;
  errors: BhavaIntegrityIssue[];
  warnings: BhavaIntegrityIssue[];
};

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
  const swisseph = getSwissEphModule();
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

function getSign(longitude: number): BhavaSign {
  const normalized = normalizeLongitude(longitude);
  const signIndex = Math.floor(normalized / 30);

  return ZODIAC_SIGNS[signIndex] ?? "Aries";
}

function getDegreeInSign(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const signIndex = Math.floor(normalized / 30);

  return normalized - signIndex * 30;
}

function failBhavaCusp(
  code: BhavaCalculationFailureCode,
  message: string,
  validation: BirthContextValidationResult
): BhavaCuspCalculationFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
    validation,
  };
}

function asHouseNumber(value: number): HouseNumber {
  return value as HouseNumber;
}

function extractCuspArray(houseValues: number[]) {
  if (houseValues.length === 12) {
    return houseValues;
  }

  if (houseValues.length >= 13) {
    return houseValues.slice(1, 13);
  }

  return null;
}

function addError(
  errors: BhavaIntegrityIssue[],
  code: BhavaIntegrityCode,
  message: string,
  input: {
    house?: HouseNumber | null;
    planet?: string | null;
  } = {}
) {
  errors.push({
    code,
    message,
    house: input.house ?? null,
    planet: input.planet ?? null,
  });
}

function addWarning(
  warnings: BhavaIntegrityIssue[],
  code: BhavaIntegrityCode,
  message: string,
  input: {
    house?: HouseNumber | null;
    planet?: string | null;
  } = {}
) {
  warnings.push({
    code,
    message,
    house: input.house ?? null,
    planet: input.planet ?? null,
  });
}

function buildBhavaIntegrity(input: {
  lagnaResult: LagnaCalculationResult;
  wholeSignResult: WholeSignHouseEngineResult;
  cuspResult: BhavaCuspCalculationResult;
}): BhavaIntegrityResult {
  const errors: BhavaIntegrityIssue[] = [];
  const warnings: BhavaIntegrityIssue[] = [];

  if (!input.lagnaResult.success) {
    addError(errors, "LAGNA_UNAVAILABLE", input.lagnaResult.issue.message);
  }

  if (!input.wholeSignResult.success) {
    addError(
      errors,
      "WHOLE_SIGN_UNAVAILABLE",
      input.wholeSignResult.issue.message
    );
  }

  if (!input.cuspResult.success) {
    addError(errors, "CUSP_UNAVAILABLE", input.cuspResult.issue.message);
  }

  if (
    input.lagnaResult.success &&
    input.wholeSignResult.success &&
    input.cuspResult.success
  ) {
    const cusps = input.cuspResult.data.cusps;

    if (cusps.length !== 12) {
      addError(
        errors,
        "CUSP_COUNT_INVALID",
        `Expected 12 cusps, received ${cusps.length}.`
      );
    }

    for (const cusp of cusps) {
      if (!Number.isFinite(cusp.longitude) || cusp.longitude < 0 || cusp.longitude >= 360) {
        addError(
          errors,
          "CUSP_OUT_OF_RANGE",
          `Cusp longitude for house ${cusp.house} is outside [0, 360): ${cusp.longitude}.`,
          { house: cusp.house }
        );
      }
    }

    const cusp1 = cusps.find((cusp) => cusp.house === 1);
    const lagnaLongitude = normalizeLongitude(input.lagnaResult.data.longitude);

    if (cusp1) {
      const deviation = Math.abs(cusp1.longitude - lagnaLongitude);

      if (deviation > CUSP_LAGNA_ALIGNMENT_TOLERANCE_DEGREES) {
        addError(
          errors,
          "CUSP_LAGNA_MISMATCH",
          `House 1 cusp and Lagna longitude diverge by ${deviation.toFixed(6)} deg.`,
          { house: 1 }
        );
      }
    }

    const houseByNumber = new Map(
      input.wholeSignResult.data.houses.map((house) => [house.house, house.sign])
    );
    const seenPlanets = new Set<string>();

    for (const placement of input.wholeSignResult.data.planets) {
      if (placement.house < 1 || placement.house > 12) {
        addError(
          errors,
          "PLANET_PLACEMENT_INVALID_HOUSE",
          `${placement.planet} has invalid house value ${placement.house}.`,
          { house: placement.house, planet: placement.planet }
        );
      }

      if (seenPlanets.has(placement.planet)) {
        addError(
          errors,
          "PLANET_PLACEMENT_DUPLICATE",
          `${placement.planet} appears more than once in house placements.`,
          { planet: placement.planet }
        );
      } else {
        seenPlanets.add(placement.planet);
      }

      const houseSign = houseByNumber.get(placement.house);

      if (houseSign && houseSign !== placement.sign) {
        addError(
          errors,
          "PLANET_PLACEMENT_SIGN_MISMATCH",
          `${placement.planet} sign ${placement.sign} does not match house ${placement.house} sign ${houseSign}.`,
          { house: placement.house, planet: placement.planet }
        );
      }
    }

    const cuspByHouse = new Map(cusps.map((cusp) => [cusp.house, cusp]));

    for (const house of input.wholeSignResult.data.houses) {
      const cusp = cuspByHouse.get(house.house);

      if (!cusp) {
        continue;
      }

      if (cusp.sign !== house.sign) {
        addWarning(
          warnings,
          "HOUSE_SIGN_DIVERGENCE",
          `House ${house.house} whole-sign ${house.sign} differs from cusp sign ${cusp.sign}.`,
          { house: house.house }
        );
      }
    }
  }

  if (errors.length > 0) {
    return {
      is_verified_for_chart_logic: false,
      verification_status: "FAILED",
      errors,
      warnings,
    };
  }

  if (warnings.length > 0) {
    return {
      is_verified_for_chart_logic: true,
      verification_status: "WARNINGS",
      errors,
      warnings,
    };
  }

  return {
    is_verified_for_chart_logic: true,
    verification_status: "VERIFIED",
    errors,
    warnings,
  };
}

export function calculateSiderealBhavaCusps(
  context: AstronomyReadyBirthContext
): BhavaCuspCalculationResult {
  const validation = validateAstronomyReadyBirthContext(context);

  if (!validation.is_valid_for_chart) {
    return failBhavaCusp(
      "INVALID_BIRTH_CONTEXT",
      "Birth context validation failed. Resolve validation errors before cusp calculation.",
      validation
    );
  }

  const julianDayUt = toJulianDayUt(context.birth_utc);
  const swisseph = getSwissEphModule();

  if (julianDayUt === null) {
    return failBhavaCusp(
      "INVALID_BIRTH_UTC",
      "Birth UTC timestamp is invalid and cannot be converted to Julian day.",
      validation
    );
  }

  swisseph.swe_set_ephe_path(resolveEphemerisPath());
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

  try {
    const result = swisseph.swe_houses_ex2(
      julianDayUt,
      swisseph.SEFLG_SIDEREAL,
      context.normalized_place.latitude,
      context.normalized_place.longitude,
      HOUSE_SYSTEM
    );

    if ("error" in result) {
      return failBhavaCusp(
        "SWISSEPH_HOUSE_CUSP_ERROR",
        `Swiss Ephemeris house cusp calculation failed: ${result.error}`,
        validation
      );
    }

    const cuspsRaw = extractCuspArray(result.house);
    const cuspSpeedsRaw = extractCuspArray(result.houseSpeed);

    if (!cuspsRaw || cuspsRaw.length !== 12) {
      return failBhavaCusp(
        "INVALID_CUSP_DATA",
        "Swiss Ephemeris returned an incomplete cusp array.",
        validation
      );
    }

    const cusps: BhavaCuspPoint[] = cuspsRaw.map((value, index) => {
      const normalized = normalizeLongitude(value);
      const speedValue =
        cuspSpeedsRaw && Number.isFinite(cuspSpeedsRaw[index])
          ? cuspSpeedsRaw[index]
          : null;

      return {
        house: asHouseNumber(index + 1),
        longitude: normalized,
        sign: getSign(normalized),
        degree_in_sign: getDegreeInSign(normalized),
        speed: speedValue,
      };
    });

    return {
      success: true,
      data: {
        birth_utc: context.birth_utc,
        sidereal_mode: "LAHIRI",
        ayanamsha: "LAHIRI",
        house_system: "PLACIDUS",
        cusps,
      },
      validation,
    };
  } finally {
    swisseph.swe_close();
  }
}

export function buildBhavaStructureFromContext(
  context: AstronomyReadyBirthContext
) {
  const lagnaResult = calculateSiderealLagna(context);
  const wholeSignResult = buildWholeSignHouseStructureFromContext(context);
  const cuspResult = calculateSiderealBhavaCusps(context);
  const integrityResult = buildBhavaIntegrity({
    lagnaResult,
    wholeSignResult: wholeSignResult.housesResult,
    cuspResult,
  });

  return {
    lagnaResult,
    wholeSignResult: wholeSignResult.housesResult,
    cuspResult,
    integrityResult,
  };
}
