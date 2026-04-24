import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import { getYogaRuleContextForChart } from "@/modules/astrology/yoga-rule-context";

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function buildKnownValidChartContext(): UnifiedSiderealChart {
  return {
    birth_context: {
      date_local: "1996-04-12",
      time_local: "19:30",
      place: "Guwahati, Assam, India",
      latitude: 26.1445,
      longitude: 91.7362,
      timezone: "Asia/Kolkata",
      birth_utc: "1996-04-12T14:00:00.000Z",
    },
    settings: {
      zodiac: "sidereal",
      ayanamsha: "LAHIRI",
      house_system: "whole_sign",
    },
    lagna: {
      longitude: 15.2,
      sign: "Aries",
      degree_in_sign: 15.2,
    },
    houses: [
      { house: 1, sign: "Aries" },
      { house: 2, sign: "Taurus" },
      { house: 3, sign: "Gemini" },
      { house: 4, sign: "Cancer" },
      { house: 5, sign: "Leo" },
      { house: 6, sign: "Virgo" },
      { house: 7, sign: "Libra" },
      { house: 8, sign: "Scorpio" },
      { house: 9, sign: "Sagittarius" },
      { house: 10, sign: "Capricorn" },
      { house: 11, sign: "Aquarius" },
      { house: 12, sign: "Pisces" },
    ],
    planets: [
      {
        name: "Sun",
        longitude: 28.2,
        sign: "Aries",
        degree_in_sign: 28.2,
        nakshatra: "Bharani",
        pada: 4,
        is_retrograde: false,
        is_combust: false,
        house: 1,
      },
      {
        name: "Moon",
        longitude: 86.2754,
        sign: "Gemini",
        degree_in_sign: 26.2754,
        nakshatra: "Punarvasu",
        pada: 3,
        is_retrograde: false,
        is_combust: false,
        house: 3,
      },
      {
        name: "Mars",
        longitude: 312.1,
        sign: "Aquarius",
        degree_in_sign: 12.1,
        nakshatra: "Shatabhisha",
        pada: 2,
        is_retrograde: false,
        is_combust: false,
        house: 11,
      },
      {
        name: "Mercury",
        longitude: 5.0,
        sign: "Aries",
        degree_in_sign: 5.0,
        nakshatra: "Ashwini",
        pada: 2,
        is_retrograde: false,
        is_combust: true,
        house: 1,
      },
      {
        name: "Jupiter",
        longitude: 265.4,
        sign: "Sagittarius",
        degree_in_sign: 25.4,
        nakshatra: "Purva Ashadha",
        pada: 4,
        is_retrograde: false,
        is_combust: false,
        house: 9,
      },
      {
        name: "Venus",
        longitude: 18.5,
        sign: "Aries",
        degree_in_sign: 18.5,
        nakshatra: "Bharani",
        pada: 2,
        is_retrograde: false,
        is_combust: false,
        house: 1,
      },
      {
        name: "Saturn",
        longitude: 330.0,
        sign: "Pisces",
        degree_in_sign: 0.0,
        nakshatra: "Purva Bhadrapada",
        pada: 4,
        is_retrograde: false,
        is_combust: false,
        house: 12,
      },
      {
        name: "Rahu",
        longitude: 186.0,
        sign: "Libra",
        degree_in_sign: 6.0,
        nakshatra: "Swati",
        pada: 2,
        is_retrograde: true,
        is_combust: false,
        house: 7,
      },
      {
        name: "Ketu",
        longitude: 6.0,
        sign: "Aries",
        degree_in_sign: 6.0,
        nakshatra: "Ashwini",
        pada: 2,
        is_retrograde: true,
        is_combust: false,
        house: 1,
      },
    ],
    verification: {
      is_verified_for_chart_logic: true,
      verification_status: "VERIFIED",
      warnings: [],
      errors: [],
    },
  };
}

async function main() {
  const invalidChartContextMode = hasFlag("--invalid-chart-context");

  const chart = invalidChartContextMode ? null : buildKnownValidChartContext();
  const yogaRuleContext = getYogaRuleContextForChart({
    chart,
  });

  console.log(
    JSON.stringify(
      {
        invalid_chart_context_mode: invalidChartContextMode,
        yoga_rule_context: yogaRuleContext,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
