import { planetLabelMap, planetSortOrder } from "@/lib/astrology/constants";
import type {
  AstrologyChartLike,
  AstrologyChartSummary,
} from "@/modules/astrology/core/types";
import type { PlanetaryBody } from "@/modules/astrology/types";

function getSortedBodies(bodies: readonly PlanetaryBody[] | undefined) {
  return [...new Set(bodies ?? [])].sort(
    (left, right) =>
      (planetSortOrder.get(left) ?? Number.MAX_SAFE_INTEGER) -
      (planetSortOrder.get(right) ?? Number.MAX_SAFE_INTEGER)
  );
}

export function buildAstrologyChartSummary(
  chart: AstrologyChartLike,
  input?: {
    chartKind?: AstrologyChartSummary["chart_kind"];
    note?: string;
  }
): AstrologyChartSummary {
  const dominantBodies = getSortedBodies(chart.summary?.dominantBodies);
  const supportiveBodies = getSortedBodies(chart.summary?.strongestPlanets);
  const challengingBodies = getSortedBodies(chart.summary?.challengingPlanets);
  const activeHouses = [...new Set(chart.houses.map((house) => house.house))].sort(
    (left, right) => left - right
  );

  const lagnaSign = chart.lagna?.sign ?? null;
  const moonSign = chart.planets.find((planet) => planet.body === "MOON")?.sign ?? null;
  const bodyLine = dominantBodies.map((body) => planetLabelMap[body]).join(", ");

  return {
    version: "2026-05",
    chart_kind: input?.chartKind ?? "READINESS",
    ascendant_sign: lagnaSign,
    moon_sign: moonSign,
    dominant_bodies: dominantBodies,
    supportive_bodies: supportiveBodies,
    challenging_bodies: challengingBodies,
    active_houses: activeHouses,
    note:
      input?.note ??
      chart.summary?.narrative ??
      `Astrology infrastructure snapshot for ${bodyLine || "the current chart"}.`,
  };
}
