// Card 10.2 — Matchmaking foundation (compatibility wrapper).
//
// This file no longer owns any scoring math. It delegates 100% to the single
// authoritative premium Ashtakoot engine (matchmaking/premium) and adapts the
// result into the pre-existing consumer-facing TypeScript contract, unchanged.
// This corrects the previously-shipped defects (Bhakoot absolute-distance bug,
// Nadi index%3, Gana mis-mapping, string-name matching, free-form prose) while
// keeping every exported symbol and type stable for current frontend consumers.
//
// Limitation (documented): the legacy contract has no calculation-role input,
// so the directional Varna koota remains "pending" here (it needs explicit
// bride_role/groom_role, which only the premium engine input exposes). All
// symmetric kootas (Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) are
// computed and corrected. No fabricated fields.

import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  createAstrologyInfrastructureSnapshot,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";
import type { ZodiacSign } from "@/modules/astrology/types";
import { zodiacSigns } from "@/modules/astrology/constants";
import {
  buildAshtakootMatchSnapshot,
  buildMatchPersonContext,
  houseFromSign,
  type AshtakootMatchSnapshot,
  type KootaComponentResult,
  type ManglikChartResult,
  type MatchPersonContext,
} from "@/modules/astrology/matchmaking/premium";

type MatchmakingSubjectInput = {
  chart?: UnifiedSiderealChart | null | undefined;
  savedKundliId?: string | null;
  label?: string | null;
  sourceLabel?: string | null;
};

type MatchmakingPairInput = {
  personA: MatchmakingSubjectInput;
  personB: MatchmakingSubjectInput;
  asOfDateUtc?: Date | string;
};

export type MatchmakingSubjectSnapshot = {
  label: string;
  sourceLabel: string;
  savedKundliId: string | null;
  chartAvailable: boolean;
  verifiedChart: boolean;
  moonSign: ZodiacSign | null;
  moonNakshatra: string | null;
  moonPada: number | null;
  moonHouse: number | null;
  missingReason: string | null;
};

export type MatchmakingKootaKey =
  | "VARNA"
  | "VASHYA"
  | "TARA"
  | "YONI"
  | "GRAHA_MAITRI"
  | "GANA"
  | "BHAKOOT"
  | "NADI";

export type MatchmakingKootaStatus = "ready" | "partial" | "pending" | "unavailable";

export type MatchmakingKootaBreakdownEntry = {
  key: MatchmakingKootaKey;
  title: string;
  status: MatchmakingKootaStatus;
  score: number | null;
  maxScore: number | null;
  summary: string;
  missingReason: string | null;
};

export type MatchmakingRecommendationLevel =
  | "supportive"
  | "balanced"
  | "review"
  | "insufficient_data";

export type ManglikReferenceKey = "LAGNA" | "MOON" | "VENUS";

export type ManglikReferenceSnapshot = {
  reference: ManglikReferenceKey;
  house: number | null;
  isSensitive: boolean | null;
  status: "ready" | "partial" | "unavailable";
  summary: string;
  missingReason: string | null;
};

export type ManglikAnalysisSnapshot = {
  status: "ready" | "partial" | "unavailable";
  overallStatus: "present" | "absent" | "partial" | "unavailable";
  severity: "low" | "moderate" | "high" | "unavailable";
  marsHouse: number | null;
  marsSign: string | null;
  lagnaCheck: ManglikReferenceSnapshot;
  moonCheck: ManglikReferenceSnapshot;
  venusCheck: ManglikReferenceSnapshot;
  cancellationFlags: string[];
  mitigationFlags: string[];
  summary: string;
  missingReason: string | null;
};

export type MatchmakingCompatibilityInsights = {
  status: "ready" | "partial" | "unavailable";
  emotionalCompatibility: string;
  communicationCompatibility: string;
  familySocialHarmony: string;
  practicalLifeAlignment: string;
  conflictAreas: string[];
  supportiveFactors: string[];
  consultationSuggestion: string | null;
  reportSummary: string;
  aiSummary: string;
  missingReason: string | null;
};

export type MatchmakingFoundationData = {
  comparisonType: "GUNA_MILAN";
  asOfDateUtc: string;
  personA: MatchmakingSubjectSnapshot;
  personB: MatchmakingSubjectSnapshot;
  matchScore: number | null;
  maxScore: number | null;
  kootaBreakdown: MatchmakingKootaBreakdownEntry[];
  summary: string;
  strengths: string[];
  cautions: string[];
  missingData: string[];
  recommendationLevel: MatchmakingRecommendationLevel;
  manglikAnalysis: {
    personA: ManglikAnalysisSnapshot;
    personB: ManglikAnalysisSnapshot;
    summary: string;
    missingReason: string | null;
  };
  compatibilityInsights: MatchmakingCompatibilityInsights;
  safeSummary: string;
  missingReason: string | null;
};

