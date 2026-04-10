import "server-only";

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
  PlanetaryBody,
} from "@/modules/astrology/types";

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
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

export function calculateCurrentVimshottariDasha(input: {
  moonLongitude: number;
  birthDateUtc: Date;
  asOfDateUtc?: Date;
}): DashaPeriod {
  const asOfDateUtc = input.asOfDateUtc ?? new Date();
  const sourceNakshatra = getNakshatraPlacement(input.moonLongitude);
  const birthLord = sourceNakshatra.ruler;
  const birthLordYears = dashaYearsByLord[birthLord];
  const consumedFraction =
    sourceNakshatra.degreesIntoNakshatra / nakshatraSpanDegrees;
  const consumedYears = birthLordYears * consumedFraction;
  const remainingYears = birthLordYears - consumedYears;
  let currentLord = birthLord;
  let currentStartAt = addDays(
    input.birthDateUtc,
    -consumedYears * daysPerDashaYear
  );
  let currentEndAt = addDays(
    input.birthDateUtc,
    remainingYears * daysPerDashaYear
  );
  let sequenceIndex = dashaSequence.indexOf(birthLord);

  while (asOfDateUtc >= currentEndAt) {
    sequenceIndex = (sequenceIndex + 1) % dashaSequence.length;
    currentLord = dashaSequence[sequenceIndex] ?? "KETU";
    currentStartAt = currentEndAt;
    currentEndAt = addDays(
      currentStartAt,
      dashaYearsByLord[currentLord] * daysPerDashaYear
    );
  }

  const totalPeriodMs = currentEndAt.getTime() - currentStartAt.getTime();
  const progress =
    totalPeriodMs <= 0
      ? 0
      : clampProgress(
          (asOfDateUtc.getTime() - currentStartAt.getTime()) / totalPeriodMs
        );

  return {
    system: "VIMSHOTTARI",
    lord: currentLord,
    nextLord: getNextLord(currentLord),
    startAtUtc: currentStartAt.toISOString(),
    endAtUtc: currentEndAt.toISOString(),
    balanceYears: Number(
      ((currentEndAt.getTime() - asOfDateUtc.getTime()) /
        (1000 * 60 * 60 * 24 * daysPerDashaYear)).toFixed(2)
    ),
    progress: Number(progress.toFixed(3)),
    sourceNakshatra: sourceNakshatra.name,
  };
}
