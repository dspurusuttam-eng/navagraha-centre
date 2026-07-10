// Card 9.2 — Full transition solving over the Panchang day.
//
// Bracketed root search (coarse 30-minute scan) followed by bisection to
// <= 1 second. Enumerates EVERY tithi/nakshatra/yoga/karana change inside a
// window (multiple changes per day are expected for karana and possible for
// tithi), plus backward solving for the START of the current element.
//
// Factor keys reuse Card 2's authoritative getFactorKeys (single source of
// truth); the sampler is injectable so the solver is deterministic on Node 24.

import { getFactorKeys, type PanchangFactorKeys } from "@/modules/panchang/engine";
import type { SunMoonSampler } from "@/modules/panchang/premium/types";

const COARSE_STEP_MS = 30 * 60_000;
const PRECISION_MS = 1_000; // locked: <= 1 second
const BACKWARD_SEARCH_LIMIT_MS = 48 * 3_600_000;
const FORWARD_SEARCH_LIMIT_MS = 48 * 3_600_000;

export type FactorKey = keyof PanchangFactorKeys;

export const FACTOR_KEYS: readonly FactorKey[] = [
  "tithi",
  "nakshatra",
  "yoga",
  "karana",
] as const;

export type FactorTransition = {
  factor: FactorKey;
  atMs: number;
  fromKey: number;
  toKey: number;
};

type KeysAt = (ms: number) => PanchangFactorKeys | null;

export function makeKeysResolver(sampler: SunMoonSampler): KeysAt {
  const cache = new Map<number, PanchangFactorKeys | null>();

  return (ms: number) => {
    const cached = cache.get(ms);

    if (cached !== undefined) {
      return cached;
    }

    const sample = sampler(new Date(ms));
    const keys = sample
      ? getFactorKeys({
          sunLongitude: sample.sunLongitude,
          moonLongitude: sample.moonLongitude,
        })
      : null;

    cache.set(ms, keys);

    return keys;
  };
}

/** Bisect the boundary of `factor` inside (lowMs, highMs], given differing keys. */
function bisectBoundary(input: {
  keysAt: KeysAt;
  factor: FactorKey;
  lowMs: number;
  lowKey: number;
  highMs: number;
}): number | null {
  let low = input.lowMs;
  let high = input.highMs;

  while (high - low > PRECISION_MS) {
    const mid = low + Math.floor((high - low) / 2);
    const keys = input.keysAt(mid);

    if (!keys) {
      return null;
    }

    if (keys[input.factor] === input.lowKey) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

/**
 * Enumerate every factor transition in [fromMs, toMs), ordered by time.
 * Coarse 30-minute brackets are individually bisected per changed factor; no
 * fixed-step time is ever emitted as a final result. Minimum element durations
 * (karana ~9.5 h; others longer) guarantee at most one change per factor per
 * bracket.
 */
export function enumerateTransitions(input: {
  keysAt: KeysAt;
  fromMs: number;
  toMs: number;
}): FactorTransition[] | null {
  const transitions: FactorTransition[] = [];
  let previousMs = input.fromMs;
  let previousKeys = input.keysAt(previousMs);

  if (!previousKeys) {
    return null;
  }

  while (previousMs < input.toMs) {
    const nextMs = Math.min(previousMs + COARSE_STEP_MS, input.toMs);
    const nextKeys = input.keysAt(nextMs);

    if (!nextKeys) {
      return null;
    }

    for (const factor of FACTOR_KEYS) {
      if (nextKeys[factor] !== previousKeys[factor]) {
        const boundary = bisectBoundary({
          keysAt: input.keysAt,
          factor,
          lowMs: previousMs,
          lowKey: previousKeys[factor],
          highMs: nextMs,
        });

        if (boundary === null) {
          return null;
        }

        if (boundary >= input.fromMs && boundary < input.toMs) {
          transitions.push({
            factor,
            atMs: boundary,
            fromKey: previousKeys[factor],
            toKey: nextKeys[factor],
          });
        }
      }
    }

    previousMs = nextMs;
    previousKeys = nextKeys;
  }

  transitions.sort((left, right) => left.atMs - right.atMs);

  return transitions;
}

/**
 * Solve the START of the current element (the most recent boundary at or
 * before `atMs`) by scanning backward in coarse steps, then bisecting.
 */
export function solveElementStart(input: {
  keysAt: KeysAt;
  factor: FactorKey;
  atMs: number;
}): number | null {
  const currentKeys = input.keysAt(input.atMs);

  if (!currentKeys) {
    return null;
  }

  const currentKey = currentKeys[input.factor];
  let highMs = input.atMs;
  let lowMs = input.atMs - COARSE_STEP_MS;
  const limitMs = input.atMs - BACKWARD_SEARCH_LIMIT_MS;

  while (lowMs > limitMs) {
    const keys = input.keysAt(lowMs);

    if (!keys) {
      return null;
    }

    if (keys[input.factor] !== currentKey) {
      // Boundary in (lowMs, highMs]; bisect forward from the differing side.
      const boundary = bisectBoundary({
        keysAt: input.keysAt,
        factor: input.factor,
        lowMs,
        lowKey: keys[input.factor],
        highMs,
      });

      return boundary;
    }

    highMs = lowMs;
    lowMs -= COARSE_STEP_MS;
  }

  return null;
}

/** Solve the END of the current element (first boundary strictly after atMs). */
export function solveElementEnd(input: {
  keysAt: KeysAt;
  factor: FactorKey;
  atMs: number;
}): number | null {
  const currentKeys = input.keysAt(input.atMs);

  if (!currentKeys) {
    return null;
  }

  const currentKey = currentKeys[input.factor];
  let lowMs = input.atMs;
  let highMs = input.atMs + COARSE_STEP_MS;
  const limitMs = input.atMs + FORWARD_SEARCH_LIMIT_MS;

  while (highMs <= limitMs) {
    const keys = input.keysAt(highMs);

    if (!keys) {
      return null;
    }

    if (keys[input.factor] !== currentKey) {
      return bisectBoundary({
        keysAt: input.keysAt,
        factor: input.factor,
        lowMs,
        lowKey: currentKey,
        highMs,
      });
    }

    lowMs = highMs;
    highMs += COARSE_STEP_MS;
  }

  return null;
}
