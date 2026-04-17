import "server-only";

import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { validateAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-validator";
import {
  buildWholeSignHouseStructureFromLagnaAndPlanets,
  type HouseNumber,
  type WholeSignHouse,
} from "@/lib/astrology/house-engine";
import { calculateSiderealLagna } from "@/lib/astrology/lagna-engine";
import { buildPlanetaryVerificationFromContext } from "@/lib/astrology/planetary-verifier";

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

  const planets = planetaryPipeline.formattedResult.data.planets.map((planet) => {
    const house = houseByPlanetName.get(planet.name);

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
    };
  });

  if (planets.some((planet) => !planet)) {
    return fail(
      "PLANET_HOUSE_MAPPING_INCOMPLETE",
      "One or more planets could not be mapped to houses in the unified chart object.",
      validation
    );
  }

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
    },
  };
}
