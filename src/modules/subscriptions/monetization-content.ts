export const monetizationPlanTypes = ["FREE", "PREMIUM", "PRO"] as const;

export type MonetizationPlanType = (typeof monetizationPlanTypes)[number];

export type MonetizationSurface = "public" | "protected";

export type MonetizationPromptKey =
  | "assistant-limit"
  | "assistant-near-limit"
  | "assistant-nudge"
  | "report-preview"
  | "report-limit"
  | "report-pro"
  | "chart-depth"
  | "post-upgrade"
  | "return-usage";

export type PlanComparisonRow = {
  planType: MonetizationPlanType;
  title: string;
  priceLabel: string;
  shortDescription: string;
  aiQuestions: string;
  reports: string;
  assistantDepth: string;
  advancedInsights: string;
  continuity: string;
  bestFor: string;
  ctaLabel: string;
  featuredLabel: "MOST_POPULAR" | null;
};

export type MonetizationUpgradeCopy = {
  title: string;
  message: string;
  ctaLabel: string;
  upgradeHref: string;
};

export type MonetizationNextAction = {
  title: string;
  message: string;
  ctaLabel: string;
  href: string;
  secondaryCtaLabel: string;
  secondaryHref: string;
};

const limitedFreeAccessLabel = "Currently Free (Limited Launch Access)";

const planRows: readonly PlanComparisonRow[] = [
  {
    planType: "FREE",
    title: "Free",
    priceLabel: limitedFreeAccessLabel,
    shortDescription:
      "Foundational chart access with practical assistant usage and compatibility preview.",
    aiQuestions: "Limited AI prompts with chart-aware basics",
    reports: "Basic report preview and guided starts",
    assistantDepth: "Core chart and timing summaries",
    advancedInsights: "Basic compatibility and daily Rashifal context",
    continuity: "Best for early exploration",
    bestFor: "Members starting their astrology journey",
    ctaLabel: "Start Free Analysis",
    featuredLabel: null,
  },
  {
    planType: "PREMIUM",
    title: "Mid-Tier",
    priceLabel: limitedFreeAccessLabel,
    shortDescription:
      "Expanded report and AI depth for members needing richer interpretation.",
    aiQuestions: "Advanced AI insights with deeper reasoning context",
    reports: "Detailed report sections plus PDF output readiness",
    assistantDepth: "Multi-house and cross-theme guidance layers",
    advancedInsights: "Report-to-assistant continuity for deeper planning",
    continuity: "Most balanced depth for frequent users",
    bestFor: "Members using reports and AI repeatedly",
    ctaLabel: "Try NAVAGRAHA AI",
    featuredLabel: "MOST_POPULAR",
  },
  {
    planType: "PRO",
    title: "Premium",
    priceLabel: limitedFreeAccessLabel,
    shortDescription:
      "Human-led, high-context guidance tier for serious long-term users.",
    aiQuestions: "Highest continuity assistant path",
    reports: "Deep chart reading and premium guided services",
    assistantDepth: "Consultation-ready interpretation continuity",
    advancedInsights: "Priority depth across reports and guidance flows",
    continuity: "Best for high-context decision support",
    bestFor: "Members needing consultation-led premium depth",
    ctaLabel: "Book Free Consultation",
    featuredLabel: null,
  },
] as const;

function buildUsageLine(input: {
  aiQuestionsUsedToday?: number;
  aiQuestionsLimitPerDay?: number | null;
}) {
  if (
    typeof input.aiQuestionsUsedToday !== "number" ||
    typeof input.aiQuestionsLimitPerDay !== "number"
  ) {
    return null;
  }

  return `Today's usage: ${input.aiQuestionsUsedToday}/${input.aiQuestionsLimitPerDay}.`;
}

function getReportCtaLabel() {
  return "Get Free Report";
}

function getAssistantHref(surface: MonetizationSurface) {
  return surface === "protected" ? "/dashboard/ask-my-chart" : "/kundli-ai";
}

function getReportHref(surface: MonetizationSurface) {
  return surface === "protected" ? "/dashboard/report" : "/career-report";
}

function getConsultationHref(surface: MonetizationSurface) {
  return surface === "protected" ? "/dashboard/consultations" : "/consultation";
}

export function getPlanComparisonRows() {
  return planRows;
}

export function getUpgradeHrefForSurface(surface: MonetizationSurface) {
  if (surface === "public") {
    return "/pricing";
  }

  return "/dashboard";
}

