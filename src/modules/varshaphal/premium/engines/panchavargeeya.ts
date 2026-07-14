// Card 14.2B2 — Panchavargeeya Bala engine (pure). Contract §11.1 / 14.1A decisions 1 & 3.
// Griha + Uccha + Hadda + Drekkana + Navamsha (vishwas, max 80) with locked tables.
import {
  DEEP_EXALTATION_LONGITUDE,
  DIGNITY_VISHWA_FRACTION,
  HADDA_BOUNDS,
  PANCHAVARGEEYA_BAND,
  PANCHAVARGEEYA_COMPONENT_MAX,
  RELATIONSHIP_VISHWA_FRACTION,
  signRulerMap,
  zodiacSignOrder,
} from "@/modules/varshaphal/premium/constants";
import type { TajikaGraha, VarshaphalEvidenceToken, VarshaphalTier } from "@/modules/varshaphal/premium/types";
import { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";
import { minimalSeparation, norm360, signIndexFromLongitude } from "@/modules/varshaphal/premium/engines/geometry";
import { dignityInSign, panchadhaRelationship, type DignityInSign } from "@/modules/varshaphal/premium/engines/planetary-relationship";

export type PanchavargeeyaInput = {
  graha: TajikaGraha;
  /** Annual sidereal longitudes of all seven grahas (for relationship components). */
  longitudes: Record<TajikaGraha, number>;
  /** Drekkana (D3) sign index 0..11 of `graha`; null → component omitted (partial). */
  d3SignIndex?: number | null;
  /** Navamsha (D9) sign index 0..11 of `graha`; null → component omitted (partial). */
  d9SignIndex?: number | null;
};

export type PanchavargeeyaResult = {
  graha: TajikaGraha;
  griha: number;
  uccha: number;
  hadda: number;
  drekkana: number;
  navamsha: number;
  totalVishwa: number;
  band: "SUPPORTIVE" | "NEUTRAL" | "CAUTION";
  tier: VarshaphalTier;
  tokens: VarshaphalEvidenceToken[];
  partialFlags: string[];
  unavailableReasons: EngineUnavailable[];
};

function dignityFraction(dig: DignityInSign): number {
  switch (dig) {
    case "OWN_EXALT": return DIGNITY_VISHWA_FRACTION.OWN_EXALT;
    case "FRIEND": return DIGNITY_VISHWA_FRACTION.FRIEND;
    case "NEUTRAL": return DIGNITY_VISHWA_FRACTION.NEUTRAL;
    case "ENEMY": return DIGNITY_VISHWA_FRACTION.ENEMY;
    default: return DIGNITY_VISHWA_FRACTION.DEBILITATED;
  }
}

export function computePanchavargeeyaBala(input: PanchavargeeyaInput): PanchavargeeyaResult {
  const { graha: P, longitudes, d3SignIndex, d9SignIndex } = input;
  const tokens: VarshaphalEvidenceToken[] = [];
  const partialFlags: string[] = [];
  const unavailableReasons: EngineUnavailable[] = [];

  const lonP = norm360(longitudes[P]);
  const signP = signIndexFromLongitude(lonP);
  const signName = zodiacSignOrder[signP]!;

  // --- Griha (Kshetra) Bala ---
  const digHome = dignityInSign(P, signP);
  const lordP = signRulerMap[signName] as TajikaGraha;
  const grihaRel = digHome === "OWN_EXALT"
    ? "OWN_EXALT" as const
    : panchadhaRelationship(P, lordP, signP, signIndexFromLongitude(longitudes[lordP]));
  const griha = PANCHAVARGEEYA_COMPONENT_MAX.GRIHA * RELATIONSHIP_VISHWA_FRACTION[grihaRel];
  tokens.push(buildToken("PANCHAVARGEEYA_GRIHA_V1", "PANCHAVARGEEYA_BALA", 0, "NEUTRAL",
    `Griha ${griha.toFixed(2)} (${grihaRel} to ${lordP})`, ["GRIHA", P, grihaRel]));

  // --- Uccha Bala ---
  // Distance from the DEBILITATION point: 0 at debilitation, 180 at exaltation
  // => max Uccha at exaltation (standard Parashari form). Contract §11.1B text intent
  // ("20 at exaltation, 0 at debilitation") is authoritative; the formula is corrected
  // to `max * arcFromDebilitation / 180` (14.2B2 defect fix; see report).
  const debLon = norm360(DEEP_EXALTATION_LONGITUDE[P] + 180);
  const arcFromDeb = minimalSeparation(lonP, debLon);
  const uccha = (PANCHAVARGEEYA_COMPONENT_MAX.UCCHA * arcFromDeb) / 180;
  tokens.push(buildToken("PANCHAVARGEEYA_UCCHA_V1", "PANCHAVARGEEYA_BALA", 0, "NEUTRAL",
    `Uccha ${uccha.toFixed(2)} (arc from debilitation ${arcFromDeb.toFixed(2)})`, ["UCCHA", P]));

  // --- Hadda Bala ---
  const degInSign = lonP % 30;
  const bound = HADDA_BOUNDS.find((b) => b.sign === signName && degInSign >= b.startDeg && degInSign < b.endDeg)!;
  const haddaRel = bound.lord === P
    ? "OWN_EXALT" as const
    : panchadhaRelationship(P, bound.lord, signP, signIndexFromLongitude(longitudes[bound.lord]));
  const hadda = PANCHAVARGEEYA_COMPONENT_MAX.HADDA * RELATIONSHIP_VISHWA_FRACTION[haddaRel];
  tokens.push(buildToken("PANCHAVARGEEYA_HADDA_V1", "PANCHAVARGEEYA_BALA", 0, "NEUTRAL",
    `Hadda ${hadda.toFixed(2)} (${haddaRel} to bound lord ${bound.lord})`, ["HADDA", P, bound.lord]));

  // --- Drekkana / Navamsha Bala (need D3/D9 from Card 4) ---
  let drekkana = 0;
  let navamsha = 0;
  if (d3SignIndex != null && Number.isInteger(d3SignIndex) && d3SignIndex >= 0 && d3SignIndex < 12) {
    drekkana = PANCHAVARGEEYA_COMPONENT_MAX.DREKKANA * dignityFraction(dignityInSign(P, d3SignIndex));
    tokens.push(buildToken("PANCHAVARGEEYA_DREKKANA_V1", "PANCHAVARGEEYA_BALA", 0, "NEUTRAL",
      `Drekkana ${drekkana.toFixed(2)}`, ["DREKKANA", P, d3SignIndex]));
  } else {
    partialFlags.push("MISSING_D3_D9");
  }
  if (d9SignIndex != null && Number.isInteger(d9SignIndex) && d9SignIndex >= 0 && d9SignIndex < 12) {
    navamsha = PANCHAVARGEEYA_COMPONENT_MAX.NAVAMSHA * dignityFraction(dignityInSign(P, d9SignIndex));
    tokens.push(buildToken("PANCHAVARGEEYA_NAVAMSHA_V1", "PANCHAVARGEEYA_BALA", 0, "NEUTRAL",
      `Navamsha ${navamsha.toFixed(2)}`, ["NAVAMSHA", P, d9SignIndex]));
  } else if (!partialFlags.includes("MISSING_D3_D9")) {
    partialFlags.push("MISSING_D3_D9");
  }

  const totalVishwa = griha + uccha + hadda + drekkana + navamsha;
  const band = totalVishwa >= PANCHAVARGEEYA_BAND.SUPPORTIVE_MIN ? "SUPPORTIVE"
    : totalVishwa >= PANCHAVARGEEYA_BAND.NEUTRAL_MIN ? "NEUTRAL" : "CAUTION";
  const tier: VarshaphalTier = band === "SUPPORTIVE" ? 1 : band === "CAUTION" ? -1 : 0;
  tokens.push(buildToken("PANCHAVARGEEYA_BAND_V1", "PANCHAVARGEEYA_BALA", tier, band,
    `Panchavargeeya total ${totalVishwa.toFixed(2)} vishwa -> ${band}`, ["PV_BAND", P, band]));

  return { graha: P, griha, uccha, hadda, drekkana, navamsha, totalVishwa, band, tier, tokens, partialFlags, unavailableReasons };
}
