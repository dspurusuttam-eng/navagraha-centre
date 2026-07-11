// Card 10.2 — Pinned classical Ashtakoot tables (Card 10.1 formula contract).
//
// Every table here is the single source of truth for the premium engine AND
// the legacy foundation wrapper. Symbolic traditional categories only:
// Varna/Gana/Yoni never map to real caste, morality, personality or identity.
//
// Corrections vs the old foundation (audited in Card 10.1):
//   - Gana mapping is the classical 9/9/9 table (old code mis-mapped
//     Ardra -> Rakshasa and Vishakha -> Deva, among others).
//   - Nadi is the classical 3x9 table (old code used nakshatraIndex % 3,
//     which diverges from the table — e.g. Rohini is ANTYA, not %3's ADI).
//   - Bhakoot dosha is the directional-distance pair set 2/12, 5/9, 6/8
//     (old code used absolute differences and wrongly flagged same-sign).

import type {
  ClassicalLord,
  GanaGroup,
  NadiGroup,
  VarnaCategory,
  VashyaClass,
  YoniAnimal,
} from "@/modules/astrology/matchmaking/premium/types";

export const NAKSHATRA_COUNT = 27;
export const SIGN_COUNT = 12;

/** Display names (index-aligned; display/metadata only — never matched on). */
export const NAKSHATRA_DISPLAY_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
  "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana",
  "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada",
  "Revati",
] as const;

export const SIGN_DISPLAY_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

/** Sign lords, index-aligned with SIGN_DISPLAY_NAMES (classical 7 lords). */
export const SIGN_LORDS: readonly ClassicalLord[] = [
  "MARS", "VENUS", "MERCURY", "MOON", "SUN", "MERCURY", "VENUS", "MARS",
  "JUPITER", "SATURN", "SATURN", "JUPITER",
] as const;

// --- Varna (max 1; symbolic Koota category, NOT real caste) -------------------

export const VARNA_BY_SIGN: readonly VarnaCategory[] = [
  "KSHATRIYA", // Aries (fire)
  "VAISHYA",   // Taurus (earth)
  "SHUDRA",    // Gemini (air)
  "BRAHMIN",   // Cancer (water)
  "KSHATRIYA", // Leo
  "VAISHYA",   // Virgo
  "SHUDRA",    // Libra
  "BRAHMIN",   // Scorpio
  "KSHATRIYA", // Sagittarius
  "VAISHYA",   // Capricorn
  "SHUDRA",    // Aquarius
  "BRAHMIN",   // Pisces
] as const;

export const VARNA_RANK: Record<VarnaCategory, number> = {
  BRAHMIN: 4,
  KSHATRIYA: 3,
  VAISHYA: 2,
  SHUDRA: 1,
};

// --- Vashya (max 2) ------------------------------------------------------------

export const VASHYA_CLASSES: readonly VashyaClass[] = [
  "CHATUSHPADA", "MANAVA", "JALACHARA", "VANACHARA", "KEETA",
] as const;

/**
 * Vashya class of a Moon placement (sign index + degree-in-sign for the
 * classical Sagittarius / Capricorn half-sign splits; < 15 deg = first half).
 */
export function vashyaClassOf(signIndex: number, degreeInSign: number): VashyaClass {
  switch (signIndex) {
    case 0: return "CHATUSHPADA"; // Aries
    case 1: return "CHATUSHPADA"; // Taurus
    case 2: return "MANAVA";      // Gemini
    case 3: return "JALACHARA";   // Cancer
    case 4: return "VANACHARA";   // Leo
    case 5: return "MANAVA";      // Virgo
    case 6: return "MANAVA";      // Libra
    case 7: return "KEETA";       // Scorpio
    case 8: return degreeInSign < 15 ? "MANAVA" : "CHATUSHPADA";   // Sagittarius
    case 9: return degreeInSign < 15 ? "CHATUSHPADA" : "JALACHARA"; // Capricorn
    case 10: return "MANAVA";     // Aquarius
    default: return "JALACHARA";  // Pisces
  }
}

/** Pinned symmetric 5x5 Vashya matrix (values in {0, 0.5, 1, 2}). */
export const VASHYA_MATRIX: Record<VashyaClass, Record<VashyaClass, number>> = {
  CHATUSHPADA: { CHATUSHPADA: 2, MANAVA: 1, JALACHARA: 1, VANACHARA: 0.5, KEETA: 1 },
  MANAVA:      { CHATUSHPADA: 1, MANAVA: 2, JALACHARA: 0.5, VANACHARA: 0, KEETA: 1 },
  JALACHARA:   { CHATUSHPADA: 1, MANAVA: 0.5, JALACHARA: 2, VANACHARA: 1, KEETA: 1 },
  VANACHARA:   { CHATUSHPADA: 0.5, MANAVA: 0, JALACHARA: 1, VANACHARA: 2, KEETA: 0 },
  KEETA:       { CHATUSHPADA: 1, MANAVA: 1, JALACHARA: 1, VANACHARA: 0, KEETA: 2 },
};

