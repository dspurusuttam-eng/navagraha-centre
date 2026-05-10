import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import { createAstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import type { AstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import { getDashaContextForChart } from "@/modules/astrology/dasha-context";
export { buildVimshottariDashaFoundation } from "@/modules/astrology/dasha/foundation";

type DashaContextData = Extract<
  ReturnType<typeof getDashaContextForChart>,
  { success: true }
>["data"];

export type DashaInfrastructureSnapshot = AstrologyInfrastructureSnapshot<DashaContextData>;

export function buildDashaInfrastructureSnapshot(input: {
  chart: UnifiedSiderealChart | null | undefined;
  asOfDateUtc?: Date | string;
  periodCount?: number;
}): DashaInfrastructureSnapshot {
  const result = getDashaContextForChart({
    chart: input.chart,
    asOfDateUtc: input.asOfDateUtc,
    periodCount: input.periodCount,
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
