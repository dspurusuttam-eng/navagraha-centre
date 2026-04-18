import "server-only";

import { getPrisma } from "@/lib/prisma";
import { getMonetizationUpgradeCopy } from "@/modules/subscriptions/monetization-content";
import {
  getUpgradeHrefForUserPlan,
  getUserPlanModel,
  type UserPlanModel,
  type UserPlanType,
} from "@/modules/subscriptions/user-plan";

const askMyChartChannelKey = "ask-my-chart";
const premiumReportPromptTemplateKey = "premium-report-generator";

export type UserPlanUsageModel = {
  ai_questions_used_today: number;
  ai_questions_remaining_today: number | null;
  premium_reports_generated_this_month: number;
  premium_reports_remaining_this_month: number | null;
};

export type AskMyChartUsageCheckResult =
  | {
      allowed: true;
      plan: UserPlanModel;
      usage: UserPlanUsageModel;
    }
  | {
      allowed: false;
      status: "LIMIT_REACHED";
      message: string;
      upgradeHref: string;
      plan: UserPlanModel;
      usage: UserPlanUsageModel;
    };

function getStartOfTodayUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function getStartOfMonthUtc() {
  const now = new Date();

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function getRemaining(used: number, limit: number | null) {
  if (limit === null) {
    return null;
  }

  return Math.max(0, limit - used);
}

function buildUsageModel(input: {
  plan: UserPlanModel;
  aiQuestionsUsedToday: number;
  premiumReportsGeneratedThisMonth: number;
}): UserPlanUsageModel {
  return {
    ai_questions_used_today: input.aiQuestionsUsedToday,
    ai_questions_remaining_today: getRemaining(
      input.aiQuestionsUsedToday,
      input.plan.usage_limits.aiQuestionsPerDay
    ),
    premium_reports_generated_this_month: input.premiumReportsGeneratedThisMonth,
    premium_reports_remaining_this_month: getRemaining(
      input.premiumReportsGeneratedThisMonth,
      input.plan.usage_limits.premiumReportsPerMonth
    ),
  };
}

async function readUsageCounters(userId: string) {
  const prisma = getPrisma();
  const startOfTodayUtc = getStartOfTodayUtc();
  const startOfMonthUtc = getStartOfMonthUtc();

  const [aiQuestionsUsedToday, premiumReportsGeneratedThisMonth] =
    await Promise.all([
      prisma.aiConversationMessage.count({
        where: {
          role: "USER",
          createdAt: {
            gte: startOfTodayUtc,
          },
          session: {
            userId,
            channelKey: askMyChartChannelKey,
          },
        },
      }),
      prisma.aiTaskRun.count({
        where: {
          userId,
          taskKind: "CONTENT_DRAFT_GENERATION",
          promptTemplateKey: premiumReportPromptTemplateKey,
          status: "SUCCEEDED",
          createdAt: {
            gte: startOfMonthUtc,
          },
        },
      }),
    ]);

  return {
    aiQuestionsUsedToday,
    premiumReportsGeneratedThisMonth,
  };
}

export async function getUserPlanUsageModel(userId: string) {
  const [plan, usageCounters] = await Promise.all([
    getUserPlanModel(userId),
    readUsageCounters(userId),
  ]);

  return {
    plan,
    usage: buildUsageModel({
      plan,
      aiQuestionsUsedToday: usageCounters.aiQuestionsUsedToday,
      premiumReportsGeneratedThisMonth:
        usageCounters.premiumReportsGeneratedThisMonth,
    }),
  };
}

export function isPremiumPlan(planType: UserPlanType) {
  return planType === "PREMIUM" || planType === "PRO";
}

export async function checkAskMyChartUsageLimit(
  userId: string
): Promise<AskMyChartUsageCheckResult> {
  const { plan, usage } = await getUserPlanUsageModel(userId);
  const dailyLimit = plan.usage_limits.aiQuestionsPerDay;

  if (dailyLimit !== null && usage.ai_questions_used_today >= dailyLimit) {
    const upgradeCopy = getMonetizationUpgradeCopy({
      prompt: "assistant-limit",
      surface: "protected",
    });

    return {
      allowed: false,
      status: "LIMIT_REACHED",
      message: upgradeCopy.message,
      upgradeHref: getUpgradeHrefForUserPlan(plan.plan_type, "protected"),
      plan,
      usage,
    };
  }

  return {
    allowed: true,
    plan,
    usage,
  };
}
