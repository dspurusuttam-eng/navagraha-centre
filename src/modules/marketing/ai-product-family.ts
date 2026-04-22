export type AiProductFamilySurface = "public" | "protected";

export type AiProductFamilyItem = {
  key:
    | "ai-kundli-reading"
    | "ai-compatibility"
    | "ai-career-insights"
    | "ai-remedy-guidance"
    | "ask-my-chart";
  title: string;
  description: string;
  helpsWith: readonly string[];
  premiumDepth: string;
  trustNote: string;
  publicHref: string;
  protectedHref: string;
  ctaLabelPublic: string;
  ctaLabelProtected: string;
  relatedTools: readonly {
    label: string;
    href: string;
  }[];
};

const aiProductFamilyItems: readonly AiProductFamilyItem[] = [
  {
    key: "ai-kundli-reading",
    title: "AI Kundli Reading",
    description:
      "A chart-first AI layer that explains your core placements using verified chart context.",
    helpsWith: [
      "Lagna and house context clarity",
      "First reading summary before deeper interpretation layers",
    ],
    premiumDepth:
      "Currently free under limited launch access with deeper interpretation continuity.",
    trustNote:
      "Interpretation is chart-grounded guidance, not guaranteed life outcomes.",
    publicHref: "/kundli-ai",
    protectedHref: "/dashboard/chart",
    ctaLabelPublic: "Open AI Kundli Reading",
    ctaLabelProtected: "View Chart Reading",
    relatedTools: [
      { label: "Ask My Chart", href: "/dashboard/ask-my-chart" },
      { label: "Premium Reports", href: "/dashboard/report" },
    ],
  },
  {
    key: "ai-compatibility",
    title: "AI Compatibility",
    description:
      "Compatibility guidance with a calm structure for relationship questions and practical next steps.",
    helpsWith: [
      "Compatibility-focused context and prompt framing",
      "Pathway into consultation for nuanced review",
    ],
    premiumDepth:
      "Currently free under limited launch access with richer compatibility continuity.",
    trustNote:
      "Compatibility guidance supports reflection and communication, not certainty claims.",
    publicHref: "/marriage-compatibility",
    protectedHref: "/dashboard/consultations",
    ctaLabelPublic: "Explore Compatibility",
    ctaLabelProtected: "Open Compatibility Flow",
    relatedTools: [
      { label: "Book Free Consultation", href: "/consultation" },
      { label: "Ask My Chart", href: "/dashboard/ask-my-chart" },
    ],
  },
  {
    key: "ai-career-insights",
    title: "AI Career Insights",
    description:
      "Career-focused AI guidance tied to your chart context and report progression.",
    helpsWith: [
      "Priority and timing themes for career decisions",
      "Clear handoff into premium report depth",
    ],
    premiumDepth:
      "Currently free under limited launch access with deeper report context and reasoning.",
    trustNote:
      "Career guidance is reflective support and should be paired with practical planning.",
    publicHref: "/career-prediction",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "Open Career Insights",
    ctaLabelProtected: "Open Career Report Layer",
    relatedTools: [
      { label: "Career Report", href: "/career-report" },
      { label: "Ask My Chart", href: "/dashboard/ask-my-chart" },
    ],
  },
  {
    key: "ai-remedy-guidance",
    title: "AI Remedies Guidance",
    description:
      "Remedy suggestions are presented with safety boundaries and optional purchase framing.",
    helpsWith: [
      "Contextual remedy recommendations tied to chart signals",
      "Follow-up path to consultation or curated shop records",
    ],
    premiumDepth:
      "Currently free under limited launch access with deeper rationale and continuity.",
    trustNote:
      "Remedies are optional supports and do not guarantee specific outcomes.",
    publicHref: "/health-report",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "View Remedies Guidance",
    ctaLabelProtected: "Open Remedy Layer",
    relatedTools: [
      { label: "Book Free Consultation", href: "/consultation" },
      { label: "Shop Records", href: "/shop" },
    ],
  },
  {
    key: "ask-my-chart",
    title: "Ask My Chart",
    description:
      "A protected assistant surface for direct chart-aware questions and ongoing interpretation follow-up.",
    helpsWith: [
      "Question-by-question chart clarification",
      "Deeper follow-up into reports and consultation when needed",
    ],
    premiumDepth:
      "Assistant depth is currently open under limited launch free access.",
    trustNote:
      "Assistant responses remain chart-grounded and do not invent unsupported calculations.",
    publicHref: "/sign-up",
    protectedHref: "/dashboard/ask-my-chart",
    ctaLabelPublic: "Try NAVAGRAHA AI",
    ctaLabelProtected: "Open Ask My Chart",
    relatedTools: [
      { label: "Kundli Reading", href: "/kundli-ai" },
      { label: "Premium Reports", href: "/dashboard/report" },
    ],
  },
] as const;

export function listAiProductFamilyItems() {
  return aiProductFamilyItems;
}

export function resolveAiProductHref(
  item: AiProductFamilyItem,
  surface: AiProductFamilySurface
) {
  return surface === "protected" ? item.protectedHref : item.publicHref;
}

export function resolveAiProductCtaLabel(
  item: AiProductFamilyItem,
  surface: AiProductFamilySurface
) {
  return surface === "protected" ? item.ctaLabelProtected : item.ctaLabelPublic;
}

export function getAiFamilyUpgradeHref(surface: AiProductFamilySurface) {
  return surface === "protected" ? "/dashboard/ask-my-chart" : "/kundli-ai";
}
