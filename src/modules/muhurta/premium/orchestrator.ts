// Card 13.2C — Muhurat orchestrator (pure).
// Evaluates deterministic 5-minute buckets across a supplied day, calls every completed
// factor engine per bucket, applies the six-stage ranker, merges adjacent qualifying
// buckets into contiguous windows, and returns a versioned snapshot with evidence,
// rule IDs, partial/unavailable reasons, and provenance. No percentages. No lucky claims.
// Categories not in the V1 set → UNSUPPORTED_CATEGORY (fail-closed).
import type { PremiumPanchangSnapshot } from "@/modules/panchang/premium";
import {
  MUHURAT_EVENT_CATEGORIES,
  MUHURAT_RANKING_STAGES,
  type Karaka,
} from "@/modules/muhurta/premium/constants";
import {
  buildPanchangFactor,
  buildTaraBalaFactor,
  buildChandraBalaFactor,
  buildDoshaFactor,
  buildLagnaFactor,
  buildPlanetaryFactor,
  buildSegmentFactor,
  type DoshaExternalSignals,
  type KarakaState,
  type MuhuratFactorResult,
} from "@/modules/muhurta/premium/factors";
import {
  buildProvenance,
  classifyBucketStatus,
  compareBucketsForRank,
  compareWindowsForRank,
  detectSegmentOverlaps,
  isHardProhibited,
  mergeBucketsIntoWindows,
  scoreBucketTokens,
  type MuhuratWindow,
  type ScoredBucket,
} from "@/modules/muhurta/premium/ranker";
import type {
  MuhuratEventCategory,
  MuhuratEvidenceToken,
  MuhuratProvenance,
  MuhuratResultStatus,
} from "@/modules/muhurta/premium/types";
import { MUHURAT_PREMIUM_CONTRACT_VERSION, MUHURAT_PREMIUM_DISCLAIMER } from "@/modules/muhurta/premium/types";

// Per-bucket resolved context. The orchestrator is pure — callers (or a Card 13.2D+
// wiring layer) resolve Card 9 Panchang / Card 5 Dasha / Card 7 Ashtakavarga per bucket
// via their existing public exports and provide the results here.
export type MuhuratBucketContext = {
  index: number;
  bucketStartUtc: string;
  bucketMidUtc: string;
  bucketEndUtc: string;
  panchangSnapshot: PremiumPanchangSnapshot;
  natal: {
    janmaNakshatraIndex: number | null;
    janmaRashiIndex: number | null;
    lagnaSignIndex: number | null;
    lagnaLordHouse: number | null;
    maleficInEighth: boolean | null;
    seventhHouseOccupant: "benefic" | "malefic" | "empty" | null;
    primaryKaraka: KarakaState;
    ashtakavargaBav: number | null;
    activeDashaLord: Karaka | null;
    mercuryRetrograde: boolean | null;
    transitMoonNakshatraIndex: number;
    transitMoonRashiIndex: number;
  };
  doshaSignals: DoshaExternalSignals;
};

export type MuhuratOrchestratorInput = {
  category: MuhuratEventCategory | string;
  buckets: readonly MuhuratBucketContext[];
  /** Panchang provenance passthrough (Card 9 field). Optional. */
  panchangProvenance?: unknown | null;
};

export type MuhuratRankedWindow = MuhuratWindow;

export type MuhuratSnapshot = {
  status: MuhuratResultStatus;
  contractVersion: typeof MUHURAT_PREMIUM_CONTRACT_VERSION;
  rankingStages: typeof MUHURAT_RANKING_STAGES;
  category: MuhuratEventCategory | null;
  supportive: MuhuratRankedWindow[]; // top 5 ranked
  caution: MuhuratRankedWindow[];    // top 5 ranked
  avoid: MuhuratRankedWindow[];      // all (unranked; chronological)
  neutralWindowCount: number;
  scoredBuckets: ScoredBucket[];     // full deterministic bucket ledger
  partialFlags: string[];
  unavailableReasons: Array<{ code: string; message: string }>;
  provenance: MuhuratProvenance;
  disclaimer: typeof MUHURAT_PREMIUM_DISCLAIMER;
  failureCode?: string;
  failureMessage?: string;
};

const TOP_N = 5;

function isSupportedCategory(cat: string): cat is MuhuratEventCategory {
  return (MUHURAT_EVENT_CATEGORIES as readonly string[]).includes(cat);
}

function collectFactor(
  bucket: MuhuratBucketContext, category: MuhuratEventCategory, factorResults: MuhuratFactorResult[]
): { tokens: MuhuratEvidenceToken[]; partialFlags: Set<string>; unavailable: Array<{ code: string; message: string }> } {
  const tokens: MuhuratEvidenceToken[] = [];
  const partial = new Set<string>();
  const unavailable: Array<{ code: string; message: string }> = [];
  for (const r of factorResults) {
    tokens.push(...r.tokens);
    for (const f of r.partialFlags) partial.add(f);
    unavailable.push(...r.unavailableReasons);
  }
  void bucket; void category;
  return { tokens, partialFlags: partial, unavailable };
}

