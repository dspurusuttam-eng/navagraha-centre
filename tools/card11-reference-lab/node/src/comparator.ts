// Card 11.R1 — differential comparator (pure aggregation over provider artifacts).
// Compares the UNCHANGED current engine against Skyfield/DE440s (primary oracle) and
// Astronomy Engine (secondary). Applies quantity-specific tolerances, guard bands,
// and Gates G1 (True Node) and G2 (Lahiri). Writes reports/differential-report.json.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { circularDiffDeg, degToArcsec, norm360, rashiIndex, nakshatraIndex, padaIndex, boundaryDistances } from "./normalizer.ts";
import { TOLERANCES, GUARD_BANDS, tolerancesComplete } from "./tolerance-registry.ts";
import { classify, ALL_CLASSIFICATIONS, type Classification } from "./discrepancy-classifier.ts";
import { candidateAyanamsaDeg, linearDetrend } from "./lahiri-candidate.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPORTS = join(HERE, "..", "..", "reports");
const BODIES = ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN"] as const;
const load = (f: string) => JSON.parse(readFileSync(join(REPORTS, f), "utf-8"));

function stats(xs: number[]) {
  if (xs.length === 0) return { n: 0, mean: 0, median: 0, p95: 0, max: 0 };
  const s = [...xs].sort((a, b) => a - b);
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]!;
  return {
    n: xs.length,
    mean: xs.reduce((a, b) => a + b, 0) / xs.length,
    median: q(0.5),
    p95: q(0.95),
    max: s[s.length - 1]!,
  };
}

