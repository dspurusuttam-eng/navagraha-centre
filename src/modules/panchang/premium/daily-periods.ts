// Card 9.2 — Daily periods (pure arithmetic over rise/set instants).
//
// Rahu Kaal / Yamaganda / Gulika: 8 equal day segments, weekday segment tables
// imported from Card 2 (single source of truth). Abhijit: solar midday +/-
// daylength/30 (the 8th of 15 day-muhurtas); Wednesday exclusion is a factual
// convention flag only, never a mathematical removal. Brahma Muhurta: locked
// FIXED_48MIN_MUHURTA convention (sunrise-96min .. sunrise-48min).
// No night Rahu/Yamaganda/Gulika in V1.

import {
  GULIKA_KAAL_SEGMENTS_BY_WEEKDAY,
  RAHU_KAAL_SEGMENTS_BY_WEEKDAY,
  YAMAGANDA_SEGMENTS_BY_WEEKDAY,
  getPremiumRule,
} from "@/modules/panchang/premium/constants";
import { periodTimes } from "@/modules/panchang/premium/intervals";
import type { PremiumTimedPeriod } from "@/modules/panchang/premium/types";

function daySegmentPeriod(input: {
  type: string;
  ruleId: string;
  segmentIndex1To8: number;
  sunriseMs: number;
  sunsetMs: number;
  timezoneIana: string;
}): PremiumTimedPeriod {
  const rule = getPremiumRule(input.ruleId);
  // Match Card 2's exact segment arithmetic (buildDaySegmentTimingWindow) so
  // Rahu/Yamaganda/Gulika are byte-identical to the authoritative output: same
  // grouping, no rounding (new Date() truncation is the only quantization).
  const segmentDurationMs = (input.sunsetMs - input.sunriseMs) / 8;
  const startMs = input.sunriseMs + (input.segmentIndex1To8 - 1) * segmentDurationMs;
  const endMs = startMs + segmentDurationMs;

  return {
    type: input.type,
    ...periodTimes({
      startMs,
      endMs,
      timezoneIana: input.timezoneIana,
    }),
    status: "available",
    ruleId: rule.ruleId,
    calculationReference: "card9:day-segment-table",
  };
}

export function buildDailyPeriods(input: {
  weekdayIndex: number;
  sunriseMs: number;
  sunsetMs: number;
  timezoneIana: string;
}) {
  const weekday = input.weekdayIndex % 7;
  const rahuKaal = daySegmentPeriod({
    type: "RAHU_KAAL",
    ruleId: "RAHU_KAAL_DAY_SEGMENT",
    segmentIndex1To8: RAHU_KAAL_SEGMENTS_BY_WEEKDAY[weekday],
    sunriseMs: input.sunriseMs,
    sunsetMs: input.sunsetMs,
    timezoneIana: input.timezoneIana,
  });
  const yamaganda = daySegmentPeriod({
    type: "YAMAGANDA",
    ruleId: "YAMAGANDA_DAY_SEGMENT",
    segmentIndex1To8: YAMAGANDA_SEGMENTS_BY_WEEKDAY[weekday],
    sunriseMs: input.sunriseMs,
    sunsetMs: input.sunsetMs,
    timezoneIana: input.timezoneIana,
  });
  const gulika = daySegmentPeriod({
    type: "GULIKA",
    ruleId: "GULIKA_DAY_SEGMENT",
    segmentIndex1To8: GULIKA_KAAL_SEGMENTS_BY_WEEKDAY[weekday],
    sunriseMs: input.sunriseMs,
    sunsetMs: input.sunsetMs,
    timezoneIana: input.timezoneIana,
  });

  const abhijitRule = getPremiumRule("ABHIJIT_MIDDAY_MUHURTA");
  // Card 2 exact arithmetic (buildAbhijitMuhurtaTimingWindow), no rounding.
  const dayMs = input.sunsetMs - input.sunriseMs;
  const middayMs = input.sunriseMs + dayMs / 2;
  const halfMuhurtaMs = dayMs / 30;
  const abhijit = {
    type: "ABHIJIT_MUHURTA",
    ...periodTimes({
      startMs: middayMs - halfMuhurtaMs,
      endMs: middayMs + halfMuhurtaMs,
      timezoneIana: input.timezoneIana,
    }),
    status: "available" as const,
    ruleId: abhijitRule.ruleId,
    calculationReference: "card9:abhijit",
    wednesdayExclusionConvention: weekday === 3,
  };

  const brahmaRule = getPremiumRule("BRAHMA_FIXED_48MIN");
  const brahmaMuhurta = {
    type: "BRAHMA_MUHURTA",
    ...periodTimes({
      startMs: input.sunriseMs - 96 * 60_000,
      endMs: input.sunriseMs - 48 * 60_000,
      timezoneIana: input.timezoneIana,
    }),
    status: "available" as const,
    ruleId: brahmaRule.ruleId,
    calculationReference: "card9:brahma-fixed-48min",
    convention: "FIXED_48MIN_MUHURTA" as const,
  };

  return { rahuKaal, yamaganda, gulika, abhijit, brahmaMuhurta };
}
