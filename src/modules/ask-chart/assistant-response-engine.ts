import "server-only";

import { getAiGroundedTextService } from "@/modules/ai/server";
import { resolvePromptVersionByTemplateKey } from "@/modules/ai/prompt-versioning";
import type { AiTaskKind } from "@/modules/ai/tasks";
import type {
  AstrologyAssistantConfidence,
  ChartAiContext,
} from "@/modules/ask-chart/chart-context-mapper";

export type AstrologyAssistantStructuredResponse = {
  answer: string;
  reasoning: string;
  confidence: AstrologyAssistantConfidence;
};

export type AstrologyAssistantEngineInput = {
  question: string;
  userName: string;
  preferredLanguageLabel: string;
  planType: "FREE" | "PREMIUM" | "PRO";
  groundedScope: string;
  taskKind: AiTaskKind;
  chartContext: ChartAiContext;
  toolContext: unknown;
  fallback: AstrologyAssistantStructuredResponse;
};

export type AstrologyAssistantEngineResult = {
  structured: AstrologyAssistantStructuredResponse;
  providerKey: string;
  model: string | null;
  promptTemplateKey: string;
  promptVersionLabel: string;
  rawText: string;
};

function normalizeConfidence(
  value: unknown,
  fallback: AstrologyAssistantConfidence
): AstrologyAssistantConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return fallback;
}

function normalizeText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().replace(/\n{3,}/g, "\n\n");

  return normalized || fallback;
}

function stripFence(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  return fenced?.[1]?.trim() ?? value.trim();
}

function parseStructuredResponse(
  value: string,
  fallback: AstrologyAssistantStructuredResponse
): AstrologyAssistantStructuredResponse {
  const normalized = stripFence(value);

  try {
    const parsed = JSON.parse(normalized) as Partial<AstrologyAssistantStructuredResponse>;

    return {
      answer: normalizeText(parsed.answer, fallback.answer),
      reasoning: normalizeText(parsed.reasoning, fallback.reasoning),
      confidence: normalizeConfidence(parsed.confidence, fallback.confidence),
    };
  } catch {
    const [first, second] = normalized
      .split(/\n{2,}/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    return {
      answer: first ?? fallback.answer,
      reasoning: second ?? fallback.reasoning,
      confidence: fallback.confidence,
    };
  }
}

function buildStructuredPromptInstructions(baseSystemPrompt: string) {
  return [
    baseSystemPrompt,
    "Return only valid JSON. No markdown.",
    'JSON schema: {"answer":"string","reasoning":"string","confidence":"high|medium|low"}.',
    "Use confidence=high only when chart verification is VERIFIED and context is specific.",
    "Use confidence=medium when context is partial or generalized.",
    "Use confidence=low when context is weak or uncertain.",
    "Keep answer and reasoning grounded strictly to supplied chart context and tools.",
  ].join("\n");
}

function buildPlanScopedInstructions(planType: AstrologyAssistantEngineInput["planType"]) {
  if (planType === "PRO") {
    return [
      "Deliver deeper multi-house synthesis when context supports it.",
      "You may include forward-looking timing framing, but avoid certainty language.",
      "Include basic grounded remedy direction when approved remedy context exists.",
    ].join("\n");
  }

  if (planType === "PREMIUM") {
    return [
      "Deliver deeper chart reasoning than free tier with practical context.",
      "Use multi-house analysis where relevant and available.",
      "Include basic grounded remedy direction when approved remedy context exists.",
    ].join("\n");
  }

  return [
    "Free-tier response: keep concise and clear.",
    "Use short grounded answer with compact reasoning.",
    "Do not include long-range predictive detail in free-tier mode.",
  ].join("\n");
}

function getPlanTemperature(planType: AstrologyAssistantEngineInput["planType"]) {
  if (planType === "PRO") {
    return 0.1;
  }

  if (planType === "PREMIUM") {
    return 0.15;
  }

  return 0.1;
}

export async function generateAstrologyResponse(
  input: AstrologyAssistantEngineInput
): Promise<AstrologyAssistantEngineResult> {
  const promptVersion = await resolvePromptVersionByTemplateKey(
    "ask-my-chart-copilot"
  );
  const groundedTextService = getAiGroundedTextService();
  const fallbackText = JSON.stringify(input.fallback);

  const response = await groundedTextService.generateReply({
    taskKind: input.taskKind,
    promptTemplateKey: promptVersion.templateKey,
    promptVersionLabel: promptVersion.label,
    instructions: [
      buildStructuredPromptInstructions(promptVersion.systemPrompt),
      buildPlanScopedInstructions(input.planType),
    ].join("\n"),
    input: JSON.stringify(
      {
        userName: input.userName,
        preferredLanguage: input.preferredLanguageLabel,
        planType: input.planType,
        userQuestion: input.question,
        groundedScope: input.groundedScope,
        chartContext: input.chartContext,
        toolContext: input.toolContext,
      },
      null,
      2
    ),
    fallbackText,
    temperature: getPlanTemperature(input.planType),
  });

  const structured = parseStructuredResponse(response.text, input.fallback);

  return {
    structured,
    providerKey: response.providerKey,
    model: response.model,
    promptTemplateKey: response.promptTemplateKey,
    promptVersionLabel: response.promptVersionLabel,
    rawText: response.text,
  };
}
