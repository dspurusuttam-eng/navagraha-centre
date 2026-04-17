import "server-only";

import {
  retrieveOrRefreshBirthChartForUser,
  type RetrieveOrRefreshBirthChartResult,
} from "@/modules/astrology/chart-retrieval";
import {
  getChartOverview,
  type ChartOverview,
} from "@/modules/onboarding/service";

export type ReportChartContextSource =
  | "SAVED_CHART_REUSED"
  | "SAVED_CHART_REFRESHED"
  | "SAVED_CHART_REBUILT"
  | "SAVED_CHART_UNAVAILABLE";

export type ReportChartContext = {
  overview: ChartOverview;
  source: ReportChartContextSource;
  retrieval: RetrieveOrRefreshBirthChartResult;
};

function toSource(
  retrieval: RetrieveOrRefreshBirthChartResult
): ReportChartContextSource {
  if (!retrieval.success) {
    return "SAVED_CHART_UNAVAILABLE";
  }

  switch (retrieval.data.retrieval.policy) {
    case "reused_saved_chart":
      return "SAVED_CHART_REUSED";
    case "refreshed_stale_chart":
      return "SAVED_CHART_REFRESHED";
    case "rebuilt_missing_saved_chart":
      return "SAVED_CHART_REBUILT";
    default:
      return "SAVED_CHART_UNAVAILABLE";
  }
}

export async function getReportChartContextForUser(
  userId: string
): Promise<ReportChartContext> {
  const retrieval = await retrieveOrRefreshBirthChartForUser(userId);
  const overview = await getChartOverview(userId, {
    preloadedSavedChartResult: retrieval,
  });

  return {
    overview,
    source: toSource(retrieval),
    retrieval,
  };
}
