// Card 13.2C — Muhurat ranker (pure).
// Six-stage deterministic pipeline (contract §11.2, `MUHURAT_RANKING_V1`):
//   1 HARD_PROHIBITION_FILTER  2 SCORE  3 OUTSIDE_CAUTION_KAAL
//   4 APPLICABLE_SUPPORTIVE_OVERLAY  5 CONTINUITY  6 EARLIER_UTC
// Stages 3–6 are tie-breakers on stage-2-scored buckets; stage 6 always resolves ties
// so ordering is byte-deterministic.
import { computeRulebookHash } from "@/modules/muhurta/premium/rule-registry";
import type {
  EvidenceTier,
  MuhuratEventCategory,
  MuhuratEvidenceToken,
  MuhuratProvenance,
  WindowStatus,
} from "@/modules/muhurta/premium/types";
import { MUHURAT_PREMIUM_CONTRACT_VERSION } from "@/modules/muhurta/premium/types";

export type ScoredBucket = {
  index: number;
  bucketStartUtc: string;
  bucketEndUtc: string;
  tokens: MuhuratEvidenceToken[];
  partialFlags: string[];
  unavailableReasons: Array<{ code: string; message: string }>;
  /** stage 1: any tier=-2 token → AVOID. */
  hardProhibited: boolean;
  /** stage 2. */
  score: number;
  /** stage 3: bucket overlaps Rahu/Gulika/Yamaganda/Godhuli caution kaal. */
  inCautionKaal: boolean;
  /** stage 4: bucket overlaps an APPLICABLE supportive overlay (Abhijit or Brahma for the category). */
  inSupportiveOverlay: boolean;
  /** initial status before merging (windowing recomputes for the merged run). */
  status: WindowStatus;
};

/** Score a single bucket by summing tier ∈ {-2..+2} across its evidence tokens. */
export function scoreBucketTokens(tokens: readonly MuhuratEvidenceToken[]): number {
  let s = 0;
  for (const t of tokens) s += t.tier;
  return s;
}

/** Any tier=-2 PROHIBITED token → hard prohibition (stage 1). */
export function isHardProhibited(tokens: readonly MuhuratEvidenceToken[]): boolean {
  for (const t of tokens) if (t.tier === -2) return true;
  return false;
}

/** Detect the caution-kaal / supportive-overlay evidence in a bucket's token set. */
export function detectSegmentOverlaps(tokens: readonly MuhuratEvidenceToken[]): {
  inCautionKaal: boolean; inSupportiveOverlay: boolean;
} {
  let inCautionKaal = false;
  let inSupportiveOverlay = false;
  for (const t of tokens) {
    if (t.ruleId === "RAHU_KAAL_V1" || t.ruleId === "GULIKA_KAAL_V1"
      || t.ruleId === "YAMAGANDA_V1" || t.ruleId === "GODHULI_V1") {
      inCautionKaal = true;
    }
    if (t.ruleId === "ABHIJIT_MUHURTA_V1" || t.ruleId === "BRAHMA_MUHURTA_V1") {
      inSupportiveOverlay = true;
    }
  }
  return { inCautionKaal, inSupportiveOverlay };
}

/** Classify a bucket's initial status from its score + hard-prohibition flag. */
export function classifyBucketStatus(score: number, hardProhibited: boolean): WindowStatus {
  if (hardProhibited) return "AVOID";
  if (score >= 2) return "SUPPORTIVE";
  if (score <= -1) return "CAUTION";
  return "NEUTRAL";
}

/**
 * Deterministic bucket comparator implementing the six-stage pipeline.
 * `a` sorts BEFORE `b` when the comparator returns < 0.
 */
export function compareBucketsForRank(a: ScoredBucket, b: ScoredBucket): number {
  // Stage 1: hard-prohibited buckets sort to the end of the ranked list.
  if (a.hardProhibited !== b.hardProhibited) return a.hardProhibited ? 1 : -1;
  // Stage 2: higher score first.
  if (a.score !== b.score) return b.score - a.score;
  // Stage 3: prefer buckets OUTSIDE the caution kaal (false < true → false first).
  if (a.inCautionKaal !== b.inCautionKaal) return a.inCautionKaal ? 1 : -1;
  // Stage 4: prefer buckets that ARE inside an applicable supportive overlay.
  if (a.inSupportiveOverlay !== b.inSupportiveOverlay) return a.inSupportiveOverlay ? -1 : 1;
  // Stages 5/6 operate at window level, not bucket level; use earlier UTC as bucket-level tie-break.
  return a.bucketStartUtc.localeCompare(b.bucketStartUtc);
}

// -----------------------------------------------------------------------------
// Window merging & window-level ranking
// -----------------------------------------------------------------------------

