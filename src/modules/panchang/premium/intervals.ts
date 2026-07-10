// Card 9.2 — Shared interval helpers (pure arithmetic; no ephemeris).
//
// buildBoundaries guarantees, by construction: first boundary == span start,
// last boundary == span end, interior boundaries strictly increasing, and
// adjacent intervals sharing the exact same boundary millisecond (no gaps,
// no overlaps). Intervals are start-inclusive / end-exclusive.

import { formatLocalTime } from "@/modules/panchang/engine";

export function buildBoundaries(
  startMs: number,
  endMs: number,
  count: number
): number[] {
  const boundaries: number[] = [startMs];

  for (let index = 1; index < count; index += 1) {
    boundaries.push(startMs + Math.round((index * (endMs - startMs)) / count));
  }

  boundaries.push(endMs);

  return boundaries;
}

export function toLocalMinute(utcIso: string, timezoneIana: string): string {
  return formatLocalTime(utcIso, timezoneIana);
}

export function periodTimes(input: {
  startMs: number;
  endMs: number;
  timezoneIana: string;
}) {
  const startUtc = new Date(input.startMs).toISOString();
  const endUtc = new Date(input.endMs).toISOString();

  return {
    startUtc,
    endUtc,
    startLocal: toLocalMinute(startUtc, input.timezoneIana),
    endLocal: toLocalMinute(endUtc, input.timezoneIana),
    timezone: input.timezoneIana,
  };
}
