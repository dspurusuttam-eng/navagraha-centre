import "server-only";

import {
  debilitationSignsByBody,
  exaltationSignsByBody,
  nakshatraLabelMap,
  ownSignsByBody,
  planetLabelMap,
  zodiacSignLabelMap,
} from "@/lib/astrology/constants";
import type {
  HouseNumber,
  NatalChartResponse,
  PlanetPosition,
  PlanetaryBody,
} from "@/modules/astrology/types";

const challengingHouses = new Set<HouseNumber>([6, 8, 12]);
const ordinalHouseLabels: Record<HouseNumber, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
  6: "6th",
  7: "7th",
  8: "8th",
  9: "9th",
  10: "10th",
  11: "11th",
  12: "12th",
};

function formatBody(body: PlanetaryBody) {
  return planetLabelMap[body];
}

function formatSign(sign: PlanetPosition["sign"]) {
  return zodiacSignLabelMap[sign];
}

function formatNakshatra(planet: PlanetPosition) {
  if (!planet.nakshatra) {
    return null;
  }

  return `${nakshatraLabelMap[planet.nakshatra.name]} pada ${planet.nakshatra.pada}`;
}

function isOwnSign(planet: PlanetPosition) {
  return ownSignsByBody[planet.body]?.includes(planet.sign) ?? false;
}

function isExalted(planet: PlanetPosition) {
  return exaltationSignsByBody[planet.body] === planet.sign;
}

function isDebilitated(planet: PlanetPosition) {
  return debilitationSignsByBody[planet.body] === planet.sign;
}

function buildThemeLine(planet: PlanetPosition) {
  const nakshatraLine = formatNakshatra(planet);

  if (isExalted(planet)) {
    return `${formatBody(planet.body)} is exalted in ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house${nakshatraLine ? `, in ${nakshatraLine}` : ""}.`;
  }

  if (isOwnSign(planet)) {
    return `${formatBody(planet.body)} is in its own sign of ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house${nakshatraLine ? `, in ${nakshatraLine}` : ""}.`;
  }

  return `${formatBody(planet.body)} is placed in ${formatSign(planet.sign)} in the ${ordinalHouseLabels[planet.house]} house${nakshatraLine ? `, in ${nakshatraLine}` : ""}.`;
}

export function buildChartSummaryInsights(chart: NatalChartResponse) {
  const strongestPlanetLines = (chart.summary.strongestPlanets ?? [])
    .map((body) => chart.planets.find((planet) => planet.body === body))
    .filter((planet): planet is PlanetPosition => Boolean(planet))
    .slice(0, 3)
    .map((planet) => buildThemeLine(planet));

  const cautionLines = (chart.summary.challengingPlanets ?? [])
    .map((body) => {
      const planet = chart.planets.find((entry) => entry.body === body);

      if (!planet) {
        return null;
      }

      if (isDebilitated(planet)) {
        return `${formatBody(body)} is debilitated in ${formatSign(planet.sign)}, so that area benefits from more patience and humility than force.`;
      }

      if (challengingHouses.has(planet.house)) {
        return `${formatBody(body)} is working through the ${ordinalHouseLabels[planet.house]} house, so that topic is better handled carefully and without overstatement.`;
      }

      return `${formatBody(body)} carries some tension in the current chart and benefits from slower judgement.`;
    })
    .filter((line): line is string => Boolean(line))
    .slice(0, 3);

  const recommendationLines = [
    chart.currentDasha
      ? `The current ${formatBody(chart.currentDasha.lord)} mahadasha remains the main timing backdrop for interpretation and practical follow-through.`
      : null,
    chart.yogas?.length
      ? `${chart.yogas.map((yoga) => yoga.title).join(", ")} should be read as potential patterns, not guaranteed outcomes.`
      : null,
    chart.remedySignals[0]
      ? chart.remedySignals[0].rationale
      : "A measured spiritual routine is the safest baseline until more nuanced context is added through consultation.",
  ].filter((line): line is string => Boolean(line));

  return {
    strengths: strongestPlanetLines,
    challenges: cautionLines,
    recommendations: recommendationLines,
  };
}
