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
  NakshatraPlacement,
  NakshatraName,
  PlanetaryBody,
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
  planet: PlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
  antardashas: VimshottariAntardashaPeriod[];
};

export type VimshottariAntardashaPeriod = {
  planet: PlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
  pratyantars: VimshottariPratyantarPeriod[];
};

export type VimshottariPratyantarPeriod = {
  planet: PlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
};

export type VimshottariDayDashaPeriod = {
  planet: PlanetaryBody;
  startAtUtc: string;
  endAtUtc: string;
  durationYears: number;
  isActive: boolean;
};

export type VimshottariActiveAntardasha = VimshottariAntardashaPeriod & {
  mahadashaPlanet: PlanetaryBody;
};

export type VimshottariActivePratyantar = VimshottariPratyantarPeriod & {
  mahadashaPlanet: PlanetaryBody;
  antardashaPlanet: PlanetaryBody;
};

export type VimshottariActiveDayDasha = VimshottariDayDashaPeriod & {
  mahadashaPlanet: PlanetaryBody;
  antardashaPlanet: PlanetaryBody;
  pratyantarPlanet: PlanetaryBody;
};

export type VimshottariCurrentDayDashaContext = {
  sourcePratyantar: {
    mahadashaPlanet: PlanetaryBody;
    antardashaPlanet: PlanetaryBody;
    pratyantarPlanet: PlanetaryBody;
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
    ruler: PlanetaryBody;
    degreesIntoNakshatra: number;
    fractionTraversed: number;
  };
  nakshatraLord: PlanetaryBody;
  birthBalance: {
    mahadashaLord: PlanetaryBody;
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
  planet: PlanetaryBody;
  startAt: Date;
  endAt: Date;
  durationYears: number;
  fullStartAt: Date;
  fullEndAt: Date;
  fullDurationYears: number;
};

type ActivePratyantarWithinMahadasha = VimshottariPratyantarPeriod & {
  antardashaPlanet: PlanetaryBody;
};

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MILLISECONDS_PER_DAY);
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getNextLord(currentLord: PlanetaryBody) {
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
    ruler: entry.ruler,
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

function getDashaOrderFromLord(lord: PlanetaryBody) {
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

function buildAntardashasForMahadasha(input: {
  mahadashaLord: PlanetaryBody;
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
  const antardashaOrder = getDashaOrderFromLord(input.mahadashaLord);
  const antardashas: VimshottariAntardashaPeriod[] = [];
  let activeAntardasha: VimshottariAntardashaPeriod | null = null;
  let activePratyantar: ActivePratyantarWithinMahadasha | null = null;
  let cursor = input.mahadashaFullStartAt;

  for (let index = 0; index < antardashaOrder.length; index += 1) {
    const antardashaLord = antardashaOrder[index] ?? "KETU";
    const antardashaDurationYears =
      (input.mahadashaFullDurationYears * dashaYearsByLord[antardashaLord]) /
      120;
    const antardashaEndAt =
      index === antardashaOrder.length - 1
        ? input.mahadashaFullEndAt
        : addDays(cursor, antardashaDurationYears * daysPerDashaYear);
    const visibleStartAt = maxDate(cursor, input.mahadashaVisibleStartAt);
    const visibleEndAt = minDate(antardashaEndAt, input.mahadashaVisibleEndAt);

    if (visibleStartAt.getTime() < visibleEndAt.getTime()) {
      const pratyantarResult = buildPratyantarsForAntardasha({
        antardashaLord,
        antardashaVisibleStartAt: visibleStartAt,
        antardashaVisibleEndAt: visibleEndAt,
        antardashaFullStartAt: cursor,
        antardashaFullEndAt: antardashaEndAt,
        antardashaFullDurationYears: antardashaDurationYears,
        asOfDateUtc: input.asOfDateUtc,
      });
      const isActive =
        input.asOfDateUtc.getTime() >= visibleStartAt.getTime() &&
        input.asOfDateUtc.getTime() < visibleEndAt.getTime();
      const entry: VimshottariAntardashaPeriod = {
        planet: antardashaLord,
        startAtUtc: visibleStartAt.toISOString(),
        endAtUtc: visibleEndAt.toISOString(),
        durationYears: roundTo(toYearsFromDates(visibleStartAt, visibleEndAt), 6),
        isActive,
        pratyantars: pratyantarResult.pratyantars,
      };

      if (isActive && !activeAntardasha) {
        activeAntardasha = entry;
      }

      if (pratyantarResult.activePratyantar && !activePratyantar) {
        activePratyantar = {
          ...pratyantarResult.activePratyantar,
          antardashaPlanet: antardashaLord,
        };
      }

      antardashas.push(entry);
    }

    cursor = antardashaEndAt;
  }

  return {
    antardashas,
    activeAntardasha,
    activePratyantar,
  };
}

function buildPratyantarsForAntardasha(input: {
  antardashaLord: PlanetaryBody;
  antardashaVisibleStartAt: Date;
  antardashaVisibleEndAt: Date;
  antardashaFullStartAt: Date;
  antardashaFullEndAt: Date;
  antardashaFullDurationYears: number;
  asOfDateUtc: Date;
}): {
  pratyantars: VimshottariPratyantarPeriod[];
  activePratyantar: VimshottariPratyantarPeriod | null;
} {
  const pratyantarOrder = getDashaOrderFromLord(input.antardashaLord);
  const pratyantars: VimshottariPratyantarPeriod[] = [];
  let activePratyantar: VimshottariPratyantarPeriod | null = null;
  let cursor = input.antardashaFullStartAt;

  for (let index = 0; index < pratyantarOrder.length; index += 1) {
    const pratyantarLord = pratyantarOrder[index] ?? "KETU";
    const pratyantarDurationYears =
      (input.antardashaFullDurationYears * dashaYearsByLord[pratyantarLord]) /
      120;
    const pratyantarEndAt =
      index === pratyantarOrder.length - 1
        ? input.antardashaFullEndAt
        : addDays(cursor, pratyantarDurationYears * daysPerDashaYear);
    const visibleStartAt = maxDate(cursor, input.antardashaVisibleStartAt);
    const visibleEndAt = minDate(pratyantarEndAt, input.antardashaVisibleEndAt);

    if (visibleStartAt.getTime() < visibleEndAt.getTime()) {
      const isActive =
        input.asOfDateUtc.getTime() >= visibleStartAt.getTime() &&
        input.asOfDateUtc.getTime() < visibleEndAt.getTime();
      const entry: VimshottariPratyantarPeriod = {
        planet: pratyantarLord,
        startAtUtc: visibleStartAt.toISOString(),
        endAtUtc: visibleEndAt.toISOString(),
        durationYears: roundTo(toYearsFromDates(visibleStartAt, visibleEndAt), 6),
        isActive,
      };

      if (isActive && !activePratyantar) {
        activePratyantar = entry;
      }

      pratyantars.push(entry);
    }

    cursor = pratyantarEndAt;
  }

  return {
    pratyantars,
    activePratyantar,
  };
}

function buildDayDashasForPratyantar(input: {
  pratyantarLord: PlanetaryBody;
  pratyantarStartAt: Date;
  pratyantarEndAt: Date;
  asOfDateUtc: Date;
}) {
  const dayDashaOrder = getDashaOrderFromLord(input.pratyantarLord);
  const dayDashaPeriods: VimshottariDayDashaPeriod[] = [];
  let activeDayDasha: VimshottariDayDashaPeriod | null = null;
  let cursor = input.pratyantarStartAt;
  const fullDurationYears = toYearsFromDates(
    input.pratyantarStartAt,
    input.pratyantarEndAt
  );

  for (let index = 0; index < dayDashaOrder.length; index += 1) {
    const dayDashaLord = dayDashaOrder[index] ?? "KETU";
    const dayDashaDurationYears =
      (fullDurationYears * dashaYearsByLord[dayDashaLord]) / 120;
    const dayDashaEndAt =
      index === dayDashaOrder.length - 1
        ? input.pratyantarEndAt
        : addDays(cursor, dayDashaDurationYears * daysPerDashaYear);

    if (cursor.getTime() < dayDashaEndAt.getTime()) {
      const isActive =
        input.asOfDateUtc.getTime() >= cursor.getTime() &&
        input.asOfDateUtc.getTime() < dayDashaEndAt.getTime();
      const entry: VimshottariDayDashaPeriod = {
        planet: dayDashaLord,
        startAtUtc: cursor.toISOString(),
        endAtUtc: dayDashaEndAt.toISOString(),
        durationYears: roundTo(toYearsFromDates(cursor, dayDashaEndAt), 6),
        isActive,
      };

      if (isActive && !activeDayDasha) {
        activeDayDasha = entry;
      }

      dayDashaPeriods.push(entry);
    }

    cursor = dayDashaEndAt;
  }

  return {
    dayDashaPeriods,
    activeDayDasha,
  };
}

function buildDayDashaWindow(
  periods: VimshottariDayDashaPeriod[],
  aroundPlanet: PlanetaryBody | null
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
