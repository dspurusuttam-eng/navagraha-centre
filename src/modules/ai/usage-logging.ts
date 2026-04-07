import type { AiPolicyViolation } from "@/modules/ai/policy";
import type { AiProviderKey } from "@/modules/ai/provider-registry";
import type { AiTaskKind } from "@/modules/ai/tasks";

export type AiUsageTaskStartEvent = {
  runId: string;
  taskKind: AiTaskKind;
  providerKey: AiProviderKey;
  startedAtUtc: string;
  cacheKey: string;
};

export type AiUsageTaskSuccessEvent = {
  runId: string;
  taskKind: AiTaskKind;
  providerKey: AiProviderKey;
  model: string;
  startedAtUtc: string;
  completedAtUtc: string;
  cacheKey: string;
  policyViolations: AiPolicyViolation[];
};

export type AiUsageTaskErrorEvent = {
  runId: string;
  taskKind: AiTaskKind;
  providerKey: AiProviderKey;
  startedAtUtc: string;
  failedAtUtc: string;
  cacheKey: string;
  error: string;
};

export interface AiUsageLogHook {
  onTaskStart(event: AiUsageTaskStartEvent): void | Promise<void>;
  onTaskSuccess(event: AiUsageTaskSuccessEvent): void | Promise<void>;
  onTaskError(event: AiUsageTaskErrorEvent): void | Promise<void>;
}

const noopUsageLogHook: AiUsageLogHook = {
  onTaskStart() {},
  onTaskSuccess() {},
  onTaskError() {},
};

const consoleUsageLogHook: AiUsageLogHook = {
  onTaskStart(event) {
    console.info("[ai-usage:start]", event);
  },
  onTaskSuccess(event) {
    console.info("[ai-usage:success]", event);
  },
  onTaskError(event) {
    console.error("[ai-usage:error]", event);
  },
};

export function getAiUsageLogHook(
  env: NodeJS.ProcessEnv = process.env
): AiUsageLogHook {
  return env.AI_USAGE_LOGGING === "true" ? consoleUsageLogHook : noopUsageLogHook;
}
