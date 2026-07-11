// Card 10.2 — Bhakoot / Rashi (max 7; CORRECTED directional modulo-12 distance).
//
// d(A->B) = ((signB - signA + 12) % 12) + 1, and the mutual pair {d(A->B),
// d(B->A)} classifies the relation. Dosha pairs: 2/12, 5/9, 6/8 -> raw 0; all
// other pairs, INCLUDING same sign (1/1), score 7. The old foundation's
// absolute-difference set (which flagged same-sign as dosha) is not repeated.
// Exception evaluation NEVER changes the raw score (overlay only).

import { BHAKOOT_DOSHA_DISTANCES } from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function signDistance(fromSign: number, toSign: number): number {
  return ((((toSign - fromSign) % 12) + 12) % 12) + 1;
}

export function computeBhakoot(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("BHAKOOT_DISTANCE_PAIRS");
  const base = {
    koota: "BHAKOOT" as const,
    maximumScore: 7,
    ruleId: rule.ruleId,
    calculationReference: "card10:bhakoot-distances",
    directionality: "symmetric" as const,
    exceptionApplicable: false,
    exceptionResults: [],
  };

  if (personA.moonSignIndex === null || personB.moonSignIndex === null) {
    return {
      ...base,
      rawScore: null,
      inputFactors: {},
      tableEntry: "unavailable",
      status: "unavailable",
      unavailableReason: "Moon sign is unavailable for one or both charts.",
    };
  }

  const distanceAToB = signDistance(personA.moonSignIndex, personB.moonSignIndex);
  const distanceBToA = signDistance(personB.moonSignIndex, personA.moonSignIndex);
  const isDosha =
    distanceAToB !== 1 &&
    BHAKOOT_DOSHA_DISTANCES.has(distanceAToB) &&
    BHAKOOT_DOSHA_DISTANCES.has(distanceBToA);
  const rawScore = isDosha ? 0 : 7;

  return {
    ...base,
    rawScore,
    inputFactors: { distanceAToB, distanceBToA },
    tableEntry: `${distanceAToB}/${distanceBToA} -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