export type MuhuratWindow = {
  status: WindowStatus;
  startUtc: string;
  endUtc: string;
  bucketIndices: number[];
  bucketCount: number;
  score: number;             // window score = sum of unique-token tiers across buckets (see aggregation policy below)
  bestBucketScore: number;   // max single-bucket score in the run
  inCautionKaal: boolean;    // any bucket overlaps caution kaal
  inSupportiveOverlay: boolean; // any bucket overlaps a supportive overlay
  tokens: MuhuratEvidenceToken[]; // deduped by ruleId+evidenceId
  partialFlags: string[];    // union across buckets
  unavailableReasons: Array<{ code: string; message: string }>; // union
};

/**
 * Merge adjacent buckets sharing the same status into contiguous windows.
 * Buckets must be supplied in chronological (index) order. The merge is stable
 * and deterministic; two buckets are adjacent iff their indices differ by 1.
 */
export function mergeBucketsIntoWindows(buckets: readonly ScoredBucket[]): MuhuratWindow[] {
  const chrono = [...buckets].sort((a, b) => a.index - b.index);
  const windows: MuhuratWindow[] = [];
  let cur: MuhuratWindow | null = null;
  for (const b of chrono) {
    const canExtend =
      cur !== null &&
      cur.status === b.status &&
      b.index === (cur.bucketIndices[cur.bucketIndices.length - 1] ?? -Infinity) + 1;
    if (!canExtend) {
      if (cur) windows.push(cur);
      cur = {
        status: b.status,
        startUtc: b.bucketStartUtc,
        endUtc: b.bucketEndUtc,
        bucketIndices: [b.index],
        bucketCount: 1,
        score: b.score,
        bestBucketScore: b.score,
        inCautionKaal: b.inCautionKaal,
        inSupportiveOverlay: b.inSupportiveOverlay,
        tokens: dedupeTokens(b.tokens),
        partialFlags: [...new Set(b.partialFlags)],
        unavailableReasons: [...b.unavailableReasons],
      };
    } else {
      cur!.endUtc = b.bucketEndUtc;
      cur!.bucketIndices.push(b.index);
      cur!.bucketCount += 1;
      cur!.score += b.score;
      cur!.bestBucketScore = Math.max(cur!.bestBucketScore, b.score);
      cur!.inCautionKaal = cur!.inCautionKaal || b.inCautionKaal;
      cur!.inSupportiveOverlay = cur!.inSupportiveOverlay || b.inSupportiveOverlay;
      cur!.tokens = dedupeTokens([...cur!.tokens, ...b.tokens]);
      cur!.partialFlags = [...new Set([...cur!.partialFlags, ...b.partialFlags])];
      cur!.unavailableReasons.push(...b.unavailableReasons);
    }
  }
  if (cur) windows.push(cur);
  return windows;
}

function dedupeTokens(tokens: readonly MuhuratEvidenceToken[]): MuhuratEvidenceToken[] {
  const seen = new Set<string>();
  const out: MuhuratEvidenceToken[] = [];
  for (const t of tokens) {
    const k = `${t.ruleId}|${t.evidenceId}`;
    if (!seen.has(k)) { seen.add(k); out.push(t); }
  }
  return out;
}

/**
 * Window comparator implementing the six-stage pipeline at window level.
 *   1 (hard prohibition already partitioned into AVOID windows — not passed here)
 *   2 SCORE (best-bucket-score descending)
 *   3 OUTSIDE_CAUTION_KAAL (prefer windows fully outside)
 *   4 APPLICABLE_SUPPORTIVE_OVERLAY (prefer windows that overlap one)
 *   5 CONTINUITY (larger bucketCount — longer supportive run)
 *   6 EARLIER_UTC (lexicographic on startUtc)
 */
export function compareWindowsForRank(a: MuhuratWindow, b: MuhuratWindow): number {
  if (a.bestBucketScore !== b.bestBucketScore) return b.bestBucketScore - a.bestBucketScore;
  if (a.inCautionKaal !== b.inCautionKaal) return a.inCautionKaal ? 1 : -1;
  if (a.inSupportiveOverlay !== b.inSupportiveOverlay) return a.inSupportiveOverlay ? -1 : 1;
  if (a.bucketCount !== b.bucketCount) return b.bucketCount - a.bucketCount;
  return a.startUtc.localeCompare(b.startUtc);
}

// -----------------------------------------------------------------------------
// Provenance
// -----------------------------------------------------------------------------

export function buildProvenance(panchangProvenance: unknown | null): MuhuratProvenance {
  return {
    contractVersion: MUHURAT_PREMIUM_CONTRACT_VERSION,
    runtime: { node: typeof process !== "undefined" && process.version ? process.version : "unknown" },
    panchangProvenance,
    rulebookHash: computeRulebookHash(),
  };
}

// Re-export tier type for downstream orchestrator use
export type { EvidenceTier, MuhuratEventCategory };
