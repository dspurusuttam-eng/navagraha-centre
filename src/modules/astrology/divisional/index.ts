import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  createAstrologyInfrastructureSnapshot,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";
import { vargaCodes } from "@/modules/astrology/divisional/varga-engine";

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
    status: "ready",
    data: {
      supported_chart_codes: vargaCodes,
      future_chart_codes: [] as const,
      note:
        "All sixteen Shodashvarga divisional charts are computed from verified natal sidereal longitudes using classical Parashara (BPHS) division rules. Sign placements only; no divisional degrees are fabricated.",
    },
  });
}

export { buildDivisionalChartReadiness } from "@/modules/astrology/divisional/foundation";
export {
  buildVargaChart,
  calculateVargaPlacement,
  listVargottamaBodies,
  vargaCodes,
  type VargaChart,
  type VargaCode,
  type VargaPlacement,
} from "@/modules/astrology/divisional/varga-engine";
export { buildDivisionalInterpretationReadiness } from "@/modules/astrology/divisional/interpretation";
