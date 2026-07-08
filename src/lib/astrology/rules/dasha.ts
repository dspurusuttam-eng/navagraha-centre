import {
  dashaSequence,
  dashaYearsByLord,
  nakshatraCatalog,
  daysPerDashaYear,
  padaSpanDegrees,
  nakshatraSpanDegrees,
} from "@/lib/astrology/constants";
import type {
  DashaPeriod,
  ClassicalPlanetaryBody,
  NakshatraPlacement,
  NakshatraName,
} from "@/modules/astrology/types";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_TIMELINE_PERIOD_COUNT = 9;
const MAX_TIMELINE_PERIOD_COUNT = 108;

export type VimshottariMahadashaIssueCode =
  | "INVALID_MOON_LONGITUDE"
  | "INVALID_BIRTH_DATE_UTC"
  | "INVALID_AS_OF_DATE_UTC"
  | "INVALID_PERIOD_COUNT";

export type VimshottariMahadashaFailure = {
  success: false;
  issue: {
    code: VimshottariMahadashaIssueCode;
    message: string;
  };
};

export type VimshottariMahadashaPeriod = {
  planet: ClassicalPlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
  antardashas: VimshottariAntardashaPeriod[];
};

export type VimshottariAntardashaPeriod = {
  planet: ClassicalPlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
  pratyantars: VimshottariPratyantarPeriod[];
};

export type VimshottariPratyantarPeriod = {
  planet: ClassicalPlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
};

export type VimshottariDayDashaPeriod = {
  planet: ClassicalPlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
};

export type VimshottariActiveAntardasha = VimshottariAntardashaPeriod & {
  mahadashaPlanet: ClassicalPlanetaryBody;
};

export type VimshottariActivePratyantar = VimshottariPratyantarPeriod & {
  mahadashaPlanet: ClassicalPlanetaryBody;
  antardashaPlanet: ClassicalPlanetaryBody;
};

export type VimshottariActiveDayDasha = VimshottariDayDashaPeriod & {
  mahadashaPlanet: ClassicalPlanetaryBody;
  antardashaPlanet: ClassicalPlanetaryBody;
  pratyantarPlanet: ClassicalPlanetaryBody;
};

export type VimshottariCurrentDayDashaContext = {
  sourcePratyantar: {
    mahadashaPlanet: ClassicalPlanetaryBody;
    antardashaPlanet: ClassicalPlanetaryBody;
    pratyantarPlanet: ClassicalPlanetaryBody;
    startAtUtc: string;
    endAtUtc: string;
  };
  dayDashaPeriods: VimshottariDayDashaPeriod[];
  dayDashaWindow: VimshottariDayDashaPeriod[];
};

export type VimshottariMahadashaTimeline = {
  system: "VIMSHOTTARI";
  moonNakshatra: {
    name: NakshatraName;
    ruler: ClassicalPlanetaryBody;
    degreesIntoNakshatra: number;
    fractionTraversed: number;
  };
  nakshatraLord: ClassicalPlanetaryBody;
  birthBalance: {
    mahadashaLord: ClassicalPlanetaryBody;
    elapsedYears: number;
    remainingYears: number;
    remainingDays: number;
    periodStartAtUtc: string;
    periodEndAtUtc: string;
  };
  mahadashaPeriods: VimshottariMahadashaPeriod[];
  activeMahadasha: VimshottariMahadashaPeriod | null;
  activeAntardasha: VimshottariActiveAntardasha | null;
  activePratyantar: VimshottariActivePratyantar | null;
  activeDayDasha: VimshottariActiveDayDasha | null;
  currentDayDashaContext: VimshottariCurrentDayDashaContext | null;
};

export type VimshottariMahadashaSuccess = {
  success: true;
  data: VimshottariMahadashaTimeline;
};

export type VimshottariMahadashaResult =
  | VimshottariMahadashaFailure
  | VimshottariMahadashaSuccess;

type TimelinePeriodBounds = {
  planet: ClassicalPlanetaryBody;
  startAt: Date;
  endAt: Date;
  durationYears: number;
  fullStartAt: Date;
  fullEndAt: Date;
  fullDurationYears: number;
};

type ActivePratyantarWithinMahadasha = VimshottariPratyantarPeriod & {
  antardashaPlanet: ClassicalPlanetaryBody;
};

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MILLISECONDS_PER_DAY);
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getNextLord(currentLord: ClassicalPlanetaryBody) {
  const currentIndex = dashaSequence.indexOf(currentLord);

  return dashaSequence[(currentIndex + 1) % dashaSequence.length] ?? "KETU";
}

function normalizeLongitude(value: number) {
  return ((value % 360) + 360) % 360;
}

function roundTo(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

function fail(
  code: VimshottariMahadashaIssueCode,
  message: string
): VimshottariMahadashaFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
  };
}

