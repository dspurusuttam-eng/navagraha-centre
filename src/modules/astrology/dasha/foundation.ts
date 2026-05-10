import type { NatalChartResponse } from "@/modules/astrology/types";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import { planetLabelMap } from "@/lib/astrology/constants";
import { createAstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import type { AstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import {
  buildVimshottariMahadashaForChartContext,
  type VimshottariChartContextInput,
} from "@/modules/astrology/vimshottari-dasha";

export type DashaFoundationTimelineEntry = {
  planet: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  summary: string;
};

export type DashaInterpretationFocusEntry = {
  planet: string;
  periodLabel: "Mahadasha" | "Antardasha" | "Pratyantardasha";
  meaningPlaceholder: string;
  lifeAreaFocus: string[];
  summary: string;
};

export type VimshottariDashaFoundationData = {
  dashaType: "VIMSHOTTARI";
  currentMahadasha: DashaFoundationTimelineEntry | null;
  currentAntardasha: DashaFoundationTimelineEntry | null;
  currentPratyantardasha: DashaFoundationTimelineEntry | null;
  timeline: DashaFoundationTimelineEntry[];
  mahadashaTimeline: DashaFoundationTimelineEntry[];
  antardashaTimeline: DashaFoundationTimelineEntry[];
  pratyantardashaTimeline: DashaFoundationTimelineEntry[];
  birthBalance: {
    planet: string;
    elapsedYears: number;
    remainingYears: number;
    remainingDays: number;
    periodStartAtUtc: string;
    periodEndAtUtc: string;
  } | null;
  safeSummary: string;
  missingReason: string | null;
  asOfDateUtc: string;
  interpretation: {
    mahadasha: DashaInterpretationFocusEntry | null;
    antardasha: DashaInterpretationFocusEntry | null;
    pratyantardasha: DashaInterpretationFocusEntry | null;
    notes: string[];
  };
};

export type VimshottariDashaFoundationSnapshot =
  AstrologyInfrastructureSnapshot<VimshottariDashaFoundationData>;

type DashaInputChart =
  | UnifiedSiderealChart
  | NatalChartResponse
  | VimshottariChartContextInput;

function formatPlanet(value: string) {
  return planetLabelMap[value.toUpperCase() as keyof typeof planetLabelMap] ?? value;
}

function formatDateRange(startDate: string, endDate: string) {
  return `${new Date(startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} - ${new Date(endDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function normalizeAsOfDateUtc(value?: Date | string) {
  if (!value) {
    return new Date().toISOString();
  }

  const normalized =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);

  return Number.isNaN(normalized.getTime())
    ? new Date().toISOString()
    : normalized.toISOString();
}

function toUtcFromLocal(dateLocal: string, timeLocal: string, timezone: string) {
  try {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const [hour, minute] = timeLocal.split(":").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    return null;
  }

  const getParts = (date: Date) => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = formatter.formatToParts(date);

    return {
      year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
      month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
      day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
      hour: Number(parts.find((part) => part.type === "hour")?.value ?? "0"),
      minute: Number(parts.find((part) => part.type === "minute")?.value ?? "0"),
      second: Number(parts.find((part) => part.type === "second")?.value ?? "0"),
    };
  };

  const getOffsetMs = (date: Date) => {
    const parts = getParts(date);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );

    return asUtc - date.getTime();
  };

  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getOffsetMs(new Date(naiveUtcMs));
  let utcMs = naiveUtcMs - initialOffset;
  const correctedOffset = getOffsetMs(new Date(utcMs));

  if (correctedOffset !== initialOffset) {
    utcMs = naiveUtcMs - correctedOffset;
  }

  return new Date(utcMs);
  } catch {
    return null;
  }
}

function toVimshottariContext(
  chart: DashaInputChart | null | undefined
): VimshottariChartContextInput | null {
  if (!chart) {
    return null;
  }

  if ("birth_context" in chart) {
    return {
      birth_context: {
        birth_utc: chart.birth_context.birth_utc,
      },
      planets: chart.planets.map((planet) => ({
        name: planet.name,
        longitude: planet.longitude,
        nakshatra: planet.nakshatra,
      })),
      verification: {
        is_verified_for_chart_logic: chart.verification.is_verified_for_chart_logic,
      },
    };
  }

  if ("birthDetails" in chart) {
    const birthUtc = toUtcFromLocal(
      chart.birthDetails.dateLocal,
      chart.birthDetails.timeLocal,
      chart.birthDetails.timezone
    );
    const moon = chart.planets.find((planet) => planet.body === "MOON");

    if (!birthUtc || !moon?.nakshatra?.name) {
      return null;
    }

    return {
      birth_context: {
        birth_utc: birthUtc.toISOString(),
      },
      planets: chart.planets.map((planet) => ({
        name: planet.body,
        longitude: planet.longitude,
        nakshatra: planet.nakshatra?.name,
      })),
      verification: {
        is_verified_for_chart_logic: true,
      },
    };
  }

  return null;
}

function buildTimelineEntry(input: {
  planet: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  periodLabel: "Mahadasha" | "Antardasha" | "Pratyantardasha";
}): DashaFoundationTimelineEntry {
  return {
    planet: formatPlanet(input.planet),
    startDate: input.startDate,
    endDate: input.endDate,
    isCurrent: input.isCurrent,
    summary: `${formatPlanet(input.planet)} ${input.periodLabel} ${input.isCurrent ? "is current" : "is upcoming"} (${formatDateRange(input.startDate, input.endDate)})`,
  };
}

function buildInterpretationEntry(input: {
  planet: string;
  periodLabel: "Mahadasha" | "Antardasha" | "Pratyantardasha";
  summary: string;
  lifeAreaFocus: string[];
}): DashaInterpretationFocusEntry {
  return {
    planet: formatPlanet(input.planet),
    periodLabel: input.periodLabel,
    meaningPlaceholder: "Interpretive context only. Not a deterministic prediction.",
    lifeAreaFocus: input.lifeAreaFocus,
    summary: input.summary,
  };
}

export function buildVimshottariDashaFoundation(input: {
  chart: DashaInputChart | null | undefined;
  asOfDateUtc?: Date | string;
  periodCount?: number;
}): VimshottariDashaFoundationSnapshot {
  const context = toVimshottariContext(input.chart);

  if (!context) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "INVALID_CHART_CONTEXT",
        message:
          "Dasha foundation requires a chart with birth UTC and Moon nakshatra context.",
      },
    });
  }

  const result = buildVimshottariMahadashaForChartContext({
    chart: context,
    asOfDateUtc: input.asOfDateUtc,
    periodCount: input.periodCount,
  });

  const asOfDateUtc = normalizeAsOfDateUtc(input.asOfDateUtc);

  if (!result.success) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: result.error.code,
        message: result.error.message,
        details: result.details,
      },
    });
  }

  const mahadashaTimeline = result.data.mahadashaPeriods.map((period) =>
    buildTimelineEntry({
      planet: period.planet,
      startDate: period.startAtUtc,
      endDate: period.endAtUtc,
      isCurrent: period.isActive,
      periodLabel: "Mahadasha",
    })
  );
  const currentMahadashaPeriod = result.data.activeMahadasha;
  const currentAntardashaPeriod = result.data.activeAntardasha;
  const currentPratyantardashaPeriod = result.data.activePratyantar;
  const antardashaTimeline = currentMahadashaPeriod
    ? currentMahadashaPeriod.antardashas.map((period) =>
        buildTimelineEntry({
          planet: period.planet,
          startDate: period.startAtUtc,
          endDate: period.endAtUtc,
          isCurrent: period.isActive,
          periodLabel: "Antardasha",
        })
      )
    : [];
  const pratyantardashaTimeline = currentAntardashaPeriod
    ? currentAntardashaPeriod.pratyantars.map((period) =>
        buildTimelineEntry({
          planet: period.planet,
          startDate: period.startAtUtc,
          endDate: period.endAtUtc,
          isCurrent: period.isActive,
          periodLabel: "Pratyantardasha",
        })
      )
    : [];
  const interpretation = currentMahadashaPeriod
    ? {
        mahadasha: buildInterpretationEntry({
          planet: currentMahadashaPeriod.planet,
          periodLabel: "Mahadasha",
          summary: `${formatPlanet(currentMahadashaPeriod.planet)} Mahadasha describes the broader timing backdrop.`,
          lifeAreaFocus: ["life direction", "long-term themes", "overall timing"],
        }),
        antardasha: currentAntardashaPeriod
          ? buildInterpretationEntry({
              planet: currentAntardashaPeriod.planet,
              periodLabel: "Antardasha",
              summary: `${formatPlanet(currentAntardashaPeriod.planet)} Antardasha refines the current Mahadasha emphasis.`,
              lifeAreaFocus: ["near-term emphasis", "daily priorities", "supporting context"],
            })
          : null,
        pratyantardasha: currentPratyantardashaPeriod
          ? buildInterpretationEntry({
              planet: currentPratyantardashaPeriod.planet,
              periodLabel: "Pratyantardasha",
              summary: `${formatPlanet(currentPratyantardashaPeriod.planet)} Pratyantardasha is a short sub-cycle for timing awareness.`,
              lifeAreaFocus: ["short-term timing", "practical sequencing", "fine-grained context"],
            })
          : null,
        notes: [
          "Timing context is interpretive and should not be treated as a guaranteed outcome.",
          "Missing inputs return a safe unavailable state rather than fabricated Dasha data.",
        ],
      }
    : {
        mahadasha: null,
        antardasha: null,
        pratyantardasha: null,
        notes: [
          "Vimshottari interpretation is unavailable until a verified Moon nakshatra context is present.",
        ],
      };

  return createAstrologyInfrastructureSnapshot({
    status: "ready",
    data: {
      dashaType: "VIMSHOTTARI",
      currentMahadasha: currentMahadashaPeriod
        ? buildTimelineEntry({
            planet: currentMahadashaPeriod.planet,
            startDate: currentMahadashaPeriod.startAtUtc,
            endDate: currentMahadashaPeriod.endAtUtc,
            isCurrent: true,
            periodLabel: "Mahadasha",
          })
        : null,
      currentAntardasha: currentAntardashaPeriod
        ? buildTimelineEntry({
            planet: currentAntardashaPeriod.planet,
            startDate: currentAntardashaPeriod.startAtUtc,
            endDate: currentAntardashaPeriod.endAtUtc,
            isCurrent: true,
            periodLabel: "Antardasha",
          })
        : null,
      currentPratyantardasha: currentPratyantardashaPeriod
        ? buildTimelineEntry({
            planet: currentPratyantardashaPeriod.planet,
            startDate: currentPratyantardashaPeriod.startAtUtc,
            endDate: currentPratyantardashaPeriod.endAtUtc,
            isCurrent: true,
            periodLabel: "Pratyantardasha",
          })
        : null,
      timeline: mahadashaTimeline,
      mahadashaTimeline,
      antardashaTimeline,
      pratyantardashaTimeline,
      birthBalance: {
        planet: formatPlanet(result.data.birthBalance.mahadashaLord),
        elapsedYears: result.data.birthBalance.elapsedYears,
        remainingYears: result.data.birthBalance.remainingYears,
        remainingDays: result.data.birthBalance.remainingDays,
        periodStartAtUtc: result.data.birthBalance.periodStartAtUtc,
        periodEndAtUtc: result.data.birthBalance.periodEndAtUtc,
      },
      safeSummary: currentMahadashaPeriod
        ? `${formatPlanet(currentMahadashaPeriod.planet)} Mahadasha is active${currentAntardashaPeriod ? ` with ${formatPlanet(currentAntardashaPeriod.planet)} Antardasha` : ""}${currentPratyantardashaPeriod ? ` and ${formatPlanet(currentPratyantardashaPeriod.planet)} Pratyantardasha` : ""}.`
        : "Vimshottari dasha timing is available, but no current Mahadasha could be resolved.",
      missingReason: null,
      asOfDateUtc,
      interpretation,
    },
  });
}
