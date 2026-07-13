// Card 13.2B1 — Factor engine result contracts (pure, engine-only).
// All factor engines share the same output shape so the ranker can consume them uniformly.
import type {
  EvidenceTier,
  MuhuratEvidenceToken,
  MuhuratEventCategory,
  MuhuratFactorId,
} from "@/modules/muhurta/premium/types";

/**
 * Structured factor result:
 *   - tokens: one or more evidence records (each carries its registered ruleId).
 *   - netTier: sum of token tiers (informational; the ranker uses tokens, not this sum).
 *   - unavailableReasons: structured reasons when a factor could not be computed;
 *     never fabricated, never silently defaulted.
 *   - partialFlags: partial-status markers when an optional input was missing.
 */
export type MuhuratFactorResult = {
  factor: MuhuratFactorId;
  category: MuhuratEventCategory;
  tokens: MuhuratEvidenceToken[];
  netTier: EvidenceTier | number;
  unavailableReasons: Array<{ code: string; message: string }>;
  partialFlags: string[];
};

/** Common convenience for building tokens deterministically. */
export function makeEvidenceId(parts: readonly (string | number)[]): string {
  return `MUHURAT:${parts.join(":")}`;
}
