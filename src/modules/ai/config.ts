import type { AiProviderKey } from "@/modules/ai/provider-registry";

const aiProviderDefaults = {
  defaultProvider: "mock-curated",
  modelByProvider: {
    "mock-curated": "curated-template",
    "openai-responses": "gpt-4.1-mini",
  },
} as const satisfies {
  defaultProvider: AiProviderKey;
  modelByProvider: Record<AiProviderKey, string>;
};

const aiProviderKeys = ["mock-curated", "openai-responses"] as const satisfies readonly AiProviderKey[];

function isAiProviderKey(value: string): value is AiProviderKey {
  return (aiProviderKeys as readonly string[]).includes(value);
}

export type AiRuntimeConfig = {
  defaultProvider: AiProviderKey;
  modelByProvider: Record<AiProviderKey, string>;
  usageLoggingEnabled: boolean;
};

function canUseOpenAiProvider(env: NodeJS.ProcessEnv) {
  return Boolean(env.OPENAI_API_KEY?.trim() && env.OPENAI_MODEL?.trim());
}

export function resolveAiProviderKey(
  env: NodeJS.ProcessEnv = process.env
): AiProviderKey {
  const configuredProvider = env.AI_PROVIDER?.trim();

  if (configuredProvider && isAiProviderKey(configuredProvider)) {
    if (configuredProvider === "openai-responses" && !canUseOpenAiProvider(env)) {
      return aiProviderDefaults.defaultProvider;
    }

    return configuredProvider;
  }

  return aiProviderDefaults.defaultProvider;
}

export function getAiRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env
): AiRuntimeConfig {
  return {
    defaultProvider: resolveAiProviderKey(env),
    modelByProvider: {
      ...aiProviderDefaults.modelByProvider,
      "openai-responses":
        env.OPENAI_MODEL?.trim() ||
        aiProviderDefaults.modelByProvider["openai-responses"],
    },
    usageLoggingEnabled: env.AI_USAGE_LOGGING === "true",
  };
}
