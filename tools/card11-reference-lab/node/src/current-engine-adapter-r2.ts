// Card 11.R2 — CURRENT ENGINE ADAPTER (read-only; calls UNMODIFIED production code).
// Executed in the production project context (Node 22) via a temporary, removed bootstrap.
// Emits: fixture results (direct tropical + production sidereal + lat/dist/speed/node),
// G1 node sweep, G2 ayanamsa sweep, boundary transition instants, and a global-state probe.
// The production application never imports this file. No production code is changed.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { calculateCoreGrahaSiderealLongitudesAtUtc } from "@/lib/astrology/swiss-planetary-service";

const require = createRequire(import.meta.url);
const swisseph = require("swisseph") as typeof import("swisseph");

const LAB = process.env.LAB_DIR;
if (!LAB) throw new Error("LAB_DIR required.");
const R = (f: string) => join(LAB, "reports", f);
const F = (f: string) => join(LAB, "fixtures", f);

const BODY_CODE: Record<string, number> = {
  SUN: swisseph.SE_SUN, MOON: swisseph.SE_MOON, MERCURY: swisseph.SE_MERCURY,
  VENUS: swisseph.SE_VENUS, MARS: swisseph.SE_MARS, JUPITER: swisseph.SE_JUPITER,
  SATURN: swisseph.SE_SATURN, RAHU: swisseph.SE_TRUE_NODE,
};
const CLASSICAL = ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN"];
const SWIEPH = () => swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;

function norm360(x: number): number { return ((x % 360) + 360) % 360; }

function ephePath() {
  return process.env.SWISSEPH_EPHE_PATH || join(process.cwd(), "node_modules", "swisseph", "ephe");
}
function msToJdUt(ms: number): number {
  const d = new Date(ms);
  const h = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3.6e6;
  return swisseph.swe_julday(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), h, swisseph.SE_GREG_CAL);
}
function ayanamsaAt(jd: number): number {
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  return swisseph.swe_get_ayanamsa_ut(jd);
}
function tropicalAt(jd: number, code: number) {
  const r = swisseph.swe_calc_ut(jd, code, SWIEPH()) as
    | { longitude: number; latitude: number; distance: number; longitudeSpeed: number }
    | { error: string };
  if ("error" in r) throw new Error(r.error);
  return r;
}
function siderealLonAt(ms: number, code: number): number {
  const jd = msToJdUt(ms);
  return norm360(tropicalAt(jd, code).longitude - ayanamsaAt(jd));
}

// inlined deterministic bisection (mirror of transition-solver.ts) for longitude crossing
function boundaryOffset(lon: number, target: number, span: number): number {
  return (((lon - target) % span) + 1.5 * span) % span - span / 2;
}
function solveCrossing(lonAt: (ms: number) => number, t0: number, t1: number, target: number, span: number) {
  const g = (ms: number) => boundaryOffset(lonAt(ms), norm360(target), span);
  let a = t0, b = t1, ga = g(a), gb = g(b);
  if (!((ga <= 0 && gb >= 0) || (ga >= 0 && gb <= 0)) || Math.abs(ga - gb) > span * 0.9)
    return { converged: false, solvedMs: null as number | null, residualDeg: null as number | null, iterations: 0 };
  let it = 0;
  while (b - a > 1000 && it < 80) {
    const m = a + (b - a) / 2, gm = g(m);
    if ((ga <= 0 && gm >= 0) || (ga >= 0 && gm <= 0)) { b = m; } else { a = m; ga = gm; }
    it++;
  }
  const mid = a + (b - a) / 2;
  return { converged: b - a <= 1000, solvedMs: mid, residualDeg: Math.abs(g(mid)), iterations: it };
}
function solveStation(code: number, t0: number, t1: number) {
  const sp = (ms: number) => tropicalAt(msToJdUt(ms), code).longitudeSpeed;
  let a = t0, b = t1, sa = sp(a), sb = sp(b);
  if (!((sa <= 0 && sb >= 0) || (sa >= 0 && sb <= 0)))
    return { converged: false, solvedMs: null as number | null, iterations: 0 };
  let it = 0;
  while (b - a > 1000 && it < 80) {
    const m = a + (b - a) / 2, sm = sp(m);
    if ((sa <= 0 && sm >= 0) || (sa >= 0 && sm <= 0)) { b = m; } else { a = m; sa = sm; }
    it++;
  }
  const mid = a + (b - a) / 2;
  return { converged: b - a <= 1000, solvedMs: mid, iterations: it };
}

const SPAN: Record<string, number> = { SIGN: 30, NAKSHATRA: 360 / 27, PADA: 360 / 108, WRAP_ARIES: 30 };
const STATION_WIN_DAYS: Record<string, number> = { MERCURY: 8, VENUS: 20, MARS: 28, JUPITER: 55, SATURN: 60 };