export type MatchmakingFoundationSnapshot =
  AstrologyInfrastructureSnapshot<MatchmakingFoundationData>;

const KOOTA_TITLES: Record<MatchmakingKootaKey, string> = {
  VARNA: "Varna",
  VASHYA: "Vashya",
  TARA: "Tara",
  YONI: "Yoni",
  GRAHA_MAITRI: "Graha Maitri",
  GANA: "Gana",
  BHAKOOT: "Bhakoot",
  NADI: "Nadi",
};

function normalizeLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : fallback;
}

function buildSubjectSnapshot(
  input: MatchmakingSubjectInput,
  context: MatchPersonContext,
  fallbackLabel: string
): MatchmakingSubjectSnapshot {
  const label = normalizeLabel(input.label, fallbackLabel);
  const savedKundliId = input.savedKundliId?.trim() || null;
  const sourceLabel =
    normalizeLabel(
      input.sourceLabel,
      savedKundliId ? "Saved Kundli" : "Verified live chart"
    ) ?? fallbackLabel;
  const chartAvailable = Boolean(input.chart);
  const moonHouse =
    context.moonSignIndex !== null && context.lagnaSignIndex !== null
      ? houseFromSign(context.moonSignIndex, context.lagnaSignIndex)
      : null;

  return {
    label,
    sourceLabel,
    savedKundliId,
    chartAvailable,
    verifiedChart: context.verified,
    moonSign:
      context.moonSignIndex !== null
        ? (zodiacSigns[context.moonSignIndex] as ZodiacSign)
        : null,
    moonNakshatra: context.nakshatraName,
    moonPada: context.padaIndex,
    moonHouse,
    missingReason: context.unavailableReason,
  };
}

function mapKootaStatus(component: KootaComponentResult): MatchmakingKootaStatus {
  if (component.status === "available") {
    return "ready";
  }

  return component.tableEntry === "ROLE_REQUIRED" ? "pending" : "unavailable";
}

function toBreakdownEntry(component: KootaComponentResult): MatchmakingKootaBreakdownEntry {
  const status = mapKootaStatus(component);

  return {
    key: component.koota,
    title: KOOTA_TITLES[component.koota],
    status,
    score: component.status === "available" ? component.rawScore : null,
    maxScore: component.maximumScore,
    summary:
      component.status === "available"
        ? `${KOOTA_TITLES[component.koota]} raw score ${component.rawScore} of ${component.maximumScore} (${component.tableEntry}).`
        : status === "pending"
          ? `${KOOTA_TITLES[component.koota]} is directional and needs explicit calculation roles in the premium engine.`
          : `${KOOTA_TITLES[component.koota]} is unavailable: ${component.unavailableReason ?? "insufficient data"}.`,
    missingReason:
      component.status === "available" ? null : component.unavailableReason,
  };
}

function mapManglik(result: ManglikChartResult): ManglikAnalysisSnapshot {
  const byRef = (reference: ManglikReferenceKey): ManglikReferenceSnapshot => {
    const ref = result.references.find((entry) => entry.reference === reference);

    if (!ref || ref.status !== "available") {
      return {
        reference,
        house: null,
        isSensitive: null,
        status: "unavailable",
        summary: `Mars placement from ${reference} is unavailable.`,
        missingReason: ref?.unavailableReason ?? "Reference unavailable.",
      };
    }

    return {
      reference,
      house: ref.marsHouse,
      isSensitive: ref.flagged,
      status: "ready",
      summary: ref.flagged
        ? `Mars is in a Manglik-sensitive house from the ${reference} reference.`
        : `Mars is not in a Manglik-sensitive house from the ${reference} reference.`,
      missingReason: null,
    };
  };

  const lagnaCheck = byRef("LAGNA");
  const moonCheck = byRef("MOON");
  const venusCheck = byRef("VENUS");
  const flagged = result.flaggedReferenceCount ?? 0;
  const anyUnavailable = [lagnaCheck, moonCheck, venusCheck].some(
    (check) => check.status !== "ready"
  );

  const status: ManglikAnalysisSnapshot["status"] =
    result.status === "unavailable"
      ? "unavailable"
      : anyUnavailable
        ? "partial"
        : "ready";
  const overallStatus: ManglikAnalysisSnapshot["overallStatus"] =
    result.status === "unavailable"
      ? "unavailable"
      : flagged === 0
        ? anyUnavailable
          ? "partial"
          : "absent"
        : anyUnavailable
          ? "partial"
          : "present";
  const severity: ManglikAnalysisSnapshot["severity"] =
    result.status === "unavailable"
      ? "unavailable"
      : flagged === 0
        ? "low"
        : flagged === 1
          ? "moderate"
          : "high";

  return {
    status,
    overallStatus,
    severity,
    marsHouse: lagnaCheck.house,
    marsSign: null,
    lagnaCheck,
    moonCheck,
    venusCheck,
    cancellationFlags: [], // Manglik cancellation deferred (Card 10.1 lock).
    mitigationFlags: [],
    summary:
      result.status === "unavailable"
        ? "Manglik analysis is unavailable until Mars placement is available."
        : `Raw Manglik reference check flagged ${flagged} of the available references (product presentation only; cancellation deferred; requires Acharya review).`,
    missingReason: anyUnavailable
      ? "Some Manglik reference checks are unavailable."
      : null,
  };
}

