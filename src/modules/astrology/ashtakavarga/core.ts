// Card 7 — Ashtakavarga core (BPHS / Parashari standard).
//
// Pure, deterministic integer math. No ephemeris, no persistence, no
// interpretation. Bindu (benefic-point) scoring over the natal D1 sign
// positions the chart engine already computes.
//
// The benefic-house tables below are the classical BPHS/Parashari
// Ashtakavarga tables. Every per-planet total is a fixed classical constant
// (see CHECKSUMS); a single mis-transcribed cell shifts a total off its
// constant and fails QA. The tables are the ONLY classical dependency and are
// intentionally the one thing pinned hardest.

export const ASHTAKAVARGA_PLANETS = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
] as const;

export type AshtakavargaPlanet = (typeof ASHTAKAVARGA_PLANETS)[number];

// Reference (contributor) points, in fixed order. Lagna is a reference point
// but is never itself a scored BAV subject in V1.
export const ASHTAKAVARGA_REFERENCES = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
  "LAGNA",
] as const;

export type AshtakavargaReference = (typeof ASHTAKAVARGA_REFERENCES)[number];

export const SIGNS_IN_ZODIAC = 12;

/**
 * Benefic houses (1..12), counted from each reference point, that contribute a
 * bindu to the subject planet's Bhinnashtakavarga. BPHS/Parashari standard.
 */
export const BENEFIC_HOUSES: Record<
  AshtakavargaPlanet,
  Record<AshtakavargaReference, readonly number[]>
