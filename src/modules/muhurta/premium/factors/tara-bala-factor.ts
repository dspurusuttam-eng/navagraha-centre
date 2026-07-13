// Card 13.2B1 — Tara Bala factor (pure).
// Formula (contract §6, TARA_BALA_INDEXING_V1):
//   count     = ((moonNakshatra − janmaNakshatra) mod 27) + 1   // 1..27
//   taraIndex = ((count − 1) mod 9) + 1                          // 1..9
// Labels are CLASSICAL; Vadha −2 weighting is PRODUCT_NORMALIZED.
// Missing janma nakshatra → UNAVAILABLE with `MISSING_JANMA_NAKSHATRA` partial flag.
import { TARA_TABLE } from "@/modules/muhurta/premium/constants";
import { getMuhuratRule } from "@/modules/muhurta/premium/rule-registry";
import type {
  FactorStatus,
  MuhuratEventCategory,
  MuhuratEvidenceToken,
} from "@/modules/muhurta/premium/types";
import { makeEvidenceId, type MuhuratFactorResult } from "@/modules/muhurta/premium/factors/factor-types";

export type TaraBalaFactorInput = {
  /** 0..26 Ashwini..Revati; null when unavailable. */
  janmaNakshatraIndex: number | null;
  /** 0..26 at query instant. */
  transitMoonNakshatraIndex: number;
  category: MuhuratEventCategory;
};

export function computeTaraIndex(
  janmaNak: number,
  moonNak: number
): { taraIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; count: number } {
  const j = ((janmaNak % 27) + 27) % 27;
  const m = ((moonNak % 27) + 27) % 27;
  const count = ((m - j + 27) % 27) + 1; // 1..27
  const taraIndex = (((count - 1) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  return { taraIndex, count };
}

export function buildTaraBalaFactor(input: TaraBalaFactorInput): MuhuratFactorResult {
  const { janmaNakshatraIndex, transitMoonNakshatraIndex, category } = input;
  const tokens: MuhuratEvidenceToken[] = [];
  const unavailableReasons: Array<{ code: string; message: string }> = [];
  const partialFlags: string[] = [];

  if (janmaNakshatraIndex == null || !Number.isInteger(janmaNakshatraIndex)) {
    getMuhuratRule("TARA_BALA_UNAVAILABLE_V1"); // registry sanity (throws on unknown)
    unavailableReasons.push({
      code: "TARA_BALA_UNAVAILABLE",
      message: "Missing janma nakshatra — Tara Bala not computed.",
    });
    partialFlags.push("MISSING_JANMA_NAKSHATRA");
    return {
      factor: "TARA_BALA",
      category,
      tokens,
      netTier: 0,
      unavailableReasons,
      partialFlags,
    };
  }
  if (!Number.isInteger(transitMoonNakshatraIndex) || transitMoonNakshatraIndex < 0 || transitMoonNakshatraIndex >= 27) {
    unavailableReasons.push({
      code: "TARA_BALA_UNAVAILABLE",
      message: `Transit Moon nakshatra index ${transitMoonNakshatraIndex} out of range 0..26.`,
    });
    partialFlags.push("MISSING_JANMA_NAKSHATRA");
    return { factor: "TARA_BALA", category, tokens, netTier: 0, unavailableReasons, partialFlags };
  }

  const { taraIndex, count } = computeTaraIndex(janmaNakshatraIndex, transitMoonNakshatraIndex);
  const entry = TARA_TABLE.find((e) => e.taraIndex === taraIndex)!;

  // Emit the indexing token (classical), then the weighted tier token (product-normalized weighting).
  const idxRule = getMuhuratRule("TARA_BALA_INDEXING_V1");
  tokens.push({
    ruleId: "TARA_BALA_INDEXING_V1",
    evidenceId: makeEvidenceId(["TARA_BALA_INDEX", janmaNakshatraIndex, transitMoonNakshatraIndex, taraIndex]),
    factor: "TARA_BALA",
    category,
    tier: 0,
    basis: idxRule.basis,
    status: "NEUTRAL",
    note: `count=${count} → taraIndex=${taraIndex} (${entry.name})`,
  });

  const wRule = getMuhuratRule("TARA_BALA_WEIGHTING_V1");
  const status: FactorStatus = entry.auspicious ? "SUPPORTIVE" : "CAUTION";
  tokens.push({
    ruleId: "TARA_BALA_WEIGHTING_V1",
    evidenceId: makeEvidenceId(["TARA_BALA_WEIGHT", taraIndex, entry.name, entry.tier]),
    factor: "TARA_BALA",
    category,
    tier: entry.tier,
    basis: wRule.basis,
    status,
    note: `${entry.name} tier=${entry.tier} (${entry.auspicious ? "auspicious" : "inauspicious"})`,
  });

  const netTier = tokens.reduce((acc, t) => acc + t.tier, 0);
  return { factor: "TARA_BALA", category, tokens, netTier, unavailableReasons, partialFlags };
}
