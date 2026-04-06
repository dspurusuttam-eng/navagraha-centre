import type {
  DivisionalChartRequest,
  DivisionalChartResponse,
  NatalChartRequest,
  NatalChartResponse,
  TransitChartRequest,
  TransitChartResponse,
} from "@/modules/astrology/types";

export interface AstrologyProvider {
  readonly key: string;
  readonly label: string;
  getNatalChart(request: NatalChartRequest): Promise<NatalChartResponse>;
  getTransitSnapshot(
    request: TransitChartRequest
  ): Promise<TransitChartResponse>;
  getDivisionalChart(
    request: DivisionalChartRequest
  ): Promise<DivisionalChartResponse>;
}

export type AstrologyProviderFactory = () => AstrologyProvider;
