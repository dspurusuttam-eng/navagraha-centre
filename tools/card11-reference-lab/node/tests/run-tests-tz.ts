// Card 11.R3 — timezone/DST provenance tests. Isolated; pure Intl; no production import.
import { runtimeProvenance, resolveCivil } from "../src/timezone-provenance.ts";
let pass = 0, fail = 0;
const ok = (n: string, c: boolean, x = "") => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n} ${x}`); } };

const prov = runtimeProvenance();
ok("runtime provenance: node + icu present", !!prov.node && !!prov.icu, JSON.stringify(prov));
ok("runtime provenance: tzdata version present", prov.tzdata !== undefined, JSON.stringify(prov));

// DST GAP (spring-forward): 2021-03-14 02:30 America/New_York does not exist -> NONEXISTENT
const gap = resolveCivil("2021-03-14T02:30:00", "America/New_York");
ok("DST gap -> NONEXISTENT (fails explicitly, not guessed)", gap.status === "NONEXISTENT" && gap.resolvedUtc === null, gap.status);

// DST OVERLAP (fall-back): 2021-11-07 01:30 America/New_York occurs twice -> AMBIGUOUS
const overlap = resolveCivil("2021-11-07T01:30:00", "America/New_York");
ok("DST overlap -> AMBIGUOUS (fails explicitly, not guessed)", overlap.status === "AMBIGUOUS" && overlap.resolvedUtc === null, overlap.status);

// ordinary post-DST times resolve OK
const spring = resolveCivil("2021-03-14T10:00:00", "America/New_York");
ok("post-spring 10:00 -> OK, DST active (EDT -240)", spring.status === "OK" && spring.offsetMinutes === -240 && spring.dstActive, JSON.stringify(spring));
const fall = resolveCivil("2021-11-07T10:00:00", "America/New_York");
ok("post-fall 10:00 -> OK, standard (EST -300)", fall.status === "OK" && fall.offsetMinutes === -300 && !fall.dstActive, JSON.stringify(fall));

// fractional offsets
const ist = resolveCivil("1990-01-01T12:00:00", "Asia/Kolkata");
ok("fractional +5:30 (Asia/Kolkata)", ist.status === "OK" && ist.offsetMinutes === 330, JSON.stringify(ist));
const npt = resolveCivil("1999-09-09T09:09:00", "Asia/Kathmandu");
ok("fractional +5:45 (Asia/Kathmandu)", npt.status === "OK" && npt.offsetMinutes === 345, JSON.stringify(npt));

// date line: Pacific/Kiritimati +14
const kiri = resolveCivil("2022-01-01T00:00:00", "Pacific/Kiritimati");
ok("date line +14 (Pacific/Kiritimati)", kiri.status === "OK" && kiri.offsetMinutes === 840, JSON.stringify(kiri));

// leap year: 2016-02-29 resolves
const leap = resolveCivil("2016-02-29T00:00:00", "UTC");
ok("leap day 2016-02-29 UTC resolves", leap.status === "OK" && leap.offsetMinutes === 0, JSON.stringify(leap));

// historical offset: Asia/Kolkata pre-1942 used +5:53:20 (HMT) -> non-half-hour historical offset
const hist = resolveCivil("1900-06-15T12:00:00", "Asia/Kolkata");
ok("historical offset handled (Asia/Kolkata 1900 != +5:30)", hist.status === "OK" && hist.offsetMinutes !== 330, JSON.stringify({ off: hist.offsetMinutes }));

// southern-hemisphere DST (Australia/Sydney) active in January
const syd = resolveCivil("1990-01-15T12:00:00", "Australia/Sydney");
ok("southern DST active in Jan (Australia/Sydney)", syd.status === "OK" && syd.dstActive, JSON.stringify(syd));

console.log(`\ntimezone provenance tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
