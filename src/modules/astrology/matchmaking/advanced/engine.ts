// Card 10A.2 — Advanced Matchmaking Completion engine orchestrator (pure).
//
// Consumes Card 10 (verbatim), Card 4 D9, Card 5 Dasha; adds the four advanced
// layers + evidence summary. The embedded card10AshtakootResult is byte-identical
// to a direct Card 10 call with the same input. No layer mutates the raw score.

import { buildAshtakootMatchSnapshot } from "@/modules/astrology/matchmaking/premium";
import { buildAdvancedChartContext } from "@/modules/astrology/matchmaking/advanced/chart-context";
import { buildAdvancedManglik } from "@/modules/astrology/matchmaking/advanced/manglik-advanced";
import { buildNatalCompatibility } from "@/modules/astrology/matchmaking/advanced/natal-compatibility";
import { buildNavamshaCompatibility } from "@/modules/astrology/matchmaking/advanced/navamsha-compatibility";
import { buildDashaCompatibility } from "@/modules/astrology/matchmaking/advanced/dasha-compatibility";
import { resolveContradictions } from "@/modules/astrology/matchmaking/advanced/contradiction-resolver";
import { dedupeTokens, splitEvidence } from "@/modules/astrology/matchmaking/advanced/evidence";
import {
  ADVANCED_MATCH_CONTRACT_VERSION,
  ADVANCED_MATCH_CONVENTIONS,
  ADVANCED_MATCH_DISCLAIMER,
  type AdvancedEvidenceToken,
  type AdvancedMatchInput,
  type AdvancedMatchSnapshot,
  type LayerStatus,
  type OverallBand,
} from "@/modules/astrology/matchmaking/advanced/types";

