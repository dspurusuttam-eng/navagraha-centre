import "server-only";

import {
  buildChartSummaryInsights,
  generateBirthChart,
  generateTransitSnapshot,
} from "@/lib/astrology/chart-generator";
import { getSwissEphemerisRuntime } from "@/lib/astrology/ephemeris";
import { signRulerMap } from "@/lib/astrology/constants";
import { zodiacSigns } from "@/modules/astrology/constants";
import { getVargaCatalogEntry } from "@/modules/astrology/divisional/foundation";
import {
  calculateVargaPlacement,
  isClassicalVargaBody,
} from "@/modules/astrology/divisional/varga-engine";
import type { AstrologyProvider } from "@/modules/astrology/provider";
import { MockDeterministicAstrologyProvider } from "@/modules/astrology/providers/mock-deterministic-provider";
import type {
  DivisionalChartRequest,
  DivisionalChartResponse,
  HouseNumber,
  HousePlacement,
  NatalChartRequest,
  NatalChartResponse,
  PlanetPosition,
  TransitChartRequest,
  TransitChartResponse,
} from "@/modules/astrology/types";
import { AstrologyValidationError } from "@/modules/astrology/validation";

function assertCoordinates(
  request: Pick<NatalChartRequest | TransitChartRequest, "birthDetails">
) {
  if (
    request.birthDetails.place.latitude === null ||
    request.birthDetails.place.latitude === undefined
  ) {
    throw new AstrologyValidationError([
      {
        field: "birthDetails.place.latitude",
        code: "REQUIRED_LATITUDE",
        message:
          "Latitude is required for the real Vedic chart engine. Please save precise birth coordinates first.",
      },
    ]);
  }

  if (
    request.birthDetails.place.longitude === null ||
    request.birthDetails.place.longitude === undefined
  ) {
    throw new AstrologyValidationError([
      {
        field: "birthDetails.place.longitude",
        code: "REQUIRED_LONGITUDE",
        message:
          "Longitude is required for the real Vedic chart engine. Please save precise birth coordinates first.",
      },
    ]);
  }
}

export class SwissEphemerisVedicProvider implements AstrologyProvider {
  readonly key = "swisseph-vedic";
  readonly label = "Swiss Ephemeris Vedic Provider";

  constructor(
    private readonly fallbackProvider: AstrologyProvider = new MockDeterministicAstrologyProvider()
  ) {}

  async getNatalChart(request: NatalChartRequest): Promise<NatalChartResponse> {
    assertCoordinates(request);

    const runtime = getSwissEphemerisRuntime();
    const chart = generateBirthChart({
      birthDetails: request.birthDetails,
      houseSystem: request.houseSystem,
    });
    const insights = buildChartSummaryInsights(chart);

    return {
      ...chart,
      metadata: {
        ...chart.metadata,
        providerKey: this.key,
        fixtureKey: runtime.calculationVersion,
        requestId: request.requestId,
      },
      divisionalCharts:
        request.requestedDivisionalCharts.length > 0
          ? chart.divisionalCharts
          : [],
      summary: {
        ...chart.summary,
        narrative: [
          chart.summary.narrative,
          insights.strengths[0] ?? null,
          insights.challenges[0] ?? null,
        ]
          .filter((line): line is string => Boolean(line))
          .join(" "),
      },
    };
  }

  async getTransitSnapshot(
    request: TransitChartRequest
  ): Promise<TransitChartResponse> {
    assertCoordinates(request);

    const runtime = getSwissEphemerisRuntime();
    const snapshot = generateTransitSnapshot({
      birthDetails: request.birthDetails,
      houseSystem: request.houseSystem,
      window: request.window,
    });

    return {
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        providerKey: this.key,
        fixtureKey: runtime.calculationVersion,
        requestId: request.requestId,
      },
    };
  }

  async getDivisionalChart(
    request: DivisionalChartRequest
  ): Promise<DivisionalChartResponse> {
    if (request.chartCode === "D1") {
      const chart = await this.getNatalChart({
        ...request,
        kind: "NATAL",
        requestedDivisionalCharts: [],
      });

      return {
        kind: "DIVISIONAL",
        metadata: {
          ...chart.metadata,
          requestId: request.requestId,
        },
        birthDetails: request.birthDetails,
        houseSystem: request.houseSystem,
        chart: {
          code: "D1",
          title: "Rashi Chart",
          focus: "Natal sidereal birth chart",
          ascendantSign: chart.ascendantSign,
          planets: chart.planets,
          houses: chart.houses,
          highlights: [
            chart.summary.narrative,
            ...(chart.yogas?.map((yoga) => yoga.title) ?? []),
          ].slice(0, 4),
        },
        remedySignals: chart.remedySignals,
      };
    }

    const chart = await this.getNatalChart({
      ...request,
      kind: "NATAL",
      requestedDivisionalCharts: [],
    });
    const catalogEntry = getVargaCatalogEntry(request.chartCode);
    const lagnaLongitude = chart.lagna?.longitude;
    const lagnaPlacement =
      lagnaLongitude === undefined || lagnaLongitude === null
        ? null
        : calculateVargaPlacement(lagnaLongitude, request.chartCode);

    if (!catalogEntry || !lagnaPlacement) {
      // Without a verified natal lagna longitude, the varga ascendant cannot
      // be derived honestly — defer instead of fabricating.
      return this.fallbackProvider.getDivisionalChart(request);
    }

    const planets: PlanetPosition[] = [];

    for (const planet of chart.planets) {
      if (!isClassicalVargaBody(planet.body)) {
        continue;
      }

      const placement = calculateVargaPlacement(
        planet.longitude,
        request.chartCode
      );

      if (!placement) {
        return this.fallbackProvider.getDivisionalChart(request);
      }

      planets.push({
        body: planet.body,
        sign: placement.sign,
        // Natal longitude/degree echoed for reference; varga charts carry
        // sign placements only — divisional nakshatras are never fabricated.
        longitude: planet.longitude,
        degree: planet.degree,
        minute: planet.minute,
        house: (((placement.signIndex - lagnaPlacement.signIndex + 12) % 12) +
          1) as HouseNumber,
        retrograde: planet.retrograde,
        speed: planet.speed,
      });
    }

    const houses: HousePlacement[] = Array.from({ length: 12 }, (_, index) => {
      const sign = zodiacSigns[(lagnaPlacement.signIndex + index) % 12];

      return {
        house: (index + 1) as HouseNumber,
        sign,
        ruler: signRulerMap[sign],
      };
    });

    return {
      kind: "DIVISIONAL",
      metadata: {
        ...chart.metadata,
        requestId: request.requestId,
      },
      birthDetails: request.birthDetails,
      houseSystem: request.houseSystem,
      chart: {
        code: request.chartCode,
        title: catalogEntry.title,
        focus: catalogEntry.focus,
        ascendantSign: lagnaPlacement.sign,
        planets,
        houses,
        highlights: [
          `${catalogEntry.title} (${request.chartCode}) sign placements derived from verified natal sidereal longitudes using classical Parashara division rules.`,
          "Divisional placements are structural reference data, not predictions.",
        ],
      },
      remedySignals: chart.remedySignals,
    };
  }
}
