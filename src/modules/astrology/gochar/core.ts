// Card 6 — Gochar (transit) + Sade Sati core.
//
// Pure, deterministic, geocentric-sidereal math. No ephemeris access, no
// location input, no randomness, no interpretation. Every function here is a
// total function of its arguments so the whole layer is unit-testable without
// Swiss Ephemeris.
//
// Ayanamsa/node model are inherited from the natal engine (LAHIRI sidereal,
// SE_TRUE_NODE with Ketu = Rahu + 180). Nodes are treated as always retrograde
// and are excluded from speed-based retrograde tests, because the *true* node's
// longitudinal speed can transiently turn positive.

export const GOCHAR_GRAHAS = [
  "SUN",
  "MOON",
  "MARS",
  "MERCURY",
  "JUPITER",
  "VENUS",
  "SATURN",
  "RAHU",
  "KETU",
] as const;

export type GocharGraha = (typeof GOCHAR_GRAHAS)[number];

export const NODE_GRAHAS: readonly GocharGraha[] = ["RAHU", "KETU"];

export type TransitResultFlag = "benefic" | "non_benefic";

export type SadeSatiPhase = "rising" | "peak" | "setting";

export type SaturnAffliction = "none" | "kantaka_4th" | "ashtama_8th";

export type HouseNumber1To12 =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type RashiIndex0To11 =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// --- Benefic transit table (from Moon) ---------------------------------------
// Rahu/Ketu follow the 3/6/11 convention (PO-approved default). The table is a
// module constant so the convention can be swapped without touching call sites.

export const BENEFIC_HOUSES_FROM_MOON: Record<
  GocharGraha,
  readonly HouseNumber1To12[]
> = {
  SUN: [3, 6, 10, 11],
  MOON: [1, 3, 6, 7, 10, 11],
  MARS: [3, 6, 11],
  MERCURY: [2, 4, 6, 8, 10, 11],
  JUPITER: [2, 5, 7, 9, 11],
  VENUS: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  SATURN: [3, 6, 11],
  RAHU: [3, 6, 11],
  KETU: [3, 6, 11],
};

export const SADE_SATI_HOUSES_FROM_MOON: readonly HouseNumber1To12[] = [12, 1, 2];

const SADE_SATI_PHASE_BY_HOUSE: Record<number, SadeSatiPhase> = {
  12: "rising",
  1: "peak",
  2: "setting",
};

// --- Longitude / rashi / house helpers ---------------------------------------

export function normalizeLongitude(longitude: number): number {
  const normalized = longitude % 360;

  return normalized < 0 ? normalized + 360 : normalized;
}

export function rashiIndex(longitude: number): RashiIndex0To11 {
  return Math.floor(normalizeLongitude(longitude) / 30) as RashiIndex0To11;
}

/** House of `subjectRashi` counted from `referenceRashi`, 1..12 inclusive. */
export function houseFromReference(
  subjectRashi: number,
  referenceRashi: number
): HouseNumber1To12 {
  return ((((subjectRashi - referenceRashi) % 12) + 12) % 12 + 1) as HouseNumber1To12;
}

export function houseFromMoon(
  planetLongitude: number,
  natalMoonLongitude: number
): HouseNumber1To12 {
  return houseFromReference(
    rashiIndex(planetLongitude),
    rashiIndex(natalMoonLongitude)
  );
}

export function houseFromLagna(
  planetLongitude: number,
  natalLagnaLongitude: number
): HouseNumber1To12 {
  return houseFromReference(
    rashiIndex(planetLongitude),
    rashiIndex(natalLagnaLongitude)
  );
}

export function isNodeGraha(graha: GocharGraha): boolean {
  return NODE_GRAHAS.includes(graha);
}

/**
 * Retrograde determination.
 * Nodes are always retrograde by model and never consult `longitudeSpeed`
 * (the true node's speed can transiently be positive).
 */
export function isRetrograde(graha: GocharGraha, longitudeSpeed: number): boolean {
  if (isNodeGraha(graha)) {
    return true;
  }

  return longitudeSpeed < 0;
}

// --- Gochar benefic flag --------------------------------------------------------

export function transitResultFlag(
  graha: GocharGraha,
  houseFromMoonValue: HouseNumber1To12
): TransitResultFlag {
  return BENEFIC_HOUSES_FROM_MOON[graha].includes(houseFromMoonValue)
    ? "benefic"
    : "non_benefic";
}

// --- Sade Sati + Saturn afflictions ---------------------------------------------

export function isSadeSatiActive(saturnHouseFromMoon: HouseNumber1To12): boolean {
  return SADE_SATI_HOUSES_FROM_MOON.includes(saturnHouseFromMoon);
}

export function sadeSatiPhase(
  saturnHouseFromMoon: HouseNumber1To12
): SadeSatiPhase | null {
  return SADE_SATI_PHASE_BY_HOUSE[saturnHouseFromMoon] ?? null;
}

/**
 * Kantaka/Shani-ashtama afflictions, independent of Sade Sati.
 * 4th from Moon -> kantaka_4th; 8th from Moon -> ashtama_8th; else none.
 */
export function saturnAffliction(
  saturnHouseFromMoon: HouseNumber1To12
): SaturnAffliction {
  if (saturnHouseFromMoon === 4) {
    return "kantaka_4th";
  }

  if (saturnHouseFromMoon === 8) {
    return "ashtama_8th";
  }

  return "none";
}

// --- Vedha (deferred, Card 6 V1) ---------------------------------------------------
// The Vedha pair table is intentionally NOT defined here. Enabling the flag must
// fail loudly rather than fall back to guessed pairs.

export const VEDHA_TABLE_NOT_CONFIGURED = "VEDHA_TABLE_NOT_CONFIGURED" as const;

export type VedhaStatus =
  | { enabled: false; status: "disabled"; pairs: null }
  | {
      enabled: true;
      status: "unavailable";
      code: typeof VEDHA_TABLE_NOT_CONFIGURED;
      message: string;
      pairs: null;
    };

export function resolveVedhaStatus(enableVedha: boolean): VedhaStatus {
  if (!enableVedha) {
    return { enabled: false, status: "disabled", pairs: null };
  }

  return {
    enabled: true,
    status: "unavailable",
    code: VEDHA_TABLE_NOT_CONFIGURED,
    message:
      "Vedha obstruction pairs are not configured in this version. Vedha is deferred to a future card; no pair table is assumed.",
    pairs: null,
  };
}
