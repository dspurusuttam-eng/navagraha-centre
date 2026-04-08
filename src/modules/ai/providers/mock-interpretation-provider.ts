import type {
  AiGroundedTextRequest,
  AiInterpretationProvider,
} from "@/modules/ai/provider";
import { createFallbackInterpretation } from "@/modules/ai/prompts";
import type { ChartInterpretationRequest } from "@/modules/ai/types";

export class MockInterpretationProvider implements AiInterpretationProvider {
  readonly key = "mock-curated";
  readonly label = "Curated Mock Interpretation";

  async generateChartInterpretation(request: ChartInterpretationRequest) {
    return {
      ...createFallbackInterpretation(request, this.key, "curated-template"),
      promptTemplateKey: "chart-report-interpretation",
      promptVersionLabel: "v1",
    };
  }

  async generateGroundedText(request: AiGroundedTextRequest) {
    return {
      providerKey: this.key,
      model: "curated-template",
      generatedAtUtc: new Date().toISOString(),
      text: request.fallbackText,
      promptTemplateKey: request.promptTemplateKey,
      promptVersionLabel: request.promptVersionLabel,
    };
  }
}
