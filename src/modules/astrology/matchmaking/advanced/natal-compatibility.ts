// Card 10A.2 — D1 natal compatibility layer (primary advanced layer).
//
// Per-person 7th-house/lord/dignity/aspects + Venus/Jupiter/Mars/Moon, plus
// mutual Lagna-lord / 7th-lord / Venus relationship + benefic/malefic 7th
// support. Venus = relationship karaka, Jupiter = support factor — both
// NON-GENDERED. Strict anti-double-count vs Card 10 (no Moon-sign friendship,
// no Bhakoot/Nadi/Gana): conditionKeys are all `d1:*`, disjoint from Ashtakoot.

import { friendshipView } from "@/modules/astrology/matchmaking/advanced/constants";
import { makeToken } from "@/modules/astrology/matchmaking/advanced/evidence";
import type { AdvancedChartContext } from "@/modules/astrology/matchmaking/advanced/chart-context";
import type {
  AdvancedEvidenceToken,
  NatalCompatibilityResult,
  NatalPersonFactors,
} from "@/modules/astrology/matchmaking/advanced/types";

function perPersonTokens(
  scope: "personA" | "personB",
  natal: NatalPersonFactors
): AdvancedEvidenceToken[] {
  const tokens: AdvancedEvidenceToken[] = [];

  // 7th lord dignity.
  if (natal.seventhLordDignity === "own" || natal.seventhLordDignity === "exalted") {
    tokens.push(
      makeToken({
        ruleId: "D1_COMPAT_SEVENTH_LORD_DIGNITY",
        sourceLayer: "D1", sourceChart: "D1", personScope: scope,
        category: "seventh_lord_dignity", tier: 1,
        conditionKey: `d1:seventh-lord-dignity:${scope}`,
        calculationReference: "card10a:d1-seventh-lord",
        detail: `7th lord ${natal.seventhLord} is ${natal.seventhLordDignity} in D1.`,
      })
    );
  } else if (natal.seventhLordDignity === "debilitated") {
    tokens.push(
      makeToken({
        ruleId: "D1_COMPAT_SEVENTH_LORD_DIGNITY",
        sourceLayer: "D1", sourceChart: "D1", personScope: scope,
        category: "seventh_lord_dignity", tier: -1,
        conditionKey: `d1:seventh-lord-dignity:${scope}`,
        calculationReference: "card10a:d1-seventh-lord",
        detail: `7th lord ${natal.seventhLord} is debilitated in D1.`,
      })
    );
  }

  // Benefic support / malefic stress on the 7th house.
  if (natal.beneficAspectsSeventh) {
    tokens.push(
      makeToken({
        ruleId: "D1_COMPAT_SEVENTH_BENEFIC_SUPPORT",
        sourceLayer: "D1", sourceChart: "D1", personScope: scope,
        category: "seventh_benefic", tier: 1,
        conditionKey: `d1:seventh-benefic:${scope}`,
        calculationReference: "card10a:d1-seventh-aspects",
        detail: "A natural benefic occupies or aspects the 7th house.",
      })
    );
  }
  if (natal.maleficAspectsSeventh && !natal.beneficAspectsSeventh) {
    tokens.push(
      makeToken({
        ruleId: "D1_COMPAT_SEVENTH_MALEFIC_STRESS",
        sourceLayer: "D1", sourceChart: "D1", personScope: scope,
        category: "seventh_malefic", tier: -1,
        conditionKey: `d1:seventh-malefic:${scope}`,
        calculationReference: "card10a:d1-seventh-aspects",
        detail: "A natural malefic occupies or aspects the 7th house without benefic relief.",
      })
    );
  }

  return tokens;
}

function mutualTokens(
  a: NatalPersonFactors,
  b: NatalPersonFactors
): AdvancedEvidenceToken[] {
  const tokens: AdvancedEvidenceToken[] = [];

  // Lagna-lord friendship (NOT Moon-sign — that is Card 10 Graha Maitri).
  if (a.lagnaLord && b.lagnaLord) {
    const va = friendshipView(a.lagnaLord as never, b.lagnaLord as never);
    const vb = friendshipView(b.lagnaLord as never, a.lagnaLord as never);
    const tier = a.lagnaLord === b.lagnaLord || (va === "friend" && vb === "friend")
      ? 1
      : (va === "enemy" && vb === "enemy") ? -1 : 0;
    if (tier !== 0) {
      tokens.push(
        makeToken({
          ruleId: "D1_COMPAT_LAGNA_LORD_FRIENDSHIP",
          sourceLayer: "D1", sourceChart: "D1", personScope: "mutual",
          category: "lagna_lord_relation", tier,
          conditionKey: "d1:lagna-lord-friendship",
          calculationReference: "card10a:d1-lagna-lord",
          detail: `Lagna lords ${a.lagnaLord} / ${b.lagnaLord}.`,
        })
      );
    }
  }

  // 7th-lord friendship.
  if (a.seventhLord && b.seventhLord) {
    const va = friendshipView(a.seventhLord as never, b.seventhLord as never);
    const vb = friendshipView(b.seventhLord as never, a.seventhLord as never);
    const tier = a.seventhLord === b.seventhLord || (va === "friend" && vb === "friend")
      ? 1
      : (va === "enemy" && vb === "enemy") ? -1 : 0;
    if (tier !== 0) {
      tokens.push(
        makeToken({
          ruleId: "D1_COMPAT_SEVENTH_LORD_FRIENDSHIP",
          sourceLayer: "D1", sourceChart: "D1", personScope: "mutual",
          category: "seventh_lord_relation", tier,
          conditionKey: "d1:seventh-lord-friendship",
          calculationReference: "card10a:d1-seventh-lord",
          detail: `7th lords ${a.seventhLord} / ${b.seventhLord}.`,
        })
      );
    }
  }

  // Venus relationship (relationship karaka; non-gendered). Compare Venus
  // dispositors (sign lords of each Venus).
  if (a.venus.signIndex !== null && b.venus.signIndex !== null) {
    const bothDignified =
      (a.venus.dignity === "own" || a.venus.dignity === "exalted") &&
      (b.venus.dignity === "own" || b.venus.dignity === "exalted");
    const eitherDebilitated =
      a.venus.dignity === "debilitated" || b.venus.dignity === "debilitated";
    const tier = bothDignified ? 1 : eitherDebilitated ? -1 : 0;
    if (tier !== 0) {
      tokens.push(
        makeToken({
          ruleId: "D1_COMPAT_VENUS_RELATION",
          sourceLayer: "D1", sourceChart: "D1", personScope: "mutual",
          category: "venus_relation", tier,
          conditionKey: "d1:venus-relation",
          calculationReference: "card10a:d1-venus",
          detail: "Venus (relationship karaka) condition across both charts.",
        })
      );
    }
  }

  return tokens;
}

export function buildNatalCompatibility(input: {
  contextA: AdvancedChartContext;
  contextB: AdvancedChartContext;
}): NatalCompatibilityResult {
  const a = input.contextA.natal;
  const b = input.contextB.natal;

  if (!a || !b) {
    return {
      status: "unavailable",
      personAFactors: a,
      personBFactors: b,
      mutualFactors: [],
      evidenceTokens: [],
    };
  }

  const perPerson = [...perPersonTokens("personA", a), ...perPersonTokens("personB", b)];
  const mutual = mutualTokens(a, b);

  return {
    status: "available",
    personAFactors: a,
    personBFactors: b,
    mutualFactors: mutual,
    evidenceTokens: [...perPerson, ...mutual],
  };
}
