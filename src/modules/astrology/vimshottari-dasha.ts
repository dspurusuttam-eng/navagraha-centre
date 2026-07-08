import {
  calculateVimshottariMahadashaTimeline,
  getActiveDashaLineage,
  resolveVimshottariDashaPath,
  type VimshottariActiveLineage,
  type VimshottariDashaPathData,
  type VimshottariMahadashaTimeline,
} from "@/lib/astrology/rules/dasha";
import type { ClassicalPlanetaryBody } from "@/modules/astrology/types";

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

type VerifiedMoonContext = {
  moonLongitude: number;
  birthDateUtc: string;
};

function resolveVerifiedMoonContext(
  chart: VimshottariChartContextInput | null | undefined
):
  | { success: true; data: VerifiedMoonContext }
  | VimshottariChartDashaFailure {
  if (
    !chart ||
    !isNonEmptyString(chart.birth_context?.birth_utc) ||
    !Array.isArray(chart.planets)
  ) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is missing required birth_utc or planets data."
    );
  }

  if (!chart.verification?.is_verified_for_chart_logic) {
    return fail(
      "UNVERIFIED_CHART_CONTEXT",
      "Chart context must be verified before Vimshottari Mahadasha can be calculated."
    );
  }

  const moon = chart.planets.find(
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

  return {
    success: true,
    data: {
      moonLongitude: moon.longitude,
      birthDateUtc: chart.birth_context.birth_utc,
    },
  };
}

export function buildVimshottariMahadashaForChartContext(input: {
  chart: VimshottariChartContextInput | null | undefined;
  asOfDateUtc?: Date | string;
  periodCount?: number;
}): VimshottariChartDashaResult {
  const context = resolveVerifiedMoonContext(input.chart);

  if (!context.success) {
    return context;
  }

  const timeline = calculateVimshottariMahadashaTimeline({
    moonLongitude: context.data.moonLongitude,
    birthDateUtc: context.data.birthDateUtc,
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

export type VimshottariChartActiveLineageResult =
  | { success: true; data: VimshottariActiveLineage }
  | VimshottariChartDashaFailure;

export function buildVimshottariActiveLineageForChartContext(input: {
  chart: VimshottariChartContextInput | null | undefined;
  asOfDateUtc?: Date | string;
}): VimshottariChartActiveLineageResult {
  const context = resolveVerifiedMoonContext(input.chart);

  if (!context.success) {
    return context;
  }

  const lineage = getActiveDashaLineage({
    moonLongitude: context.data.moonLongitude,
    birthDateUtc: context.data.birthDateUtc,
    asOfDateUtc: input.asOfDateUtc,
  });

  if (!lineage.success) {
    return fail(
      "DASHA_CALCULATION_FAILED",
      lineage.issue.message,
      lineage.issue
    );
  }

  return {
    success: true,
    data: lineage.data,
  };
}

export type VimshottariChartDashaPathResult =
  | { success: true; data: VimshottariDashaPathData }
  | VimshottariChartDashaFailure;

export function buildVimshottariDashaPathForChartContext(input: {
  chart: VimshottariChartContextInput | null | undefined;
  lineage: readonly ClassicalPlanetaryBody[];
  asOfDateUtc?: Date | string;
}): VimshottariChartDashaPathResult {
  const context = resolveVerifiedMoonContext(input.chart);

  if (!context.success) {
    return context;
  }

  const resolved = resolveVimshottariDashaPath({
    moonLongitude: context.data.moonLongitude,
    birthDateUtc: context.data.birthDateUtc,
    asOfDateUtc: input.asOfDateUtc,
    lineage: input.lineage,
  });

  if (!resolved.success) {
    return fail(
      "DASHA_CALCULATION_FAILED",
      resolved.issue.message,
      resolved.issue
    );
  }

  return {
    success: true,
    data: resolved.data,
  };
}