function parseDateInput(value: Date | string): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolvePeriodCount(periodCount?: number) {
  if (typeof periodCount === "undefined") {
    return {
      success: true as const,
      value: DEFAULT_TIMELINE_PERIOD_COUNT,
    };
  }

  if (
    !Number.isInteger(periodCount) ||
    periodCount < 1 ||
    periodCount > MAX_TIMELINE_PERIOD_COUNT
  ) {
    return {
      success: false as const,
      message: `periodCount must be an integer between 1 and ${MAX_TIMELINE_PERIOD_COUNT}. Received ${periodCount}.`,
    };
  }

  return {
    success: true as const,
    value: periodCount,
  };
}

function getNakshatraPlacement(longitude: number): NakshatraPlacement {
  const normalized = normalizeLongitude(longitude);
  const nakshatraIndex =
    Math.floor(normalized / nakshatraSpanDegrees) % nakshatraCatalog.length;
  const offsetWithinNakshatra =
    normalized - nakshatraIndex * nakshatraSpanDegrees;
  const pada = Math.min(
    4,
    Math.floor(offsetWithinNakshatra / padaSpanDegrees) + 1
  ) as 1 | 2 | 3 | 4;
  const entry = nakshatraCatalog[nakshatraIndex];

  return {
    name: entry.name,
    pada,
    ruler: entry.ruler as NakshatraPlacement["ruler"],
    degreesIntoNakshatra: Number(offsetWithinNakshatra.toFixed(4)),
  };
}

function mapPeriodsWithActiveFlag(
  periods: TimelinePeriodBounds[],
  asOfDateUtc: Date
): {
  periods: VimshottariMahadashaPeriod[];
  activeMahadasha: VimshottariMahadashaPeriod | null;
  activeAntardasha: VimshottariActiveAntardasha | null;
  activePratyantar: VimshottariActivePratyantar | null;
} {
  let activeMahadasha: VimshottariMahadashaPeriod | null = null;
  let activeAntardasha: VimshottariActiveAntardasha | null = null;
  let activePratyantar: VimshottariActivePratyantar | null = null;

  const mapped = periods.map((period) => {
    const isActive =
      asOfDateUtc.getTime() >= period.startAt.getTime() &&
      asOfDateUtc.getTime() < period.endAt.getTime();
    const antardashaResult = buildAntardashasForMahadasha({
      mahadashaLord: period.planet,
      mahadashaVisibleStartAt: period.startAt,
      mahadashaVisibleEndAt: period.endAt,
      mahadashaFullStartAt: period.fullStartAt,
      mahadashaFullEndAt: period.fullEndAt,
      mahadashaFullDurationYears: period.fullDurationYears,
      asOfDateUtc,
    });
    const entry: VimshottariMahadashaPeriod = {
      planet: period.planet,
      startAtUtc: period.startAt.toISOString(),
      endAtUtc: period.endAt.toISOString(),
      durationYears: roundTo(period.durationYears, 6),
      isActive,
      antardashas: antardashaResult.antardashas,
    };

    if (isActive) {
      activeMahadasha = entry;
    }

    if (antardashaResult.activeAntardasha && !activeAntardasha) {
      activeAntardasha = {
        ...antardashaResult.activeAntardasha,
        mahadashaPlanet: period.planet,
      };
    }

    if (antardashaResult.activePratyantar && !activePratyantar) {
      activePratyantar = {
        ...antardashaResult.activePratyantar,
        mahadashaPlanet: period.planet,
      };
    }

    return entry;
  });

  return {
    periods: mapped,
    activeMahadasha,
    activeAntardasha,
    activePratyantar,
  };
}

function getDashaOrderFromLord(lord: ClassicalPlanetaryBody) {
  const startIndex = dashaSequence.indexOf(lord);

  return dashaSequence.map((_, index) => {
    const wrappedIndex = (startIndex + index) % dashaSequence.length;

    return dashaSequence[wrappedIndex] ?? "KETU";
  });
}

function maxDate(left: Date, right: Date) {
  return left.getTime() >= right.getTime() ? left : right;
}

function minDate(left: Date, right: Date) {
  return left.getTime() <= right.getTime() ? left : right;
}

function toYearsFromDates(startAt: Date, endAt: Date) {
  const dayDelta = (endAt.getTime() - startAt.getTime()) / MILLISECONDS_PER_DAY;

  return dayDelta / daysPerDashaYear;
}

// --- Generic recursive sub-period splitter (Card 5B) -------------------------
// One reusable expansion for every nested Vimshottari level (L2 Antardasha,
// L3 Pratyantardasha, L4 Sookshma, L5 Prana). Children split the parent's FULL
// period via `parentFullYears * childLordYears / 120`, the last child absorbs
// float remainder by ending exactly at the parent's full end, and each child is
// clipped to the parent's VISIBLE window. Start inclusive / end exclusive.