> = {
  SUN: {
    SUN: [1, 2, 4, 7, 8, 9, 10, 11],
    MOON: [3, 6, 10, 11],
    MARS: [1, 2, 4, 7, 8, 9, 10, 11],
    MERCURY: [3, 5, 6, 9, 10, 11, 12],
    JUPITER: [5, 6, 9, 11],
    VENUS: [6, 7, 12],
    SATURN: [1, 2, 4, 7, 8, 9, 10, 11],
    LAGNA: [3, 4, 6, 10, 11, 12],
  },
  MOON: {
    SUN: [3, 6, 7, 8, 10, 11],
    MOON: [1, 3, 6, 7, 10, 11],
    MARS: [2, 3, 5, 6, 9, 10, 11],
    MERCURY: [1, 3, 4, 5, 7, 8, 10, 11],
    JUPITER: [1, 4, 7, 8, 10, 11, 12],
    VENUS: [3, 4, 5, 7, 9, 10, 11],
    SATURN: [3, 5, 6, 11],
    LAGNA: [3, 6, 10, 11],
  },
  MARS: {
    SUN: [3, 5, 6, 10, 11],
    MOON: [3, 6, 11],
    MARS: [1, 2, 4, 7, 8, 10, 11],
    MERCURY: [3, 5, 6, 11],
    JUPITER: [6, 10, 11, 12],
    VENUS: [6, 8, 11, 12],
    SATURN: [1, 4, 7, 8, 9, 10, 11],
    LAGNA: [1, 3, 6, 10, 11],
  },
  MERCURY: {
    SUN: [5, 6, 9, 11, 12],
    MOON: [2, 4, 6, 8, 10, 11],
    MARS: [1, 2, 4, 7, 8, 9, 10, 11],
    MERCURY: [1, 3, 5, 6, 9, 10, 11, 12],
    JUPITER: [6, 8, 11, 12],
    VENUS: [1, 2, 3, 4, 5, 8, 9, 11],
    SATURN: [1, 2, 4, 7, 8, 9, 10, 11],
    LAGNA: [1, 2, 4, 6, 8, 10, 11],
  },
  JUPITER: {
    SUN: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    MOON: [2, 5, 7, 9, 11],
    MARS: [1, 2, 4, 7, 8, 10, 11],
    MERCURY: [1, 2, 4, 5, 6, 9, 10, 11],
    JUPITER: [1, 2, 3, 4, 7, 8, 10, 11],
    VENUS: [2, 5, 6, 9, 10, 11],
    SATURN: [3, 5, 6, 12],
    LAGNA: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  VENUS: {
    SUN: [8, 11, 12],
    MOON: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    MARS: [3, 5, 6, 9, 11, 12],
    MERCURY: [3, 5, 6, 9, 11],
    JUPITER: [5, 8, 9, 10, 11],
    VENUS: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    SATURN: [3, 4, 5, 8, 9, 10, 11],
    LAGNA: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  SATURN: {
    SUN: [1, 2, 4, 7, 8, 10, 11],
    MOON: [3, 6, 11],
    MARS: [3, 5, 6, 10, 11, 12],
    MERCURY: [6, 8, 9, 10, 11, 12],
    JUPITER: [5, 6, 11, 12],
    VENUS: [6, 11, 12],
    SATURN: [3, 5, 6, 11],
    LAGNA: [1, 3, 4, 6, 10, 11],
  },
};

/** Fixed classical per-planet BAV totals; SAV total = 337. */
export const BAV_CHECKSUMS: Record<AshtakavargaPlanet, number> = {
  SUN: 48,
  MOON: 49,
  MARS: 39,
  MERCURY: 54,
  JUPITER: 56,
  VENUS: 52,
  SATURN: 39,
};

export const SAV_CHECKSUM = 337;

export function normalizeSignIndex(signIndex: number): number {
  return ((signIndex % SIGNS_IN_ZODIAC) + SIGNS_IN_ZODIAC) % SIGNS_IN_ZODIAC;
}

export function rashiIndexFromLongitude(longitude: number): number {
  const normalized = ((longitude % 360) + 360) % 360;

  return Math.floor(normalized / 30);
}

/** Target sign index when counting `house` (1..12) from a reference sign. */
export function signFromHouse(referenceSign: number, house: number): number {
  return normalizeSignIndex(referenceSign + (house - 1));
}

export type PrastaraRow = {
  reference: AshtakavargaReference;
  /** length 12, {0,1}: 1 where the reference contributes a bindu to a sign. */
  contributions: number[];
};

export type BhinnashtakavargaResult = {
  planet: AshtakavargaPlanet;
  signBindus: number[]; // length 12, each 0..8
  total: number; // must equal BAV_CHECKSUMS[planet]
  prastara: PrastaraRow[]; // 8 rows in ASHTAKAVARGA_REFERENCES order
  referenceOrder: readonly AshtakavargaReference[];
};

/**
 * Compute a single planet's Bhinnashtakavarga from the 8 reference sign
 * positions. `referenceSigns` must provide a 0..11 sign for every reference
 * point (7 planets + LAGNA).
 */
export function computeBhinnashtakavarga(
  planet: AshtakavargaPlanet,
  referenceSigns: Record<AshtakavargaReference, number>
): BhinnashtakavargaResult {
  const signBindus = new Array<number>(SIGNS_IN_ZODIAC).fill(0);
  const prastara: PrastaraRow[] = [];

  for (const reference of ASHTAKAVARGA_REFERENCES) {
    const referenceSign = normalizeSignIndex(referenceSigns[reference]);
    const beneficHouses = BENEFIC_HOUSES[planet][reference];
    const contributions = new Array<number>(SIGNS_IN_ZODIAC).fill(0);

    for (const house of beneficHouses) {
      const targetSign = signFromHouse(referenceSign, house);
      contributions[targetSign] += 1;
      signBindus[targetSign] += 1;
    }

    prastara.push({ reference, contributions });
  }

  const total = signBindus.reduce((sum, value) => sum + value, 0);

  return {
    planet,
    signBindus,
    total,
    prastara,
    referenceOrder: ASHTAKAVARGA_REFERENCES,
  };
}

export type SarvashtakavargaResult = {
  signBindus: number[]; // length 12, each 0..56
  total: number; // must equal SAV_CHECKSUM (337)
};

export function computeSarvashtakavarga(
  bavs: readonly BhinnashtakavargaResult[]
): SarvashtakavargaResult {
  const signBindus = new Array<number>(SIGNS_IN_ZODIAC).fill(0);

  for (const bav of bavs) {
    for (let sign = 0; sign < SIGNS_IN_ZODIAC; sign += 1) {
      signBindus[sign] += bav.signBindus[sign];
    }
  }

  return {
    signBindus,
    total: signBindus.reduce((sum, value) => sum + value, 0),
  };
}

/** House (1..12) of a sign counted from the Lagna sign. */
export function houseFromLagnaSign(signIndex: number, lagnaSign: number): number {
  return normalizeSignIndex(signIndex - lagnaSign) + 1;
}
