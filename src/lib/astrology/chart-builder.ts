import "server-only";

import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { validateAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-validator";
import { ownSignsByBody, exaltationSignsByBody, debilitationSignsByBody } from "@/lib/astrology/constants";
import {
  buildWholeSignHouseStructureFromLagnaAndPlanets,
  type HouseNumber,
  type WholeSignHouse,
} from "@/lib/astrology/house-engine";
import { calculateSiderealLagna } from "@/lib/astrology/lagna-engine";
import { buildPlanetaryVerificationFromContext } from "@/lib/astrology/planetary-verifier";
import { buildDivisionalChartReadiness } from "@/modules/astrology/divisional";
import type { PlanetaryBody, ZodiacSign } from "@/modules/astrology/types";

type ChartBuildFailureCode =
  | "INVALID_BIRTH_CONTEXT"
  | "PLANETARY_UNAVAILABLE"
  | "LAGNA_UNAVAILABLE"
  | "HOUSES_UNAVAILABLE"
  | "PLANET_HOUSE_MAPPING_INCOMPLETE";

export type SiderealBirthChart = {
  birth_context: {
    date_local: string;
    time_local: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: string;
    birth_utc: string;
  };
  settings: {
    zodiac: "sidereal";
    ayanamsha: "LAHIRI";
    house_system: "whole_sign";
  };
  lagna: {
    longitude: number;
    sign: string;
    degree_in_sign: number;
  };
  houses: WholeSignHouse[];
  planets: Array<{
    name: string;
    longitude: number;
    sign: string;
    degree_in_sign: number;
    nakshatra: string;
    pada: number;
    is_retrograde: boolean;
    is_combust: boolean;
    house: HouseNumber;
  }>;
  verification: {
    is_verified_for_chart_logic: boolean;
    verification_status: "VERIFIED" | "WARNINGS" | "FAILED";
    warnings: Array<{
      code: string;
      message: string;
      graha: string | null;
    }>;
    errors: Array<{
      code: string;
      message: string;
      graha: string | null;
    }>;
  };
  divisionalReadiness?: ReturnType<typeof buildDivisionalChartReadiness>;
};

export type SiderealBirthChartBuildFailure = {
  success: false;
  issue: {
    code: ChartBuildFailureCode;
    message: string;
  };
  validation: ReturnType<typeof validateAstronomyReadyBirthContext>;
};

export type SiderealBirthChartBuildSuccess = {
  success: true;
  data: SiderealBirthChart;
};

export type SiderealBirthChartBuildResult =
  | SiderealBirthChartBuildFailure
  | SiderealBirthChartBuildSuccess;

function fail(
  code: ChartBuildFailureCode,
  message: string,
  validation: ReturnType<typeof validateAstronomyReadyBirthContext>
): SiderealBirthChartBuildFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
    validation,
  };
}

function mapHouseEngineFailureToChartFailureCode(
  code: string
): ChartBuildFailureCode {
  if (code === "LAGNA_UNAVAILABLE") {
    return "LAGNA_UNAVAILABLE";
  }

  if (code === "PLANETS_UNAVAILABLE") {
    return "PLANETARY_UNAVAILABLE";
  }

  return "HOUSES_UNAVAILABLE";
}

function toPlanetaryBody(name: string) {
  return name.toUpperCase() as PlanetaryBody;
}

function toZodiacSign(name: string) {
  return name.toUpperCase() as ZodiacSign;
}

function resolvePlanetDignity(name: string, sign: string) {
  const body = toPlanetaryBody(name);
  const zodiacSign = toZodiacSign(sign);

  if (ownSignsByBody[body]?.includes(zodiacSign)) {
    return "OWN_SIGN" as const;
  }

  if (exaltationSignsByBody[body] === zodiacSign) {
    return "EXALTED" as const;
  }

  if (debilitationSignsByBody[body] === zodiacSign) {
    return "DEBILITATED" as const;
  }

  return "NEUTRAL" as const;
}

