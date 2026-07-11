// Card 10.2 — Tara / Dina (max 3; bidirectional inclusive count, residue mod 9).
// Internally uses half-point units (integers) so there is no floating drift;
// the only fractional value is the exact 1.5 per auspicious direction.

import {
  NAKSHATRA_COUNT,
  TARA_AUSPICIOUS_RESIDUES,
  TARA_NAMES,
} from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function taraCount(fromNakshatra: number, toNakshatra: number): number {
  return (((toNakshatra - fromNakshatra) % NAKSHATRA_COUNT) + NAKSHATRA_COUNT) %
    NAKSHATRA_COUNT + 1;
}

export function computeTara(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("TARA_BIDIRECTIONAL_RESIDUE");
  const base = {
    koota: "TARA" as const,
    maximumScore: 3,
    ruleId: rule.ruleId,
    calculationReference: "card10:tara-residues",
    directionality: "symmetric" as const, // final total is symmetric; detail records both directions
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

  const countAToB = taraCount(personA.nakshatraIndex, personB.nakshatraIndex);
  const countBToA = taraCount(personB.nakshatraIndex, personA.nakshatraIndex);
  const residueAToB = countAToB % 9;
  const residueBToA = countBToA % 9;
  // Integer half-units: 3 units per auspicious direction; /2 at the end.
  const halfUnits =
    (TARA_AUSPICIOUS_RESIDUES.has(residueAToB) ? 3 : 0) +
    (TARA_AUSPICIOUS_RESIDUES.has(residueBToA) ? 3 : 0);
  const rawScore = halfUnits / 2;

  return {
    ...base,
    rawScore,
    inputFactors: {
      countAToB,
      countBToA,
      taraAToB: TARA_NAMES[(countAToB - 1) % 9],
      taraBToA: TARA_NAMES[(countBToA - 1) % 9],
    },
    tableEntry: `residues ${residueAToB}/${residueBToA} -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
