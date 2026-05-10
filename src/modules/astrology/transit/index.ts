import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import { createAstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import type { AstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import { getTransitContextForChart } from "@/modules/astrology/transit-context";
export { buildTransitGocharFoundation } from "@/modules/astrology/transit/foundation";
export {
  buildTransitPersonalizedFoundation,
} from "@/modules/astrology/transit/personalized";
export type {
  TransitMajorTransitSummary,
  TransitPersonalizedComparisonReadiness,
  TransitPersonalizedFoundationData,
  TransitPersonalizedFoundationSnapshot,
  TransitPersonalizedPlanetEntry,
  TransitRahuKetuTransitSummary,
} from "@/modules/astrology/transit/personalized";

type TransitContextData = Extract<
  ReturnType<typeof getTransitContextForChart>,
  { success: true }
>["data"];

export type TransitInfrastructureSnapshot = AstrologyInfrastructureSnapshot<TransitContextData>;

export function buildTransitInfrastructureSnapshot(input: {
  chart: UnifiedSiderealChart | null | undefined;
  asOfDateUtc?: Date | string;
}): TransitInfrastructureSnapshot {
  const result = getTransitContextForChart({
    chart: input.chart,
    asOfDateUtc: input.asOfDateUtc,
  });

  if (!result.success) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: result.error.code,
        message: result.error.message,
        details: result.details,
      },
    });
  }

  return createAstrologyInfrastructureSnapshot({
    status: "ready",
    data: result.data,
  });
}
