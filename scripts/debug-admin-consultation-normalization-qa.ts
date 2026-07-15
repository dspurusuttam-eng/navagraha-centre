/**
 * Claude Admin Console C2B1A — Consultation schema-normalization regression QA (pure).
 * Guards that exactly ONE canonical consultation representation exists:
 *   - the Zod canonical config (defaults + non-defaulting partial merge), and
 *   - a Prisma ConsultationSettings model with no duplicate config columns.
 */
import { readFileSync } from "node:fs";
import {
  consultationConfigSchema,
  consultationConfigPatchSchema,
  defaultConsultationConfig,
} from "@/modules/admin/domain";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function consultationModelBlock(): string {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  const start = schema.indexOf("model ConsultationSettings {");
  assert(start >= 0, "ConsultationSettings model present");
  const end = schema.indexOf("}", start);
  assert(end > start, "ConsultationSettings model closed");
  return schema.slice(start, end + 1);
}

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "N1 Prisma model: single canonical representation (no duplicate config columns)",
    run: () => {
      const block = consultationModelBlock();
      assert(/\bsettingsJson\s+Json\?/.test(block), "settingsJson present");
      assert(/\bsingletonKey\s+String/.test(block), "singletonKey present");
      // Placeholder / duplicate configuration columns must be gone.
      for (const col of ["isEnabled", "hostName", "hostBio", "contactEmail", "contactPhone", "availabilityNote", "bookingInstructions", "packagesJson"]) {
        assert(!new RegExp(`\\b${col}\\b`).test(block), `duplicate column '${col}' must be removed`);
      }
    },
  },
  {
    name: "N2 Exactly one config Json column on the model",
    run: () => {
      const block = consultationModelBlock();
      const jsonCols = (block.match(/\bJson\?/g) ?? []).length;
      assert(jsonCols === 1, `expected exactly 1 Json column, found ${jsonCols}`);
    },
  },
  {
    name: "N3 Canonical defaults deterministic",
    run: () => {
      const a = defaultConsultationConfig();
      const b = defaultConsultationConfig();
      assert(JSON.stringify(a) === JSON.stringify(b), "defaults deterministic");
      assert(a.availabilityStatus === "UNAVAILABLE" && a.isEnabled === false, "default status/enabled");
      assert(a.languages.length === 1 && a.languages[0] === "en" && a.topics.length === 0, "default languages/topics");
      assert(JSON.stringify(consultationConfigSchema.parse({})) === JSON.stringify(a), "schema parse == defaults");
    },
  },
  {
    name: "N4 Partial PATCH does not re-apply defaults (deterministic merge)",
    run: () => {
      const patch = consultationConfigPatchSchema.parse({ availabilityStatus: "LIMITED" });
      // Only the specified key is present — no defaulted languages/topics/isEnabled.
      assert(JSON.stringify(patch) === JSON.stringify({ availabilityStatus: "LIMITED" }), "patch carries only provided keys");
      const current = consultationConfigSchema.parse({
        isEnabled: true,
        availabilityStatus: "AVAILABLE",
        whatsappNumber: "+919876543210",
        languages: ["en", "as", "hi"],
        topics: ["Career", "Marriage"],
      });
      const merged = consultationConfigSchema.parse({ ...current, ...patch });
      assert(merged.availabilityStatus === "LIMITED", "status updated");
      assert(merged.whatsappNumber === "+919876543210" && merged.languages.length === 3 && merged.topics.length === 2, "unspecified fields preserved");
      // deterministic
      assert(JSON.stringify(merged) === JSON.stringify(consultationConfigSchema.parse({ ...current, ...patch })), "merge deterministic");
    },
  },
];

function main() {
  console.log("Admin Console C2B1A — consultation schema-normalization QA (pure):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin consultation normalization QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
