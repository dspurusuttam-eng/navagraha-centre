// Card 13.2B2 — Lagna quality + Lagna-lord + 8th-house malefic + 7th-house travel factor (pure).
// Consumes pre-resolved chart primitives (the Card 13.2C orchestrator resolves the natal chart
// via existing astrology exports and passes these in). Uses only registered rule IDs + the pinned
// RASHI_QUALITY / CATEGORY_PREFERRED_LAGNA_QUALITY tables. Contract §8.1.
import {
  RASHI_QUALITY,
  CATEGORY_PREFERRED_LAGNA_QUALITY,
} from "@/modules/muhurta/premium/constants";
import { getMuhuratRule } from "@/modules/muhurta/premium/rule-registry";
import type {
  EvidenceTier,
  FactorStatus,
  MuhuratEventCategory,
  MuhuratEvidenceToken,
} from "@/modules/muhurta/premium/types";
import { makeEvidenceId, type MuhuratFactorResult } from "@/modules/muhurta/premium/factors/factor-types";

export type LagnaFactorInput = {
  /** 0..11 Aries..Pisces at the candidate window start; null when chart unavailable. */
  lagnaSignIndex: number | null;
  /** House (1..12) occupied by the Lagna lord; null when unknown. */
  lagnaLordHouse: number | null;
  /** True when a natural malefic (Sun/Mars/Saturn/Rahu/Ketu) occupies the 8th house. */
  maleficInEighth: boolean | null;
  /** For TRAVEL_START: occupant nature of the 7th house. */
  seventhHouseOccupant: "benefic" | "malefic" | "empty" | null;
  category: MuhuratEventCategory;
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

export function buildLagnaFactor(input: LagnaFactorInput): MuhuratFactorResult {
  const { lagnaSignIndex, lagnaLordHouse, maleficInEighth, seventhHouseOccupant, category } = input;
  const tokens: MuhuratEvidenceToken[] = [];
  const unavailableReasons: Array<{ code: string; message: string }> = [];
  const partialFlags: string[] = [];

  // --- Lagna quality (Fixed/Movable/Dual) ---
  if (lagnaSignIndex != null && Number.isInteger(lagnaSignIndex) && lagnaSignIndex >= 0 && lagnaSignIndex < 12) {
    const quality = RASHI_QUALITY[lagnaSignIndex]!;
    const preferred = CATEGORY_PREFERRED_LAGNA_QUALITY[category];
    if (preferred && quality === preferred) {
      push(tokens, "LAGNA_QUALITY_V1", "LAGNA_QUALITY", category, 1, "SUPPORTIVE",
        `Lagna ${quality} matches preferred ${preferred} for ${category}`, ["LAGNA_QUALITY", lagnaSignIndex, quality]);
    } else {
      push(tokens, "LAGNA_QUALITY_V1", "LAGNA_QUALITY", category, 0, "NEUTRAL",
        `Lagna ${quality}; category preference=${preferred ?? "none"}`, ["LAGNA_QUALITY", lagnaSignIndex, quality]);
    }
  } else {
    unavailableReasons.push({ code: "LAGNA_UNAVAILABLE", message: "Lagna sign unavailable." });
    partialFlags.push("MISSING_NATAL_CHART");
  }

  // --- Lagna-lord placement (kendra/trikona vs dusthana) ---
  if (lagnaLordHouse != null && Number.isInteger(lagnaLordHouse) && lagnaLordHouse >= 1 && lagnaLordHouse <= 12) {
    const kendraTrikona = [1, 4, 5, 7, 9, 10].includes(lagnaLordHouse);
    const dusthana = [6, 8, 12].includes(lagnaLordHouse);
    if (kendraTrikona) {
      push(tokens, "LAGNA_LORD_PLACEMENT_V1", "LAGNA_LORD_PLACEMENT", category, 1, "SUPPORTIVE",
        `Lagna lord in kendra/trikona house ${lagnaLordHouse}`, ["LAGNA_LORD", lagnaLordHouse, "SUPPORTIVE"]);
    } else if (dusthana) {
      push(tokens, "LAGNA_LORD_PLACEMENT_V1", "LAGNA_LORD_PLACEMENT", category, -1, "CAUTION",
        `Lagna lord in dusthana house ${lagnaLordHouse}`, ["LAGNA_LORD", lagnaLordHouse, "CAUTION"]);
    } else {
      push(tokens, "LAGNA_LORD_PLACEMENT_V1", "LAGNA_LORD_PLACEMENT", category, 0, "NEUTRAL",
        `Lagna lord in house ${lagnaLordHouse}`, ["LAGNA_LORD", lagnaLordHouse, "NEUTRAL"]);
    }
  } else if (lagnaLordHouse == null) {
    partialFlags.push("MISSING_NATAL_CHART");
  }

  // --- 8th-house malefic caution (business/vehicle/travel) ---
  if (["BUSINESS_WORK_START", "VEHICLE_PURCHASE", "TRAVEL_START"].includes(category)) {
    if (maleficInEighth === true) {
      push(tokens, "EIGHTH_HOUSE_MALEFIC_V1", "EIGHTH_HOUSE_MALEFIC", category, -1, "CAUTION",
        `Natural malefic in 8th house — CAUTION for ${category}`, ["EIGHTH_MALEFIC", category]);
    } else if (maleficInEighth == null) {
      partialFlags.push("MISSING_NATAL_CHART");
    }
  }

  // --- 7th-house travel factor (TRAVEL_START only) ---
  if (category === "TRAVEL_START") {
    if (seventhHouseOccupant === "malefic") {
      push(tokens, "SEVENTH_HOUSE_TRAVEL_V1", "SEVENTH_HOUSE_TRAVEL", category, -1, "CAUTION",
        "Malefic in 7th house — CAUTION for travel", ["SEVENTH_TRAVEL", "malefic"]);
    } else if (seventhHouseOccupant === "benefic") {
      push(tokens, "SEVENTH_HOUSE_TRAVEL_V1", "SEVENTH_HOUSE_TRAVEL", category, 1, "SUPPORTIVE",
        "Benefic in 7th house — SUPPORTIVE for travel", ["SEVENTH_TRAVEL", "benefic"]);
    } else if (seventhHouseOccupant == null) {
      partialFlags.push("MISSING_NATAL_CHART");
    }
  }

  const netTier = tokens.reduce((acc, t) => acc + t.tier, 0);
  return { factor: "LAGNA_QUALITY", category, tokens, netTier, unavailableReasons, partialFlags };
}
