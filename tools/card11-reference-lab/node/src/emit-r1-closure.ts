// Card 11.R2 — build the explicit R1 nine-boundary-case closure set from R1 artifacts.
// Determines each case's boundary type (SIGN/NAKSHATRA/PADA/WRAP/STATION) from R1 data,
// emitting fixtures/r1-closure-cases.json for R2 transition-time certification.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = join(HERE, "..", "..");
const R = (f: string) => JSON.parse(readFileSync(join(LAB, "reports", f), "utf-8"));

const diff = R("differential-report.json");
const cur = R("current-engine-results.json").results;
const inst = R("resolved-instants.json");

const SIGN = 30, NAK = 360 / 27, PADA = 360 / 108;
const norm = (x: number) => ((x % 360) + 360) % 360;
const dist = (lon: number, span: number) => { const w = norm(lon) % span; return Math.min(w, span - w); };

const nine = diff.findings.filter((f: any) => f.primary?.status === "BOUNDARY_SENSITIVE");
const fixtures = nine.map((f: any, i: number) => {
  const sid = cur[f.fixture]?.bodies?.[f.body]?.siderealLon ?? norm(f.curTropical - (cur[f.fixture]?.ayanamsa ?? 24));
  const dR = dist(sid, SIGN), dN = dist(sid, NAK), dP = dist(sid, PADA);
  const dWrap = Math.min(norm(f.curTropical), 360 - norm(f.curTropical));
  let type = "SIGN", bd = dR;
  if (f.nearStation) { type = "STATION"; bd = 0; }
  else {
    // Vedic discrete boundaries are SIDEREAL. The tropical 0/360 seam guard (dWrap on the
    // TROPICAL longitude) is a numerical-normalization safety flag, not a Vedic transition;
    // it is certified by longitude agreement across the seam (WRAP_SEAM), not a crossing solve.
    const cands: Array<[string, number]> = [["SIGN", dR], ["NAKSHATRA", dN], ["PADA", dP]];
    cands.sort((a, b) => a[1] - b[1]);
    if (dWrap < cands[0]![1] && dWrap < 0.025) { type = "WRAP_SEAM"; bd = dWrap; }
    else { type = cands[0]![0]; bd = cands[0]![1]; }
  }
  return {
    id: `R1CLOSE-${String(i + 1).padStart(2, "0")}`,
    r1Fixture: f.fixture, category: "r1-closure",
    utcInstant: inst[f.fixture]?.utcInstant ?? cur[f.fixture]?.utcInstant,
    latitude: 0, longitude: 0, elevationM: 0,
    requestedBodies: [f.body], expectedClass: "CLASS_C",
    boundaryMeta: { body: f.body, type },
    r1SiderealLon: sid, r1BoundaryDistanceDeg: bd,
    wrapLongitudeDiffArcsec: f.curVsSkyArcsec ?? null,
    creationMethod: "r1-closure-derivation", seed: null, tags: ["r1-nine"],
  };
});

writeFileSync(join(LAB, "fixtures", "r1-closure-cases.json"), JSON.stringify({ schema: "card11-r1-closure-v1", count: fixtures.length, fixtures }, null, 2));
console.log(`r1-closure: ${fixtures.length} cases ->`, fixtures.map((f: any) => `${f.r1Fixture}/${f.boundaryMeta.body}/${f.boundaryMeta.type}(${f.r1BoundaryDistanceDeg.toFixed(4)}deg)`).join(", "));
