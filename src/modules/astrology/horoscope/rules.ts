// Card 8B — Immutable rule registry + locked category significator map.
//
// Every evidence token MUST reference a ruleId registered here; the builders
// call getRule() which throws on an unregistered id, so no unregistered rule
// can ever contribute to a rating. ruleIds are permanent and unique.
//
// Significator map is the exact Card 8A.1 lock. All house significations and
// karakas are classical BPHS/Parashari; the *selection* of houses/karakas that
// define a product category is labelled product-normalization-over-classical.

import type { ClassicalPlanetaryBody } from "@/modules/astrology/types";
import type { VargaCode } from "@/modules/astrology/divisional";
import type {
  EvidenceTier,
  HoroscopeCategoryKey,
  RatingBand,
  RuleBasis,
  SourceSystem,
} from "@/modules/astrology/horoscope/types";

export type RuleDefinition = {
  ruleId: string;
  sourceSystem: SourceSystem;
  classicalOrProduct: RuleBasis;
  basis: string;
  nominalTier: EvidenceTier;
};

const RULES: readonly RuleDefinition[] = [
  // --- Vimshottari (phase driver, P1) ---------------------------------------
  {
    ruleId: "DASHA_LORD_OWNS_AND_OCCUPIES",
    sourceSystem: "vimshottari",
    classicalOrProduct: "classical",
    basis:
      "Active Maha/Antar lord is a category house-lord and natally occupies that house (BPHS bhava-lord strength). Enumerated primary rule; tier magnitude 2 is product.",
    nominalTier: 2,
  },
  {
    ruleId: "DASHA_LORD_OWNS_PRIMARY_HOUSE",
    sourceSystem: "vimshottari",
    classicalOrProduct: "classical",
    basis: "Active dasha lord rules a primary category house (BPHS bhava-lordship).",
    nominalTier: 1,
  },
  {
    ruleId: "DASHA_LORD_OCCUPIES_HOUSE",
    sourceSystem: "vimshottari",
    classicalOrProduct: "classical",
    basis: "Active dasha lord natally occupies a category house.",
    nominalTier: 1,
  },
  {
    ruleId: "DASHA_LORD_ASPECTS_HOUSE",
    sourceSystem: "vimshottari",
    classicalOrProduct: "classical",
    basis:
      "Active dasha lord casts a Parashari graha-drishti on a primary category house (7th all; Mars 4/8; Jupiter 5/9; Saturn 3/10; nodes 7th-only = product simplification).",
    nominalTier: 1,
  },
  {
    ruleId: "DASHA_LORD_IS_KARAKA",
    sourceSystem: "vimshottari",
    classicalOrProduct: "classical",
    basis: "Active dasha lord is a naisargika karaka of the category.",
    nominalTier: 1,
  },

  // --- Sade Sati / Saturn (caution overlay, P1-caution) ---------------------
  {
    ruleId: "SADE_SATI_PEAK",
    sourceSystem: "sadeSati",
    classicalOrProduct: "classical",
    basis: "Saturn transiting Moon sign (Sade Sati peak). Enumerated primary caution.",
    nominalTier: -2,
  },
  {
    ruleId: "SADE_SATI_RISING",
    sourceSystem: "sadeSati",
    classicalOrProduct: "classical",
    basis: "Saturn in 12th from Moon (Sade Sati rising phase).",
    nominalTier: -1,
  },
  {
    ruleId: "SADE_SATI_SETTING",
    sourceSystem: "sadeSati",
    classicalOrProduct: "classical",
    basis: "Saturn in 2nd from Moon (Sade Sati setting phase).",
    nominalTier: -1,
  },
  {
    ruleId: "SATURN_ASHTAMA_8TH",
    sourceSystem: "sadeSati",
    classicalOrProduct: "classical",
    basis: "Saturn in 8th from Moon (Ashtama Shani). Enumerated primary caution.",
    nominalTier: -2,
  },
  {
    ruleId: "SATURN_KANTAKA_4TH",
    sourceSystem: "sadeSati",
    classicalOrProduct: "classical",
    basis: "Saturn in 4th from Moon (Kantaka/Ardhashtama).",
    nominalTier: -1,
  },

  // --- Gochar (current window, P2; gated by BAV) ----------------------------
  {
    ruleId: "GOCHAR_MOON_BENEFIC",
    sourceSystem: "gocharFromMoon",
    classicalOrProduct: "classical",
    basis:
      "Category significator transiting a benefic house from natal Moon (Card 6 BENEFIC_HOUSES_FROM_MOON, classical Chandra-gochar).",
    nominalTier: 1,
  },
  {
    ruleId: "GOCHAR_MOON_NON_BENEFIC",
    sourceSystem: "gocharFromMoon",
    classicalOrProduct: "classical",
    basis: "Category significator transiting a non-benefic house from natal Moon.",
    nominalTier: -1,
  },
  {
    ruleId: "GOCHAR_LAGNA_HOUSE_OCCUPANCY",
    sourceSystem: "gocharFromLagna",
    classicalOrProduct: "classical",
    basis: "Category significator currently transiting a primary category house from natal Lagna.",
    nominalTier: 1,
  },

  // --- Ashtakavarga BAV gate (modifier, not a standalone vote) ---------------
  {
    ruleId: "BAV_GATE_APPLIED",
    sourceSystem: "ashtakavargaBAV",
    classicalOrProduct: "product",
    basis:
      "Bhinnashtakavarga bindus of the transiting planet in its current sign gate the Gochar token (classical: transit fruit read with bindus). Threshold mapping >=5 keep / 3-4 reduce / <=2 cap-positive is product-normalization.",
    nominalTier: 0,
  },

  // --- Ashtakavarga SAV context ---------------------------------------------
  {
    ruleId: "SAV_STRONG_HOUSE",
    sourceSystem: "ashtakavargaSAV",
    classicalOrProduct: "product",
    basis: "Sarvashtakavarga bindus of the category house sign are strong (>=30). Threshold is product over classical SAV.",
    nominalTier: 1,
  },
  {
    ruleId: "SAV_WEAK_HOUSE",
    sourceSystem: "ashtakavargaSAV",
    classicalOrProduct: "product",
    basis: "Sarvashtakavarga bindus of the category house sign are weak (<=24). Threshold is product over classical SAV.",
    nominalTier: -1,
  },

  // --- Panchang (day tone + windows, P3; general_day_quality only) ----------
  {
    ruleId: "PANCHANG_TONE_SUPPORTIVE",
    sourceSystem: "panchang",
    classicalOrProduct: "product",
    basis: "Card 2 Panchang daily tone is supportive. Tone->tier mapping is product; tone itself is classical Panchang.",
    nominalTier: 1,
  },
  {
    ruleId: "PANCHANG_TONE_REFLECTIVE",
    sourceSystem: "panchang",
    classicalOrProduct: "product",
    basis: "Card 2 Panchang daily tone is reflective/caution-leaning. Tone->tier mapping is product.",
    nominalTier: -1,
  },

  // --- Divisional (natal potential modifier, <= +/-1, never phase) ----------
  {
    ruleId: "VARGA_KARAKA_DIGNIFIED",
    sourceSystem: "divisional",
    classicalOrProduct: "classical",
    basis: "Category primary karaka is in own/exaltation sign in the category's divisional chart (classical varga dignity).",
    nominalTier: 1,
  },
  {
    ruleId: "VARGA_KARAKA_DEBILITATED",
    sourceSystem: "divisional",
    classicalOrProduct: "classical",
    basis: "Category primary karaka is debilitated in the category's divisional chart.",
    nominalTier: -1,
  },
] as const;

