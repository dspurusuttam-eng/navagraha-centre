// Card 13.2B1 — Panchang eligibility factor (pure).
// Reads the Card 9 PremiumPanchangSnapshot; emits Vara / Tithi / Nakshatra / Yoga / Karana
// evidence tokens using ONLY registered rule IDs and pinned tables from constants.ts.
// Contract §5 + §17.1. Does NOT read segments (Rahu/Gulika/Yamaganda/Abhijit/Brahma) —
// those are handled by the Card 13.2B2 segment overlay engine.
import type { PremiumPanchangSnapshot } from "@/modules/panchang/premium";
import {
  RIKTA_TITHI_CATEGORY_CAUTION_V1,
  TITHI_CLASSIFICATION,
  NAKSHATRA_ACTIVITY_CLASS,
  YOGA_CLASSIFICATION_V1,
  VARA_ELIGIBILITY_V1,
  type NakshatraActivityClass,
  type YogaTier,
} from "@/modules/muhurta/premium/constants";
import type {
  EvidenceTier,
  FactorStatus,
  MuhuratEventCategory,
  MuhuratEvidenceToken,
  RuleBasis,
} from "@/modules/muhurta/premium/types";
import { getMuhuratRule } from "@/modules/muhurta/premium/rule-registry";
import { makeEvidenceId, type MuhuratFactorResult } from "@/modules/muhurta/premium/factors/factor-types";

function pushToken(
  tokens: MuhuratEvidenceToken[],
  ruleId: string,
  factor: string,
  category: MuhuratEventCategory,
  tier: EvidenceTier,
  status: FactorStatus,
  note: string,
  evidenceIdParts: readonly (string | number)[]
): void {
  const rule = getMuhuratRule(ruleId); // throws on unknown
  tokens.push({
    ruleId,
    evidenceId: makeEvidenceId(evidenceIdParts),
    factor,
    category,
    tier,
    basis: rule.basis as RuleBasis,
    status,
    note,
  });
}

function varaTierToEvidence(tierLabel: "SUPPORTIVE" | "NEUTRAL" | "CAUTION"): { tier: EvidenceTier; status: FactorStatus } {
  if (tierLabel === "SUPPORTIVE") return { tier: 1, status: "SUPPORTIVE" };
  if (tierLabel === "CAUTION") return { tier: -1, status: "CAUTION" };
  return { tier: 0, status: "NEUTRAL" };
}

/**
 * Category-vs-nakshatra activity class rule (contract §5.3).
 * Returns null when the mapping is neutral for the category.
 */
function nakshatraActivityRule(
  category: MuhuratEventCategory,
  activityClass: NakshatraActivityClass
): { tier: EvidenceTier; status: FactorStatus; note: string } | null {
  // Universal CAUTION for SHARP nakshatras (except spiritual practice which is neutral there)
  if (activityClass === "SHARP_TIKSHNA_UGRA") {
    if (category === "EDUCATION_START") {
      return { tier: -1, status: "CAUTION", note: "Sharp Nakshatra → CAUTION for education (§9, SHARP_NAKSHATRA_EDUCATION_V1)" };
    }
    return { tier: -1, status: "CAUTION", note: "Sharp (Tikshna/Ugra) Nakshatra classification" };
  }
  switch (category) {
    case "TRAVEL_START":
      if (activityClass === "MOVABLE_CHARA") return { tier: 1, status: "SUPPORTIVE", note: "Movable Nakshatra supportive for travel" };
      return null;
    case "SPIRITUAL_PRACTICE":
      if (activityClass === "SOFT_MRIDU") return { tier: 1, status: "SUPPORTIVE", note: "Soft Nakshatra supportive for spiritual practice" };
      return null;
    case "EDUCATION_START":
      if (activityClass === "SOFT_MRIDU") return { tier: 1, status: "SUPPORTIVE", note: "Soft Nakshatra supportive for education" };
      return null;
    case "BUSINESS_WORK_START":
      if (activityClass === "SWIFT_KSHIPRA_LAGHU") return { tier: 1, status: "SUPPORTIVE", note: "Swift Nakshatra supportive for business" };
      return null;
    default:
      return null;
  }
}

export type PanchangFactorInput = {
  snapshot: PremiumPanchangSnapshot;
  category: MuhuratEventCategory;
};

/**
 * Emits Vara + Tithi + Nakshatra + Yoga + Karana eligibility tokens.
 * Bhadra / Rikta / Kshaya / Vriddhi flags are emitted; hard prohibitions are enforced
 * downstream by the dosha factor + ranker (this factor never mutates status by itself).
 */
