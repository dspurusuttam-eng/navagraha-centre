import "server-only";

import {
  buildCurrentCycleSummary,
  createCurrentTransitWindow,
  fallbackCurrentCycleSummary,
  type CurrentCycleSummary,
} from "@/lib/astrology/current-cycle";
import { getAstrologyService } from "@/modules/astrology/server";
import { getChartOverview } from "@/modules/onboarding/service";

function buildUnavailableCycle(reason: string): CurrentCycleSummary {
  return {
    ...fallbackCurrentCycleSummary,
    generatedAtUtc: new Date().toISOString(),
    unavailableReason: reason,
  };
}

export async function getCurrentCycleSummary(
  userId: string
): Promise<CurrentCycleSummary> {
  try {
    const overview = await getChartOverview(userId);

    if (!overview.chart || !overview.chartRecord) {
      return buildUnavailableCycle(
        "A stored natal chart is required before current timing can be calculated."
      );
    }

    const hasCoordinates =
      overview.chart.birthDetails.place.latitude !== null &&
      overview.chart.birthDetails.place.latitude !== undefined &&
      overview.chart.birthDetails.place.longitude !== null &&
      overview.chart.birthDetails.place.longitude !== undefined;

    if (!hasCoordinates) {
      return buildUnavailableCycle(
        "Current transit timing needs saved birth coordinates before it can be generated safely."
      );
    }

    const transitSnapshot = await getAstrologyService().getTransitSnapshot({
      kind: "TRANSIT_SNAPSHOT",
      requestId: crypto.randomUUID(),
      subjectId: userId,
      birthDetails: overview.chart.birthDetails,
      houseSystem: overview.chart.houseSystem,
      window: createCurrentTransitWindow(),
    });

    return buildCurrentCycleSummary({
      chart: overview.chart,
      transitSnapshot,
    });
  } catch (error) {
    console.error("getCurrentCycleSummary failed", error);

    return buildUnavailableCycle(
      "Current timing could not be refreshed just now, so the page is staying in a safe fallback state."
    );
  }
}
