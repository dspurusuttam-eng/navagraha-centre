import "server-only";

import { unstable_cache } from "next/cache";
import { Horoscope, Origin } from "circular-natal-horoscope-js";
import {
  houseNumbers,
  planetaryBodies,
  signRulers,
} from "@/modules/astrology/constants";
import type { AstrologyProvider } from "@/modules/astrology/provider";
import { MockDeterministicAstrologyProvider } from "@/modules/astrology/providers/mock-deterministic-provider";
import type {
  AstrologicalAspect,
  AstrologyResponseMetadata,
  BirthDetails,
  DivisionalChartRequest,
  DivisionalChartResponse,
  HousePlacement,
  HouseNumber,
  HouseSystem,
  NatalChartRequest,
  NatalChartResponse,
  PlanetPosition,
  PlanetaryBody,
  TransitChartRequest,
  TransitChartResponse,
  ZodiacSign,
} from "@/modules/astrology/types";
import { AstrologyValidationError } from "@/modules/astrology/validation";

type CircularBodyKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn";
type CircularPointKey = "northnode" | "southnode";
type CircularAspectPointKey = CircularBodyKey | CircularPointKey | "ascendant";

type CircularSign = {
  key: string;
};

type CircularHouse = {
  id: number;
  Sign: CircularSign;
};

type CircularChartPosition = {
  Ecliptic: {
    DecimalDegrees: number;
  };
};

type CircularBody = {
  key: CircularBodyKey;
  Sign: CircularSign;
  ChartPosition: CircularChartPosition;
  House: CircularHouse;
  isRetrograde: boolean;
};

type CircularPoint = {
  key: CircularPointKey;
  Sign: CircularSign;
  ChartPosition: CircularChartPosition;
  House: CircularHouse;
};

type CircularAscendant = {
  key: "ascendant";
  Sign: CircularSign;
};

type CircularAspect = {
  point1Key: CircularAspectPointKey;
  point2Key: CircularAspectPointKey;
  aspectKey: string;
  orb: number;
};

type NatalComputationResult = Pick<
  NatalChartResponse,
  "ascendantSign" | "planets" | "houses" | "aspects" | "summary"
> & {
  generatedAtUtc: string;
};

const realFixtureKey = "circular-natal-live";

const bodyKeyMap: Record<CircularBodyKey, PlanetaryBody> = {
  sun: "SUN",
  moon: "MOON",
  mars: "MARS",
  mercury: "MERCURY",
  jupiter: "JUPITER",
  venus: "VENUS",
  saturn: "SATURN",
};

const pointKeyMap = {
  northnode: "RAHU",
  southnode: "KETU",
  ascendant: "ASCENDANT",
} as const;

const signKeyMap: Record<string, ZodiacSign> = {
  aries: "ARIES",
  taurus: "TAURUS",
  gemini: "GEMINI",
  cancer: "CANCER",
  leo: "LEO",
  virgo: "VIRGO",
  libra: "LIBRA",
  scorpio: "SCORPIO",
  sagittarius: "SAGITTARIUS",
  capricorn: "CAPRICORN",
  aquarius: "AQUARIUS",
  pisces: "PISCES",
};

const aspectKeyMap: Record<string, AstrologicalAspect["type"]> = {
  conjunction: "CONJUNCTION",
  sextile: "SEXTILE",
  square: "SQUARE",
  trine: "TRINE",
  opposition: "OPPOSITION",
};

const houseSystemMap: Record<HouseSystem, string> = {
  WHOLE_SIGN: "whole-sign",
  PLACIDUS: "placidus",
};

const angularHouses = new Set<HouseNumber>([1, 4, 7, 10]);
const bodyPriority = new Map(
  planetaryBodies.map((body, index) => [body, index] as const)
);
const supportedAspectPoints: CircularAspectPointKey[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "northnode",
  "southnode",
  "ascendant",
];

const getCachedNatalComputation = unstable_cache(
  async (serializedInput: string): Promise<NatalComputationResult> => {
    const input = JSON.parse(serializedInput) as Pick<
      NatalChartRequest,
      "birthDetails" | "houseSystem"
    >;

    return computeNatalChart(input.birthDetails, input.houseSystem);
  },
  ["astrology", "circular-natal-real", "natal-core"],
  { tags: ["astrology", "astrology:natal"] }
);

function isCircularBodyKey(
  pointKey: CircularAspectPointKey
): pointKey is CircularBodyKey {
  return Object.prototype.hasOwnProperty.call(bodyKeyMap, pointKey);
}

function mapSign(key: string): ZodiacSign {
  const mapped = signKeyMap[key];

  if (!mapped) {
    throw new Error(`Unsupported zodiac sign received from adapter: ${key}`);
  }

  return mapped;
}

function mapHouseNumber(value: number): HouseNumber {
  if (!houseNumbers.includes(value as HouseNumber)) {
    throw new Error(`Unsupported house received from adapter: ${value}`);
  }

  return value as HouseNumber;
}

