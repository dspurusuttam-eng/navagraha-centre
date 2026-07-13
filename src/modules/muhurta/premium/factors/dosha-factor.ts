// Card 13.2B1 — Dosha / hard-prohibition factor (pure).
// Emits AVOID tokens (tier -2) for universal + category-specific hard prohibitions.
// Inputs come from upstream engines (Card 9 Panchang for Bhadra/Rikta; Card 6 Gochar for
// Sade Sati / Ashtama Shani; eclipse and Panchaka flags supplied by caller). This factor
// NEVER filters buckets on its own — it emits structured evidence; the ranker's stage-1
// hard-prohibition filter uses these tokens to move buckets to AVOID.
import type { PremiumPanchangSnapshot } from "@/modules/panchang/premium";
import {
  CATEGORY_UNIVERSAL_PROHIBITIONS,
  HARD_PROHIBITION_BASIS,
  RIKTA_TITHI_CATEGORY_CAUTION_V1,
  TITHI_CLASSIFICATION,
  type HardProhibitionId,
} from "@/modules/muhurta/premium/constants";
import { getMuhuratRule } from "@/modules/muhurta/premium/rule-registry";
import type {
  MuhuratEventCategory,
  MuhuratEvidenceToken,
} from "@/modules/muhurta/premium/types";
import { makeEvidenceId, type MuhuratFactorResult } from "@/modules/muhurta/premium/factors/factor-types";

/**
 * External-signal inputs the factor reads. All are optional and structured — if a signal is
 * unknown, the factor does not fabricate; the corresponding token simply isn't emitted.
 * Gochar (Card 6) supplies sadeSatiPhase and ashtamaShani; Panchaka is a Moon-position flag
 * the orchestrator computes upstream; eclipseDay comes from an eclipse ephemeris pass.
 */
export type DoshaExternalSignals = {
  /** true when the query day overlaps a Solar or Lunar eclipse (Card 6 / Card 11 upstream). */
  eclipseDay: boolean | null;
  /** true when the transit Moon path is on the Aquarius→Pisces Panchaka arc. */
  panchakaActive: boolean | null;
  /** Card 6 Gochar: Sade Sati Phase 2 (transit Saturn in 2nd from natal Moon). */
  sadeSatiPhase2: boolean | null;
  /** Card 6 Gochar: Ashtama Shani (transit Saturn in 8th from natal Moon). */
  ashtamaShani: boolean | null;
  /** true when a planet is within ±1° of its Mrityu Bhaga longitude. */
  mrityuBhagaHit: boolean | null;
  /** true when the query instant is within ±48′ of a Rashi/Nakshatra junction. */
  gandAnta: boolean | null;
};

export type DoshaFactorInput = {
  snapshot: PremiumPanchangSnapshot;
  category: MuhuratEventCategory;
  signals: DoshaExternalSignals;
};

function pushProhibition(
  tokens: MuhuratEvidenceToken[],
  ruleId: HardProhibitionId | string,
  factor: string,
  category: MuhuratEventCategory,
  note: string,
  evidenceIdParts: readonly (string | number)[]
): void {
  const rule = getMuhuratRule(ruleId);
  tokens.push({
    ruleId,
    evidenceId: makeEvidenceId(evidenceIdParts),
    factor,
    category,
    tier: -2,
    basis: rule.basis,
    status: "PROHIBITED",
    note,
  });
}

/**
 * Detects Bhadra/Vishti Karana purely from the Panchang snapshot's karana name.
 * The panchang engine emits `Vishti` (canonical) for this karana; some variants also use
 * "Bhadra". This is a straight name match, no further model inference.
 */
function karanaIsBhadra(karanaName: string | undefined): boolean {
  if (!karanaName) return false;
  return /^vishti$|^bhadra$/i.test(karanaName);
}

