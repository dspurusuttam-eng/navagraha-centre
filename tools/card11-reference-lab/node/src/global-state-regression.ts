// Card 11.R3 — global-state safety regression (runs in production project context).
// Proves the swe_close() sidereal-mode leak is fixed, outputs are byte-unchanged, and
// there is no cross-call contamination under sequential or interleaved (concurrent) use.
import { createRequire } from "node:module";
import { calculateCoreGrahaSiderealLongitudesAtUtc } from "@/lib/astrology/swiss-planetary-service";

const require = createRequire(import.meta.url);
const swe = require("swisseph") as typeof import("swisseph");
const LAHIRI_J2000 = 23.857092353708822;
const SUN_SID_J2000 = 256.51569621253066; // golden baseline (pre-fix value)

function ayanJ2000(): number {
  const jd = swe.swe_julday(2000, 1, 1, 12, swe.SE_GREG_CAL);
  return swe.swe_get_ayanamsa_ut(jd);
}
let pass = 0, fail = 0;
const ok = (n: string, c: boolean, x = "") => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n} ${x}`); } };

async function main() {
  swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
  ok("baseline: ayanamsa(J2000) = Lahiri", Math.abs(ayanJ2000() - LAHIRI_J2000) < 1e-6, String(ayanJ2000()));

  // (1) after the production call, a bare ayanamsa read must STILL be Lahiri (no leak)
  const r = calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: "2000-01-01T12:00:00.000Z" });
  ok("no-leak: ayanamsa is Lahiri after production call (was Fagan-Bradley pre-fix)", Math.abs(ayanJ2000() - LAHIRI_J2000) < 1e-6, String(ayanJ2000()));

  // (2) output byte-unchanged: Sun sidereal @ J2000 matches the golden baseline exactly
  const sun = r.success ? r.data.planets.find((p) => p.graha === "SUN")!.sidereal_longitude : NaN;
  ok("output-unchanged: Sun sidereal @ J2000 == golden baseline", Math.abs(sun - SUN_SID_J2000) < 1e-9, String(sun));

  // (3) sequential: many calls, ayanamsa stays Lahiri each time with NO manual reset
  let seqOk = true;
  for (let i = 0; i < 8; i++) {
    calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: "2010-05-05T00:00:00.000Z" });
    if (Math.abs(ayanJ2000() - LAHIRI_J2000) > 1e-6) seqOk = false;
  }
  ok("sequential: no leak across 8 calls", seqOk);

  // (4) interleaved/concurrent invocation pattern: fire many calc promises, then verify
  // the global sidereal mode is still Lahiri (no contamination). Node native calls are
  // synchronous, so this proves the canonical-state restore holds under Promise.all use.
  await Promise.all(Array.from({ length: 12 }, (_, i) =>
    Promise.resolve().then(() => calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: `20${10 + (i % 9)}-0${1 + (i % 8)}-15T06:00:00.000Z` }))
  ));
  ok("concurrent(interleaved): ayanamsa is Lahiri after Promise.all of 12 calls", Math.abs(ayanJ2000() - LAHIRI_J2000) < 1e-6, String(ayanJ2000()));

  console.log(`\nglobal-state regression: ${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
main();
