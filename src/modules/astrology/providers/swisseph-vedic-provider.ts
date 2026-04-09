import "server-only";

import {
  buildChartSummaryInsights,
  generateBirthChart,
  generateTransitSnapshot,
} from "@/lib/astrology/chart-generator";
import { getSwissEphemerisRuntime } from "@/lib/astrology/ephemeris";
import type { AstrologyProvider } from "@/modules/astrology/provider";
import { MockDeterministicAstrologyProvider } from "@/modules/astrology/providers/mock-deterministic-provider";
import type {
  DivisionalChartRequest,
  DivisionalChartResponse,
  NatalChartRequest,
  NatalChartResponse,
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

    return this.fallbackProvider.getDivisionalChart(request);
  }
}