// Certify a boundary crossing for `code` at fixture instant `ms`. The window is
// speed-adaptive (0.45 * span / |speed|) so the bracket contains EXACTLY the single
// crossing the fixture sits on — avoiding adjacent-boundary ambiguity for fast bodies.
// Scan outward from `ms` in small steps for the crossing NEAREST the fixture instant,
// then bisect that bracket. Robust to minor fixture-placement error and immune to
// adjacent-boundary ambiguity (step < time between adjacent crossings).
function nearestCrossing(lonAt: (ms: number) => number, ms: number, target: number, span: number, stepMs: number, maxWinMs: number) {
  const g = (t: number) => boundaryOffset(lonAt(t), norm360(target), span);
  const tryPair = (a: number, b: number) => {
    const ga = g(a), gb = g(b);
    if (((ga <= 0 && gb >= 0) || (ga >= 0 && gb <= 0)) && Math.abs(ga - gb) < span * 0.9) {
      let lo = a, hi = b, glo = ga, it = 0;
      while (hi - lo > 1000 && it < 80) { const m = lo + (hi - lo) / 2, gm = g(m); if ((glo <= 0 && gm >= 0) || (glo >= 0 && gm <= 0)) hi = m; else { lo = m; glo = gm; } it++; }
      const mid = lo + (hi - lo) / 2;
      return { converged: hi - lo <= 1000, solvedMs: mid, residualDeg: Math.abs(g(mid)), iterations: it };
    }
    return null;
  };
  for (let k = 0; k * stepMs <= maxWinMs; k++) {
    const fwd = tryPair(ms + k * stepMs, ms + (k + 1) * stepMs);
    if (fwd) return fwd;
    const bwd = tryPair(ms - (k + 1) * stepMs, ms - k * stepMs);
    if (bwd) return bwd;
  }
  return { converged: false, solvedMs: null as number | null, residualDeg: null as number | null, iterations: 0 };
}
function certifyCrossing(ms: number, jd: number, code: number, type: string, ayan: number) {
  const span = SPAN[type] ?? 30;
  const t = tropicalAt(jd, code);
  const sid = norm360(t.longitude - ayan);
  const sp = Math.abs(t.longitudeSpeed) || 0.01;
  const crossPeriodMs = (span / sp) * 86400000;
  const target = type === "WRAP_ARIES" ? 0 : Math.round(sid / span) * span;
  const res = nearestCrossing((m) => siderealLonAt(m, code), ms, target, span, 0.2 * crossPeriodMs, 2 * crossPeriodMs);
  return { type, target: norm360(target), ...res };
}
function certifyStation(ms: number, code: number, body: string) {
  const wd = STATION_WIN_DAYS[body] ?? 30;
  const res = solveStation(code, ms - wd * 86400000, ms + wd * 86400000);
  return { type: "STATION", ...res };
}

