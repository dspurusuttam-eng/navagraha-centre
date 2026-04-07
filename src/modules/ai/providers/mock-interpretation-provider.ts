import type { AiInterpretationProvider } from "@/modules/ai/provider";
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
}
