import "server-only";

import type { ChartInterpretationResult } from "@/modules/ai";
import { getAiInterpretationService } from "@/modules/ai/server";
import {
  getRemedyRecommendationService,
  type RemedyRecommendation,
  type ReportChartSignal,
} from "@/modules/remedies";
import {
  getChartOverview,
  type ChartOverview,
} from "@/modules/onboarding/service";

export const reportDisclosures = [
  "Interpretation language is reflective and should not be treated as medical, legal, or financial advice.",
  "All chart facts on this page come from the deterministic astrology provider layer, not from the AI system.",
  "Recommended remedies are selected only from approved NAVAGRAHA CENTRE records through deterministic rules.",
  "Traditional supports remain optional and should be approached with personal discernment, health awareness, and consultation where needed.",
] as const;

type ReadyChartOverview = ChartOverview & {
  birthProfile: NonNullable<ChartOverview["birthProfile"]>;
  chartRecord: NonNullable<ChartOverview["chartRecord"]>;
  chart: NonNullable<ChartOverview["chart"]>;
};

export type ChartReportReadyState = {
  status: "ready";
  overview: ReadyChartOverview;
  signals: ReportChartSignal[];
  remedies: RemedyRecommendation[];
  interpretation: ChartInterpretationResult;
};

export type ChartReportState =
  | {
      status: "empty";
      overview: ChartOverview;
    }
  | ChartReportReadyState;

export async function getChartReport(
  userId: string,
  subjectName: string
): Promise<ChartReportState> {
  const overview = await getChartOverview(userId);

  if (!overview.chart || !overview.chartRecord || !overview.birthProfile) {
    return {
      status: "empty",
      overview,
    };
  }

  const remedyService = getRemedyRecommendationService();
  const recommendations = await remedyService.getRecommendations({
    chart: overview.chart,
  });

  const interpretation =
    await getAiInterpretationService().generateChartInterpretation({
      reportId: overview.chartRecord.id,
      subjectName,
      preferredLanguageLabel: overview.preferredLanguageLabel,
      chart: overview.chart,
      signals: recommendations.signals,
    });

  const readyOverview: ReadyChartOverview = {
    ...overview,
    birthProfile: overview.birthProfile,
    chartRecord: overview.chartRecord,
    chart: overview.chart,
  };

  return {
    status: "ready",
    overview: readyOverview,
    signals: recommendations.signals,
    remedies: recommendations.recommendations,
    interpretation,
  };
}
