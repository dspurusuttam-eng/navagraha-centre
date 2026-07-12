// Card 11.R1 — deterministic lab tests. Isolated; no production import.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { norm360, circularDiffDeg, signedCircularDiff, rashiIndex, nakshatraIndex, padaIndex, degToArcsec } from "../src/normalizer.ts";
import { TOLERANCES, tolerancesComplete } from "../src/tolerance-registry.ts";
import { ALL_CLASSIFICATIONS } from "../src/discrepancy-classifier.ts";
import { candidateAyanamsaDeg } from "../src/lahiri-candidate.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = join(HERE, "..", "..");
let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean, extra = "") {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${extra}`); }
}
const near = (a: number, b: number, eps: number) => Math.abs(a - b) <= eps;

// 1. angle normalization
ok("norm360 wraps", norm360(-10) === 350 && norm360(370) === 10);
// 2. circular difference (minimum separation)
ok("circularDiff 359.999 vs 0.001 = 0.002", near(circularDiffDeg(359.999, 0.001), 0.002, 1e-9));
ok("circularDiff symmetric 10 vs 350 = 20", near(circularDiffDeg(10, 350), 20, 1e-9));
ok("signedCircularDiff 1 vs 359 = +2", near(signedCircularDiff(1, 359), 2, 1e-9));
// 3. unit conversion
ok("degToArcsec 1deg=3600", degToArcsec(1) === 3600);
// 4. Vedic classification ranges
ok("rashiIndex range", rashiIndex(0) === 0 && rashiIndex(359.9) === 11);
ok("nakshatraIndex range", nakshatraIndex(0) === 0 && nakshatraIndex(359.9) === 26);
ok("padaIndex range", padaIndex(0) === 1 && padaIndex(3.4) === 2 && padaIndex(359.9) === 4);
// 5. tolerance registry completeness
const tc = tolerancesComplete([
  "planetLongitude", "moonLongitude", "astronomyEngineLongitude", "eclipticLatitude",
  "distanceAu", "longitudeSpeed", "ayanamsaContinuity", "trueNode", "ketuOpposition",
]);
ok("tolerance registry complete", tc.complete, JSON.stringify(tc.missing));
ok("distinct per-quantity tolerances (no single universal)", new Set(Object.values(TOLERANCES).map((t) => `${t.value}${t.unit}`)).size >= 6);
// 6. classification enum completeness (13 statuses)
ok("classification enum has 13 statuses", ALL_CLASSIFICATIONS.length === 13);
// 7. lahiri candidate anchor identity at J2000
ok("candidate ayanamsa == anchor at J2000", candidateAyanamsaDeg(2451545.0, 23.857) === 23.857);
// 8. fixture schema + duplicate-id detection
function loadFix(rel: string) { return JSON.parse(readFileSync(join(LAB, rel), "utf-8")).fixtures as any[]; }
const fixtures = [...loadFix("fixtures/reference-cases.json"), ...loadFix("fixtures/boundary-cases.json")];
ok("fixtures present (>=25)", fixtures.length >= 25, `${fixtures.length}`);
const ids = fixtures.map((f) => f.id);
ok("no duplicate fixture ids", new Set(ids).size === ids.length);
ok("fixture lat/lon in range", fixtures.every((f) => f.latitude >= -90 && f.latitude <= 90 && f.longitude >= -180 && f.longitude <= 180));
ok("fixture required fields", fixtures.every((f) => f.id && f.dateLocal && f.timeLocal && f.timezone && Array.isArray(f.tags)));
// duplicate-id detection actually triggers
let dupCaught = false;
try {
  const seen = new Set<string>();
  for (const id of [...ids, ids[0]]) { if (seen.has(id)) throw new Error("dup"); seen.add(id); }
} catch { dupCaught = true; }
ok("duplicate-id detection works", dupCaught);

// 9. provider provenance + result invariants (if artifacts exist)
function tryLoad(rel: string) { try { return JSON.parse(readFileSync(join(LAB, rel), "utf-8")); } catch { return null; } }
const cur = tryLoad("reports/current-engine-results.json");
const sky = tryLoad("reports/skyfield-oracle-results.json");
const ae = tryLoad("reports/astronomy-engine-results.json");
if (cur && sky && ae) {
  ok("provider provenance present", !!cur.provider && !!sky.providerVersion && !!ae.providerVersion);
  ok("current ephemeris mode = SWISSEPH", cur.providerVersion.ephemerisMode === "SWISSEPH");
  const ids2 = Object.keys(cur.results).filter((k) => !("error" in cur.results[k]));
  ok("all three providers cover same fixtures", ids2.every((id) => sky.results[id] && ae.results[id]));
  // longitude range + no NaN
  let rangeOk = true, nanOk = true, ketuOk = true;
  for (const id of ids2) {
    for (const b of Object.keys(cur.results[id].bodies)) {
      const L = cur.results[id].bodies[b].tropicalLon;
      if (!(L >= 0 && L < 360)) rangeOk = false;
      if (!Number.isFinite(L)) nanOk = false;
    }
    const r = cur.results[id].bodies.RAHU.tropicalLon;
    const k = cur.results[id].bodies.KETU.tropicalLon;
    if (circularDiffDeg(k, norm360(r + 180)) > 1e-6) ketuOk = false;
  }
  ok("all longitudes in [0,360)", rangeOk);
  ok("no NaN/Infinity", nanOk);
  ok("Ketu = Rahu+180 invariant (all fixtures)", ketuOk);
} else {
  console.log("  (skipping artifact tests — run adapters first)");
}

console.log(`\nlab tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