export type VimshottariSubPeriodNode = {
  planet: ClassicalPlanetaryBody;
  visibleStartAt: Date;
  visibleEndAt: Date;
  fullStartAt: Date;
  fullEndAt: Date;
  fullDurationYears: number;
  isActive: boolean;
  children: VimshottariSubPeriodNode[] | null;
};

export type VimshottariSubPeriodExpansion = {
  periods: VimshottariSubPeriodNode[];
  activeChild: VimshottariSubPeriodNode | null;
};

export function buildVimshottariSubPeriods(input: {
  parentLord: ClassicalPlanetaryBody;
  parentVisibleStartAt: Date;
  parentVisibleEndAt: Date;
  parentFullStartAt: Date;
  parentFullEndAt: Date;
  parentFullDurationYears: number;
  asOfDateUtc: Date;
  depth: number;
}): VimshottariSubPeriodExpansion {
  const order = getDashaOrderFromLord(input.parentLord);
  const periods: VimshottariSubPeriodNode[] = [];
  let activeChild: VimshottariSubPeriodNode | null = null;
  let cursor = input.parentFullStartAt;

  for (let index = 0; index < order.length; index += 1) {
    const lord = order[index] ?? "KETU";
    const fullDurationYears =
      (input.parentFullDurationYears * dashaYearsByLord[lord]) / 120;
    const fullEndAt =
      index === order.length - 1
        ? input.parentFullEndAt
        : addDays(cursor, fullDurationYears * daysPerDashaYear);
    const visibleStartAt = maxDate(cursor, input.parentVisibleStartAt);
    const visibleEndAt = minDate(fullEndAt, input.parentVisibleEndAt);

    if (visibleStartAt.getTime() < visibleEndAt.getTime()) {
      const isActive =
        input.asOfDateUtc.getTime() >= visibleStartAt.getTime() &&
        input.asOfDateUtc.getTime() < visibleEndAt.getTime();
      const childExpansion =
        input.depth > 1
          ? buildVimshottariSubPeriods({
              parentLord: lord,
              parentVisibleStartAt: visibleStartAt,
              parentVisibleEndAt: visibleEndAt,
              parentFullStartAt: cursor,
              parentFullEndAt: fullEndAt,
              parentFullDurationYears: fullDurationYears,
              asOfDateUtc: input.asOfDateUtc,
              depth: input.depth - 1,
            })
          : null;
      const entry: VimshottariSubPeriodNode = {
        planet: lord,
        visibleStartAt,
        visibleEndAt,
        fullStartAt: cursor,
        fullEndAt,
        fullDurationYears,
        isActive,
        children: childExpansion?.periods ?? null,
      };

      if (isActive && !activeChild) {
        activeChild = entry;
      }

      periods.push(entry);
    }

    cursor = fullEndAt;
  }

  return {
    periods,
    activeChild,
  };
}

function toPratyantarPeriod(
  node: VimshottariSubPeriodNode
): VimshottariPratyantarPeriod {
  return {
    planet: node.planet,
    startAtUtc: node.visibleStartAt.toISOString(),
    endAtUtc: node.visibleEndAt.toISOString(),
    durationYears: roundTo(
      toYearsFromDates(node.visibleStartAt, node.visibleEndAt),
      6
    ),
    isActive: node.isActive,
  };
}

function buildAntardashasForMahadasha(input: {
  mahadashaLord: ClassicalPlanetaryBody;
  mahadashaVisibleStartAt: Date;
  mahadashaVisibleEndAt: Date;
  mahadashaFullStartAt: Date;
  mahadashaFullEndAt: Date;
  mahadashaFullDurationYears: number;
  asOfDateUtc: Date;
}): {
  antardashas: VimshottariAntardashaPeriod[];
  activeAntardasha: VimshottariAntardashaPeriod | null;
  activePratyantar: ActivePratyantarWithinMahadasha | null;
} {
  const expansion = buildVimshottariSubPeriods({
    parentLord: input.mahadashaLord,
    parentVisibleStartAt: input.mahadashaVisibleStartAt,
    parentVisibleEndAt: input.mahadashaVisibleEndAt,
    parentFullStartAt: input.mahadashaFullStartAt,
    parentFullEndAt: input.mahadashaFullEndAt,
    parentFullDurationYears: input.mahadashaFullDurationYears,
    asOfDateUtc: input.asOfDateUtc,
    depth: 2,
  });
  let activeAntardasha: VimshottariAntardashaPeriod | null = null;
  let activePratyantar: ActivePratyantarWithinMahadasha | null = null;

  const antardashas = expansion.periods.map((node) => {
    const pratyantars = (node.children ?? []).map(toPratyantarPeriod);
    const entry: VimshottariAntardashaPeriod = {
      planet: node.planet,
      startAtUtc: node.visibleStartAt.toISOString(),
      endAtUtc: node.visibleEndAt.toISOString(),
      durationYears: roundTo(
        toYearsFromDates(node.visibleStartAt, node.visibleEndAt),
        6
      ),
      isActive: node.isActive,
      pratyantars,
    };

    if (node.isActive && !activeAntardasha) {
      activeAntardasha = entry;
    }

    if (!activePratyantar) {
      const activeChildIndex = (node.children ?? []).findIndex(
        (child) => child.isActive
      );

      if (activeChildIndex >= 0) {
        activePratyantar = {
          ...pratyantars[activeChildIndex]!,
          antardashaPlanet: node.planet,
        };
      }
    }

    return entry;
  });

  return {
    antardashas,
    activeAntardasha,
    activePratyantar,
  };
}

