// Card 13.2B1 — Chandra Bala factor (pure).
// Formula (contract §7, CHANDRA_BALA_INDEXING_V1):
//   houseFromJanma = ((transitMoonRashi − janmaRashi) mod 12) + 1   // 1..12
// V1 pins the strict form CHANDRA_BALA_STRICT_V1 — no aspect override.
// Missing janma rashi → UNAVAILABLE with `MISSING_JANMA_RASHI` partial flag.
import { CHANDRA_BALA_TABLE } from "@/modules/muhurta/premium/constants";
import { getMuhuratRule } from "@/modules/muhurta/premium/rule-registry";
import type {
  FactorStatus,
  MuhuratEventCategory,
  MuhuratEvidenceToken,
} from "@/modules/muhurta/premium/types";
import { makeEvidenceId, type MuhuratFactorResult } from "@/modules/muhurta/premium/factors/factor-types";

export type ChandraBalaFactorInput = {
  /** 0..11 Aries..Pisces; null when unavailable. */
  janmaRashiIndex: number | null;
  /** 0..11 at query instant. */
  transitMoonRashiIndex: number;
  category: MuhuratEventCategory;
};

export function computeChandraBalaHouse(
  janmaRashi: number,
  moonRashi: number
): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 {
  const j = ((janmaRashi % 12) + 12) % 12;
  const m = ((moonRashi % 12) + 12) % 12;
  return (((m - j + 12) % 12) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export function buildChandraBalaFactor(input: ChandraBalaFactorInput): MuhuratFactorResult {
  const { janmaRashiIndex, transitMoonRashiIndex, category } = input;
  const tokens: MuhuratEvidenceToken[] = [];
  const unavailableReasons: Array<{ code: string; message: string }> = [];
  const partialFlags: string[] = [];

  if (janmaRashiIndex == null || !Number.isInteger(janmaRashiIndex)) {
    getMuhuratRule("CHANDRA_BALA_UNAVAILABLE_V1");
    unavailableReasons.push({
      code: "CHANDRA_BALA_UNAVAILABLE",
      message: "Missing janma rashi — Chandra Bala not computed.",
    });
    partialFlags.push("MISSING_JANMA_RASHI");
    return { factor: "CHANDRA_BALA", category, tokens, netTier: 0, unavailableReasons, partialFlags };
  }
  if (!Number.isInteger(transitMoonRashiIndex) || transitMoonRashiIndex < 0 || transitMoonRashiIndex >= 12) {
    unavailableReasons.push({
      code: "CHANDRA_BALA_UNAVAILABLE",
      message: `Transit Moon rashi index ${transitMoonRashiIndex} out of range 0..11.`,
    });
    partialFlags.push("MISSING_JANMA_RASHI");
    return { factor: "CHANDRA_BALA", category, tokens, netTier: 0, unavailableReasons, partialFlags };
  }

  const house = computeChandraBalaHouse(janmaRashiIndex, transitMoonRashiIndex);
  const entry = CHANDRA_BALA_TABLE.find((e) => e.houseFromJanma === house)!;

  const idxRule = getMuhuratRule("CHANDRA_BALA_INDEXING_V1");
  tokens.push({
    ruleId: "CHANDRA_BALA_INDEXING_V1",
    evidenceId: makeEvidenceId(["CHANDRA_INDEX", janmaRashiIndex, transitMoonRashiIndex, house]),
    factor: "CHANDRA_BALA",
    category,
    tier: 0,
    basis: idxRule.basis,
    status: "NEUTRAL",
    note: `janma=${janmaRashiIndex} moon=${transitMoonRashiIndex} → house ${house} ${entry.classification}`,
  });

  const sRule = getMuhuratRule("CHANDRA_BALA_STRICT_V1");
  const status: FactorStatus =
    entry.classification === "FAVORABLE" ? "SUPPORTIVE"
    : entry.classification === "INAUSPICIOUS" ? "CAUTION"
    : "NEUTRAL";
  tokens.push({
    ruleId: "CHANDRA_BALA_STRICT_V1",
    evidenceId: makeEvidenceId(["CHANDRA_STRICT", house, entry.classification, entry.tier]),
    factor: "CHANDRA_BALA",
    category,
    tier: entry.tier,
    basis: sRule.basis,
    status,
    note: `house ${house} ${entry.classification} tier=${entry.tier} (strict V1 — no aspect override)`,
  });

  const netTier = tokens.reduce((acc, t) => acc + t.tier, 0);
  return { factor: "CHANDRA_BALA", category, tokens, netTier, unavailableReasons, partialFlags };
}