function mapAspectPoint(
  pointKey: CircularAspectPointKey
): PlanetaryBody | "ASCENDANT" {
  if (isCircularBodyKey(pointKey)) {
    return bodyKeyMap[pointKey];
  }

  return pointKeyMap[pointKey];
}

function getDegreeParts(decimalDegrees: number) {
  const normalized = ((decimalDegrees % 30) + 30) % 30;
  let degree = Math.floor(normalized);
  let minute = Math.round((normalized - degree) * 60);

  if (minute === 60) {
    degree = (degree + 1) % 30;
    minute = 0;
  }

  return { degree, minute };
}

function getBirthCoordinates(birthDetails: BirthDetails) {
  const latitude = birthDetails.place.latitude;
  const longitude = birthDetails.place.longitude;

  if (latitude === null || latitude === undefined) {
    throw new AstrologyValidationError([
      {
        field: "birthDetails.place.latitude",
        code: "REAL_PROVIDER_REQUIRES_LATITUDE",
        message:
          "The live natal adapter requires birth latitude to calculate chart data.",
      },
    ]);
  }

  if (longitude === null || longitude === undefined) {
    throw new AstrologyValidationError([
      {
        field: "birthDetails.place.longitude",
        code: "REAL_PROVIDER_REQUIRES_LONGITUDE",
        message:
          "The live natal adapter requires birth longitude to calculate chart data.",
      },
    ]);
  }

  return { latitude, longitude };
}

function createOrigin(birthDetails: BirthDetails) {
  const [year, month, date] = birthDetails.dateLocal.split("-").map(Number);
  const [hour, minute] = birthDetails.timeLocal.split(":").map(Number);
  const { latitude, longitude } = getBirthCoordinates(birthDetails);

  return new Origin({
    year,
    month: month - 1,
    date,
    hour,
    minute,
    latitude,
    longitude,
  });
}

function createHoroscope(birthDetails: BirthDetails, houseSystem: HouseSystem) {
  return new Horoscope({
    origin: createOrigin(birthDetails),
    houseSystem: houseSystemMap[houseSystem],
    zodiac: "tropical",
    aspectTypes: ["major"],
    aspectPoints: supportedAspectPoints,
    aspectWithPoints: supportedAspectPoints,
  });
}

function mapPlanetPosition(
  point: CircularBody | CircularPoint,
  body: PlanetaryBody,
  retrograde: boolean
): PlanetPosition {
  const { degree, minute } = getDegreeParts(
    point.ChartPosition.Ecliptic.DecimalDegrees
  );

  return {
    body,
    sign: mapSign(point.Sign.key),
    degree,
    minute,
    house: mapHouseNumber(point.House.id),
    retrograde,
  };
}

function mapHouses(houses: CircularHouse[]): HousePlacement[] {
  return houses.map((house) => {
    const sign = mapSign(house.Sign.key);

    return {
      house: mapHouseNumber(house.id),
      sign,
      ruler: signRulers[sign],
    };
  });
}

function mapAspects(aspects: CircularAspect[]): AstrologicalAspect[] {
  return aspects
    .filter((aspect) => aspect.aspectKey in aspectKeyMap)
    .map((aspect) => ({
      type: aspectKeyMap[aspect.aspectKey],
      source: mapAspectPoint(aspect.point1Key),
      target: mapAspectPoint(aspect.point2Key),
      orb: Number(aspect.orb.toFixed(2)),
      applying: false,
      exact: aspect.orb <= 0.5,
    }));
}

function getDominantBodies(
  planets: PlanetPosition[],
  aspects: AstrologicalAspect[]
): PlanetaryBody[] {
  const scores = new Map(planetaryBodies.map((body) => [body, 0]));

  for (const planet of planets) {
    const angularBonus = angularHouses.has(planet.house) ? 3 : 1;
    const retrogradeBonus = planet.retrograde ? 1 : 0;
    scores.set(
      planet.body,
      (scores.get(planet.body) ?? 0) + angularBonus + retrogradeBonus
    );
  }

  for (const aspect of aspects) {
    if (aspect.source !== "ASCENDANT") {
      scores.set(aspect.source, (scores.get(aspect.source) ?? 0) + 1);
    }

    if (aspect.target !== "ASCENDANT") {
      scores.set(aspect.target, (scores.get(aspect.target) ?? 0) + 1);
    }
  }

  return [...scores.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return (
        (bodyPriority.get(left[0]) ?? Number.MAX_SAFE_INTEGER) -
        (bodyPriority.get(right[0]) ?? Number.MAX_SAFE_INTEGER)
      );
    })
    .slice(0, 3)
    .map(([body]) => body);
}

function formatBodyLabel(body: PlanetaryBody) {
  return body.charAt(0) + body.slice(1).toLowerCase();
}

