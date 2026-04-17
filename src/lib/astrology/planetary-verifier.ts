import "server-only";

import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import {
  formatSwissPlanetaryResult,
  type AstrologyFormattingResult,
  type FormattedGrahaPosition,
  type NakshatraName,
  type NakshatraPada,
  type ZodiacSignName,
} from "@/lib/astrology/formatter";
import {
  calculateCoreGrahaSiderealLongitudes,
  type CoreGrahaName,
  type CoreGrahaSiderealLongitude,
  type SwissPlanetaryCalculationResult,
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
] as const satisfies readonly ZodiacSignName[];

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
] as const satisfies readonly NakshatraName[];

const COMBUSTION_THRESHOLDS: Partial<Record<CoreGrahaName, number>> = {
  MERCURY: 14,
  VENUS: 10,
  MARS: 17,
  JUPITER: 11,
  SATURN: 15,
};

const DISPLAY_NAME_BY_GRAHA: Record<CoreGrahaName, string> = {
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

const FULL_CIRCLE_DEGREES = 360;
const SIGN_SPAN_DEGREES = 30;
const NAKSHATRA_SPAN_DEGREES = FULL_CIRCLE_DEGREES / 27;
const PADA_SPAN_DEGREES = NAKSHATRA_SPAN_DEGREES / 4;
const KETU_RAHU_OPPOSITION_WARNING_TOLERANCE = 0.01;
const KETU_RAHU_OPPOSITION_ERROR_TOLERANCE = 0.1;

export type PlanetaryVerificationCode =
  | "RAW_PLANETARY_FAILURE"
  | "FORMATTER_FAILURE"
  | "MISSING_FORMATTED_GRAHA"
  | "LONGITUDE_OUT_OF_RANGE"
  | "LONGITUDE_MISMATCH"
  | "SIGN_MISMATCH"
  | "DEGREE_IN_SIGN_OUT_OF_RANGE"
  | "DEGREE_IN_SIGN_MISMATCH"
  | "NAKSHATRA_MISMATCH"
  | "PADA_OUT_OF_RANGE"
  | "PADA_MISMATCH"
  | "RETROGRADE_MISMATCH"
  | "COMBUSTION_MISMATCH"
  | "KETU_RAHU_OPPOSITION_DRIFT_WARNING"
  | "KETU_RAHU_OPPOSITION_DRIFT_ERROR";

export type PlanetaryVerificationIssue = {
  code: PlanetaryVerificationCode;
  message: string;
  graha: string | null;
};

export type PlanetaryVerificationStatus = "VERIFIED" | "WARNINGS" | "FAILED";

export type VerifiedPlanetaryRow = {
  name: string;
  raw_sidereal_longitude: number;
  sign: ZodiacSignName;
  degree_in_sign: number;
  nakshatra: NakshatraName;
  pada: NakshatraPada;
  is_retrograde: boolean;
  is_combust: boolean;
};

export type PlanetaryVerificationPayload = {
  metadata: {
    sidereal_mode: "LAHIRI" | "UNKNOWN";
    ayanamsha: "LAHIRI";
    birth_utc: string;
    coordinates_used: {
      latitude: number;
      longitude: number;
      display_name: string;
    };
    birth_context_confidence: "high" | "medium" | "low";
  };
  planets: VerifiedPlanetaryRow[];
};

export type PlanetaryVerificationResult = {
  is_verified_for_chart_logic: boolean;
  verification_status: PlanetaryVerificationStatus;
  errors: PlanetaryVerificationIssue[];
  warnings: PlanetaryVerificationIssue[];
  payload: PlanetaryVerificationPayload | null;
};

function normalizeLongitude(value: number) {
  const normalized = value % FULL_CIRCLE_DEGREES;

  return normalized < 0 ? normalized + FULL_CIRCLE_DEGREES : normalized;
}

function getAngularDistanceDegrees(a: number, b: number) {
  const difference = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));

  return difference > 180 ? FULL_CIRCLE_DEGREES - difference : difference;
}

