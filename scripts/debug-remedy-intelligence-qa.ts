import assert from "node:assert/strict";

import {
  buildDoshaDetectionEngine,
  buildRemedyIntelligenceEngine,
  buildYogaDetectionEngine,
} from "@/modules/astrology";
import { mockAstrologyFixtures } from "@/modules/astrology/fixtures";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { PlanetaryBody, ZodiacSign } from "@/modules/astrology/types";

const zodiacSigns = [
  "ARIES",
  "TAURUS",
  "GEMINI",
  "CANCER",
  "LEO",
  "VIRGO",
  "LIBRA",
  "SCORPIO",
  "SAGITTARIUS",
  "CAPRICORN",
  "AQUARIUS",
  "PISCES",
] as const;

function createWholeSignHouses(ascendantSign: ZodiacSign) {
  const startIndex = zodiacSigns.indexOf(ascendantSign);

  return zodiacSigns.map((sign, index) => ({
    house: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    sign: zodiacSigns[(startIndex + index) % zodiacSigns.length],
  }));
}

function createVerifiedChart(ascendantSign: ZodiacSign): UnifiedSiderealChart {
  const fixture = mockAstrologyFixtures[0]!;
  const houses = createWholeSignHouses(ascendantSign);
  const houseBySign = new Map<ZodiacSign, number>(
    houses.map((house) => [house.sign, house.house] as const)
  );
  const outerBodies = ["URANUS", "NEPTUNE", "PLUTO"] as const;
  const natalPlanets = fixture.natal.planets.map((planet) => ({
    name: planet.body,
    longitude: planet.longitude ?? 0,
    sign: planet.sign,
    degree_in_sign: planet.degree ?? 0,
    nakshatra: planet.nakshatra?.name ?? "ASHWINI",
    pada: planet.nakshatra?.pada ?? 1,
    is_retrograde: planet.retrograde,
    is_combust: false,
    house: planet.house ?? houseBySign.get(planet.sign) ?? 1,
    speed: planet.speed ?? null,
    divisionalPlacement: {
      code: "D1" as const,
      sign: planet.sign,
      house: planet.house ?? houseBySign.get(planet.sign) ?? 1,
    },
  })) as UnifiedSiderealChart["planets"];

  const outerPlanetEntries = outerBodies.map((body, index) => {
    return {
      name: body,
      longitude: 0,
      sign: zodiacSigns[(index + 2) % zodiacSigns.length],
      degree_in_sign: 15,
      nakshatra: "ASHWINI",
      pada: 1,
      is_retrograde: false,
      is_combust: false,
      house: (index + 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
      speed: null,
      divisionalPlacement: {
        code: "D1" as const,
        sign: zodiacSigns[(index + 2) % zodiacSigns.length],
        house: (index + 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
      },
    } as UnifiedSiderealChart["planets"][number];
  });

  return {
    birth_context: {
      date_local: "1988-06-18",
      time_local: "10:30",
      place: "Guwahati, Assam, India",
      latitude: 26.1445,
      longitude: 91.7362,
      timezone: "Asia/Kolkata",
      birth_utc: "1988-06-18T05:00:00.000Z",
    },
    settings: {
      zodiac: "sidereal",
      ayanamsha: "LAHIRI",
      house_system: "whole_sign",
    },
    lagna: {
      longitude: 183.5,
      sign: ascendantSign,
      degree_in_sign: 3.5,
    },
    houses,
    planets: [...natalPlanets, ...outerPlanetEntries],
    verification: {
      is_verified_for_chart_logic: true,
      verification_status: "VERIFIED",
      warnings: [],
      errors: [],
    },
  };
}

function cloneChart(
  chart: UnifiedSiderealChart,
  overrides: Partial<Record<PlanetaryBody, { house?: number; sign?: ZodiacSign }>>,
  removals: readonly PlanetaryBody[] = []
): UnifiedSiderealChart {
  const removalSet = new Set(removals);

  return {
    ...chart,
    planets: chart.planets
      .filter((planet) => !removalSet.has(planet.name as PlanetaryBody))
      .map((planet) => {
        const override = overrides[planet.name as PlanetaryBody];

        if (!override) {
          return planet;
        }

        const nextHouse = override.house ?? planet.house;
        const nextSign = override.sign ?? planet.sign;

        return {
          ...planet,
          house: nextHouse,
          sign: nextSign,
          divisionalPlacement: planet.divisionalPlacement
            ? {
                ...planet.divisionalPlacement,
                house: nextHouse,
                sign: nextSign,
              }
            : planet.divisionalPlacement,
        };
      }),
  };
}

const baseChart = createVerifiedChart("ARIES");
const remedyChart = cloneChart(baseChart, {
  MARS: { house: 6, sign: "CANCER" },
  SATURN: { house: 8, sign: "ARIES" },
  JUPITER: { house: 5, sign: "CAPRICORN" },
  RAHU: { house: 2, sign: "TAURUS" },
  KETU: { house: 8, sign: "SCORPIO" },
  MOON: { house: 10, sign: "SCORPIO" },
});

const doshaSnapshot = buildDoshaDetectionEngine({ chart: remedyChart });
const yogaSnapshot = buildYogaDetectionEngine({ chart: remedyChart });
const remedySnapshot = buildRemedyIntelligenceEngine({
  chart: remedyChart,
  doshaSnapshot,
  yogaSnapshot,
  planetSignals: [
    {
      planet: "MARS",
      relatedDoshaOrYoga: "PLANETARY_SIGNAL:MARS",
      basis: ["Mars is placed in a sensitive house for the readiness check."],
      strength: "weak",
      house: 6,
      sign: "CANCER",
    },
    {
      planet: "SATURN",
      relatedDoshaOrYoga: "PLANETARY_SIGNAL:SATURN",
      basis: ["Saturn is placed in a sensitive house for the readiness check."],
      strength: "weak",
      house: 8,
      sign: "ARIES",
    },
  ],
});
const unavailableSnapshot = buildRemedyIntelligenceEngine({
  planetSignals: [],
});

assert.notEqual(remedySnapshot.status, "unavailable");
assert.ok(remedySnapshot.data);
assert.ok(remedySnapshot.data?.remedies.length);
assert.equal(remedySnapshot.data?.remedies[0]?.optional, true);
assert.equal(remedySnapshot.data?.remedies[0]?.guaranteedResult, false);
assert.ok(remedySnapshot.data?.remedies.some((item) => item.remedyType === "gemstone"));
assert.ok(remedySnapshot.data?.remedies.some((item) => item.remedyType === "rudraksha"));
assert.ok(remedySnapshot.data?.remedies.some((item) => item.remedyType === "consultation"));
assert.equal(unavailableSnapshot.status, "unavailable");
assert.ok(unavailableSnapshot.error?.message);

process.stdout.write(
  JSON.stringify(
    {
      status: "ok",
      remedyCount: remedySnapshot.data?.remedies.length ?? 0,
      remedyTypes: Array.from(
        new Set(remedySnapshot.data?.remedies.map((remedy) => remedy.remedyType))
      ),
      doshaCount: doshaSnapshot.data?.doshas.length ?? 0,
      yogaCount: yogaSnapshot.data?.yogas.length ?? 0,
    },
    null,
    2
  ) + "\n"
);
