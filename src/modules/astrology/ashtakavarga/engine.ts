// Card 7 — Ashtakavarga engine (chart-context wrapper).
//
// Pure derived / on-demand over the existing natal D1 chart. No ephemeris,
// no persistence, no migration, no interpretation. Engine-only V1: not wired
// to any HTTP route or Card 6; ships live-but-unconsumed by design.

import {
  ASHTAKAVARGA_PLANETS,
  BAV_CHECKSUMS,
  SAV_CHECKSUM,
  computeBhinnashtakavarga,
  computeSarvashtakavarga,
  houseFromLagnaSign,
  rashiIndexFromLongitude,
  type AshtakavargaPlanet,
  type AshtakavargaReference,
  type BhinnashtakavargaResult,
} from "@/modules/astrology/ashtakavarga/core";

export const ASHTAKAVARGA_AYANAMSA = "LAHIRI" as const;

type ChartPlanetRow = {
  name: string;
  longitude?: number;
  sign?: string;
};

export type AshtakavargaChartContext = {
  birth_context?: { birth_utc?: string };
  lagna?: { longitude?: number; sign?: string };
  planets?: ChartPlanetRow[];
  verification?: { is_verified_for_chart_logic?: boolean };
};

export type AshtakavargaFailureCode =
  | "INVALID_CHART_CONTEXT"
  | "UNVERIFIED_CHART_CONTEXT"
  | "MISSING_LAGNA_SIGN"
  | "MISSING_PLANET_SIGN";

export type AshtakavargaBavEntry = {
  planet: AshtakavargaPlanet;
  signBindus: number[];
  total: number;
  prastara: number[][]; // 8x12 of {0,1}, rows in referenceOrder
  referenceOrder: readonly AshtakavargaReference[];
};

export type AshtakavargaSnapshot = {
  system: "ASHTAKAVARGA";
  status: "complete";
  reduction: "none";
  ayanamsa: typeof ASHTAKAVARGA_AYANAMSA;
  referenceChartUtc: string | null;
  lagnaSign: number;
  referenceSigns: Record<AshtakavargaReference, number>;
  bav: AshtakavargaBavEntry[];
  sav: {
    signBindus: number[];
    total: number;
    byHouse: Array<{ house: number; sign: number; bindus: number }>;
  };
  totals: {
    savTotal: number;
    perPlanet: Record<AshtakavargaPlanet, number>;
  };
  /** Stable additive slot mirroring Card 6's reserved sarvaBindu field. */
  sarvaBindu: {
    signBindus: number[];
    total: number;
  };
  flags: {
    complete: boolean;
    nodesIncluded: false;
    lagnaAsReference: true;
    reductionsApplied: false;
    checksumsVerified: boolean;
  };
  warnings: string[];
};

export type AshtakavargaResult =
  | { success: true; data: AshtakavargaSnapshot }
  | {
      success: false;
      error: { code: AshtakavargaFailureCode; message: string };
    };

function fail(
  code: AshtakavargaFailureCode,
  message: string
): { success: false; error: { code: AshtakavargaFailureCode; message: string } } {
  return { success: false, error: { code, message } };
}

function resolveSign(row: {
  longitude?: number;
  sign?: string;
}): number | null {
  if (typeof row.longitude === "number" && Number.isFinite(row.longitude)) {
    return rashiIndexFromLongitude(row.longitude);
  }

  return null;
}

/**
 * Build the full Ashtakavarga snapshot from a verified natal chart context.
 * Uses D1 sign positions only. Honest failure (never fabricated) when a
 * required planet or the Lagna sign is missing.
 */
export function buildAshtakavargaSnapshot(input: {
  chart: AshtakavargaChartContext | null | undefined;
}): AshtakavargaResult {
  const chart = input.chart;

  if (!chart || !Array.isArray(chart.planets) || !chart.lagna) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is missing required lagna or planets data."
    );
  }

  if (!chart.verification?.is_verified_for_chart_logic) {
    return fail(
      "UNVERIFIED_CHART_CONTEXT",
      "Chart context must be verified before Ashtakavarga can be calculated."
    );
  }

  const lagnaSign = resolveSign(chart.lagna);

  if (lagnaSign === null) {
    return fail(
      "MISSING_LAGNA_SIGN",
      "Verified chart context does not contain a usable Lagna longitude."
    );
  }

  const planetSignByName = new Map<string, number>();

  for (const planet of chart.planets) {
    if (typeof planet.name !== "string") {
      continue;
    }

    const sign = resolveSign(planet);

    if (sign !== null) {
      planetSignByName.set(planet.name.trim().toUpperCase(), sign);
    }
  }

  const referenceSigns = {} as Record<AshtakavargaReference, number>;
  referenceSigns.LAGNA = lagnaSign;

  for (const planet of ASHTAKAVARGA_PLANETS) {
    const sign = planetSignByName.get(planet);

    if (sign === undefined) {
      return fail(
        "MISSING_PLANET_SIGN",
        `Verified chart context does not contain a usable ${planet} longitude for Ashtakavarga.`
      );
    }

    referenceSigns[planet] = sign;
  }

  const bavResults: BhinnashtakavargaResult[] = ASHTAKAVARGA_PLANETS.map(
    (planet) => computeBhinnashtakavarga(planet, referenceSigns)
  );
  const sav = computeSarvashtakavarga(bavResults);

  const perPlanet = {} as Record<AshtakavargaPlanet, number>;
  let checksumsVerified = true;

  for (const bav of bavResults) {
    perPlanet[bav.planet] = bav.total;
    if (bav.total !== BAV_CHECKSUMS[bav.planet]) {
      checksumsVerified = false;
    }
  }

  if (sav.total !== SAV_CHECKSUM) {
    checksumsVerified = false;
  }

  const byHouse = sav.signBindus
    .map((bindus, sign) => ({
      house: houseFromLagnaSign(sign, lagnaSign),
      sign,
      bindus,
    }))
    .sort((left, right) => left.house - right.house);

  return {
    success: true,
    data: {
      system: "ASHTAKAVARGA",
      status: "complete",
      reduction: "none",
      ayanamsa: ASHTAKAVARGA_AYANAMSA,
      referenceChartUtc: chart.birth_context?.birth_utc ?? null,
      lagnaSign,
      referenceSigns,
      bav: bavResults.map((bav) => ({
        planet: bav.planet,
        signBindus: bav.signBindus,
        total: bav.total,
        prastara: bav.prastara.map((row) => row.contributions),
        referenceOrder: bav.referenceOrder,
      })),
      sav: {
        signBindus: sav.signBindus,
        total: sav.total,
        byHouse,
      },
      totals: {
        savTotal: sav.total,
        perPlanet,
      },
      sarvaBindu: {
        signBindus: sav.signBindus,
        total: sav.total,
      },
      flags: {
        complete: true,
        nodesIncluded: false,
        lagnaAsReference: true,
        reductionsApplied: false,
        checksumsVerified,
      },
      warnings: [],
    },
  };
}
