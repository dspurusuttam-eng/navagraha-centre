import {
  classicalPlanetaryBodies,
  planetaryBodies,
} from "@/modules/astrology/constants";
import type { ClassicalPlanetaryBody, PlanetaryBody } from "@/modules/astrology/types";

export type PlanetKey = PlanetaryBody;
export type ClassicalPlanetKey = ClassicalPlanetaryBody;

export const planetKeys = [...planetaryBodies] as readonly PlanetKey[];
export const classicalPlanetKeys = [
  ...classicalPlanetaryBodies,
] as readonly ClassicalPlanetKey[];
export const outerPlanetKeys = [
  "URANUS",
  "NEPTUNE",
  "PLUTO",
] as const satisfies readonly Exclude<PlanetKey, ClassicalPlanetKey>[];

export type PlanetCapability = {
  display: true;
  transit: boolean;
  predictive: boolean;
  classicalDasha: boolean;
};

export const planetCapabilityMap: Record<PlanetKey, PlanetCapability> = {
  SUN: { display: true, transit: true, predictive: true, classicalDasha: true },
  MOON: { display: true, transit: true, predictive: true, classicalDasha: true },
  MARS: { display: true, transit: true, predictive: true, classicalDasha: true },
  MERCURY: { display: true, transit: true, predictive: true, classicalDasha: true },
  JUPITER: { display: true, transit: true, predictive: true, classicalDasha: true },
  VENUS: { display: true, transit: true, predictive: true, classicalDasha: true },
  SATURN: { display: true, transit: true, predictive: true, classicalDasha: true },
  RAHU: { display: true, transit: true, predictive: true, classicalDasha: true },
  KETU: { display: true, transit: true, predictive: true, classicalDasha: true },
  URANUS: { display: true, transit: true, predictive: true, classicalDasha: false },
  NEPTUNE: { display: true, transit: true, predictive: true, classicalDasha: false },
  PLUTO: { display: true, transit: true, predictive: true, classicalDasha: false },
};

export function isPlanetKey(value: string): value is PlanetKey {
  return (planetKeys as readonly string[]).includes(value);
}

export function isClassicalPlanetKey(value: string): value is ClassicalPlanetKey {
  return (classicalPlanetKeys as readonly string[]).includes(value);
}

export function isOuterPlanetKey(value: string): value is (typeof outerPlanetKeys)[number] {
  return (outerPlanetKeys as readonly string[]).includes(value);
}
