import type {
  DivisionalChartReadiness,
  DivisionalPlanetSummary,
  DivisionalReadinessCode,
  DivisionalReadinessStatus,
  HouseNumber,
  ZodiacSign,
} from "@/modules/astrology/types";

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

const readinessCatalog = [
  {
    code: "D1",
    title: "Rashi Chart",
    focus: "Natal life structure and baseline expression.",
    status: "available",
    note: "The natal chart is the production baseline and remains fully available.",
  },
  {
    code: "D9",
    title: "Navamsa",
    focus: "Inner maturity, devotion, and relationship refinement.",
    status: "pending",
    note: "Navamsa is reserved as a safe hook for a future formula-backed divisional engine.",
  },
  {
    code: "D10",
    title: "Dashamsa",
    focus: "Career, authority, and visible professional expression.",
    status: "pending",
    note: "Dashamsa is reserved as a safe hook for a future formula-backed divisional engine.",
  },
  {
    code: "D7",
    title: "Saptamsa",
    focus: "Legacy, contribution, and stewardship themes.",
    status: "pending",
    note: "Saptamsa is ready as a future expansion hook without fabricated output.",
  },
  {
    code: "D4",
    title: "Chaturthamsha",
    focus: "Inner home, foundations, and settled belonging.",
    status: "pending",
    note: "Chaturthamsha is ready as a future expansion hook without fabricated output.",
  },
  {
    code: "D12",
    title: "Dwadashamsha",
    focus: "Lineage, inherited tone, and parental patterning.",
    status: "pending",
    note: "Dwadashamsha is ready as a future expansion hook without fabricated output.",
  },
  {
    code: "D60",
    title: "Shashtiamsha",
    focus: "Fine-grained karmic refinement and deep divisional analysis.",
    status: "pending",
    note: "Shashtiamsha is reserved for a later high-precision engine and is not fabricated here.",
  },
] as const satisfies readonly {
  code: DivisionalReadinessCode;
  title: string;
  focus: string;
  status: DivisionalReadinessStatus;
  note: string;
}[];

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

export function buildDivisionalChartReadiness(
  chart: DivisionalSourceChart | null | undefined
): DivisionalChartReadiness[] {
  if (!chart) {
    return readinessCatalog.map((entry) => ({
      code: entry.code,
      title: entry.title,
      focus: entry.focus,
      status: "unavailable" as DivisionalReadinessStatus,
      note: "Chart context is unavailable, so divisional readiness is not available yet.",
      chart: null,
    }));
  }

  return readinessCatalog.map((entry) => {
    if (entry.code !== "D1") {
      return {
        code: entry.code,
        title: entry.title,
        focus: entry.focus,
        status: entry.status,
        note: entry.note,
        chart: null,
      };
    }

    return {
      code: entry.code,
      title: entry.title,
      focus: entry.focus,
      status: entry.status,
      note: entry.note,
      chart: buildD1Chart(chart),
    };
  });
}
