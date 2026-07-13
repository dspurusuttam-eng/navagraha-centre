// Card 13.2A — Premium Muhurat Core: immutable rule registry.
// Every emitted ruleId MUST be registered. `getMuhuratRule` throws on unknown.
// Every rule carries an explicit basis label per Card 13.1A governance:
// `classical` requires a registered source id; otherwise `PRODUCT_NORMALIZED`.
import type { RuleBasis } from "@/modules/muhurta/premium/types";

export type MuhuratRuleSection =
  | "PANCHANG"
  | "TARA"
  | "CHANDRA"
  | "LAGNA"
  | "PLANETARY"
  | "DOSHA"
  | "SEGMENT"
  | "SCORING"
  | "STATUS";

export type MuhuratRule = {
  ruleId: string;
  section: MuhuratRuleSection;
  basis: RuleBasis;
  sourceId: string | null; // when basis=classical, the registered source (table/chapter)
  description: string;
};

const RULES: readonly MuhuratRule[] = [
  // --- PANCHANG (§5) --------------------------------------------------------
  { ruleId: "TITHI_PAKSHA_CLASSIFICATION_V1", section: "PANCHANG", basis: "classical",
    sourceId: "PANCHANG_TITHI_TABLE",
    description: "Tithi paksha (Shukla/Krishna) + Nanda/Bhadra/Jaya/Rikta/Purna classification (§5.2)." },
  { ruleId: "TITHI_KSHAYA_V1", section: "PANCHANG", basis: "classical",
    sourceId: "PANCHANG_TITHI_TABLE",
    description: "Tithi absent on a civil day flag (§5.2)." },
  { ruleId: "TITHI_VRIDDHI_V1", section: "PANCHANG", basis: "classical",
    sourceId: "PANCHANG_TITHI_TABLE",
    description: "Tithi spanning two civil days flag (§5.2)." },
  { ruleId: "NAKSHATRA_GANA_V1", section: "PANCHANG", basis: "classical",
    sourceId: "NAKSHATRA_GANA_TABLE",
    description: "Nakshatra Deva/Manushya/Rakshasa Gana classification (§5.3)." },
  { ruleId: "NAKSHATRA_ACTIVITY_CLASS_V1", section: "PANCHANG", basis: "classical",
    sourceId: "NAKSHATRA_ACTIVITY_TABLE",
    description: "Nakshatra Fixed/Movable/Soft/Sharp/Mixed/Swift class per category (§5.3)." },
  { ruleId: "YOGA_CLASSIFICATION_V1", section: "PANCHANG", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Yoga SUPPORTIVE/CAUTION/NEUTRAL aggregation of multiple classical opinions (§5.4)." },
  { ruleId: "BHADRA_V1", section: "PANCHANG", basis: "classical",
    sourceId: "PANCHANG_KARANA_TABLE",
    description: "Bhadra / Vishti Karana universal prohibition (§5.5, §9)." },
  { ruleId: "VARA_ELIGIBILITY_V1", section: "PANCHANG", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Weekday-vs-category eligibility table (§5.1). Pinned but no single classical source." },
  { ruleId: "ABHIJIT_MUHURTA_V1", section: "SEGMENT", basis: "classical",
    sourceId: "MIDDAY_HALF_WINDOW_FORMULA",
    description: "Sunrise + half-day-span, ±24 minutes overlay (§5.6)." },
  { ruleId: "BRAHMA_MUHURTA_V1", section: "SEGMENT", basis: "classical",
    sourceId: "PRE_SUNRISE_96_48_MINUTE_WINDOW",
    description: "Pre-sunrise Brahma Muhurta overlay (spiritual practice) (§5.6)." },
  { ruleId: "GODHULI_V1", section: "SEGMENT", basis: "classical",
    sourceId: "SUNSET_TWILIGHT_WINDOW",
    description: "Godhuli twilight window (§5.6)." },
  { ruleId: "RAHU_KAAL_V1", section: "SEGMENT", basis: "classical",
    sourceId: "WEEKDAY_KAAL_SEGMENTATION",
    description: "Rahu Kaal weekday-specific inauspicious segment (§5.7)." },
  { ruleId: "GULIKA_KAAL_V1", section: "SEGMENT", basis: "classical",
    sourceId: "WEEKDAY_KAAL_SEGMENTATION",
    description: "Gulika Kaal weekday-specific inauspicious segment (§5.7)." },
  { ruleId: "YAMAGANDA_V1", section: "SEGMENT", basis: "classical",
    sourceId: "WEEKDAY_KAAL_SEGMENTATION",
    description: "Yamaganda weekday-specific inauspicious segment (§5.7)." },

  // --- TARA (§6) ------------------------------------------------------------
  { ruleId: "TARA_BALA_INDEXING_V1", section: "TARA", basis: "classical",
    sourceId: "TARA_CHAKRA_TABLE",
    description: "9-Tara chakra indexing formula from janma to transit Moon nakshatra (§6)." },
  { ruleId: "TARA_BALA_LABELS_V1", section: "TARA", basis: "classical",
    sourceId: "TARA_CHAKRA_TABLE",
    description: "Classical labels Janma/Sampat/Vipat/Kshema/Pratyak/Sadhaka/Vadha/Mitra/Ati-Mitra (§6)." },
  { ruleId: "TARA_BALA_WEIGHTING_V1", section: "TARA", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Vadha −2 asymmetric weighting; all other CAUTION Taras −1 (§6). Product-normalized ranking modifier." },
  { ruleId: "TARA_BALA_UNAVAILABLE_V1", section: "STATUS", basis: "classical",
    sourceId: "TARA_CHAKRA_TABLE",
    description: "Missing janma nakshatra → PARTIAL: MISSING_JANMA_NAKSHATRA (§6, §13)." },

  // --- CHANDRA BALA (§7) ---------------------------------------------------
  { ruleId: "CHANDRA_BALA_INDEXING_V1", section: "CHANDRA", basis: "classical",
    sourceId: "CHANDRA_BALA_HOUSE_PARTITION",
    description: "12-house Chandra Bala indexing formula from janma to transit Moon rashi (§7)." },
  { ruleId: "CHANDRA_BALA_STRICT_V1", section: "CHANDRA", basis: "classical",
    sourceId: "CHANDRA_BALA_HOUSE_PARTITION",
    description: "Strict Chandra Bala with no aspect override (§7). Vartara variant deferred to V2." },
  { ruleId: "CHANDRA_BALA_UNAVAILABLE_V1", section: "STATUS", basis: "classical",
    sourceId: "CHANDRA_BALA_HOUSE_PARTITION",
    description: "Missing janma rashi → PARTIAL: MISSING_JANMA_RASHI (§7, §13)." },

  // --- LAGNA (§8.1) --------------------------------------------------------
  { ruleId: "LAGNA_QUALITY_V1", section: "LAGNA", basis: "classical",
    sourceId: "RASHI_QUALITY_TABLE",
    description: "Fixed/Movable/Dual Lagna classification per category (§8.1)." },
  { ruleId: "LAGNA_LORD_PLACEMENT_V1", section: "LAGNA", basis: "classical",
    sourceId: "KENDRA_TRIKONA_DUSTHANA_TABLE",
    description: "Lagna-lord in kendra/trikona SUPPORTIVE vs dusthana CAUTION (§8.1)." },
  { ruleId: "EIGHTH_HOUSE_MALEFIC_V1", section: "LAGNA", basis: "classical",
    sourceId: "MALEFIC_LIST",
    description: "Malefic in 8th → CAUTION for business/vehicle/travel (§8.1)." },
  { ruleId: "SEVENTH_HOUSE_TRAVEL_V1", section: "LAGNA", basis: "classical",
    sourceId: "TRAVEL_LAGNA_7TH_TABLE",
    description: "Travel: malefic in 7th → CAUTION; benefic → SUPPORTIVE (§8.1)." },

  // --- PLANETARY (§8.2, §8.3) ---------------------------------------------
  { ruleId: "ASHTAKAVARGA_BALA_PRODUCT_V1", section: "PLANETARY", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "BAV of the category karaka at transit Moon rashi. Ashtakavarga is Card 7 (not a classical Muhurta factor) (§8.2)." },
  { ruleId: "DASHA_LORD_KARAKA_V1", section: "PLANETARY", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Active Vimshottari Mahadasha or Antardasha lord acting as event karaka → SUPPORTIVE (§8.2)." },
  { ruleId: "KARAKA_DIGNITY_V1", section: "PLANETARY", basis: "classical",
    sourceId: "DIGNITY_TABLE",
    description: "Karaka own-sign/exaltation SUPPORTIVE; debilitation CAUTION (§8.2)." },
  { ruleId: "KARAKA_RETROGRADE_V1", section: "PLANETARY", basis: "classical",
    sourceId: "RETROGRADE_TABLE",
    description: "Karaka retrograde → CAUTION for business/vehicle/travel (§8.3)." },
  { ruleId: "KARAKA_COMBUST_V1", section: "PLANETARY", basis: "classical",
    sourceId: "COMBUSTION_TABLE",
    description: "Karaka within 8° of Sun → CAUTION (§8.3)." },
  { ruleId: "MERCURY_RETROGRADE_TRAVEL_V1", section: "PLANETARY", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Mercury retrograde as travel-prohibition — modern amalgamation, no single classical source (§9)." },

  // --- DOSHA / EXCLUSIONS (§9) --------------------------------------------
  { ruleId: "GAND_ANTA_V1", section: "DOSHA", basis: "classical",
    sourceId: "NAKSHATRA_RASHI_JUNCTION_TABLE",
    description: "Rashi ↔ Nakshatra junction ±48′ universal prohibition for travel/business/vehicle (§9)." },
  { ruleId: "PANCHAKA_V1", section: "DOSHA", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Aquarius→Pisces Moon path collapsed to single CAUTION flag; 5-sub-window granularity deferred to V2 (§17.2)." },
  { ruleId: "ECLIPSE_DAY_V1", section: "DOSHA", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Solar/Lunar eclipse day → universal CAUTION; specific chapter/page not registered for V1 (§8.3, §17.3)." },
  { ruleId: "SADE_SATI_PHASE_2_V1", section: "DOSHA", basis: "classical",
    sourceId: "GOCHAR_SADE_SATI_TABLE",
    description: "Transit Saturn in 2nd from natal Moon → CAUTION for business (§9)." },
  { ruleId: "ASHTAMA_SHANI_V1", section: "DOSHA", basis: "classical",
    sourceId: "GOCHAR_SADE_SATI_TABLE",
    description: "Transit Saturn in 8th from natal Moon → CAUTION for business/travel (§9)." },
  { ruleId: "MRITYU_BHAGA_V1", section: "DOSHA", basis: "classical",
    sourceId: "MRITYU_BHAGA_TABLE",
    description: "Planet within ±1° of Mrityu Bhaga → CAUTION for business/vehicle (§9)." },
  { ruleId: "RIKTA_TITHI_CATEGORY_SPECIFIC_V1", section: "DOSHA", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Rikta (4/9/14) CAUTION for business/education only; other categories NEUTRAL (§17.1). No single classical source." },
  { ruleId: "SHARP_NAKSHATRA_EDUCATION_V1", section: "DOSHA", basis: "classical",
    sourceId: "NAKSHATRA_ACTIVITY_TABLE",
    description: "Sharp (Tikshna/Ugra) Nakshatra → CAUTION for education start (§9)." },
  { ruleId: "YAMAGHANTAKA_V1", section: "DOSHA", basis: "classical",
    sourceId: "WEEKDAY_YAMAGHANTAKA_TABLE",
    description: "Yamaghantaka weekday-specific window → CAUTION for travel (§9)." },

  // --- SCORING & RANKING (§11) --------------------------------------------
  { ruleId: "MUHURAT_RANKING_V1", section: "SCORING", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Six-stage deterministic ranking pipeline: hard-prohibition filter → score → outside caution kaal → applicable supportive overlay → continuity → earlier UTC (§11.2)." },
  { ruleId: "BUCKET_RES_5_MIN_V1", section: "SCORING", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "5-minute bucket resolution for per-day search (§11.1)." },
  { ruleId: "EVENT_KARAKA_V1", section: "SCORING", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Event category → primary/secondary planetary karaka (§14)." },

  // --- STATUS / PARTIAL (§13, §16) ----------------------------------------
  { ruleId: "PARTIAL_MISSING_JANMA_NAKSHATRA_V1", section: "STATUS", basis: "classical",
    sourceId: "TARA_CHAKRA_TABLE",
    description: "Partial-flag when janma nakshatra unavailable (§13)." },
  { ruleId: "PARTIAL_MISSING_JANMA_RASHI_V1", section: "STATUS", basis: "classical",
    sourceId: "CHANDRA_BALA_HOUSE_PARTITION",
    description: "Partial-flag when janma rashi unavailable (§13)." },
  { ruleId: "PARTIAL_MISSING_NATAL_CHART_V1", section: "STATUS", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Partial-flag when natal chart unavailable (§13). Product-normalized status marker." },
  { ruleId: "PARTIAL_MISSING_DASHA_LINEAGE_V1", section: "STATUS", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Partial-flag when Vimshottari Dasha lineage unavailable (§13)." },
  { ruleId: "PARTIAL_MISSING_ASHTAKAVARGA_V1", section: "STATUS", basis: "PRODUCT_NORMALIZED",
    sourceId: null,
    description: "Partial-flag when Ashtakavarga unavailable (§13)." },
  { ruleId: "HIGH_LATITUDE_NO_SUNRISE_SUNSET_V1", section: "STATUS", basis: "classical",
    sourceId: "PANCHANG_RISE_SET_TABLE",
    description: "Polar-day/night → UNAVAILABLE_HIGH_LATITUDE (§12). Inherits Card 11.R3 no-event guard." },
] as const;

const INDEX = new Map(RULES.map((r) => [r.ruleId, r] as const));

export const MUHURAT_RULE_REGISTRY: readonly MuhuratRule[] = RULES;

export function getMuhuratRule(ruleId: string): MuhuratRule {
  const rule = INDEX.get(ruleId);
  if (!rule) {
    throw new Error(
      `Unregistered muhurat rule "${ruleId}". Every emitted rule must be registered.`
    );
  }
  return rule;
}

/** Deterministic 16-hex fingerprint of the frozen registry, for provenance change-detection.
 * Not cryptographic. Uses two independent 32-bit FNV-1a rolls (byte + reversed byte) and
 * concatenates them into 16 hex chars. Pure Number arithmetic — no BigInt, no ES2020 needed. */
export function computeRulebookHash(): string {
  const serialized = MUHURAT_RULE_REGISTRY
    .map((r) => `${r.ruleId}|${r.section}|${r.basis}|${r.sourceId ?? ""}|${r.description}`)
    .join("\n");
  const fnv32 = (input: string, offset: number): number => {
    let h = 0x811c9dc5 ^ offset;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i) & 0xff;
      // FNV-1a 32-bit prime = 0x01000193
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  };
  const a = fnv32(serialized, 0).toString(16).padStart(8, "0");
  const b = fnv32(serialized.split("").reverse().join(""), 0xdeadbeef).toString(16).padStart(8, "0");
  return (a + b).slice(0, 16);
}
