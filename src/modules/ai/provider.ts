import type {
  ChartInterpretationRequest,
  ChartInterpretationResult,
} from "@/modules/ai/types";
import type { AiTaskKind } from "@/modules/ai/tasks";

export type AiGroundedTextRequest = {
  taskKind: AiTaskKind;
  promptTemplateKey: string;
  promptVersionLabel: string;
  instructions: string;
  input: string;
  fallbackText: string;
  temperature?: number;
};

export type AiGroundedTextResult = {
  providerKey: string;
  model: string;
  generatedAtUtc: string;
  text: string;
  promptTemplateKey: string;
  promptVersionLabel: string;
};

export interface AiInterpretationProvider {
  readonly key: string;
  readonly label: string;
  generateChartInterpretation(
    request: ChartInterpretationRequest
  ): Promise<ChartInterpretationResult>;
  generateGroundedText(
    request: AiGroundedTextRequest
  ): Promise<AiGroundedTextResult>;
}

export type AiInterpretationProviderFactory = () => AiInterpretationProvider;