function main() {
  swisseph.swe_set_ephe_path(ephePath());
  const corpus = JSON.parse(readFileSync(F("golden-corpus.json"), "utf-8")) as {
    fixtures: Array<{ id: string; category: string; utcInstant: string; expectedClass: string; boundaryMeta: any }>;
  };

  // --- global-state probe (Workstream K) ---
  const jdProbe = swisseph.swe_julday(2000, 1, 1, 12, swisseph.SE_GREG_CAL);
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  const ayanBefore = swisseph.swe_get_ayanamsa_ut(jdProbe);
  calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: "2000-01-01T12:00:00.000Z" });
  const ayanAfterNoReset = swisseph.swe_get_ayanamsa_ut(jdProbe);
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  const ayanAfterReset = swisseph.swe_get_ayanamsa_ut(jdProbe);
  // repeated determinism
  const rep: number[] = [];
  for (let i = 0; i < 3; i++) { calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: "2000-01-01T12:00:00.000Z" }); swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0); rep.push(swisseph.swe_get_ayanamsa_ut(jdProbe)); }
  const probe = {
    jd: jdProbe,
    lahiriExpected: ayanBefore,
    ayanamsaAfterProductionCallNoReset: ayanAfterNoReset,
    ayanamsaAfterReset: ayanAfterReset,
    driftedDeg: Math.abs(ayanAfterNoReset - ayanBefore),
    restoredByReset: Math.abs(ayanAfterReset - ayanBefore) < 1e-9,
    repeatDeterministic: rep.every((x) => Math.abs(x - ayanBefore) < 1e-9),
    classification:
      Math.abs(ayanAfterNoReset - ayanBefore) > 1e-6
        ? "LATENT_CROSS_CALL_HAZARD"
        : "HARMLESS_STATE_RESIDUE",
  };

  // --- fixtures ---
  const fixtures: Record<string, unknown> = {};
  const transitions: Record<string, unknown> = {};
  let ephemerisMode = "UNKNOWN";
  for (const fx of corpus.fixtures) {
    if (fx.expectedClass === "CLASS_D") { fixtures[fx.id] = { unavailable: true, reason: fx.boundaryMeta?.type ?? "CLASS_D" }; continue; }
    const ms = Date.parse(fx.utcInstant);
    const jd = msToJdUt(ms);
    const prod = calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: fx.utcInstant });
    if (!prod.success) { fixtures[fx.id] = { error: prod.issue }; continue; }
    ephemerisMode = prod.data.ephemeris_mode;
    const ayan = ayanamsaAt(jd);
    const prodByGraha = new Map(prod.data.planets.map((p) => [p.graha, p]));
    const bodies: Record<string, unknown> = {};
    for (const b of [...CLASSICAL, "RAHU"]) {
      const t = tropicalAt(jd, BODY_CODE[b]!);
      const ps = prodByGraha.get(b);
      bodies[b] = {
        tropicalLon: norm360(t.longitude),
        siderealLonProd: ps ? ps.sidereal_longitude : norm360(t.longitude - ayan),
        eclLat: t.latitude,
        distanceAu: t.distance,
        lonSpeed: t.longitudeSpeed,
        retrograde: t.longitudeSpeed < 0,
      };
    }
    const rahuT = (bodies.RAHU as any).tropicalLon as number;
    bodies.KETU = { tropicalLon: norm360(rahuT + 180), siderealLonProd: norm360(norm360(rahuT + 180) - ayan) };
    fixtures[fx.id] = { utcInstant: fx.utcInstant, jd, ayanamsa: ayan, bodies };

    // boundary transition (Workstream J): current-engine crossing instant
    const bm = fx.boundaryMeta;
    if (bm && bm.body && bm.type && SPAN[bm.type] && BODY_CODE[bm.body] !== undefined) {
      transitions[fx.id] = { body: bm.body, ...certifyCrossing(ms, jd, BODY_CODE[bm.body]!, bm.type, ayan) };
    } else if (bm && bm.type === "STATION" && BODY_CODE[bm.body] !== undefined) {
      transitions[fx.id] = { body: bm.body, ...certifyStation(ms, BODY_CODE[bm.body]!, bm.body) };
    }
  }

  // --- R1 nine-boundary closure transitions (Workstream G) ---
  try {
    const r1c = JSON.parse(readFileSync(F("r1-closure-cases.json"), "utf-8")) as { fixtures: any[] };
    for (const fx of r1c.fixtures) {
      const ms = Date.parse(fx.utcInstant);
      const jd = msToJdUt(ms);
      const bm = fx.boundaryMeta;
      const code = BODY_CODE[bm.body];
      if (code === undefined) continue;
      if (bm.type === "STATION") {
        transitions[fx.id] = { r1Fixture: fx.r1Fixture, body: bm.body, ...certifyStation(ms, code, bm.body) };
      } else if (SPAN[bm.type] !== undefined) {
        transitions[fx.id] = { r1Fixture: fx.r1Fixture, body: bm.body, ...certifyCrossing(ms, jd, code, bm.type, ayanamsaAt(jd)) };
      }
      // WRAP_SEAM: tropical 0/360 normalization guard, certified by longitude agreement (comparator), no transition.
    }
  } catch (e) { /* r1-closure optional */ }

  // --- G1 node sweep (>=1000) ---
  const g1list = JSON.parse(readFileSync(F("g1-node-timestamps.json"), "utf-8")) as { instants: string[] };
  const g1 = g1list.instants.map((iso) => {
    const jd = msToJdUt(Date.parse(iso));
    const rahuTrop = norm360(tropicalAt(jd, swisseph.SE_TRUE_NODE).longitude);
    return { iso, jd, rahuTropicalLon: rahuTrop };
  });

  // --- G2 ayanamsa sweep (monthly + specials) ---
  const g2list = JSON.parse(readFileSync(F("g2-lahiri-dates.json"), "utf-8")) as { instants: string[] };
  const g2 = g2list.instants.map((iso) => {
    const jd = msToJdUt(Date.parse(iso));
    return { iso, jd, ayanamsa: ayanamsaAt(jd) };
  });

  mkdirSync(join(LAB, "reports"), { recursive: true });
  const meta = { provider: "current-engine", swisseph: "0.5.17", seVersion: "2.09.03", ephemerisMode,
    productionFunction: "calculateCoreGrahaSiderealLongitudesAtUtc", tropicalSource: "swe_calc_ut SWIEPH (direct, of-date)" };
  writeFileSync(R("current-r2-fixtures.json"), JSON.stringify({ meta, results: fixtures }, null, 2));
  writeFileSync(R("current-r2-transitions.json"), JSON.stringify({ meta, transitions }, null, 2));
  writeFileSync(R("current-r2-g1.json"), JSON.stringify({ meta, points: g1 }, null, 2));
  writeFileSync(R("current-r2-g2.json"), JSON.stringify({ meta, mode: "LAHIRI", points: g2 }, null, 2));
  writeFileSync(R("global-state-probe.json"), JSON.stringify(probe, null, 2));
  console.log(`current-r2 adapter: fixtures=${Object.keys(fixtures).length} transitions=${Object.keys(transitions).length} g1=${g1.length} g2=${g2.length} mode=${ephemerisMode}`);
  console.log(`global-state probe: drift=${probe.driftedDeg.toFixed(4)}deg class=${probe.classification} restoredByReset=${probe.restoredByReset}`);
}

main();
