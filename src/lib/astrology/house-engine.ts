import "server-only";

import type { AstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import {
  formatSwissPlanetaryResult,
  type AstrologyFormattingResult,
  type FormattedGrahaPosition,
  type ZodiacSignName,
} from "@/lib/astrology/formatter";
import {
  calculateSiderealLagna,
  type LagnaCalculationResult,
} from "@/lib/astrology/lagna-engine";
import { calculateCoreGrahaSiderealLongitudes } from "@/lib/astrology/swiss-planetary-service";

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

type HouseEngineFailureCode =
  | "LAGNA_UNAVAILABLE"
  | "PLANETS_UNAVAILABLE"
  | "INVALID_LAGNA_SIGN"
  | "INCOMPLETE_HOUSE_SET"
  | "PLANET_SIGN_UNMAPPED";

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type WholeSignHouse = {
  house: HouseNumber;
  sign: ZodiacSignName;
};

export type PlanetHousePlacement = {
  planet: string;
  sign: ZodiacSignName;
  house: HouseNumber;
  degree: number;
};

export type WholeSignHouseEngineFailure = {
  success: false;
  issue: {
    code: HouseEngineFailureCode;
    message: string;
  };
};

export type WholeSignHouseEngineSuccess = {
  success: true;
  data: {
    lagna: {
      longitude: number;
      sign: ZodiacSignName;
      degree_in_sign: number;
      sidereal_mode: "LAHIRI";
      ayanamsha: "LAHIRI";
    };
    houses: WholeSignHouse[];
    planets: PlanetHousePlacement[];
  };
};

export type WholeSignHouseEngineResult =
  | WholeSignHouseEngineFailure
  | WholeSignHouseEngineSuccess;

function fail(
  code: HouseEngineFailureCode,
  message: string
): WholeSignHouseEngineFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
  };
}

function getSignIndex(sign: ZodiacSignName) {
  return ZODIAC_SIGNS.indexOf(sign);
}

function hasCompleteHouseSet(houses: WholeSignHouse[]) {
  if (houses.length !== 12) {
    return false;
  }

  const houseIds = new Set(houses.map((house) => house.house));
  const houseSigns = new Set(houses.map((house) => house.sign));

  return houseIds.size === 12 && houseSigns.size === 12;
}

function assignPlanetsToWholeSignHouses(
  planets: FormattedGrahaPosition[],
  houses: WholeSignHouse[]
) {
  const houseBySign = new Map<ZodiacSignName, HouseNumber>(
    houses.map((house) => [house.sign, house.house])
  );

  const placements: PlanetHousePlacement[] = [];

  for (const planet of planets) {
    const house = houseBySign.get(planet.sign);

    if (!house) {
      return fail(
        "PLANET_SIGN_UNMAPPED",
        `Planet sign ${planet.sign} could not be mapped to a whole-sign house.`
      );
    }

    placements.push({
      planet: planet.name,
      sign: planet.sign,
      house,
      degree: planet.degree_in_sign,
    });
  }

  return {
    success: true as const,
    data: placements,
  };
}

export function generateWholeSignHouses(
  lagnaSign: ZodiacSignName
): WholeSignHouse[] {
  const startIndex = getSignIndex(lagnaSign);

  if (startIndex < 0) {
    return [];
  }

  return Array.from({ length: 12 }, (_, index) => {
    const signIndex = (startIndex + index) % 12;

    return {
      house: (index + 1) as HouseNumber,
      sign: ZODIAC_SIGNS[signIndex],
    };
  });
}

export function buildWholeSignHouseStructureFromLagnaAndPlanets(input: {
  lagnaResult: LagnaCalculationResult;
  formattedPlanetsResult: AstrologyFormattingResult;
}): WholeSignHouseEngineResult {
  const { lagnaResult, formattedPlanetsResult } = input;

  if (!lagnaResult.success) {
    return fail("LAGNA_UNAVAILABLE", lagnaResult.issue.message);
  }

  if (!formattedPlanetsResult.success) {
    return fail("PLANETS_UNAVAILABLE", formattedPlanetsResult.issue.message);
  }

  if (getSignIndex(lagnaResult.data.sign) < 0) {
    return fail(
      "INVALID_LAGNA_SIGN",
      `Lagna sign ${lagnaResult.data.sign} is not valid for whole-sign house generation.`
    );
  }

  const houses = generateWholeSignHouses(lagnaResult.data.sign);

  if (!hasCompleteHouseSet(houses)) {
    return fail(
      "INCOMPLETE_HOUSE_SET",
      "Whole-sign house generation failed to produce a complete 12-house set."
    );
  }

  const placementResult = assignPlanetsToWholeSignHouses(
    formattedPlanetsResult.data.planets,
    houses
  );

  if (!placementResult.success) {
    return placementResult;
  }

  return {
    success: true,
    data: {
      lagna: {
        longitude: lagnaResult.data.longitude,
        sign: lagnaResult.data.sign,
        degree_in_sign: lagnaResult.data.degree_in_sign,
        sidereal_mode: lagnaResult.data.sidereal_mode,
        ayanamsha: lagnaResult.data.ayanamsha,
      },
      houses,
      planets: placementResult.data,
    },
  };
}

export function buildWholeSignHouseStructureFromContext(
  context: AstronomyReadyBirthContext
) {
  const lagnaResult = calculateSiderealLagna(context);
  const rawPlanetaryResult = calculateCoreGrahaSiderealLongitudes(context);
  const formattedPlanetsResult = formatSwissPlanetaryResult(rawPlanetaryResult);
  const housesResult = buildWholeSignHouseStructureFromLagnaAndPlanets({
    lagnaResult,
    formattedPlanetsResult,
  });

  return {
    lagnaResult,
    rawPlanetaryResult,
    formattedPlanetsResult,
    housesResult,
  };
}
