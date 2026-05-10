import assert from "node:assert/strict";

import { buildTransitGocharFoundation } from "@/modules/astrology/transit/foundation";
import { buildTransitPersonalizedFoundation } from "@/modules/astrology/transit/personalized";
import { mockAstrologyFixtures } from "@/modules/astrology/fixtures";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { ZodiacSign } from "@/modules/astrology/types";

const transitAsOfUtc = new Date("2026-05-09T00:00:00.000Z");
const transitSnapshot = buildTransitGocharFoundation({
  transitDateUtc: transitAsOfUtc,
});

assert.equal(transitSnapshot.status, "ready");
assert.ok(transitSnapshot.data);

type NatalPlanetEntry = UnifiedSiderealChart["planets"][number];

function createWholeSignHouses(ascendantSign: ZodiacSign) {
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

  const startIndex = zodiacSigns.indexOf(ascendantSign);

  return zodiacSigns.map((sign, index) => ({
    house: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    sign: zodiacSigns[(startIndex + index) % zodiacSigns.length],
  }));
}

const natalFixture = mockAstrologyFixtures[0]!;
const natalHouses = createWholeSignHouses(natalFixture.natal.ascendantSign);
const natalHouseBySign: Map<ZodiacSign, number> = new Map(
  natalHouses.map((house) => [house.sign, house.house] as const)
);
const outerBodies = ["URANUS", "NEPTUNE", "PLUTO"] as const;
const natalPlanets: NatalPlanetEntry[] = [
  ...natalFixture.natal.planets.map(
    (planet) =>
      ({
        name: planet.body,
        longitude: planet.longitude ?? 0,
        sign: planet.sign,
        degree_in_sign: planet.degree ?? 0,
        nakshatra: planet.nakshatra?.name ?? "ASHWINI",
        pada: planet.nakshatra?.pada ?? 1,
        is_retrograde: planet.retrograde,
        is_combust: false,
        house: planet.house ?? natalHouseBySign.get(planet.sign) ?? 1,
        speed: planet.speed ?? null,
        divisionalPlacement: {
          code: "D1",
          sign: planet.sign,
          house: planet.house ?? natalHouseBySign.get(planet.sign) ?? 1,
        },
      }) satisfies NatalPlanetEntry
  ),
  ...outerBodies.map((body, index) => {
    const transitPlanet = transitSnapshot.data!.planets.find((planet) => planet.planet === body);
    const sign = (transitPlanet?.sign ?? "ARIES") as ZodiacSign;
    const house =
      natalHouseBySign.get(sign) ??
      ((index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12);

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
        code: "D1",
        sign,
        house,
      },
    } satisfies NatalPlanetEntry;
  }),
];

const natalChart: UnifiedSiderealChart = {
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
    sign: natalFixture.natal.ascendantSign,
    degree_in_sign: 3.5,
  },
  houses: natalHouses,
  planets: natalPlanets,
  verification: {
    is_verified_for_chart_logic: true,
    verification_status: "VERIFIED",
    warnings: [],
    errors: [],
  },
};

const personalizedReady = buildTransitPersonalizedFoundation({
  transitDateUtc: transitAsOfUtc,
  natalChart,
});

assert.equal(personalizedReady.status, "ready");
assert.ok(personalizedReady.data);
assert.equal(personalizedReady.data?.planets.length, 12);
assert.equal(personalizedReady.data?.majorTransitHighlights.length, 4);
assert.equal(personalizedReady.data?.natalOverlayAvailable, true);

const transitOnly = buildTransitPersonalizedFoundation({
  transitDateUtc: transitAsOfUtc,
});

assert.equal(transitOnly.status, "ready");
assert.equal(transitOnly.data?.natalOverlayAvailable, false);

const invalidTimezone = buildTransitPersonalizedFoundation({
  transitDateLocal: "2026-05-09",
  transitTimeLocal: "09:00",
  timezone: "Invalid/Zone",
});

assert.equal(invalidTimezone.status, "unavailable");

process.stdout.write(
  JSON.stringify(
    {
      ready: {
        planets: personalizedReady.data?.planets.length ?? 0,
        majorTransitHighlights: personalizedReady.data?.majorTransitHighlights.length ?? 0,
        natalOverlayAvailable: personalizedReady.data?.natalOverlayAvailable ?? false,
        transitSummary: personalizedReady.data?.transitSummary ?? null,
      },
      transitOnly: {
        natalOverlayAvailable: transitOnly.data?.natalOverlayAvailable ?? false,
        transitSummary: transitOnly.data?.transitSummary ?? null,
      },
      invalidTimezone: {
        status: invalidTimezone.status,
        error: invalidTimezone.error,
      },
    },
    null,
    2
  ) + "\n"
);