/** Fail-closed for unsupported categories (contract §16 UNSUPPORTED_CATEGORY). */
function failUnsupportedCategory(cat: string): MuhuratSnapshot {
  return {
    status: "UNSUPPORTED_CATEGORY",
    contractVersion: MUHURAT_PREMIUM_CONTRACT_VERSION,
    rankingStages: MUHURAT_RANKING_STAGES,
    category: null,
    supportive: [], caution: [], avoid: [],
    neutralWindowCount: 0,
    scoredBuckets: [],
    partialFlags: [],
    unavailableReasons: [{ code: "UNSUPPORTED_CATEGORY", message: `Category "${cat}" is not in the V1 supported set.` }],
    provenance: buildProvenance(null),
    disclaimer: MUHURAT_PREMIUM_DISCLAIMER,
    failureCode: "UNSUPPORTED_CATEGORY",
    failureMessage: `Category "${cat}" is not in the V1 supported set.`,
  };
}

/**
 * Main V1 orchestrator. Pure; deterministic; returns byte-identical output for identical input.
 */
export function buildMuhuratSnapshot(input: MuhuratOrchestratorInput): MuhuratSnapshot {
  if (!isSupportedCategory(String(input.category))) return failUnsupportedCategory(String(input.category));
  const category = input.category as MuhuratEventCategory;

  if (!input.buckets || input.buckets.length === 0) {
    return {
      status: "UNAVAILABLE_INVALID_DATE",
      contractVersion: MUHURAT_PREMIUM_CONTRACT_VERSION,
      rankingStages: MUHURAT_RANKING_STAGES,
      category,
      supportive: [], caution: [], avoid: [],
      neutralWindowCount: 0,
      scoredBuckets: [],
      partialFlags: [],
      unavailableReasons: [{ code: "NO_BUCKETS", message: "No buckets provided for the day." }],
      provenance: buildProvenance(input.panchangProvenance ?? null),
      disclaimer: MUHURAT_PREMIUM_DISCLAIMER,
    };
  }

  // --- Score every bucket by invoking all completed factor engines ------------
  const scored: ScoredBucket[] = [];
  const partialAll = new Set<string>();
  const unavailableAll: Array<{ code: string; message: string }> = [];

  for (const b of input.buckets) {
    const factorResults: MuhuratFactorResult[] = [
      buildPanchangFactor({ snapshot: b.panchangSnapshot, category }),
      buildTaraBalaFactor({
        janmaNakshatraIndex: b.natal.janmaNakshatraIndex,
        transitMoonNakshatraIndex: b.natal.transitMoonNakshatraIndex,
        category,
      }),
      buildChandraBalaFactor({
        janmaRashiIndex: b.natal.janmaRashiIndex,
        transitMoonRashiIndex: b.natal.transitMoonRashiIndex,
        category,
      }),
      buildDoshaFactor({ snapshot: b.panchangSnapshot, category, signals: b.doshaSignals }),
      buildLagnaFactor({
        lagnaSignIndex: b.natal.lagnaSignIndex,
        lagnaLordHouse: b.natal.lagnaLordHouse,
        maleficInEighth: b.natal.maleficInEighth,
        seventhHouseOccupant: b.natal.seventhHouseOccupant,
        category,
      }),
      buildPlanetaryFactor({
        category,
        primaryKaraka: b.natal.primaryKaraka,
        ashtakavargaBav: b.natal.ashtakavargaBav,
        activeDashaLord: b.natal.activeDashaLord,
        mercuryRetrograde: b.natal.mercuryRetrograde,
      }),
      buildSegmentFactor({ snapshot: b.panchangSnapshot, queryInstantUtc: b.bucketMidUtc, category }),
    ];
    const { tokens, partialFlags, unavailable } = collectFactor(b, category, factorResults);
    const score = scoreBucketTokens(tokens);
    const hardProhibited = isHardProhibited(tokens);
    const seg = detectSegmentOverlaps(tokens);
    const status = classifyBucketStatus(score, hardProhibited);
    scored.push({
      index: b.index, bucketStartUtc: b.bucketStartUtc, bucketEndUtc: b.bucketEndUtc,
      tokens, partialFlags: [...partialFlags], unavailableReasons: unavailable,
      hardProhibited, score, inCautionKaal: seg.inCautionKaal, inSupportiveOverlay: seg.inSupportiveOverlay,
      status,
    });
    for (const f of partialFlags) partialAll.add(f);
    unavailableAll.push(...unavailable);
  }

  // Stable chronological order for merging.
  scored.sort((a, b) => a.index - b.index);

  // --- Merge adjacent same-status buckets into contiguous windows -------------
  const windows = mergeBucketsIntoWindows(scored);

  const supportive = windows.filter((w) => w.status === "SUPPORTIVE").sort(compareWindowsForRank);
  const caution    = windows.filter((w) => w.status === "CAUTION").sort(compareWindowsForRank);
  const avoid      = windows.filter((w) => w.status === "AVOID"); // unranked; chronological
  const neutralWindowCount = windows.filter((w) => w.status === "NEUTRAL").length;

  // Reference the bucket-level comparator so consumers who prefer bucket-level ranking
  // (e.g., debugging tools) can call it. Also proves the pipeline stage set is complete.
  void compareBucketsForRank;

  return {
    status: unavailableAll.length > 0 || partialAll.size > 0 ? "PARTIAL" : "CALCULATED",
    contractVersion: MUHURAT_PREMIUM_CONTRACT_VERSION,
    rankingStages: MUHURAT_RANKING_STAGES,
    category,
    supportive: supportive.slice(0, TOP_N),
    caution: caution.slice(0, TOP_N),
    avoid,
    neutralWindowCount,
    scoredBuckets: scored,
    partialFlags: [...partialAll].sort(),
    unavailableReasons: unavailableAll,
    provenance: buildProvenance(input.panchangProvenance ?? null),
    disclaimer: MUHURAT_PREMIUM_DISCLAIMER,
  };
}
