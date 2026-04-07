import "server-only";

import { getPrisma } from "@/lib/prisma";
import {
  getPromptTemplateByKey,
  getPromptTemplateByTaskKind,
} from "@/modules/ai/prompt-registry";
import type { AiTaskKind } from "@/modules/ai/tasks";

export type ResolvedPromptVersion = {
  templateKey: string;
  templateTitle: string;
  version: number;
  label: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  source: "database" | "registry";
};

function mapRegistryPromptVersion(templateKey: string): ResolvedPromptVersion {
  const template = getPromptTemplateByKey(templateKey);

  if (!template) {
    throw new Error(`Prompt template "${templateKey}" is not registered.`);
  }

  return {
    templateKey: template.key,
    templateTitle: template.title,
    version: template.defaultVersion.version,
    label: template.defaultVersion.label,
    model: template.defaultVersion.model,
    systemPrompt: template.defaultVersion.systemPrompt,
    userPrompt: template.defaultVersion.userPrompt,
    source: "registry",
  };
}

function mapRegistryPromptVersionByTask(taskKind: AiTaskKind): ResolvedPromptVersion {
  const template = getPromptTemplateByTaskKind(taskKind);

  if (!template) {
    throw new Error(`No prompt template registered for task kind "${taskKind}".`);
  }

  return mapRegistryPromptVersion(template.key);
}

export async function resolvePromptVersionByTemplateKey(templateKey: string) {
  try {
    const template = await getPrisma().aiPromptTemplate.findUnique({
      where: { key: templateKey },
      select: {
        key: true,
        title: true,
        activeVersion: {
          select: {
            version: true,
            label: true,
            model: true,
            systemPrompt: true,
            userPrompt: true,
          },
        },
      },
    });

    if (template?.activeVersion) {
      return {
        templateKey: template.key,
        templateTitle: template.title,
        version: template.activeVersion.version,
        label: template.activeVersion.label,
        model: template.activeVersion.model ?? "curated-template",
        systemPrompt: template.activeVersion.systemPrompt,
        userPrompt: template.activeVersion.userPrompt,
        source: "database" as const,
      };
    }
  } catch {
    return mapRegistryPromptVersion(templateKey);
  }

  return mapRegistryPromptVersion(templateKey);
}

export async function resolvePromptVersionByTaskKind(taskKind: AiTaskKind) {
  const registryFallback = mapRegistryPromptVersionByTask(taskKind);

  return resolvePromptVersionByTemplateKey(registryFallback.templateKey);
}
