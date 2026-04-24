import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  getPredictiveSynthesisContextForChart,
  type PredictiveSynthesisConfidence,
  type PredictiveSynthesisContextResult,
} from "@/modules/astrology/predictive-synthesis-context";

export type PredictiveAssistantContextFailureCode =
  | "INVALID_CHART_CONTEXT"
  | "PREDICTIVE_SYNTHESIS_FAILED";

export type PredictiveAssistantContextOutput = {
  as_of: string;
  chart_identity: {
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
  timing_focus: string[];
  dominant_planets: string[];
  dominant_houses: number[];
  supportive_factors: string[];
  pressure_factors: string[];
  caution_flags: string[];
  confidence: {
    level: PredictiveSynthesisConfidence;
    reasons: string[];
  };
  conservative_interpretation_framing: {
    directives: string[];
  };
};

export type PredictiveAssistantContextSuccess = {
  success: true;
  data: PredictiveAssistantContextOutput;
};

export type PredictiveAssistantContextFailure = {
  success: false;
  error: {
    code: PredictiveAssistantContextFailureCode;
    message: string;
  };
  details?: unknown;
};

export type PredictiveAssistantContextResult =
  | PredictiveAssistantContextSuccess
  | PredictiveAssistantContextFailure;

function fail(
  code: PredictiveAssistantContextFailureCode,
  message: string,
  details?: unknown
): PredictiveAssistantContextFailure {
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
}) {
  const cautionFlags: string[] = [];

  if (input.confidence === "low") {
    cautionFlags.push(
      "Confidence is low. Keep interpretation brief and explicitly tentative."
    );
  }

  if (input.pressureFactors.length > 0) {
    cautionFlags.push(
      "Current timing has active pressure factors. Emphasize pacing and grounded decisions."
    );
  }

  return cautionFlags;
}

function mapFromPredictiveSynthesis(
  synthesis: Exclude<PredictiveSynthesisContextResult, { success: false }>
): PredictiveAssistantContextOutput {
  const activeChain = [
    synthesis.data.dasha_context.mahadasha?.planet ?? null,
    synthesis.data.dasha_context.antardasha?.planet ?? null,
    synthesis.data.dasha_context.pratyantar?.planet ?? null,
    synthesis.data.dasha_context.day_dasha?.planet ?? null,
  ].filter((value): value is string => typeof value === "string");
  const confidenceLevel = synthesis.data.synthesis_summary.confidence;
  const pressureFactors = synthesis.data.synthesis_summary.active_pressure_factors;
  const cautionFlags = deriveCautionFlags({
    confidence: confidenceLevel,
    pressureFactors,
  });

  return {
    as_of: synthesis.data.as_of,
    chart_identity: {
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
    timing_focus: synthesis.data.synthesis_summary.timing_focus,
    dominant_planets: synthesis.data.synthesis_summary.dominant_planets,
    dominant_houses: synthesis.data.synthesis_summary.dominant_houses,
    supportive_factors: synthesis.data.synthesis_summary.active_supportive_factors,
    pressure_factors: pressureFactors,
    caution_flags: cautionFlags,
    confidence: {
      level: confidenceLevel,
      reasons: synthesis.data.synthesis_summary.confidence_reasons,
    },
    conservative_interpretation_framing: {
      directives: [
        "Ground all claims in chart + timing context only.",
        "Avoid certainty language and keep interpretation non-deterministic.",
        "Frame remedies and actions as optional supports, not guarantees.",
      ],
    },
  };
}

export function getPredictiveAssistantContextForChart(input: {
  chart: UnifiedSiderealChart | null | undefined;
  asOfDateUtc?: Date | string;
}): PredictiveAssistantContextResult {
  if (!input.chart) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is required for predictive assistant grounding."
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
