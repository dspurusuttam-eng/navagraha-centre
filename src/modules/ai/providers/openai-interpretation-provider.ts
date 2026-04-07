import OpenAI from "openai";
import { resolveAiModelConfig } from "@/modules/ai/model-config";
import { resolvePromptVersionByTemplateKey } from "@/modules/ai/prompt-versioning";
import type { AiInterpretationProvider } from "@/modules/ai/provider";
import {
  buildChartInterpretationPrompt,
  parseChartInterpretationText,
} from "@/modules/ai/prompts";
import type { ChartInterpretationRequest } from "@/modules/ai/types";

function getApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Switch AI_PROVIDER back to mock-curated or add a key."
    );
  }

  return apiKey;
}

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: getApiKey(),
    });
  }

  return client;
}

export class OpenAIInterpretationProvider implements AiInterpretationProvider {
  readonly key = "openai-responses";
  readonly label = "OpenAI Responses";

  async generateChartInterpretation(request: ChartInterpretationRequest) {
    const promptVersion = await resolvePromptVersionByTemplateKey(
      "chart-report-interpretation"
    );
    const prompt = buildChartInterpretationPrompt(request, {
      systemPrompt: promptVersion.systemPrompt,
      userPrompt: promptVersion.userPrompt,
    });
    const model = resolveAiModelConfig(this.key).model;

    const response = await getClient().responses.create({
      model,
      instructions: prompt.instructions,
      input: prompt.input,
      store: false,
    });
    const outputText = response.output_text?.trim();

    if (!outputText) {
      throw new Error(
        "OpenAI returned an empty interpretation payload for the chart report."
      );
    }

    const parsed = parseChartInterpretationText(
      outputText,
      request,
      this.key,
      response.model ?? model
    );

    return {
      ...parsed,
      promptTemplateKey: promptVersion.templateKey,
      promptVersionLabel: promptVersion.label,
    };
  }
}
