import "server-only";

import { planetLabelMap, planetSortOrder } from "@/lib/astrology/constants";
import type {
  AstrologicalAspect,
  PlanetPosition,
  PlanetaryBody,
  VedicAspect,
} from "@/modules/astrology/types";

const geometricAspectCatalog = [
  { type: "CONJUNCTION", angle: 0, maxOrb: 8 },
  { type: "SEXTILE", angle: 60, maxOrb: 4 },
  { type: "SQUARE", angle: 90, maxOrb: 6 },
  { type: "TRINE", angle: 120, maxOrb: 6 },
  { type: "OPPOSITION", angle: 180, maxOrb: 8 },
] as const satisfies ReadonlyArray<{
  type: AstrologicalAspect["type"];
  angle: number;
  maxOrb: number;
}>;

const vedicAspectOffsets: Record<
  PlanetaryBody,
  ReadonlyArray<VedicAspect["relation"]>
> = {
  SUN: ["SEVENTH"],
  MOON: ["SEVENTH"],
  MARS: ["MARS_FOURTH", "SEVENTH", "MARS_EIGHTH"],
  MERCURY: ["SEVENTH"],
  JUPITER: ["JUPITER_FIFTH", "SEVENTH", "JUPITER_NINTH"],
  VENUS: ["SEVENTH"],
  SATURN: ["SATURN_THIRD", "SEVENTH", "SATURN_TENTH"],
  RAHU: [],
  KETU: [],
};

const relationHouseOffsetMap: Record<VedicAspect["relation"], number> = {
  SEVENTH: 7,
  MARS_FOURTH: 4,
  MARS_EIGHTH: 8,
  JUPITER_FIFTH: 5,
  JUPITER_NINTH: 9,
  SATURN_THIRD: 3,
  SATURN_TENTH: 10,
};

function normalizeSeparation(value: number) {
  const normalized = ((value % 360) + 360) % 360;

  return normalized > 180 ? 360 - normalized : normalized;
}

function formatBody(body: PlanetaryBody) {
  return planetLabelMap[body];
}

function getHouseOffset(source: PlanetPosition, target: PlanetPosition) {
  return ((target.house - source.house + 12) % 12) + 1;
}

function getPlanetPriority(body: PlanetaryBody) {
  return planetSortOrder.get(body) ?? Number.MAX_SAFE_INTEGER;
}

export function calculateMajorAspects(
  planets: readonly PlanetPosition[]
): AstrologicalAspect[] {
  const aspects: AstrologicalAspect[] = [];

  for (let leftIndex = 0; leftIndex < planets.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < planets.length;
      rightIndex += 1
    ) {
      const source = planets[leftIndex];
      const target = planets[rightIndex];
      const separation = normalizeSeparation(
        target.longitude - source.longitude
      );

      for (const entry of geometricAspectCatalog) {
        const orb = Number(Math.abs(separation - entry.angle).toFixed(2));

        if (orb > entry.maxOrb) {
          continue;
        }

        aspects.push({
          type: entry.type,
          source: source.body,
          target: target.body,
          orb,
          applying: false,
          exact: orb <= 1,
        });
        break;
      }
    }
  }

  return aspects.sort((left, right) => {
    if (left.orb !== right.orb) {
      return left.orb - right.orb;
    }

    return (
      getPlanetPriority(left.source as PlanetaryBody) -
      getPlanetPriority(right.source as PlanetaryBody)
    );
  });
}

export function calculateVedicAspects(
  planets: readonly PlanetPosition[]
): VedicAspect[] {
  const aspects: VedicAspect[] = [];

  for (const source of planets) {
    const relations = vedicAspectOffsets[source.body];

    if (!relations.length) {
      continue;
    }

    for (const target of planets) {
      if (source.body === target.body) {
        continue;
      }

      const houseOffset = getHouseOffset(source, target);

      for (const relation of relations) {
        const expectedOffset = relationHouseOffsetMap[relation];

        if (houseOffset !== expectedOffset) {
          continue;
        }

        const expectedLongitude = (source.longitude + (expectedOffset - 1) * 30) % 360;
        const orb = Number(
          normalizeSeparation(target.longitude - expectedLongitude).toFixed(2)
        );

        aspects.push({
          source: source.body,
          target: target.body,
          relation,
          houseOffset,
          orb,
          exact: orb <= 3,
          rationale: `${formatBody(source.body)} casts a ${
            relation === "SEVENTH"
              ? "full seventh-house"
              : relation === "MARS_FOURTH"
                ? "special fourth-house"
                : relation === "MARS_EIGHTH"
                  ? "special eighth-house"
                  : relation === "JUPITER_FIFTH"
                    ? "special fifth-house"
                    : relation === "JUPITER_NINTH"
                      ? "special ninth-house"
                      : relation === "SATURN_THIRD"
                        ? "special third-house"
                        : "special tenth-house"
          } aspect to ${formatBody(target.body)}.`,
        });
      }
    }
  }

  return aspects.sort((left, right) => {
    if (left.orb !== right.orb) {
      return left.orb - right.orb;
    }

    return (
      getPlanetPriority(left.source) - getPlanetPriority(right.source as PlanetaryBody)
    );
  });
}
