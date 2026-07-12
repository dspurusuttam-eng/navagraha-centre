// Card 12.1 — compatibility engine (pure). Symmetric 1-9 matrix; NO percentage; systems separate.
import { COMPATIBILITY_MATRIX_V1 } from "@/modules/numerology/premium/constants";
import type { CompatibilityResult, CompatibilityStatus } from "@/modules/numerology/premium/types";

function inRange(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 9;
}

/**
 * Compare two single-digit numbers (1-9) inside a single system (never mixed).
 * Returns a structured status with evidence IDs; unavailable if inputs are missing/invalid.
 */
export function compareNumbers(system: string, a: number | null, b: number | null): CompatibilityResult {
  if (!inRange(a) || !inRange(b)) {
    return {
      status: "UNAVAILABLE",
      system,
      a: a ?? null,
      b: b ?? null,
      relationship: "UNAVAILABLE",
      evidenceIds: [],
      ruleIds: ["COMPAT_UNAVAILABLE_V1", "COMPAT_SYSTEM_SEPARATE_V1"],
      reason: "One or both inputs are missing or outside 1-9.",
    };
  }
  const relRaw = COMPATIBILITY_MATRIX_V1[a]![b]!;
  const rel: CompatibilityStatus =
    relRaw === "SUPPORTIVE" ? "SUPPORTIVE" : relRaw === "CHALLENGING" ? "CHALLENGING" : "NEUTRAL";
  const evidenceIds = [`COMPAT:${system}:${a}-${b}:${rel}`];
  return {
    status: rel,
    system,
    a,
    b,
    relationship: rel,
    evidenceIds,
    ruleIds: ["COMPAT_MATRIX_SYMMETRIC_V1", "COMPAT_SYSTEM_SEPARATE_V1"],
  };
}
