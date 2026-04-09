import "server-only";

import {
  createEmptyChartOverview,
  fallbackChartInsights,
  generateChartInsights,
  loadChartAnalysisContext,
} from "@/lib/ai/chart-analysis";
import { suggestRemedies } from "@/lib/ai/remedies-engine";
import type { GeneratedUserReport } from "@/lib/ai/types";
import { getChartReport } from "@/modules/report/service";

function createFallbackUserReport(): GeneratedUserReport {
  return {
    chartReport: {
      status: "empty",
      overview: createEmptyChartOverview(),
    },
    insights: fallbackChartInsights,
    consultationNotes: [],
    remedies: [],
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
    const [chartReport, insights, context, remedies] = await Promise.all([
      getChartReport(userId, subjectName ?? "NAVAGRAHA CENTRE member"),
      generateChartInsights(userId),
      loadChartAnalysisContext(userId),
      suggestRemedies(userId).catch((error) => {
        console.error("suggestRemedies failed", error);
        return [];
      }),
    ]);

    return {
      chartReport:
        chartReport ?? {
          status: "empty",
          overview: createEmptyChartOverview(),
        },
      insights: insights ?? fallbackChartInsights,
      consultationNotes: context.consultationNotes ?? [],
      remedies: remedies ?? [],
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