const RULE_INDEX: Map<string, RuleDefinition> = new Map(
  RULES.map((rule) => [rule.ruleId, rule] as const)
);

export const RULE_REGISTRY: readonly RuleDefinition[] = RULES;

export function getRule(ruleId: string): RuleDefinition {
  const rule = RULE_INDEX.get(ruleId);

  if (!rule) {
    throw new Error(
      `Unregistered horoscope rule "${ruleId}". Every evidence token must reference a registered rule.`
    );
  }

  return rule;
}

export const RULE_PREFIXES = [
  "DASHA_",
  "SADE_SATI_",
  "SATURN_",
  "GOCHAR_",
  "BAV_",
  "SAV_",
  "PANCHANG_",
  "VARGA_",
] as const;

// --- Category significator map (Card 8A.1 lock) ------------------------------

export type CategorySignificator = {
  key: HoroscopeCategoryKey;
  primaryHouses: number[];
  secondaryHouses: number[];
  karakas: ClassicalPlanetaryBody[];
  supporting: ClassicalPlanetaryBody[];
  varga: VargaCode | null;
  /** Reference frame for structural house lookups (house-lord, SAV byHouse). */
  frame: "lagna";
  /** Whether Sade Sati peak / ashtama caps this category's band at "mixed". */
  sadeSatiCapped: boolean;
  /** Hard structural ceiling on the emitted band (e.g. travel). */
  ratingCap: RatingBand | null;
  framing: "standard" | "energy_routine";
  basis: string;
};