export function buildDoshaFactor(input: DoshaFactorInput): MuhuratFactorResult {
  const { snapshot, category, signals } = input;
  const tokens: MuhuratEvidenceToken[] = [];
  const unavailableReasons: Array<{ code: string; message: string }> = [];
  const partialFlags: string[] = [];

  const applicableUniversal = CATEGORY_UNIVERSAL_PROHIBITIONS[category];

  // --- BHADRA_V1 (universal for all V1 categories) ---
  if (applicableUniversal.includes("BHADRA_V1")) {
    if (snapshot.karana && karanaIsBhadra(snapshot.karana.name)) {
      pushProhibition(tokens, "BHADRA_V1", "BHADRA", category,
        `Bhadra/Vishti karana ${snapshot.karana.name} active (classical universal prohibition)`,
        ["BHADRA", snapshot.karana.index, snapshot.karana.name]);
    }
  }

  // --- GAND_ANTA_V1 (business/travel/vehicle categories) ---
  if (applicableUniversal.includes("GAND_ANTA_V1")) {
    if (signals.gandAnta === true) {
      pushProhibition(tokens, "GAND_ANTA_V1", "GAND_ANTA", category,
        `Rashi/Nakshatra junction ±48' active (classical universal prohibition for ${category})`,
        ["GAND_ANTA", category]);
    } else if (signals.gandAnta === null) {
      partialFlags.push("GAND_ANTA_UNKNOWN");
    }
  }

  // --- PANCHAKA_V1 (travel/vehicle; product-normalized single flag) ---
  if (applicableUniversal.includes("PANCHAKA_V1")) {
    if (signals.panchakaActive === true) {
      pushProhibition(tokens, "PANCHAKA_V1", "PANCHAKA", category,
        `Panchaka (Aq→Pi Moon path) active — product-normalized universal prohibition for ${category}`,
        ["PANCHAKA", category]);
    } else if (signals.panchakaActive === null) {
      partialFlags.push("PANCHAKA_UNKNOWN");
    }
  }

  // --- ECLIPSE_DAY_V1 (business/travel/vehicle/general/education — all except spiritual) ---
  if (applicableUniversal.includes("ECLIPSE_DAY_V1")) {
    if (signals.eclipseDay === true) {
      pushProhibition(tokens, "ECLIPSE_DAY_V1", "ECLIPSE_DAY", category,
        `Eclipse day universal CAUTION → AVOID for ${category} (product-normalized)`,
        ["ECLIPSE_DAY", category]);
    } else if (signals.eclipseDay === null) {
      partialFlags.push("ECLIPSE_DAY_UNKNOWN");
    }
  }

  // --- MRITYU_BHAGA_V1 (business/vehicle categories) ---
  if (applicableUniversal.includes("MRITYU_BHAGA_V1")) {
    if (signals.mrityuBhagaHit === true) {
      pushProhibition(tokens, "MRITYU_BHAGA_V1", "MRITYU_BHAGA", category,
        `Planet within ±1° of Mrityu Bhaga (classical prohibition for ${category})`,
        ["MRITYU_BHAGA", category]);
    } else if (signals.mrityuBhagaHit === null) {
      partialFlags.push("MRITYU_BHAGA_UNKNOWN");
    }
  }

  // --- Non-prohibition dosha CAUTION overlays (tier -1) ---
  // Sade Sati Phase 2 → CAUTION for business (§9)
  if (signals.sadeSatiPhase2 === true && category === "BUSINESS_WORK_START") {
    const rule = getMuhuratRule("SADE_SATI_PHASE_2_V1");
    tokens.push({
      ruleId: "SADE_SATI_PHASE_2_V1",
      evidenceId: makeEvidenceId(["SADE_SATI_2", category]),
      factor: "SADE_SATI_PHASE_2",
      category,
      tier: -1,
      basis: rule.basis,
      status: "CAUTION",
      note: "Transit Saturn in 2nd from natal Moon (Sade Sati Phase 2) — CAUTION for business (classical)",
    });
  } else if (signals.sadeSatiPhase2 === null && category === "BUSINESS_WORK_START") {
    partialFlags.push("SADE_SATI_UNKNOWN");
  }

  // Ashtama Shani → CAUTION for business/travel (§9)
  if (signals.ashtamaShani === true && (category === "BUSINESS_WORK_START" || category === "TRAVEL_START")) {
    const rule = getMuhuratRule("ASHTAMA_SHANI_V1");
    tokens.push({
      ruleId: "ASHTAMA_SHANI_V1",
      evidenceId: makeEvidenceId(["ASHTAMA_SHANI", category]),
      factor: "ASHTAMA_SHANI",
      category,
      tier: -1,
      basis: rule.basis,
      status: "CAUTION",
      note: `Transit Saturn in 8th from natal Moon (Ashtama Shani) — CAUTION for ${category} (classical)`,
    });
  } else if (signals.ashtamaShani === null && (category === "BUSINESS_WORK_START" || category === "TRAVEL_START")) {
    partialFlags.push("ASHTAMA_SHANI_UNKNOWN");
  }

  // Rikta Tithi CAUTION for business/education (§17.1, PRODUCT_NORMALIZED)
  if (snapshot.tithi) {
    const t = snapshot.tithi.index;
    const cls = TITHI_CLASSIFICATION[t];
    if (cls === "RIKTA" && RIKTA_TITHI_CATEGORY_CAUTION_V1[category]) {
      const rule = getMuhuratRule("RIKTA_TITHI_CATEGORY_SPECIFIC_V1");
      tokens.push({
        ruleId: "RIKTA_TITHI_CATEGORY_SPECIFIC_V1",
        evidenceId: makeEvidenceId(["RIKTA_TITHI_DOSHA", t, category]),
        factor: "RIKTA_TITHI",
        category,
        tier: -1,
        basis: rule.basis,
        status: "CAUTION",
        note: `Rikta Tithi ${t} — CAUTION for ${category} (product-normalized, §17.1)`,
      });
    }
  }

  // Basis label integrity — every emitted prohibition MUST match HARD_PROHIBITION_BASIS.
  for (const tok of tokens) {
    if (tok.tier === -2 && tok.ruleId in HARD_PROHIBITION_BASIS) {
      const expected = HARD_PROHIBITION_BASIS[tok.ruleId as HardProhibitionId];
      if (tok.basis !== expected) {
        throw new Error(`Dosha token ${tok.ruleId} basis=${tok.basis} expected ${expected}`);
      }
    }
  }

  const netTier = tokens.reduce((acc, t) => acc + t.tier, 0);
  return { factor: "BHADRA", category, tokens, netTier, unavailableReasons, partialFlags };
}
