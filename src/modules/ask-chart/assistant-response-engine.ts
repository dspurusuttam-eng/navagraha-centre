import "server-only";

import {
  buildPredictionPrompt,
  resolvePredictionLocale,
  validateAssistantStructuredOutput,
} from "@/lib/astrology/accuracy";
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
  preferredLocaleCode?: string | null;
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

function createPromptBundle(input: AstrologyAssistantEngineInput, stricter: boolean) {
  const locale = resolvePredictionLocale(
    input.preferredLocaleCode ?? input.preferredLanguageLabel
  );

  return buildPredictionPrompt({
    toolType: "NAVAGRAHA_CHAT",
    locale,
    baseSystemPrompt: "",
    planInstruction: buildPlanScopedInstructions(input.planType),
    preferredLanguageLabel: input.preferredLanguageLabel,
    astrologyDataSummary: {
      userName: input.userName,
      planType: input.planType,
      userQuestion: input.question,
      groundedScope: input.groundedScope,
      chartContext: input.chartContext,
      toolContext: input.toolContext,
    },
    missingDataWarnings: input.chartContext.warnings,
    outputFormatRequirements: [
      "Return only valid JSON. No markdown.",
      'JSON schema: {"answer":"string","reasoning":"string","confidence":"high|medium|low"}.',
      "Use confidence=high only when chart verification is VERIFIED and context is specific.",
      "Use confidence=medium when context is partial or generalized.",
      "Use confidence=low when context is weak or uncertain.",
      "Keep answer and reasoning grounded strictly to supplied chart context and tools.",
    ],
    extraDirectives: stricter
      ? [
          "Strict retry mode: remove any certainty language and keep caution-forward phrasing.",
          "Strict retry mode: avoid product or purchase pressure in any remedy mention.",
        ]
      : undefined,
  });
}

export async function generateAstrologyResponse(
  input: AstrologyAssistantEngineInput
): Promise<AstrologyAssistantEngineResult> {
  const promptVersion = await resolvePromptVersionByTemplateKey(
    "ask-my-chart-copilot"
  );
  const groundedTextService = getAiGroundedTextService();
  const fallbackText = JSON.stringify(input.fallback);
  const locale = resolvePredictionLocale(
    input.preferredLocaleCode ?? input.preferredLanguageLabel
  );

  const runGeneration = async (stricter: boolean) => {
    const promptBundle = createPromptBundle(input, stricter);

    return groundedTextService.generateReply({
      taskKind: input.taskKind,
      promptTemplateKey: promptVersion.templateKey,
      promptVersionLabel: promptVersion.label,
      instructions: [
        buildStructuredPromptInstructions(promptVersion.systemPrompt),
        promptBundle.instructions,
      ].join("\n"),
      input: promptBundle.input,
      fallbackText,
      temperature: getPlanTemperature(input.planType),
    });
  };

  let response = await runGeneration(false);
  let structured = parseStructuredResponse(response.text, input.fallback);
  let validation = validateAssistantStructuredOutput({
    output: structured,
    locale,
  });

  if (!validation.valid) {
    response = await runGeneration(true);
    structured = parseStructuredResponse(response.text, input.fallback);
    validation = validateAssistantStructuredOutput({
      output: structured,
      locale,
    });

    if (!validation.valid) {
      structured = input.fallback;
    }
  }

  return {
    structured,
    providerKey: response.providerKey,
    model: response.model,
    promptTemplateKey: response.promptTemplateKey,
    promptVersionLabel: response.promptVersionLabel,
    rawText: response.text,
  };
}