function buildDayDashasForPratyantar(input: {
  pratyantarLord: ClassicalPlanetaryBody;
  pratyantarStartAt: Date;
  pratyantarEndAt: Date;
  asOfDateUtc: Date;
}): {
  dayDashaPeriods: VimshottariDayDashaPeriod[];
  activeDayDasha: VimshottariDayDashaPeriod | null;
} {
  // Legacy L4 window behavior (preserved): the visible pratyantar span is
  // treated as the full period for the day-dasha split.
  const expansion = buildVimshottariSubPeriods({
    parentLord: input.pratyantarLord,
    parentVisibleStartAt: input.pratyantarStartAt,
    parentVisibleEndAt: input.pratyantarEndAt,
    parentFullStartAt: input.pratyantarStartAt,
    parentFullEndAt: input.pratyantarEndAt,
    parentFullDurationYears: toYearsFromDates(
      input.pratyantarStartAt,
      input.pratyantarEndAt
    ),
    asOfDateUtc: input.asOfDateUtc,
    depth: 1,
  });
  let activeDayDasha: VimshottariDayDashaPeriod | null = null;

  const dayDashaPeriods = expansion.periods.map((node) => {
    const entry: VimshottariDayDashaPeriod = {
      planet: node.planet,
      startAtUtc: node.visibleStartAt.toISOString(),
      endAtUtc: node.visibleEndAt.toISOString(),
      durationYears: roundTo(
        toYearsFromDates(node.visibleStartAt, node.visibleEndAt),
        6
      ),
      isActive: node.isActive,
    };

    if (node.isActive && !activeDayDasha) {
      activeDayDasha = entry;
    }

    return entry;
  });

  return {
    dayDashaPeriods,
    activeDayDasha,
  };
}

function buildDayDashaWindow(
  periods: VimshottariDayDashaPeriod[],
  aroundPlanet: ClassicalPlanetaryBody | null
) {
  if (!periods.length) {
    return [];
  }

  const activeIndex =
    aroundPlanet === null
      ? periods.findIndex((period) => period.isActive)
      : periods.findIndex((period) => period.planet === aroundPlanet);
  const centerIndex = activeIndex >= 0 ? activeIndex : 0;
  const start = Math.max(0, centerIndex - 2);
  const end = Math.min(periods.length, start + 5);

  return periods.slice(start, end);
}