function main() {
  const cur = load("current-engine-results.json");
  const sky = load("skyfield-oracle-results.json");
  const ae = load("astronomy-engine-results.json");
  const sweep = load("production-ayanamsa-sweep.json");

  const counts: Record<Classification, number> = Object.fromEntries(
    ALL_CLASSIFICATIONS.map((c) => [c, 0])
  ) as Record<Classification, number>;
  const bump = (c: Classification) => (counts[c] += 1);

  const perBody: Record<string, { lonDiffArcsec: number[]; retroMismatch: number }> = {};
  for (const b of BODIES) perBody[b] = { lonDiffArcsec: [], retroMismatch: 0 };

  const findings: unknown[] = [];
  const boundaryFixtures: string[] = [];

  const fixtureIds = Object.keys(cur.results).filter((id) => !("error" in cur.results[id]));

  for (const fid of fixtureIds) {
    const c = cur.results[fid];
    const s = sky.results[fid];
    const a = ae.results[fid];
    const ayan = c.ayanamsa as number;

    for (const b of BODIES) {
      const cb = c.bodies[b];
      const sb = s?.bodies?.[b];
      const ab = a?.bodies?.[b];
      if (!cb || !sb) {
        bump("NOT_COMPARABLE");
        continue;
      }
      // --- tropical longitude: current vs primary (skyfield) ---
      const curVsSky = circularDiffDeg(cb.tropicalLon, sb.tropicalLon);
      const curVsAe = ab ? circularDiffDeg(cb.tropicalLon, ab.tropicalLon) : Infinity;
      const skyVsAe = ab ? circularDiffDeg(sb.tropicalLon, ab.tropicalLon) : Infinity;
      perBody[b]!.lonDiffArcsec.push(degToArcsec(curVsSky));

      const lonTol = (b === "MOON" ? TOLERANCES.moonLongitude! : TOLERANCES.planetLongitude!).value; // arcsec
      const aeTol = TOLERANCES.astronomyEngineLongitude!.value;

      // boundary sensitivity from current SIDEREAL longitude + station + wrap
      const curSidereal = norm360(cb.tropicalLon - ayan);
      const bd = boundaryDistances(curSidereal);
      const nearWrap = Math.min(norm360(cb.tropicalLon), 360 - norm360(cb.tropicalLon)) < GUARD_BANDS.wraparoundDeg;
      const nearStation = Math.abs(cb.lonSpeed) < GUARD_BANDS.stationSpeedDegPerDay;
      const boundarySensitive =
        bd.rashiDeg < GUARD_BANDS.rashiDeg ||
        bd.nakshatraDeg < GUARD_BANDS.nakshatraDeg ||
        bd.padaDeg < GUARD_BANDS.padaDeg ||
        nearWrap ||
        nearStation;
      if (boundarySensitive && !boundaryFixtures.includes(fid)) boundaryFixtures.push(fid);

      const primary = classify({
        quantity: "planetLongitude",
        body: b,
        diff: degToArcsec(curVsSky),
        tolerance: lonTol,
        boundarySensitive,
        barycenterTarget: b === "JUPITER" || b === "SATURN",
        currentVsPrimaryExceeds: degToArcsec(curVsSky) > lonTol,
        currentVsSecondaryExceeds: degToArcsec(curVsAe) > aeTol,
        primaryVsSecondaryAgree: degToArcsec(skyVsAe) <= aeTol,
      });
      bump(primary.status);

      // secondary comparator (astronomy-engine) — separate record, not double-counted into primary
      const secondary = ab
        ? classify({
            quantity: "astronomyEngineLongitude",
            body: b,
            diff: degToArcsec(curVsAe),
            tolerance: aeTol,
            boundarySensitive,
            secondaryComparator: true,
          })
        : { status: "NOT_COMPARABLE" as Classification, reason: "no AE value" };

      // retrograde state (discrete) current vs primary
      const retroMatch = cb.retrograde === sb.retrograde;
      if (!retroMatch && !boundarySensitive) perBody[b]!.retroMismatch += 1;

      // sidereal Vedic classification current vs skyfield-derived sidereal
      const refSidereal = norm360(sb.tropicalLon - ayan);
      const classMatch =
        rashiIndex(curSidereal) === rashiIndex(refSidereal) &&
        nakshatraIndex(curSidereal) === nakshatraIndex(refSidereal) &&
        padaIndex(curSidereal) === padaIndex(refSidereal);

      findings.push({
        fixture: fid,
        body: b,
        curTropical: cb.tropicalLon,
        skyTropical: sb.tropicalLon,
        aeTropical: ab?.tropicalLon ?? null,
        curVsSkyArcsec: degToArcsec(curVsSky),
        curVsAeArcsec: ab ? degToArcsec(curVsAe) : null,
        skyVsAeArcsec: ab ? degToArcsec(skyVsAe) : null,
        boundarySensitive,
        nearStation,
        primary,
        secondary,
        retroMatch,
        vedicClassMatch: classMatch,
      });
    }
  }

  // --- Gate G1: True Node (current tropical Rahu vs skyfield osculating node) ---
  const nodeDiffs: number[] = [];
  const ketuOppErr: number[] = [];
  for (const fid of fixtureIds) {
    const c = cur.results[fid];
    const s = sky.results[fid];
    if (!c.bodies?.RAHU || s?.rahuTrueNodeTropicalLon == null) continue;
    nodeDiffs.push(degToArcsec(circularDiffDeg(c.bodies.RAHU.tropicalLon, s.rahuTrueNodeTropicalLon)));
    ketuOppErr.push(circularDiffDeg(c.bodies.KETU.tropicalLon, norm360(c.bodies.RAHU.tropicalLon + 180)));
  }
  const nodeStats = stats(nodeDiffs);
  const ketuMaxErr = Math.max(...ketuOppErr);
  const g1Tol = TOLERANCES.trueNode!.value;
  const g1Pass = nodeStats.p95 <= g1Tol && ketuMaxErr <= TOLERANCES.ketuOpposition!.value;

  // --- Gate G2: Lahiri continuity (candidate vs production sweep) ---
  const anchor = sweep.points.find((p: { year: number }) => p.year === 2000)?.ayanamsa as number;
  const residArcsec: number[] = [];
  const detrendInput: Array<{ T: number; residualArcsec: number }> = [];
  let maxResid = 0;
  let maxResidYear = 0;
  for (const p of sweep.points as Array<{ year: number; jd: number; ayanamsa: number }>) {
    const cand = candidateAyanamsaDeg(p.jd, anchor);
    const r = degToArcsec(Math.abs(cand - p.ayanamsa));
    residArcsec.push(r);
    detrendInput.push({ T: (p.jd - 2451545.0) / 36525.0, residualArcsec: degToArcsec(cand - p.ayanamsa) });
    if (r > maxResid) {
      maxResid = r;
      maxResidYear = p.year;
    }
  }
  const g2Stats = stats(residArcsec);
  const detrend = linearDetrend(detrendInput);
  const calibratedMax = Math.max(...detrend.calibratedArcsec.map((x) => Math.abs(x)));
  const g2Tol = TOLERANCES.ayanamsaContinuity!.value;
  const g2RawPass = g2Stats.max <= g2Tol;
  const g2CalibratedPass = calibratedMax <= g2Tol;

  const report = {
    generatedFrom: {
      current: cur.providerVersion,
      skyfield: sky.providerVersion,
      astronomyEngine: ae.providerVersion,
    },
    toleranceRegistryComplete: tolerancesComplete([
      "planetLongitude",
      "moonLongitude",
      "astronomyEngineLongitude",
      "eclipticLatitude",
      "distanceAu",
      "longitudeSpeed",
      "ayanamsaContinuity",
      "trueNode",
      "ketuOpposition",
    ]),
    fixtureCount: fixtureIds.length,
    discrepancyCounts: counts,
    perBodyLongitude: Object.fromEntries(
      Object.entries(perBody).map(([b, v]) => [
        b,
        { curVsSkyArcsec: stats(v.lonDiffArcsec), retrogradeMismatchesNonBoundary: v.retroMismatch },
      ])
    ),
    boundarySensitiveFixtureCount: boundaryFixtures.length,
    gateG1TrueNode: {
      metricArcsec: nodeStats,
      ketuOppositionMaxDeg: ketuMaxErr,
      toleranceArcsec: g1Tol,
      pass: g1Pass,
      method: sky.meta.nodeMethod,
    },
    gateG2Lahiri: {
      anchorJ2000Deg: anchor,
      model: "mean-Chitra ICRC-1955 + IAU2006 p_A, anchored at J2000",
      rawResidualArcsec: g2Stats,
      maxResidualYear: maxResidYear,
      continuityTargetArcsec: g2Tol,
      rawPass: g2RawPass,
      linearCalibratedMaxArcsec: calibratedMax,
      calibratedPass: g2CalibratedPass,
      calibrationSlopeArcsecPerCentury: detrend.b,
    },
    findings,
  };

  writeFileSync(join(REPORTS, "differential-report.json"), JSON.stringify(report, null, 2));

  // console summary
  console.log(`\n=== Card 11.R1 Differential Comparator ===`);
  console.log(`fixtures: ${report.fixtureCount}  boundary-sensitive: ${report.boundarySensitiveFixtureCount}`);
  console.log(`discrepancy counts:`);
  for (const [k, v] of Object.entries(counts)) if (v > 0) console.log(`  ${k}: ${v}`);
  console.log(`per-body current-vs-skyfield longitude (arcsec):`);
  for (const [b, v] of Object.entries(report.perBodyLongitude))
    console.log(`  ${b.padEnd(8)} max=${(v as any).curVsSkyArcsec.max.toFixed(2)}  mean=${(v as any).curVsSkyArcsec.mean.toFixed(2)}  retroMismatch(non-bnd)=${(v as any).retrogradeMismatchesNonBoundary}`);
  console.log(`G1 TrueNode: p95=${nodeStats.p95.toFixed(2)}" max=${nodeStats.max.toFixed(2)}" tol=${g1Tol}"  ketuOppMax=${ketuMaxErr.toExponential(2)}deg  => ${g1Pass ? "PASS" : "REVIEW"}`);
  console.log(`G2 Lahiri: rawMax=${g2Stats.max.toFixed(3)}" @${maxResidYear}  target=${g2Tol}"  rawPass=${g2RawPass}  calibratedMax=${calibratedMax.toFixed(4)}"  calibratedPass=${g2CalibratedPass}`);
}

main();
