import { getPredictiveAssistantContextForChart } from "@/modules/astrology/predictive-assistant-context";
import {
  buildKnownValidChartContext,
  hasFlag,
  readArg,
} from "./_predictive-chart-fixture";

async function main() {
  const asOfDateUtc = readArg("--as-of") ?? undefined;
  const invalidChartContextMode = hasFlag("--invalid-chart-context");
  const chart = invalidChartContextMode ? null : buildKnownValidChartContext();
  const assistantContext = getPredictiveAssistantContextForChart({
    chart,
    asOfDateUtc,
  });

  const preview = assistantContext.success
    ? {
        as_of: assistantContext.data.as_of,
        chart_identity: assistantContext.data.chart_identity,
        active_period_context: assistantContext.data.active_period_context,
        timing_focus: assistantContext.data.timing_focus,
        dominant_planets: assistantContext.data.dominant_planets,
        dominant_houses: assistantContext.data.dominant_houses,
        caution_flags: assistantContext.data.caution_flags,
        confidence: assistantContext.data.confidence,
      }
    : null;

  console.log(
    JSON.stringify(
      {
        as_of_date_utc: asOfDateUtc ?? null,
        invalid_chart_context_mode: invalidChartContextMode,
        predictive_assistant_context_preview: preview,
        predictive_assistant_context: assistantContext,
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