function getExpectedSign(longitude: number) {
  const index = Math.floor(normalizeLongitude(longitude) / SIGN_SPAN_DEGREES);

  return ZODIAC_SIGNS[index] ?? "Aries";
}

function getExpectedDegreeInSign(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const signIndex = Math.floor(normalized / SIGN_SPAN_DEGREES);

  return normalized - signIndex * SIGN_SPAN_DEGREES;
}

function getExpectedNakshatra(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const index = Math.floor(normalized / NAKSHATRA_SPAN_DEGREES);
  const boundedIndex = Math.min(NAKSHATRAS.length - 1, Math.max(0, index));

  return NAKSHATRAS[boundedIndex];
}

function getExpectedPada(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const nakshatraIndex = Math.floor(normalized / NAKSHATRA_SPAN_DEGREES);
  const boundedNakshatraIndex = Math.min(
    NAKSHATRAS.length - 1,
    Math.max(0, nakshatraIndex)
  );
  const withinNakshatra =
    normalized - boundedNakshatraIndex * NAKSHATRA_SPAN_DEGREES;
  const padaValue = Math.floor(withinNakshatra / PADA_SPAN_DEGREES) + 1;

  return Math.min(4, Math.max(1, padaValue)) as NakshatraPada;
}

function buildBasePayload(
  context: AstronomyReadyBirthContext,
  siderealMode: "LAHIRI" | "UNKNOWN",
  confidence: "high" | "medium" | "low"
): PlanetaryVerificationPayload {
  return {
    metadata: {
      sidereal_mode: siderealMode,
      ayanamsha: "LAHIRI",
      birth_utc: context.birth_utc,
      coordinates_used: {
        latitude: context.normalized_place.latitude,
        longitude: context.normalized_place.longitude,
        display_name: context.normalized_place.display_name,
      },
      birth_context_confidence: confidence,
    },
    planets: [],
  };
}

function addError(
  errors: PlanetaryVerificationIssue[],
  code: PlanetaryVerificationCode,
  message: string,
  graha: string | null = null
) {
  errors.push({ code, message, graha });
}

function addWarning(
  warnings: PlanetaryVerificationIssue[],
  code: PlanetaryVerificationCode,
  message: string,
  graha: string | null = null
) {
  warnings.push({ code, message, graha });
}

function findFormattedPlanet(
  formattedPlanets: FormattedGrahaPosition[],
  graha: CoreGrahaName
) {
  const displayName = DISPLAY_NAME_BY_GRAHA[graha];

  return formattedPlanets.find((item) => item.name === displayName) ?? null;
}

function verifyKetuRahuOpposition(
  rawPlanets: CoreGrahaSiderealLongitude[],
  errors: PlanetaryVerificationIssue[],
  warnings: PlanetaryVerificationIssue[]
) {
  const rahu = rawPlanets.find((planet) => planet.graha === "RAHU");
  const ketu = rawPlanets.find((planet) => planet.graha === "KETU");

  if (!rahu || !ketu) {
    return;
  }

  const normalizedDifference = normalizeLongitude(
    ketu.sidereal_longitude - rahu.sidereal_longitude
  );
  const deviation = Math.abs(normalizedDifference - 180);

  if (deviation > KETU_RAHU_OPPOSITION_ERROR_TOLERANCE) {
    addError(
      errors,
      "KETU_RAHU_OPPOSITION_DRIFT_ERROR",
      `Ketu/Rahu opposition drift too high (${deviation.toFixed(6)}°).`,
      "RAHU_KETU"
    );
    return;
  }

  if (deviation > KETU_RAHU_OPPOSITION_WARNING_TOLERANCE) {
    addWarning(
      warnings,
      "KETU_RAHU_OPPOSITION_DRIFT_WARNING",
      `Ketu/Rahu opposition has small drift (${deviation.toFixed(6)}°).`,
      "RAHU_KETU"
    );
  }
}

