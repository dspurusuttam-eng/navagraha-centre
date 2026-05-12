import type { BadgeTone } from "@/components/ui/badge";

export type ToolsHubRecommendationBlock = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  feature: string;
  statusLabel: string;
  statusTone?: BadgeTone;
};

export const toolsHubRecommendationBlocks: readonly ToolsHubRecommendationBlock[] = [
  {
    key: "new-user-kundli",
    eyebrow: "Start here",
    title: "New user? Start with Free Kundli",
    description:
      "Create the chart foundation first, then continue into Dasha, Transit, Reports, or AI when the chart is ready.",
    primaryHref: "/kundli",
    primaryLabel: "Generate Kundli",
    secondaryHref: "/panchang",
    secondaryLabel: "View Panchang",
    feature: "tools-hub-recommendation-kundli",
    statusLabel: "Available",
    statusTone: "trust",
  },
  {
    key: "post-kundli-path",
    eyebrow: "After Kundli",
    title: "Explore Dasha, Transit and Reports",
    description:
      "Use the saved Kundli to continue into timing, planetary movement, and premium report continuity.",
    primaryHref: "/dashboard",
    primaryLabel: "View Dashboard",
    secondaryHref: "/reports",
    secondaryLabel: "Open Reports",
    feature: "tools-hub-recommendation-post-kundli",
    statusLabel: "Requires Kundli",
    statusTone: "neutral",
  },
  {
    key: "daily-visitor-path",
    eyebrow: "Daily visitor",
    title: "Check Rashifal, Panchang and Daily Remedy",
    description:
      "Keep the homepage useful for return visits with practical daily guidance and optional support pathways.",
    primaryHref: "/rashifal",
    primaryLabel: "Read Rashifal",
    secondaryHref: "/remedies",
    secondaryLabel: "Open Remedies",
    feature: "tools-hub-recommendation-daily",
    statusLabel: "Available",
    statusTone: "trust",
  },
  {
    key: "human-guidance-path",
    eyebrow: "Human guidance",
    title: "Need human guidance? Consult J P Sarmah",
    description:
      "Use a human review path for important decisions, supported by chart context and NAVAGRAHA Intelligence.",
    primaryHref: "/consultation",
    primaryLabel: "Book Consultation",
    secondaryHref: "/from-the-desk",
    secondaryLabel: "Read From the Desk",
    feature: "tools-hub-recommendation-consultation",
    statusLabel: "Premium Service",
    statusTone: "accent",
  },
  {
    key: "future-intelligence-path",
    eyebrow: "Future intelligence",
    title: "Explore future NAVAGRAHA Intelligence tools",
    description:
      "Follow the expanding AI-assisted roadmap for Kundli NI, Dasha NI, Transit NI, Panchang NI, Remedy NI, Numerology NI and more.",
    primaryHref: "/ai",
    primaryLabel: "Ask NAVAGRAHA AI",
    secondaryHref: "/tools",
    secondaryLabel: "Browse Tools",
    feature: "tools-hub-recommendation-future-ni",
    statusLabel: "Future Intelligence",
    statusTone: "outline",
  },
] as const;

export function getToolsHubRecommendationBlocks() {
  return toolsHubRecommendationBlocks;
}
