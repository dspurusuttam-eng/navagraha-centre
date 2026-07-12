// Card 11.R5 — internal versioned provenance emitter (VALIDATION-ONLY).
// Assembles the active calculation configuration into a signed provenance record.
// No secrets; only versions, conventions, and checksums. Writes reports/provenance-emitted.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeProvenance } from "./timezone-provenance.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = join(HERE, "..", "..");
const ROOT = join(LAB, "..", "..");

function sha16(path: string): string | null {
  try { return createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16); } catch { return null; }
}
function readJson(path: string): any { return JSON.parse(readFileSync(path, "utf-8").toString()); }
function gitInfo() {
  try {
    return {
      branch: (process.env.GITHUB_REF_NAME || execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT }).toString().trim()),
      commit: (process.env.GITHUB_SHA || execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim()),
    };
  } catch { return { branch: "unknown", commit: "unknown" }; }
}

function main() {
  const contract = readJson(join(LAB, "manifests", "provenance-contract-v1.json"));
  const appPkgPath = join(ROOT, "package.json");
  const appVersion = existsSync(appPkgPath) ? readJson(appPkgPath).version : "unknown";
  const rt = runtimeProvenance();
  const record = {
    schema: "card11-provenance-emitted-v1",
    emittedAtRuntime: true,
    application: { name: "navagraha-centre", version: appVersion },
    engine: {
      provider: contract.currentEngine.provider,
      swissPackageVersion: contract.currentEngine.swissPackageVersion,
      swissCLibraryVersion: contract.currentEngine.swissCLibraryVersion,
      ephemerisMode: contract.currentEngine.ephemerisMode,
      ayanamsa: contract.conventions.ayanamsaConvention,
      nodeConvention: contract.conventions.nodeConvention,
      referenceFrame: contract.conventions.referenceFrame,
      timeScalePolicy: contract.conventions.timeScalePolicy,
    },
    runtime: { node: rt.node, icu: rt.icu, tzdata: rt.tzdata, cldr: rt.cldr, unicode: rt.unicode },
    oracle: { provider: contract.oracle.provider, kernel: contract.oracle.kernel, kernelSha256: contract.oracle.kernelSha256, kernelRange: contract.oracle.kernelRange },
    checksums: {
      fixtureCorpus: sha16(join(LAB, "fixtures", "golden-corpus.json")),
      toleranceRegistry: sha16(join(LAB, "manifests", "tolerance-registry-v1.json")),
      accuracyContract: sha16(join(LAB, "manifests", "accuracy-contract-v1.json")),
      provenanceContract: sha16(join(LAB, "manifests", "provenance-contract-v1.json")),
    },
    git: gitInfo(),
  };
  writeFileSync(join(LAB, "reports", "provenance-emitted.json"), JSON.stringify(record, null, 2));
  // Fail-closed: provenance MUST identify the active calculation configuration.
  const complete = !!record.engine.swissPackageVersion && !!record.engine.ayanamsa && !!record.oracle.kernelSha256 && !!record.runtime.node && !!record.checksums.fixtureCorpus;
  if (!complete) { console.error("PROVENANCE INCOMPLETE"); process.exit(1); }
  console.log(`provenance emitted: app=${appVersion} swiss=${record.engine.swissPackageVersion}/${record.engine.swissCLibraryVersion} node=${rt.node} icu=${rt.icu} tz=${rt.tzdata} commit=${record.git.commit.slice(0, 12)}`);
}
main();
