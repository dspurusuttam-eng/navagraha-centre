export const monetizationPlanTypes = ["FREE", "PREMIUM", "PRO"] as const;

export type MonetizationPlanType = (typeof monetizationPlanTypes)[number];

export type MonetizationSurface = "public" | "protected";

export type MonetizationPromptKey =
  | "assistant-limit"
  | "assistant-nudge"
  | "report-preview"
  | "report-limit"
  | "chart-depth";

export type PlanComparisonRow = {
  planType: MonetizationPlanType;
  title: string;
  priceLabel: string;
  shortDescription: string;
  aiQuestions: string;
  reports: string;
  assistantDepth: string;
  advancedInsights: string;
  bestFor: string;
  featuredLabel: "MOST_POPULAR" | null;
};

export type MonetizationUpgradeCopy = {
  title: string;
  message: string;
  ctaLabel: string;
  upgradeHref: string;
};

const planRows: readonly PlanComparisonRow[] = [
  {
    planType: "FREE",
    title: "Free",
    priceLabel: "INR 0/month",
    shortDescription:
      "Core chart access with a measured daily assistant allowance.",
    aiQuestions: "Up to 3 questions per day",
    reports: "1 premium report preview per month",
    assistantDepth: "Foundational chart answers",
    advancedInsights: "Locked",
    bestFor: "New members starting their chart journey",
    featuredLabel: null,
  },
  {
    planType: "PREMIUM",
    title: "Premium",
    priceLabel: "INR 99/month",
    shortDescription:
      "Deeper assistant reasoning and richer report interpretation layers.",
    aiQuestions: "Up to 60 questions per day",
    reports: "Up to 12 premium reports per month",
    assistantDepth: "Multi-house and deeper timing context",
    advancedInsights: "Unlocked",
    bestFor: "Members who use chart + assistant regularly",
    featuredLabel: "MOST_POPULAR",
  },
  {
    planType: "PRO",
    title: "Pro",
    priceLabel: "INR 299/month",
    shortDescription:
      "Highest continuity tier with broad premium access and priority readiness.",
    aiQuestions: "Unlimited questions",
    reports: "Unlimited premium reports",
    assistantDepth: "Full depth with sustained continuity",
    advancedInsights: "Unlocked with highest limits",
    bestFor: "Members with sustained advanced usage",
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

export function getPlanComparisonRows() {
  return planRows;
}

export function getUpgradeHrefForSurface(surface: MonetizationSurface) {
  if (surface === "public") {
    return "/pricing";
  }

  return "/settings";
}

export function getMonetizationUpgradeCopy(input: {
  prompt: MonetizationPromptKey;
  surface: MonetizationSurface;
  aiQuestionsUsedToday?: number;
  aiQuestionsLimitPerDay?: number | null;
}): MonetizationUpgradeCopy {
  const upgradeHref = getUpgradeHrefForSurface(input.surface);

  switch (input.prompt) {
    case "assistant-limit":
      return {
        title: "Daily limit reached",
        message:
          "Your free Ask My Chart allowance is complete for today. Upgrade to continue with deeper and longer chart guidance.",
        ctaLabel: "Upgrade Plan",
        upgradeHref,
      };
    case "assistant-nudge": {
      const usageLine = buildUsageLine({
        aiQuestionsUsedToday: input.aiQuestionsUsedToday,
        aiQuestionsLimitPerDay: input.aiQuestionsLimitPerDay,
      });

      return {
        title: "Continue with Premium",
        message: `${usageLine ? `${usageLine} ` : ""}Premium unlocks deeper multi-house reasoning, richer timing context, and extended report depth.`,
        ctaLabel: "Continue with Premium",
        upgradeHref,
      };
    }
    case "report-preview":
      return {
        title: "Preview ready",
        message:
          "You can continue with this preview for free, or unlock the full premium report for deeper chart-layer analysis.",
        ctaLabel: "Unlock Full Report",
        upgradeHref,
      };
    case "report-limit":
      return {
        title: "Monthly report limit reached",
        message:
          "Your current plan has reached this month's premium report limit. Upgrade for higher report capacity.",
        ctaLabel: "Upgrade Plan",
        upgradeHref,
      };
    case "chart-depth":
      return {
        title: "Premium chart depth",
        message:
          "You can continue with this free chart foundation. Premium plans unlock full planet-by-house detail, deeper chart explanation, and extended report layers.",
        ctaLabel: "Unlock Full Report",
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