function computeRecommendationLevel(
  rawScore: number,
  maxScore: number,
  missingData: string[]
): MatchmakingRecommendationLevel {
  if (maxScore <= 0) {
    return "insufficient_data";
  }

  const ratio = rawScore / maxScore;

  if (ratio >= 0.75 && missingData.length === 0) {
    return "supportive";
  }

  if (ratio >= 0.55) {
    return "balanced";
  }

  return "review";
}

function buildSafeInsights(input: {
  breakdown: MatchmakingKootaBreakdownEntry[];
  recommendationLevel: MatchmakingRecommendationLevel;
  missingData: string[];
  bhakootException: boolean;
  nadiException: boolean;
}): MatchmakingCompatibilityInsights {
  const ready = input.breakdown.filter((entry) => entry.status === "ready");
  const supportive = ready.filter((entry) => (entry.score ?? 0) > 0);
  const cautions = ready.filter((entry) => entry.score === 0);
  const supportiveFactors = supportive.map(
    (entry) => `${entry.title}: raw ${entry.score}/${entry.maxScore}`
  );
  const conflictAreas = cautions.map(
    (entry) => `${entry.title}: raw 0/${entry.maxScore} (traditional caution area; requires review)`
  );

  if (input.bhakootException) {
    conflictAreas.push("Bhakoot dosha has a traditional cancellation applicable (see exception overlay).");
  }
  if (input.nadiException) {
    conflictAreas.push("Nadi dosha has a traditional cancellation applicable (see exception overlay).");
  }

  return {
    status: input.missingData.length > 0 ? "partial" : "ready",
    emotionalCompatibility: `Moon-based kootas (Tara, Gana) are computed as raw traditional scores; review with an Acharya.`,
    communicationCompatibility: `Graha Maitri raw score reflects Moon-sign lord natural friendship only.`,
    familySocialHarmony: `Bhakoot and Nadi raw scores plus any applicable exception overlay are reported without a verdict.`,
    practicalLifeAlignment: `Compatibility reading is ${input.recommendationLevel} as a presentation band only; not an approval or rejection.`,
    conflictAreas,
    supportiveFactors,
    consultationSuggestion:
      input.recommendationLevel === "review"
        ? "A qualified Acharya review is suggested; this calculation is not a yes/no verdict."
        : null,
    reportSummary: `Traditional Ashtakoot raw scores computed; presentation band: ${input.recommendationLevel}. Requires Acharya review.`,
    aiSummary: `Use raw Ashtakoot scores and structured factors as context, not certainty. ${conflictAreas.length} caution area(s) noted.`,
    missingReason:
      input.missingData.length > 0
        ? "Some kootas or Manglik references are unavailable in this compatibility context."
        : null,
  };
}

/**
 * Guna Milan foundation — now backed entirely by the premium Ashtakoot engine.
 * Directional Varna is not scored here (no role input in the legacy contract);
 * all symmetric kootas are computed and corrected.
 */
