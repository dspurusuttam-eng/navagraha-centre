// Card 11.R2 — certification-artifact tests. Isolated; no production import.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = join(HERE, "..", "..");
const J = (p: string) => JSON.parse(readFileSync(join(LAB, p), "utf-8"));
let pass = 0, fail = 0;
const ok = (n: string, c: boolean, x = "") => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n} ${x}`); } };

// accuracy contract: 4 classes + source hierarchy
const ac = J("manifests/accuracy-contract-v1.json");
ok("accuracy contract has CLASS A/B/C/D", ["CLASS_A_EXACT_DISCRETE_EQUALITY", "CLASS_B_NUMERICAL_TOLERANCE", "CLASS_C_BOUNDARY_CERTIFICATION", "CLASS_D_CONTROLLED_UNAVAILABLE"].every((k) => k in ac.accuracyClasses));
ok("source hierarchy present", !!ac.sourceHierarchy.astronomicalNumericalOracle && !!ac.sourceHierarchy.vedicDiscreteAuthority);
ok("no-average / no-majority rule", ac.sourceHierarchy.rules.join("|").includes("never average"));

// tolerance registry: all 15 quantities
const reg = J("manifests/tolerance-registry-v1.json");
const ids = reg.tolerances.map((t: any) => t.id);
const required = ["TOL-LON-SUN", "TOL-LON-MOON", "TOL-LON-MERCURY", "TOL-LON-VENUS", "TOL-LON-MARS", "TOL-LON-JUPITER", "TOL-LON-SATURN", "TOL-ECL-LAT", "TOL-DIST", "TOL-SPEED", "TOL-STATION", "TOL-TRUENODE", "TOL-LAHIRI", "TOL-TRANSITION", "TOL-DISCRETE"];
ok("tolerance registry defines all 15 quantities", required.every((r) => ids.includes(r)), required.filter((r) => !ids.includes(r)).join(","));
ok("every tolerance has justification + version", reg.tolerances.every((t: any) => t.justification && t.version));
ok("R2 observed distribution recorded", !!reg.r2ObservedMaxArcsec);

// guard bands + provenance
const gb = J("manifests/boundary-guard-bands-v1.json");
ok("guard bands >= AE accuracy (0.025 deg)", gb.guardBands.rashiDeg >= 0.025);
const prov = J("manifests/provenance-contract-v1.json");
ok("provenance has kernel checksum + registry/corpus checksums", !!prov.oracle.kernelSha256 && !!prov.checksums.toleranceRegistry && !!prov.checksums.fixtureCorpus);
ok("provenance node convention = TRUE_NODE unchanged", prov.conventions.nodeConvention.includes("SE_TRUE_NODE"));

// golden corpus: >=360 + minimums + fields + unique ids
const corpus = J("fixtures/golden-corpus.json");
const by = corpus.byCategory;
ok("corpus >= 360 fixtures", corpus.count >= 360, `${corpus.count}`);
ok("ordinary >= 100", by.ordinary >= 100, `${by.ordinary}`);
ok("historical >= 50", by.historical >= 50, `${by.historical}`);
ok("boundary >= 120", by.boundary >= 120, `${by.boundary}`);
ok("motion >= 40", by.motion >= 40, `${by.motion}`);
ok("civil-geo >= 50", by["civil-geo"] >= 50, `${by["civil-geo"]}`);
const fids = corpus.fixtures.map((f: any) => f.id);
ok("unique fixture ids", new Set(fids).size === fids.length);
ok("fixtures have required fields", corpus.fixtures.every((f: any) => f.id && f.utcInstant && f.expectedClass && f.checksum && f.creationMethod && Array.isArray(f.requestedBodies)));
ok("corpus checksum present", !!corpus.corpusChecksum);

// differential report R2: all match, boundary certified, gates pass
const d = J("reports/differential-report-r2.json");
ok("all longitudes MATCH_WITHIN_TOLERANCE, no defect/mismatch", d.discrepancyCounts.MATCH_WITHIN_TOLERANCE > 0 && !d.discrepancyCounts.POSSIBLE_IMPLEMENTATION_DEFECT);
ok("retrograde mismatches (non-station) = 0", d.discreteAndTriangulation.retrogradeMismatchesNonStation === 0);
ok("boundary certification: only MATCH verdicts", Object.keys(d.boundaryCertification.verdictCounts).every((k) => k === "BOUNDARY_CERTIFIED_MATCH"), JSON.stringify(d.boundaryCertification.verdictCounts));
ok("R1 nine all certified match", d.r1NineBoundaryClosure.length === 9 && d.r1NineBoundaryClosure.every((r: any) => r.verdict === "BOUNDARY_CERTIFIED_MATCH"));
ok("Gate G1-R2 pass", d.gateG1TrueNode.pass && d.gateG1TrueNode.ketuOppositionMaxDeg < 1e-6);
ok("Gate G2-R2 pass (<=1 arcsec)", d.gateG2Lahiri.pass && d.gateG2Lahiri.residualArcsec.max <= 1);
ok("Moon stats reported separately from planets", !!d.statisticalDifferential.MOON && !!d.statisticalDifferential.MOON.ordinary && !!d.statisticalDifferential.MOON.historical);

console.log(`\nR2 lab tests: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
