import { planetLabelMap, zodiacSignLabelMap } from "@/lib/astrology/constants";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  createAstrologyInfrastructureSnapshot,
  type AstrologyInfrastructureSnapshot,
} from "@/modules/astrology/core";
import type { PlanetKey } from "@/modules/astrology/core/registry";
import {
  buildTransitGocharFoundation,
  type TransitGocharComparisonReadiness,
  type TransitGocharFoundationSnapshot,
  type TransitGocharPlanetEntry,
} from "@/modules/astrology/transit/foundation";

type TransitLocationInput = {
  city: string;
  region?: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
};

type TransitPersonalizedInput = {
  transitDateUtc?: Date | string;
  transitDateLocal?: string;
  transitTimeLocal?: string;
  timezone?: string;
  location?: TransitLocationInput | null;
  natalChart?: UnifiedSiderealChart | null | undefined;
};

type TransitMajorPlanetKey = Extract<PlanetKey, "SATURN" | "JUPITER" | "RAHU" | "KETU">;

const houseFocusMap: Record<number, string> = {
  1: "identity and vitality",
  2: "resources and values",
  3: "effort and communication",
  4: "home and foundations",
  5: "creativity and learning",
  6: "routine and service",
  7: "relationships and agreements",
  8: "shared change and transformation",
  9: "guidance and long-range study",
  10: "career and public role",
  11: "networks and gains",
  12: "rest and release",
};

const majorPlanetFocusMap: Record<TransitMajorPlanetKey, string[]> = {
  SATURN: ["discipline and structure", "steady responsibility"],
  JUPITER: ["guidance and expansion", "learning and opportunity"],
  RAHU: ["novelty and experimentation", "boundary awareness"],
  KETU: ["simplification and release", "inward clarity"],
};

const planetLabelToKey = new Map(
  Object.entries(planetLabelMap).map(([key, value]) => [value.toLowerCase(), key as PlanetKey])
);

function formatPlanet(value: string) {
  const normalized = value.trim().toUpperCase();

  return planetLabelMap[normalized as keyof typeof planetLabelMap] ?? value;
}

function formatSign(value: string) {
  const normalized = value.trim().toUpperCase();

  return (
    zodiacSignLabelMap[normalized as keyof typeof zodiacSignLabelMap] ??
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  );
}

function toPlanetKey(value: string | null | undefined): PlanetKey | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  const upper = normalized.toUpperCase();

  if (upper in planetLabelMap) {
    return upper as PlanetKey;
  }

  return planetLabelToKey.get(normalized.toLowerCase()) ?? null;
}

