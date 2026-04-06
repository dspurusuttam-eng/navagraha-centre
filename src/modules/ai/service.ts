import "server-only";

import { unstable_cache } from "next/cache";
import { MockInterpretationProvider } from "@/modules/ai/providers/mock-interpretation-provider";
import { OpenAIInterpretationProvider } from "@/modules/ai/providers/openai-interpretation-provider";
import type {
  ChartInterpretationRequest,
  ChartInterpretationResult,
} from "@/modules/ai/types";

const providerFactories = {
  "mock-curated": () => new MockInterpretationProvider(),
  "openai-responses": () => new OpenAIInterpretationProvider(),
} as const;

export type AiProviderKey = keyof typeof providerFactories;

function isAiProviderKey(value: string): value is AiProviderKey {
  return Object.prototype.hasOwnProperty.call(providerFactories, value);
}

function canUseOpenAiProvider() {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);
}

export function getDefaultAiProviderKey(): AiProviderKey {
  const configuredProvider = process.env.AI_PROVIDER;

  if (configuredProvider && isAiProviderKey(configuredProvider)) {
    if (configuredProvider === "openai-responses" && !canUseOpenAiProvider()) {
      return "mock-curated";
    }

    return configuredProvider;
  }

  return "mock-curated";
}

const getCachedInterpretation = unstable_cache(
  async (
    providerKey: AiProviderKey,
    cacheKey: string,
    serializedRequest: string
  ): Promise<ChartInterpretationResult> => {
    void cacheKey;
    const provider = providerFactories[providerKey]();
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

export interface AiInterpretationService {
  readonly providerKey: AiProviderKey;
  generateChartInterpretation(
    request: ChartInterpretationRequest
  ): Promise<ChartInterpretationResult>;
}

export function createAiInterpretationService(
  providerKey: AiProviderKey
): AiInterpretationService {
  return {
    providerKey,
    async generateChartInterpretation(request) {
      try {
        return await getCachedInterpretation(
          providerKey,
          getCachePayload(request, providerKey),
          JSON.stringify(request)
        );
      } catch (error) {
        if (providerKey === "mock-curated") {
          throw error;
        }

        return providerFactories["mock-curated"]().generateChartInterpretation(
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
  return Object.keys(providerFactories) as AiProviderKey[];
}
