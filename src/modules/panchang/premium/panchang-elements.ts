// Card 9.2 — Panchang element states at a query instant.
//
// Element math is Card 2's authoritative implementation (getTithi/getNakshatra/
// getYoga/getKarana), reused unchanged. This layer adds exact start/end times
// (backward + forward bisection, <= 1 s) and the next element identity.
// Vara is sunrise-anchored: an instant belongs to the Panchang day whose
// [sunrise, nextSunrise) interval contains it; pre-sunrise = previous vara.

import {
  getKarana,
  getNakshatra,
  getTithi,
  getYoga,
} from "@/modules/panchang/engine";
import { getPremiumRule, VARA_NAMES } from "@/modules/panchang/premium/constants";
import {
  solveElementEnd,
  solveElementStart,
  type FactorKey,
} from "@/modules/panchang/premium/transitions";
import { toLocalMinute } from "@/modules/panchang/premium/intervals";
import type {
  PremiumElementState,
  PremiumNakshatraState,
  PremiumTransition,
  PremiumVara,
  SunMoonSampler,
} from "@/modules/panchang/premium/types";
import { makeKeysResolver } from "@/modules/panchang/premium/transitions";

type SunMoon = { sunLongitude: number; moonLongitude: number };

function elementView(factor: FactorKey, sample: SunMoon) {
  switch (factor) {
    case "tithi": {
      const tithi = getTithi(sample);

      return {
        index: tithi.index,
        name: tithi.name,
        progressPercent: tithi.progress_percent,
      };
    }
    case "nakshatra": {
      const nakshatra = getNakshatra(sample.moonLongitude);

      return {
        index: nakshatra.index,
        name: nakshatra.name,
        progressPercent: nakshatra.progress_percent,
        pada: nakshatra.pada,
      };
    }
    case "yoga": {
      const yoga = getYoga(sample);

      return {
        index: yoga.index,
        name: yoga.name,
        progressPercent: yoga.progress_percent,
      };
    }
    case "karana": {
      const tithi = getTithi(sample);
      const karana = getKarana(tithi.phase);
      const progress = ((tithi.phase % 6) / 6) * 100;

      return {
        index: karana.index,
        name: karana.name,
        progressPercent: Number(progress.toFixed(2)),
      };
    }
  }
}

const ELEMENT_RULES: Record<FactorKey, { index: string; transition: string }> = {
  tithi: { index: "PANCHANG_TITHI_INDEX", transition: "PANCHANG_TITHI_TRANSITION" },
  nakshatra: {
    index: "PANCHANG_NAKSHATRA_INDEX",
    transition: "PANCHANG_NAKSHATRA_TRANSITION",
  },
  yoga: { index: "PANCHANG_YOGA_INDEX", transition: "PANCHANG_YOGA_TRANSITION" },
  karana: {
    index: "PANCHANG_KARANA_INDEX",
    transition: "PANCHANG_KARANA_TRANSITION",
  },
};

export type ElementResolutionContext = {
  sampler: SunMoonSampler;
  keysAt: ReturnType<typeof makeKeysResolver>;
  queryMs: number;
};

export function resolveElementState(
  ctx: ElementResolutionContext,
  factor: FactorKey
): PremiumElementState | PremiumNakshatraState | null {
  const sample = ctx.sampler(new Date(ctx.queryMs));

  if (!sample) {
    return null;
  }

  const startMs = solveElementStart({ keysAt: ctx.keysAt, factor, atMs: ctx.queryMs });
  const endMs = solveElementEnd({ keysAt: ctx.keysAt, factor, atMs: ctx.queryMs });

  if (startMs === null || endMs === null) {
    return null;
  }

  // Next element identity: sample just after the end boundary.
  const nextSample = ctx.sampler(new Date(endMs + 60_000));

  if (!nextSample) {
    return null;
  }

  const rule = getPremiumRule(ELEMENT_RULES[factor].index);
  const current = elementView(factor, sample);
  const next = elementView(factor, nextSample);

  return {
    ...current,
    startUtc: new Date(startMs).toISOString(),
    endUtc: new Date(endMs).toISOString(),
    next: { index: next.index, name: next.name },
    ruleId: rule.ruleId,
    calculationReference: `card2:${factor}-math+card9:boundary-solver`,
  };
}

export function toPremiumTransitions(input: {
  sampler: SunMoonSampler;
  transitions: Array<{ factor: FactorKey; atMs: number }>;
  timezoneIana: string;
}): PremiumTransition[] | null {
  const result: PremiumTransition[] = [];

  for (const transition of input.transitions) {
    const before = input.sampler(new Date(transition.atMs - 60_000));
    const after = input.sampler(new Date(transition.atMs + 60_000));

    if (!before || !after) {
      return null;
    }

    const rule = getPremiumRule(ELEMENT_RULES[transition.factor].transition);
    const fromView = elementView(transition.factor, before);
    const toView = elementView(transition.factor, after);
    const atUtc = new Date(transition.atMs).toISOString();

    result.push({
      element: transition.factor,
      atUtc,
      atLocal: toLocalMinute(atUtc, input.timezoneIana),
      fromIndex: fromView.index,
      fromName: fromView.name,
      toIndex: toView.index,
      toName: toView.name,
      ruleId: rule.ruleId,
    });
  }

  return result;
}

/**
 * Sunrise-anchored Vara. `panchangDayDate` is the local calendar date whose
 * sunrise begins the Panchang day containing the instant (already resolved by
 * the engine); vara is simply that date's weekday.
 */
export function resolveVara(panchangDayDate: string): PremiumVara {
  const [year, month, day] = panchangDayDate.split("-").map(Number);
  const weekdayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const rule = getPremiumRule("PANCHANG_VARA_SUNRISE_ANCHORED");

  return {
    index: weekdayIndex,
    name: VARA_NAMES[weekdayIndex],
    panchangDayDate,
    ruleId: rule.ruleId,
  };
}