export function calculateVimshottariMahadashaTimeline(input: {
  moonLongitude: number;
  birthDateUtc: Date | string;
  asOfDateUtc?: Date | string;
  periodCount?: number;
}): VimshottariMahadashaResult {
  if (!Number.isFinite(input.moonLongitude)) {
    return fail(
      "INVALID_MOON_LONGITUDE",
      `Moon longitude must be a finite number. Received ${input.moonLongitude}.`
    );
  }

  const birthDateUtc = parseDateInput(input.birthDateUtc);

  if (!birthDateUtc) {
    return fail(
      "INVALID_BIRTH_DATE_UTC",
      "Birth date UTC is invalid. Provide a valid Date or UTC ISO string."
    );
  }

  const asOfDateUtc = input.asOfDateUtc
    ? parseDateInput(input.asOfDateUtc)
    : new Date();

  if (!asOfDateUtc) {
    return fail(
      "INVALID_AS_OF_DATE_UTC",
      "asOfDateUtc is invalid. Provide a valid Date or UTC ISO string."
    );
  }

  const periodCountResult = resolvePeriodCount(input.periodCount);

  if (!periodCountResult.success) {
    return fail("INVALID_PERIOD_COUNT", periodCountResult.message);
  }

  const sourceNakshatra = getNakshatraPlacement(input.moonLongitude);
  const birthLord = sourceNakshatra.ruler;
  const birthLordYears = dashaYearsByLord[birthLord];
  const consumedFraction =
    sourceNakshatra.degreesIntoNakshatra / nakshatraSpanDegrees;
  const consumedYears = birthLordYears * consumedFraction;
  const remainingYears = birthLordYears - consumedYears;
  const birthLordPeriodStartAt = addDays(
    birthDateUtc,
    -consumedYears * daysPerDashaYear
  );
  const birthLordPeriodEndAt = addDays(
    birthDateUtc,
    remainingYears * daysPerDashaYear
  );
  const periods: TimelinePeriodBounds[] = [
    {
      planet: birthLord,
      startAt: birthDateUtc,
      endAt: birthLordPeriodEndAt,
      durationYears: remainingYears,
      fullStartAt: birthLordPeriodStartAt,
      fullEndAt: birthLordPeriodEndAt,
      fullDurationYears: birthLordYears,
    },
  ];
  const maxPeriodCount = Math.max(
    periodCountResult.value,
    MAX_TIMELINE_PERIOD_COUNT
  );

  while (
    periods.length < periodCountResult.value ||
    (asOfDateUtc.getTime() >= periods[periods.length - 1]!.endAt.getTime() &&
      periods.length < maxPeriodCount)
  ) {
    const previous = periods[periods.length - 1]!;
    const nextPlanet = getNextLord(previous.planet);
    const nextDurationYears = dashaYearsByLord[nextPlanet];

    periods.push({
      planet: nextPlanet,
      startAt: previous.endAt,
      endAt: addDays(previous.endAt, nextDurationYears * daysPerDashaYear),
      durationYears: nextDurationYears,
      fullStartAt: previous.endAt,
      fullEndAt: addDays(previous.endAt, nextDurationYears * daysPerDashaYear),
      fullDurationYears: nextDurationYears,
    });
  }

  const withActive = mapPeriodsWithActiveFlag(periods, asOfDateUtc);
  let activeDayDasha: VimshottariActiveDayDasha | null = null;
  let currentDayDashaContext: VimshottariCurrentDayDashaContext | null = null;
  const activePratyantar = withActive.activePratyantar;

  if (activePratyantar) {
    const dayDashaResult = buildDayDashasForPratyantar({
      pratyantarLord: activePratyantar.planet,
      pratyantarStartAt: new Date(activePratyantar.startAtUtc),
      pratyantarEndAt: new Date(activePratyantar.endAtUtc),
      asOfDateUtc,
    });
    const window = buildDayDashaWindow(
      dayDashaResult.dayDashaPeriods,
      dayDashaResult.activeDayDasha?.planet ?? null
    );

    if (dayDashaResult.activeDayDasha) {
      activeDayDasha = {
        ...dayDashaResult.activeDayDasha,
        mahadashaPlanet: activePratyantar.mahadashaPlanet,
        antardashaPlanet: activePratyantar.antardashaPlanet,
        pratyantarPlanet: activePratyantar.planet,
      };
    }

    currentDayDashaContext = {
      sourcePratyantar: {
        mahadashaPlanet: activePratyantar.mahadashaPlanet,
        antardashaPlanet: activePratyantar.antardashaPlanet,
        pratyantarPlanet: activePratyantar.planet,
        startAtUtc: activePratyantar.startAtUtc,
        endAtUtc: activePratyantar.endAtUtc,
      },
      dayDashaPeriods: dayDashaResult.dayDashaPeriods,
      dayDashaWindow: window,
    };
  }

  return {
    success: true,
    data: {
      system: "VIMSHOTTARI",
      moonNakshatra: {
        name: sourceNakshatra.name,
        ruler: sourceNakshatra.ruler,
        degreesIntoNakshatra: roundTo(sourceNakshatra.degreesIntoNakshatra, 6),
        fractionTraversed: roundTo(consumedFraction, 6),
      },
      nakshatraLord: birthLord,
      birthBalance: {
        mahadashaLord: birthLord,
        elapsedYears: roundTo(consumedYears, 6),
        remainingYears: roundTo(remainingYears, 6),
        remainingDays: roundTo(remainingYears * daysPerDashaYear, 3),
        periodStartAtUtc: birthLordPeriodStartAt.toISOString(),
        periodEndAtUtc: birthLordPeriodEndAt.toISOString(),
      },
      mahadashaPeriods: withActive.periods,
      activeMahadasha: withActive.activeMahadasha,
      activeAntardasha: withActive.activeAntardasha,
      activePratyantar: withActive.activePratyantar,
      activeDayDasha,
      currentDayDashaContext,
    },
  };
}

