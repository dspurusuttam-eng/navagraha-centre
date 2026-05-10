import { houseNumbers, zodiacSigns } from "@/modules/astrology/constants";
import type {
  HouseNumber,
  PlanetaryBody,
  ZodiacSign,
} from "@/modules/astrology/types";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import { signRulerMap } from "@/lib/astrology/constants";
import type {
  AstrologyChartLike,
  AstrologyPlanetPlacement,
} from "@/modules/astrology/core/types";
import { isPlanetKey } from "@/modules/astrology/core/registry";
import type { HousePlacement } from "@/modules/astrology/types";

const zodiacSignSet = new Set<ZodiacSign>(zodiacSigns);
const houseNumberSet = new Set<HouseNumber>(houseNumbers);

function isZodiacSign(value: string): value is ZodiacSign {
  return zodiacSignSet.has(value as ZodiacSign);
}

function isHouseNumber(value: number): value is HouseNumber {
  return houseNumberSet.has(value as HouseNumber);
}

function normalizePlanetPlacement(
  body: string,
  sign: string,
  longitude: number,
  degreeInSign: number,
  house: number,
  isRetrograde: boolean,
  isCombust: boolean
): AstrologyPlanetPlacement | null {
  if (!isPlanetKey(body) || !isZodiacSign(sign) || !isHouseNumber(house)) {
    return null;
  }

  const degree = Math.floor(degreeInSign);
  const minute = Math.round((degreeInSign - degree) * 60);

  return {
    body,
    sign,
    longitude,
    degree,
    minute,
    house,
    retrograde: isRetrograde,
    is_combust: isCombust,
  };
}

function normalizeHousePlacement(house: {
  house: number;
  sign: string;
}): HousePlacement | null {
  if (!isHouseNumber(house.house) || !isZodiacSign(house.sign)) {
    return null;
  }

  return {
    house: house.house,
    sign: house.sign,
    ruler: signRulerMap[house.sign] as PlanetaryBody,
  };
}

export function normalizeUnifiedSiderealChart(
  chart: UnifiedSiderealChart | null | undefined
): AstrologyChartLike | null {
  if (!chart) {
    return null;
  }

  if (!isZodiacSign(chart.lagna.sign)) {
    return null;
  }

  const lagnaDegree = Math.floor(chart.lagna.degree_in_sign);
  const lagnaMinute = Math.round((chart.lagna.degree_in_sign - lagnaDegree) * 60);

  const planets = chart.planets
    .map((planet) =>
      normalizePlanetPlacement(
        planet.name,
        planet.sign,
        planet.longitude,
        planet.degree_in_sign,
        planet.house,
        planet.is_retrograde,
        planet.is_combust
      )
    )
    .filter((planet): planet is AstrologyPlanetPlacement => planet !== null);

  const houses = chart.houses
    .map((house) => normalizeHousePlacement(house))
    .filter((house): house is HousePlacement => house !== null);

  return {
    verification: {
      is_verified_for_chart_logic: chart.verification.is_verified_for_chart_logic,
    },
    lagna: {
      sign: chart.lagna.sign,
      longitude: chart.lagna.longitude,
      degree: lagnaDegree,
      minute: lagnaMinute,
    },
    planets,
    houses,
  };
}