export function buildPanchangFactor(input: PanchangFactorInput): MuhuratFactorResult {
  const { snapshot, category } = input;
  const tokens: MuhuratEvidenceToken[] = [];
  const unavailableReasons: Array<{ code: string; message: string }> = [];
  const partialFlags: string[] = [];

  // --- Vara ------------------------------------------------------------------
  if (snapshot.vara) {
    const row = VARA_ELIGIBILITY_V1[category];
    const cell = row[snapshot.vara.index];
    if (cell) {
      const { tier, status } = varaTierToEvidence(cell);
      pushToken(tokens, "VARA_ELIGIBILITY_V1", "VARA", category, tier, status,
        `Vara ${snapshot.vara.name} (weekday ${snapshot.vara.index}) tier ${cell}`,
        ["VARA", snapshot.vara.index, cell]);
    }
  } else {
    unavailableReasons.push({ code: "VARA_MISSING", message: "Panchang vara unavailable." });
  }

  // --- Tithi ----------------------------------------------------------------
  if (snapshot.tithi) {
    // Tithi 1..15 within paksha; Kshaya/Vriddhi flags handled via transitions[] if present.
    const t = snapshot.tithi.index;
    const cls = TITHI_CLASSIFICATION[t];
    if (cls) {
      pushToken(tokens, "TITHI_PAKSHA_CLASSIFICATION_V1", "TITHI", category, 0, "NEUTRAL",
        `Tithi ${t} ${snapshot.tithi.name} class=${cls} paksha=${snapshot.paksha ?? "?"}`,
        ["TITHI", snapshot.paksha ?? "unknown", t, cls]);
    }
    // Rikta rule (§17.1 — PRODUCT_NORMALIZED)
    if (cls === "RIKTA") {
      const cautionForCategory = RIKTA_TITHI_CATEGORY_CAUTION_V1[category];
      if (cautionForCategory) {
        pushToken(tokens, "RIKTA_TITHI_CATEGORY_SPECIFIC_V1", "TITHI", category, -1, "CAUTION",
          `Rikta Tithi (${t}) caution for ${category}`,
          ["RIKTA_TITHI", t, category]);
      }
    }
  } else {
    unavailableReasons.push({ code: "TITHI_MISSING", message: "Panchang tithi unavailable." });
  }

  // --- Nakshatra ------------------------------------------------------------
  if (snapshot.nakshatra) {
    const nakIdx = snapshot.nakshatra.index; // 0..26 per Card 9 contract
    if (nakIdx >= 0 && nakIdx < 27) {
      const activity = NAKSHATRA_ACTIVITY_CLASS[nakIdx]!;
      pushToken(tokens, "NAKSHATRA_ACTIVITY_CLASS_V1", "NAKSHATRA", category, 0, "NEUTRAL",
        `Nakshatra ${snapshot.nakshatra.name} (index ${nakIdx}) activity=${activity}`,
        ["NAKSHATRA_ACTIVITY", nakIdx, activity]);
      const rule = nakshatraActivityRule(category, activity);
      if (rule) {
        const ruleId = category === "EDUCATION_START" && activity === "SHARP_TIKSHNA_UGRA"
          ? "SHARP_NAKSHATRA_EDUCATION_V1"
          : "NAKSHATRA_ACTIVITY_CLASS_V1";
        pushToken(tokens, ruleId, "NAKSHATRA", category, rule.tier, rule.status, rule.note,
          ["NAKSHATRA_CATEGORY", nakIdx, activity, category]);
      }
    }
  } else {
    unavailableReasons.push({ code: "NAKSHATRA_MISSING", message: "Panchang nakshatra unavailable." });
  }

  // --- Yoga -----------------------------------------------------------------
  if (snapshot.yoga) {
    const yidx = snapshot.yoga.index; // 0..26 (Card 9 contract)
    if (yidx >= 0 && yidx < 27) {
      const yogaTier: YogaTier = YOGA_CLASSIFICATION_V1[yidx] ?? "NEUTRAL";
      const map: Record<YogaTier, { tier: EvidenceTier; status: FactorStatus }> = {
        SUPPORTIVE: { tier: 1, status: "SUPPORTIVE" },
        NEUTRAL: { tier: 0, status: "NEUTRAL" },
        CAUTION: { tier: -1, status: "CAUTION" },
      };
      const { tier, status } = map[yogaTier];
      pushToken(tokens, "YOGA_CLASSIFICATION_V1", "YOGA", category, tier, status,
        `Yoga ${snapshot.yoga.name} (index ${yidx}) tier=${yogaTier}`,
        ["YOGA", yidx, yogaTier]);
    }
  } else {
    unavailableReasons.push({ code: "YOGA_MISSING", message: "Panchang yoga unavailable." });
  }

  // --- Karana (Bhadra flag only in V1; other karanas neutral) ---------------
  if (snapshot.karana) {
    const kName = snapshot.karana.name;
    const kIdx = snapshot.karana.index;
    // Card 9 emits a `Vishti` karana under the Bhadra name; the dosha factor enforces
    // the universal prohibition. This factor emits a NEUTRAL informational token so the
    // ranker can trace the karana state; Bhadra itself is a hard prohibition (Dosha factor).
    const isBhadra = /^vishti$|^bhadra$/i.test(kName);
    if (isBhadra) {
      pushToken(tokens, "TITHI_PAKSHA_CLASSIFICATION_V1", "KARANA", category, 0, "NEUTRAL",
        `Karana ${kName} (Bhadra/Vishti) — hard prohibition enforced by dosha factor`,
        ["KARANA_BHADRA_MARKER", kIdx]);
    } else {
      pushToken(tokens, "TITHI_PAKSHA_CLASSIFICATION_V1", "KARANA", category, 0, "NEUTRAL",
        `Karana ${kName} (index ${kIdx}) — no category-specific rule in V1`,
        ["KARANA", kIdx, kName]);
    }
  } else {
    unavailableReasons.push({ code: "KARANA_MISSING", message: "Panchang karana unavailable." });
  }

  const netTier = tokens.reduce((acc, t) => acc + t.tier, 0);
  return {
    factor: "VARA",
    category,
    tokens,
    netTier,
    unavailableReasons,
    partialFlags,
  };
}