export const CATEGORY_SIGNIFICATORS: Record<
  HoroscopeCategoryKey,
  CategorySignificator
> = {
  general_day_quality: {
    key: "general_day_quality",
    primaryHouses: [1],
    secondaryHouses: [4, 11],
    karakas: ["MOON"],
    supporting: ["SUN"],
    varga: null,
    frame: "lagna",
    sadeSatiCapped: true,
    ratingCap: null,
    framing: "standard",
    basis:
      "Lagna + Chandra-lagna day read; classical Chandra-gochar + Panchang. Category framing is product-normalization.",
  },
  career_work: {
    key: "career_work",
    primaryHouses: [10],
    secondaryHouses: [6, 11],
    karakas: ["SUN", "SATURN", "MERCURY"],
    supporting: ["JUPITER"],
    varga: "D10",
    frame: "lagna",
    sadeSatiCapped: false,
    ratingCap: null,
    framing: "standard",
    basis: "BPHS 10th karma-sthana (+6/11); Sun/Saturn/Mercury karakas; D10.",
  },
  finance_resources: {
    key: "finance_resources",
    primaryHouses: [2, 11],
    secondaryHouses: [5, 9],
    karakas: ["JUPITER", "VENUS"],
    supporting: ["MERCURY"],
    varga: "D2",
    frame: "lagna",
    sadeSatiCapped: false,
    ratingCap: null,
    framing: "standard",
    basis: "BPHS 2/11 dhana-sthanas; Jupiter/Venus karakas; D2 Hora.",
  },
  relationships: {
    key: "relationships",
    primaryHouses: [7],
    secondaryHouses: [5, 11],
    karakas: ["VENUS"],
    supporting: ["JUPITER", "MOON"],
    varga: "D9",
    frame: "lagna",
    sadeSatiCapped: true,
    ratingCap: null,
    framing: "standard",
    basis:
      "BPHS 7th kalatra-sthana; Venus-only karaka in V1 (avoids gendered spouse-karaka mixing); D9.",
  },
  health_routine: {
    key: "health_routine",
    primaryHouses: [1, 6],
    secondaryHouses: [8],
    karakas: ["SUN", "SATURN"],
    supporting: ["MOON"],
    varga: "D30",
    frame: "lagna",
    sadeSatiCapped: true,
    ratingCap: null,
    framing: "energy_routine",
    basis:
      "BPHS 1/6 (8 caution only); Sun/Saturn karakas; D30. Framed as energy/routine only.",
  },
  study_planning: {
    key: "study_planning",
    primaryHouses: [5, 4],
    secondaryHouses: [9, 2],
    karakas: ["MERCURY", "JUPITER"],
    supporting: [],
    varga: "D24",
    frame: "lagna",
    sadeSatiCapped: false,
    ratingCap: null,
    framing: "standard",
    basis: "BPHS 5th vidya-sthana (+4/9/2); Mercury/Jupiter karakas; D24.",
  },
  travel_mobility: {
    key: "travel_mobility",
    primaryHouses: [3, 12],
    secondaryHouses: [9],
    karakas: ["MERCURY", "MOON"],
    supporting: [],
    varga: null,
    frame: "lagna",
    sadeSatiCapped: false,
    ratingCap: "supportive",
    framing: "standard",
    basis:
      "BPHS 3/12 travel-sthanas; Mercury/Moon karakas; no dedicated varga -> structural humility cap at supportive.",
  },
};
