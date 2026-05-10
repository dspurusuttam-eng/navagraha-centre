import assert from "node:assert/strict";

import { buildRemedyMappingLayer, buildYogaDetectionEngine } from "@/modules/astrology";
import { buildTransitGocharFoundation } from "@/modules/astrology/transit/foundation";
import { mockAstrologyFixtures } from "@/modules/astrology/fixtures";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { PlanetaryBody, ZodiacSign } from "@/modules/astrology/types";

const transitSnapshot = buildTransitGocharFoundation({
  transitDateUtc: new Date("2026-05-09T00:00:00.000Z"),
});

assert.equal(transitSnapshot.status, "ready");
assert.ok(transitSnapshot.data);

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
    const transitPlanet = transitSnapshot.data!.planets.find((planet) => planet.planet === body);
    const sign = (transitPlanet?.sign ?? "ARIES") as ZodiacSign;
    const house =
      houseBySign.get(sign) ?? ((index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12);

    return {
      name: body,
      longitude: transitPlanet?.longitude ?? 0,
      sign,
      degree_in_sign: transitPlanet?.degreeInSign ?? 0,
      nakshatra: transitPlanet?.nakshatra ?? "ASHWINI",
      pada: transitPlanet?.pada ?? 1,
      is_retrograde: transitPlanet?.retrograde ?? false,
      is_combust: false,
      house,
      speed: transitPlanet?.speed ?? null,
      divisionalPlacement: {
        code: "D1" as const,
        sign,
        house,
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

function yogaStatus(chart: UnifiedSiderealChart, key: string) {
  return buildYogaDetectionEngine({ chart }).data?.yogas.find((entry) => entry.yogaKey === key)
    ?.status ?? null;
}

const rajChart = createVerifiedChart("LEO");
const dhanChart = createVerifiedChart("TAURUS");
const compositeChart = cloneChart(createVerifiedChart("ARIES"), {
  SUN: { house: 6, sign: "VIRGO" },
  MOON: { house: 1, sign: "ARIES" },
  MARS: { house: 1, sign: "ARIES" },
  MERCURY: { house: 6, sign: "VIRGO" },
  JUPITER: { house: 4, sign: "CANCER" },
});
const neechChart = cloneChart(createVerifiedChart("CANCER"), {
  MOON: { house: 1, sign: "CANCER" },
  MARS: { house: 4, sign: "CANCER" },
});
const missingMoonChart = cloneChart(compositeChart, {}, ["MOON"]);

const raj = buildYogaDetectionEngine({ chart: rajChart });
const dhan = buildYogaDetectionEngine({ chart: dhanChart });
const composite = buildYogaDetectionEngine({ chart: compositeChart });
const neech = buildYogaDetectionEngine({ chart: neechChart });
const missingMoon = buildYogaDetectionEngine({ chart: missingMoonChart });
const remedy = buildRemedyMappingLayer({ chart: compositeChart });

assert.equal(yogaStatus(rajChart, "RAJ_YOGA"), "present");
assert.equal(yogaStatus(dhanChart, "DHANA_YOGA"), "present");
assert.equal(yogaStatus(compositeChart, "VIPARITA_RAJ_YOGA"), "present");
assert.equal(yogaStatus(compositeChart, "PANCH_MAHAPURUSH_YOGA"), "present");
assert.equal(yogaStatus(compositeChart, "CHANDRA_MANGALA_YOGA"), "present");
assert.equal(yogaStatus(compositeChart, "GAJ_KESARI_YOGA"), "present");
assert.equal(yogaStatus(compositeChart, "BUDHADITYA_YOGA"), "present");
assert.equal(neech.data?.yogas.find((entry) => entry.yogaKey === "NEECH_BHANG_RAJ_YOGA")?.status, "present");
assert.equal(missingMoon.status, "unavailable");
assert.ok(missingMoon.error?.message);
assert.ok(remedy.data?.remedies.length);
assert.equal(remedy.data?.remedies[0]?.guaranteedResult, false);
assert.equal(remedy.data?.remedies[0]?.optional, true);

process.stdout.write(
  JSON.stringify(
    {
      status: "ok",
      yogaStatuses: {
        raj: raj.data?.yogas.find((entry) => entry.yogaKey === "RAJ_YOGA")?.status ?? null,
        dhan: dhan.data?.yogas.find((entry) => entry.yogaKey === "DHANA_YOGA")?.status ?? null,
        viparita:
          composite.data?.yogas.find((entry) => entry.yogaKey === "VIPARITA_RAJ_YOGA")?.status ?? null,
        panch:
          composite.data?.yogas.find((entry) => entry.yogaKey === "PANCH_MAHAPURUSH_YOGA")?.status ?? null,
        chandra:
          composite.data?.yogas.find((entry) => entry.yogaKey === "CHANDRA_MANGALA_YOGA")?.status ??
          null,
        gaj:
          composite.data?.yogas.find((entry) => entry.yogaKey === "GAJ_KESARI_YOGA")?.status ?? null,
        budha:
          composite.data?.yogas.find((entry) => entry.yogaKey === "BUDHADITYA_YOGA")?.status ?? null,
        neech:
          neech.data?.yogas.find((entry) => entry.yogaKey === "NEECH_BHANG_RAJ_YOGA")?.status ??
          null,
        missingMoon: missingMoon.status,
      },
      remedyCount: remedy.data?.remedies.length ?? 0,
    },
    null,
    2
  ) + "\n"
);
