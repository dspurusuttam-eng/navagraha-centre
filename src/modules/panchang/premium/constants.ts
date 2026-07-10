// Card 9.2 — Pinned classical tables + immutable rule registry.
//
// The Choghadiya day/night tables and the Hora cycle are pinned verbatim from
// the Card 9.1 formula contract (single authoritative variant; regional
// variants documented there and NOT mixed). The Rahu/Gulika/Yamaganda weekday
// tables are imported from Card 2 (single source of truth) and re-exported.
//
// Internal consistency invariants (asserted in QA, never used as the source):
//   - day Choghadiya row = weekday lord's choghadiya followed by the Hora cycle;
//   - every row's 8th entry equals its 1st;
//   - the 25th Hora after a weekday-lord start is the next weekday's lord
//     (24 steps through a 7-cycle == +3 steps).

import type {
  ChoghadiyaClassification,
  ChoghadiyaKey,
  HoraPlanet,
} from "@/modules/panchang/premium/types";

export {
  RAHU_KAAL_SEGMENTS_BY_WEEKDAY,
  GULIKA_KAAL_SEGMENTS_BY_WEEKDAY,
  YAMAGANDA_SEGMENTS_BY_WEEKDAY,
} from "@/modules/panchang/engine";

/** Classical Vedic hora succession (locked). */
export const HORA_SEQUENCE: readonly HoraPlanet[] = [
  "SUN",
  "VENUS",
  "MERCURY",
  "MOON",
  "SATURN",
  "JUPITER",
  "MARS",
] as const;

/** Weekday lords, Sunday-first (locked). */
export const WEEKDAY_LORDS: readonly HoraPlanet[] = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
] as const;

export const VARA_NAMES = [
  "Sunday (Ravi Vara)",
  "Monday (Soma Vara)",
  "Tuesday (Mangala Vara)",
  "Wednesday (Budha Vara)",
  "Thursday (Guru Vara)",
  "Friday (Shukra Vara)",
  "Saturday (Shani Vara)",
] as const;

/** Planet -> Choghadiya mapping (locked). */
export const CHOGHADIYA_BY_PLANET: Record<HoraPlanet, ChoghadiyaKey> = {
  SUN: "UDVEG",
  MOON: "AMRIT",
  MARS: "ROG",
  MERCURY: "LABH",
  JUPITER: "SHUBH",
  VENUS: "CHAL",
  SATURN: "KAAL",
};

export const CHOGHADIYA_DISPLAY_NAMES: Record<ChoghadiyaKey, string> = {
  AMRIT: "Amrit",
  SHUBH: "Shubh",
  LABH: "Labh",
  CHAL: "Chal",
  ROG: "Rog",
  KAAL: "Kaal",
  UDVEG: "Udveg",
};

export const CHOGHADIYA_CLASSIFICATION: Record<
  ChoghadiyaKey,
  ChoghadiyaClassification
> = {
  AMRIT: "supportive",
  SHUBH: "supportive",
  LABH: "supportive",
  CHAL: "neutral_movable",
  ROG: "caution",
  KAAL: "caution",
  UDVEG: "caution",
};

/** Pinned 7x8 DAY Choghadiya table, Sunday-first (Card 9.1 section 7). */
export const CHOGHADIYA_DAY_TABLE: readonly (readonly ChoghadiyaKey[])[] = [
  ["UDVEG", "CHAL", "LABH", "AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG"],
  ["AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG", "CHAL", "LABH", "AMRIT"],
  ["ROG", "UDVEG", "CHAL", "LABH", "AMRIT", "KAAL", "SHUBH", "ROG"],
  ["LABH", "AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG", "CHAL", "LABH"],
  ["SHUBH", "ROG", "UDVEG", "CHAL", "LABH", "AMRIT", "KAAL", "SHUBH"],
  ["CHAL", "LABH", "AMRIT", "KAAL", "SHUBH", "ROG", "UDVEG", "CHAL"],
  ["KAAL", "SHUBH", "ROG", "UDVEG", "CHAL", "LABH", "AMRIT", "KAAL"],
] as const;

/** Pinned 7x8 NIGHT Choghadiya table, Sunday-first (Card 9.1 section 7). */
export const CHOGHADIYA_NIGHT_TABLE: readonly (readonly ChoghadiyaKey[])[] = [
  ["SHUBH", "AMRIT", "CHAL", "ROG", "KAAL", "LABH", "UDVEG", "SHUBH"],
  ["CHAL", "ROG", "KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT", "CHAL"],
  ["KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT", "CHAL", "ROG", "KAAL"],
  ["UDVEG", "SHUBH", "AMRIT", "CHAL", "ROG", "KAAL", "LABH", "UDVEG"],
  ["AMRIT", "CHAL", "ROG", "KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT"],
  ["ROG", "KAAL", "LABH", "UDVEG", "SHUBH", "AMRIT", "CHAL", "ROG"],
  ["LABH", "UDVEG", "SHUBH", "AMRIT", "CHAL", "ROG", "KAAL", "LABH"],
] as const;

