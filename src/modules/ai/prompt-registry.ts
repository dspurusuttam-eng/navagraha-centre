import { defaultChartInterpretationPromptTemplate } from "@/modules/ai/prompts";
import type { AiTaskKind } from "@/modules/ai/tasks";

export type PromptTemplateVersionRecord = {
  version: number;
  label: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  releaseNotes: string;
};

export type PromptTemplateRecord = {
  key: string;
  taskKind: AiTaskKind;
  title: string;
  description: string;
  defaultVersion: PromptTemplateVersionRecord;
};

const promptTemplateRegistry = [
  {
    key: defaultChartInterpretationPromptTemplate.key,
    taskKind: "CHART_EXPLANATION",
    title: defaultChartInterpretationPromptTemplate.title,
    description: defaultChartInterpretationPromptTemplate.description,
    defaultVersion: {
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt: defaultChartInterpretationPromptTemplate.systemPrompt,
      userPrompt: defaultChartInterpretationPromptTemplate.userPrompt,
      releaseNotes: defaultChartInterpretationPromptTemplate.releaseNotes,
    },
  },
  {
    key: "transit-explanation",
    taskKind: "TRANSIT_EXPLANATION",
    title: "Transit Explanation",
    description:
      "Template scaffold for explaining deterministic transit snapshots.",
    defaultVersion: {
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt:
        "Explain only supplied transit data. Do not calculate chart math or make deterministic claims.",
      userPrompt:
        "Summarize the transit snapshot in premium, calm language with one caution paragraph.",
      releaseNotes:
        "Initial scaffold for transit narratives with deterministic boundaries.",
    },
  },
  {
    key: "remedy-explanation",
    taskKind: "REMEDY_EXPLANATION",
    title: "Remedy Explanation",
    description: "Template scaffold for approved remedy rationale explanations.",
    defaultVersion: {
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt:
        "Use only approved remedy records. Do not invent remedies, outcomes, or fear-based claims.",
      userPrompt:
        "Explain why approved remedies align with supplied chart signals in calm language.",
      releaseNotes:
        "Initial scaffold for remedy rationale while enforcing approved-record boundaries.",
    },
  },
  {
    key: "consultation-brief-generation",
    taskKind: "CONSULTATION_BRIEF_GENERATION",
    title: "Consultation Brief Generation",
    description:
      "Template scaffold for internal consultation preparation summaries.",
    defaultVersion: {
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt:
        "Summarize consultation context with humility and professional tone. No chart math generation.",
      userPrompt:
        "Generate a concise brief with agenda points for Joy Prakash Sarmah's manual consultation workflow.",
      releaseNotes:
        "Initial scaffold for internal consultation briefing support.",
    },
  },
  {
    key: "content-draft-generation",
    taskKind: "CONTENT_DRAFT_GENERATION",
    title: "Content Draft Generation",
    description:
      "Template scaffold for editorial-first draft support with human review.",
    defaultVersion: {
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt:
        "Draft premium spiritual content with transparent tone. No guaranteed outcomes or fear language.",
      userPrompt:
        "Draft structured content from supplied outline and keywords, ready for reviewer approval.",
      releaseNotes:
        "Initial scaffold for AI-assisted editorial drafts without auto-publishing.",
    },
  },
  {
    key: "ask-my-chart-copilot",
    taskKind: "CHART_EXPLANATION",
    title: "Ask My Chart Copilot",
    description:
      "Grounded chart-aware copilot prompt for authenticated member conversations.",
    defaultVersion: {
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt:
        "You are the NAVAGRAHA CENTRE Ask My Chart copilot. Answer only from supplied grounded tool results and chart facts. Never calculate chart math, invent remedies, make medical/legal/financial claims, or use fear-based language. If the question is outside grounded chart context, refuse gently and redirect toward consultation.",
      userPrompt:
        "Respond in 2 to 4 calm premium paragraphs. Use only supplied tool context. If transit context is missing, say so plainly.",
      releaseNotes:
        "Initial grounded assistant prompt for authenticated chart-aware member conversations.",
    },
  },
  {
    key: "astrologer-copilot-brief",
    taskKind: "CONSULTATION_BRIEF_GENERATION",
    title: "Astrologer Copilot Brief",
    description:
      "Grounded internal consultation brief prompt for Joy Prakash Sarmah and admin astrologer workflows.",
    defaultVersion: {
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt:
        "You are the NAVAGRAHA CENTRE Astrologer Copilot. Work only with supplied grounded chart and remedy intelligence context. Do not calculate chart math, invent remedies, use fear-based language, or make medical/legal/financial claims. Keep authority with the astrologer and clearly mark low-confidence or sensitive items for expert judgement.",
      userPrompt:
        "Return plain text with labels in this order: HEADLINE, FOCUS_FIRST, QUESTIONS, AVOID_OVERSTATING, FOLLOW_UP_DRAFT, RECAP_DRAFT, ASTROLOGER_NOTES_DRAFT.",
      releaseNotes:
        "Initial internal astrologer-assistance prompt for grounded pre-consultation and recap drafting.",
    },
  },
] as const satisfies readonly PromptTemplateRecord[];

export function listPromptTemplates() {
  return [...promptTemplateRegistry];
}

export function getPromptTemplateByKey(key: string) {
  return promptTemplateRegistry.find((template) => template.key === key) ?? null;
}

export function getPromptTemplateByTaskKind(taskKind: AiTaskKind) {
  return promptTemplateRegistry.find((template) => template.taskKind === taskKind) ?? null;
}
