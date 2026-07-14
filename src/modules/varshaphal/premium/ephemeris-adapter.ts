// Card 14.2B1 — swisseph-backed ephemeris adapter (server-only, production wiring).
// Supplies the two functions the pure engines inject: Sun sidereal longitude at a UTC
// instant, and the sidereal (whole-sign) ascendant at a UTC instant + location. Reuses
// the certified runtime (Lahiri sid mode + ephemeris path/flags) so results match the
// certified natal engine exactly. Intentionally NOT re-exported from the module barrel:
// the registry/engine QA stays pure and this native path loads only when explicitly used.
import "server-only";
import swisseph from "swisseph";
import { getSwissEphemerisRuntime } from "@/lib/astrology/ephemeris";
import type { TajikaGraha } from "@/modules/varshaphal/premium/types";

type SwissCalc = { longitude: number; longitudeSpeed: number } | { error: string };
type SwissHouses = { ascendant: number } | { error: string };
type SwissRise = { transitTime?: number; tret?: number; error?: string };

const JD_UNIX_EPOCH = 2440587.5;
const msFromJulianDay = (jd: number): number => (jd - JD_UNIX_EPOCH) * 86_400_000;

const GRAHA_BODY: Record<TajikaGraha, number> = {
  SUN: swisseph.SE_SUN, MOON: swisseph.SE_MOON, MARS: swisseph.SE_MARS,
  MERCURY: swisseph.SE_MERCURY, JUPITER: swisseph.SE_JUPITER, VENUS: swisseph.SE_VENUS, SATURN: swisseph.SE_SATURN,
};

function julianDayUtFromUtcMs(utcMs: number): number {
  const d = new Date(utcMs);
  const hourDecimal =
    d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3_600_000;
  return swisseph.swe_julday(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    hourDecimal,
    swisseph.SE_GREG_CAL,
  );
}

export type VarshaphalEphemerisAdapter = {
  sunSiderealLongitudeAtUtcMs: (utcMs: number) => number;
  ascendantSiderealLongitudeAt: (utcMs: number, latitudeDeg: number, longitudeDeg: number) => number | null;
  planetSiderealStatesAtUtcMs: (utcMs: number) => Record<TajikaGraha, { longitudeDeg: number; speedDegPerDay: number }>;
  sunriseSunsetAt: (utcMs: number, latitudeDeg: number, longitudeDeg: number) => { sunriseUtcMs: number; sunsetUtcMs: number } | null;
};

/** Build a Lahiri/TRUE-node sidereal adapter backed by the certified swisseph runtime. */
export function createVarshaphalEphemerisAdapter(): VarshaphalEphemerisAdapter {
  const runtime = getSwissEphemerisRuntime();
  const calcFlags = runtime.ephemerisFlag | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;

  const sunSiderealLongitudeAtUtcMs = (utcMs: number): number => {
    const jd = julianDayUtFromUtcMs(utcMs);
    const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, calcFlags) as SwissCalc;
    if ("error" in result) throw new Error(`swisseph Sun calc failed: ${result.error}`);
    return result.longitude;
  };

  const ascendantSiderealLongitudeAt = (utcMs: number, latitudeDeg: number, longitudeDeg: number): number | null => {
    const jd = julianDayUtFromUtcMs(utcMs);
    const result = swisseph.swe_houses_ex(jd, swisseph.SEFLG_SIDEREAL, latitudeDeg, longitudeDeg, "W") as SwissHouses;
    if ("error" in result) return null;
    return result.ascendant;
  };

  const planetSiderealStatesAtUtcMs = (utcMs: number): Record<TajikaGraha, { longitudeDeg: number; speedDegPerDay: number }> => {
    const jd = julianDayUtFromUtcMs(utcMs);
    const out = {} as Record<TajikaGraha, { longitudeDeg: number; speedDegPerDay: number }>;
    for (const graha of Object.keys(GRAHA_BODY) as TajikaGraha[]) {
      const result = swisseph.swe_calc_ut(jd, GRAHA_BODY[graha], calcFlags) as SwissCalc;
      if ("error" in result) throw new Error(`swisseph ${graha} calc failed: ${result.error}`);
      out[graha] = { longitudeDeg: result.longitude, speedDegPerDay: result.longitudeSpeed };
    }
    return out;
  };

  // Sunrise/sunset (Card 9 convention: geometric Sun rise/set) for the return's UTC civil day.
  const riseJd = (jd0: number, lat: number, lon: number, event: number): number | null => {
    const r = swisseph.swe_rise_trans(jd0, swisseph.SE_SUN, "", runtime.ephemerisFlag, event, lon, lat, 0, 0, 0) as SwissRise;
    const jd = r.transitTime ?? r.tret;
    return typeof jd === "number" && Number.isFinite(jd) ? jd : null;
  };
  const sunriseSunsetAt = (utcMs: number, latitudeDeg: number, longitudeDeg: number): { sunriseUtcMs: number; sunsetUtcMs: number } | null => {
    try {
      const d = new Date(utcMs);
      const dayStartMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0);
      const jd0 = julianDayUtFromUtcMs(dayStartMs);
      const rise = riseJd(jd0, latitudeDeg, longitudeDeg, swisseph.SE_CALC_RISE);
      const set = riseJd(jd0, latitudeDeg, longitudeDeg, swisseph.SE_CALC_SET);
      if (rise === null || set === null) return null;
      return { sunriseUtcMs: msFromJulianDay(rise), sunsetUtcMs: msFromJulianDay(set) };
    } catch {
      return null;
    }
  };

  return { sunSiderealLongitudeAtUtcMs, ascendantSiderealLongitudeAt, planetSiderealStatesAtUtcMs, sunriseSunsetAt };
}