function buildNarrative(
  ascendantSign: ZodiacSign,
  dominantBodies: PlanetaryBody[],
  houseSystem: HouseSystem
) {
  const dominantLabel = dominantBodies.map(formatBodyLabel).join(", ");
  const houseSystemLabel =
    houseSystem === "WHOLE_SIGN" ? "whole-sign" : "Placidus";

  return `${ascendantSign} rising with ${dominantLabel} carrying the clearest structural emphasis in this ${houseSystemLabel} natal chart.`;
}

function computeNatalChart(
  birthDetails: BirthDetails,
  houseSystem: HouseSystem
): NatalComputationResult {
  const horoscope = createHoroscope(birthDetails, houseSystem) as {
    Ascendant: CircularAscendant;
    Houses: CircularHouse[];
    CelestialBodies: Record<CircularBodyKey, CircularBody>;
    CelestialPoints: Record<CircularPointKey, CircularPoint>;
    Aspects: {
      all: CircularAspect[];
    };
  };

  const planets: PlanetPosition[] = [
    mapPlanetPosition(
      horoscope.CelestialBodies.sun,
      "SUN",
      horoscope.CelestialBodies.sun.isRetrograde
    ),
    mapPlanetPosition(
      horoscope.CelestialBodies.moon,
      "MOON",
      horoscope.CelestialBodies.moon.isRetrograde
    ),
    mapPlanetPosition(
      horoscope.CelestialBodies.mars,
      "MARS",
      horoscope.CelestialBodies.mars.isRetrograde
    ),
    mapPlanetPosition(
      horoscope.CelestialBodies.mercury,
      "MERCURY",
      horoscope.CelestialBodies.mercury.isRetrograde
    ),
    mapPlanetPosition(
      horoscope.CelestialBodies.jupiter,
      "JUPITER",
      horoscope.CelestialBodies.jupiter.isRetrograde
    ),
    mapPlanetPosition(
      horoscope.CelestialBodies.venus,
      "VENUS",
      horoscope.CelestialBodies.venus.isRetrograde
    ),
    mapPlanetPosition(
      horoscope.CelestialBodies.saturn,
      "SATURN",
      horoscope.CelestialBodies.saturn.isRetrograde
    ),
    mapPlanetPosition(horoscope.CelestialPoints.northnode, "RAHU", true),
    mapPlanetPosition(horoscope.CelestialPoints.southnode, "KETU", true),
  ];
  const houses = mapHouses(horoscope.Houses);
  const aspects = mapAspects(horoscope.Aspects.all);
  const dominantBodies = getDominantBodies(planets, aspects);
  const ascendantSign = mapSign(horoscope.Ascendant.Sign.key);

  return {
    ascendantSign,
    planets,
    houses,
    aspects,
    summary: {
      dominantBodies,
      narrative: buildNarrative(ascendantSign, dominantBodies, houseSystem),
    },
    generatedAtUtc: new Date().toISOString(),
  };
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

export class CircularNatalHoroscopeProvider implements AstrologyProvider {
  readonly key = "circular-natal-real";
  readonly label = "Circular Natal Horoscope Provider";

  constructor(
    private readonly fallbackProvider: AstrologyProvider = new MockDeterministicAstrologyProvider()
  ) {}

  private createMetadata(
    requestId: string,
    generatedAtUtc: string
  ): AstrologyResponseMetadata {
    return {
      providerKey: this.key,
      fixtureKey: realFixtureKey,
      requestId,
      generatedAtUtc,
      deterministic: true,
      disclaimer:
        "Live tropical natal essentials generated by the circular-natal-horoscope-js adapter. Divisional charts, transit snapshots, remedies, and interpretation stay outside this provider phase.",
    };
  }

  async getNatalChart(request: NatalChartRequest): Promise<NatalChartResponse> {
    const cached = await getCachedNatalComputation(
      JSON.stringify({
        birthDetails: request.birthDetails,
        houseSystem: request.houseSystem,
      })
    );

    return {
      kind: "NATAL",
      metadata: this.createMetadata(request.requestId, cached.generatedAtUtc),
      birthDetails: cloneValue(request.birthDetails),
      houseSystem: request.houseSystem,
      ascendantSign: cached.ascendantSign,
      planets: cloneValue(cached.planets),
      houses: cloneValue(cached.houses),
      aspects: cloneValue(cached.aspects),
      divisionalCharts: [],
      remedySignals: [],
      summary: cloneValue(cached.summary),
    };
  }

  async getTransitSnapshot(
    request: TransitChartRequest
  ): Promise<TransitChartResponse> {
    return this.fallbackProvider.getTransitSnapshot(request);
  }

  async getDivisionalChart(
    request: DivisionalChartRequest
  ): Promise<DivisionalChartResponse> {
    return this.fallbackProvider.getDivisionalChart(request);
  }
}
