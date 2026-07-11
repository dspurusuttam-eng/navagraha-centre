// Card 10.2 — Vashya (max 2; symmetric pinned 5x5 matrix; half-sign splits).

import {
  VASHYA_MATRIX,
  vashyaClassOf,
} from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function computeVashya(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("VASHYA_CLASS_MATRIX");
  const base = {
    koota: "VASHYA" as const,
    maximumScore: 2,
    ruleId: rule.ruleId,
    calculationReference: "card10:vashya-matrix",
    directionality: "symmetric" as const,
    exceptionApplicable: false,
    exceptionResults: [],
  };

  if (
    personA.moonSignIndex === null ||
    personB.moonSignIndex === null ||
    personA.moonDegreeInSign === null ||
    personB.moonDegreeInSign === null
  ) {
    return {
      ...base,
      rawScore: null,
      inputFactors: {},
      tableEntry: "unavailable",
      status: "unavailable",
      unavailableReason: "Moon placement is unavailable for one or both charts.",
    };
  }

  const classA = vashyaClassOf(personA.moonSignIndex, personA.moonDegreeInSign);
  const classB = vashyaClassOf(personB.moonSignIndex, personB.moonDegreeInSign);
  const rawScore = VASHYA_MATRIX[classA][classB];

  return {
    ...base,
    rawScore,
    inputFactors: { vashyaClassA: classA, vashyaClassB: classB },
    tableEntry: `${classA} x ${classB} -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
