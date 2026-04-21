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

const planRows: readonly PlanComparisonRow[] = [
  {
    planType: "FREE",
    title: "Free",
    priceLabel: "₹0 / month (INR)",
    shortDescription:
      "Foundational chart access with light assistant usage and premium previews kept optional.",
    aiQuestions: "3 chart-aware questions per day",
    reports: "Premium report previews before upgrade",
    assistantDepth: "Foundational chart and timing summaries",
    advancedInsights: "Lagna, key placements, and light report depth",
    continuity: "A measured starting layer that still keeps the chart useful",
    bestFor: "New members starting their chart journey",
    ctaLabel: "Start Free",
    featuredLabel: null,
  },
  {
    planType: "PREMIUM",
    title: "Premium",
    priceLabel: "₹99 / month (INR)",
    shortDescription:
      "Deeper assistant reasoning, richer report layers, and a smoother premium rhythm.",
    aiQuestions: "60 chart-aware questions per day",
    reports: "12 full premium reports per month",
    assistantDepth: "Deeper multi-house reasoning and timing context",
    advancedInsights: "Full chart depth and premium report layers",
    continuity: "The clearest fit for recurring chart and assistant use",
    bestFor: "Members who use chart + assistant regularly",
    ctaLabel: "Unlock Full AI Reading",
    featuredLabel: "MOST_POPULAR",
  },
  {
    planType: "PRO",
    title: "Pro",
    priceLabel: "₹299 / month (INR)",
    shortDescription:
      "Highest continuity tier for members who want no cap on premium report and assistant use.",
    aiQuestions: "Unlimited chart-aware questions",
    reports: "Unlimited full premium reports",
    assistantDepth: "Highest reasoning depth with sustained continuity",
    advancedInsights: "Priority-ready premium access with highest limits",
    continuity: "Best when premium usage is already becoming habitual",
    bestFor: "Members with sustained advanced usage",
    ctaLabel: "Move to Pro Continuity",
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

  return `Today's free usage: ${input.aiQuestionsUsedToday}/${input.aiQuestionsLimitPerDay}.`;
}

function getReportCtaLabel(reportType?: string) {
  switch (reportType?.toUpperCase()) {
    case "CAREER":
      return "View Detailed Career Report";
    case "MARRIAGE":
      return "Get Complete Compatibility Analysis";
    case "FINANCE":
      return "Unlock Full Finance Report";
    case "HEALTH":
      return "Unlock Full Health Report";
    default:
      return "Unlock Full Report";
  }
}

export function getPlanComparisonRows() {
  return planRows;
}

export function getUpgradeHrefForSurface(surface: MonetizationSurface) {
  if (surface === "public") {
    return "/pricing";
  }

  return "/settings";
}

export function getPostUpgradeNextAction(
  planType: Extract<MonetizationPlanType, "PREMIUM" | "PRO">
): MonetizationNextAction {
  if (planType === "PRO") {
    return {
      title: "Pro access is active.",
      message:
        "Your highest-depth assistant and report continuity are ready. The cleanest next step is to open the premium report layer while the chart context is fresh.",
      ctaLabel: "Open Premium Report",
      href: "/dashboard/report",
      secondaryCtaLabel: "Ask a Deeper Question",
      secondaryHref: "/dashboard/ask-my-chart",
    };
  }

  return {
    title: "Premium access is active.",
    message:
      "Your deeper chart, report, and assistant layers are ready. A first premium question or report pass is usually the most useful next action.",
    ctaLabel: "Open Ask My Chart",
    href: "/dashboard/ask-my-chart",
    secondaryCtaLabel: "Open Premium Report",
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
  const upgradeHref = getUpgradeHrefForSurface(input.surface);

  switch (input.prompt) {
    case "assistant-limit":
      if (input.planType === "PREMIUM") {
        return {
          title: "Premium is carrying more of your workflow now",
          message:
            "You have reached today's Premium assistant allowance. Pro removes the daily cap and keeps longer chart continuity available when usage becomes regular.",
          ctaLabel: "Move to Pro Continuity",
          upgradeHref,
        };
      }

      return {
        title: "Daily limit reached",
        message:
          "Your free Ask My Chart allowance is complete for today. Premium keeps the same chart context available for deeper and longer follow-up.",
        ctaLabel: "Upgrade for Unlimited Ask My Chart",
        upgradeHref,
      };
    case "assistant-near-limit":
      if (input.planType === "PREMIUM") {
        return {
          title: "Premium usage is becoming more continuous",
          message:
            "You are using Premium heavily today. Pro removes the daily assistant cap and keeps deeper continuity available without pacing around limits.",
          ctaLabel: "Review Pro Upgrade",
          upgradeHref,
        };
      }

      return {
        title: "You are close to today's free assistant limit",
        message:
          "Free keeps the assistant useful for short chart questions. Premium becomes useful once follow-up questions start coming in clusters.",
        ctaLabel: "Continue with Premium",
        upgradeHref,
      };
    case "assistant-nudge": {
      const usageLine = buildUsageLine({
        aiQuestionsUsedToday: input.aiQuestionsUsedToday,
        aiQuestionsLimitPerDay: input.aiQuestionsLimitPerDay,
      });

      if (input.planType === "PREMIUM") {
        return {
          title: "Keep deeper continuity available",
          message: `${
            usageLine ? `${usageLine} ` : ""
          }Premium already unlocks deeper chart reasoning. Pro becomes useful when you want unlimited assistant continuity and broader premium usage headroom.`,
          ctaLabel: "Review Pro Upgrade",
          upgradeHref,
        };
      }

      return {
        title: "Continue with Premium",
        message: `${
          usageLine ? `${usageLine} ` : ""
        }Premium unlocks deeper multi-house reasoning, richer timing context, and extended report depth without making the free layer unusable.`,
        ctaLabel: "Unlock Full AI Reading",
        upgradeHref,
      };
    }
    case "report-preview":
      return {
        title: "Preview ready",
        message:
          "You can continue with this preview for free. Premium becomes useful when you want the full report sections, deeper interpretation, and stronger continuity across report sessions.",
        ctaLabel: getReportCtaLabel(input.reportType),
        upgradeHref,
      };
    case "report-limit":
      if (input.planType === "PREMIUM") {
        return {
          title: "Your report cadence is moving beyond Premium",
          message:
            "Premium has reached this month's report allowance. Pro removes the monthly report cap when premium reports are becoming a regular workflow.",
          ctaLabel: "Move to Pro Continuity",
          upgradeHref,
        };
      }

      return {
        title: "Monthly report limit reached",
        message:
          "Your current plan has reached this month's premium report allowance. Upgrade only if you need deeper report continuity right now.",
        ctaLabel: "Unlock Full Report",
        upgradeHref,
      };
    case "report-pro":
      return {
        title: "Premium is already doing the deeper work",
        message:
          "If premium reports are becoming a regular part of your workflow, Pro removes the monthly cap and keeps your chart, report, and assistant rhythm uninterrupted.",
        ctaLabel: "Review Pro Upgrade",
        upgradeHref,
      };
    case "chart-depth":
      return {
        title: "Your chart is ready for deeper reading",
        message:
          "Free keeps the chart foundation visible. Premium unlocks the full planet-by-house layer, deeper report interpretation, and stronger assistant follow-up when the chart becomes something you return to often.",
        ctaLabel: "Unlock Full AI Reading",
        upgradeHref,
      };
    case "post-upgrade":
      if (input.planType === "PRO") {
        return {
          title: "Pro is live",
          message:
            "Your highest-depth tier is ready. Move directly into premium report or assistant work rather than stopping at the payment state.",
          ctaLabel: "Open Premium Report",
          upgradeHref: "/dashboard/report",
        };
      }

      return {
        title: "Premium is live",
        message:
          "Your deeper assistant and report layers are ready now. The cleanest next step is to use one of them immediately while your question is still fresh.",
        ctaLabel: "Open Ask My Chart",
        upgradeHref: "/dashboard/ask-my-chart",
      };
    case "return-usage":
      if (input.planType === "PREMIUM") {
        return {
          title: "Your repeat usage is approaching Pro territory",
          message:
            "Premium already unlocks the deeper layers. Pro becomes the cleaner fit when repeated chart, report, and assistant sessions are becoming part of a steady rhythm.",
          ctaLabel: "Review Pro Upgrade",
          upgradeHref,
        };
      }

      return {
        title: "You are returning often enough to justify deeper continuity",
        message:
          "The free layer remains useful. Premium becomes worthwhile once repeated chart, report, and assistant sessions start needing more continuity.",
        ctaLabel: "Review Premium",
        upgradeHref,
      };
    default:
      return {
        title: "Upgrade available",
        message:
          "Premium access is optional and available when you need deeper chart continuity.",
        ctaLabel: "View Plans",
        upgradeHref,
      };
  }
}
