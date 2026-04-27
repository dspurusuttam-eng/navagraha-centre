import "server-only";

import { unstable_cache } from "next/cache";
import { resolveAiProviderKey } from "@/modules/ai/config";
import { createFallbackInterpretation } from "@/modules/ai/prompts";
import { assessChartInterpretationPolicy } from "@/modules/ai/policy";
import {
  logAccuracyEvent,
  resolvePredictionLocale,
  validateChartInterpretationOutput,
} from "@/lib/astrology/accuracy";
import {
  createAiProvider,
  isAiProviderKey,
  listRegisteredAiProviderKeys,
  type AiProviderKey,
} from "@/modules/ai/provider-registry";
import { normalizeChartInterpretationResult } from "@/modules/ai/response-normalization";
import type {
  ChartInterpretationRequest,
  ChartInterpretationResult,
} from "@/modules/ai/types";
import { getAiUsageLogHook } from "@/modules/ai/usage-logging";

export type { AiProviderKey };

const getCachedInterpretation = unstable_cache(
  async (
    providerKey: AiProviderKey,
    cacheKey: string,
    serializedRequest: string
  ): Promise<ChartInterpretationResult> => {
    void cacheKey;
    const provider = createAiProvider(providerKey);
    const request = JSON.parse(serializedRequest) as ChartInterpretationRequest;

    return provider.generateChartInterpretation(request);
  },
  ["report", "ai-interpretation"],
  { tags: ["report", "ai"] }
);

function getCachePayload(
  request: ChartInterpretationRequest,
  providerKey: AiProviderKey
) {
  return JSON.stringify({
    providerKey,
    reportId: request.reportId,
    preferredLanguageLabel: request.preferredLanguageLabel,
    chartMetadata: request.chart.metadata,
    ascendantSign: request.chart.ascendantSign,
    dominantBodies: request.chart.summary.dominantBodies,
    signals: request.signals,
  });
}

async function generateWithProviderFallback(
  providerKey: AiProviderKey,
  cacheKey: string,
  request: ChartInterpretationRequest
) {
  try {
    return await getCachedInterpretation(
      providerKey,
      cacheKey,
      JSON.stringify(request)
    );
  } catch (error) {
    if (providerKey === "mock-curated") {
      throw error;
    }

    return createAiProvider("mock-curated").generateChartInterpretation(request);
  }
}

export interface AiInterpretationService {
  readonly providerKey: AiProviderKey;
  generateChartInterpretation(
    request: ChartInterpretationRequest
  ): Promise<ChartInterpretationResult>;
}

export function createAiInterpretationService(
  providerKey: AiProviderKey
): AiInterpretationService {
  const usageLogHook = getAiUsageLogHook();

  return {
    providerKey,
    async generateChartInterpretation(request) {
      const runId = crypto.randomUUID();
      const cacheKey = getCachePayload(request, providerKey);
      const startedAtUtc = new Date().toISOString();

      await usageLogHook.onTaskStart({
        runId,
        taskKind: "CHART_EXPLANATION",
        providerKey,
        startedAtUtc,
        cacheKey,
      });

      try {
        const result = await generateWithProviderFallback(
          providerKey,
          cacheKey,
          request
        );
        const normalizedResult = normalizeChartInterpretationResult(result);
        const outputLocale = resolvePredictionLocale(request.preferredLanguageLabel);
        const policyAssessment = assessChartInterpretationPolicy(
          request,
          normalizedResult
        );
        const policySafeResult = policyAssessment.passed
          ? normalizedResult
          : normalizeChartInterpretationResult(
              createFallbackInterpretation(request, "mock-curated")
            );
        const outputValidation = validateChartInterpretationOutput({
          output: policySafeResult,
          locale: outputLocale,
        });
        const safeResult = outputValidation.valid
          ? policySafeResult
          : normalizeChartInterpretationResult(
              createFallbackInterpretation(request, "mock-curated")
            );

        if (!outputValidation.valid) {
          logAccuracyEvent("report-output-validation-failed", {
            reportId: request.reportId,
            locale: outputLocale,
            issueCount: outputValidation.issues.length,
            highSeverityIssueCount: outputValidation.issues.filter(
              (item) => item.severity === "high"
            ).length,
          });
        }

        const loggedProviderKey = isAiProviderKey(safeResult.providerKey)
          ? safeResult.providerKey
          : providerKey;

        await usageLogHook.onTaskSuccess({
          runId,
          taskKind: "CHART_EXPLANATION",
          providerKey: loggedProviderKey,
          model: safeResult.model,
          startedAtUtc,
          completedAtUtc: new Date().toISOString(),
          cacheKey,
          policyViolations: policyAssessment.violations,
        });

        return safeResult;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown AI interpretation failure.";

        await usageLogHook.onTaskError({
          runId,
          taskKind: "CHART_EXPLANATION",
          providerKey,
          startedAtUtc,
          failedAtUtc: new Date().toISOString(),
          cacheKey,
          error: message,
        });

        if (providerKey === "mock-curated") {
          throw error;
        }

        return createAiProvider("mock-curated").generateChartInterpretation(
          request
        );
      }
    },
  };
}

export function getAiInterpretationService(
  providerKey: AiProviderKey = getDefaultAiProviderKey()
) {
  return createAiInterpretationService(providerKey);
}

export function listAvailableAiProviders() {
  return listRegisteredAiProviderKeys();
}

export function getDefaultAiProviderKey(): AiProviderKey {
  return resolveAiProviderKey();
}
