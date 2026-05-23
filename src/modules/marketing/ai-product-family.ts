export type AiProductFamilySurface = "public" | "protected";

export type AiProductFamilyItem = {
  key:
    | "ai-kundli-reading"
    | "ai-numerology-insights"
    | "ai-compatibility"
    | "ai-career-insights"
    | "ai-finance-guidance"
    | "ai-health-guidance"
    | "ai-daily-prediction"
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
    title: "Kundli Intelligence Guidance",
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
    publicHref: "/kundli",
    protectedHref: "/dashboard/chart",
    ctaLabelPublic: "Open Kundli Intelligence Guidance",
    ctaLabelProtected: "View Chart Reading",
    relatedTools: [
      { label: "Ask NI", href: "/ai" },
      { label: "Premium Reports", href: "/reports" },
    ],
  },
  {
    key: "ai-numerology-insights",
    title: "Numerology Intelligence",
    description:
      "Discover your core numbers, personality patterns, strengths, growth and life direction through premium numerology insights.",
    helpsWith: [
      "Birth, Destiny, and Name Number orientation in one structured flow",
      "Compound-number context with practical interpretation notes",
    ],
    premiumDepth:
      "Currently free under limited launch access with richer interpretation layers and continuity.",
    trustNote:
      "Numerology guidance is reflective support and should be paired with practical decision-making.",
    publicHref: "/numerology",
    protectedHref: "/numerology",
    ctaLabelPublic: "Explore Numerology",
    ctaLabelProtected: "Explore Numerology",
    relatedTools: [
      { label: "NAVAGRAHA Intelligence", href: "/ai" },
      { label: "Ask NI", href: "/ai" },
    ],
  },
  {
    key: "ai-compatibility",
    title: "Marriage Compatibility Guidance",
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
    publicHref: "/matchmaking",
    protectedHref: "/dashboard/consultations",
    ctaLabelPublic: "Explore Compatibility",
    ctaLabelProtected: "Open Compatibility Flow",
    relatedTools: [
      { label: "Consultation", href: "/consultation" },
      { label: "Ask NI", href: "/ai" },
    ],
  },
  {
    key: "ai-career-insights",
    title: "Career Intelligence Insights",
    description:
      "Career-focused NAVAGRAHA Intelligence guidance tied to your chart context and report progression.",
    helpsWith: [
      "Priority and timing themes for career decisions",
      "Clear handoff into premium report depth",
    ],
    premiumDepth:
      "Currently free under limited launch access with deeper report context and reasoning.",
    trustNote:
      "Career guidance is reflective support and should be paired with practical planning.",
    publicHref: "/reports",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "Open Career Insights",
    ctaLabelProtected: "Open Career Report Layer",
    relatedTools: [
      { label: "Reports", href: "/reports" },
      { label: "Ask NI", href: "/ai" },
    ],
  },
  {
    key: "ai-finance-guidance",
    title: "Finance Guidance",
    description:
      "Financial planning themes explained through chart context with no guarantee-based language.",
    helpsWith: [
      "Money caution and planning themes",
      "Report-oriented follow-up for deeper financial timing review",
    ],
    premiumDepth:
      "Currently free under limited launch access with deeper report continuity when needed.",
    trustNote:
      "Finance guidance is reflective support and is not professional financial advice.",
    publicHref: "/reports",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "Open Finance Guidance",
    ctaLabelProtected: "Open Finance Report Layer",
    relatedTools: [
      { label: "Reports", href: "/reports" },
      { label: "Ask NI", href: "/ai" },
    ],
  },
  {
    key: "ai-health-guidance",
    title: "Health Guidance",
    description:
      "Wellness-oriented astrology themes presented responsibly with explicit safety boundaries.",
    helpsWith: [
      "Lifestyle reflection through astrology context",
      "Safe next steps without medical certainty claims",
    ],
    premiumDepth:
      "Currently free under limited launch access with consultation handoff for sensitive concerns.",
    trustNote:
      "Health guidance is not medical advice and should never replace professional care.",
    publicHref: "/consultation",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "Open Health Guidance",
    ctaLabelProtected: "Open Health Report Layer",
    relatedTools: [
      { label: "Reports", href: "/reports" },
      { label: "Consultation", href: "/consultation" },
    ],
  },
  {
    key: "ai-daily-prediction",
    title: "Daily Guidance",
    description:
      "Daily chart-aware guidance for practical focus, supportive factors, and caution areas.",
    helpsWith: [
      "Daily guidance connected to broader chart context",
      "Calm next-step orientation without fear-based predictions",
    ],
    premiumDepth:
      "Currently free under limited launch access with Ask NI follow-up when a day needs more context.",
    trustNote:
      "Daily guidance is for reflection and should be used with practical judgment.",
    publicHref: "/rashifal",
    protectedHref: "/dashboard/ask-my-chart",
    ctaLabelPublic: "Open Daily Guidance",
    ctaLabelProtected: "Ask About Today",
    relatedTools: [
      { label: "Daily Rashifal", href: "/rashifal" },
      { label: "Panchang", href: "/panchang" },
    ],
  },
  {
    key: "ai-remedy-guidance",
    title: "Remedies Intelligence Guidance",
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
    publicHref: "/remedies",
    protectedHref: "/dashboard/report",
    ctaLabelPublic: "View Remedies Guidance",
    ctaLabelProtected: "Open Remedy Layer",
    relatedTools: [
      { label: "Consultation", href: "/consultation" },
      { label: "Shop Records", href: "/shop" },
    ],
  },
  {
    key: "ask-my-chart",
    title: "Ask NI",
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
    publicHref: "/ai",
    protectedHref: "/dashboard/ask-my-chart",
    ctaLabelPublic: "Ask NI",
    ctaLabelProtected: "Open Ask NI",
    relatedTools: [
      { label: "Kundli Reading", href: "/kundli" },
      { label: "Premium Reports", href: "/reports" },
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
  return surface === "protected" ? "/dashboard/ask-my-chart" : "/ai";
}
