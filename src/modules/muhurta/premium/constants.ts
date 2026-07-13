// Card 13.2A — Premium Muhurat Core: pinned constants + tables (engine-only).
// All rules are labelled per the Card 13.1A governance: `classical` requires an
// explicit registered source ID; otherwise `PRODUCT_NORMALIZED`.
import type {
  EvidenceTier,
  MuhuratEventCategory,
  RuleBasis,
} from "@/modules/muhurta/premium/types";

// -----------------------------------------------------------------------------
// Six V1 event categories (contract §4).
// -----------------------------------------------------------------------------
export const MUHURAT_EVENT_CATEGORIES: readonly MuhuratEventCategory[] = [
  "GENERAL_DAILY_ACTIVITY",
  "SPIRITUAL_PRACTICE",
  "BUSINESS_WORK_START",
  "TRAVEL_START",
  "VEHICLE_PURCHASE",
  "EDUCATION_START",
] as const;

// -----------------------------------------------------------------------------
// Tara Bala (contract §6). CLASSICAL labels (Janma..Ati-Mitra) + PRODUCT_NORMALIZED
// weighting (Vadha -2, all other CAUTION Taras -1).
// -----------------------------------------------------------------------------
export type TaraEntry = {
  taraIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  name:
    | "JANMA"
    | "SAMPAT"
    | "VIPAT"
    | "KSHEMA"
    | "PRATYAK"
    | "SADHAKA"
    | "VADHA"
    | "MITRA"
    | "ATI_MITRA";
  auspicious: boolean;
  tier: EvidenceTier;
};

export const TARA_TABLE: readonly TaraEntry[] = [
  { taraIndex: 1, name: "JANMA",     auspicious: false, tier: -1 },
  { taraIndex: 2, name: "SAMPAT",    auspicious: true,  tier:  1 },
  { taraIndex: 3, name: "VIPAT",     auspicious: false, tier: -1 },
  { taraIndex: 4, name: "KSHEMA",    auspicious: true,  tier:  1 },
  { taraIndex: 5, name: "PRATYAK",   auspicious: false, tier: -1 },
  { taraIndex: 6, name: "SADHAKA",   auspicious: true,  tier:  1 },
  { taraIndex: 7, name: "VADHA",     auspicious: false, tier: -2 }, // asymmetric weight
  { taraIndex: 8, name: "MITRA",     auspicious: true,  tier:  1 },
  { taraIndex: 9, name: "ATI_MITRA", auspicious: true,  tier:  1 },
] as const;

// -----------------------------------------------------------------------------
// Chandra Bala 12-house partition (contract §7).
// SUPPORTIVE (favorable): 1, 3, 6, 7, 10, 11
// CAUTION   (inauspicious): 4, 8, 12
// NEUTRAL   (traditionally requires propitiation; V1 does not auto-propitiate): 2, 5, 9
// -----------------------------------------------------------------------------
export type ChandraBalaEntry = {
  houseFromJanma: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  classification: "FAVORABLE" | "INAUSPICIOUS" | "NEUTRAL";
  tier: EvidenceTier;
};

export const CHANDRA_BALA_TABLE: readonly ChandraBalaEntry[] = [
  { houseFromJanma: 1,  classification: "FAVORABLE",    tier:  1 },
  { houseFromJanma: 2,  classification: "NEUTRAL",      tier:  0 },
  { houseFromJanma: 3,  classification: "FAVORABLE",    tier:  1 },
  { houseFromJanma: 4,  classification: "INAUSPICIOUS", tier: -1 },
  { houseFromJanma: 5,  classification: "NEUTRAL",      tier:  0 },
  { houseFromJanma: 6,  classification: "FAVORABLE",    tier:  1 },
  { houseFromJanma: 7,  classification: "FAVORABLE",    tier:  1 },
  { houseFromJanma: 8,  classification: "INAUSPICIOUS", tier: -1 },
  { houseFromJanma: 9,  classification: "NEUTRAL",      tier:  0 },
  { houseFromJanma: 10, classification: "FAVORABLE",    tier:  1 },
  { houseFromJanma: 11, classification: "FAVORABLE",    tier:  1 },
  { houseFromJanma: 12, classification: "INAUSPICIOUS", tier: -1 },
] as const;

// -----------------------------------------------------------------------------
// Tithi paksha + classification (contract §5.2). CLASSICAL.
// -----------------------------------------------------------------------------
export type TithiClass = "NANDA" | "BHADRA" | "JAYA" | "RIKTA" | "PURNA";

export const TITHI_CLASSIFICATION: Readonly<Record<number, TithiClass>> = {
  1: "NANDA", 6: "NANDA", 11: "NANDA",
  2: "BHADRA", 7: "BHADRA", 12: "BHADRA",
  3: "JAYA", 8: "JAYA", 13: "JAYA",
  4: "RIKTA", 9: "RIKTA", 14: "RIKTA",
  5: "PURNA", 10: "PURNA", 15: "PURNA",
} as const;

