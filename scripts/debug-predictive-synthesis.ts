import { getPredictiveSynthesisContextForChart } from "@/modules/astrology/predictive-synthesis-context";
import {
  buildKnownValidChartContext,
  hasFlag,
  readArg,
} from "./_predictive-chart-fixture";

async function main() {
  const asOfDateUtc = readArg("--as-of") ?? undefined;
  const invalidChartContextMode = hasFlag("--invalid-chart-context");
  const chart = invalidChartContextMode ? null : buildKnownValidChartContext();
  const synthesis = getPredictiveSynthesisContextForChart({
    chart,
    asOfDateUtc,
  });

  const synthesisPreview = synthesis.success
    ? {
        as_of: synthesis.data.as_of,
        chart_identity: synthesis.data.chart_identity,
        dasha_context: synthesis.data.dasha_context,
        transit_key_houses: synthesis.data.transit_context.key_active_houses,
        yoga_signal_count: synthesis.data.yoga_rule_context.yoga_signals.length,
        dominant_planets: synthesis.data.synthesis_summary.dominant_planets,
        dominant_houses: synthesis.data.synthesis_summary.dominant_houses,
        supportive_factors:
          synthesis.data.synthesis_summary.active_supportive_factors,
        pressure_factors: synthesis.data.synthesis_summary.active_pressure_factors,
        confidence: synthesis.data.synthesis_summary.confidence,
        confidence_reasons: synthesis.data.synthesis_summary.confidence_reasons,
      }
    : null;

  console.log(
    JSON.stringify(
      {
        as_of_date_utc: asOfDateUtc ?? null,
        invalid_chart_context_mode: invalidChartContextMode,
        predictive_synthesis_preview: synthesisPreview,
        predictive_synthesis: synthesis,
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
