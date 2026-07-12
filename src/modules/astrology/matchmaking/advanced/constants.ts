// Card 10A.2 — Advanced matchmaking constants + shared helpers (pure).
//
// Parashari graha-drishti offsets match the verified project implementation
// (rules/aspects.ts): 7th for all; Mars 4/7/8; Jupiter 5/7/9; Saturn 3/7/10.
// Dignity/friendship reuse Card 10 + lib tables (deep-imported; not recreated).

import {
  ownSignsByBody,
  exaltationSignsByBody,
  debilitationSignsByBody,
  signRulerMap,
} from "@/lib/astrology/constants";
import { zodiacSigns } from "@/modules/astrology/constants";
import type { ClassicalPlanetaryBody, ZodiacSign } from "@/modules/astrology/types";
import {
  NATURAL_FRIENDSHIP,
  friendshipView,
} from "@/modules/astrology/matchmaking/premium/constants";
import type { PlanetCondition } from "@/modules/astrology/matchmaking/advanced/types";

export { NATURAL_FRIENDSHIP, friendshipView };

export const CLASSICAL_LORDS = [
  "SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN",
] as const;

export const NATURAL_BENEFICS = new Set(["JUPITER", "VENUS", "MERCURY", "MOON"]);
export const NATURAL_MALEFICS = new Set(["SATURN", "MARS", "SUN", "RAHU", "KETU"]);

/** Parashari aspect house-offsets (1 = same house). Nodes -> 7th only. */
export const ASPECT_HOUSE_OFFSETS: Record<string, number[]> = {
  SUN: [7], MOON: [7], MERCURY: [7], VENUS: [7],
  MARS: [4, 7, 8], JUPITER: [5, 7, 9], SATURN: [3, 7, 10],
  RAHU: [7], KETU: [7],
};

/** Does `planet` at whole-sign house `fromHouse` aspect `targetHouse`? */
export function aspectsHouse(planet: string, fromHouse: number, targetHouse: number): boolean {
  const offsets = ASPECT_HOUSE_OFFSETS[planet] ?? [7];

  return offsets.some((offset) => ((fromHouse - 1 + (offset - 1)) % 12) + 1 === targetHouse);
}

export function signLordOf(signIndex: number): string {
  return signRulerMap[zodiacSigns[signIndex] as ZodiacSign];
}

/** Dignity of a planet in a given sign (own/exalted/debilitated/neutral). */
export function dignityOf(planet: string, signIndex: number | null): PlanetCondition["dignity"] {
  if (signIndex === null) {
    return "unavailable";
  }

  const sign = zodiacSigns[signIndex] as ZodiacSign;
  const own = ownSignsByBody[planet as ClassicalPlanetaryBody] ?? [];

  if (exaltationSignsByBody[planet as ClassicalPlanetaryBody] === sign) return "exalted";
  if (debilitationSignsByBody[planet as ClassicalPlanetaryBody] === sign) return "debilitated";
  if (own.includes(sign)) return "own";

  return "neutral";
}

/** Whole-sign house of `subjectSign` counted from `referenceSign`, 1..12. */
export function houseFromSign(subjectSign: number, referenceSign: number): number {
  return ((((subjectSign - referenceSign) % 12) + 12) % 12) + 1;
}

export const OWN_SIGNS_BY_BODY = ownSignsByBody;
export const EXALTATION_SIGNS_BY_BODY = exaltationSignsByBody;
export const DEBILITATION_SIGNS_BY_BODY = debilitationSignsByBody;

// Relationship significators used by the Dasha layer (classical).
export const RELATIONSHIP_KARAKAS = ["VENUS", "JUPITER"] as const;
