// Card 10A.2 — Contradiction resolver (pure).
//
// Never averages. Preserves the raw Card 10 result and each layer; surfaces
// contradictions and sets requiresAcharyaReview for high-impact ones. D9 never
// flips D1 here (it only contributes contextual tokens elsewhere).

import type { AshtakootMatchSnapshot } from "@/modules/astrology/matchmaking/premium";
import type {
  AdvancedEvidenceToken,
  AdvancedManglikResult,
  DashaCompatibilityResult,
  NatalCompatibilityResult,
  NavamshaCompatibilityResult,
} from "@/modules/astrology/matchmaking/advanced/types";

function netTier(tokens: AdvancedEvidenceToken[]): number {
  return tokens.reduce((sum, token) => sum + token.tier, 0);
}

export function resolveContradictions(input: {
  ashtakoot: AshtakootMatchSnapshot;
  manglik: AdvancedManglikResult;
  natal: NatalCompatibilityResult;
  navamsha: NavamshaCompatibilityResult;
  dasha: DashaCompatibilityResult;
}): { contradictionFlags: string[]; requiresAcharyaReview: boolean } {
  const flags: string[] = [];
  const ashtakootRatio =
    input.ashtakoot.ashtakoot.availableMaximumTotal > 0
      ? input.ashtakoot.ashtakoot.rawTotal / input.ashtakoot.ashtakoot.availableMaximumTotal
      : 0;

  // Strong Ashtakoot vs unbalanced Manglik.
  if (ashtakootRatio >= 0.6 && input.manglik.finalStatus === "unbalanced") {
    flags.push("CONTRADICTION_ASHTAKOOT_VS_MANGLIK");
  }

  // D1 vs D9 direction disagreement.
  if (input.natal.status === "available" && input.navamsha.status === "available") {
    const d1Net = netTier(input.natal.evidenceTokens);
    const d9Net = netTier([
      ...input.navamsha.mutualFactors,
      ...input.navamsha.d1d9Reinforcement,
    ]);
    if ((d1Net > 0 && d9Net < 0) || (d1Net < 0 && d9Net > 0)) {
      flags.push("CONTRADICTION_D1_VS_D9");
    }
  }

  // Asymmetric Dasha: one supportive, the other in Sandhi.
  if (input.dasha.status === "available" && input.dasha.personA && input.dasha.personB) {
    const aActive = input.dasha.personA.relationshipActivation.length > 0;
    const bActive = input.dasha.personB.relationshipActivation.length > 0;
    const aSandhi = input.dasha.personA.mahaSandhi || input.dasha.personA.antarSandhi;
    const bSandhi = input.dasha.personB.mahaSandhi || input.dasha.personB.antarSandhi;
    if ((aActive && bSandhi && !bActive) || (bActive && aSandhi && !aActive)) {
      flags.push("CONTRADICTION_DASHA_ASYMMETRIC");
    }
  }

  const requiresAcharyaReview =
    flags.length > 0 ||
    input.manglik.finalStatus === "unbalanced" ||
    input.dasha.simultaneousSandhi;

  return { contradictionFlags: flags, requiresAcharyaReview };
}
