import "server-only";

import {
  getAiInterpretationService,
  type AiInterpretationService,
} from "@/modules/ai/service";
import type { AiProviderKey } from "@/modules/ai/provider-registry";
import type {
  AiTaskInput,
  AiTaskRunResult,
  ChartExplanationTaskResult,
  UnsupportedAiTaskResult,
} from "@/modules/ai/tasks";

export interface AiOrchestrationService {
  readonly providerKey: AiProviderKey;
  runTask(input: AiTaskInput): Promise<AiTaskRunResult>;
}

function createUnsupportedResult(
  input: Exclude<AiTaskInput, { kind: "CHART_EXPLANATION" }>
): UnsupportedAiTaskResult {
  return {
    kind: input.kind,
    output: null,
    status: "not-implemented",
    message:
      "This AI task contract is registered for orchestration, but execution is intentionally deferred for a later phase.",
  };
}

function createChartTaskResult(
  output: Awaited<ReturnType<AiInterpretationService["generateChartInterpretation"]>>
): ChartExplanationTaskResult {
  return {
    kind: "CHART_EXPLANATION",
    output,
  };
}

export function createAiOrchestrationService(
  providerKey?: AiProviderKey
): AiOrchestrationService {
  const interpretationService = getAiInterpretationService(providerKey);

  return {
    providerKey: interpretationService.providerKey,
    async runTask(input) {
      if (input.kind === "CHART_EXPLANATION") {
        return createChartTaskResult(
          await interpretationService.generateChartInterpretation(input.request)
        );
      }

      return createUnsupportedResult(input);
    },
  };
}

export function getAiOrchestrationService(providerKey?: AiProviderKey) {
  return createAiOrchestrationService(providerKey);
}