export function calculateCurrentVimshottariDasha(input: {
  moonLongitude: number;
  birthDateUtc: Date;
  asOfDateUtc?: Date;
}): DashaPeriod {
  const asOfDateUtc = input.asOfDateUtc ?? new Date();
  const timelineResult = calculateVimshottariMahadashaTimeline({
    moonLongitude: input.moonLongitude,
    birthDateUtc: input.birthDateUtc,
    asOfDateUtc,
    periodCount: DEFAULT_TIMELINE_PERIOD_COUNT,
  });

  if (!timelineResult.success) {
    throw new Error(
      `Vimshottari dasha calculation failed: ${timelineResult.issue.code} (${timelineResult.issue.message})`
    );
  }

  const activeMahadasha = timelineResult.data.activeMahadasha;

  if (!activeMahadasha) {
    throw new Error(
      "No active Vimshottari Mahadasha period could be resolved for the provided as-of date."
    );
  }

  const activeStartAt = new Date(activeMahadasha.startAtUtc);
  const activeEndAt = new Date(activeMahadasha.endAtUtc);
  const totalPeriodMs = activeEndAt.getTime() - activeStartAt.getTime();
  const progress =
    totalPeriodMs <= 0
      ? 0
      : clampProgress(
          (asOfDateUtc.getTime() - activeStartAt.getTime()) / totalPeriodMs
        );

  return {
    system: "VIMSHOTTARI",
    lord: activeMahadasha.planet,
    nextLord: getNextLord(activeMahadasha.planet),
    startAtUtc: activeMahadasha.startAtUtc,
    endAtUtc: activeMahadasha.endAtUtc,
    balanceYears: Number(
      ((activeEndAt.getTime() - asOfDateUtc.getTime()) /
        (1000 * 60 * 60 * 24 * daysPerDashaYear)).toFixed(2)
    ),
    progress: Number(progress.toFixed(3)),
    sourceNakshatra: timelineResult.data.moonNakshatra.name,
  };
}

// --- Deep-level resolvers (Card 5B): L4 Sookshma + L5 Prana, on demand -------
// The full 5-level tree is never materialized (9^5 = 59,049 leaves). Deep
// levels are resolved only along the active instant or a requested path, so
// every response stays bounded (<= 9 children + <= 5 lineage nodes).

export type VimshottariDashaLevel = 1 | 2 | 3 | 4 | 5;

export const vimshottariDashaLevelNames = [
  "MAHADASHA",
  "ANTARDASHA",
  "PRATYANTARDASHA",
  "SOOKSHMA",
  "PRANA",
] as const;

export type VimshottariDashaLevelName =
  (typeof vimshottariDashaLevelNames)[number];

export type VimshottariDeepPeriod = {
  level: VimshottariDashaLevel;
  levelName: VimshottariDashaLevelName;
  planet: ClassicalPlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
  lineage: ClassicalPlanetaryBody[];
  lineagePath: string;
};

export type VimshottariDeepIssueCode =
  | VimshottariMahadashaIssueCode
  | "NO_ACTIVE_PERIOD"
  | "INVALID_LINEAGE"
  | "PATH_NOT_FOUND";

export type VimshottariDeepFailure = {
  success: false;
  issue: {
    code: VimshottariDeepIssueCode;
    message: string;
  };
};

export type VimshottariActiveLineage = {
  asOfDateUtc: string;
  levels: VimshottariDeepPeriod[];
  mahadasha: VimshottariDeepPeriod;
  antardasha: VimshottariDeepPeriod;
  pratyantardasha: VimshottariDeepPeriod;
  sookshma: VimshottariDeepPeriod;
  prana: VimshottariDeepPeriod;
};

export type VimshottariActiveLineageResult =
  | { success: true; data: VimshottariActiveLineage }
  | VimshottariDeepFailure;

export type VimshottariDashaPathData = {
  target: VimshottariDeepPeriod | null;
  children: VimshottariDeepPeriod[];
};

export type VimshottariDashaPathResult =
  | { success: true; data: VimshottariDashaPathData }
  | VimshottariDeepFailure;

function deepFail(
  code: VimshottariDeepIssueCode,
  message: string
): VimshottariDeepFailure {
  return {
    success: false,
    issue: {
      code,
      message,
    },
  };
}

function toTitleCaseLord(lord: ClassicalPlanetaryBody) {
  return lord.charAt(0) + lord.slice(1).toLowerCase();
}

export function formatDashaLineagePath(lords: readonly ClassicalPlanetaryBody[]) {
  return lords.map(toTitleCaseLord).join(" > ");
}

function toDeepPeriod(input: {
  level: VimshottariDashaLevel;
  planet: ClassicalPlanetaryBody;
  visibleStartAt: Date;
  visibleEndAt: Date;
  isActive: boolean;
  lineage: ClassicalPlanetaryBody[];
}): VimshottariDeepPeriod {
  return {
    level: input.level,
    levelName: vimshottariDashaLevelNames[input.level - 1],
    planet: input.planet,
    startAtUtc: input.visibleStartAt.toISOString(),
    endAtUtc: input.visibleEndAt.toISOString(),
    durationYears: roundTo(
      toYearsFromDates(input.visibleStartAt, input.visibleEndAt),
      6
    ),
    isActive: input.isActive,
    lineage: input.lineage,
    lineagePath: formatDashaLineagePath(input.lineage),
  };
}

type DeepParentBounds = {
  lord: ClassicalPlanetaryBody;
  visibleStartAt: Date;
  visibleEndAt: Date;
  fullStartAt: Date;
  fullEndAt: Date;
  fullDurationYears: number;
};

