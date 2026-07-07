import type {
  DivisionalChartReadiness,
  DivisionalPlanetSummary,
  DivisionalReadinessCode,
  DivisionalReadinessStatus,
  HouseNumber,
  ZodiacSign,
} from "@/modules/astrology/types";
import {
  buildVargaChart,
  listVargottamaBodies,
  vargaCodes,
} from "@/modules/astrology/divisional/varga-engine";

type DivisionalSourceChart = {
  lagna: {
    sign: ZodiacSign | string;
    longitude: number;
    degree_in_sign: number;
  };
  planets: Array<{
    name: string;
    sign: ZodiacSign | string;
    longitude: number;
    degree_in_sign: number;
    nakshatra: string;
    pada: number;
    is_retrograde: boolean;
    house: HouseNumber;
  }>;
  houses: Array<{
    house: HouseNumber;
    sign: ZodiacSign | string;
  }>;
};

const readinessCatalog: readonly {
  code: DivisionalReadinessCode;
  title: string;
  focus: string;
}[] = [
  {
    code: "D1",
    title: "Rashi Chart",
    focus: "Natal life structure and baseline expression.",
  },
  {
    code: "D2",
    title: "Hora",
    focus: "Resources, sustenance, and wealth orientation.",
  },
  {
    code: "D3",
    title: "Drekkana",
    focus: "Siblings, courage, and personal initiative.",
  },
  {
    code: "D4",
    title: "Chaturthamsha",
    focus: "Inner home, foundations, and settled belonging.",
  },
  {
    code: "D7",
    title: "Saptamsha",
    focus: "Legacy, contribution, and stewardship themes.",
  },
  {
    code: "D9",
    title: "Navamsa",
    focus: "Inner maturity, devotion, and relationship refinement.",
  },
  {
    code: "D10",
    title: "Dashamsa",
    focus: "Career, authority, and visible professional expression.",
  },
  {
    code: "D12",
    title: "Dwadashamsha",
    focus: "Lineage, inherited tone, and parental patterning.",
  },
  {
    code: "D16",
    title: "Shodashamsha",
    focus: "Comforts, conveyances, and inner contentment.",
  },
  {
    code: "D20",
    title: "Vimshamsha",
    focus: "Devotional practice and spiritual discipline.",
  },
  {
    code: "D24",
    title: "Chaturvimshamsha",
    focus: "Learning, knowledge, and study patterns.",
  },
  {
    code: "D27",
    title: "Bhamsha",
    focus: "Underlying strengths and subtle vitality.",
  },
  {
    code: "D30",
    title: "Trimshamsha",
    focus: "Challenges, resilience, and self-protection themes.",
  },
  {
    code: "D40",
    title: "Khavedamsha",
    focus: "Maternal lineage tone and habitual patterns.",
  },
  {
    code: "D45",
    title: "Akshavedamsha",
    focus: "Paternal lineage tone and conduct patterns.",
  },
  {
    code: "D60",
    title: "Shashtiamsha",
    focus: "Fine-grained karmic refinement and deep divisional analysis.",
  },
];

const AVAILABLE_NOTE =
  "Computed from verified natal sidereal longitudes using the classical Parashara (BPHS) division rules. Sign placements only; no divisional degrees are fabricated.";

const UNAVAILABLE_NOTE =
  "Chart context is unavailable, so divisional readiness is not available yet.";

function toPlanetSummary(planet: DivisionalSourceChart["planets"][number]): DivisionalPlanetSummary {
  const degree = Math.floor(planet.degree_in_sign);
  const minute = Math.round((planet.degree_in_sign - degree) * 60);

  return {
    body: planet.name as DivisionalPlanetSummary["body"],
    sign: planet.sign as DivisionalPlanetSummary["sign"],
    longitude: planet.longitude,
    degree,
    minute,
    house: planet.house,
    retrograde: planet.is_retrograde,
    nakshatra: planet.nakshatra || null,
    pada: planet.pada ?? null,
  };
}

function buildD1Chart(chart: DivisionalSourceChart): NonNullable<DivisionalChartReadiness["chart"]> {
  const planets: NonNullable<DivisionalChartReadiness["chart"]>["planets"] = chart.planets.map(
    toPlanetSummary
  );
  const houses: NonNullable<DivisionalChartReadiness["chart"]>["houses"] = chart.houses.map(
    (house) => ({
      house: house.house,
      sign: house.sign as ZodiacSign,
    })
  );

  return {
    chartType: "D1",
    ascendantSign: chart.lagna.sign as NonNullable<DivisionalChartReadiness["chart"]>["ascendantSign"],
    planets,
    houses,
  };
}

function buildVargaReadinessChart(
  chart: DivisionalSourceChart,
  code: DivisionalReadinessCode
): NonNullable<DivisionalChartReadiness["chart"]> | null {
  const varga = buildVargaChart(chart, code);

  if (!varga) {
    return null;
  }

  return {
    chartType: code,
    ascendantSign: varga.ascendant.sign,
    planets: varga.planets.map((planet) => ({
      body: planet.body as DivisionalPlanetSummary["body"],
      sign: planet.sign,
      // Natal longitude echoed for reference; varga charts carry sign
      // placements only — divisional degrees/nakshatras are never fabricated.
      longitude: planet.natalLongitude,
      degree: Math.floor(planet.natalDegreeInSign),
      minute: Math.round(
        (planet.natalDegreeInSign - Math.floor(planet.natalDegreeInSign)) * 60
      ),
      house: planet.house as HouseNumber,
      retrograde: planet.retrograde,
      nakshatra: null,
      pada: null,
    })),
    houses: varga.houses.map((house) => ({
      house: house.house as HouseNumber,
      sign: house.sign,
    })),
  };
}

export function buildDivisionalChartReadiness(
  chart: DivisionalSourceChart | null | undefined
): DivisionalChartReadiness[] {
  if (!chart) {
    return readinessCatalog.map((entry) => ({
      code: entry.code,
      title: entry.title,
      focus: entry.focus,
      status: "unavailable" as DivisionalReadinessStatus,
      note: UNAVAILABLE_NOTE,
      chart: null,
    }));
  }

  const vargottamaBodies = listVargottamaBodies(chart);

  return readinessCatalog.map((entry) => {
    const builtChart =
      entry.code === "D1"
        ? buildD1Chart(chart)
        : buildVargaReadinessChart(chart, entry.code);

    if (!builtChart) {
      return {
        code: entry.code,
        title: entry.title,
        focus: entry.focus,
        status: "unavailable" as DivisionalReadinessStatus,
        note: UNAVAILABLE_NOTE,
        chart: null,
      };
    }

    return {
      code: entry.code,
      title: entry.title,
      focus: entry.focus,
      status: "available" as DivisionalReadinessStatus,
      note: AVAILABLE_NOTE,
      chart: builtChart,
      ...(entry.code === "D9" ? { meta: { vargottamaBodies } } : {}),
    };
  });
}

export function getVargaCatalogEntry(code: DivisionalReadinessCode) {
  return readinessCatalog.find((entry) => entry.code === code) ?? null;
}

export { vargaCodes as supportedVargaCodes };
