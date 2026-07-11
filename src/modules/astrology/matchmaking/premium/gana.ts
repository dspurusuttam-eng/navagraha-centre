// Card 10.2 — Gana (max 6; corrected classical 9/9/9 mapping + pinned
// symmetric matrix). Symbolic traditional groups only — never used to label a
// person as good, bad, divine or otherwise.

import {
  GANA_BY_NAKSHATRA,
  GANA_MATRIX,
} from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function computeGana(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("GANA_GROUP_MATRIX");
  const base = {
    koota: "GANA" as const,
    maximumScore: 6,
    ruleId: rule.ruleId,
    calculationReference: "card10:gana-matrix",
    directionality: "symmetric" as const,
    exceptionApplicable: false,
    exceptionResults: [],
  };

  if (personA.nakshatraIndex === null || personB.nakshatraIndex === null) {
    return {
      ...base,
      rawScore: null,
      inputFactors: {},
      tableEntry: "unavailable",
      status: "unavailable",
      unavailableReason: "Nakshatra is unavailable for one or both charts.",
    };
  }

  const ganaA = GANA_BY_NAKSHATRA[personA.nakshatraIndex];
  const ganaB = GANA_BY_NAKSHATRA[personB.nakshatraIndex];
  const rawScore = GANA_MATRIX[ganaA][ganaB];

  return {
    ...base,
    rawScore,
    inputFactors: { ganaA, ganaB },
    tableEntry: `${ganaA} x ${ganaB} -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
