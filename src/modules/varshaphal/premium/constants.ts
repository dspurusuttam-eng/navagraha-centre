// Card 14.2A — Premium Varshaphal / Tajika: pinned constants + tables (engine-only).
// Every table is labelled per Card 14.1 §16 / 14.1A:
//   CLASSICAL — attested method w/ registered source ID
//   REGISTERED_REFERENCE — standard reference table pinned by edition
//   PRODUCT_NORMALIZED — product pin (threshold / tie-break chosen for determinism)
// Certified constants (sign rulers, dignity sign tables, Vimshottari sequence/years)
// are REUSED read-only from the astrology engine — never duplicated here.
import {
  signRulerMap,
  ownSignsByBody,
  exaltationSignsByBody,
  debilitationSignsByBody,
  dashaSequence,
  dashaYearsByLord,
  daysPerDashaYear,
  zodiacSignOrder,
} from "@/lib/astrology/constants";
import type { ZodiacSign } from "@/modules/astrology/types";
import type { TajikaGraha, VarshaphalTier } from "@/modules/varshaphal/premium/types";

// --- Certified reuse (single source of truth; re-exported, not copied) --------
export {
  signRulerMap,
  ownSignsByBody,
  exaltationSignsByBody,
  debilitationSignsByBody,
  zodiacSignOrder,
};
/** Mudda Dasha reuses the certified Vimshottari sequence + year table (Card 5). */
export const MUDDA_DASHA_SEQUENCE = dashaSequence;
export const MUDDA_DASHA_YEARS = dashaYearsByLord;
export const MUDDA_VIMSHOTTARI_TOTAL_YEARS = 120;
/** Opt-in fixed solar-year fallback ONLY (return-to-return is the default, §14). */
export const SOLAR_YEAR_FIXED_FALLBACK_DAYS = daysPerDashaYear; // 365.2425

// --- §5 Solar-return (Varsha Pravesha) conventions ----------------------------
export const SOLAR_RETURN_TOLERANCE_ARCSEC = 0.001; // PRODUCT_NORMALIZED
export const SOLAR_RETURN_TIME_TOLERANCE_SECONDS = 1; // PRODUCT_NORMALIZED
export const SOLAR_RETURN_MAX_ITERATIONS = 64; // PRODUCT_NORMALIZED
export const SOLAR_RETURN_BRACKET_DAYS = 3; // PRODUCT_NORMALIZED
export const ANNIVERSARY_MATCH_WINDOW_DAYS = 3; // §5.4 PRODUCT_NORMALIZED
export const VARSHAPHAL_MAX_ABS_LATITUDE_DEG = 66.0; // CLASSICAL/engine parity

// --- §8 Muntha ---------------------------------------------------------------
export const MUNTHA_DEGREES_PER_YEAR = 30; // CLASSICAL (one whole sign / year)
/** Muntha house → tier (§8; supportive 1,2,3,10,11 · caution 4,6,8,12 · neutral 5,7,9). */
export const MUNTHA_HOUSE_TIER: Readonly<Record<number, VarshaphalTier>> = {
  1: 1, 2: 1, 3: 1, 4: -1, 5: 0, 6: -1, 7: 0, 8: -1, 9: 0, 10: 1, 11: 1, 12: -1,
};

// --- §9 Tajika aspects + deeptamsha orbs -------------------------------------
export const TAJIKA_ASPECT_ANGLES = [0, 60, 90, 120, 180] as const; // CLASSICAL
export type TajikaAspectAngle = (typeof TAJIKA_ASPECT_ANGLES)[number];
/** Deeptamsha (orb of brightness), degrees — REGISTERED_REFERENCE. */
export const DEEPTAMSHA: Readonly<Record<TajikaGraha, number>> = {
  SUN: 15, MOON: 12, MARS: 8, MERCURY: 7, JUPITER: 9, VENUS: 7, SATURN: 9,
};
/** In-orb allowance = half-sum of the two planets' deeptamsha (§9.3, PRODUCT_NORMALIZED). */
export const ASPECT_ORB_MODE = "HALF_SUM_DEEPTAMSHA" as const;

