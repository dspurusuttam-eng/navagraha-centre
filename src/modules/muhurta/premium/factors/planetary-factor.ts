// Card 13.2B2 — planetary factor (pure).
// KARAKA dignity/retrograde/combust + Ashtakavarga BAV overlay (Card 7) + Dasha-lord karaka
// (Card 5) + Mercury-retrograde travel. Consumes pre-resolved primitives (the Card 13.2C
// orchestrator resolves Card 5/7 via their existing public exports and passes these in).
// Uses only registered rule IDs + the pinned EVENT_KARAKA_V1 table (no duplicated weights).
import { EVENT_KARAKA_V1, type Karaka } from "@/modules/muhurta/premium/constants";
import { getMuhuratRule } from "@/modules/muhurta/premium/rule-registry";
import type {
  EvidenceTier,
  FactorStatus,
  MuhuratEventCategory,
  MuhuratEvidenceToken,
} from "@/modules/muhurta/premium/types";
import { makeEvidenceId, type MuhuratFactorResult } from "@/modules/muhurta/premium/factors/factor-types";

export type KarakaState = {
  dignity: "own" | "exalted" | "debilitated" | "neutral" | null;
  retrograde: boolean | null;
  combust: boolean | null;
};

export type PlanetaryFactorInput = {
  category: MuhuratEventCategory;
  /** State of the category primary karaka (from EVENT_KARAKA_V1). */
  primaryKaraka: KarakaState;
  /** Ashtakavarga BAV bindu count (0..8) for the primary karaka at transit Moon rashi (Card 7). */
  ashtakavargaBav: number | null;
  /** Currently active Vimshottari Mahadasha (and/or Antardasha) lord (Card 5). */
  activeDashaLord: Karaka | null;
  /** Transit Mercury retrograde flag (used only for TRAVEL_START). */
  mercuryRetrograde: boolean | null;
};

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

export function buildPlanetaryFactor(input: PlanetaryFactorInput): MuhuratFactorResult {
  const { category, primaryKaraka, ashtakavargaBav, activeDashaLord, mercuryRetrograde } = input;
  const tokens: MuhuratEvidenceToken[] = [];
  const unavailableReasons: Array<{ code: string; message: string }> = [];
  const partialFlags: string[] = [];
  const karaka = EVENT_KARAKA_V1[category].primary;

  // --- Karaka dignity ---
  if (primaryKaraka.dignity == null) {
    partialFlags.push("MISSING_NATAL_CHART");
  } else if (primaryKaraka.dignity === "own" || primaryKaraka.dignity === "exalted") {
    push(tokens, "KARAKA_DIGNITY_V1", "KARAKA_DIGNITY", category, 1, "SUPPORTIVE",
      `Karaka ${karaka} ${primaryKaraka.dignity}`, ["KARAKA_DIGNITY", karaka, primaryKaraka.dignity]);
  } else if (primaryKaraka.dignity === "debilitated") {
    push(tokens, "KARAKA_DIGNITY_V1", "KARAKA_DIGNITY", category, -1, "CAUTION",
      `Karaka ${karaka} debilitated`, ["KARAKA_DIGNITY", karaka, "debilitated"]);
  } else {
    push(tokens, "KARAKA_DIGNITY_V1", "KARAKA_DIGNITY", category, 0, "NEUTRAL",
      `Karaka ${karaka} dignity neutral`, ["KARAKA_DIGNITY", karaka, "neutral"]);
  }

  // --- Karaka retrograde (business/vehicle/travel) ---
  if (["BUSINESS_WORK_START", "VEHICLE_PURCHASE", "TRAVEL_START"].includes(category)) {
    if (primaryKaraka.retrograde === true) {
      push(tokens, "KARAKA_RETROGRADE_V1", "KARAKA_RETROGRADE", category, -1, "CAUTION",
        `Karaka ${karaka} retrograde`, ["KARAKA_RETRO", karaka]);
    } else if (primaryKaraka.retrograde == null) {
      partialFlags.push("MISSING_NATAL_CHART");
    }
  }

  // --- Karaka combust (all categories) ---
  if (primaryKaraka.combust === true) {
    push(tokens, "KARAKA_COMBUST_V1", "KARAKA_COMBUST", category, -1, "CAUTION",
      `Karaka ${karaka} combust (<8° of Sun)`, ["KARAKA_COMBUST", karaka]);
  } else if (primaryKaraka.combust == null) {
    partialFlags.push("MISSING_NATAL_CHART");
  }

  // --- Ashtakavarga BAV overlay (Card 7; product-normalized) ---
  if (ashtakavargaBav == null) {
    partialFlags.push("MISSING_ASHTAKAVARGA");
  } else if (Number.isInteger(ashtakavargaBav) && ashtakavargaBav >= 0 && ashtakavargaBav <= 8) {
    // 5..8 supportive, 3..4 neutral, 0..2 caution (product-normalized banding)
    const tier: EvidenceTier = ashtakavargaBav >= 5 ? 1 : ashtakavargaBav <= 2 ? -1 : 0;
    const status: FactorStatus = tier === 1 ? "SUPPORTIVE" : tier === -1 ? "CAUTION" : "NEUTRAL";
    push(tokens, "ASHTAKAVARGA_BALA_PRODUCT_V1", "ASHTAKAVARGA_BAV", category, tier, status,
      `BAV bindu=${ashtakavargaBav} for karaka ${karaka} (Card 7)`, ["ASHTAKAVARGA_BAV", karaka, ashtakavargaBav]);
  } else {
    unavailableReasons.push({ code: "ASHTAKAVARGA_INVALID", message: `BAV bindu ${ashtakavargaBav} out of 0..8.` });
  }

  // --- Dasha-lord karaka overlay (Card 5; product-normalized) ---
  if (activeDashaLord == null) {
    partialFlags.push("MISSING_DASHA_LINEAGE");
  } else {
    const k = EVENT_KARAKA_V1[category];
    const isKaraka = activeDashaLord === k.primary || activeDashaLord === k.secondary;
    if (isKaraka) {
      push(tokens, "DASHA_LORD_KARAKA_V1", "DASHA_LORD_KARAKA", category, 1, "SUPPORTIVE",
        `Active Dasha lord ${activeDashaLord} is a karaka for ${category}`, ["DASHA_LORD", activeDashaLord, category]);
    } else {
      push(tokens, "DASHA_LORD_KARAKA_V1", "DASHA_LORD_KARAKA", category, 0, "NEUTRAL",
        `Active Dasha lord ${activeDashaLord} not a karaka for ${category}`, ["DASHA_LORD", activeDashaLord, category]);
    }
  }

  // --- Mercury retrograde travel (product-normalized; TRAVEL_START only) ---
  if (category === "TRAVEL_START") {
    if (mercuryRetrograde === true) {
      push(tokens, "MERCURY_RETROGRADE_TRAVEL_V1", "KARAKA_RETROGRADE", category, -1, "CAUTION",
        "Transit Mercury retrograde — CAUTION for travel (product-normalized)", ["MERCURY_RETRO_TRAVEL"]);
    } else if (mercuryRetrograde == null) {
      partialFlags.push("MISSING_NATAL_CHART");
    }
  }

  const netTier = tokens.reduce((acc, t) => acc + t.tier, 0);
  return { factor: "KARAKA_DIGNITY", category, tokens, netTier, unavailableReasons, partialFlags };
}