function buildHouseBySignMap(chart: UnifiedSiderealChart): Map<string, number> | null {
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

function buildNatalPlanetMap(chart: UnifiedSiderealChart) {
  const map = new Map<PlanetKey, UnifiedSiderealChart["planets"][number]>();

  for (const planet of chart.planets) {
    const key = toPlanetKey(planet.name);

    if (key) {
      map.set(key, planet);
    }
  }

  return map;
}

function buildHouseImpact(house: number | null) {
  if (!house) {
    return "Natal house overlay is unavailable.";
  }

  return `Transit overlays natal house ${house}, emphasizing ${houseFocusMap[house] ?? `house ${house} themes`}.`;
}

function buildLifeAreaFocus(house: number | null, focus: string[]) {
  const areas = [...focus];

  if (house && houseFocusMap[house]) {
    areas.push(houseFocusMap[house]);
  }

  return Array.from(new Set(areas));
}

function buildTransitPlanetEntry(input: {
  transit: TransitGocharPlanetEntry;
  natalPlanetMap: Map<PlanetKey, UnifiedSiderealChart["planets"][number]> | null;
  natalHouseBySignMap: Map<string, number> | null;
}): TransitPersonalizedPlanetEntry {
  const natalPlanetKey = toPlanetKey(input.transit.planet);
  const natalPlanet = natalPlanetKey ? input.natalPlanetMap?.get(natalPlanetKey) ?? null : null;
  const natalHouse = natalPlanet?.house ?? null;
  const transitHouse = input.natalHouseBySignMap?.get(input.transit.sign) ?? null;

  return {
    ...input.transit,
    natalSign: natalPlanet?.sign ?? null,
    natalHouse,
    transitHouse,
    houseImpact: buildHouseImpact(transitHouse),
    lifeAreaFocus: buildLifeAreaFocus(transitHouse, []),
    comparisonSummary: natalPlanet
      ? `${input.transit.planetLabel} transits ${formatSign(input.transit.sign)} while the natal placement sits in ${formatSign(natalPlanet.sign)}${natalHouse ? `, house ${natalHouse}` : ""}.`
      : `${input.transit.planetLabel} transits ${formatSign(input.transit.sign)} with a general gochar focus.`,
  };
}

function buildMajorPlanetSummary(input: {
  planet: TransitMajorPlanetKey;
  transit: TransitPersonalizedPlanetEntry | null;
}): TransitMajorTransitSummary {
  const transit = input.transit;
  const planetLabel = formatPlanet(input.planet);
  const focus = majorPlanetFocusMap[input.planet];
  const lifeAreaFocus = buildLifeAreaFocus(transit?.transitHouse ?? null, focus);
  const houseImpact = transit?.transitHouse
    ? buildHouseImpact(transit.transitHouse)
    : "Natal house overlay is unavailable.";

  return {
    planet: input.planet,
    planetLabel,
    currentSign: transit?.sign ?? "UNAVAILABLE",
    transitHouse: transit?.transitHouse ?? null,
    natalSign: transit?.natalSign ?? null,
    natalHouse: transit?.natalHouse ?? null,
    houseImpact,
    lifeAreaFocus,
    summary: transit
      ? `${planetLabel} transit is available in ${formatSign(transit.sign)}${transit.transitHouse ? `, overlaying natal house ${transit.transitHouse}` : ""}.`
      : `${planetLabel} transit is unavailable.`,
  };
}

function buildRahuKetuSummary(input: {
  rahu: TransitMajorTransitSummary | null;
  ketu: TransitMajorTransitSummary | null;
}) {
  const summaryParts: string[] = [];

  if (input.rahu) {
    summaryParts.push(
      `Rahu highlights ${input.rahu.lifeAreaFocus[0] ?? "boundary awareness"} in ${input.rahu.currentSign}.`
    );
  }

  if (input.ketu) {
    summaryParts.push(
      `Ketu highlights ${input.ketu.lifeAreaFocus[0] ?? "simplification"} in ${input.ketu.currentSign}.`
    );
  }

  return {
    rahu: input.rahu,
    ketu: input.ketu,
    summary:
      summaryParts.join(" ") ||
      "Rahu/Ketu axis tracking is available, but the overlay summary is limited.",
  };
}

function buildTransitsSummary(input: {
  planets: TransitPersonalizedPlanetEntry[];
  natalOverlayAvailable: boolean;
}) {
  const majorLabels = ["Saturn", "Jupiter", "Rahu", "Ketu"];
  const base = `Transit comparison is available for ${input.planets.length} grahas.`;

  if (input.natalOverlayAvailable) {
    return `${base} Natal overlay is ready, with ${majorLabels.join(", ")} tracking available as the main timing markers.`;
  }

  return `${base} Natal overlay is unavailable, so this snapshot stays at general transit tracking.`;
}

export type TransitPersonalizedPlanetEntry = TransitGocharPlanetEntry & {
  natalSign: string | null;
  natalHouse: number | null;
  transitHouse: number | null;
  houseImpact: string;
  lifeAreaFocus: string[];
  comparisonSummary: string;
};

export type TransitMajorTransitSummary = {
  planet: TransitMajorPlanetKey;
  planetLabel: string;
  currentSign: string;
  transitHouse: number | null;
  natalSign: string | null;
  natalHouse: number | null;
  houseImpact: string;
  lifeAreaFocus: string[];
  summary: string;
};

export type TransitRahuKetuTransitSummary = {
  rahu: TransitMajorTransitSummary | null;
  ketu: TransitMajorTransitSummary | null;
  summary: string;
};

export type TransitPersonalizedComparisonReadiness = TransitGocharComparisonReadiness & {
  natalOverlayAvailable: boolean;
  majorPlanetTrackingReady: boolean;
  overlayNote: string;
};

export type TransitPersonalizedFoundationData = {
  transitDate: string;
  timezone: string | null;
  location: TransitLocationInput | null;
  planets: TransitPersonalizedPlanetEntry[];
  transitSummary: string;
  majorTransitHighlights: TransitMajorTransitSummary[];
  saturnTransit: TransitMajorTransitSummary | null;
  jupiterTransit: TransitMajorTransitSummary | null;
  rahuKetuTransit: TransitRahuKetuTransitSummary;
  natalOverlayAvailable: boolean;
  comparisonReadiness: TransitPersonalizedComparisonReadiness;
  safeSummary: string;
  missingReason: string | null;
};

export type TransitPersonalizedFoundationSnapshot =
  AstrologyInfrastructureSnapshot<TransitPersonalizedFoundationData>;

export function buildTransitPersonalizedFoundation(
  input: TransitPersonalizedInput
): TransitPersonalizedFoundationSnapshot {
  const foundation: TransitGocharFoundationSnapshot = buildTransitGocharFoundation({
    transitDateUtc: input.transitDateUtc,
    transitDateLocal: input.transitDateLocal,
    transitTimeLocal: input.transitTimeLocal,
    timezone: input.timezone,
    location: input.location,
    natalChart: input.natalChart,
  });

  if (foundation.status !== "ready" || !foundation.data) {
    return createAstrologyInfrastructureSnapshot({
      status: foundation.status,
      data: null,
      error: foundation.error,
      warnings: foundation.warnings,
    });
  }

  const natalChart = input.natalChart;
  const natalChartAvailable = Boolean(
    natalChart?.verification?.is_verified_for_chart_logic &&
      Array.isArray(natalChart?.planets)
  );
  const natalHouseBySignMap =
    natalChartAvailable && Array.isArray(natalChart?.houses) && natalChart.houses.length === 12
      ? buildHouseBySignMap(natalChart)
      : null;
  const natalPlanetMap =
    natalChartAvailable && Array.isArray(natalChart?.planets)
      ? buildNatalPlanetMap(natalChart)
      : null;
  const natalOverlayAvailable = Boolean(natalChartAvailable && natalHouseBySignMap);
  const planets = foundation.data.planets.map((planet) =>
    buildTransitPlanetEntry({
      transit: planet,
      natalPlanetMap,
      natalHouseBySignMap,
    })
  );
  const saturnTransit = buildMajorPlanetSummary({
    planet: "SATURN",
    transit: planets.find((planet) => planet.planet === "SATURN") ?? null,
  });
  const jupiterTransit = buildMajorPlanetSummary({
    planet: "JUPITER",
    transit: planets.find((planet) => planet.planet === "JUPITER") ?? null,
  });
  const rahuTransit = buildMajorPlanetSummary({
    planet: "RAHU",
    transit: planets.find((planet) => planet.planet === "RAHU") ?? null,
  });
  const ketuTransit = buildMajorPlanetSummary({
    planet: "KETU",
    transit: planets.find((planet) => planet.planet === "KETU") ?? null,
  });
  const majorTransitHighlights = [
    saturnTransit,
    jupiterTransit,
    rahuTransit,
    ketuTransit,
  ];
  const rahuKetuTransit = buildRahuKetuSummary({
    rahu: rahuTransit,
    ketu: ketuTransit,
  });
  const comparisonReadiness: TransitPersonalizedComparisonReadiness = {
    ...foundation.data.comparisonReadiness,
    natalOverlayAvailable,
    majorPlanetTrackingReady: true,
    overlayNote: natalOverlayAvailable
      ? "Natal overlay is ready for personalized transit tracking."
      : "Natal overlay is unavailable, so only general transit tracking is shown.",
  };
  const transitSummary = buildTransitsSummary({
    planets,
    natalOverlayAvailable,
  });

  return createAstrologyInfrastructureSnapshot({
    status: "ready",
    data: {
      transitDate: foundation.data.transitDate,
      timezone: foundation.data.timezone,
      location: foundation.data.location,
      planets,
      transitSummary,
      majorTransitHighlights,
      saturnTransit,
      jupiterTransit,
      rahuKetuTransit,
      natalOverlayAvailable,
      comparisonReadiness,
      safeSummary: transitSummary,
      missingReason: null,
    },
  });
}
