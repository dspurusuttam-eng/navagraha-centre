// Card 14.2B1 — Muntha engine (pure). Contract §8 / 14.1A decision 5.
// Muntha carries a full longitude advancing 30 deg/year from the natal Lagna longitude.
import { MUNTHA_DEGREES_PER_YEAR, MUNTHA_HOUSE_TIER, signRulerMap, zodiacSignOrder } from "@/modules/varshaphal/premium/constants";
import type { PlanetaryBody, ZodiacSign } from "@/modules/astrology/types";
import type { VarshaphalEvidenceToken, VarshaphalTier } from "@/modules/varshaphal/premium/types";
import { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";
import { norm360, signIndexFromLongitude } from "@/modules/varshaphal/premium/engines/geometry";

export type MunthaInput = {
  /** Natal Lagna sidereal longitude (deg); null when birth time unknown. */
  natalLagnaLongitudeDeg: number | null;
  /** Completed solar years of age (N ≥ 0). */
  yearNumber: number;
  /** Varsha Lagna sign index 0..11; null when the annual ascendant is unavailable. */
  varshaLagnaSignIndex: number | null;
};

export type MunthaResult = {
  status: "CALCULATED" | "PARTIAL" | "UNAVAILABLE";
  longitudeDeg: number | null;
  signIndex: number | null;
  sign: ZodiacSign | null;
  lord: PlanetaryBody | null;
  house: number | null;
  houseTier: VarshaphalTier | null;
  tokens: VarshaphalEvidenceToken[];
  partialFlags: string[];
  unavailableReasons: EngineUnavailable[];
};

export function computeMuntha(input: MunthaInput): MunthaResult {
  const { natalLagnaLongitudeDeg, yearNumber, varshaLagnaSignIndex } = input;
  const tokens: VarshaphalEvidenceToken[] = [];
  const partialFlags: string[] = [];
  const unavailableReasons: EngineUnavailable[] = [];

  if (natalLagnaLongitudeDeg == null || !Number.isFinite(natalLagnaLongitudeDeg) || !Number.isInteger(yearNumber) || yearNumber < 0) {
    unavailableReasons.push({ code: "BIRTH_TIME_REQUIRED", message: "Natal Lagna longitude (exact birth time) required for Muntha." });
    return { status: "UNAVAILABLE", longitudeDeg: null, signIndex: null, sign: null, lord: null, house: null, houseTier: null, tokens, partialFlags, unavailableReasons };
  }

  const longitudeDeg = norm360(natalLagnaLongitudeDeg + yearNumber * MUNTHA_DEGREES_PER_YEAR);
  const signIndex = signIndexFromLongitude(longitudeDeg);
  const sign = zodiacSignOrder[signIndex]!;
  const lord = signRulerMap[sign];
  tokens.push(buildToken("MUNTHA_PROGRESSION_V1", "MUNTHA", 0, "NEUTRAL",
    `Muntha longitude ${longitudeDeg.toFixed(4)} (natal Lagna + ${yearNumber}x30) in ${sign}`,
    ["MUNTHA", yearNumber, signIndex]));
  tokens.push(buildToken("MUNTHA_LORD_V1", "MUNTHA", 0, "NEUTRAL",
    `Muntha lord ${lord} (lord of ${sign})`, ["MUNTHA_LORD", sign, lord]));

  let house: number | null = null;
  let houseTier: VarshaphalTier | null = null;
  if (varshaLagnaSignIndex != null && Number.isInteger(varshaLagnaSignIndex) && varshaLagnaSignIndex >= 0 && varshaLagnaSignIndex < 12) {
    house = ((signIndex - varshaLagnaSignIndex + 12) % 12) + 1;
    houseTier = MUNTHA_HOUSE_TIER[house] ?? 0;
    const status = houseTier > 0 ? "SUPPORTIVE" : houseTier < 0 ? "CAUTION" : "NEUTRAL";
    tokens.push(buildToken("MUNTHA_HOUSE_TIER_V1", "MUNTHA", houseTier, status,
      `Muntha in annual house ${house} (tier ${houseTier})`, ["MUNTHA_HOUSE", house, houseTier]));
  } else {
    partialFlags.push("MISSING_VARSHA_LAGNA");
  }

  return {
    status: partialFlags.length > 0 ? "PARTIAL" : "CALCULATED",
    longitudeDeg, signIndex, sign, lord, house, houseTier,
    tokens, partialFlags, unavailableReasons,
  };
}