export function buildGunaMilanFoundation(
  input: MatchmakingPairInput
): MatchmakingFoundationSnapshot {
  const contextA = buildMatchPersonContext({
    chart: input.personA.chart ?? null,
    calculationRole: null,
  });
  const contextB = buildMatchPersonContext({
    chart: input.personB.chart ?? null,
    calculationRole: null,
  });
  const snapshotA = buildSubjectSnapshot(input.personA, contextA, "Person A");
  const snapshotB = buildSubjectSnapshot(input.personB, contextB, "Person B");

  const missingData: string[] = [];

  if (!snapshotA.verifiedChart) {
    missingData.push(`${snapshotA.label}: chart not verified for matching`);
  } else if (!snapshotA.moonSign) {
    missingData.push(`${snapshotA.label}: Moon context unavailable`);
  }
  if (!snapshotB.verifiedChart) {
    missingData.push(`${snapshotB.label}: chart not verified for matching`);
  } else if (!snapshotB.moonSign) {
    missingData.push(`${snapshotB.label}: Moon context unavailable`);
  }

  if (contextA.moonSignIndex === null || contextB.moonSignIndex === null) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "MATCHMAKING_CONTEXT_MISSING",
        message:
          "Guna Milan requires verified Moon context (numeric Moon longitude) for both charts.",
      },
    });
  }

  const engine: AshtakootMatchSnapshot = buildAshtakootMatchSnapshot({
    personAChart: input.personA.chart,
    personBChart: input.personB.chart,
    // No calculation roles in the legacy contract -> Varna stays pending.
    includeManglik: true,
    mode: "full",
  });

  const kootaBreakdown = engine.ashtakoot.componentResults.map(toBreakdownEntry);
  const readyEntries = kootaBreakdown.filter((entry) => entry.status === "ready");
  const matchScore = readyEntries.reduce((total, entry) => total + (entry.score ?? 0), 0);
  const maxScore = readyEntries.reduce((total, entry) => total + (entry.maxScore ?? 0), 0);
  const recommendationLevel = computeRecommendationLevel(matchScore, maxScore, missingData);
  const strengths = readyEntries
    .filter((entry) => (entry.score ?? 0) > 0)
    .map((entry) => `${entry.title}: ${entry.summary}`);
  const cautions = kootaBreakdown
    .filter((entry) => entry.status !== "ready" || entry.score === 0)
    .map((entry) => `${entry.title}: ${entry.summary}`);
  const manglikA = engine.manglikComparison
    ? mapManglik(engine.manglikComparison.personA)
    : mapManglik({ status: "unavailable", references: [], flaggedReferenceCount: null, productSeverityLabel: "unavailable", unavailableReason: "Manglik unavailable." });
  const manglikB = engine.manglikComparison
    ? mapManglik(engine.manglikComparison.personB)
    : mapManglik({ status: "unavailable", references: [], flaggedReferenceCount: null, productSeverityLabel: "unavailable", unavailableReason: "Manglik unavailable." });
  const compatibilityInsights = buildSafeInsights({
    breakdown: kootaBreakdown,
    recommendationLevel,
    missingData,
    bhakootException: engine.bhakootExceptionStatus === "cancellation_applicable",
    nadiException: engine.nadiExceptionStatus === "cancellation_applicable",
  });

  const scoreLabel = maxScore > 0 ? `${matchScore} / ${maxScore}` : "Unavailable";
  const summary =
    maxScore > 0
      ? `Traditional Ashtakoot (Guna Milan) computed for ${snapshotA.label} and ${snapshotB.label}. Available kootas total ${scoreLabel} (raw). Varna is pending (needs explicit roles). Manglik and exception overlays are reported separately; requires Acharya review.`
      : "Guna Milan is unavailable until both verified Moon contexts are present.";
  // status stays "partial": Varna is directional and unavailable in the
  // role-less legacy contract, so not all 8 kootas are ready.
  const outerStatus = readyEntries.length > 0 ? "partial" : "unavailable";

  return createAstrologyInfrastructureSnapshot({
    status: outerStatus,
    data:
      readyEntries.length > 0
        ? {
            comparisonType: "GUNA_MILAN",
            asOfDateUtc: normalizeAsOfDateUtc(input.asOfDateUtc),
            personA: snapshotA,
            personB: snapshotB,
            matchScore,
            maxScore,
            kootaBreakdown,
            summary,
            strengths,
            cautions,
            missingData: [
              ...missingData,
              ...kootaBreakdown
                .filter((entry) => entry.status === "pending")
                .map((entry) => `${entry.title}: pending (needs calculation roles)`),
            ],
            recommendationLevel,
            manglikAnalysis: {
              personA: manglikA,
              personB: manglikB,
              summary:
                engine.manglikComparison?.detail ??
                "Manglik comparison is unavailable.",
              missingReason:
                manglikA.missingReason || manglikB.missingReason
                  ? "Some Manglik reference checks are unavailable."
                  : null,
            },
            compatibilityInsights,
            safeSummary: summary,
            missingReason:
              missingData.length > 0 || compatibilityInsights.missingReason
                ? "Some compatibility and Manglik details are pending or unavailable."
                : null,
          }
        : null,
    error:
      readyEntries.length > 0
        ? null
        : {
            code: "MATCHMAKING_CONTEXT_MISSING",
            message:
              "Guna Milan requires verified Moon context for both charts.",
          },
  });
}

function normalizeAsOfDateUtc(value?: Date | string) {
  if (!value) {
    return new Date().toISOString();
  }

  const normalized = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  return Number.isNaN(normalized.getTime()) ? new Date().toISOString() : normalized.toISOString();
}
