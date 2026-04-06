import type {
  ChartInterpretationRequest,
  ChartInterpretationResult,
} from "@/modules/ai/types";

export interface AiInterpretationProvider {
  readonly key: string;
  readonly label: string;
  generateChartInterpretation(
    request: ChartInterpretationRequest
  ): Promise<ChartInterpretationResult>;
}

export type AiInterpretationProviderFactory = () => AiInterpretationProvider;
