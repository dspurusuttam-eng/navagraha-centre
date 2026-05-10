import assert from "node:assert/strict";

import {
  buildDailyRemedyEngine,
  buildDoshaDetectionEngine,
  buildRemedyIntelligenceEngine,
  buildYogaDetectionEngine,
} from "@/modules/astrology";
import { buildDashaInfrastructureSnapshot } from "@/modules/astrology/dasha";
import { buildTransitPersonalizedFoundation } from "@/modules/astrology/transit";
import { calculateDailyPanchangContext } from "@/modules/panchang";
import { mockAstrologyFixtures } from "@/modules/astrology/fixtures";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { ZodiacSign } from "@/modules/astrology/types";

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

function buildPanchangContext() {
  const result = calculateDailyPanchangContext({
    dateLocal: "2026-05-10",
    location: {
      displayName: "Guwahati, Assam, India",
      latitude: 26.1445,
      longitude: 91.7362,
      timezoneIana: "Asia/Kolkata",
      city: "Guwahati",
      region: "Assam",
      countryName: "India",
      countryCode: "IN",
    },
  });

  assert.equal(result.success, true);
  return result.data;
}

const panchang = buildPanchangContext();
const chart = createVerifiedChart("ARIES");

const panchangOnly = buildDailyRemedyEngine({ panchang });
const chartOnly = buildDailyRemedyEngine({ chart });
const fullStack = buildDailyRemedyEngine({
  panchang,
  chart,
  dashaSnapshot: buildDashaInfrastructureSnapshot({ chart, asOfDateUtc: panchang.generatedAt }),
  transitSnapshot: buildTransitPersonalizedFoundation({
    natalChart: chart,
    transitDateUtc: panchang.as_of_utc,
  }),
  doshaSnapshot: buildDoshaDetectionEngine({ chart }),
  yogaSnapshot: buildYogaDetectionEngine({ chart }),
});
const remedyFallback = buildRemedyIntelligenceEngine({ chart });
const unavailable = buildDailyRemedyEngine({});

assert.equal(panchangOnly.status, "ready");
assert.equal(chartOnly.status, "ready");
assert.equal(fullStack.status, "ready");
assert.equal(unavailable.status, "unavailable");
assert.ok(panchangOnly.data?.dailyRemedy.length);
assert.ok(chartOnly.data?.dailyRemedy.length);
assert.ok(fullStack.data?.sourceContext.length);
assert.equal(fullStack.data?.optional, true);
assert.equal(fullStack.data?.guaranteedResult, false);
assert.ok(remedyFallback.data?.remedies.length);
assert.equal(remedyFallback.data?.remedies[0]?.guaranteedResult, false);

process.stdout.write(
  JSON.stringify(
    {
      status: "ok",
      cases: {
        panchangOnly: {
          status: panchangOnly.status,
          remedyCount: panchangOnly.data?.dailyRemedy.length ?? 0,
          dailyTone: panchangOnly.data?.dailyTone ?? null,
        },
        chartOnly: {
          status: chartOnly.status,
          remedyCount: chartOnly.data?.dailyRemedy.length ?? 0,
          sourceCount: chartOnly.data?.sourceContext.length ?? 0,
        },
        fullStack: {
          status: fullStack.status,
          remedyCount: fullStack.data?.dailyRemedy.length ?? 0,
          sourceCount: fullStack.data?.sourceContext.length ?? 0,
          cautionCount: fullStack.data?.caution.length ?? 0,
        },
        unavailable: {
          status: unavailable.status,
          missingReason: unavailable.error?.message ?? null,
        },
      },
    },
    null,
    2
  ) + "\n"
);
