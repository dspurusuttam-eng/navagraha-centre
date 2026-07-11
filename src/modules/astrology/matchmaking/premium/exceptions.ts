// Card 10.2 — Bhakoot / Nadi exception overlays.
//
// Exceptions NEVER change raw component scores or the raw total. They are
// evaluated only when the relevant dosha is present (raw score 0), and each
// applicable exception is emitted as a registered, provenance-carrying entry.
// All applicable exceptions are recorded (deterministic; none suppressed).

import {
  friendshipView,
  SIGN_LORDS,
} from "@/modules/astrology/matchmaking/premium/constants";
import { getMatchRule } from "@/modules/astrology/matchmaking/premium/rule-registry";
import type {
  ExceptionResult,
  KootaComponentResult,
  MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium/types";

function makeException(input: {
  exceptionId: string;
  koota: "BHAKOOT" | "NADI";
  applicable: boolean;
  detail: string;
}): ExceptionResult {
  const rule = getMatchRule(input.exceptionId);

  return {
    exceptionId: input.exceptionId,
    koota: input.koota,
    applicable: input.applicable,
    detail: input.detail,
    ruleId: rule.ruleId,
    changesRawScore: false,
  };
}

export function evaluateBhakootExceptions(
  personA: MatchPersonContext,
  personB: MatchPersonContext,
  bhakoot: KootaComponentResult
): ExceptionResult[] {
  if (
    bhakoot.status !== "available" ||
    bhakoot.rawScore !== 0 ||
    personA.moonSignIndex === null ||
    personB.moonSignIndex === null
  ) {
    return [];
  }

  const lordA = SIGN_LORDS[personA.moonSignIndex];
  const lordB = SIGN_LORDS[personB.moonSignIndex];
  const sameLord = lordA === lordB;
  const mutualFriends =
    !sameLord &&
    friendshipView(lordA, lordB) === "friend" &&
    friendshipView(lordB, lordA) === "friend";
  const results: ExceptionResult[] = [];

  if (sameLord) {
    results.push(
      makeException({
        exceptionId: "EXCEPTION_BHAKOOT_SAME_LORD",
        koota: "BHAKOOT",
        applicable: true,
        detail: `Both Moon signs are ruled by ${lordA}; traditional Bhakoot cancellation is applicable (raw score unchanged).`,
      })
    );
  }

  if (mutualFriends) {
    results.push(
      makeException({
        exceptionId: "EXCEPTION_BHAKOOT_FRIENDLY_LORDS",
        koota: "BHAKOOT",
        applicable: true,
        detail: `Moon-sign lords ${lordA} and ${lordB} are mutual natural friends; traditional Bhakoot cancellation is applicable (raw score unchanged).`,
      })
    );
  }

  return results;
}

export function evaluateNadiExceptions(
  personA: MatchPersonContext,
  personB: MatchPersonContext,
  nadi: KootaComponentResult
): ExceptionResult[] {
  if (
    nadi.status !== "available" ||
    nadi.rawScore !== 0 ||
    personA.nakshatraIndex === null ||
    personB.nakshatraIndex === null ||
    personA.moonSignIndex === null ||
    personB.moonSignIndex === null ||
    personA.padaIndex === null ||
    personB.padaIndex === null
  ) {
    return [];
  }

  const results: ExceptionResult[] = [];
  const sameNakshatra = personA.nakshatraIndex === personB.nakshatraIndex;
  const sameRashi = personA.moonSignIndex === personB.moonSignIndex;
  const lordA = SIGN_LORDS[personA.moonSignIndex];
  const lordB = SIGN_LORDS[personB.moonSignIndex];

  if (sameNakshatra && personA.padaIndex !== personB.padaIndex) {
    results.push(
      makeException({
        exceptionId: "EXCEPTION_NADI_SAME_NAK_DIFF_PADA",
        koota: "NADI",
        applicable: true,
        detail:
          "Both Moons share one nakshatra but occupy different padas; traditional Nadi cancellation is applicable (raw score unchanged).",
      })
    );
  }

  if (sameRashi && !sameNakshatra) {
    results.push(
      makeException({
        exceptionId: "EXCEPTION_NADI_SAME_RASHI_DIFF_NAK",
        koota: "NADI",
        applicable: true,
        detail:
          "Both Moons share one rashi with different nakshatras; traditional Nadi cancellation is applicable (raw score unchanged).",
      })
    );
  }

  if (lordA === lordB) {
    results.push(
      makeException({
        exceptionId: "EXCEPTION_NADI_SIGN_LORD",
        koota: "NADI",
        applicable: true,
        detail: `Both Moon signs are ruled by ${lordA}; the documented sign-lord Nadi cancellation variant is applicable (raw score unchanged).`,
      })
    );
  }

  return results;
}