// --- §10 Combustion — POINTER to the certified private table (NOT duplicated) -
export const COMBUSTION_ARC_SOURCE = {
  module: "src/lib/astrology/formatter.ts",
  symbol: "COMBUSTION_THRESHOLDS",
  access: "read-at-compute-time (Card 14.2B)",
  planets: ["MERCURY", "VENUS", "MARS", "JUPITER", "SATURN"] as const,
  excluded: ["SUN", "MOON", "RAHU", "KETU"] as const,
  note: "Combustion arcs are inherited from the certified engine; no numeric arc is copied into Varshaphal.",
} as const;

// --- §11 Panchavargeeya Bala (five-fold Tajika strength) ----------------------
/** Component maxima in vishwas (Tajika Neelakanthi) — REGISTERED_REFERENCE. */
export const PANCHAVARGEEYA_COMPONENT_MAX = {
  GRIHA: 30, UCCHA: 20, HADDA: 15, DREKKANA: 10, NAVAMSHA: 5,
} as const;
export const PANCHAVARGEEYA_MAX_TOTAL = 80;
export type TajikaRelationship =
  | "OWN_EXALT" | "GREAT_FRIEND" | "FRIEND" | "NEUTRAL" | "ENEMY" | "GREAT_ENEMY";
/** Relationship → fraction of a component's max (Griha & Hadda) — REGISTERED_REFERENCE. */
export const RELATIONSHIP_VISHWA_FRACTION: Readonly<Record<TajikaRelationship, number>> = {
  OWN_EXALT: 1, GREAT_FRIEND: 0.75, FRIEND: 0.5, NEUTRAL: 0.25, ENEMY: 0.125, GREAT_ENEMY: 0.0625,
};
/** Dignity → fraction of component max for Drekkana / Navamsha (§11.1) — PRODUCT_NORMALIZED. */
export const DIGNITY_VISHWA_FRACTION = {
  OWN_EXALT: 1, FRIEND: 0.75, NEUTRAL: 0.5, ENEMY: 0.25, DEBILITATED: 0,
} as const;
/** Summed-Bala banding (0..80): ≥20 → +1, 10..<20 → 0, <10 → −1 (PRODUCT_NORMALIZED). */
export const PANCHAVARGEEYA_BAND = { SUPPORTIVE_MIN: 20, NEUTRAL_MIN: 10 } as const;

/** §11.1B Deep-exaltation sidereal longitudes (deg 0..360); deb = +180 — REGISTERED_REFERENCE. */
export const DEEP_EXALTATION_LONGITUDE: Readonly<Record<TajikaGraha, number>> = {
  SUN: 10, MOON: 33, MARS: 298, MERCURY: 165, JUPITER: 95, VENUS: 357, SATURN: 200,
};
export const UCCHA_BALA_MAX = 20;

