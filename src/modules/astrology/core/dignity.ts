import {
  debilitationSignsByBody,
  exaltationSignsByBody,
  ownSignsByBody,
} from "@/lib/astrology/constants";
import type {
  AstrologyDignitySnapshot,
  AstrologyDignityStatus,
} from "@/modules/astrology/core/types";
import type { PlanetPosition } from "@/modules/astrology/types";

const classicalBodies = new Set(Object.keys(ownSignsByBody));

export function getPlanetDignityStatus(planet: PlanetPosition): AstrologyDignitySnapshot {
  const ownSigns = ownSignsByBody[planet.body];

  if (ownSigns?.includes(planet.sign)) {
    return {
      body: planet.body,
      sign: planet.sign,
      status: "OWN_SIGN",
      source: "standard",
    };
  }

  if (exaltationSignsByBody[planet.body] === planet.sign) {
    return {
      body: planet.body,
      sign: planet.sign,
      status: "EXALTED",
      source: "standard",
    };
  }

  if (debilitationSignsByBody[planet.body] === planet.sign) {
    return {
      body: planet.body,
      sign: planet.sign,
      status: "DEBILITATED",
      source: "standard",
    };
  }

  const status: AstrologyDignityStatus = classicalBodies.has(planet.body)
    ? "NEUTRAL"
    : "NEUTRAL";

  return {
    body: planet.body,
    sign: planet.sign,
    status,
    source: classicalBodies.has(planet.body) ? "standard" : "outer-planet-default",
  };
}
