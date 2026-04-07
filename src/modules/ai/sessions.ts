import type { AiProviderKey } from "@/modules/ai/provider-registry";
import type { AiTaskKind } from "@/modules/ai/tasks";

export const aiConversationStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type AiConversationStatus = (typeof aiConversationStatuses)[number];

export const aiMessageRoles = ["SYSTEM", "USER", "ASSISTANT", "TOOL"] as const;
export type AiMessageRole = (typeof aiMessageRoles)[number];

export const aiTaskRunStatuses = [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
] as const;
export type AiTaskRunStatus = (typeof aiTaskRunStatuses)[number];

export type AiConversationSessionRecord = {
  id: string;
  userId: string | null;
  title: string | null;
  channelKey: string;
  status: AiConversationStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  archivedAtUtc: string | null;
};

export type AiConversationMessageRecord = {
  id: string;
  sessionId: string;
  role: AiMessageRole;
  content: string;
  toolName: string | null;
  model: string | null;
  providerKey: AiProviderKey | null;
  createdAtUtc: string;
};

export type AiTaskRunRecord = {
  id: string;
  sessionId: string | null;
  userId: string | null;
  taskKind: AiTaskKind;
  status: AiTaskRunStatus;
  providerKey: AiProviderKey;
  model: string | null;
  promptTemplateKey: string | null;
  promptVersionId: string | null;
  promptVersionLabel: string | null;
  inputHash: string | null;
  startedAtUtc: string;
  completedAtUtc: string | null;
  errorMessage: string | null;
};

export interface AiSessionRepository {
  createSession(input: {
    userId: string | null;
    title?: string | null;
    channelKey?: string;
  }): Promise<AiConversationSessionRecord>;
  appendMessage(input: {
    sessionId: string;
    role: AiMessageRole;
    content: string;
    toolName?: string | null;
    model?: string | null;
    providerKey?: AiProviderKey | null;
  }): Promise<AiConversationMessageRecord>;
  listMessages(sessionId: string): Promise<AiConversationMessageRecord[]>;
  createTaskRun(input: {
    sessionId?: string | null;
    userId?: string | null;
    taskKind: AiTaskKind;
    status: AiTaskRunStatus;
    providerKey: AiProviderKey;
    model?: string | null;
    promptTemplateKey?: string | null;
    promptVersionId?: string | null;
    promptVersionLabel?: string | null;
    inputHash?: string | null;
    errorMessage?: string | null;
    completedAtUtc?: string | null;
  }): Promise<AiTaskRunRecord>;
}