export function buildAdvancedMatchmakingSnapshot(
  input: AdvancedMatchInput
): AdvancedMatchSnapshot {
  const evaluationInstant = input.evaluationInstant ?? new Date().toISOString();
  const evaluationWindow = input.evaluationWindow ?? null;
  const roleA = input.calculationRoleA ?? null;
  const roleB = input.calculationRoleB ?? null;
  const ashtakootOnly = input.mode === "ashtakoot_only";
  const unavailableReasons: AdvancedMatchSnapshot["unavailableReasons"] = [];

  // --- Card 10 (verbatim; never mutated) --------------------------------------
  const card10 = buildAshtakootMatchSnapshot({
    personAChart: input.personAChart,
    personBChart: input.personBChart,
    calculationRoleA: input.calculationRoleA,
    calculationRoleB: input.calculationRoleB,
    includeManglik: true,
    mode: "full",
  });

  // --- Chart contexts (D1 + D9 + Dasha) ---------------------------------------
  const contextA = buildAdvancedChartContext({ chart: input.personAChart, evaluationInstant });
  const contextB = buildAdvancedChartContext({ chart: input.personBChart, evaluationInstant });

  // --- Advanced layers --------------------------------------------------------
  const advancedManglik = buildAdvancedManglik({
    comparison: card10.manglikComparison,
    contextA,
    contextB,
  });
  const natalCompatibility = ashtakootOnly
    ? emptyNatal(contextA, contextB)
    : buildNatalCompatibility({ contextA, contextB });
  const navamshaCompatibility = ashtakootOnly
    ? { status: "unavailable" as LayerStatus, personAFactors: null, personBFactors: null, mutualFactors: [], d1d9Reinforcement: [] }
    : buildNavamshaCompatibility({ contextA, contextB });
  const dashaCompatibility = ashtakootOnly
    ? { status: "unavailable" as LayerStatus, personA: null, personB: null, simultaneousSandhi: false, oneSidedSandhi: false, overlapFindings: [], sandhiFindings: [] }
    : buildDashaCompatibility({ contextA, contextB });

  // --- Evidence aggregation (dedup by conditionKey; split) --------------------
  const allTokens: AdvancedEvidenceToken[] = dedupeTokens([
    ...natalCompatibility.evidenceTokens,
    ...navamshaCompatibility.mutualFactors,
    ...navamshaCompatibility.d1d9Reinforcement,
    ...dashaCompatibility.overlapFindings,
    ...dashaCompatibility.sandhiFindings,
  ]);
  const { supportive, caution, neutral } = splitEvidence(allTokens);

  // --- Contradictions ---------------------------------------------------------
  const { contradictionFlags, requiresAcharyaReview } = resolveContradictions({
    ashtakoot: card10,
    manglik: advancedManglik,
    natal: natalCompatibility,
    navamsha: navamshaCompatibility,
    dasha: dashaCompatibility,
  });

  // --- Readiness + reasons ----------------------------------------------------
  const sourceSystemReadiness: Record<string, LayerStatus> = {
    ashtakoot: card10.status === "unavailable" ? "unavailable" : "available",
    manglik: advancedManglik.status,
    d1: natalCompatibility.status,
    d9: navamshaCompatibility.status,
    dasha: dashaCompatibility.status,
  };
  for (const [layer, status] of Object.entries(sourceSystemReadiness)) {
    if (status !== "available") {
      unavailableReasons.push({
        layer,
        code: status === "degraded" ? "LAYER_DEGRADED" : "LAYER_UNAVAILABLE",
        message: `${layer} layer is ${status}.`,
      });
    }
  }
  const advancedLayers = [advancedManglik.status, natalCompatibility.status, navamshaCompatibility.status, dashaCompatibility.status];
  const availableLayers = advancedLayers.filter((s) => s === "available").length;

  // --- Overall band (product normalization) -----------------------------------
  const ashtakootRatio =
    card10.ashtakoot.availableMaximumTotal > 0
      ? card10.ashtakoot.rawTotal / card10.ashtakoot.availableMaximumTotal
      : 0;
  const netTier = allTokens.reduce((sum, token) => sum + token.tier, 0);
  const overallBand = computeOverallBand({
    card10Unavailable: card10.status === "unavailable",
    natalStatus: natalCompatibility.status,
    d9Status: navamshaCompatibility.status,
    dashaStatus: dashaCompatibility.status,
    manglikStatus: advancedManglik.finalStatus,
    simultaneousSandhi: dashaCompatibility.simultaneousSandhi,
    ashtakootRatio,
    netTier,
  });

  const status: AdvancedMatchSnapshot["status"] =
    card10.status === "unavailable"
      ? "unavailable"
      : availableLayers === advancedLayers.length
        ? "ok"
        : "partial";

  const calculationReferences = [
    ...new Set([
      "card10:ashtakoot",
      ...allTokens.map((t) => t.calculationReference),
      ...(advancedManglik.mitigations.map((m) => m.calculationReference)),
    ]),
  ];

  return {
    status,
    contractVersion: ADVANCED_MATCH_CONTRACT_VERSION,
    conventions: ADVANCED_MATCH_CONVENTIONS,
    evaluationInstant,
    evaluationWindow,
    calculationRoles: { personA: roleA, personB: roleB },
    card10AshtakootResult: card10,
    advancedManglik,
    natalCompatibility,
    navamshaCompatibility,
    dashaCompatibility,
    supportiveEvidence: supportive,
    cautionEvidence: caution,
    neutralEvidence: neutral,
    contradictionFlags,
    sourceSystemReadiness,
    completeness: { availableLayers, totalLayers: 4 },
    overallBand,
    requiresAcharyaReview,
    unavailableReasons,
    calculationReferences,
    flags: {
      ashtakootOnlyMode: ashtakootOnly,
      d9LayerReady: navamshaCompatibility.status === "available",
      dashaLayerReady: dashaCompatibility.status === "available",
      birthTimeDependentDegraded:
        navamshaCompatibility.status !== "available" || dashaCompatibility.status !== "available",
    },
    disclaimer: ADVANCED_MATCH_DISCLAIMER,
  };
}

function emptyNatal(
  contextA: ReturnType<typeof buildAdvancedChartContext>,
  contextB: ReturnType<typeof buildAdvancedChartContext>
) {
  return {
    status: "unavailable" as LayerStatus,
    personAFactors: contextA.natal,
    personBFactors: contextB.natal,
    mutualFactors: [] as AdvancedEvidenceToken[],
    evidenceTokens: [] as AdvancedEvidenceToken[],
  };
}

function computeOverallBand(input: {
  card10Unavailable: boolean;
  natalStatus: LayerStatus;
  d9Status: LayerStatus;
  dashaStatus: LayerStatus;
  manglikStatus: string;
  simultaneousSandhi: boolean;
  ashtakootRatio: number;
  netTier: number;
}): OverallBand {
  if (input.card10Unavailable) {
    return "unavailable";
  }
  // Primary advanced layer (D1) unavailable, or both context layers gone -> incomplete.
  if (
    input.natalStatus !== "available" ||
    (input.d9Status !== "available" && input.dashaStatus !== "available")
  ) {
    return "incomplete";
  }
  if (input.manglikStatus === "unbalanced" || input.simultaneousSandhi || input.netTier <= -2) {
    return "caution";
  }
  if (input.netTier >= 2 && input.ashtakootRatio >= 0.5 && input.manglikStatus !== "unbalanced") {
    return "supportive";
  }
  return "mixed";
}
