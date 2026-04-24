import {
  calculateVimshottariMahadashaTimeline,
  type VimshottariMahadashaTimeline,
} from "@/lib/astrology/rules/dasha";

type ChartPlanetRow = {
  name: string;
  longitude: number;
  nakshatra?: string;
};

export type VimshottariChartContextInput = {
  birth_context: {
    birth_utc: string;
  };
  planets: ChartPlanetRow[];
  verification: {
    is_verified_for_chart_logic: boolean;
  };
};

export type VimshottariChartDashaErrorCode =
  | "INVALID_CHART_CONTEXT"
  | "UNVERIFIED_CHART_CONTEXT"
  | "MOON_PLANET_MISSING"
  | "MOON_NAKSHATRA_MISSING"
  | "DASHA_CALCULATION_FAILED";

export type VimshottariChartDashaFailure = {
  success: false;
  error: {
    code: VimshottariChartDashaErrorCode;
    message: string;
  };
  details?: unknown;
};

export type VimshottariChartDashaSuccess = {
  success: true;
  data: VimshottariMahadashaTimeline;
};

export type VimshottariChartDashaResult =
  | VimshottariChartDashaFailure
  | VimshottariChartDashaSuccess;

function fail(
  code: VimshottariChartDashaErrorCode,
  message: string,
  details?: unknown
): VimshottariChartDashaFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
    details,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function buildVimshottariMahadashaForChartContext(input: {
  chart: VimshottariChartContextInput | null | undefined;
  asOfDateUtc?: Date | string;
  periodCount?: number;
}): VimshottariChartDashaResult {
  if (
    !input.chart ||
    !isNonEmptyString(input.chart.birth_context?.birth_utc) ||
    !Array.isArray(input.chart.planets)
  ) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is missing required birth_utc or planets data."
    );
  }

  if (!input.chart.verification?.is_verified_for_chart_logic) {
    return fail(
      "UNVERIFIED_CHART_CONTEXT",
      "Chart context must be verified before Vimshottari Mahadasha can be calculated."
    );
  }

  const moon = input.chart.planets.find(
    (planet) => planet.name.trim().toUpperCase() === "MOON"
  );

  if (!moon || !Number.isFinite(moon.longitude)) {
    return fail(
      "MOON_PLANET_MISSING",
      "Verified chart context does not contain a valid Moon longitude."
    );
  }

  if (!isNonEmptyString(moon.nakshatra)) {
    return fail(
      "MOON_NAKSHATRA_MISSING",
      "Verified chart context does not contain Moon nakshatra information."
    );
  }

  const timeline = calculateVimshottariMahadashaTimeline({
    moonLongitude: moon.longitude,
    birthDateUtc: input.chart.birth_context.birth_utc,
    asOfDateUtc: input.asOfDateUtc,
    periodCount: input.periodCount,
  });

  if (!timeline.success) {
    return fail(
      "DASHA_CALCULATION_FAILED",
      timeline.issue.message,
      timeline.issue
    );
  }

  return {
    success: true,
    data: timeline.data,
  };
}
