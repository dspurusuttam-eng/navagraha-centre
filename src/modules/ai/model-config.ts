import { getAiRuntimeConfig } from "@/modules/ai/config";
import type { AiProviderKey } from "@/modules/ai/provider-registry";

export type AiModelConfig = {
  providerKey: AiProviderKey;
  model: string;
  source: "runtime-config";
};

export function resolveAiModelConfig(
  providerKey: AiProviderKey,
  env: NodeJS.ProcessEnv = process.env
): AiModelConfig {
  const runtimeConfig = getAiRuntimeConfig(env);

  return {
    providerKey,
    model: runtimeConfig.modelByProvider[providerKey],
    source: "runtime-config",
  };
}