/** §11.3 Hadda (Egyptian bounds) lord table — REGISTERED_REFERENCE. 12 signs × 5 bounds. */
export type HaddaBound = {
  sign: ZodiacSign;
  startDeg: number; // inclusive, 0..30 within sign
  endDeg: number; // exclusive upper (30 = sign end)
  lord: TajikaGraha;
};
export const HADDA_BOUNDS: readonly HaddaBound[] = [
  { sign: "ARIES", startDeg: 0, endDeg: 6, lord: "JUPITER" },
  { sign: "ARIES", startDeg: 6, endDeg: 12, lord: "VENUS" },
  { sign: "ARIES", startDeg: 12, endDeg: 20, lord: "MERCURY" },
  { sign: "ARIES", startDeg: 20, endDeg: 25, lord: "MARS" },
  { sign: "ARIES", startDeg: 25, endDeg: 30, lord: "SATURN" },
  { sign: "TAURUS", startDeg: 0, endDeg: 8, lord: "VENUS" },
  { sign: "TAURUS", startDeg: 8, endDeg: 14, lord: "MERCURY" },
  { sign: "TAURUS", startDeg: 14, endDeg: 22, lord: "JUPITER" },
  { sign: "TAURUS", startDeg: 22, endDeg: 27, lord: "SATURN" },
  { sign: "TAURUS", startDeg: 27, endDeg: 30, lord: "MARS" },
  { sign: "GEMINI", startDeg: 0, endDeg: 6, lord: "MERCURY" },
  { sign: "GEMINI", startDeg: 6, endDeg: 12, lord: "JUPITER" },
  { sign: "GEMINI", startDeg: 12, endDeg: 17, lord: "VENUS" },
  { sign: "GEMINI", startDeg: 17, endDeg: 24, lord: "MARS" },
  { sign: "GEMINI", startDeg: 24, endDeg: 30, lord: "SATURN" },
  { sign: "CANCER", startDeg: 0, endDeg: 7, lord: "MARS" },
  { sign: "CANCER", startDeg: 7, endDeg: 13, lord: "VENUS" },
  { sign: "CANCER", startDeg: 13, endDeg: 19, lord: "MERCURY" },
  { sign: "CANCER", startDeg: 19, endDeg: 26, lord: "JUPITER" },
  { sign: "CANCER", startDeg: 26, endDeg: 30, lord: "SATURN" },
  { sign: "LEO", startDeg: 0, endDeg: 6, lord: "JUPITER" },
  { sign: "LEO", startDeg: 6, endDeg: 11, lord: "VENUS" },
  { sign: "LEO", startDeg: 11, endDeg: 18, lord: "SATURN" },
  { sign: "LEO", startDeg: 18, endDeg: 24, lord: "MERCURY" },
  { sign: "LEO", startDeg: 24, endDeg: 30, lord: "MARS" },
  { sign: "VIRGO", startDeg: 0, endDeg: 7, lord: "MERCURY" },
  { sign: "VIRGO", startDeg: 7, endDeg: 17, lord: "VENUS" },
  { sign: "VIRGO", startDeg: 17, endDeg: 21, lord: "JUPITER" },
  { sign: "VIRGO", startDeg: 21, endDeg: 28, lord: "MARS" },
  { sign: "VIRGO", startDeg: 28, endDeg: 30, lord: "SATURN" },
  { sign: "LIBRA", startDeg: 0, endDeg: 6, lord: "SATURN" },
  { sign: "LIBRA", startDeg: 6, endDeg: 14, lord: "MERCURY" },
  { sign: "LIBRA", startDeg: 14, endDeg: 21, lord: "JUPITER" },
  { sign: "LIBRA", startDeg: 21, endDeg: 28, lord: "VENUS" },
  { sign: "LIBRA", startDeg: 28, endDeg: 30, lord: "MARS" },
  { sign: "SCORPIO", startDeg: 0, endDeg: 7, lord: "MARS" },
  { sign: "SCORPIO", startDeg: 7, endDeg: 11, lord: "VENUS" },
  { sign: "SCORPIO", startDeg: 11, endDeg: 19, lord: "MERCURY" },
  { sign: "SCORPIO", startDeg: 19, endDeg: 24, lord: "JUPITER" },
  { sign: "SCORPIO", startDeg: 24, endDeg: 30, lord: "SATURN" },
  { sign: "SAGITTARIUS", startDeg: 0, endDeg: 12, lord: "JUPITER" },
  { sign: "SAGITTARIUS", startDeg: 12, endDeg: 17, lord: "VENUS" },
  { sign: "SAGITTARIUS", startDeg: 17, endDeg: 21, lord: "MERCURY" },
  { sign: "SAGITTARIUS", startDeg: 21, endDeg: 26, lord: "SATURN" },
  { sign: "SAGITTARIUS", startDeg: 26, endDeg: 30, lord: "MARS" },
  { sign: "CAPRICORN", startDeg: 0, endDeg: 7, lord: "MERCURY" },
  { sign: "CAPRICORN", startDeg: 7, endDeg: 14, lord: "JUPITER" },
  { sign: "CAPRICORN", startDeg: 14, endDeg: 22, lord: "VENUS" },
  { sign: "CAPRICORN", startDeg: 22, endDeg: 26, lord: "SATURN" },
  { sign: "CAPRICORN", startDeg: 26, endDeg: 30, lord: "MARS" },
  { sign: "AQUARIUS", startDeg: 0, endDeg: 7, lord: "MERCURY" },
  { sign: "AQUARIUS", startDeg: 7, endDeg: 13, lord: "VENUS" },
  { sign: "AQUARIUS", startDeg: 13, endDeg: 20, lord: "JUPITER" },
  { sign: "AQUARIUS", startDeg: 20, endDeg: 25, lord: "MARS" },
  { sign: "AQUARIUS", startDeg: 25, endDeg: 30, lord: "SATURN" },
  { sign: "PISCES", startDeg: 0, endDeg: 12, lord: "VENUS" },
  { sign: "PISCES", startDeg: 12, endDeg: 16, lord: "JUPITER" },
  { sign: "PISCES", startDeg: 16, endDeg: 19, lord: "MERCURY" },
  { sign: "PISCES", startDeg: 19, endDeg: 28, lord: "MARS" },
  { sign: "PISCES", startDeg: 28, endDeg: 30, lord: "SATURN" },
] as const;

