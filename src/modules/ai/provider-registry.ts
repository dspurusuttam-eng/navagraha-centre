import type {
  AiInterpretationProvider,
  AiInterpretationProviderFactory,
} from "@/modules/ai/provider";
import { MockInterpretationProvider } from "@/modules/ai/providers/mock-interpretation-provider";
import { OpenAIInterpretationProvider } from "@/modules/ai/providers/openai-interpretation-provider";

export const aiProviderKeys = [
  "mock-curated",
  "openai-responses",
] as const;

export type AiProviderKey = (typeof aiProviderKeys)[number];

const providerFactories = {
  "mock-curated": () => new MockInterpretationProvider(),
  "openai-responses": () => new OpenAIInterpretationProvider(),
} as const satisfies Record<AiProviderKey, AiInterpretationProviderFactory>;

export function isAiProviderKey(value: string): value is AiProviderKey {
  return (aiProviderKeys as readonly string[]).includes(value);
}

export function listRegisteredAiProviderKeys() {
  return [...aiProviderKeys];
}

export function createAiProvider(providerKey: AiProviderKey): AiInterpretationProvider {
  return providerFactories[providerKey]();
}
