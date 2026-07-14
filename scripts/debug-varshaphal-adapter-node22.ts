/**
 * Card 14.2C — REAL swisseph adapter + orchestrator validation (Node 22 only).
 * The production adapter is `server-only`, so this harness constructs the same
 * Lahiri/TRUE-node sidereal functions INLINE (mirroring ephemeris-adapter.ts) and
 * drives the pure orchestrator end-to-end against the native ephemeris.
 *
 * Native swisseph is built for the Node 22 ABI (accuracy-fast CI). On any other Node
 * (e.g. local Node 24) the module fails to load — this harness then prints SKIPPED and
 * exits 0 so it never yields a false failure. On Node 22 it executes a real solar return.
 */
import { buildVarshaphalSnapshot, type VarshaphalEphemeris, type TajikaGraha } from "@/modules/varshaphal/premium";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
function loadSwisseph(): any | null {
  try {
    const s = require("swisseph");
    if (typeof s.swe_calc_ut !== "function") return null;
    return s;
  } catch {
    return null;
  }
}

function buildRealEphemeris(swe: any): VarshaphalEphemeris {
  swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
  const ephePath = process.env.SWISSEPH_EPHE_PATH?.trim();
  const baseFlag = ephePath ? swe.SEFLG_SWIEPH : swe.SEFLG_MOSEPH;
  if (ephePath) swe.swe_set_ephe_path(ephePath);
  const flags = baseFlag | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
  const bodies: Record<TajikaGraha, number> = {
    SUN: swe.SE_SUN, MOON: swe.SE_MOON, MARS: swe.SE_MARS, MERCURY: swe.SE_MERCURY,
    JUPITER: swe.SE_JUPITER, VENUS: swe.SE_VENUS, SATURN: swe.SE_SATURN,
  };
  const jd = (ms: number): number => {
    const d = new Date(ms);
    const hour = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3_600_000;
    return swe.swe_julday(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hour, swe.SE_GREG_CAL);
  };
  return {
    sunSiderealLongitudeAtUtcMs: (ms) => swe.swe_calc_ut(jd(ms), swe.SE_SUN, flags).longitude,
    ascendantSiderealLongitudeAt: (ms, lat, lon) => {
      const h = swe.swe_houses_ex(jd(ms), swe.SEFLG_SIDEREAL, lat, lon, "W");
      return "error" in h ? null : h.ascendant;
    },
    planetSiderealStatesAtUtcMs: (ms) => {
      const out = {} as Record<TajikaGraha, { longitudeDeg: number; speedDegPerDay: number }>;
      for (const g of Object.keys(bodies) as TajikaGraha[]) {
        const r = swe.swe_calc_ut(jd(ms), bodies[g], flags);
        out[g] = { longitudeDeg: r.longitude, speedDegPerDay: r.longitudeSpeed };
      }
      return out;
    },
    sunriseSunsetAt: (ms, lat, lon) => {
      try {
        const d = new Date(ms);
        const jd0 = jd(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
        const ev = (event: number): number | null => {
          const r = swe.swe_rise_trans(jd0, swe.SE_SUN, "", ephePath ? swe.SEFLG_SWIEPH : swe.SEFLG_MOSEPH, event, lon, lat, 0, 0, 0);
          const t = r?.transitTime ?? r?.tret;
          return typeof t === "number" && Number.isFinite(t) ? t : null;
        };
        const rise = ev(swe.SE_CALC_RISE);
        const set = ev(swe.SE_CALC_SET);
        if (rise === null || set === null) return null;
        const msFromJd = (x: number) => (x - 2440587.5) * 86_400_000;
        return { sunriseUtcMs: msFromJd(rise), sunsetUtcMs: msFromJd(set) };
      } catch {
        return null;
      }
    },
  };
}

function main() {
  const swe = loadSwisseph();
  if (!swe) {
    console.log("Varshaphal real-adapter Node-22 validation: SKIPPED (native swisseph not loadable on this Node ABI).");
    console.log("  This harness executes on the Node 22 accuracy-fast runtime; the pure orchestrator QA covers the logic on every Node.");
    return;
  }

  const eph = buildRealEphemeris(swe);
  // Birth: 1988-07-14 09:20 UTC, Delhi.
  const birthMs = Date.parse("1988-07-14T09:20:00.000Z");
  const lat = 28.6139, lon = 77.209;
  const natalSun = eph.sunSiderealLongitudeAtUtcMs(birthMs);
  const natalLagna = eph.ascendantSiderealLongitudeAt(birthMs, lat, lon);

  const snapshot = buildVarshaphalSnapshot({
    natal: { sunLongitudeDeg: natalSun, lagnaLongitudeDeg: natalLagna, instantUtcMs: birthMs, latitudeDeg: lat, longitudeDeg: lon, janmaLagnaLord: "JUPITER" },
    yearNumber: 30,
    ephemeris: eph,
    moonNakshatraLordAtReturn: "SATURN",
    combustionArcByGraha: { MERCURY: 14, VENUS: 10, MARS: 17, JUPITER: 11, SATURN: 15, SUN: null, MOON: null },
  });

  const assert = (c: unknown, m: string): void => { if (!c) throw new Error(m); };
  assert(snapshot.solarReturn.status === "CONVERGED", `solar return status ${snapshot.solarReturn.status}`);
  const returnMs = snapshot.solarReturn.returnInstantUtcMs!;
  const sunAtReturn = eph.sunSiderealLongitudeAtUtcMs(returnMs);
  const gap = Math.abs(((sunAtReturn - natalSun + 540) % 360) - 180);
  assert(gap < 0.001, `Sun not back to natal longitude (gap=${gap})`);
  assert(snapshot.varshaLagna!.status === "CALCULATED", "varsha lagna");
  assert(Object.keys(snapshot.panchavargeeya!).length === 7, "7 panchavargeeya");
  assert(snapshot.muddaDasha!.status === "CALCULATED", "mudda");

  console.log("Varshaphal real-adapter Node-22 validation: PASSED");
  console.log(`  natal Sun ${natalSun.toFixed(4)} deg -> Varsha Pravesha (year 30) ${snapshot.solarReturn.returnInstantUtcIso} (err ${snapshot.solarReturn.finalErrorArcsec?.toFixed(6)} arcsec)`);
  console.log(`  Varsha Lagna ${snapshot.varshaLagna!.sign}; Varshesha ${snapshot.varshesha!.varshesha?.graha}; Mudda maha ${snapshot.muddaDasha!.maha.length}`);
}

main();