function resolveMahadashaParentBounds(
  timeline: VimshottariMahadashaTimeline,
  mahadasha: VimshottariMahadashaPeriod
): DeepParentBounds {
  const isBirthMahadasha =
    timeline.mahadashaPeriods.length > 0 &&
    timeline.mahadashaPeriods[0] === mahadasha;
  const fullStartAt = isBirthMahadasha
    ? new Date(timeline.birthBalance.periodStartAtUtc)
    : new Date(mahadasha.startAtUtc);

  return {
    lord: mahadasha.planet,
    visibleStartAt: new Date(mahadasha.startAtUtc),
    visibleEndAt: new Date(mahadasha.endAtUtc),
    fullStartAt,
    fullEndAt: new Date(mahadasha.endAtUtc),
    fullDurationYears: dashaYearsByLord[mahadasha.planet],
  };
}

export function getActiveDashaLineage(input: {
  moonLongitude: number;
  birthDateUtc: Date | string;
  asOfDateUtc?: Date | string;
}): VimshottariActiveLineageResult {
  const timelineResult = calculateVimshottariMahadashaTimeline({
    moonLongitude: input.moonLongitude,
    birthDateUtc: input.birthDateUtc,
    asOfDateUtc: input.asOfDateUtc,
  });

  if (!timelineResult.success) {
    return deepFail(timelineResult.issue.code, timelineResult.issue.message);
  }

  const timeline = timelineResult.data;
  const activeMahadasha = timeline.activeMahadasha;

  if (!activeMahadasha) {
    return deepFail(
      "NO_ACTIVE_PERIOD",
      "No active Vimshottari Mahadasha exists for the provided as-of instant (it may be before birth or beyond the generated timeline)."
    );
  }

  const asOfDateUtc = input.asOfDateUtc
    ? parseDateInput(input.asOfDateUtc)
    : new Date();

  if (!asOfDateUtc) {
    return deepFail(
      "INVALID_AS_OF_DATE_UTC",
      "asOfDateUtc is invalid. Provide a valid Date or UTC ISO string."
    );
  }

  const lineageLords: ClassicalPlanetaryBody[] = [activeMahadasha.planet];
  const levels: VimshottariDeepPeriod[] = [
    toDeepPeriod({
      level: 1,
      planet: activeMahadasha.planet,
      visibleStartAt: new Date(activeMahadasha.startAtUtc),
      visibleEndAt: new Date(activeMahadasha.endAtUtc),
      isActive: true,
      lineage: [...lineageLords],
    }),
  ];
  let parent = resolveMahadashaParentBounds(timeline, activeMahadasha);

  for (let level = 2 as VimshottariDashaLevel; level <= 5; level += 1) {
    const expansion = buildVimshottariSubPeriods({
      parentLord: parent.lord,
      parentVisibleStartAt: parent.visibleStartAt,
      parentVisibleEndAt: parent.visibleEndAt,
      parentFullStartAt: parent.fullStartAt,
      parentFullEndAt: parent.fullEndAt,
      parentFullDurationYears: parent.fullDurationYears,
      asOfDateUtc,
      depth: 1,
    });
    const activeNode = expansion.activeChild;

    if (!activeNode) {
      return deepFail(
        "NO_ACTIVE_PERIOD",
        `No active ${vimshottariDashaLevelNames[level - 1]} period could be resolved for the provided as-of instant.`
      );
    }

    lineageLords.push(activeNode.planet);
    levels.push(
      toDeepPeriod({
        level,
        planet: activeNode.planet,
        visibleStartAt: activeNode.visibleStartAt,
        visibleEndAt: activeNode.visibleEndAt,
        isActive: true,
        lineage: [...lineageLords],
      })
    );
    parent = {
      lord: activeNode.planet,
      visibleStartAt: activeNode.visibleStartAt,
      visibleEndAt: activeNode.visibleEndAt,
      fullStartAt: activeNode.fullStartAt,
      fullEndAt: activeNode.fullEndAt,
      fullDurationYears: activeNode.fullDurationYears,
    };
  }

  return {
    success: true,
    data: {
      asOfDateUtc: asOfDateUtc.toISOString(),
      levels,
      mahadasha: levels[0]!,
      antardasha: levels[1]!,
      pratyantardasha: levels[2]!,
      sookshma: levels[3]!,
      prana: levels[4]!,
    },
  };
}

