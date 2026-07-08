// Card 6 — Rashi ingress engine.
//
// Pure algorithms over an injected longitude *sampler*, so the bisection,
// retrograde handling and Sade Sati window enumeration are unit-testable
// without Swiss Ephemeris. The production sampler is wired in `engine.ts`.
//
// Ingress detection works on the *rashi index* (not raw longitude), which makes
// it direction-agnostic: it handles direct motion, retrograde motion, stationary
// points and the 0/360 wrap identically.

import {
  rashiIndex,
  type GocharGraha,
  type RashiIndex0To11,
} from "@/modules/astrology/gochar/core";

export type GocharSample = {
  longitude: number;
  speed: number;
};

/** Returns all nine graha samples at an instant, or null if unavailable. */
export type GocharSampler = (
  instant: Date
) => Record<GocharGraha, GocharSample> | null;

const MS_PER_DAY = 86_400_000;

/**
 * Coarse scan step per graha, chosen so that `step * maxSpeed` is comfortably
 * below one rashi (30 deg) and no crossing can be skipped.
 * Max daily motion (deg): Moon ~15.4, Mercury ~2.2, Venus ~1.3, Sun ~1.0,
 * Mars ~0.8, Jupiter ~0.24, Saturn ~0.13, nodes ~0.05.
 */
const COARSE_STEP_DAYS: Record<GocharGraha, number> = {
  MOON: 0.25,
  MERCURY: 1,
  VENUS: 1,
  SUN: 1,
  MARS: 1,
  JUPITER: 2,
  SATURN: 2,
  RAHU: 2,
  KETU: 2,
};

/** Default search horizon per graha (days). Saturn/nodes move slowly. */
const DEFAULT_HORIZON_DAYS: Record<GocharGraha, number> = {
  MOON: 5,
  MERCURY: 120,
  VENUS: 120,
  SUN: 45,
  MARS: 400,
  JUPITER: 500,
  SATURN: 1200,
  RAHU: 1200,
  KETU: 1200,
};

/** Bisection stops when the bracket is this tight (contract: <= 60 s). */
export const INGRESS_TOLERANCE_MS = 60_000;

/** Post-verification tolerance on the 30 deg boundary (contract: <= 0.001 deg). */
export const INGRESS_BOUNDARY_TOLERANCE_DEG = 0.001;

export type IngressEvent = {
  graha: GocharGraha;
  fromRashi: RashiIndex0To11;
  toRashi: RashiIndex0To11;
  atUtc: string;
  longitudeAtIngress: number;
  retrograde: boolean;
};

export type IngressFailureCode =
  | "SAMPLER_UNAVAILABLE"
  | "NO_INGRESS_IN_HORIZON";

export type IngressResult =
  | { success: true; data: IngressEvent }
  | { success: false; issue: { code: IngressFailureCode; message: string } };

function addDays(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * MS_PER_DAY);
}

function sampleGraha(
  sampler: GocharSampler,
  graha: GocharGraha,
  instant: Date
): GocharSample | null {
  const all = sampler(instant);

  return all ? (all[graha] ?? null) : null;
}

/**
 * Bisect the interval [lo, hi] where rashi(lo) !== rashi(hi) down to
 * INGRESS_TOLERANCE_MS. Returns the first instant at/after which the rashi has
 * changed (i.e. the crossing instant, start-exclusive / end-inclusive).
 */
function bisectRashiChange(input: {
  sampler: GocharSampler;
  graha: GocharGraha;
  lo: Date;
  hi: Date;
  loRashi: RashiIndex0To11;
}): { atUtc: Date; sample: GocharSample } | null {
  let lo = input.lo.getTime();
  let hi = input.hi.getTime();
  let hiSample = sampleGraha(input.sampler, input.graha, new Date(hi));

  if (!hiSample) {
    return null;
  }

  while (hi - lo > INGRESS_TOLERANCE_MS) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const midSample = sampleGraha(input.sampler, input.graha, new Date(mid));

    if (!midSample) {
      return null;
    }

    if (rashiIndex(midSample.longitude) === input.loRashi) {
      lo = mid;
    } else {
      hi = mid;
      hiSample = midSample;
    }
  }

  return { atUtc: new Date(hi), sample: hiSample };
}

/**
 * Next rashi change for `graha` strictly after `from`.
 * Direction-agnostic: works for direct, retrograde and stationary motion.
 */
export function findNextIngress(input: {
  sampler: GocharSampler;
  graha: GocharGraha;
  from: Date;
  horizonDays?: number;
}): IngressResult {
  const { sampler, graha, from } = input;
  const startSample = sampleGraha(sampler, graha, from);

  if (!startSample) {
    return {
      success: false,
      issue: {
        code: "SAMPLER_UNAVAILABLE",
        message: `Ephemeris sample unavailable for ${graha} at ${from.toISOString()}.`,
      },
    };
  }

  const stepDays = COARSE_STEP_DAYS[graha];
  const horizonDays = input.horizonDays ?? DEFAULT_HORIZON_DAYS[graha];
  let cursor = from;
  let cursorRashi = rashiIndex(startSample.longitude);
  const deadline = addDays(from, horizonDays);

  while (cursor.getTime() < deadline.getTime()) {
    const next = addDays(cursor, stepDays);
    const nextSample = sampleGraha(sampler, graha, next);

    if (!nextSample) {
      return {
        success: false,
        issue: {
          code: "SAMPLER_UNAVAILABLE",
          message: `Ephemeris sample unavailable for ${graha} at ${next.toISOString()}.`,
        },
      };
    }

    const nextRashi = rashiIndex(nextSample.longitude);

    if (nextRashi !== cursorRashi) {
      const crossing = bisectRashiChange({
        sampler,
        graha,
        lo: cursor,
        hi: next,
        loRashi: cursorRashi,
      });

      if (!crossing) {
        return {
          success: false,
          issue: {
            code: "SAMPLER_UNAVAILABLE",
            message: `Ephemeris sample unavailable while bisecting ${graha} ingress.`,
          },
        };
      }

      return {
        success: true,
        data: {
          graha,
          fromRashi: cursorRashi,
          toRashi: rashiIndex(crossing.sample.longitude),
          atUtc: crossing.atUtc.toISOString(),
          longitudeAtIngress: crossing.sample.longitude,
          retrograde: crossing.sample.speed < 0,
        },
      };
    }

    cursor = next;
    cursorRashi = nextRashi;
  }

  return {
    success: false,
    issue: {
      code: "NO_INGRESS_IN_HORIZON",
      message: `No rashi change found for ${graha} within ${horizonDays} days of ${from.toISOString()}.`,
    },
  };
}

