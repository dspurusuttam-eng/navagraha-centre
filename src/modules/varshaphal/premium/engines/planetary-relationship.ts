// Card 14.2B2 — planetary relationship helpers (pure). Reuses the certified
// natural-friendship table (Card 10.2) and dignity sign tables; adds classical
// Panchadha (five-fold) maitri = natural + temporary friendship for Bala.
import { friendshipView } from "@/modules/astrology/matchmaking/premium/constants";
import type { ClassicalLord } from "@/modules/astrology/matchmaking/premium/types";
import {
  debilitationSignsByBody,
  exaltationSignsByBody,
  ownSignsByBody,
  signRulerMap,
  zodiacSignOrder,
  type TajikaRelationship,
} from "@/modules/varshaphal/premium/constants";
import type { PlanetaryBody } from "@/modules/astrology/types";
import type { TajikaGraha } from "@/modules/varshaphal/premium/types";

const asLord = (g: TajikaGraha): ClassicalLord => g as unknown as ClassicalLord;

/** Certified natural (naisargika) friendship view. */
export function naturalFriendship(from: TajikaGraha, to: TajikaGraha): "friend" | "neutral" | "enemy" {
  return friendshipView(asLord(from), asLord(to));
}

/** Temporary friendship (symmetric): friend when the other sign is 2,3,4,10,11,12 away. */
export function temporaryFriend(signA: number, signB: number): boolean {
  const d = ((signB - signA + 12) % 12) + 1;
  return [2, 3, 4, 10, 11, 12].includes(d);
}

/** Panchadha (compound) relationship of `planet` to `other` (own handled by caller). */
export function panchadhaRelationship(
  planet: TajikaGraha, other: TajikaGraha, planetSign: number, otherSign: number,
): TajikaRelationship {
  const nat = naturalFriendship(planet, other);
  const tempFriend = temporaryFriend(planetSign, otherSign);
  if (nat === "friend") return tempFriend ? "GREAT_FRIEND" : "NEUTRAL";
  if (nat === "neutral") return tempFriend ? "FRIEND" : "ENEMY";
  return tempFriend ? "NEUTRAL" : "GREAT_ENEMY"; // natural enemy
}

export type DignityInSign = "OWN_EXALT" | "FRIEND" | "NEUTRAL" | "ENEMY" | "DEBILITATED";

/** Dignity of `planet` in a given sign (certified own/exalt/debil tables + natural friendship). */
export function dignityInSign(planet: TajikaGraha, signIndex: number): DignityInSign {
  const sign = zodiacSignOrder[signIndex]!;
  const own = ownSignsByBody[planet as PlanetaryBody];
  if ((own && own.includes(sign)) || exaltationSignsByBody[planet as PlanetaryBody] === sign) return "OWN_EXALT";
  if (debilitationSignsByBody[planet as PlanetaryBody] === sign) return "DEBILITATED";
  const lord = signRulerMap[sign] as TajikaGraha;
  const nat = naturalFriendship(planet, lord);
  return nat === "friend" ? "FRIEND" : nat === "enemy" ? "ENEMY" : "NEUTRAL";
}
