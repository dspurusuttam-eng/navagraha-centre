import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  buildVimshottariMahadashaForChartContext,
  type VimshottariChartContextInput,
} from "@/modules/astrology/vimshottari-dasha";

type DashaTransitionLevel =
  | "MAHADASHA"
  | "ANTARDASHA"
  | "PRATYANTAR"
  | "DAY_DASHA";

type DashaLevelSnapshot = {
  planet: string;
  start_date: string;
  end_date: string;
};

type DashaLevelDates = {
  start_date: string;
  end_date: string;
};

type DashaWindowEntry = {
  planet: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

type NextTransition = {
  level: DashaTransitionLevel;
  at: string;
};

export type UnifiedDashaContextOutput = {
  moon_nakshatra: string;
  nakshatra_lord: string;
  current_dasha_context: {
    mahadasha: DashaLevelSnapshot | null;
    antardasha: DashaLevelSnapshot | null;
    pratyantar: DashaLevelSnapshot | null;
    day_dasha: DashaLevelSnapshot | null;
  };
  current_dasha_dates: {
    mahadasha: DashaLevelDates | null;
    antardasha: DashaLevelDates | null;
    pratyantar: DashaLevelDates | null;
    day_dasha: DashaLevelDates | null;
  };
  dasha_timeline_summary: {
    active_chain: string[];
    next_transition_at: string | null;
    next_transition_level: DashaTransitionLevel | null;
    birth_balance: {
      mahadasha_lord: string;
      elapsed_years: number;
      remaining_years: number;
      remaining_days: number;
      period_start_at_utc: string;
      period_end_at_utc: string;
    };
    current_level_dates: {
      mahadasha: DashaLevelDates | null;
      antardasha: DashaLevelDates | null;
      pratyantar: DashaLevelDates | null;
      day_dasha: DashaLevelDates | null;
    };
  };
  nearby_context: {
    day_dasha_window: DashaWindowEntry[];
  };
};

export type UnifiedDashaContextErrorCode =
  | "INVALID_CHART_CONTEXT"
  | "DASHA_CONTEXT_UNAVAILABLE"
  | "ACTIVE_DASHA_CHAIN_MISSING";

export type UnifiedDashaContextFailure = {
  success: false;
  error: {
    code: UnifiedDashaContextErrorCode;
    message: string;
  };
  details?: unknown;
};

export type UnifiedDashaContextSuccess = {
  success: true;
  data: UnifiedDashaContextOutput;
};

export type UnifiedDashaContextResult =
  | UnifiedDashaContextFailure
  | UnifiedDashaContextSuccess;

function fail(
  code: UnifiedDashaContextErrorCode,
  message: string,
  details?: unknown
): UnifiedDashaContextFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
    details,
  };
}

function toChartInput(
  chart: UnifiedSiderealChart | VimshottariChartContextInput
): VimshottariChartContextInput {
  return {
    birth_context: {
      birth_utc: chart.birth_context.birth_utc,
    },
    planets: chart.planets.map((planet) => ({
      name: planet.name,
      longitude: planet.longitude,
      nakshatra: "nakshatra" in planet ? planet.nakshatra : undefined,
    })),
    verification: {
      is_verified_for_chart_logic:
        chart.verification.is_verified_for_chart_logic,
    },
  };
}

function toSnapshot(value: {
  planet: string;
  startAtUtc: string;
  endAtUtc: string;
} | null): DashaLevelSnapshot | null {
  if (!value) {
    return null;
  }

  return {
    planet: value.planet,
    start_date: value.startAtUtc,
    end_date: value.endAtUtc,
  };
}

function toDates(value: {
  startAtUtc: string;
  endAtUtc: string;
} | null): DashaLevelDates | null {
  if (!value) {
    return null;
  }

  return {
    start_date: value.startAtUtc,
    end_date: value.endAtUtc,
  };
}

function toDayWindow(
  value:
    | {
        dayDashaWindow: Array<{
          planet: string;
          startAtUtc: string;
          endAtUtc: string;
          isActive: boolean;
        }>;
      }
    | null
): DashaWindowEntry[] {
  if (!value) {
    return [];
  }

  return value.dayDashaWindow.map((period) => ({
    planet: period.planet,
    start_date: period.startAtUtc,
    end_date: period.endAtUtc,
    is_active: period.isActive,
  }));
}

function toActiveChain(input: {
  mahadasha: DashaLevelSnapshot | null;
  antardasha: DashaLevelSnapshot | null;
  pratyantar: DashaLevelSnapshot | null;
  dayDasha: DashaLevelSnapshot | null;
}) {
  return [
    input.mahadasha?.planet,
    input.antardasha?.planet,
    input.pratyantar?.planet,
    input.dayDasha?.planet,
  ].filter((planet): planet is string => typeof planet === "string");
}