export function getPostUpgradeNextAction(
  planType: Extract<MonetizationPlanType, "PREMIUM" | "PRO">
): MonetizationNextAction {
  if (planType === "PRO") {
    return {
      title: "Free launch access is active.",
      message:
        "Continue directly into free report guidance or Ask My Chart while launch access remains open.",
      ctaLabel: "Get Free Report",
      href: "/dashboard/report",
      secondaryCtaLabel: "Try NAVAGRAHA AI",
      secondaryHref: "/dashboard/ask-my-chart",
    };
  }

  return {
    title: "Free launch access is active.",
    message:
      "Continue directly into Ask My Chart or report guidance without payment during this launch window.",
    ctaLabel: "Try NAVAGRAHA AI",
    href: "/dashboard/ask-my-chart",
    secondaryCtaLabel: "Get Free Report",
    secondaryHref: "/dashboard/report",
  };
}

export function getMonetizationUpgradeCopy(input: {
  prompt: MonetizationPromptKey;
  surface: MonetizationSurface;
  planType?: MonetizationPlanType;
  aiQuestionsUsedToday?: number;
  aiQuestionsLimitPerDay?: number | null;
  reportType?: string;
}): MonetizationUpgradeCopy {
  const assistantHref = getAssistantHref(input.surface);
  const reportHref = getReportHref(input.surface);
  const consultationHref = getConsultationHref(input.surface);

  switch (input.prompt) {
    case "assistant-limit":
      return {
        title: limitedFreeAccessLabel,
        message:
          "You have reached today's assistant cap. During launch access, continue with chart insights or report guidance and return shortly for more AI responses.",
        ctaLabel: "Try NAVAGRAHA AI",
        upgradeHref: assistantHref,
      };
    case "assistant-near-limit":
      return {
        title: limitedFreeAccessLabel,
        message:
          "You are close to today's assistant cap. Continue with focused questions to get the most from current free access.",
        ctaLabel: "Try NAVAGRAHA AI",
        upgradeHref: assistantHref,
      };
    case "assistant-nudge": {
      const usageLine = buildUsageLine({
        aiQuestionsUsedToday: input.aiQuestionsUsedToday,
        aiQuestionsLimitPerDay: input.aiQuestionsLimitPerDay,
      });

      return {
        title: limitedFreeAccessLabel,
        message: `${usageLine ? `${usageLine} ` : ""}Ask more chart-specific questions or move into a free report for deeper context.`,
        ctaLabel: "Try NAVAGRAHA AI",
        upgradeHref: assistantHref,
      };
    }
    case "report-preview":
      return {
        title: limitedFreeAccessLabel,
        message:
          "Your report preview is ready. Continue into fuller report context while free launch access remains active.",
        ctaLabel: getReportCtaLabel(),
        upgradeHref: reportHref,
      };
    case "report-limit":
      return {
        title: limitedFreeAccessLabel,
        message:
          "This report cap was reached for now. Continue with available report layers and try again during the current launch access window.",
        ctaLabel: getReportCtaLabel(),
        upgradeHref: reportHref,
      };
    case "report-pro":
      return {
        title: limitedFreeAccessLabel,
        message:
          "You are using deep report layers actively. Continue with report + consultation flow while free access is open.",
        ctaLabel: "Book Free Consultation",
        upgradeHref: consultationHref,
      };
    case "chart-depth":
      return {
        title: limitedFreeAccessLabel,
        message:
          "Your chart foundation is ready. Start a deeper free analysis and continue into report or AI guidance.",
        ctaLabel: "Start Free Analysis",
        upgradeHref: input.surface === "protected" ? "/dashboard/chart" : "/sign-up",
      };
    case "post-upgrade":
      return {
        title: limitedFreeAccessLabel,
        message:
          "Continue straight into AI guidance or report exploration. All astrology services are currently free for launch access.",
        ctaLabel: "Try NAVAGRAHA AI",
        upgradeHref: assistantHref,
      };
    case "return-usage":
      return {
        title: limitedFreeAccessLabel,
        message:
          "You are returning consistently. Continue with free AI, reports, and consultation while launch access is active.",
        ctaLabel: "Book Free Consultation",
        upgradeHref: consultationHref,
      };
    default:
      return {
        title: limitedFreeAccessLabel,
        message: "Astrology services are currently free for limited launch access.",
        ctaLabel: "Start Free Analysis",
        upgradeHref: input.surface === "protected" ? "/dashboard" : "/sign-up",
      };
  }
}
