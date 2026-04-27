import "server-only";

import type { ChartInterpretationResult } from "@/modules/ai";
import { createFallbackInterpretation } from "@/modules/ai/prompts";
import { getAiInterpretationService } from "@/modules/ai/server";
import {
  calculatePredictionConfidence,
  formatConfidenceLine,
  getAstrologyDisclaimer,
  getIncompleteDataFallback,
  logAccuracyEvent,
  resolvePredictionLocale,
  validateChartInterpretationOutput,
  validateNatalReportCompleteness,
  type PredictionConfidenceLevel,
} from "@/lib/astrology/accuracy";
import {
  getRemedyRecommendationService,
  type RemedyRecommendation,
  type ReportChartSignal,
} from "@/modules/remedies";
import {
  type ChartOverview,
} from "@/modules/onboarding/service";
import { getReportChartContextForUser } from "@/modules/report/chart-context";

export const reportDisclosures = [
  "Interpretation language is reflective and should not be treated as medical, legal, or financial advice.",
  "All chart facts on this page come from the deterministic astrology provider layer, not from the AI system.",
  "Recommended remedies are selected only from approved NAVAGRAHA CENTRE records through deterministic rules.",
  "Traditional supports remain optional and should be approached with personal discernment, health awareness, and consultation where needed.",
  "Any product references stay optional and contextual. Remedy practice is never contingent on purchase.",
] as const;

type ReadyChartOverview = ChartOverview & {
  birthProfile: NonNullable<ChartOverview["birthProfile"]>;
  chartRecord: NonNullable<ChartOverview["chartRecord"]>;
  chart: NonNullable<ChartOverview["chart"]>;
};

export type ReportAccuracySnapshot = {
  locale: string;
  confidenceLevel: PredictionConfidenceLevel;
  confidenceLine: string;
  disclaimer: string;
  incompleteDataNotice: string | null;
  missingFields: string[];
};

export type ChartReportReadyState = {
  status: "ready";
  overview: ReadyChartOverview;
  signals: ReportChartSignal[];
  remedies: RemedyRecommendation[];
  interpretation: ChartInterpretationResult;
  accuracy: ReportAccuracySnapshot;
};

export type ChartReportState =
  | {
      status: "empty";
      overview: ChartOverview;
    }
  | ChartReportReadyState;

export async function getChartReport(
  userId: string,
  subjectName: string,
  localeLabel?: string | null,
  localeCode?: string | null
): Promise<ChartReportState> {
  const chartContext = await getReportChartContextForUser(userId);
  const overview = chartContext.overview;

  if (!overview.chart || !overview.chartRecord || !overview.birthProfile) {
    return {
      status: "empty",
      overview,
    };
  }

  const remedyService = getRemedyRecommendationService();
  const recommendations = await remedyService.getRecommendations({
    chart: overview.chart,
    logContext: {
      userId,
      chartRecordId: overview.chartRecord.id,
      surfaceKey: "report",
    },
  });
  const resolvedLocale = resolvePredictionLocale(
    localeCode ?? localeLabel ?? overview.preferredLanguageLabel
  );
  const completeness = validateNatalReportCompleteness(overview.chart);
  const hasBirthTime = Boolean(overview.birthProfile.birthTime?.trim());
  const confidence = calculatePredictionConfidence({
    hasBirthDate: Boolean(overview.birthProfile.birthDate?.trim()),
    hasBirthTime,
    hasBirthPlace: Boolean(
      overview.birthProfile.city?.trim() && overview.birthProfile.country?.trim()
    ),
    hasCoordinates:
      overview.birthProfile.latitude !== null &&
      overview.birthProfile.longitude !== null,
    hasTimezone: Boolean(overview.birthProfile.timezone?.trim()),
    isBirthTimeApproximate:
      overview.birthProfile.birthTime === "00:00" ||
      overview.birthProfile.birthTime === "12:00",
    chartVerified: Boolean(overview.chart.metadata.deterministic),
    astrologyDataComplete: completeness.isComplete,
  });
  const accuracy: ReportAccuracySnapshot = {
    locale: resolvedLocale,
    confidenceLevel: confidence.level,
    confidenceLine: formatConfidenceLine({
      locale: resolvedLocale,
      level: confidence.level,
    }),
    disclaimer: getAstrologyDisclaimer(resolvedLocale),
    incompleteDataNotice: completeness.isComplete
      ? null
      : getIncompleteDataFallback(resolvedLocale),
    missingFields: completeness.missingFields,
  };

  let interpretation: ChartInterpretationResult;

  if (!completeness.isComplete) {
    interpretation = createFallbackInterpretation({
      reportId: overview.chartRecord.id,
      subjectName,
      preferredLanguageLabel: localeLabel ?? overview.preferredLanguageLabel,
      chart: overview.chart,
      signals: recommendations.signals,
    });
    interpretation = {
      ...interpretation,
      caution: `${interpretation.caution} ${getIncompleteDataFallback(resolvedLocale)}`,
    };

    logAccuracyEvent("report-completeness-fallback", {
      userId,
      locale: resolvedLocale,
      missingFields: completeness.missingFields,
    });
  } else {
    interpretation = await getAiInterpretationService().generateChartInterpretation({
      reportId: overview.chartRecord.id,
      subjectName,
      preferredLanguageLabel: localeLabel ?? overview.preferredLanguageLabel,
      chart: overview.chart,
      signals: recommendations.signals,
    });

    const outputValidation = validateChartInterpretationOutput({
      output: interpretation,
      locale: resolvedLocale,
    });

    if (!outputValidation.valid) {
      interpretation = createFallbackInterpretation({
        reportId: overview.chartRecord.id,
        subjectName,
        preferredLanguageLabel: localeLabel ?? overview.preferredLanguageLabel,
        chart: overview.chart,
        signals: recommendations.signals,
      });

      logAccuracyEvent("report-output-fallback", {
        userId,
        locale: resolvedLocale,
        issueCount: outputValidation.issues.length,
        highSeverityIssueCount: outputValidation.issues.filter(
          (item) => item.severity === "high"
        ).length,
      });
    }
  }

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
    accuracy,
  };
}
