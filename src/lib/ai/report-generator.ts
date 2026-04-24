import "server-only";

import { fallbackCurrentCycleSummary } from "@/lib/astrology/current-cycle";
import {
  createEmptyChartOverview,
  fallbackChartInsights,
  generateChartInsights,
  loadChartAnalysisContext,
} from "@/lib/ai/chart-analysis";
import { getCurrentCycleSummary } from "@/lib/ai/current-cycle";
import { suggestRemedies } from "@/lib/ai/remedies-engine";
import type { GeneratedUserReport, ReportPredictiveContext } from "@/lib/ai/types";
import { retrieveOrRefreshBirthChartForUser } from "@/modules/astrology/chart-retrieval";
import { getPredictiveReportContextForChart } from "@/modules/astrology/predictive-report-context";
import { getChartReport } from "@/modules/report/service";

function buildReportPredictiveContext(
  userChartResult: Awaited<ReturnType<typeof retrieveOrRefreshBirthChartForUser>>
): ReportPredictiveContext | null {
  if (!userChartResult.success) {
    return null;
  }

  const predictive = getPredictiveReportContextForChart({
    chart: userChartResult.data.chart,
  });

  if (!predictive.success) {
    return null;
  }

  return predictive.data;
}

function createFallbackUserReport(): GeneratedUserReport {
  return {
    chartReport: {
      status: "empty",
      overview: createEmptyChartOverview(),
    },
    insights: fallbackChartInsights,
    currentCycle: fallbackCurrentCycleSummary,
    consultationNotes: [],
    remedies: [],
    predictiveContext: null,
    reportSummary: {
      headline: "Your report surface is available.",
      overview:
        "No chart or consultation data is available yet, so the report is showing a safe fallback state.",
    },
  };
}

export async function generateUserReport(
  userId: string,
  subjectName?: string | null
): Promise<GeneratedUserReport> {
  try {
    const [chartReport, insights, currentCycle, context, remedies, userChartResult] =
      await Promise.all([
      getChartReport(userId, subjectName ?? "NAVAGRAHA CENTRE member"),
      generateChartInsights(userId),
      getCurrentCycleSummary(userId),
      loadChartAnalysisContext(userId),
      suggestRemedies(userId).catch((error) => {
        console.error("suggestRemedies failed", error);
        return [];
      }),
      retrieveOrRefreshBirthChartForUser(userId),
    ]);
    const predictiveContext = buildReportPredictiveContext(userChartResult);

    return {
      chartReport:
        chartReport ?? {
          status: "empty",
          overview: createEmptyChartOverview(),
        },
      insights: insights ?? fallbackChartInsights,
      currentCycle,
      consultationNotes: context.consultationNotes ?? [],
      remedies: remedies ?? [],
      predictiveContext,
      reportSummary: {
        headline:
          chartReport.status === "ready"
            ? "Your stored chart now carries a readable private narrative."
            : "Your report surface is ready for the first saved chart.",
        overview: context.consultationNotes.length
          ? "This report now combines structured chart insight with the latest consultation context already attached to your private account."
          : "This report combines structured chart insight with a clean data layer, ready for future consultation notes and deeper AI support.",
      },
    };
  } catch (error) {
    console.error("generateUserReport failed", error);

    return createFallbackUserReport();
  }
}