export function buildSiderealBirthChart(
  context: AstronomyReadyBirthContext
): SiderealBirthChartBuildResult {
  const validation = validateAstronomyReadyBirthContext(context);

  if (!validation.is_valid_for_chart) {
    return fail(
      "INVALID_BIRTH_CONTEXT",
      "Birth context validation failed. Resolve validation errors before chart building.",
      validation
    );
  }

  const lagnaResult = calculateSiderealLagna(context);

  if (!lagnaResult.success) {
    return fail("LAGNA_UNAVAILABLE", lagnaResult.issue.message, validation);
  }

  const planetaryPipeline = buildPlanetaryVerificationFromContext(context);

  if (!planetaryPipeline.formattedResult.success) {
    return fail(
      "PLANETARY_UNAVAILABLE",
      planetaryPipeline.formattedResult.issue.message,
      validation
    );
  }

  if (!planetaryPipeline.verification.is_verified_for_chart_logic) {
    const firstError = planetaryPipeline.verification.errors[0];

    return fail(
      "PLANETARY_UNAVAILABLE",
      firstError
        ? `Planetary verification failed: ${firstError.message}`
        : "Planetary verification failed for chart logic.",
      validation
    );
  }

  const housesResult = buildWholeSignHouseStructureFromLagnaAndPlanets({
    lagnaResult,
    formattedPlanetsResult: planetaryPipeline.formattedResult,
  });

  if (!housesResult.success) {
    return fail(
      mapHouseEngineFailureToChartFailureCode(housesResult.issue.code),
      housesResult.issue.message,
      validation
    );
  }

  const houseByPlanetName = new Map(
    housesResult.data.planets.map((placement) => [placement.planet, placement.house])
  );
  const rawPlanetByName = new Map(
    planetaryPipeline.rawResult.success
      ? planetaryPipeline.rawResult.data.planets.map((planet) => [planet.graha, planet] as const)
      : []
  );

  const planets = planetaryPipeline.formattedResult.data.planets.map((planet) => {
    const house = houseByPlanetName.get(planet.name);
    const rawPlanet = rawPlanetByName.get(toPlanetaryBody(planet.name));

    if (!house) {
      return null;
    }

    return {
      name: planet.name,
      longitude: planet.longitude,
      sign: planet.sign,
      degree_in_sign: planet.degree_in_sign,
      nakshatra: planet.nakshatra,
      pada: planet.pada,
      is_retrograde: planet.is_retrograde,
      is_combust: planet.is_combust,
      house,
      speed: rawPlanet?.longitude_speed ?? null,
      dignity: resolvePlanetDignity(planet.name, planet.sign),
      divisionalPlacement: {
        code: "D1" as const,
        sign: planet.sign,
        house,
      },
    };
  });

  if (planets.some((planet) => !planet)) {
    return fail(
      "PLANET_HOUSE_MAPPING_INCOMPLETE",
      "One or more planets could not be mapped to houses in the unified chart object.",
      validation
    );
  }

  const normalizedPlanets = planets.filter(
    (planet): planet is NonNullable<typeof planet> => planet !== null
  );
  const divisionalReadiness = buildDivisionalChartReadiness({
    lagna: {
      sign: lagnaResult.data.sign,
      longitude: lagnaResult.data.longitude,
      degree_in_sign: lagnaResult.data.degree_in_sign,
    },
    houses: housesResult.data.houses,
    planets: normalizedPlanets.map((planet) => ({
      name: planet.name,
      longitude: planet.longitude,
      sign: planet.sign,
      degree_in_sign: planet.degree_in_sign,
      nakshatra: planet.nakshatra,
      pada: planet.pada,
      is_retrograde: planet.is_retrograde,
      house: planet.house,
    })),
  });

  return {
    success: true,
    data: {
      birth_context: {
        date_local: context.birth_input.date_local_normalized,
        time_local: context.birth_input.time_local_normalized,
        place: context.normalized_place.display_name,
        latitude: context.normalized_place.latitude,
        longitude: context.normalized_place.longitude,
        timezone: context.timezone.iana,
        birth_utc: context.birth_utc,
      },
      settings: {
        zodiac: "sidereal",
        ayanamsha: "LAHIRI",
        house_system: "whole_sign",
      },
      lagna: {
        longitude: lagnaResult.data.longitude,
        sign: lagnaResult.data.sign,
        degree_in_sign: lagnaResult.data.degree_in_sign,
      },
      houses: housesResult.data.houses,
      planets: planets.filter(
        (planet): planet is NonNullable<typeof planet> => planet !== null
      ),
      verification: {
        is_verified_for_chart_logic:
          planetaryPipeline.verification.is_verified_for_chart_logic,
        verification_status: planetaryPipeline.verification.verification_status,
        warnings: planetaryPipeline.verification.warnings,
        errors: planetaryPipeline.verification.errors,
      },
      divisionalReadiness,
    },
  };
}
