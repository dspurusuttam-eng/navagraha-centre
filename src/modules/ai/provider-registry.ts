import type {
  AiInterpretationProvider,
  AiInterpretationProviderFactory,
} from "@/modules/ai/provider";
import { MockInterpretationProvider } from "@/modules/ai/providers/mock-interpretation-provider";
import { OpenAIInterpretationProvider } from "@/modules/ai/providers/openai-interpretation-provider";

const providerFactories = {
  "mock-curated": () => new MockInterpretationProvider(),
  "openai-responses": () => new OpenAIInterpretationProvider(),
} as const satisfies Record<string, AiInterpretationProviderFactory>;

export type AiProviderKey = keyof typeof providerFactories;

export function isAiProviderKey(value: string): value is AiProviderKey {
  return Object.prototype.hasOwnProperty.call(providerFactories, value);
}

export function listRegisteredAiProviderKeys() {
  return Object.keys(providerFactories) as AiProviderKey[];
}

export function createAiProvider(providerKey: AiProviderKey): AiInterpretationProvider {
  return providerFactories[providerKey]();
}
