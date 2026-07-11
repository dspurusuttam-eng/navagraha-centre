// Card 10.2 — Varna (max 1; DIRECTIONAL: requires explicit calculation roles).
// Symbolic Koota categories by sign element only — never real caste; no
// superiority/inferiority wording.

import {
  VARNA_BY_SIGN,
  VARNA_RANK,
} from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

export function computeVarna(
  personA: MatchPersonContext,
  personB: MatchPersonContext
): KootaComponentResult {
  const rule = getMatchRule("VARNA_DIRECTIONAL_RANK");
  const base = {
    koota: "VARNA" as const,
    maximumScore: 1,
    ruleId: rule.ruleId,
    calculationReference: "card10:varna-table",
    directionality: "directional" as const,
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

  const roleA = personA.calculationRole;
  const roleB = personB.calculationRole;
  const rolesValid =
    roleA !== null && roleB !== null && roleA !== roleB;

  if (!rolesValid) {
    return {
      ...base,
      rawScore: null,
      inputFactors: {
        varnaA: VARNA_BY_SIGN[personA.moonSignIndex],
        varnaB: VARNA_BY_SIGN[personB.moonSignIndex],
      },
      tableEntry: "ROLE_REQUIRED",
      status: "unavailable",
      unavailableReason:
        "ROLE_REQUIRED: Varna is directional and needs distinct explicit bride_role/groom_role calculation roles (never inferred from identity).",
    };
  }

  const groom = roleA === "groom_role" ? personA : personB;
  const bride = roleA === "groom_role" ? personB : personA;
  const groomVarna = VARNA_BY_SIGN[groom.moonSignIndex!];
  const brideVarna = VARNA_BY_SIGN[bride.moonSignIndex!];
  const rawScore = VARNA_RANK[groomVarna] >= VARNA_RANK[brideVarna] ? 1 : 0;

  return {
    ...base,
    rawScore,
    inputFactors: {
      groomRoleVarna: groomVarna,
      brideRoleVarna: brideVarna,
      groomRoleRank: VARNA_RANK[groomVarna],
      brideRoleRank: VARNA_RANK[brideVarna],
    },
    tableEntry: `${groomVarna}(groom_role) vs ${brideVarna}(bride_role) -> ${rawScore}`,
    status: "available",
    unavailableReason: null,
  };
}