function verifyPlanet(
  rawPlanet: CoreGrahaSiderealLongitude,
  formattedPlanet: FormattedGrahaPosition,
  sunLongitude: number,
  errors: PlanetaryVerificationIssue[],
  warnings: PlanetaryVerificationIssue[]
) {
  const graha = rawPlanet.graha;
  const normalizedLongitude = normalizeLongitude(rawPlanet.sidereal_longitude);
  const expectedSign = getExpectedSign(normalizedLongitude);
  const expectedDegreeInSign = getExpectedDegreeInSign(normalizedLongitude);
  const expectedNakshatra = getExpectedNakshatra(normalizedLongitude);
  const expectedPada = getExpectedPada(normalizedLongitude);
  const expectedRetrograde = rawPlanet.longitude_speed < 0;
  const combustionThreshold = COMBUSTION_THRESHOLDS[graha];
  const expectedCombust =
    typeof combustionThreshold === "number"
      ? getAngularDistanceDegrees(normalizedLongitude, sunLongitude) <
        combustionThreshold
      : false;

  if (
    !Number.isFinite(rawPlanet.sidereal_longitude) ||
    normalizedLongitude < 0 ||
    normalizedLongitude >= 360
  ) {
    addError(
      errors,
      "LONGITUDE_OUT_OF_RANGE",
      `Longitude must be in [0, 360). Received ${rawPlanet.sidereal_longitude}.`,
      graha
    );
  }

  if (!Number.isFinite(formattedPlanet.longitude)) {
    addError(
      errors,
      "LONGITUDE_MISMATCH",
      `Formatted longitude is invalid: ${formattedPlanet.longitude}.`,
      graha
    );
  } else if (Math.abs(formattedPlanet.longitude - normalizedLongitude) > 1e-6) {
    addError(
      errors,
      "LONGITUDE_MISMATCH",
      `Formatted longitude mismatch. Expected ${normalizedLongitude.toFixed(8)}, received ${formattedPlanet.longitude.toFixed(8)}.`,
      graha
    );
  }

  if (
    !Number.isFinite(formattedPlanet.degree_in_sign) ||
    formattedPlanet.degree_in_sign < 0 ||
    formattedPlanet.degree_in_sign >= 30
  ) {
    addError(
      errors,
      "DEGREE_IN_SIGN_OUT_OF_RANGE",
      `degree_in_sign must be in [0, 30). Received ${formattedPlanet.degree_in_sign}.`,
      graha
    );
  }

  if (formattedPlanet.sign !== expectedSign) {
    addError(
      errors,
      "SIGN_MISMATCH",
      `Sign mismatch. Expected ${expectedSign}, received ${formattedPlanet.sign}.`,
      graha
    );
  }

  if (Math.abs(formattedPlanet.degree_in_sign - expectedDegreeInSign) > 1e-6) {
    addWarning(
      warnings,
      "DEGREE_IN_SIGN_MISMATCH",
      `degree_in_sign differs from longitude-derived value. Expected ${expectedDegreeInSign.toFixed(8)}, received ${formattedPlanet.degree_in_sign.toFixed(8)}.`,
      graha
    );
  }

  if (formattedPlanet.nakshatra !== expectedNakshatra) {
    addError(
      errors,
      "NAKSHATRA_MISMATCH",
      `Nakshatra mismatch. Expected ${expectedNakshatra}, received ${formattedPlanet.nakshatra}.`,
      graha
    );
  }

  if (formattedPlanet.pada < 1 || formattedPlanet.pada > 4) {
    addError(
      errors,
      "PADA_OUT_OF_RANGE",
      `Pada must be in [1, 4]. Received ${formattedPlanet.pada}.`,
      graha
    );
  } else if (formattedPlanet.pada !== expectedPada) {
    addError(
      errors,
      "PADA_MISMATCH",
      `Pada mismatch. Expected ${expectedPada}, received ${formattedPlanet.pada}.`,
      graha
    );
  }

  if (formattedPlanet.is_retrograde !== expectedRetrograde) {
    addError(
      errors,
      "RETROGRADE_MISMATCH",
      `Retrograde mismatch. Expected ${expectedRetrograde}, received ${formattedPlanet.is_retrograde}.`,
      graha
    );
  }

  if (formattedPlanet.is_combust !== expectedCombust) {
    addError(
      errors,
      "COMBUSTION_MISMATCH",
      `Combustion mismatch. Expected ${expectedCombust}, received ${formattedPlanet.is_combust}.`,
      graha
    );
  }
}