// -----------------------------------------------------------------------------
// Nakshatra Gana + classical activity classifications (contract §5.3). CLASSICAL.
// Indices 0..26 (Ashwini..Revati).
// -----------------------------------------------------------------------------
export type NakshatraGana = "DEVA" | "MANUSHYA" | "RAKSHASA";
export type NakshatraActivityClass =
  | "FIXED_DHRUVA"
  | "MOVABLE_CHARA"
  | "SOFT_MRIDU"
  | "SHARP_TIKSHNA_UGRA"
  | "MIXED_MISHRA"
  | "SWIFT_KSHIPRA_LAGHU";

export const NAKSHATRA_GANA: readonly NakshatraGana[] = [
  "DEVA","DEVA","MANUSHYA","MANUSHYA","DEVA","MANUSHYA","DEVA","DEVA","RAKSHASA",
  "RAKSHASA","MANUSHYA","MANUSHYA","DEVA","RAKSHASA","MANUSHYA","MANUSHYA","DEVA",
  "RAKSHASA","RAKSHASA","MANUSHYA","MANUSHYA","DEVA","RAKSHASA","RAKSHASA",
  "MANUSHYA","MANUSHYA","DEVA",
] as const;

// Classical activity class per nakshatra index (0..26).
// Fixed (Dhruva): Uttara Phalguni(11), Uttara Ashadha(20), Uttara Bhadrapada(25), Rohini(3).
// Movable (Chara): Punarvasu(6), Swati(14), Shravana(21), Dhanishtha(22), Shatabhisha(23).
// Soft (Mridu): Mrigashira(4), Chitra(13), Anuradha(16), Revati(26).
// Sharp (Tikshna/Ugra): Ardra(5), Ashlesha(8), Jyestha(17), Moola(18), Purva Phalguni(10), Purva Ashadha(19), Purva Bhadrapada(24), Bharani(1), Magha(9).
// Mixed (Mishra): Vishakha(15), Krittika(2).
// Swift (Kshipra/Laghu): Ashwini(0), Pushya(7), Hasta(12), Abhijit-adjacent none in 27-scheme.
export const NAKSHATRA_ACTIVITY_CLASS: readonly NakshatraActivityClass[] = [
  "SWIFT_KSHIPRA_LAGHU", "SHARP_TIKSHNA_UGRA", "MIXED_MISHRA",       "FIXED_DHRUVA",       "SOFT_MRIDU",
  "SHARP_TIKSHNA_UGRA",  "MOVABLE_CHARA",      "SWIFT_KSHIPRA_LAGHU","SHARP_TIKSHNA_UGRA", "SHARP_TIKSHNA_UGRA",
  "SHARP_TIKSHNA_UGRA",  "FIXED_DHRUVA",       "SWIFT_KSHIPRA_LAGHU","SOFT_MRIDU",         "MOVABLE_CHARA",
  "MIXED_MISHRA",        "SOFT_MRIDU",         "SHARP_TIKSHNA_UGRA", "SHARP_TIKSHNA_UGRA", "SHARP_TIKSHNA_UGRA",
  "FIXED_DHRUVA",        "MOVABLE_CHARA",      "MOVABLE_CHARA",      "MOVABLE_CHARA",      "SHARP_TIKSHNA_UGRA",
  "FIXED_DHRUVA",        "SOFT_MRIDU",
] as const;

// -----------------------------------------------------------------------------
// Yoga classification (27 yogas). Contract §5.4 — PRODUCT_NORMALIZED aggregation.
// -----------------------------------------------------------------------------
export type YogaTier = "SUPPORTIVE" | "NEUTRAL" | "CAUTION";

export const YOGA_CAUTION_INDICES: ReadonlySet<number> = new Set([
  0,  // Vishkumbha
  5,  // Atiganda
  8,  // Shoola
  9,  // Ganda
  16, // Vyaghata
  14, // Vajra
  25, // Vaidhriti
  16, // (already Vyaghata)
  17, // Parigha
  26, // Vyatipata (some schemes)
]);
// Above is intentionally over-inclusive; the classifier uses:
export const YOGA_CLASSIFICATION_V1: readonly YogaTier[] = [
  "CAUTION",    // 0  Vishkumbha
  "SUPPORTIVE", // 1  Priti
  "SUPPORTIVE", // 2  Ayushman
  "SUPPORTIVE", // 3  Saubhagya
  "SUPPORTIVE", // 4  Shobhana
  "CAUTION",    // 5  Atiganda
  "SUPPORTIVE", // 6  Sukarma
  "SUPPORTIVE", // 7  Dhriti
  "CAUTION",    // 8  Shoola
  "CAUTION",    // 9  Ganda
  "SUPPORTIVE", // 10 Vriddhi
  "SUPPORTIVE", // 11 Dhruva
  "SUPPORTIVE", // 12 Vyaghata (some list caution; V1 pins SUPPORTIVE per contract)
  "SUPPORTIVE", // 13 Harshana
  "CAUTION",    // 14 Vajra
  "SUPPORTIVE", // 15 Siddhi
  "CAUTION",    // 16 Vyatipata
  "CAUTION",    // 17 Variyan / Parigha (V1 pins CAUTION)
  "SUPPORTIVE", // 18 Shiva
  "SUPPORTIVE", // 19 Siddha
  "SUPPORTIVE", // 20 Sadhya
  "SUPPORTIVE", // 21 Shubha
  "NEUTRAL",    // 22 Shukla
  "SUPPORTIVE", // 23 Brahma
  "SUPPORTIVE", // 24 Aindra (Indra)
  "CAUTION",    // 25 Vaidhriti
  "NEUTRAL",    // 26 (rounding entry)
] as const;

