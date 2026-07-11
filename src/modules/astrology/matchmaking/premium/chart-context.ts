// Card 10.2 — Chart context adapter (pure).
//
// Derives Moon sign / nakshatra / pada NUMERICALLY from the verified chart's
// Moon longitude — no display-name string matching (the old foundation's
// "Mrigashira" vs "MRIGASHIRSHA" class of bug is structurally impossible).
// Start-inclusive / end-exclusive boundaries via exact index arithmetic.

import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  NAKSHATRA_DISPLAY_NAMES,
  SIGN_DISPLAY_NAMES,
} from "@/modules/astrology/matchmaking/premium/constants";
import type {
  CalculationRole,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function normalizeLongitude(value: number): number {
  const normalized = value % 360;

  return normalized < 0 ? normalized + 360 : normalized;
}

/** 0..26; boundary instant belongs to the next nakshatra (start-inclusive). */
export function nakshatraIndexOf(longitude: number): number {
  return Math.floor((normalizeLongitude(longitude) * 27) / 360) % 27;
}

/** 1..4 within the nakshatra (exact quarter arithmetic, no float drift). */
export function padaOf(longitude: number): number {
  return (Math.floor((normalizeLongitude(longitude) * 108) / 360) % 4) + 1;
}

/** 0..11 whole-sign index. */
export function signIndexOf(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12;
}

/** Whole-sign house of `subjectSign` counted from `referenceSign`, 1..12. */
export function houseFromSign(subjectSign: number, referenceSign: number): number {
  return ((((subjectSign - referenceSign) % 12) + 12) % 12) + 1;
}

function planetLongitude(
  chart: UnifiedSiderealChart,
  name: string
): number | null {
  const planet = chart.planets?.find(
    (entry) => entry.name?.trim().toUpperCase() === name
  );

  return planet && Number.isFinite(planet.longitude) ? planet.longitude : null;
}

export function buildMatchPersonContext(input: {
  chart: unknown;
  calculationRole: CalculationRole | null;
}): MatchPersonContext {
  const empty: MatchPersonContext = {
    verified: false,
    moonLongitude: null,
    moonSignIndex: null,
    moonSignName: null,
    nakshatraIndex: null,
    nakshatraName: null,
    padaIndex: null,
    moonDegreeInSign: null,
    lagnaSignIndex: null,
    marsSignIndex: null,
    venusSignIndex: null,
    calculationRole: input.calculationRole,
    unavailableReason: null,
  };
  const chart = input.chart as UnifiedSiderealChart | null | undefined;

  if (!chart || !Array.isArray(chart.planets)) {
    return { ...empty, unavailableReason: "Chart data is missing." };
  }

  if (!chart.verification?.is_verified_for_chart_logic) {
    return {
      ...empty,
      unavailableReason: "Chart is not verified for compatibility calculation.",
    };
  }

  const moonLongitude = planetLongitude(chart, "MOON");

  if (moonLongitude === null) {
    return {
      ...empty,
      verified: true,
      unavailableReason: "Verified chart does not contain a usable Moon longitude.",
    };
  }

  const normalizedMoon = normalizeLongitude(moonLongitude);
  const moonSignIndex = signIndexOf(normalizedMoon);
  const nakshatraIndex = nakshatraIndexOf(normalizedMoon);
  const lagnaLongitude = Number.isFinite(chart.lagna?.longitude)
    ? chart.lagna.longitude
    : null;
  const marsLongitude = planetLongitude(chart, "MARS");
  const venusLongitude = planetLongitude(chart, "VENUS");

  return {
    verified: true,
    moonLongitude: normalizedMoon,
    moonSignIndex,
    moonSignName: SIGN_DISPLAY_NAMES[moonSignIndex],
    nakshatraIndex,
    nakshatraName: NAKSHATRA_DISPLAY_NAMES[nakshatraIndex],
    padaIndex: padaOf(normalizedMoon),
    moonDegreeInSign: normalizedMoon % 30,
    lagnaSignIndex: lagnaLongitude !== null ? signIndexOf(lagnaLongitude) : null,
    marsSignIndex: marsLongitude !== null ? signIndexOf(marsLongitude) : null,
    venusSignIndex: venusLongitude !== null ? signIndexOf(venusLongitude) : null,
    calculationRole: input.calculationRole,
    unavailableReason: null,
  };
}
