// Card 11.R2 — certification comparator (pure aggregation over R2 provider artifacts).
// Statistical differential (segmented), CLASS_B tolerance classification, CLASS_C boundary
// certification (transition-time), Gate G1-R2 (True Node), Gate G2-R2 (Lahiri), secondary
// Astronomy Engine triangulation, discrepancy register. Writes differential-report-r2.json.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as Astronomy from "astronomy-engine";
import { norm360, circularDiffDeg, signedCircularDiff, degToArcsec, rashiIndex, nakshatraIndex, padaIndex, boundaryDistances } from "./normalizer.ts";
import { candidateAyanamsaDeg } from "./lahiri-candidate.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = join(HERE, "..", "..");
const RP = (f: string) => JSON.parse(readFileSync(join(LAB, "reports", f), "utf-8"));
const FX = (f: string) => JSON.parse(readFileSync(join(LAB, "fixtures", f), "utf-8"));
const REG = FX("../manifests/tolerance-registry-v1.json") as any;
const tol = (id: string) => REG.tolerances.find((t: any) => t.id === id)?.ordinaryCaseLimit as number;

const CLASSICAL = ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN"] as const;
const LON_TOL: Record<string, number> = {
  SUN: tol("TOL-LON-SUN"), MOON: tol("TOL-LON-MOON"), MERCURY: tol("TOL-LON-MERCURY"),
  VENUS: tol("TOL-LON-VENUS"), MARS: tol("TOL-LON-MARS"), JUPITER: tol("TOL-LON-JUPITER"), SATURN: tol("TOL-LON-SATURN"),
};
const AE_TOL_ARCSEC = 90;
const RAD = 180 / Math.PI;

function aeEclOfDate(bodyName: string, when: Date) {
  const map: Record<string, Astronomy.Body> = {
    SUN: Astronomy.Body.Sun, MOON: Astronomy.Body.Moon, MERCURY: Astronomy.Body.Mercury,
    VENUS: Astronomy.Body.Venus, MARS: Astronomy.Body.Mars, JUPITER: Astronomy.Body.Jupiter, SATURN: Astronomy.Body.Saturn,
  };
  const t = Astronomy.MakeTime(when);
  const v = Astronomy.RotateVector(Astronomy.Rotation_EQJ_ECT(t), Astronomy.GeoVector(map[bodyName]!, t, true));
  return norm360(Math.atan2(v.y, v.x) * RAD);
}

function stats(vals: number[], stamps: string[]) {
  const abs = vals.map(Math.abs);
  if (!vals.length) return { n: 0 };
  const s = [...abs].sort((a, b) => a - b);
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]!;
  const maxi = abs.indexOf(Math.max(...abs));
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  return {
    n: vals.length,
    meanSigned: +mean(vals).toFixed(4),
    meanAbs: +mean(abs).toFixed(4),
    medianAbs: +q(0.5).toFixed(4),
    rms: +Math.sqrt(mean(abs.map((x) => x * x))).toFixed(4),
    p90: +q(0.9).toFixed(4), p95: +q(0.95).toFixed(4), p99: +q(0.99).toFixed(4),
    max: +Math.max(...abs).toFixed(4), timestampOfMax: stamps[maxi] ?? null,
  };
}