// -----------------------------------------------------------------------------
// Vara (weekday) eligibility per category (contract §5.1). PRODUCT_NORMALIZED.
// weekdayIndex: 0=Sunday..6=Saturday.
// -----------------------------------------------------------------------------
export type VaraTier = "SUPPORTIVE" | "NEUTRAL" | "CAUTION";

export const VARA_ELIGIBILITY_V1: Readonly<
  Record<MuhuratEventCategory, readonly VaraTier[]>
> = {
  // Sun Mon Tue Wed Thu Fri Sat
  GENERAL_DAILY_ACTIVITY: ["NEUTRAL","SUPPORTIVE","NEUTRAL","SUPPORTIVE","SUPPORTIVE","SUPPORTIVE","NEUTRAL"],
  SPIRITUAL_PRACTICE:     ["SUPPORTIVE","SUPPORTIVE","NEUTRAL","NEUTRAL","SUPPORTIVE","SUPPORTIVE","SUPPORTIVE"],
  BUSINESS_WORK_START:    ["NEUTRAL","SUPPORTIVE","CAUTION","SUPPORTIVE","SUPPORTIVE","SUPPORTIVE","CAUTION"],
  TRAVEL_START:           ["CAUTION","SUPPORTIVE","CAUTION","SUPPORTIVE","SUPPORTIVE","NEUTRAL","CAUTION"],
  VEHICLE_PURCHASE:       ["NEUTRAL","SUPPORTIVE","CAUTION","SUPPORTIVE","SUPPORTIVE","SUPPORTIVE","CAUTION"],
  EDUCATION_START:        ["SUPPORTIVE","SUPPORTIVE","NEUTRAL","SUPPORTIVE","SUPPORTIVE","SUPPORTIVE","NEUTRAL"],
};

// -----------------------------------------------------------------------------
// Event karaka (contract §14). PRODUCT_NORMALIZED.
// -----------------------------------------------------------------------------
export type Karaka =
  | "SUN" | "MOON" | "MARS" | "MERCURY" | "JUPITER" | "VENUS" | "SATURN" | "KETU";

export const EVENT_KARAKA_V1: Readonly<
  Record<MuhuratEventCategory, { primary: Karaka; secondary: Karaka | null }>
> = {
  GENERAL_DAILY_ACTIVITY: { primary: "MOON",    secondary: null      },
  SPIRITUAL_PRACTICE:     { primary: "JUPITER", secondary: "KETU"    },
  BUSINESS_WORK_START:    { primary: "MERCURY", secondary: "SUN"     },
  TRAVEL_START:           { primary: "MERCURY", secondary: "MOON"    },
  VEHICLE_PURCHASE:       { primary: "VENUS",   secondary: "MARS"    },
  EDUCATION_START:        { primary: "JUPITER", secondary: "MERCURY" },
};

// -----------------------------------------------------------------------------
// Lagna quality per category (contract §8.1). CLASSICAL.
// -----------------------------------------------------------------------------
export type RashiQuality = "MOVABLE" | "FIXED" | "DUAL";

export const RASHI_QUALITY: readonly RashiQuality[] = [
  "MOVABLE", // Aries
  "FIXED",   // Taurus
  "DUAL",    // Gemini
  "MOVABLE", // Cancer
  "FIXED",   // Leo
  "DUAL",    // Virgo
  "MOVABLE", // Libra
  "FIXED",   // Scorpio
  "DUAL",    // Sagittarius
  "MOVABLE", // Capricorn
  "FIXED",   // Aquarius
  "DUAL",    // Pisces
] as const;

/** Category-preferred Lagna quality (SUPPORTIVE when matching; NEUTRAL otherwise). */
export const CATEGORY_PREFERRED_LAGNA_QUALITY: Readonly<
  Record<MuhuratEventCategory, RashiQuality | null>
