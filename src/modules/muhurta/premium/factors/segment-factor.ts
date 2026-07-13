// Card 13.2B2 — segment overlay factor (pure).
// Reads Card 9 PremiumPanchangSnapshot segment windows (rahuKaal/gulika/yamaganda/abhijit/
// brahmaMuhurta/sunset) via its existing public type. Emits overlay tokens for a query instant.
// Godhuli is derived deterministically from sunset ± window. Contract §5.6, §5.7, §11.2 stage 3/4.
import type { PremiumPanchangSnapshot, PremiumTimedPeriod } from "@/modules/panchang/premium";
import { CATEGORY_SUPPORTIVE_OVERLAYS } from "@/modules/muhurta/premium/constants";
import { getMuhuratRule } from "@/modules/muhurta/premium/rule-registry";
import type {
  EvidenceTier,
  FactorStatus,
  MuhuratEventCategory,
  MuhuratEvidenceToken,
} from "@/modules/muhurta/premium/types";
import { makeEvidenceId, type MuhuratFactorResult } from "@/modules/muhurta/premium/factors/factor-types";

const GODHULI_HALF_WINDOW_MIN = 24; // ± minutes around sunset (product-normalized twilight window)

export type SegmentFactorInput = {
  snapshot: PremiumPanchangSnapshot;
  /** UTC ISO instant of the candidate bucket mid-point. */
  queryInstantUtc: string;
  category: MuhuratEventCategory;
};

function within(instantMs: number, period: PremiumTimedPeriod | null | undefined): boolean {
  if (!period) return false;
  const s = Date.parse(period.startUtc);
  const e = Date.parse(period.endUtc);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
  return instantMs >= s && instantMs <= e;
}

function push(
  tokens: MuhuratEvidenceToken[],
  ruleId: string,
  factor: string,
  category: MuhuratEventCategory,
  tier: EvidenceTier,
  status: FactorStatus,
  note: string,
  idParts: readonly (string | number)[]
): void {
  const rule = getMuhuratRule(ruleId);
  tokens.push({ ruleId, evidenceId: makeEvidenceId(idParts), factor, category, tier, basis: rule.basis, status, note });
}

export function buildSegmentFactor(input: SegmentFactorInput): MuhuratFactorResult {
  const { snapshot, queryInstantUtc, category } = input;
  const tokens: MuhuratEvidenceToken[] = [];
  const unavailableReasons: Array<{ code: string; message: string }> = [];
  const partialFlags: string[] = [];

  const instantMs = Date.parse(queryInstantUtc);
  if (!Number.isFinite(instantMs)) {
    unavailableReasons.push({ code: "INVALID_QUERY_INSTANT", message: `queryInstantUtc ${queryInstantUtc} invalid.` });
    return { factor: "RAHU_KAAL", category, tokens, netTier: 0, unavailableReasons, partialFlags };
  }

  // --- Universal CAUTION segments (all six categories) ---
  const cautionSegs: Array<[string, string, PremiumTimedPeriod | null]> = [
    ["RAHU_KAAL_V1", "RAHU_KAAL", snapshot.rahuKaal],
    ["GULIKA_KAAL_V1", "GULIKA_KAAL", snapshot.gulika],
    ["YAMAGANDA_V1", "YAMAGANDA", snapshot.yamaganda],
  ];
  for (const [ruleId, factor, seg] of cautionSegs) {
    if (!seg) { unavailableReasons.push({ code: `${factor}_MISSING`, message: `${factor} window unavailable.` }); continue; }
    if (within(instantMs, seg)) {
      push(tokens, ruleId, factor, category, -1, "CAUTION",
        `Instant overlaps ${factor} (planning caution reference)`, [factor, seg.startUtc]);
    }
  }

  // --- Godhuli (twilight around sunset): CAUTION for business/travel; else neutral (no token) ---
  if (snapshot.sunset) {
    const sunsetMs = Date.parse(snapshot.sunset.utc);
    if (Number.isFinite(sunsetMs)) {
      const halfMs = GODHULI_HALF_WINDOW_MIN * 60_000;
      if (instantMs >= sunsetMs - halfMs && instantMs <= sunsetMs + halfMs) {
        if (category === "BUSINESS_WORK_START" || category === "TRAVEL_START") {
          push(tokens, "GODHULI_V1", "GODHULI", category, -1, "CAUTION",
            `Instant within Godhuli twilight (±${GODHULI_HALF_WINDOW_MIN}m of sunset) — CAUTION for ${category}`, ["GODHULI", category]);
        }
      }
    }
  } else {
    partialFlags.push("SUNSET_UNAVAILABLE");
  }

  // --- Applicable SUPPORTIVE overlays (Abhijit / Brahma per category) ---
  const overlays = CATEGORY_SUPPORTIVE_OVERLAYS[category];
  if (overlays.includes("ABHIJIT_MUHURTA")) {
    const abh = snapshot.abhijit;
    if (abh && within(instantMs, abh)) {
      push(tokens, "ABHIJIT_MUHURTA_V1", "ABHIJIT_MUHURTA", category, 1, "SUPPORTIVE",
        "Instant within Abhijit Muhurta (supportive overlay)", ["ABHIJIT", abh.startUtc]);
    }
  }
  if (overlays.includes("BRAHMA_MUHURTA")) {
    const br = snapshot.brahmaMuhurta;
    if (br && within(instantMs, br)) {
      push(tokens, "BRAHMA_MUHURTA_V1", "BRAHMA_MUHURTA", category, 1, "SUPPORTIVE",
        "Instant within Brahma Muhurta (supportive overlay for spiritual practice)", ["BRAHMA", br.startUtc]);
    }
  }
  // TRAVEL_START: Abhijit applies only on Wednesday (contract §5.6); snapshot.abhijit exposes
  // wednesdayExclusionConvention. Handled by the empty overlay list for TRAVEL_START in
  // CATEGORY_SUPPORTIVE_OVERLAYS (no Abhijit token emitted for travel in V1).

  const netTier = tokens.reduce((acc, t) => acc + t.tier, 0);
  return { factor: "RAHU_KAAL", category, tokens, netTier, unavailableReasons, partialFlags };
}
