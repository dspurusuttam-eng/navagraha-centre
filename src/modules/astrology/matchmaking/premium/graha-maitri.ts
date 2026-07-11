// Card 10.2 — Graha Maitri (max 5; Moon-sign lords, natural friendship only;
// no temporary friendship, no natal dignity mixing).

import {
  friendshipView,
  grahaMaitriScore,
  SIGN_LORDS,
} from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function computeGrahaMaitri(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("GRAHA_MAITRI_NATURAL_FRIENDSHIP");
  const base = {
    koota: "GRAHA_MAITRI" as const,
    maximumScore: 5,
    ruleId: rule.ruleId,
    calculationReference: "card10:graha-maitri",
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

  const lordA = SIGN_LORDS[personA.moonSignIndex];
  const lordB = SIGN_LORDS[personB.moonSignIndex];
  const rawScore = grahaMaitriScore(lordA, lordB);

  return {
    ...base,
    rawScore,
    inputFactors: {
      lordA,
      lordB,
      viewAOfB: lordA === lordB ? "same" : friendshipView(lordA, lordB),
      viewBOfA: lordA === lordB ? "same" : friendshipView(lordB, lordA),
    },
    tableEntry: `${lordA} x ${lordB} -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