function parseDateSafe(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getNextTransition(input: {
  asOfDateUtc: Date;
  mahadasha: DashaLevelSnapshot | null;
  antardasha: DashaLevelSnapshot | null;
  pratyantar: DashaLevelSnapshot | null;
  dayDasha: DashaLevelSnapshot | null;
}): NextTransition | null {
  const rawCandidates: Array<{
    level: DashaTransitionLevel;
    at: Date | null;
  }> = [
    {
      level: "DAY_DASHA",
      at: parseDateSafe(input.dayDasha?.end_date),
    },
    {
      level: "PRATYANTAR",
      at: parseDateSafe(input.pratyantar?.end_date),
    },
    {
      level: "ANTARDASHA",
      at: parseDateSafe(input.antardasha?.end_date),
    },
    {
      level: "MAHADASHA",
      at: parseDateSafe(input.mahadasha?.end_date),
    },
  ];
  const candidates = rawCandidates.filter(
    (candidate): candidate is { level: DashaTransitionLevel; at: Date } => {
      if (!candidate.at) {
        return false;
      }

      return candidate.at.getTime() > input.asOfDateUtc.getTime();
    }
  );

  if (!candidates.length) {
    return null;
  }

  candidates.sort((left, right) => left.at.getTime() - right.at.getTime());
  const winner = candidates[0]!;

  return {
    level: winner.level,
    at: winner.at.toISOString(),
  };
}

export function getDashaContextForChart(input: {
  chart: UnifiedSiderealChart | VimshottariChartContextInput | null | undefined;
  asOfDateUtc?: Date | string;
  periodCount?: number;
}): UnifiedDashaContextResult {
  if (!input.chart) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is required for dasha output integration."
    );
  }

  const dasha = buildVimshottariMahadashaForChartContext({
    chart: toChartInput(input.chart),
    asOfDateUtc: input.asOfDateUtc,
    periodCount: input.periodCount,
  });

  if (!dasha.success) {
    return fail(
      "DASHA_CONTEXT_UNAVAILABLE",
      dasha.error.message,
      dasha.error
    );
  }

  const mahadasha = toSnapshot(dasha.data.activeMahadasha);
  const antardasha = toSnapshot(dasha.data.activeAntardasha);
  const pratyantar = toSnapshot(dasha.data.activePratyantar);
  const dayDasha = toSnapshot(dasha.data.activeDayDasha);

  if (!mahadasha || !antardasha || !pratyantar || !dayDasha) {
    return fail(
      "ACTIVE_DASHA_CHAIN_MISSING",
      "Active dasha chain is incomplete for unified dasha context output.",
      {
        has_mahadasha: Boolean(mahadasha),
        has_antardasha: Boolean(antardasha),
        has_pratyantar: Boolean(pratyantar),
        has_day_dasha: Boolean(dayDasha),
      }
    );
  }

  const currentLevelDates = {
    mahadasha: toDates(dasha.data.activeMahadasha),
    antardasha: toDates(dasha.data.activeAntardasha),
    pratyantar: toDates(dasha.data.activePratyantar),
    day_dasha: toDates(dasha.data.activeDayDasha),
  };
  const asOfDate = input.asOfDateUtc
    ? parseDateSafe(
        input.asOfDateUtc instanceof Date
          ? input.asOfDateUtc.toISOString()
          : input.asOfDateUtc
      ) ?? new Date()
    : new Date();
  const nextTransition = getNextTransition({
    asOfDateUtc: asOfDate,
    mahadasha,
    antardasha,
    pratyantar,
    dayDasha,
  });

  return {
    success: true,
    data: {
      moon_nakshatra: dasha.data.moonNakshatra.name,
      nakshatra_lord: dasha.data.nakshatraLord,
      current_dasha_context: {
        mahadasha,
        antardasha,
        pratyantar,
        day_dasha: dayDasha,
      },
      current_dasha_dates: currentLevelDates,
      dasha_timeline_summary: {
        active_chain: toActiveChain({
          mahadasha,
          antardasha,
          pratyantar,
          dayDasha,
        }),
        next_transition_at: nextTransition?.at ?? null,
        next_transition_level: nextTransition?.level ?? null,
        birth_balance: {
          mahadasha_lord: dasha.data.birthBalance.mahadashaLord,
          elapsed_years: dasha.data.birthBalance.elapsedYears,
          remaining_years: dasha.data.birthBalance.remainingYears,
          remaining_days: dasha.data.birthBalance.remainingDays,
          period_start_at_utc: dasha.data.birthBalance.periodStartAtUtc,
          period_end_at_utc: dasha.data.birthBalance.periodEndAtUtc,
        },
        current_level_dates: currentLevelDates,
      },
      nearby_context: {
        day_dasha_window: toDayWindow(dasha.data.currentDayDashaContext),
      },
    },
  };
}
