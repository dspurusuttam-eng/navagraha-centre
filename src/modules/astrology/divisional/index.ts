import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  createAstrologyInfrastructureSnapshot,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";

export type DivisionalInfrastructureSnapshot = AstrologyInfrastructureSnapshot<{
  supported_chart_codes: readonly string[];
  future_chart_codes: readonly string[];
  note: string;
}>;

export function buildDivisionalInfrastructureSnapshot(input: {
  chart: UnifiedSiderealChart | null | undefined;
}): DivisionalInfrastructureSnapshot {
  if (!input.chart) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "INVALID_CHART_CONTEXT",
        message: "Chart context is required for divisional readiness.",
      },
    });
  }

  return createAstrologyInfrastructureSnapshot({
    status: "partial",
    data: {
      supported_chart_codes: ["D1", "D9", "D10"] as const,
      future_chart_codes: ["D7", "D4", "D12", "D60"] as const,
      note:
        "Divisional infrastructure is staged with D1 available and D9/D10 hooks reserved. No fabricated divisional chart is generated here.",
    },
  });
}

export { buildDivisionalChartReadiness } from "@/modules/astrology/divisional/foundation";
export { buildDivisionalInterpretationReadiness } from "@/modules/astrology/divisional/interpretation";
