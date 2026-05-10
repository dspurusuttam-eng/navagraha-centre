import assert from "node:assert/strict";

import { buildDoshaDetectionEngine } from "@/modules/astrology/dosha";
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

function createVerifiedChart(fixtureIndex: 0 | 1): UnifiedSiderealChart {
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

function cloneChart(
  chart: UnifiedSiderealChart,
  overrides: Partial<Record<PlanetaryBody, number>>,
  removals: readonly PlanetaryBody[] = []
): UnifiedSiderealChart {
  const removalSet = new Set(removals);

  return {
    ...chart,
    planets: chart.planets
      .filter((planet) => !removalSet.has(planet.name as PlanetaryBody))
      .map((planet) => {
        const overrideHouse = overrides[planet.name as PlanetaryBody];

        if (!overrideHouse) {
          return planet;
        }

        return {
          ...planet,
          house: overrideHouse,
          divisionalPlacement: planet.divisionalPlacement
            ? {
                ...planet.divisionalPlacement,
                house: overrideHouse,
              }
            : planet.divisionalPlacement,
        };
      }),
  };
}

const baseChart = createVerifiedChart(0);

const mangalChart = cloneChart(baseChart, { MARS: 1 });
const kaalSarpChart = cloneChart(baseChart, {
  SUN: 3,
  MOON: 4,
  MARS: 5,
  MERCURY: 6,
  JUPITER: 7,
  VENUS: 7,
  SATURN: 6,
  RAHU: 2,
  KETU: 8,
  URANUS: 5,
  NEPTUNE: 4,
  PLUTO: 3,
});
const pitruChart = cloneChart(baseChart, {
  SUN: 9,
  RAHU: 9,
  SATURN: 9,
  MERCURY: 8,
});
const guruChandalChart = cloneChart(baseChart, {
  JUPITER: 5,
  RAHU: 5,
});
const grahanChart = cloneChart(baseChart, {
  SUN: 4,
  RAHU: 4,
  MOON: 10,
  KETU: 10,
});
const shrapitChart = cloneChart(baseChart, {
  SATURN: 6,
  RAHU: 6,
});
const mangalUnavailableChart = cloneChart(baseChart, {}, ["MARS"]);

const mangal = buildDoshaDetectionEngine({ chart: mangalChart });
const kaalSarp = buildDoshaDetectionEngine({ chart: kaalSarpChart });
const pitru = buildDoshaDetectionEngine({ chart: pitruChart });
const guruChandal = buildDoshaDetectionEngine({ chart: guruChandalChart });
const grahan = buildDoshaDetectionEngine({ chart: grahanChart });
const shrapit = buildDoshaDetectionEngine({ chart: shrapitChart });
const mangalUnavailable = buildDoshaDetectionEngine({ chart: mangalUnavailableChart });

assert.notEqual(mangal.status, "unavailable");
assert.notEqual(kaalSarp.status, "unavailable");
assert.notEqual(pitru.status, "unavailable");
assert.notEqual(guruChandal.status, "unavailable");
assert.notEqual(grahan.status, "unavailable");
assert.notEqual(shrapit.status, "unavailable");
assert.equal(mangalUnavailable.status, "partial");

assert.equal(mangal.data?.doshas.find((entry) => entry.doshaKey === "MANGAL_DOSHA")?.status, "present");
assert.equal(kaalSarp.data?.doshas.find((entry) => entry.doshaKey === "KAAL_SARP_DOSHA")?.status, "present");
assert.equal(pitru.data?.doshas.find((entry) => entry.doshaKey === "PITRU_DOSHA")?.status, "present");
assert.equal(guruChandal.data?.doshas.find((entry) => entry.doshaKey === "GURU_CHANDAL_DOSHA")?.status, "present");
assert.equal(grahan.data?.doshas.find((entry) => entry.doshaKey === "GRAHAN_DOSHA")?.status, "present");
assert.equal(shrapit.data?.doshas.find((entry) => entry.doshaKey === "SHRAPIT_TYPE_DOSHA")?.status, "present");
assert.equal(
  mangalUnavailable.data?.doshas.find((entry) => entry.doshaKey === "MANGAL_DOSHA")?.status,
  "unavailable"
);
assert.ok(
  mangalUnavailable.data?.doshas.find((entry) => entry.doshaKey === "MANGAL_DOSHA")?.missingReason
);

process.stdout.write(
  JSON.stringify(
    {
      status: "ok",
      doshas: {
        mangal: mangal.data?.doshas.find((entry) => entry.doshaKey === "MANGAL_DOSHA")?.status ?? null,
        kaalSarp: kaalSarp.data?.doshas.find((entry) => entry.doshaKey === "KAAL_SARP_DOSHA")?.status ?? null,
        pitru: pitru.data?.doshas.find((entry) => entry.doshaKey === "PITRU_DOSHA")?.status ?? null,
        guruChandal: guruChandal.data?.doshas.find((entry) => entry.doshaKey === "GURU_CHANDAL_DOSHA")?.status ?? null,
        grahan: grahan.data?.doshas.find((entry) => entry.doshaKey === "GRAHAN_DOSHA")?.status ?? null,
        shrapit: shrapit.data?.doshas.find((entry) => entry.doshaKey === "SHRAPIT_TYPE_DOSHA")?.status ?? null,
        mangalUnavailable:
          mangalUnavailable.data?.doshas.find((entry) => entry.doshaKey === "MANGAL_DOSHA")?.status ?? null,
      },
    },
    null,
    2
  ) + "\n"
);
