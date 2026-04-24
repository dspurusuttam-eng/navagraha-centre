import {
  calculateSiderealTransitSnapshot,
  type TransitGrahaPosition,
} from "@/lib/astrology/transit-engine";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";

type TransitContextFailureCode =
  | "INVALID_CHART_CONTEXT"
  | "UNVERIFIED_CHART_CONTEXT"
  | "INVALID_HOUSE_MAP"
  | "TRANSIT_CALCULATION_FAILED";

type TransitSystemMode = {
  zodiac: "sidereal";
  ayanamsha: "LAHIRI";
};

export type TransitContextGraha = {
  planet: string;
  longitude: number;
  sign: string;
  degree_in_sign: number;
  nakshatra: string;
  pada: number;
  house_from_lagna: number;
  is_retrograde: boolean;
};

export type TransitContextOutput = {
  as_of: string;
  system: TransitSystemMode;
  transits: TransitContextGraha[];
  transit_summary: {
    key_active_houses: number[];
    transit_chain_timestamp: string;
    next_refresh_hint: "PT6H";
  };
};

export type TransitContextFailure = {
  success: false;
  error: {
    code: TransitContextFailureCode;
    message: string;
  };
  details?: unknown;
};

export type TransitContextSuccess = {
  success: true;
  data: TransitContextOutput;
};

export type TransitContextResult = TransitContextFailure | TransitContextSuccess;

function fail(
  code: TransitContextFailureCode,
  message: string,
  details?: unknown
): TransitContextFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
    details,
  };
}

function getHouseBySignMap(chart: UnifiedSiderealChart): Map<string, number> | null {
  if (!Array.isArray(chart.houses) || chart.houses.length !== 12) {
    return null;
  }

  const map = new Map<string, number>();

  for (const house of chart.houses) {
    if (
      !house ||
      typeof house.sign !== "string" ||
      !Number.isInteger(house.house) ||
      house.house < 1 ||
      house.house > 12
    ) {
      return null;
    }

    map.set(house.sign, house.house);
  }

  return map.size === 12 ? map : null;
}

function mapTransitsToHouses(input: {
  transits: TransitGrahaPosition[];
  houseBySignMap: Map<string, number>;
}): TransitContextGraha[] | null {
  const mapped = input.transits.map((transit) => {
    const houseFromLagna = input.houseBySignMap.get(transit.sign);

    if (!houseFromLagna) {
      return null;
    }

    return {
      planet: transit.planet,
      longitude: transit.longitude,
      sign: transit.sign,
      degree_in_sign: transit.degree_in_sign,
      nakshatra: transit.nakshatra,
      pada: transit.pada,
      house_from_lagna: houseFromLagna,
      is_retrograde: transit.is_retrograde,
    };
  });

  return mapped.some((entry) => entry === null)
    ? null
    : mapped.filter(
        (entry): entry is NonNullable<typeof entry> => entry !== null
      );
}

function buildTransitSummary(input: {
  asOfUtc: string;
  transits: TransitContextGraha[];
}) {
  const keyActiveHouses = Array.from(
    new Set(input.transits.map((transit) => transit.house_from_lagna))
  ).sort((left, right) => left - right);

  return {
    key_active_houses: keyActiveHouses,
    transit_chain_timestamp: input.asOfUtc,
    next_refresh_hint: "PT6H" as const,
  };
}

export function getTransitContextForChart(input: {
  chart: UnifiedSiderealChart | null | undefined;
  asOfDateUtc?: Date | string;
}): TransitContextResult {
  if (!input.chart) {
    return fail(
      "INVALID_CHART_CONTEXT",
      "Chart context is required for transit context integration."
    );
  }

  if (!input.chart.verification?.is_verified_for_chart_logic) {
    return fail(
      "UNVERIFIED_CHART_CONTEXT",
      "Transit context requires a verified chart context."
    );
  }

  const houseBySignMap = getHouseBySignMap(input.chart);

  if (!houseBySignMap) {
    return fail(
      "INVALID_HOUSE_MAP",
      "Chart houses are incomplete or invalid for transit house overlay."
    );
  }

  const transitSnapshot = calculateSiderealTransitSnapshot({
    asOfUtc: input.asOfDateUtc,
  });

  if (!transitSnapshot.success) {
    return fail(
      "TRANSIT_CALCULATION_FAILED",
      transitSnapshot.issue.message,
      transitSnapshot.issue
    );
  }

  const mappedTransits = mapTransitsToHouses({
    transits: transitSnapshot.data.transits,
    houseBySignMap,
  });

  if (!mappedTransits) {
    return fail(
      "INVALID_HOUSE_MAP",
      "One or more transit signs could not be mapped to houses from Lagna."
    );
  }

  return {
    success: true,
    data: {
      as_of: transitSnapshot.data.as_of_utc,
      system: {
        zodiac: transitSnapshot.data.system.zodiac,
        ayanamsha: transitSnapshot.data.system.ayanamsha,
      },
      transits: mappedTransits,
      transit_summary: buildTransitSummary({
        asOfUtc: transitSnapshot.data.as_of_utc,
        transits: mappedTransits,
      }),
    },
  };
}
