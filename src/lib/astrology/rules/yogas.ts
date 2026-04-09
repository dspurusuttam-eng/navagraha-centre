import "server-only";

import { planetLabelMap } from "@/lib/astrology/constants";
import type {
  HousePlacement,
  NatalChartResponse,
  PlanetPosition,
  PlanetaryBody,
  VedicAspect,
  YogaResult,
} from "@/modules/astrology/types";

function getPlanet(
  planets: readonly PlanetPosition[],
  body: PlanetaryBody
) {
  return planets.find((planet) => planet.body === body);
}

function getHouseLord(
  houses: readonly HousePlacement[],
  houseNumber: number
) {
  return houses.find((house) => house.house === houseNumber)?.ruler;
}

function formatBody(body: PlanetaryBody) {
  return planetLabelMap[body];
}

function areConjunct(
  planets: readonly PlanetPosition[],
  leftBody: PlanetaryBody,
  rightBody: PlanetaryBody
) {
  const left = getPlanet(planets, leftBody);
  const right = getPlanet(planets, rightBody);

  return Boolean(left && right && left.house === right.house);
}

function hasMutualVedicAspect(
  aspects: readonly VedicAspect[],
  leftBody: PlanetaryBody,
  rightBody: PlanetaryBody
) {
  return aspects.some(
    (aspect) =>
      aspect.source === leftBody &&
      aspect.target === rightBody &&
      aspect.exact
  );
}

function buildRajYoga(
  houses: readonly HousePlacement[],
  planets: readonly PlanetPosition[],
  vedicAspects: readonly VedicAspect[]
): YogaResult | null {
  const kendraLords = [1, 4, 7, 10]
    .map((houseNumber) => getHouseLord(houses, houseNumber))
    .filter((value): value is PlanetaryBody => Boolean(value));
  const trikonaLords = [1, 5, 9]
    .map((houseNumber) => getHouseLord(houses, houseNumber))
    .filter((value): value is PlanetaryBody => Boolean(value));

  for (const kendraLord of kendraLords) {
    for (const trikonaLord of trikonaLords) {
      if (kendraLord === trikonaLord) {
        return {
          key: "RAJ_YOGA",
          title: "Raj Yoga",
          description:
            "A kendra and trikona rulership converges in the same graha, strengthening dignity, leadership, and purposeful rise when supported by the wider chart.",
          strength: "STRONG",
          evidence: [
            `${formatBody(kendraLord)} simultaneously carries kendra and trikona responsibility.`,
          ],
          relatedBodies: [kendraLord],
        } satisfies YogaResult;
      }

      if (
        areConjunct(planets, kendraLord, trikonaLord) ||
        hasMutualVedicAspect(vedicAspects, kendraLord, trikonaLord) ||
        hasMutualVedicAspect(vedicAspects, trikonaLord, kendraLord)
      ) {
        return {
          key: "RAJ_YOGA",
          title: "Raj Yoga",
          description:
            "A kendra lord and a trikona lord are directly linked, creating a classic Raj Yoga pattern that can support influence, recognition, and steadier executive capacity.",
          strength: "PRESENT",
          evidence: [
            `${formatBody(kendraLord)} is linked with ${formatBody(trikonaLord)} through conjunction or graha drishti.`,
          ],
          relatedBodies: [kendraLord, trikonaLord],
        } satisfies YogaResult;
      }
    }
  }

  return null;
}

function buildDhanaYoga(
  houses: readonly HousePlacement[],
  planets: readonly PlanetPosition[],
  vedicAspects: readonly VedicAspect[]
): YogaResult | null {
  const wealthLords = [2, 11]
    .map((houseNumber) => getHouseLord(houses, houseNumber))
    .filter((value): value is PlanetaryBody => Boolean(value));
  const fortuneLords = [5, 9]
    .map((houseNumber) => getHouseLord(houses, houseNumber))
    .filter((value): value is PlanetaryBody => Boolean(value));

  for (const wealthLord of wealthLords) {
    for (const fortuneLord of fortuneLords) {
      if (
        wealthLord === fortuneLord ||
        areConjunct(planets, wealthLord, fortuneLord) ||
        hasMutualVedicAspect(vedicAspects, wealthLord, fortuneLord) ||
        hasMutualVedicAspect(vedicAspects, fortuneLord, wealthLord)
      ) {
        return {
          key: "DHANA_YOGA",
          title: "Dhana Yoga",
          description:
            "Wealth and fortune houses are linked, suggesting stronger material support when discipline, timing, and ethics remain aligned with the rest of the chart.",
          strength: wealthLord === fortuneLord ? "STRONG" : "PRESENT",
          evidence: [
            `${formatBody(wealthLord)} connects the 2nd/11th wealth axis with ${formatBody(fortuneLord)} from the 5th/9th fortune axis.`,
          ],
          relatedBodies: [wealthLord, fortuneLord],
        } satisfies YogaResult;
      }
    }
  }

  return null;
}

function buildChandraMangalaYoga(
  planets: readonly PlanetPosition[],
  vedicAspects: readonly VedicAspect[]
): YogaResult | null {
  if (
    areConjunct(planets, "MOON", "MARS") ||
    hasMutualVedicAspect(vedicAspects, "MARS", "MOON") ||
    hasMutualVedicAspect(vedicAspects, "MOON", "MARS")
  ) {
    return {
      key: "CHANDRA_MANGALA_YOGA",
      title: "Chandra-Mangala Yoga",
      description:
        "Moon and Mars are connected, intensifying emotional drive, entrepreneurial push, and the need to channel urgency with steadier emotional judgement.",
      strength: areConjunct(planets, "MOON", "MARS") ? "STRONG" : "PRESENT",
      evidence: [
        "Moon and Mars are joined by conjunction or direct graha drishti.",
      ],
      relatedBodies: ["MOON", "MARS"],
    } satisfies YogaResult;
  }

  return null;
}

export function calculateYogas(
  chart: Pick<NatalChartResponse, "houses" | "planets" | "vedicAspects">
): YogaResult[] {
  const yogaCandidates: Array<YogaResult | null> = [
    buildRajYoga(chart.houses, chart.planets, chart.vedicAspects ?? []),
    buildDhanaYoga(chart.houses, chart.planets, chart.vedicAspects ?? []),
    buildChandraMangalaYoga(chart.planets, chart.vedicAspects ?? []),
  ];

  return yogaCandidates.filter((value): value is YogaResult => value !== null);
}