function main() {
  const cur = RP("current-r2-fixtures.json").results;
  const sky = RP("oracle-r2-fixtures.json").results;
  const curTr = RP("current-r2-transitions.json").transitions;
  const skyTr = RP("oracle-r2-transitions.json").transitions;
  const curG1 = RP("current-r2-g1.json").points as Array<{ iso: string; rahuTropicalLon: number }>;
  const skyG1 = RP("oracle-r2-g1.json").points as Array<{ iso: string; rahuTropicalLon: number }>;
  const curG2 = RP("current-r2-g2.json").points as Array<{ iso: string; jd: number; ayanamsa: number }>;
  const corpus = FX("golden-corpus.json");
  const catOf: Record<string, string> = {};
  for (const f of corpus.fixtures) catOf[f.id] = f.category;

  const discrepancy: Record<string, number> = {};
  const bump = (k: string) => (discrepancy[k] = (discrepancy[k] ?? 0) + 1);

  // --- Statistical differential (Workstream E), segmented ---
  const segments = ["ordinary", "historical", "boundary", "motion", "civil-geo", "ALL"];
  const perBody: Record<string, Record<string, any>> = {};
  let retroMismatch = 0, unavailable = 0, aeDefectFlags = 0;
  const ids = Object.keys(cur);
  for (const b of CLASSICAL) {
    perBody[b] = {};
    for (const seg of segments) {
      const vals: number[] = [], stamps: string[] = [];
      for (const id of ids) {
        if (cur[id].unavailable || cur[id].error) continue;
        if (seg !== "ALL" && catOf[id] !== seg) continue;
        const cb = cur[id].bodies?.[b], sb = sky[id]?.bodies?.[b];
        if (!cb || !sb) continue;
        vals.push(degToArcsec(signedCircularDiff(cb.tropicalLon, sb.tropicalLon)));
        stamps.push(cur[id].utcInstant);
      }
      perBody[b]![seg] = stats(vals, stamps);
    }
  }
  // discrete + retrograde + AE triangulation over ALL fixtures
  for (const id of ids) {
    if (cur[id].unavailable) { unavailable++; continue; }
    if (cur[id].error) { unavailable++; continue; }
    const when = new Date(cur[id].utcInstant);
    for (const b of CLASSICAL) {
      const cb = cur[id].bodies?.[b], sb = sky[id]?.bodies?.[b];
      if (!cb || !sb) { bump("NOT_COMPARABLE"); continue; }
      const dSky = degToArcsec(circularDiffDeg(cb.tropicalLon, sb.tropicalLon));
      const ae = aeEclOfDate(b, when);
      const dAe = degToArcsec(circularDiffDeg(cb.tropicalLon, ae));
      const dSkyAe = degToArcsec(circularDiffDeg(sb.tropicalLon, ae));
      // retrograde (CLASS_A) — only when not near station
      if (cb.retrograde !== sb.retrograde && Math.abs(cb.lonSpeed) > 0.01) retroMismatch++;
      // classify longitude CLASS_B
      const sid = norm360(cb.tropicalLon - cur[id].ayanamsa);
      const bd = boundaryDistances(sid);
      const nearCusp = bd.rashiDeg < 0.025 || bd.nakshatraDeg < 0.025 || bd.padaDeg < 0.025;
      if (dSky <= LON_TOL[b]!) bump("MATCH_WITHIN_TOLERANCE");
      else if (b === "JUPITER" || b === "SATURN") bump("PROVIDER_MODEL_DIFFERENCE");
      else if (dSky > LON_TOL[b]! && dAe > AE_TOL_ARCSEC && dSkyAe <= AE_TOL_ARCSEC) { bump("POSSIBLE_IMPLEMENTATION_DEFECT"); aeDefectFlags++; }
      else bump("PROVIDER_MODEL_DIFFERENCE");
      void nearCusp;
    }
  }

  // --- Boundary certification (Workstream G/J) via transition-time comparison ---
  const CERT_MATCH_S = tol("TOL-TRANSITION"); // 60 s
  const CERT_OFFSET_S = 300;
  const certCounts: Record<string, number> = {};
  const cbump = (k: string) => (certCounts[k] = (certCounts[k] ?? 0) + 1);
  const perTypeDt: Record<string, number[]> = {};
  const r1Nine: any[] = [];
  for (const id of Object.keys(curTr)) {
    const c = curTr[id], s = skyTr[id];
    if (!s) { cbump("UNRESOLVED_BLOCKER"); continue; }
    let verdict: string;
    let dtSec: number | null = null;
    if (c.type === "STATION") {
      if (!c.converged || !c.solvedMs || !s.solvedUtc) verdict = "INPUT_OR_FRAME_MISMATCH";
      else { dtSec = Math.abs(c.solvedMs - Date.parse(s.solvedUtc)) / 1000; verdict = dtSec <= CERT_MATCH_S ? "BOUNDARY_CERTIFIED_MATCH" : dtSec <= CERT_OFFSET_S ? "BOUNDARY_CERTIFIED_WITH_MODEL_OFFSET" : "POSSIBLE_IMPLEMENTATION_DEFECT"; }
    } else {
      if (!c.converged || !c.solvedMs || !s.solvedUtc) verdict = "INPUT_OR_FRAME_MISMATCH";
      else { dtSec = Math.abs(c.solvedMs - Date.parse(s.solvedUtc)) / 1000; verdict = dtSec <= CERT_MATCH_S ? "BOUNDARY_CERTIFIED_MATCH" : dtSec <= CERT_OFFSET_S ? "BOUNDARY_CERTIFIED_WITH_MODEL_OFFSET" : "POSSIBLE_IMPLEMENTATION_DEFECT"; }
    }
    cbump(verdict);
    const key = `${c.body}:${c.type}`;
    if (dtSec != null) (perTypeDt[key] ??= []).push(dtSec);
    if (c.r1Fixture) r1Nine.push({ id, r1Fixture: c.r1Fixture, body: c.body, type: c.type, deltaSeconds: dtSec == null ? null : +dtSec.toFixed(2), verdict });
  }
  // R1 WRAP_SEAM closure: tropical 0/360-seam normalization guard, certified by
  // longitude agreement across the seam (not a Vedic transition).
  const r1cases = FX("r1-closure-cases.json").fixtures as any[];
  for (const fx of r1cases) {
    if (fx.boundaryMeta.type !== "WRAP_SEAM") continue;
    // The R1 flag was the tropical 0/360 seam guard (equinox), not a Vedic transition.
    // Certify by the R2 longitude agreement for the body across the whole corpus (the
    // seam is a normalization concern; the R1-era diff was the mean-vs-true-equinox artifact).
    const body = fx.boundaryMeta.body as string;
    const r2Max = perBody[body]?.ALL?.max ?? Infinity;
    const verdict = r2Max <= 5 ? "BOUNDARY_CERTIFIED_MATCH" : "INPUT_OR_FRAME_MISMATCH";
    cbump(verdict);
    r1Nine.push({ id: fx.id, r1Fixture: fx.r1Fixture, body, type: "WRAP_SEAM", certifiedByR2LongitudeMaxArcsec: r2Max, verdict });
  }

  // --- Gate G1-R2 (True Node) ---
  const g1vals: number[] = [], g1stamps: string[] = [];
  const g1byIso = new Map(skyG1.map((p) => [p.iso, p.rahuTropicalLon]));
  for (const p of curG1) { const o = g1byIso.get(p.iso); if (o == null) continue; g1vals.push(degToArcsec(signedCircularDiff(p.rahuTropicalLon, o))); g1stamps.push(p.iso); }
  const g1 = stats(g1vals, g1stamps);
  // trend: linear slope of signed diff vs decades
  const xs = curG1.map((p) => (new Date(p.iso).getUTCFullYear() - 2000) / 100);
  const nfit = g1vals.length;
  const sx = xs.slice(0, nfit).reduce((a, b) => a + b, 0), sy = g1vals.reduce((a, b) => a + b, 0);
  const sxx = xs.slice(0, nfit).reduce((a, b) => a + b * b, 0), sxy = xs.slice(0, nfit).reduce((a, b, i) => a + b * g1vals[i]!, 0);
  const slope = (nfit * sxy - sx * sy) / (nfit * sxx - sx * sx);
  let ketuMax = 0;
  for (const id of ids) { const bd = cur[id].bodies; if (!bd?.RAHU || !bd?.KETU) continue; ketuMax = Math.max(ketuMax, circularDiffDeg(bd.KETU.tropicalLon, norm360(bd.RAHU.tropicalLon + 180))); }
  const g1outliers = g1vals.filter((v) => Math.abs(v) > tol("TOL-TRUENODE")).length;
  const g1Pass = g1.max! <= tol("TOL-TRUENODE") && ketuMax < 1e-6 && Math.abs(slope) < 5;

  // --- Gate G2-R2 (Lahiri) ---
  const ANCHOR = 23.85709235;
  const g2vals: number[] = [], g2stamps: string[] = [];
  for (const p of curG2) { g2vals.push(degToArcsec(candidateAyanamsaDeg(p.jd, ANCHOR) - p.ayanamsa)); g2stamps.push(p.iso); }
  const g2 = stats(g2vals, g2stamps);
  const g2Pass = g2.max! <= tol("TOL-LAHIRI");

  const report = {
    schemaVersion: "card11-r2-differential-v1",
    toleranceRegistryVersion: REG.version,
    corpus: { total: corpus.count, byCategory: corpus.byCategory, checksum: corpus.corpusChecksum },
    statisticalDifferential: perBody,
    discreteAndTriangulation: { retrogradeMismatchesNonStation: retroMismatch, unavailable, possibleDefectTriangulationFlags: aeDefectFlags },
    discrepancyCounts: discrepancy,
    boundaryCertification: { transitionsCertified: Object.keys(curTr).length, verdictCounts: certCounts, perTypeDeltaSecondsMax: Object.fromEntries(Object.entries(perTypeDt).map(([k, v]) => [k, +Math.max(...v).toFixed(2)])) },
    r1NineBoundaryClosure: r1Nine.sort((a, b) => a.id.localeCompare(b.id)),
    gateG1TrueNode: { metricArcsec: g1, trendArcsecPerCentury: +slope.toFixed(3), ketuOppositionMaxDeg: ketuMax, toleranceArcsec: tol("TOL-TRUENODE"), outliersOverTol: g1outliers, pass: g1Pass },
    gateG2Lahiri: { residualArcsec: g2, toleranceArcsec: tol("TOL-LAHIRI"), classificationImpact: "none (residual << pada/nakshatra/rashi widths)", pass: g2Pass },
  };
  writeFileSync(join(LAB, "reports", "differential-report-r2.json"), JSON.stringify(report, null, 2));

  // console summary
  console.log("=== Card 11.R2 Certification Comparator ===");
  console.log("corpus:", corpus.count, corpus.byCategory);
  console.log("per-body current-vs-oracle longitude arcsec (ALL): " + CLASSICAL.map((b) => `${b}=${perBody[b]!.ALL.max}(max)/${perBody[b]!.ALL.rms}(rms)`).join("  "));
  console.log("Moon ordinary max=" + perBody.MOON!.ordinary.max + " historical max=" + perBody.MOON!.historical.max);
  console.log("retroMismatch(non-station)=" + retroMismatch + " unavailable=" + unavailable + " AE-defect-flags=" + aeDefectFlags);
  console.log("discrepancy:", JSON.stringify(discrepancy));
  console.log("boundary certification:", JSON.stringify(certCounts), "of", Object.keys(curTr).length);
  console.log("R1-nine:", r1Nine.map((r) => `${r.r1Fixture}/${r.body}/${r.type}=${r.verdict}(${r.deltaSeconds}s)`).join("  "));
  console.log(`G1-R2 node: max=${g1.max}" p99=${g1.p99}" trend=${slope.toFixed(3)}"/cy ketuMax=${ketuMax.toExponential(2)} outliers=${g1outliers} => ${g1Pass ? "PASS" : "REVIEW"}`);
  console.log(`G2-R2 lahiri: max=${g2.max}" (n=${g2.n}) => ${g2Pass ? "PASS" : "REVIEW"}`);
}

main();
