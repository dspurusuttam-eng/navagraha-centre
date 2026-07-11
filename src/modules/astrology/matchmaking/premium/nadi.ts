// Card 10.2 — Nadi (max 8; CORRECTED classical 3x9 table — not index % 3,
// which the Card 10.1 audit proved diverges from the table, e.g. Rohini).
// Same nadi -> raw 0; different -> 8. Exceptions are overlay-only.
// No fertility, genetic or health claims.

import { NADI_BY_NAKSHATRA } from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function computeNadi(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("NADI_TABLE_GROUPS");
  const base = {
    koota: "NADI" as const,
    maximumScore: 8,
    ruleId: rule.ruleId,
    calculationReference: "card10:nadi-table",
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

  const nadiA = NADI_BY_NAKSHATRA[personA.nakshatraIndex];
  const nadiB = NADI_BY_NAKSHATRA[personB.nakshatraIndex];
  const rawScore = nadiA === nadiB ? 0 : 8;

  return {
    ...base,
    rawScore,
    inputFactors: { nadiA, nadiB },
    tableEntry: `${nadiA} x ${nadiB} -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
