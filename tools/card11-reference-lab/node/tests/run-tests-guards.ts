// Card 11.R5 — observability / fail-closed guard tests. Isolated; pure; no production import.
import {
  GuardError, assertProviderMode, assertEphemerisAsset, assertKernelChecksum,
  riseSetTimestampStatus, assertSiderealRestored, assertCivilResolvable,
  assertKernelDateInRange, assertReferenceAssetSupported,
} from "../src/observability-guards.ts";
let pass = 0, fail = 0;
const ok = (n: string, c: boolean, x = "") => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n} ${x}`); } };
function throwsCode(fn: () => void, code: string): boolean {
  try { fn(); return false; } catch (e) { return e instanceof GuardError && e.code === code; }
}

// each fail-closed path throws a STRUCTURED GuardError with the right code
ok("provider-mode fallback fails closed", throwsCode(() => assertProviderMode("MOSEPH"), "PROVIDER_MODE_UNEXPECTED"));
ok("provider-mode SWISSEPH passes", (() => { try { assertProviderMode("SWISSEPH"); return true; } catch { return false; } })());
ok("missing ephemeris asset fails closed", throwsCode(() => assertEphemerisAsset(false, "/ephe/sepl_18.se1"), "EPHEMERIS_ASSET_MISSING"));
ok("kernel checksum mismatch fails closed", throwsCode(() => assertKernelChecksum("aaa", "bbb"), "KERNEL_CHECKSUM_MISMATCH"));
ok("rise/set no-event flag (-2) -> unavailable (not fabricated)", riseSetTimestampStatus(-2).available === false);
ok("rise/set valid JD -> available", riseSetTimestampStatus(2455368.65).available === true);
ok("rise/set 0 / NaN -> unavailable", riseSetTimestampStatus(0).available === false && riseSetTimestampStatus(NaN).available === false);
ok("un-restored sidereal state fails closed", throwsCode(() => assertSiderealRestored(0, 1), "SIDEREAL_STATE_NOT_RESTORED"));
ok("restored sidereal (Lahiri=1) passes", (() => { try { assertSiderealRestored(1, 1); return true; } catch { return false; } })());
ok("ambiguous civil time fails closed", throwsCode(() => assertCivilResolvable("AMBIGUOUS", "2021-11-07T01:30", "America/New_York"), "CIVIL_TIME_AMBIGUOUS"));
ok("nonexistent civil time fails closed", throwsCode(() => assertCivilResolvable("NONEXISTENT", "2021-03-14T02:30", "America/New_York"), "CIVIL_TIME_NONEXISTENT"));
ok("OK civil time passes", (() => { try { assertCivilResolvable("OK", "x", "y"); return true; } catch { return false; } })());
ok("kernel out-of-range fails closed", throwsCode(() => assertKernelDateInRange(1000000, 2396752.5, 2506352.5), "KERNEL_DATE_OUT_OF_RANGE"));
ok("kernel in-range passes", (() => { try { assertKernelDateInRange(2451545, 2396752.5, 2506352.5); return true; } catch { return false; } })());
ok("unsupported reference asset fails closed", throwsCode(() => assertReferenceAssetSupported("de441", ["de440s"]), "REFERENCE_ASSET_UNSUPPORTED"));

console.log(`\nobservability-guard tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
