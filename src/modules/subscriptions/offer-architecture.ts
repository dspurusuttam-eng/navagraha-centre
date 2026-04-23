export type RevenueValueLevel = "FREE" | "MID_TIER" | "PREMIUM";

export type RevenueValueLevelDefinition = {
  level: RevenueValueLevel;
  title: string;
  positioning: string;
  includes: readonly string[];
  badge: string;
};

export type ReportPackageTier = "ESSENTIAL" | "ADVANCED" | "PREMIUM";

export type ReportPackageDefinition = {
  tier: ReportPackageTier;
  title: string;
  positioning: string;
  includes: readonly string[];
  badge: string;
};

export type ConsultationTier = "QUICK" | "DETAILED" | "PREMIUM_GUIDANCE";

export type ConsultationTierDefinition = {
  tier: ConsultationTier;
  title: string;
  duration: string;
  description: string;
  includes: readonly string[];
  badge: string;
};

export type AiAccessLayer = {
  title: string;
  description: string;
  includes: readonly string[];
  badge: string;
};

const launchBadge = "Currently Free (Limited Launch Access)";

const revenueValueLevels: readonly RevenueValueLevelDefinition[] = [
  {
    level: "FREE",
    title: "Free",
    positioning: "Foundational astrology entry for first-time and returning members.",
    includes: [
      "Basic Kundli foundation",
      "Daily Rashifal access",
      "Limited AI prompts",
      "Basic compatibility preview",
    ],
    badge: launchBadge,
  },
  {
    level: "MID_TIER",
    title: "Mid-Tier",
    positioning: "Expanded depth for members who need richer interpretation.",
    includes: [
      "Detailed report sections",
      "Advanced AI insights",
      "Downloadable PDF outputs",
      "Deeper chart context continuity",
    ],
    badge: launchBadge,
  },
  {
    level: "PREMIUM",
    title: "Premium",
    positioning: "Human-led and high-context guidance for critical decisions.",
    includes: [
      "Consultation-led interpretation",
      "Deep chart reading",
      "Premium guided services",
      "Priority continuity across report and assistant",
    ],
    badge: launchBadge,
  },
] as const;

const reportPackages: readonly ReportPackageDefinition[] = [
  {
    tier: "ESSENTIAL",
    title: "Essential Report",
    positioning: "Clear first layer for chart understanding and practical direction.",
    includes: [
      "Core Lagna and graha summary",
      "Priority life themes",
      "Actionable first-step guidance",
    ],
    badge: launchBadge,
  },
  {
    tier: "ADVANCED",
    title: "Advanced Report",
    positioning: "Expanded report depth for focused planning and follow-up.",
    includes: [
      "Detailed house-wise analysis",
      "Advanced AI interpretation layer",
      "PDF-ready report output architecture",
    ],
    badge: launchBadge,
  },
  {
    tier: "PREMIUM",
    title: "Premium Report",
    positioning: "Highest report continuity designed for serious long-term use.",
    includes: [
      "Comprehensive report depth",
      "Cross-report synthesis and escalation paths",
      "Consultation-ready interpretation notes",
    ],
    badge: launchBadge,
  },
] as const;

const consultationTiers: readonly ConsultationTierDefinition[] = [
  {
    tier: "QUICK",
    title: "Quick Guidance",
    duration: "30-45 min",
    description: "Focused clarity for one question cluster and immediate next steps.",
    includes: [
      "Targeted guidance focus",
      "Concise interpretation",
      "Clear follow-up direction",
    ],
    badge: "Currently Free",
  },
  {
    tier: "DETAILED",
    title: "Detailed Reading",
    duration: "60-75 min",
    description:
      "Broader chart review for timing, life themes, and deeper interpretation context.",
    includes: [
      "Multi-theme chart review",
      "Context-rich interpretation",
      "Report and assistant continuation notes",
    ],
    badge: "Currently Free",
  },
  {
    tier: "PREMIUM_GUIDANCE",
    title: "Premium Guidance Session",
    duration: "90+ min",
    description:
      "Highest-depth consultation for complex decisions and long-range clarity.",
    includes: [
      "Deep chart synthesis",
      "Premium guided service continuity",
      "Priority follow-up direction",
    ],
    badge: "Currently Free",
  },
] as const;

const aiAccessLayers: readonly AiAccessLayer[] = [
  {
    title: "Free AI Layer",
    description: "Practical chart-aware support for day-to-day guidance.",
    includes: [
      "Limited prompts per day",
      "Selected AI modules",
      "Clear, concise chart-grounded responses",
    ],
    badge: launchBadge,
  },
  {
    title: "Premium AI Layer",
    description:
      "Advanced AI continuity for users who need deeper context and volume.",
    includes: [
      "Advanced tools and modules",
      "Higher usage continuity",
      "Deeper multi-context reasoning",
      "Saved history and richer follow-up architecture",
    ],
    badge: "Early Access Premium Experience",
  },
] as const;

export function getLaunchAccessBadge() {
  return launchBadge;
}

export function getRevenueValueLevels() {
  return revenueValueLevels;
}

export function getReportPackageDefinitions() {
  return reportPackages;
}

export function getConsultationTierDefinitions() {
  return consultationTiers;
}

export function getAiAccessLayers() {
  return aiAccessLayers;
}