// --- Tara (max 3; auspicious residues of inclusive count mod 9) ----------------

export const TARA_AUSPICIOUS_RESIDUES = new Set([2, 4, 6, 8, 0]);
export const TARA_NAMES = [
  "Janma", "Sampat", "Vipat", "Kshema", "Pratyari", "Sadhaka", "Vadha",
  "Mitra", "Ati-Mitra",
] as const; // index = ((count - 1) % 9)

// --- Yoni (max 4; symbolic animals, no behavioral inference) --------------------

export const YONI_BY_NAKSHATRA: readonly YoniAnimal[] = [
  "HORSE",    // Ashwini
  "ELEPHANT", // Bharani
  "SHEEP",    // Krittika
  "SERPENT",  // Rohini
  "SERPENT",  // Mrigashira
  "DOG",      // Ardra
  "CAT",      // Punarvasu
  "SHEEP",    // Pushya
  "CAT",      // Ashlesha
  "RAT",      // Magha
  "RAT",      // Purva Phalguni
  "COW",      // Uttara Phalguni
  "BUFFALO",  // Hasta
  "TIGER",    // Chitra
  "BUFFALO",  // Swati
  "TIGER",    // Vishakha
  "DEER",     // Anuradha
  "DEER",     // Jyeshtha
  "DOG",      // Moola
  "MONKEY",   // Purva Ashadha
  "MONGOOSE", // Uttara Ashadha
  "MONKEY",   // Shravana
  "LION",     // Dhanishta
  "HORSE",    // Shatabhisha
  "LION",     // Purva Bhadrapada
  "COW",      // Uttara Bhadrapada
  "ELEPHANT", // Revati
] as const;

export const YONI_ORDER: readonly YoniAnimal[] = [
  "HORSE", "ELEPHANT", "SHEEP", "SERPENT", "DOG", "CAT", "RAT", "COW",
  "BUFFALO", "TIGER", "DEER", "MONKEY", "MONGOOSE", "LION",
] as const;

/** Pinned classical symmetric 14x14 Yoni points table (0..4). */
export const YONI_MATRIX: readonly (readonly number[])[] = [
  // HORSE ELE SHEEP SERP DOG CAT RAT COW BUF TIG DEER MONK MONG LION
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1], // HORSE
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], // ELEPHANT
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1], // SHEEP
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2], // SERPENT
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], // DOG
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1], // CAT
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], // RAT
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], // COW
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1], // BUFFALO
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], // TIGER
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1], // DEER
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2], // MONKEY
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], // MONGOOSE
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4], // LION
] as const;

/** The seven pinned arch-enemy (0-point) Yoni pairs. */
export const YONI_ARCH_ENEMY_PAIRS: readonly (readonly [YoniAnimal, YoniAnimal])[] = [
  ["CAT", "RAT"],
  ["SERPENT", "MONGOOSE"],
  ["LION", "ELEPHANT"],
  ["HORSE", "BUFFALO"],
  ["DOG", "DEER"],
  ["MONKEY", "SHEEP"],
  ["TIGER", "COW"],
] as const;

// --- Graha Maitri (max 5; natural planetary friendship only) --------------------

export const NATURAL_FRIENDSHIP: Record<
  ClassicalLord,
  { friends: readonly ClassicalLord[]; enemies: readonly ClassicalLord[] }
> = {
  SUN: { friends: ["MOON", "MARS", "JUPITER"], enemies: ["VENUS", "SATURN"] },
  MOON: { friends: ["SUN", "MERCURY"], enemies: [] },
  MARS: { friends: ["SUN", "MOON", "JUPITER"], enemies: ["MERCURY"] },
  MERCURY: { friends: ["SUN", "VENUS"], enemies: ["MOON"] },
  JUPITER: { friends: ["SUN", "MOON", "MARS"], enemies: ["MERCURY", "VENUS"] },
  VENUS: { friends: ["MERCURY", "SATURN"], enemies: ["SUN", "MOON"] },
  SATURN: { friends: ["MERCURY", "VENUS"], enemies: ["SUN", "MOON"] },
};

export type FriendshipView = "friend" | "neutral" | "enemy";

