// Card 11.R3 — Panchang/rise-set current-engine adapter (production context, Node 22).
// Mirrors the production panchang astronomy EXACTLY: sunrise/sunset via swe_rise_trans
// (topocentric, SWIEPH, pressure 1013.25, temp 15 — identical to src/modules/panchang/engine.ts),
// and Tithi/Nakshatra/Yoga/Karana via swisseph Sun/Moon. Emits current-panchang.json.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const swe = require("swisseph") as typeof import("swisseph");
const LAB = process.env.LAB_DIR!;
const NAK = 360 / 27;
const norm = (x: number) => ((x % 360) + 360) % 360;
const ephe = () => process.env.SWISSEPH_EPHE_PATH || join(process.cwd(), "node_modules", "swisseph", "ephe");

function msToJd(ms: number) { return ms / 86400000 + 2440587.5; }
function jdToIso(jd: number) { return new Date((jd - 2440587.5) * 86400000).toISOString(); }
function trop(jd: number, code: number) {
  const r = swe.swe_calc_ut(jd, code, swe.SEFLG_SWIEPH) as { longitude: number } | { error: string };
  if ("error" in r) throw new Error(r.error);
  return norm(r.longitude);
}
function ayan(jd: number) { swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0); return swe.swe_get_ayanamsa_ut(jd); }

function riseSet(jdStart: number, body: number, lon: number, lat: number, eventFlag: number): string | null {
  swe.swe_set_ephe_path(ephe());
  swe.swe_set_topo(lon, lat, 0);
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_TOPOCTR;
  const r = swe.swe_rise_trans(jdStart, body, "", flags, eventFlag, lon, lat, 0, 1013.25, 15) as
    | { transitTime: number } | { error: string } | Record<string, unknown>;
  if (!r || typeof r !== "object" || "error" in r || !("transitTime" in r)) return null;
  const tt = (r as { transitTime: number }).transitTime;
  // tt <= 0 is the swe_rise_trans no-event flag (-2) at circumpolar/midnight-sun/polar-night;
  // tt > jdStart+1 means no event within the civil day. Both -> unavailable (no fabrication).
  if (!Number.isFinite(tt) || tt <= 0 || tt > jdStart + 1) return null;
  return jdToIso(tt);
}

// discrete indices (monotonic-increasing quantities)
const tithiIdx = (jd: number) => Math.floor(norm(trop(jd, swe.SE_MOON) - trop(jd, swe.SE_SUN)) / 12);
const nakIdx = (jd: number) => Math.floor(norm(trop(jd, swe.SE_MOON) - ayan(jd)) / NAK);
const yogaIdx = (jd: number) => { const a = ayan(jd); return Math.floor(norm(trop(jd, swe.SE_SUN) - a + trop(jd, swe.SE_MOON) - a) / NAK); };
const karanaIdx = (jd: number) => Math.floor(norm(trop(jd, swe.SE_MOON) - trop(jd, swe.SE_SUN)) / 6);

function nextChange(idxFn: (jd: number) => number, jd0: number, stepMin: number, maxHours: number): string | null {
  const i0 = idxFn(jd0);
  const step = stepMin / 1440;
  let t = jd0;
  const end = jd0 + maxHours / 24;
  while (t < end) {
    const tn = t + step;
    if (idxFn(tn) !== i0) {
      let a = t, b = tn;
      for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (idxFn(m) !== i0) b = m; else a = m; }
      return jdToIso((a + b) / 2);
    }
    t = tn;
  }
  return null;
}

function main() {
  swe.swe_set_ephe_path(ephe());
  const fx = JSON.parse(readFileSync(join(LAB, "fixtures", "panchang-fixtures.json"), "utf-8")).fixtures as any[];
  const results: Record<string, unknown> = {};
  for (const f of fx) {
    const jdStart = msToJd(Date.parse(f.dayStartUtc));
    const jdNoon = msToJd(Date.parse(f.noonUtc));
    const sunrise = riseSet(jdStart, swe.SE_SUN, f.longitude, f.latitude, swe.SE_CALC_RISE);
    const sunset = riseSet(jdStart, swe.SE_SUN, f.longitude, f.latitude, swe.SE_CALC_SET);
    results[f.id] = {
      sunriseUtc: sunrise, sunsetUtc: sunset,
      sunriseAvailable: sunrise !== null, sunsetAvailable: sunset !== null,
      tithiIndex: tithiIdx(jdNoon), nakshatraIndex: nakIdx(jdNoon), yogaIndex: yogaIdx(jdNoon), karanaIndex: karanaIdx(jdNoon),
      tithiNextUtc: nextChange(tithiIdx, jdNoon, 20, 30),
      nakshatraNextUtc: nextChange(nakIdx, jdNoon, 15, 30),
      yogaNextUtc: nextChange(yogaIdx, jdNoon, 15, 30),
      karanaNextUtc: nextChange(karanaIdx, jdNoon, 10, 20),
    };
  }
  mkdirSync(join(LAB, "reports"), { recursive: true });
  writeFileSync(join(LAB, "reports", "current-panchang.json"), JSON.stringify({
    meta: { provider: "current-engine", swisseph: "0.5.17", riseSet: "swe_rise_trans topocentric SWIEPH (mirrors production panchang engine)" },
    results,
  }, null, 2));
  console.log(`panchang adapter: ${Object.keys(results).length} fixtures`);
}
main();
