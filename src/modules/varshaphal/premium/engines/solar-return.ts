// Card 14.2B1 — exact sidereal solar-return (Varsha Pravesha) root finder (pure).
// Contract §5 / 14.1A decision 6. The Sun's sidereal longitude is injected so the
// finder is deterministic and testable without a native ephemeris; the swisseph-backed
// implementation is supplied by ephemeris-adapter.ts in production.
import {
  SOLAR_RETURN_BRACKET_DAYS,
  SOLAR_RETURN_MAX_ITERATIONS,
  SOLAR_RETURN_TOLERANCE_ARCSEC,
} from "@/modules/varshaphal/premium/constants";
import type { VarshaphalEvidenceToken } from "@/modules/varshaphal/premium/types";
import { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";
import { norm180 } from "@/modules/varshaphal/premium/engines/geometry";

const DAY_MS = 86_400_000;
const MEAN_SOLAR_YEAR_DAYS = 365.2422;
const MAX_BRACKET_EXPAND_DAYS = 6; // beyond the pinned ±bracket before giving up

export type SolarReturnInput = {
  natalSunLongitudeDeg: number;
  natalInstantUtcMs: number;
  yearNumber: number;
  /** Injected ephemeris: Sun sidereal longitude (deg, Lahiri) at a UTC instant. */
  sunSiderealLongitudeAtUtcMs: (utcMs: number) => number;
};

export type SolarReturnResult = {
  status: "CONVERGED" | "UNAVAILABLE";
  returnInstantUtcMs: number | null;
  returnInstantUtcIso: string | null;
  yearNumber: number;
  iterations: number;
  finalErrorArcsec: number | null;
  civilYearBoundaryCrossed: boolean;
  tokens: VarshaphalEvidenceToken[];
  unavailableReasons: EngineUnavailable[];
};

export function findSolarReturn(input: SolarReturnInput): SolarReturnResult {
  const { natalSunLongitudeDeg, natalInstantUtcMs, yearNumber, sunSiderealLongitudeAtUtcMs } = input;
  const tokens: VarshaphalEvidenceToken[] = [];
  const unavailableReasons: EngineUnavailable[] = [];

  const fail = (message: string): SolarReturnResult => {
    unavailableReasons.push({ code: "RETURN_NONCONVERGENCE", message });
    return { status: "UNAVAILABLE", returnInstantUtcMs: null, returnInstantUtcIso: null, yearNumber, iterations: 0, finalErrorArcsec: null, civilYearBoundaryCrossed: false, tokens, unavailableReasons };
  };

  if (!Number.isFinite(natalSunLongitudeDeg) || !Number.isFinite(natalInstantUtcMs) || !Number.isInteger(yearNumber) || yearNumber < 0) {
    return fail("Invalid solar-return inputs.");
  }

  // f(t) = signed angular gap of Sun to natal Sun longitude, continuous & monotone near the root.
  const f = (ms: number): number => norm180(sunSiderealLongitudeAtUtcMs(ms) - natalSunLongitudeDeg);

  const guess = natalInstantUtcMs + yearNumber * MEAN_SOLAR_YEAR_DAYS * DAY_MS;

  // Bracket a sign change of f around the guess, expanding once if the pinned window misses.
  let lo = guess - SOLAR_RETURN_BRACKET_DAYS * DAY_MS;
  let hi = guess + SOLAR_RETURN_BRACKET_DAYS * DAY_MS;
  let flo = f(lo);
  let fhi = f(hi);
  let expand = 0;
  while (flo * fhi > 0 && expand < MAX_BRACKET_EXPAND_DAYS) {
    lo -= DAY_MS; hi += DAY_MS; expand += 1;
    flo = f(lo); fhi = f(hi);
  }
  if (flo * fhi > 0) return fail("Could not bracket the solar return within the allowed window.");
  // Orient so f(lo) < 0 < f(hi).
  if (flo > 0) { const t = lo; lo = hi; hi = t; }

  let iterations = 0;
  let mid = (lo + hi) / 2;
  let fmid = f(mid);
  while (iterations < SOLAR_RETURN_MAX_ITERATIONS) {
    iterations += 1;
    mid = (lo + hi) / 2;
    fmid = f(mid);
    if (Math.abs(fmid) * 3600 <= SOLAR_RETURN_TOLERANCE_ARCSEC || Math.abs(hi - lo) <= 1) break;
    if (fmid > 0) hi = mid; else lo = mid;
  }

  const finalErrorArcsec = Math.abs(fmid) * 3600;
  if (finalErrorArcsec > SOLAR_RETURN_TOLERANCE_ARCSEC && Math.abs(hi - lo) > 1) {
    return fail(`Root finder did not reach tolerance (err=${finalErrorArcsec.toFixed(6)} arcsec).`);
  }

  const returnInstantUtcMs = Math.round(mid);
  const iso = new Date(returnInstantUtcMs).toISOString();
  const expectedCivilYear = new Date(natalInstantUtcMs).getUTCFullYear() + yearNumber;
  const civilYearBoundaryCrossed = new Date(returnInstantUtcMs).getUTCFullYear() !== expectedCivilYear;

  tokens.push(buildToken("SOLAR_RETURN_V1", "SOLAR_RETURN", 0, "NEUTRAL",
    `Varsha Pravesha (year ${yearNumber}) at ${iso}`, ["SOLAR_RETURN", yearNumber, iso]));
  tokens.push(buildToken("SOLAR_RETURN_TOLERANCE_V1", "SOLAR_RETURN", 0, "NEUTRAL",
    `Converged in ${iterations} iterations, error ${finalErrorArcsec.toFixed(6)} arcsec`, ["SR_TOL", iterations]));
  tokens.push(buildToken("YEAR_INDEXING_V1", "SOLAR_RETURN", 0, "NEUTRAL",
    `Solar year index N=${yearNumber}; civilYearBoundaryCrossed=${civilYearBoundaryCrossed}`, ["SR_INDEX", yearNumber]));

  return {
    status: "CONVERGED",
    returnInstantUtcMs,
    returnInstantUtcIso: iso,
    yearNumber,
    iterations,
    finalErrorArcsec,
    civilYearBoundaryCrossed,
    tokens,
    unavailableReasons,
  };
}
