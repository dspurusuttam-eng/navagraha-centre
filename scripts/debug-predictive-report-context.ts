import { getPredictiveReportContextForChart } from "@/modules/astrology/predictive-report-context";
import {
  buildKnownValidChartContext,
  hasFlag,
  readArg,
} from "./_predictive-chart-fixture";

async function main() {
  const asOfDateUtc = readArg("--as-of") ?? undefined;
  const invalidChartContextMode = hasFlag("--invalid-chart-context");
  const chart = invalidChartContextMode ? null : buildKnownValidChartContext();
  const reportContext = getPredictiveReportContextForChart({
    chart,
    asOfDateUtc,
  });

  const preview = reportContext.success
    ? {
        as_of: reportContext.data.as_of,
        chart_identity_summary: reportContext.data.chart_identity_summary,
        active_period_context: reportContext.data.active_period_context,
        dominant_timing_factors: {
          dominant_planets:
            reportContext.data.dominant_timing_factors.dominant_planets,
          dominant_houses:
            reportContext.data.dominant_timing_factors.dominant_houses,
          timing_focus: reportContext.data.dominant_timing_factors.timing_focus,
          caution_flags:
            reportContext.data.dominant_timing_factors.caution_flags,
        },
        confidence: reportContext.data.confidence,
      }
    : null;

  console.log(
    JSON.stringify(
      {
        as_of_date_utc: asOfDateUtc ?? null,
        invalid_chart_context_mode: invalidChartContextMode,
        predictive_report_context_preview: preview,
        predictive_report_context: reportContext,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
