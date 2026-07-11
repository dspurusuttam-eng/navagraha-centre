// Card 10A.2 — D9 Navamsha compatibility layer (contextual only).
//
// D9 confirms/contextualizes D1; it NEVER overrides D1 and contributes at most
// +/-1 per token. Missing D9 -> degraded (no fabrication). D1/D9 contradictions
// stay visible.

import { friendshipView } from "@/modules/astrology/matchmaking/advanced/constants";
import { makeToken } from "@/modules/astrology/matchmaking/advanced/evidence";
import type { AdvancedChartContext } from "@/modules/astrology/matchmaking/advanced/chart-context";
import type {
  AdvancedEvidenceToken,
  NavamshaCompatibilityResult,
  NavamshaPersonFactors,
} from "@/modules/astrology/matchmaking/advanced/types";

function reinforcementTokens(
  scope: "personA" | "personB",
  d9: NavamshaPersonFactors
): AdvancedEvidenceToken[] {
  const tokens: AdvancedEvidenceToken[] = [];
  // Vargottama reinforcement for relationship-relevant bodies (Venus) or Lagna.
  const relevant = d9.vargottamaBodies.filter(
    (body) => body === "VENUS" || body === "LAGNA" || body === "JUPITER"
  );
  if (relevant.length > 0) {
    tokens.push(
      makeToken({
        ruleId: "D9_COMPAT_VARGOTTAMA_REINFORCE",
        sourceLayer: "D9", sourceChart: "D9", personScope: scope,
        category: "vargottama", tier: 1,
        conditionKey: `d9:vargottama:${scope}`,
        calculationReference: "card4:vargottama",
        detail: `Vargottama reinforcement: ${relevant.join(", ")}.`,
      })
    );
  }

  // D9 Venus dignity (contextual).
  if (d9.d9Venus.dignity === "own" || d9.d9Venus.dignity === "exalted") {
    tokens.push(
      makeToken({
        ruleId: "D9_COMPAT_VENUS_DIGNITY",
        sourceLayer: "D9", sourceChart: "D9", personScope: scope,
        category: "d9_venus", tier: 1,
        conditionKey: `d9:venus-dignity:${scope}`,
        calculationReference: "card4:d9-venus",
        detail: "D9 Venus is own/exalted (contextual support).",
      })
    );
  } else if (d9.d9Venus.dignity === "debilitated") {
    tokens.push(
      makeToken({
        ruleId: "D9_COMPAT_VENUS_DIGNITY",
        sourceLayer: "D9", sourceChart: "D9", personScope: scope,
        category: "d9_venus", tier: -1,
        conditionKey: `d9:venus-dignity:${scope}`,
        calculationReference: "card4:d9-venus",
        detail: "D9 Venus is debilitated (contextual caution).",
      })
    );
  }

  return tokens;
}

export function buildNavamshaCompatibility(input: {
  contextA: AdvancedChartContext;
  contextB: AdvancedChartContext;
}): NavamshaCompatibilityResult {
  const a = input.contextA.d9;
  const b = input.contextB.d9;

  if (!a || !b) {
    return {
      status: input.contextA.verified && input.contextB.verified ? "degraded" : "unavailable",
      personAFactors: a,
      personBFactors: b,
      mutualFactors: [],
      d1d9Reinforcement: [],
    };
  }

  const mutual: AdvancedEvidenceToken[] = [];
  // D9 7th-lord friendship (contextual, +/-1 max).
  if (a.d9SeventhLord && b.d9SeventhLord) {
    const va = friendshipView(a.d9SeventhLord as never, b.d9SeventhLord as never);
    const vb = friendshipView(b.d9SeventhLord as never, a.d9SeventhLord as never);
    const tier = a.d9SeventhLord === b.d9SeventhLord || (va === "friend" && vb === "friend")
      ? 1
      : (va === "enemy" && vb === "enemy") ? -1 : 0;
    if (tier !== 0) {
      mutual.push(
        makeToken({
          ruleId: "D9_COMPAT_SEVENTH_LORD_FRIENDSHIP",
          sourceLayer: "D9", sourceChart: "D9", personScope: "mutual",
          category: "d9_seventh_lord_relation", tier,
          conditionKey: "d9:seventh-lord-friendship",
          calculationReference: "card4:d9-seventh-lord",
          detail: `D9 7th lords ${a.d9SeventhLord} / ${b.d9SeventhLord}.`,
        })
      );
    }
  }

  const reinforcement = [
    ...reinforcementTokens("personA", a),
    ...reinforcementTokens("personB", b),
  ];

  return {
    status: "available",
    personAFactors: a,
    personBFactors: b,
    mutualFactors: mutual,
    d1d9Reinforcement: reinforcement,
  };
}
