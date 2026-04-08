import "server-only";

import { resolveAiProviderKey } from "@/modules/ai/config";
import { assessAiTextPolicy } from "@/modules/ai/policy";
import {
  createAiProvider,
  listRegisteredAiProviderKeys,
  type AiProviderKey,
} from "@/modules/ai/provider-registry";
import type {
  AiGroundedTextRequest,
  AiGroundedTextResult,
} from "@/modules/ai/provider";
import { getAiUsageLogHook } from "@/modules/ai/usage-logging";

function normalizeGroundedTextResult(
  result: AiGroundedTextResult
): AiGroundedTextResult {
  return {
    ...result,
    generatedAtUtc: new Date(result.generatedAtUtc).toISOString(),
    text: result.text.trim().replace(/\n{3,}/g, "\n\n"),
  };
}

export interface AiGroundedTextService {
  readonly providerKey: AiProviderKey;
  generateReply(request: AiGroundedTextRequest): Promise<AiGroundedTextResult>;
}

export function createAiGroundedTextService(
  providerKey: AiProviderKey
): AiGroundedTextService {
  const usageLogHook = getAiUsageLogHook();

  return {
    providerKey,
    async generateReply(request) {
      const runId = crypto.randomUUID();
      const startedAtUtc = new Date().toISOString();
      const cacheKey = JSON.stringify({
        providerKey,
        taskKind: request.taskKind,
        promptTemplateKey: request.promptTemplateKey,
      });

      await usageLogHook.onTaskStart({
        runId,
        taskKind: request.taskKind,
        providerKey,
        startedAtUtc,
        cacheKey,
      });

      try {
        const provider = createAiProvider(providerKey);
        const result = normalizeGroundedTextResult(
          await provider.generateGroundedText(request)
        );
        const policyAssessment = assessAiTextPolicy(result.text);
        const safeResult = policyAssessment.passed
          ? result
          : normalizeGroundedTextResult({
              providerKey: "mock-curated",
              model: "curated-template",
              generatedAtUtc: new Date().toISOString(),
              text: request.fallbackText,
              promptTemplateKey: request.promptTemplateKey,
              promptVersionLabel: request.promptVersionLabel,
            });

        await usageLogHook.onTaskSuccess({
          runId,
          taskKind: request.taskKind,
          providerKey,
          model: safeResult.model,
          startedAtUtc,
          completedAtUtc: new Date().toISOString(),
          cacheKey,
          policyViolations: policyAssessment.violations,
        });

        return safeResult;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown grounded AI error.";

        await usageLogHook.onTaskError({
          runId,
          taskKind: request.taskKind,
          providerKey,
          startedAtUtc,
          failedAtUtc: new Date().toISOString(),
          cacheKey,
          error: message,
        });

        if (providerKey === "mock-curated") {
          throw error;
        }

        return normalizeGroundedTextResult(
          await createAiProvider("mock-curated").generateGroundedText(request)
        );
      }
    },
  };
}

export function getAiGroundedTextService(
  providerKey: AiProviderKey = resolveAiProviderKey()
) {
  return createAiGroundedTextService(providerKey);
}

export function listAvailableGroundedTextProviders() {
  return listRegisteredAiProviderKeys();
}