export function friendshipView(from: ClassicalLord, to: ClassicalLord): FriendshipView {
  if (NATURAL_FRIENDSHIP[from].friends.includes(to)) return "friend";
  if (NATURAL_FRIENDSHIP[from].enemies.includes(to)) return "enemy";
  return "neutral";
}

/** Pinned 5-point resolution (half-point continuous variant deferred). */
export function grahaMaitriScore(lordA: ClassicalLord, lordB: ClassicalLord): number {
  if (lordA === lordB) return 5;
  const viewA = friendshipView(lordA, lordB);
  const viewB = friendshipView(lordB, lordA);

  if (viewA === "friend" && viewB === "friend") return 5;
  if (
    (viewA === "friend" && viewB === "neutral") ||
    (viewB === "friend" && viewA === "neutral")
  ) return 4;
  if (viewA === "neutral" && viewB === "neutral") return 3;
  if (
    (viewA === "enemy" && viewB === "neutral") ||
    (viewB === "enemy" && viewA === "neutral")
  ) return 1;

  return 0; // mutual enemy, or friend + enemy (pinned V1)
}

// --- Gana (max 6; corrected classical 9/9/9 mapping) ----------------------------

export const GANA_BY_NAKSHATRA: readonly GanaGroup[] = [
  "DEVA",     // Ashwini
  "MANUSHYA", // Bharani
  "RAKSHASA", // Krittika
  "MANUSHYA", // Rohini
  "DEVA",     // Mrigashira
  "MANUSHYA", // Ardra (corrected; old code said Rakshasa)
  "DEVA",     // Punarvasu
  "DEVA",     // Pushya
  "RAKSHASA", // Ashlesha
  "RAKSHASA", // Magha
  "MANUSHYA", // Purva Phalguni
  "MANUSHYA", // Uttara Phalguni
  "DEVA",     // Hasta
  "RAKSHASA", // Chitra
  "DEVA",     // Swati
  "RAKSHASA", // Vishakha (corrected; old code said Deva)
  "DEVA",     // Anuradha
  "RAKSHASA", // Jyeshtha
  "RAKSHASA", // Moola
  "MANUSHYA", // Purva Ashadha
  "MANUSHYA", // Uttara Ashadha
  "DEVA",     // Shravana
  "RAKSHASA", // Dhanishta
  "RAKSHASA", // Shatabhisha
  "MANUSHYA", // Purva Bhadrapada
  "MANUSHYA", // Uttara Bhadrapada
  "DEVA",     // Revati
] as const;

/** Pinned symmetric Gana matrix (directional 6/5 variant deferred). */
export const GANA_MATRIX: Record<GanaGroup, Record<GanaGroup, number>> = {
  DEVA: { DEVA: 6, MANUSHYA: 5, RAKSHASA: 1 },
  MANUSHYA: { DEVA: 5, MANUSHYA: 6, RAKSHASA: 0 },
  RAKSHASA: { DEVA: 1, MANUSHYA: 0, RAKSHASA: 6 },
};

// --- Bhakoot (max 7; corrected directional-distance dosha pairs) -----------------

/** Dosha when the mutual sign distances form 2/12, 5/9 or 6/8. */
export const BHAKOOT_DOSHA_DISTANCES = new Set([2, 12, 5, 9, 6, 8]);

// --- Nadi (max 8; corrected classical 3x9 table) ---------------------------------

export const NADI_BY_NAKSHATRA: readonly NadiGroup[] = [
  "ADI",    // Ashwini
  "MADHYA", // Bharani
  "ANTYA",  // Krittika
  "ANTYA",  // Rohini (note: index % 3 would wrongly give ADI)
  "MADHYA", // Mrigashira
  "ADI",    // Ardra
  "ADI",    // Punarvasu
  "MADHYA", // Pushya
  "ANTYA",  // Ashlesha
  "ANTYA",  // Magha
  "MADHYA", // Purva Phalguni
  "ADI",    // Uttara Phalguni
  "ADI",    // Hasta
  "MADHYA", // Chitra
  "ANTYA",  // Swati
  "ANTYA",  // Vishakha
  "MADHYA", // Anuradha
  "ADI",    // Jyeshtha
  "ADI",    // Moola
  "MADHYA", // Purva Ashadha
  "ANTYA",  // Uttara Ashadha
  "ANTYA",  // Shravana
  "MADHYA", // Dhanishta
  "ADI",    // Shatabhisha
  "ADI",    // Purva Bhadrapada
  "MADHYA", // Uttara Bhadrapada
  "ANTYA",  // Revati
] as const;

// --- Manglik (raw detection only; cancellation deferred) -------------------------

export const MANGLIK_HOUSES = new Set([1, 2, 4, 7, 8, 12]);
