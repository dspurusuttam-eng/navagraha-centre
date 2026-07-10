// Card 9.2 — Planetary Hora schedule (pure arithmetic over rise/set instants).
//
// 12 day horas (sunrise->sunset) + 12 night horas (sunset->next sunrise),
// unequal halves, equal within each half. First day hora is ruled by the
// weekday lord; successors follow the locked cycle
// [Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars], continuing through
// sunset. 24 steps through a 7-cycle == +3 steps, so the 25th hora (next
// sunrise) is automatically the next weekday's lord.

import {
  HORA_SEQUENCE,
  WEEKDAY_LORDS,
  getPremiumRule,
} from "@/modules/panchang/premium/constants";
import { buildBoundaries, periodTimes } from "@/modules/panchang/premium/intervals";
import type { HoraInterval, HoraPlanet } from "@/modules/panchang/premium/types";

export function horaLordAt(weekdayIndex: number, horaNumber1To24: number): HoraPlanet {
  const firstLord = WEEKDAY_LORDS[weekdayIndex % 7];
  const startPosition = HORA_SEQUENCE.indexOf(firstLord);

  return HORA_SEQUENCE[(startPosition + horaNumber1To24 - 1) % HORA_SEQUENCE.length];
}

export function buildHoraSchedule(input: {
  weekdayIndex: number;
  sunriseMs: number;
  sunsetMs: number;
  nextSunriseMs: number | null;
  timezoneIana: string;
}): HoraInterval[] {
  const horas: HoraInterval[] = [];
  const dayRule = getPremiumRule("HORA_DAY");
  const dayBoundaries = buildBoundaries(input.sunriseMs, input.sunsetMs, 12);

  for (let index = 0; index < 12; index += 1) {
    horas.push({
      type: "HORA",
      index: index + 1,
      half: "day",
      lord: horaLordAt(input.weekdayIndex, index + 1),
      ...periodTimes({
        startMs: dayBoundaries[index],
        endMs: dayBoundaries[index + 1],
        timezoneIana: input.timezoneIana,
      }),
      status: "available",
      ruleId: dayRule.ruleId,
      calculationReference: "card9:hora-day",
    });
  }

  if (input.nextSunriseMs !== null) {
    const nightRule = getPremiumRule("HORA_NIGHT");
    const nightBoundaries = buildBoundaries(
      input.sunsetMs,
      input.nextSunriseMs,
      12
    );

    for (let index = 0; index < 12; index += 1) {
      horas.push({
        type: "HORA",
        index: 12 + index + 1,
        half: "night",
        lord: horaLordAt(input.weekdayIndex, 12 + index + 1),
        ...periodTimes({
          startMs: nightBoundaries[index],
          endMs: nightBoundaries[index + 1],
          timezoneIana: input.timezoneIana,
        }),
        status: "available",
        ruleId: nightRule.ruleId,
        calculationReference: "card9:hora-night",
      });
    }
  }

  return horas;
}
