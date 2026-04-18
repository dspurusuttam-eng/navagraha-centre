import "server-only";

import { getPrisma } from "@/lib/prisma";
import type { CurrentCycleSummary } from "@/lib/astrology/current-cycle";
import type { ChartInsights } from "@/lib/ai/types";
import type { ChartReportState } from "@/modules/report/service";
import {
  getUpgradeHrefForUserPlan,
  getUserPlanUsageModel,
  isPremiumPlan,
} from "@/modules/subscriptions";

const premiumReportPromptTemplateKey = "premium-report-generator";

export const premiumReportTypes = [
  "CAREER",
  "MARRIAGE",
  "FINANCE",
  "HEALTH",
] as const;

export type PremiumReportType = (typeof premiumReportTypes)[number];

export type PremiumReportOutput = {
  reportType: PremiumReportType;
  status: "PREVIEW_LOCKED" | "FULL_ACCESS" | "LIMIT_REACHED";
  title: string;
  preview: string;
  fullReportSections: Array<{
    title: string;
    content: string;
  }>;
  message: string;
  upgradeHref: string | null;
};

const premiumReportTitleMap: Record<PremiumReportType, string> = {
  CAREER: "Career Intelligence Report",
  MARRIAGE: "Marriage & Partnership Report",
  FINANCE: "Financial Timing Report",
  HEALTH: "Health Rhythm Awareness Report",
};

const premiumReportLensMap: Record<PremiumReportType, string> = {
  CAREER: "career direction, role fit, and disciplined growth windows",
  MARRIAGE: "partnership dynamics, compatibility readiness, and communication tone",
  FINANCE: "resource discipline, decision timing, and practical accumulation patterns",
  HEALTH: "energy management, rest rhythm, and sustainable stress pacing",
};

function isPremiumReportType(value: string): value is PremiumReportType {
  return premiumReportTypes.includes(value as PremiumReportType);
}

function normalizeReportType(value: string) {
  const normalized = value.trim().toUpperCase();

  if (!isPremiumReportType(normalized)) {
    throw new Error("Unsupported premium report type.");
  }

  return normalized;
}

function buildPreviewText(input: {
  reportType: PremiumReportType;
  chartReport: ChartReportState;
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const chartNarrative =
    input.chartReport.status === "ready"
      ? input.chartReport.overview.chart.summary.narrative
      : input.insights.summary;
  const lens = premiumReportLensMap[input.reportType];
  const timingLine =
    input.currentCycle.status === "ready"
      ? input.currentCycle.synthesis.activeAreas[0]?.summary ??
        input.currentCycle.synthesis.overview
      : input.currentCycle.unavailableReason;

  return `${chartNarrative} This preview focuses on ${lens}. Timing context: ${timingLine}`;
}

function buildFullSections(input: {
  reportType: PremiumReportType;
  chartReport: ChartReportState;
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const sections: Array<{ title: string; content: string }> = [];
  const chartLead =
    input.chartReport.status === "ready"
      ? input.chartReport.interpretation.summary
      : input.insights.summary;
  const strengths = input.insights.strengths.slice(0, 3).join(" ");
  const challenges = input.insights.challenges.slice(0, 3).join(" ");
  const recommendations = input.insights.recommendations.slice(0, 3).join(" ");

  sections.push({
    title: "Chart Lens",
    content: `${chartLead} The applied lens here is ${premiumReportLensMap[input.reportType]}.`,
  });
  sections.push({
    title: "Strengths To Build",
    content: strengths || "No dominant strengths are available in this context yet.",
  });
  sections.push({
    title: "Pressure Points To Pace",
    content:
      challenges || "No dominant pressure points are available in this context yet.",
  });

  if (input.currentCycle.status === "ready") {
    sections.push({
      title: "Current Timing",
      content: input.currentCycle.synthesis.overview,
    });
  }

  sections.push({
    title: "Action Focus",
    content:
      recommendations ||
      "Use measured follow-up and consultation support for any high-stakes decisions.",
  });

  return sections;
}

export async function generatePremiumReportForUser(input: {
  userId: string;
  reportType: string;
  chartReport: ChartReportState;
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
}) {
  const reportType = normalizeReportType(input.reportType);
  const { plan, usage } = await getUserPlanUsageModel(input.userId);
  const reportLimit = plan.usage_limits.premiumReportsPerMonth;
  const monthlyUsageReached =
    reportLimit !== null &&
    usage.premium_reports_generated_this_month >= reportLimit;
  const title = premiumReportTitleMap[reportType];
  const preview = buildPreviewText({
    reportType,
    chartReport: input.chartReport,
    insights: input.insights,
    currentCycle: input.currentCycle,
  });

  if (monthlyUsageReached) {
    return {
      reportType,
      status: "LIMIT_REACHED",
      title,
      preview,
      fullReportSections: [],
      message:
        "Monthly premium report generation limit reached for your current plan. Upgrade for higher limits.",
      upgradeHref: getUpgradeHrefForUserPlan(plan.plan_type),
    } satisfies PremiumReportOutput;
  }

  if (!isPremiumPlan(plan.plan_type)) {
    await getPrisma().aiTaskRun.create({
      data: {
        userId: input.userId,
        taskKind: "CONTENT_DRAFT_GENERATION",
        status: "SUCCEEDED",
        providerKey: "premium-report-engine",
        model: null,
        promptTemplateKey: premiumReportPromptTemplateKey,
        promptVersionLabel: "v1",
        inputHash: `${input.userId}:${reportType}:${new Date()
          .toISOString()
          .slice(0, 10)}:preview`,
        inputPayload: {
          reportType,
          planType: plan.plan_type,
        },
        outputPayload: {
          status: "PREVIEW_LOCKED",
          title,
        },
        normalizedOutput: {
          reportType,
          title,
          status: "PREVIEW_LOCKED",
        },
        policyPassed: true,
        completedAt: new Date(),
      },
    });

    return {
      reportType,
      status: "PREVIEW_LOCKED",
      title,
      preview,
      fullReportSections: [],
      message:
        "Preview ready. Unlock the full premium report for deeper chart-layer analysis.",
      upgradeHref: getUpgradeHrefForUserPlan(plan.plan_type),
    } satisfies PremiumReportOutput;
  }

  const fullReportSections = buildFullSections({
    reportType,
    chartReport: input.chartReport,
    insights: input.insights,
    currentCycle: input.currentCycle,
  });

  await getPrisma().aiTaskRun.create({
    data: {
      userId: input.userId,
      taskKind: "CONTENT_DRAFT_GENERATION",
      status: "SUCCEEDED",
      providerKey: "premium-report-engine",
      model: null,
      promptTemplateKey: premiumReportPromptTemplateKey,
      promptVersionLabel: "v1",
      inputHash: `${input.userId}:${reportType}:${new Date()
        .toISOString()
        .slice(0, 10)}`,
      inputPayload: {
        reportType,
        planType: plan.plan_type,
      },
      outputPayload: {
        status: "FULL_ACCESS",
        title,
      },
      normalizedOutput: {
        reportType,
        title,
      },
      policyPassed: true,
      completedAt: new Date(),
    },
  });

  return {
    reportType,
    status: "FULL_ACCESS",
    title,
    preview,
    fullReportSections,
    message:
      "Full premium report generated from your saved chart context and current cycle data.",
    upgradeHref: null,
  } satisfies PremiumReportOutput;
}
