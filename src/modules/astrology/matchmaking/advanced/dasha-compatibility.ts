// Card 10A.2 — Vimshottari Dasha compatibility layer (temporal context).
//
// Consumes Card 5 active lineage (via chart-context). No single Dasha score,
// no marriage timing. Sandhi thresholds (Maha +/-45d, Antar +/-10d) are
// product-normalization; boundaries are classical (Card 5). Card 5 dates pass
// through unchanged.

import { makeToken } from "@/modules/astrology/matchmaking/advanced/evidence";
import type { AdvancedChartContext } from "@/modules/astrology/matchmaking/advanced/chart-context";
import type {
  AdvancedEvidenceToken,
  DashaCompatibilityResult,
} from "@/modules/astrology/matchmaking/advanced/types";

export function buildDashaCompatibility(input: {
  contextA: AdvancedChartContext;
  contextB: AdvancedChartContext;
}): DashaCompatibilityResult {
  const a = input.contextA.dasha;
  const b = input.contextB.dasha;

  if (!a || !b) {
    return {
      status:
        input.contextA.dashaStatus === "unavailable" ||
        input.contextB.dashaStatus === "unavailable"
          ? "unavailable"
          : "degraded",
      personA: a,
      personB: b,
      simultaneousSandhi: false,
      oneSidedSandhi: false,
      overlapFindings: [],
      sandhiFindings: [],
    };
  }

  const overlapFindings: AdvancedEvidenceToken[] = [];
  const sandhiFindings: AdvancedEvidenceToken[] = [];

  // Relationship activation per person.
  const aActive = a.relationshipActivation.length > 0;
  const bActive = b.relationshipActivation.length > 0;

  if (aActive) {
    overlapFindings.push(
      makeToken({
        ruleId: "DASHA_COMPAT_RELATIONSHIP_ACTIVE",
        sourceLayer: "DASHA", sourceChart: "dasha", personScope: "personA",
        category: "relationship_activation", tier: 1,
        conditionKey: "dasha:relationship-active:personA",
        calculationReference: "card5:active-lineage",
        detail: `Person A active periods include relationship significators: ${a.relationshipActivation.join(", ")}.`,
      })
    );
  }
  if (bActive) {
    overlapFindings.push(
      makeToken({
        ruleId: "DASHA_COMPAT_RELATIONSHIP_ACTIVE",
        sourceLayer: "DASHA", sourceChart: "dasha", personScope: "personB",
        category: "relationship_activation", tier: 1,
        conditionKey: "dasha:relationship-active:personB",
        calculationReference: "card5:active-lineage",
        detail: `Person B active periods include relationship significators: ${b.relationshipActivation.join(", ")}.`,
      })
    );
  }
  if (aActive && bActive) {
    overlapFindings.push(
      makeToken({
        ruleId: "DASHA_COMPAT_SUPPORTIVE_OVERLAP",
        sourceLayer: "DASHA", sourceChart: "dasha", personScope: "mutual",
        category: "supportive_overlap", tier: 1,
        conditionKey: "dasha:supportive-overlap",
        calculationReference: "card5:active-lineage",
        detail: "Both charts are simultaneously running relationship-supportive periods.",
      })
    );
  }

  // Sandhi.
  const aSandhi = a.mahaSandhi || a.antarSandhi;
  const bSandhi = b.mahaSandhi || b.antarSandhi;
  const simultaneousSandhi = aSandhi && bSandhi;
  const oneSidedSandhi = aSandhi !== bSandhi;

  const pushSandhi = (scope: "personA" | "personB", maha: boolean, antar: boolean) => {
    if (maha) {
      sandhiFindings.push(
        makeToken({
          ruleId: "DASHA_SANDHI_MAHA",
          sourceLayer: "DASHA", sourceChart: "dasha", personScope: scope,
          category: "maha_sandhi", tier: -1,
          conditionKey: `dasha:maha-sandhi:${scope}`,
          calculationReference: "card5:mahadasha-boundary",
          detail: "Within +/-45 days of a Mahadasha boundary (product threshold).",
        })
      );
    }
    if (antar) {
      sandhiFindings.push(
        makeToken({
          ruleId: "DASHA_SANDHI_ANTAR",
          sourceLayer: "DASHA", sourceChart: "dasha", personScope: scope,
          category: "antar_sandhi", tier: -1,
          conditionKey: `dasha:antar-sandhi:${scope}`,
          calculationReference: "card5:antardasha-boundary",
          detail: "Within +/-10 days of an Antardasha boundary (product threshold).",
        })
      );
    }
  };
  pushSandhi("personA", a.mahaSandhi, a.antarSandhi);
  pushSandhi("personB", b.mahaSandhi, b.antarSandhi);

  if (simultaneousSandhi) {
    sandhiFindings.push(
      makeToken({
        ruleId: "DASHA_SANDHI_SIMULTANEOUS",
        sourceLayer: "DASHA", sourceChart: "dasha", personScope: "mutual",
        category: "simultaneous_sandhi", tier: -2,
        conditionKey: "dasha:simultaneous-sandhi",
        calculationReference: "card5:active-lineage",
        detail: "Both charts are in a Dasha Sandhi at the evaluation instant.",
      })
    );
  } else if (oneSidedSandhi) {
    sandhiFindings.push(
      makeToken({
        ruleId: "DASHA_SANDHI_ONE_SIDED",
        sourceLayer: "DASHA", sourceChart: "dasha", personScope: "mutual",
        category: "one_sided_sandhi", tier: -1,
        conditionKey: "dasha:one-sided-sandhi",
        calculationReference: "card5:active-lineage",
        detail: "Only one chart is in a Dasha Sandhi at the evaluation instant.",
      })
    );
  }

  return {
    status: "available",
    personA: a,
    personB: b,
    simultaneousSandhi,
    oneSidedSandhi,
    overlapFindings,
    sandhiFindings,
  };
}