// --- Immutable rule registry ---------------------------------------------------

export type PremiumRule = {
  ruleId: string;
  basis: "classical" | "product";
  description: string;
};

const RULES: readonly PremiumRule[] = [
  { ruleId: "PANCHANG_TITHI_INDEX", basis: "classical", description: "floor(norm(Moon-Sun)/12deg)+1, 1..30" },
  { ruleId: "PANCHANG_TITHI_TRANSITION", basis: "classical", description: "phase crosses 12deg multiple; bisection <=1s" },
  { ruleId: "PANCHANG_NAKSHATRA_INDEX", basis: "classical", description: "floor(sidereal Moon/13deg20min)+1, 1..27, pada 1..4" },
  { ruleId: "PANCHANG_NAKSHATRA_TRANSITION", basis: "classical", description: "Moon crosses 13deg20min multiple; bisection <=1s" },
  { ruleId: "PANCHANG_YOGA_INDEX", basis: "classical", description: "floor(norm(Sun+Moon)/13deg20min)+1, 1..27" },
  { ruleId: "PANCHANG_YOGA_TRANSITION", basis: "classical", description: "sum crosses 13deg20min multiple; bisection <=1s" },
  { ruleId: "PANCHANG_KARANA_INDEX", basis: "classical", description: "floor(phase/6deg)+1, 1..60, fixed+repeating mapping" },
  { ruleId: "PANCHANG_KARANA_TRANSITION", basis: "classical", description: "phase crosses 6deg multiple; bisection <=1s" },
  { ruleId: "PANCHANG_VARA_SUNRISE_ANCHORED", basis: "classical", description: "vara = weekday of the Panchang day containing the instant; pre-sunrise belongs to previous vara" },
  { ruleId: "RISESET_SUNRISE", basis: "classical", description: "topocentric refracted upper-limb sunrise (Swiss Ephemeris), elevation 0 m" },
  { ruleId: "RISESET_SUNSET", basis: "classical", description: "topocentric refracted upper-limb sunset" },
  { ruleId: "RISESET_NEXT_SUNRISE", basis: "classical", description: "next sunrise searched from sunset instant" },
  { ruleId: "RISESET_MOONRISE", basis: "classical", description: "topocentric moonrise; legitimately absent on some dates" },
  { ruleId: "RISESET_MOONSET", basis: "classical", description: "topocentric moonset; legitimately absent on some dates" },
  { ruleId: "HORA_DAY", basis: "classical", description: "sunrise->sunset /12; first hora = weekday lord; cycle Sun,Venus,Mercury,Moon,Saturn,Jupiter,Mars" },
  { ruleId: "HORA_NIGHT", basis: "classical", description: "sunset->next sunrise /12; sequence continues through sunset" },
  { ruleId: "CHOGHADIYA_DAY", basis: "classical", description: "sunrise->sunset /8; pinned weekday table (Card 9.1 section 7)" },
  { ruleId: "CHOGHADIYA_NIGHT", basis: "classical", description: "sunset->next sunrise /8; pinned weekday table (Card 9.1 section 7)" },
  { ruleId: "RAHU_KAAL_DAY_SEGMENT", basis: "classical", description: "8 equal day segments; weekday table [8,2,7,5,6,4,3]" },
  { ruleId: "YAMAGANDA_DAY_SEGMENT", basis: "classical", description: "8 equal day segments; weekday table [5,4,3,2,1,7,6]" },
  { ruleId: "GULIKA_DAY_SEGMENT", basis: "classical", description: "8 equal day segments; weekday table [7,6,5,4,3,2,1]" },
  { ruleId: "ABHIJIT_MIDDAY_MUHURTA", basis: "classical", description: "solar midday +/- daylength/30 (8th of 15 day-muhurtas); Wednesday flag factual-only" },
  { ruleId: "BRAHMA_FIXED_48MIN", basis: "product", description: "sunrise-96min to sunrise-48min; FIXED_48MIN_MUHURTA convention pinned; proportional variant deferred" },
] as const;

const RULE_INDEX = new Map(RULES.map((rule) => [rule.ruleId, rule] as const));

export const PREMIUM_RULE_REGISTRY: readonly PremiumRule[] = RULES;

export function getPremiumRule(ruleId: string): PremiumRule {
  const rule = RULE_INDEX.get(ruleId);

  if (!rule) {
    throw new Error(
      `Unregistered premium panchang rule "${ruleId}". Every emitted element/interval must reference a registered rule.`
    );
  }

  return rule;
}