export function resolveVimshottariDashaPath(input: {
  moonLongitude: number;
  birthDateUtc: Date | string;
  asOfDateUtc?: Date | string;
  lineage: readonly ClassicalPlanetaryBody[];
}): VimshottariDashaPathResult {
  if (!Array.isArray(input.lineage) || input.lineage.length > 4) {
    return deepFail(
      "INVALID_LINEAGE",
      "lineage must be an array of at most 4 dasha lords (Mahadasha first)."
    );
  }

  for (const lord of input.lineage) {
    if (!dashaSequence.includes(lord)) {
      return deepFail(
        "INVALID_LINEAGE",
        `lineage contains an unknown dasha lord: ${String(lord)}.`
      );
    }
  }

  const timelineResult = calculateVimshottariMahadashaTimeline({
    moonLongitude: input.moonLongitude,
    birthDateUtc: input.birthDateUtc,
    asOfDateUtc: input.asOfDateUtc,
  });

  if (!timelineResult.success) {
    return deepFail(timelineResult.issue.code, timelineResult.issue.message);
  }

  const timeline = timelineResult.data;
  const asOfDateUtc = input.asOfDateUtc
    ? parseDateInput(input.asOfDateUtc)
    : new Date();

  if (!asOfDateUtc) {
    return deepFail(
      "INVALID_AS_OF_DATE_UTC",
      "asOfDateUtc is invalid. Provide a valid Date or UTC ISO string."
    );
  }

  // Path resolution is scoped to the first full 120-year cycle from birth,
  // where each lord holds exactly one Mahadasha.
  const firstCycle = timeline.mahadashaPeriods.slice(0, dashaSequence.length);

  if (input.lineage.length === 0) {
    return {
      success: true,
      data: {
        target: null,
        children: firstCycle.map((period) =>
          toDeepPeriod({
            level: 1,
            planet: period.planet,
            visibleStartAt: new Date(period.startAtUtc),
            visibleEndAt: new Date(period.endAtUtc),
            isActive: period.isActive,
            lineage: [period.planet],
          })
        ),
      },
    };
  }

  const mahadasha = firstCycle.find(
    (period) => period.planet === input.lineage[0]
  );

  if (!mahadasha) {
    return deepFail(
      "PATH_NOT_FOUND",
      `No ${toTitleCaseLord(input.lineage[0]!)} Mahadasha exists in the first Vimshottari cycle of this chart.`
    );
  }

  const lineageLords: ClassicalPlanetaryBody[] = [mahadasha.planet];
  let parent = resolveMahadashaParentBounds(timeline, mahadasha);
  let target = toDeepPeriod({
    level: 1,
    planet: mahadasha.planet,
    visibleStartAt: new Date(mahadasha.startAtUtc),
    visibleEndAt: new Date(mahadasha.endAtUtc),
    isActive: mahadasha.isActive,
    lineage: [...lineageLords],
  });
  let expansion = buildVimshottariSubPeriods({
    parentLord: parent.lord,
    parentVisibleStartAt: parent.visibleStartAt,
    parentVisibleEndAt: parent.visibleEndAt,
    parentFullStartAt: parent.fullStartAt,
    parentFullEndAt: parent.fullEndAt,
    parentFullDurationYears: parent.fullDurationYears,
    asOfDateUtc,
    depth: 1,
  });

  for (let depthIndex = 1; depthIndex < input.lineage.length; depthIndex += 1) {
    const requestedLord = input.lineage[depthIndex]!;
    const matchedNode = expansion.periods.find(
      (node) => node.planet === requestedLord
    );

    if (!matchedNode) {
      return deepFail(
        "PATH_NOT_FOUND",
        `No visible ${toTitleCaseLord(requestedLord)} ${vimshottariDashaLevelNames[depthIndex]} period exists under ${formatDashaLineagePath(lineageLords)} (it may be fully consumed before birth).`
      );
    }

    lineageLords.push(matchedNode.planet);
    target = toDeepPeriod({
      level: (depthIndex + 1) as VimshottariDashaLevel,
      planet: matchedNode.planet,
      visibleStartAt: matchedNode.visibleStartAt,
      visibleEndAt: matchedNode.visibleEndAt,
      isActive: matchedNode.isActive,
      lineage: [...lineageLords],
    });
    parent = {
      lord: matchedNode.planet,
      visibleStartAt: matchedNode.visibleStartAt,
      visibleEndAt: matchedNode.visibleEndAt,
      fullStartAt: matchedNode.fullStartAt,
      fullEndAt: matchedNode.fullEndAt,
      fullDurationYears: matchedNode.fullDurationYears,
    };
    expansion = buildVimshottariSubPeriods({
      parentLord: parent.lord,
      parentVisibleStartAt: parent.visibleStartAt,
      parentVisibleEndAt: parent.visibleEndAt,
      parentFullStartAt: parent.fullStartAt,
      parentFullEndAt: parent.fullEndAt,
      parentFullDurationYears: parent.fullDurationYears,
      asOfDateUtc,
      depth: 1,
    });
  }

  const childLevel = (input.lineage.length + 1) as VimshottariDashaLevel;
  const children = expansion.periods.map((node) =>
    toDeepPeriod({
      level: childLevel,
      planet: node.planet,
      visibleStartAt: node.visibleStartAt,
      visibleEndAt: node.visibleEndAt,
      isActive: node.isActive,
      lineage: [...lineageLords, node.planet],
    })
  );

  return {
    success: true,
    data: {
      target,
      children,
    },
  };
}