export function verifyPlanetaryResults(input: {
  context: AstronomyReadyBirthContext;
  rawResult: SwissPlanetaryCalculationResult;
  formattedResult: AstrologyFormattingResult;
}): PlanetaryVerificationResult {
  const { context, rawResult, formattedResult } = input;
  const errors: PlanetaryVerificationIssue[] = [];
  const warnings: PlanetaryVerificationIssue[] = [];
  const fallbackPayload = buildBasePayload(context, "UNKNOWN", "low");

  if (!rawResult.success) {
    addError(
      errors,
      "RAW_PLANETARY_FAILURE",
      `Raw planetary calculation failed: ${rawResult.issue.message}`
    );

    return {
      is_verified_for_chart_logic: false,
      verification_status: "FAILED",
      errors,
      warnings,
      payload: fallbackPayload,
    };
  }

  const payload = buildBasePayload(
    context,
    rawResult.data.sidereal_mode,
    rawResult.validation.overall_confidence
  );

  if (!formattedResult.success) {
    addError(
      errors,
      "FORMATTER_FAILURE",
      `Astrology formatting failed: ${formattedResult.issue.message}`
    );

    return {
      is_verified_for_chart_logic: false,
      verification_status: "FAILED",
      errors,
      warnings,
      payload,
    };
  }

  const rawPlanets = rawResult.data.planets;
  const formattedPlanets = formattedResult.data.planets;
  const rawSun = rawPlanets.find((planet) => planet.graha === "SUN");
  const sunLongitude = rawSun ? normalizeLongitude(rawSun.sidereal_longitude) : 0;

  for (const rawPlanet of rawPlanets) {
    const formattedPlanet = findFormattedPlanet(formattedPlanets, rawPlanet.graha);

    if (!formattedPlanet) {
      addError(
        errors,
        "MISSING_FORMATTED_GRAHA",
        `Formatted graha record missing for ${rawPlanet.graha}.`,
        rawPlanet.graha
      );
      continue;
    }

    verifyPlanet(rawPlanet, formattedPlanet, sunLongitude, errors, warnings);

    payload.planets.push({
      name: formattedPlanet.name,
      raw_sidereal_longitude: normalizeLongitude(rawPlanet.sidereal_longitude),
      sign: formattedPlanet.sign,
      degree_in_sign: formattedPlanet.degree_in_sign,
      nakshatra: formattedPlanet.nakshatra,
      pada: formattedPlanet.pada,
      is_retrograde: formattedPlanet.is_retrograde,
      is_combust: formattedPlanet.is_combust,
    });
  }

  verifyKetuRahuOpposition(rawPlanets, errors, warnings);

  if (errors.length > 0) {
    return {
      is_verified_for_chart_logic: false,
      verification_status: "FAILED",
      errors,
      warnings,
      payload,
    };
  }

  if (warnings.length > 0) {
    return {
      is_verified_for_chart_logic: true,
      verification_status: "WARNINGS",
      errors,
      warnings,
      payload,
    };
  }

  return {
    is_verified_for_chart_logic: true,
    verification_status: "VERIFIED",
    errors,
    warnings,
    payload,
  };
}

export function buildPlanetaryVerificationFromContext(
  context: AstronomyReadyBirthContext
) {
  const rawResult = calculateCoreGrahaSiderealLongitudes(context);
  const formattedResult = formatSwissPlanetaryResult(rawResult);
  const verification = verifyPlanetaryResults({
    context,
    rawResult,
    formattedResult,
  });

  return {
    rawResult,
    formattedResult,
    verification,
  };
}