// --- §13.1A Trirashi-pati (triplicity) table ---------------------------------
export type Triplicity = "FIRE" | "EARTH" | "AIR" | "WATER";
export const SIGN_TRIPLICITY: Readonly<Record<ZodiacSign, Triplicity>> = {
  ARIES: "FIRE", LEO: "FIRE", SAGITTARIUS: "FIRE",
  TAURUS: "EARTH", VIRGO: "EARTH", CAPRICORN: "EARTH",
  GEMINI: "AIR", LIBRA: "AIR", AQUARIUS: "AIR",
  CANCER: "WATER", SCORPIO: "WATER", PISCES: "WATER",
};
/** Dorothean day/night triplicity rulers (REGISTERED_REFERENCE). */
export const TRIRASHI_LORDS: Readonly<Record<Triplicity, { day: TajikaGraha; night: TajikaGraha }>> = {
  FIRE: { day: "SUN", night: "JUPITER" },
  EARTH: { day: "VENUS", night: "MOON" },
  AIR: { day: "SATURN", night: "MERCURY" },
  WATER: { day: "VENUS", night: "MARS" },
};

// --- §12 Supported V1 Tajika yogas -------------------------------------------
export const VARSHAPHAL_TAJIKA_YOGAS_V1 = [
  "ITHASALA", "ISHRAFA", "NAKTA", "YAMAYA", "KAMBOOLA", "MANAU", "IKKAVALA", "INDUVARA",
] as const;
export type TajikaYogaId = (typeof VARSHAPHAL_TAJIKA_YOGAS_V1)[number];

// --- §13 Varshesha (year-lord) candidates ------------------------------------
export const VARSHESHA_CANDIDATES = [
  "MUNTHA_LORD", "VARSHA_LAGNA_LORD", "JANMA_LAGNA_LORD", "TRIRASHI_PATI", "DINARATRI_LORD",
] as const;
export type VarsheshaCandidateId = (typeof VARSHESHA_CANDIDATES)[number];
/** Deterministic tie-break priority when Panchavargeeya Bala ties (§13, PRODUCT_NORMALIZED). */
export const VARSHESHA_TIEBREAK_ORDER: readonly VarsheshaCandidateId[] = [
  "MUNTHA_LORD", "VARSHA_LAGNA_LORD", "JANMA_LAGNA_LORD", "TRIRASHI_PATI", "DINARATRI_LORD",
];
/** Weekday (Vara) lords, Sunday..Saturday — for the Dinaratri candidate (§13). */
export const VARA_LORDS: readonly TajikaGraha[] = [
  "SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN",
];

// --- §11.4 Ashtakavarga overlay banding (Card 7; product) --------------------
export const ASHTAKAVARGA_OVERLAY_BAND = { SUPPORTIVE_MIN: 5, CAUTION_MAX: 2 } as const;

// --- Evidence-ID helper ------------------------------------------------------
export function makeVarshaphalEvidenceId(parts: readonly (string | number)[]): string {
  return `VARSHAPHAL:${parts.join(":")}`;
}
