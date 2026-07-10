// Card 9.2 — Choghadiya schedules (pure arithmetic over rise/set instants).
//
// 8 day segments (sunrise->sunset)/8 + 8 night segments (sunset->next
// sunrise)/8 from the pinned 7x8 tables (Card 9.1 section 7). Actual rise/set
// division — never an equal 90-minute assumption. Names/locale never alter
// calculation. Machine classification only; no event prediction.

import {
  CHOGHADIYA_CLASSIFICATION,
  CHOGHADIYA_DAY_TABLE,
  CHOGHADIYA_DISPLAY_NAMES,
  CHOGHADIYA_NIGHT_TABLE,
  getPremiumRule,
} from "@/modules/panchang/premium/constants";
import { buildBoundaries, periodTimes } from "@/modules/panchang/premium/intervals";
import type { ChoghadiyaInterval } from "@/modules/panchang/premium/types";

function buildHalf(input: {
  weekdayIndex: number;
  half: "day" | "night";
  startMs: number;
  endMs: number;
  timezoneIana: string;
}): ChoghadiyaInterval[] {
  const table =
    input.half === "day" ? CHOGHADIYA_DAY_TABLE : CHOGHADIYA_NIGHT_TABLE;
  const row = table[input.weekdayIndex % 7];
  const rule = getPremiumRule(
    input.half === "day" ? "CHOGHADIYA_DAY" : "CHOGHADIYA_NIGHT"
  );
  const boundaries = buildBoundaries(input.startMs, input.endMs, 8);
  const intervals: ChoghadiyaInterval[] = [];

  for (let index = 0; index < 8; index += 1) {
    const key = row[index];

    intervals.push({
      type: "CHOGHADIYA",
      index: index + 1,
      half: input.half,
      key,
      name: CHOGHADIYA_DISPLAY_NAMES[key],
      classification: CHOGHADIYA_CLASSIFICATION[key],
      ...periodTimes({
        startMs: boundaries[index],
        endMs: boundaries[index + 1],
        timezoneIana: input.timezoneIana,
      }),
      status: "available",
      ruleId: rule.ruleId,
      calculationReference: `card9:choghadiya-${input.half}`,
    });
  }

  return intervals;
}

export function buildDayChoghadiya(input: {
  weekdayIndex: number;
  sunriseMs: number;
  sunsetMs: number;
  timezoneIana: string;
}): ChoghadiyaInterval[] {
  return buildHalf({
    weekdayIndex: input.weekdayIndex,
    half: "day",
    startMs: input.sunriseMs,
    endMs: input.sunsetMs,
    timezoneIana: input.timezoneIana,
  });
}

export function buildNightChoghadiya(input: {
  weekdayIndex: number;
  sunsetMs: number;
  nextSunriseMs: number;
  timezoneIana: string;
}): ChoghadiyaInterval[] {
  return buildHalf({
    weekdayIndex: input.weekdayIndex,
    half: "night",
    startMs: input.sunsetMs,
    endMs: input.nextSunriseMs,
    timezoneIana: input.timezoneIana,
  });
}
