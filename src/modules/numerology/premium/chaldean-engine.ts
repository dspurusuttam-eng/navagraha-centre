// Card 12.1 — Chaldean name numerology engine (pure).
// Chaldean V1: no letter maps to 9; 9 appears only as a compound total.
// Master numbers NOT applied in Chaldean V1 (classical Cheiro reduction to single digit).
import { CHALDEAN_TABLE } from "@/modules/numerology/premium/constants";
import { computeNameNumerology } from "@/modules/numerology/premium/name-shared";
import type { NameNumerologyResult } from "@/modules/numerology/premium/types";

export function calculateChaldeanNumerology(name: string | undefined | null): NameNumerologyResult {
  return computeNameNumerology(name, {
    system: "CHALDEAN",
    table: CHALDEAN_TABLE,
    retainMaster: false,
    computeSoulPersonality: false,
    expressionRuleId: "CHALDEAN_EXPRESSION_V1",
    baseRuleIds: ["CHALDEAN_TABLE_V1", "CHALDEAN_NO_9_LETTER_V1"],
  });
}