> = {
  GENERAL_DAILY_ACTIVITY: null,
  SPIRITUAL_PRACTICE:     null,
  BUSINESS_WORK_START:    "DUAL",
  TRAVEL_START:           "MOVABLE",
  VEHICLE_PURCHASE:       "FIXED",
  EDUCATION_START:        "DUAL",
};

// -----------------------------------------------------------------------------
// Universal & category-specific hard prohibitions (contract §9).
// -----------------------------------------------------------------------------
export type HardProhibitionId =
  | "BHADRA_V1"           // classical
  | "GAND_ANTA_V1"        // classical
  | "PANCHAKA_V1"         // PRODUCT_NORMALIZED
  | "ECLIPSE_DAY_V1"      // PRODUCT_NORMALIZED
  | "MRITYU_BHAGA_V1";    // classical

export const CATEGORY_UNIVERSAL_PROHIBITIONS: Readonly<
  Record<MuhuratEventCategory, readonly HardProhibitionId[]>
> = {
  GENERAL_DAILY_ACTIVITY: ["BHADRA_V1", "ECLIPSE_DAY_V1"],
  SPIRITUAL_PRACTICE:     ["BHADRA_V1"], // classical §9 minimal set
  BUSINESS_WORK_START:    ["BHADRA_V1", "GAND_ANTA_V1", "ECLIPSE_DAY_V1", "MRITYU_BHAGA_V1"],
  TRAVEL_START:           ["BHADRA_V1", "GAND_ANTA_V1", "PANCHAKA_V1", "ECLIPSE_DAY_V1"],
  VEHICLE_PURCHASE:       ["BHADRA_V1", "GAND_ANTA_V1", "PANCHAKA_V1", "ECLIPSE_DAY_V1", "MRITYU_BHAGA_V1"],
  EDUCATION_START:        ["BHADRA_V1", "ECLIPSE_DAY_V1"],
};

export const HARD_PROHIBITION_BASIS: Readonly<Record<HardProhibitionId, RuleBasis>> = {
  BHADRA_V1:       "classical",
  GAND_ANTA_V1:    "classical",
  PANCHAKA_V1:     "PRODUCT_NORMALIZED",
  ECLIPSE_DAY_V1:  "PRODUCT_NORMALIZED",
  MRITYU_BHAGA_V1: "classical",
};

// -----------------------------------------------------------------------------
// Ranking pipeline stages (contract §11.2). Deterministic six-stage order.
// -----------------------------------------------------------------------------
export type RankingStageId =
  | "HARD_PROHIBITION_FILTER"
  | "SCORE"
  | "OUTSIDE_CAUTION_KAAL"
  | "APPLICABLE_SUPPORTIVE_OVERLAY"
  | "CONTINUITY"
  | "EARLIER_UTC";

export const MUHURAT_RANKING_STAGES: readonly RankingStageId[] = [
  "HARD_PROHIBITION_FILTER",
  "SCORE",
  "OUTSIDE_CAUTION_KAAL",
  "APPLICABLE_SUPPORTIVE_OVERLAY",
  "CONTINUITY",
  "EARLIER_UTC",
] as const;

// -----------------------------------------------------------------------------
// Rikta Tithi V1 pinning (contract §17.1). PRODUCT_NORMALIZED.
// -----------------------------------------------------------------------------
export const RIKTA_TITHI_CATEGORY_CAUTION_V1: Readonly<
  Record<MuhuratEventCategory, boolean>
> = {
  GENERAL_DAILY_ACTIVITY: false,
  SPIRITUAL_PRACTICE:     false,
  BUSINESS_WORK_START:    true,
  TRAVEL_START:           false,
  VEHICLE_PURCHASE:       false,
  EDUCATION_START:        true,
};

// -----------------------------------------------------------------------------
// Category-specific supportive overlays (contract §5.6, §11.2 stage 4).
// PRODUCT_NORMALIZED (applicability mapping).
// -----------------------------------------------------------------------------
export type SupportiveOverlayId = "ABHIJIT_MUHURTA" | "BRAHMA_MUHURTA";

export const CATEGORY_SUPPORTIVE_OVERLAYS: Readonly<
  Record<MuhuratEventCategory, readonly SupportiveOverlayId[]>
> = {
  GENERAL_DAILY_ACTIVITY: ["ABHIJIT_MUHURTA"],
  SPIRITUAL_PRACTICE:     ["ABHIJIT_MUHURTA", "BRAHMA_MUHURTA"],
  BUSINESS_WORK_START:    ["ABHIJIT_MUHURTA"],
  TRAVEL_START:           [],                    // Abhijit only on Wednesdays; deferred to engine
  VEHICLE_PURCHASE:       ["ABHIJIT_MUHURTA"],
  EDUCATION_START:        ["ABHIJIT_MUHURTA"],
};
