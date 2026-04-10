import { getDegreeMinute, getNakshatraPlacement } from "@/lib/astrology/ephemeris";
import { mockAstrologyFixtures } from "@/modules/astrology/fixtures";
import type { AstrologyProvider } from "@/modules/astrology/provider";
import type {
  AstrologyResponseMetadata,
  DivisionalChartRequest,
  DivisionalChartResponse,
  NatalChartRequest,
  NatalChartResponse,
  PlanetPosition,
  PlanetaryBody,
  TransitChartRequest,
  TransitChartResponse,
  ZodiacSign,
} from "@/modules/astrology/types";

const zodiacOffsets: Record<ZodiacSign, number> = {
  ARIES: 0,
  TAURUS: 30,
  GEMINI: 60,
  CANCER: 90,
  LEO: 120,
  VIRGO: 150,
  LIBRA: 180,
  SCORPIO: 210,
  SAGITTARIUS: 240,
  CAPRICORN: 270,
  AQUARIUS: 300,
  PISCES: 330,
};

type FixturePlanetPosition =
  (typeof mockAstrologyFixtures)[number]["natal"]["planets"][number];

function createFixtureSeed(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function getLongitudeForPlanet(planet: Pick<PlanetPosition, "sign" | "degree" | "minute">) {
  return zodiacOffsets[planet.sign] + planet.degree + planet.minute / 60;
}

const fallbackTransitDegrees: Record<
  PlanetaryBody,
  {
    degree: number;
    minute: number;
    speed: number;
  }
> = {
  SUN: { degree: 11, minute: 14, speed: 0.98 },
  MOON: { degree: 18, minute: 9, speed: 12.4 },
  MARS: { degree: 7, minute: 26, speed: 0.53 },
  MERCURY: { degree: 23, minute: 8, speed: 1.14 },
  JUPITER: { degree: 15, minute: 31, speed: 0.21 },
  VENUS: { degree: 4, minute: 52, speed: 1.08 },
  SATURN: { degree: 19, minute: 17, speed: 0.11 },
  RAHU: { degree: 8, minute: 42, speed: -0.05 },
  KETU: { degree: 8, minute: 42, speed: -0.05 },
};

function enrichPlanetPosition(planet: FixturePlanetPosition): PlanetPosition {
  const longitude = planet.longitude ?? getLongitudeForPlanet(planet);
  const { degree, minute } = getDegreeMinute(longitude);

  return {
    ...planet,
    longitude,
    degree,
    minute,
    speed: planet.speed ?? 0,
    latitude: planet.latitude ?? 0,
    nakshatra: planet.nakshatra ?? getNakshatraPlacement(longitude),
  };
}

function buildTransitPlanets(fixture: (typeof mockAstrologyFixtures)[number]) {
  const transitEventsByBody = new Map(
    fixture.transits.transits.map((event) => [event.body, event] as const)
  );

  return fixture.natal.planets.map((planet) => {
    const transitEvent = transitEventsByBody.get(planet.body);

    if (!transitEvent) {
      return enrichPlanetPosition(planet);
    }

    const fallbackDegrees = fallbackTransitDegrees[planet.body];

    return enrichPlanetPosition({
      ...planet,
      sign: transitEvent.sign,
      house: transitEvent.house,
      degree: fallbackDegrees.degree,
      minute: fallbackDegrees.minute,
      retrograde:
        planet.body === "RAHU" || planet.body === "KETU"
          ? true
          : planet.retrograde,
      speed: fallbackDegrees.speed,
      longitude: undefined,
      nakshatra: undefined,
    });
  });
}

export class MockDeterministicAstrologyProvider implements AstrologyProvider {
  readonly key = "mock-deterministic";
  readonly label = "Mock Deterministic Provider";

  private getFixture(seedSource: string) {
    const fixtureIndex =
      createFixtureSeed(seedSource) % mockAstrologyFixtures.length;

    return mockAstrologyFixtures[fixtureIndex];
  }

  private createMetadata(
    requestId: string,
    fixtureKey: string,
    generatedAtUtc: string
  ): AstrologyResponseMetadata {
    return {
      providerKey: this.key,
      fixtureKey,
      requestId,
      generatedAtUtc,
      deterministic: true,
      disclaimer:
        "Mock deterministic fixture only. Replace this provider with a live ephemeris-backed provider later without changing UI contracts.",
    };
  }

  async getNatalChart(request: NatalChartRequest): Promise<NatalChartResponse> {
    const fixture = this.getFixture(
      [
        request.requestId,
        request.birthDetails.dateLocal,
        request.birthDetails.timeLocal,
        request.birthDetails.timezone,
        request.birthDetails.place.city,
        request.houseSystem,
      ].join("|")
    );

    const requestedCodes = request.requestedDivisionalCharts.length
      ? request.requestedDivisionalCharts
      : (Object.keys(fixture.divisionalCharts) as Array<
          keyof typeof fixture.divisionalCharts
        >);

    const divisionalCharts = requestedCodes
      .map((code) => fixture.divisionalCharts[code])
      .filter(
        (
          chart
        ): chart is (typeof fixture.divisionalCharts)[keyof typeof fixture.divisionalCharts] =>
          Boolean(chart)
      );

    return {
      kind: "NATAL",
      metadata: this.createMetadata(
        request.requestId,
        fixture.key,
        fixture.generatedAtUtc
      ),
      birthDetails: cloneValue(request.birthDetails),
      houseSystem: request.houseSystem,
      ascendantSign: fixture.natal.ascendantSign,
      lagna: {
        sign: fixture.natal.ascendantSign,
        longitude: zodiacOffsets[fixture.natal.ascendantSign],
        degree: 0,
        minute: 0,
        nakshatra: getNakshatraPlacement(zodiacOffsets[fixture.natal.ascendantSign]),
      },
      planets: cloneValue(fixture.natal.planets).map(enrichPlanetPosition),
      houses: cloneValue(fixture.natal.houses),
      aspects: cloneValue(fixture.natal.aspects),
      divisionalCharts:
        cloneValue(divisionalCharts) as unknown as NatalChartResponse["divisionalCharts"],
      remedySignals: cloneValue(fixture.natal.remedySignals),
      nakshatras: cloneValue(fixture.natal.planets)
        .map(enrichPlanetPosition)
        .map((planet) => ({
          body: planet.body,
          placement: planet.nakshatra ?? getNakshatraPlacement(planet.longitude),
        })),
      summary: cloneValue(fixture.natal.summary),
    };
  }

  async getTransitSnapshot(
    request: TransitChartRequest
  ): Promise<TransitChartResponse> {
    const fixture = this.getFixture(
      [
        request.requestId,
        request.birthDetails.dateLocal,
        request.birthDetails.timeLocal,
        request.window.fromDateUtc,
        request.window.toDateUtc,
      ].join("|")
    );

    return {
      kind: "TRANSIT_SNAPSHOT",
      metadata: this.createMetadata(
        request.requestId,
        fixture.key,
        fixture.generatedAtUtc
      ),
      birthDetails: cloneValue(request.birthDetails),
      houseSystem: request.houseSystem,
      window: cloneValue(request.window),
      asOfUtc: fixture.generatedAtUtc,
      planets: buildTransitPlanets(fixture),
      transits: cloneValue(fixture.transits.transits),
      aspects: cloneValue(fixture.transits.aspects),
      remedySignals: cloneValue(fixture.transits.remedySignals),
    };
  }

  async getDivisionalChart(
    request: DivisionalChartRequest
  ): Promise<DivisionalChartResponse> {
    const fixture = this.getFixture(
      [
        request.requestId,
        request.birthDetails.dateLocal,
        request.birthDetails.timeLocal,
        request.chartCode,
      ].join("|")
    );

    return {
      kind: "DIVISIONAL",
      metadata: this.createMetadata(
        request.requestId,
        fixture.key,
        fixture.generatedAtUtc
      ),
      birthDetails: cloneValue(request.birthDetails),
      houseSystem: request.houseSystem,
      chart:
        cloneValue(
          fixture.divisionalCharts[request.chartCode]
        ) as unknown as DivisionalChartResponse["chart"],
      remedySignals: cloneValue(fixture.natal.remedySignals),
    };
  }
}
