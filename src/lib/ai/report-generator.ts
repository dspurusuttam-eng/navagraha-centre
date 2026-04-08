import "server-only";

import { generateChartInsights, loadChartAnalysisContext } from "@/lib/ai/chart-analysis";
import { suggestRemedies } from "@/lib/ai/remedies-engine";
import type { GeneratedUserReport } from "@/lib/ai/types";
import { getChartReport } from "@/modules/report/service";

export async function generateUserReport(
  userId: string,
  subjectName?: string | null
): Promise<GeneratedUserReport> {
  const [chartReport, insights, context, remedies] = await Promise.all([
    getChartReport(userId, subjectName ?? "NAVAGRAHA CENTRE member"),
    generateChartInsights(userId),
    loadChartAnalysisContext(userId),
    suggestRemedies(userId),
  ]);

  return {
    chartReport,
    insights,
    consultationNotes: context.consultationNotes,
    remedies,
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
}
