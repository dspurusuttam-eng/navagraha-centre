import "server-only";

import type { SiderealBirthChart } from "@/lib/astrology/chart-builder";
import type { NatalChartResponse, PlanetaryBody } from "@/modules/astrology/types";

export type AstrologyAssistantConfidence = "high" | "medium" | "low";

export type ChartAiContext = {
  lagna: {
    sign: string;
    longitude: number;
    degreeInSign: number;
  };
  moonSign: string | null;
  rashiPlacements: Array<{
    body: PlanetaryBody;
    sign: string;
    house: number;
    nakshatra: string;
    pada: number;
    isRetrograde: boolean;
    isCombust: boolean;
  }>;
  housePlacements: Array<{
    house: number;
    sign: string;
    occupants: PlanetaryBody[];
  }>;
  strengths: string[];
  warnings: string[];
  verification: {
    status: SiderealBirthChart["verification"]["verification_status"];
    isValidForAssistant: boolean;
    confidence: AstrologyAssistantConfidence;
  };
};

const grahaLabelMap: Record<PlanetaryBody, string> = {
  SUN: "Sun",
  MOON: "Moon",
  MARS: "Mars",
  MERCURY: "Mercury",
  JUPITER: "Jupiter",
  VENUS: "Venus",
  SATURN: "Saturn",
  RAHU: "Rahu",
  KETU: "Ketu",
};

const siderealNameToBodyMap: Record<string, PlanetaryBody> = {
  SUN: "SUN",
  MOON: "MOON",
  MARS: "MARS",
  MERCURY: "MERCURY",
  JUPITER: "JUPITER",
  VENUS: "VENUS",
  SATURN: "SATURN",
  RAHU: "RAHU",
  KETU: "KETU",
  NORTH_NODE: "RAHU",
  SOUTH_NODE: "KETU",
};

function toPlanetaryBody(name: string): PlanetaryBody | null {
  const normalized = name.trim().replace(/\s+/g, "_").toUpperCase();

  return siderealNameToBodyMap[normalized] ?? null;
}

function normalizeSign(value: string) {
  return value.trim().toLowerCase();
}

function toConfidence(
  status: SiderealBirthChart["verification"]["verification_status"]
): AstrologyAssistantConfidence {
  if (status === "VERIFIED") {
    return "high";
  }

  if (status === "WARNINGS") {
    return "medium";
  }

  return "low";
}

function buildStrengths(
  natalChart: NatalChartResponse,
  placementsByBody: Map<PlanetaryBody, ChartAiContext["rashiPlacements"][number]>
) {
  const dominantBodies = (
    natalChart.summary.strongestPlanets?.length
      ? natalChart.summary.strongestPlanets
      : natalChart.summary.dominantBodies
  ).slice(0, 3);

  return dominantBodies.map((body) => {
    const placement = placementsByBody.get(body);

    if (!placement) {
      return `${grahaLabelMap[body]} is marked as a dominant graha in the current saved chart narrative.`;
    }

    return `${grahaLabelMap[body]} in ${placement.sign} (house ${placement.house}) is a leading emphasis in the current chart pattern.`;
  });
}

function buildWarnings(
  natalChart: NatalChartResponse,
  chart: SiderealBirthChart
) {
  const warnings: string[] = [];

  if (natalChart.summary.challengingPlanets?.length) {
    warnings.push(
      `Watch the tone around ${natalChart.summary.challengingPlanets
        .slice(0, 3)
        .map((body) => grahaLabelMap[body])
        .join(", ")} while making decisions.`
    );
  }

  if (natalChart.summary.challengingHouses?.length) {
    warnings.push(
      `Challenging pressure is currently concentrated around houses ${natalChart.summary.challengingHouses
        .slice(0, 3)
        .join(", ")}.`
    );
  }

  for (const warning of chart.verification.warnings.slice(0, 2)) {
    warnings.push(warning.message);
  }

  return warnings;
}

export function mapUnifiedChartToAiContext(input: {
  chart: SiderealBirthChart;
  natalChart: NatalChartResponse;
}): ChartAiContext {
  const rashiPlacements = input.chart.planets
    .map((planet) => {
      const body = toPlanetaryBody(planet.name);

      if (!body) {
        return null;
      }

      return {
        body,
        sign: planet.sign,
        house: planet.house,
        nakshatra: planet.nakshatra,
        pada: planet.pada,
        isRetrograde: planet.is_retrograde,
        isCombust: planet.is_combust,
      };
    })
    .filter(
      (placement): placement is NonNullable<typeof placement> => placement !== null
    );

  const placementsByBody = new Map(
    rashiPlacements.map((placement) => [placement.body, placement])
  );

  const housePlacements = input.chart.houses
    .slice()
    .sort((left, right) => left.house - right.house)
    .map((house) => ({
      house: house.house,
      sign: house.sign,
      occupants: rashiPlacements
        .filter(
          (placement) =>
            normalizeSign(placement.sign) === normalizeSign(house.sign)
        )
        .map((placement) => placement.body),
    }));

  const moonSign = placementsByBody.get("MOON")?.sign ?? null;
  const confidence = toConfidence(input.chart.verification.verification_status);
  const isValidForAssistant =
    input.chart.verification.is_verified_for_chart_logic &&
    confidence !== "low" &&
    rashiPlacements.length >= 9;

  return {
    lagna: {
      sign: input.chart.lagna.sign,
      longitude: input.chart.lagna.longitude,
      degreeInSign: input.chart.lagna.degree_in_sign,
    },
    moonSign,
    rashiPlacements,
    housePlacements,
    strengths: buildStrengths(input.natalChart, placementsByBody),
    warnings: buildWarnings(input.natalChart, input.chart),
    verification: {
      status: input.chart.verification.verification_status,
      isValidForAssistant,
      confidence,
    },
  };
}