// --- Sade Sati window enumeration -------------------------------------------------

export type SadeSatiTransition = {
  kind: "entry" | "exit";
  atUtc: string;
  saturnLongitude: number;
  retrograde: boolean;
};

export type SadeSatiWindow = {
  transitions: SadeSatiTransition[];
  firstEntryUtc: string | null;
  finalSettledEntryUtc: string | null;
  finalExitUtc: string | null;
  retrogradeReEntry: boolean;
};

export type SadeSatiWindowResult =
  | { success: true; data: SadeSatiWindow }
  | { success: false; issue: { code: IngressFailureCode; message: string } };

/**
 * Bisect a boolean state change on [lo, hi] down to INGRESS_TOLERANCE_MS.
 * `stateAt` must be a pure function of the sampled instant.
 */
function bisectStateChange(input: {
  lo: Date;
  hi: Date;
  loState: boolean;
  stateAt: (instant: Date) => { state: boolean; sample: GocharSample } | null;
}): { atUtc: Date; sample: GocharSample } | null {
  let lo = input.lo.getTime();
  let hi = input.hi.getTime();
  let hiEval = input.stateAt(new Date(hi));

  if (!hiEval) {
    return null;
  }

  while (hi - lo > INGRESS_TOLERANCE_MS) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const midEval = input.stateAt(new Date(mid));

    if (!midEval) {
      return null;
    }

    if (midEval.state === input.loState) {
      lo = mid;
    } else {
      hi = mid;
      hiEval = midEval;
    }
  }

  return { atUtc: new Date(hi), sample: hiEval.sample };
}

/**
 * Enumerate every Sade Sati activation boundary crossed in [from, to],
 * including retrograde re-entries.
 *
 * `isActiveAt` is supplied by the caller (typically: Saturn's house-from-Moon in
 * {12,1,2}) so this stays free of house/Moon knowledge.
 */
export function enumerateSadeSatiWindow(input: {
  sampler: GocharSampler;
  from: Date;
  to: Date;
  isActive: (saturnLongitude: number) => boolean;
  stepDays?: number;
}): SadeSatiWindowResult {
  const stepDays = input.stepDays ?? COARSE_STEP_DAYS.SATURN;
  const stateAt = (instant: Date) => {
    const sample = sampleGraha(input.sampler, "SATURN", instant);

    if (!sample) {
      return null;
    }

    return { state: input.isActive(sample.longitude), sample };
  };

  const startEval = stateAt(input.from);

  if (!startEval) {
    return {
      success: false,
      issue: {
        code: "SAMPLER_UNAVAILABLE",
        message: `Ephemeris sample unavailable for SATURN at ${input.from.toISOString()}.`,
      },
    };
  }

  const transitions: SadeSatiTransition[] = [];
  let cursor = input.from;
  let cursorState = startEval.state;

  while (cursor.getTime() < input.to.getTime()) {
    const nextTime = Math.min(
      addDays(cursor, stepDays).getTime(),
      input.to.getTime()
    );
    const next = new Date(nextTime);
    const nextEval = stateAt(next);

    if (!nextEval) {
      return {
        success: false,
        issue: {
          code: "SAMPLER_UNAVAILABLE",
          message: `Ephemeris sample unavailable for SATURN at ${next.toISOString()}.`,
        },
      };
    }

    if (nextEval.state !== cursorState) {
      const crossing = bisectStateChange({
        lo: cursor,
        hi: next,
        loState: cursorState,
        stateAt,
      });

      if (!crossing) {
        return {
          success: false,
          issue: {
            code: "SAMPLER_UNAVAILABLE",
            message: "Ephemeris sample unavailable while bisecting Sade Sati boundary.",
          },
        };
      }

      transitions.push({
        kind: cursorState ? "exit" : "entry",
        atUtc: crossing.atUtc.toISOString(),
        saturnLongitude: crossing.sample.longitude,
        retrograde: crossing.sample.speed < 0,
      });
      cursorState = nextEval.state;
    }

    cursor = next;
  }

  const entries = transitions.filter((t) => t.kind === "entry");
  const exits = transitions.filter((t) => t.kind === "exit");
  const finalExit = exits.length > 0 ? exits[exits.length - 1]! : null;
  const settledEntry = entries.length > 0 ? entries[entries.length - 1]! : null;

  return {
    success: true,
    data: {
      transitions,
      firstEntryUtc: entries.length > 0 ? entries[0]!.atUtc : null,
      finalSettledEntryUtc: settledEntry ? settledEntry.atUtc : null,
      finalExitUtc: finalExit ? finalExit.atUtc : null,
      // More than one entry means Saturn left and re-entered the Sade Sati
      // house-set, which on the true ephemeris is a retrograde re-entry.
      retrogradeReEntry: entries.length > 1,
    },
  };
}
