// Card 10.2 — Yoni (max 4; symbolic animal categories with pinned symmetric
// matrix). No sexual, fertility, consent or personality inference.

import {
  YONI_BY_NAKSHATRA,
  YONI_MATRIX,
  YONI_ORDER,
} from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function computeYoni(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("YONI_ANIMAL_MATRIX");
  const base = {
    koota: "YONI" as const,
    maximumScore: 4,
    ruleId: rule.ruleId,
    calculationReference: "card10:yoni-matrix",
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

  const animalA = YONI_BY_NAKSHATRA[personA.nakshatraIndex];
  const animalB = YONI_BY_NAKSHATRA[personB.nakshatraIndex];
  const rawScore =
    YONI_MATRIX[YONI_ORDER.indexOf(animalA)][YONI_ORDER.indexOf(animalB)];

  return {
    ...base,
    rawScore,
    inputFactors: { yoniA: animalA, yoniB: animalB },
    tableEntry: `${animalA} x ${animalB} -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
