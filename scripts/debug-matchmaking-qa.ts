import assert from "node:assert/strict";

import { buildTransitGocharFoundation } from "@/modules/astrology/transit/foundation";
import { buildGunaMilanFoundation } from "@/modules/astrology/matchmaking";
import { mockAstrologyFixtures } from "@/modules/astrology/fixtures";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { ZodiacSign } from "@/modules/astrology/types";

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

function createVerifiedChart(
  fixtureIndex: 0 | 1
): UnifiedSiderealChart {
  const fixture = mockAstrologyFixtures[fixtureIndex]!;
  const houses = createWholeSignHouses(fixture.natal.ascendantSign);
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

  const planets: UnifiedSiderealChart["planets"] = [...natalPlanets, ...outerPlanetEntries];

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
      sign: fixture.natal.ascendantSign,
      degree_in_sign: 3.5,
    },
    houses,
    planets,
    verification: {
      is_verified_for_chart_logic: true,
      verification_status: "VERIFIED",
      warnings: [],
      errors: [],
    },
  };
}

const chartA = createVerifiedChart(0);
const chartB = createVerifiedChart(1);

const ready = buildGunaMilanFoundation({
  personA: {
    chart: chartA,
    savedKundliId: "saved-kundli-a",
    label: "Person A",
  },
  personB: {
    chart: chartB,
    savedKundliId: "saved-kundli-b",
    label: "Person B",
  },
  asOfDateUtc: new Date("2026-05-09T00:00:00.000Z"),
});

assert.equal(ready.status, "partial");
assert.ok(ready.data);
assert.equal(ready.data?.kootaBreakdown.length, 8);
assert.equal(ready.data?.personA.chartAvailable, true);
assert.equal(ready.data?.personB.chartAvailable, true);
assert.equal(ready.data?.personA.savedKundliId, "saved-kundli-a");
assert.equal(ready.data?.personB.savedKundliId, "saved-kundli-b");
assert.ok((ready.data?.matchScore ?? 0) >= 0);
assert.ok((ready.data?.maxScore ?? 0) > 0);

const unavailable = buildGunaMilanFoundation({
  personA: {
    chart: chartA,
    savedKundliId: "saved-kundli-a",
    label: "Person A",
  },
  personB: {
    chart: {
      ...chartB,
      planets: chartB.planets.filter((planet) => planet.name !== "MOON"),
    },
    label: "Person B (missing Moon)",
  },
});

assert.equal(unavailable.status, "unavailable");

process.stdout.write(
  JSON.stringify(
    {
      ready: {
        status: ready.status,
        matchScore: ready.data?.matchScore ?? null,
        maxScore: ready.data?.maxScore ?? null,
        recommendationLevel: ready.data?.recommendationLevel ?? null,
        strengths: ready.data?.strengths ?? [],
        cautions: ready.data?.cautions ?? [],
        missingData: ready.data?.missingData ?? [],
      },
      unavailable: {
        status: unavailable.status,
        error: unavailable.error,
      },
    },
    null,
    2
  ) + "\n"
);
