import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  getPredictiveSynthesisContextForChart,
  type PredictiveSynthesisConfidence,
  type PredictiveSynthesisContextResult,
} from "@/modules/astrology/predictive-synthesis-context";

export type PredictiveReportContextFailureCode =
  | "INVALID_CHART_CONTEXT"
  | "PREDICTIVE_SYNTHESIS_FAILED";

export type PredictiveReportContextOutput = {
  as_of: string;
  chart_identity_summary: {
    lagna_sign: string;
    moon_sign: string;
    moon_nakshatra: string;
  };
  active_period_context: {
    mahadasha: string | null;
    antardasha: string | null;
    pratyantar: string | null;
    day_dasha: string | null;
    active_chain: string[];
    next_transition_at: string | null;
    next_transition_level:
      | "MAHADASHA"
      | "ANTARDASHA"
      | "PRATYANTAR"
      | "DAY_DASHA"
      | null;
  };
  transit_context_summary: {
    key_active_houses: number[];
    active_transit_planets: string[];
  };
  yoga_rule_summary: {
    yoga_signal_count: number;
    top_yoga_signals: Array<{
      yoga_name: string;
      confidence: "high" | "medium" | "low";
      planets_involved: string[];
    }>;
  };
  dominant_timing_factors: {
    dominant_planets: string[];
    dominant_houses: number[];
    timing_focus: string[];
    supportive_factors: string[];
    pressure_factors: string[];
    caution_flags: string[];
  };
  confidence: {
    level: PredictiveSynthesisConfidence;
    reasons: string[];
  };
};

export type PredictiveReportContextSuccess = {
  success: true;
  data: PredictiveReportContextOutput;
};

export type PredictiveReportContextFailure = {
  success: false;
  error: {
    code: PredictiveReportContextFailureCode;
    message: string;
  };
  details?: unknown;
};

export type PredictiveReportContextResult =
  | PredictiveReportContextSuccess
  | PredictiveReportContextFailure;

function fail(
  code: PredictiveReportContextFailureCode,
  message: string,
  details?: unknown
): PredictiveReportContextFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
    details,
  };
}

function deriveCautionFlags(input: {
  confidence: PredictiveSynthesisConfidence;
  pressureFactors: string[];
  nextTransitionAt: string | null;
}) {
  const cautionFlags: string[] = [];

  if (input.confidence !== "high") {
    cautionFlags.push(
      "Interpretation confidence is not high, so use the timing layer conservatively."
    );
  }

  if (input.pressureFactors.length > 0) {
    cautionFlags.push("Active pressure factors are present in the current cycle.");
  }

  if (!input.nextTransitionAt) {
    cautionFlags.push("Next timing transition is not available in the current context.");
  }

  return cautionFlags;
}

function mapFromPredictiveSynthesis(
  synthesis: Exclude<PredictiveSynthesisContextResult, { success: false }>
): PredictiveReportContextOutput {
  const activeChain = [
    synthesis.data.dasha_context.mahadasha?.planet ?? null,
    synthesis.data.dasha_context.antardasha?.planet ?? null,
    synthesis.data.dasha_context.pratyantar?.planet ?? null,
    synthesis.data.dasha_context.day_dasha?.planet ?? null,
  ].filter((value): value is string => typeof value === "string");

  return {
    as_of: synthesis.data.as_of,
    chart_identity_summary: {
      lagna_sign: synthesis.data.chart_identity.lagna_sign,
      moon_sign: synthesis.data.chart_identity.moon_sign,
      moon_nakshatra: synthesis.data.chart_identity.moon_nakshatra,
    },
    active_period_context: {
      mahadasha: synthesis.data.dasha_context.mahadasha?.planet ?? null,
      antardasha: synthesis.data.dasha_context.antardasha?.planet ?? null,
      pratyantar: synthesis.data.dasha_context.pratyantar?.planet ?? null,
      day_dasha: synthesis.data.dasha_context.day_dasha?.planet ?? null,
      active_chain: activeChain,
      next_transition_at: synthesis.data.dasha_context.next_transition_at,
      next_transition_level: synthesis.data.dasha_context.next_transition_level,
    },
    transit_context_summary: {
      key_active_houses: synthesis.data.transit_context.key_active_houses,
      active_transit_planets: synthesis.data.transit_context.active_transits.map(
        (transit) => transit.planet
      ),
    },
    yoga_rule_summary: {
      yoga_signal_count: synthesis.data.yoga_rule_context.yoga_signals.length,
      top_yoga_signals: synthesis.data.yoga_rule_context.yoga_signals
        .slice(0, 5)
        .map((signal) => ({
          yoga_name: signal.yoga_name,
          confidence: signal.confidence,
          planets_involved: signal.planets_involved,
        })),
    },
    dominant_timing_factors: {
      dominant_planets: synthesis.data.synthesis_summary.dominant_planets,
      dominant_houses: synthesis.data.synthesis_summary.dominant_houses,
      timing_focus: synthesis.data.synthesis_summary.timing_focus,
      supportive_factors:
        synthesis.data.synthesis_summary.active_supportive_factors,
      pressure_factors: synthesis.data.synthesis_summary.active_pressure_factors,
      caution_flags: deriveCautionFlags({
        confidence: synthesis.data.synthesis_summary.confidence,
        pressureFactors: synthesis.data.synthesis_summary.active_pressure_factors,
        nextTransitionAt: synthesis.data.dasha_context.next_transition_at,
      }),
    },
    confidence: {
      level: synthesis.data.synthesis_summary.confidence,
      reasons: synthesis.data.synthesis_summary.confidence_reasons,
    },
  };
}

export function getPredictiveReportContextForChart(input: {
  chart: UnifiedSiderealChart | null | undefined;
  asOfDateUtc?: Date | string;
}): PredictiveReportContextResult {
  if (!input.chart) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is required for predictive report context."
    );
  }

  const synthesis = getPredictiveSynthesisContextForChart({
    chart: input.chart,
    asOfDateUtc: input.asOfDateUtc,
  });

  if (!synthesis.success) {
    return fail(
      "PREDICTIVE_SYNTHESIS_FAILED",
      synthesis.error.message,
      synthesis.error
    );
  }

  return {
    success: true,
    data: mapFromPredictiveSynthesis(synthesis),
  };
}
