import "server-only";

import { getPrisma } from "@/lib/prisma";
import type { ReportPredictiveContext } from "@/lib/ai/types";
import type { CurrentCycleSummary } from "@/lib/astrology/current-cycle";
import type { ChartInsights } from "@/lib/ai/types";
import type { ChartReportState } from "@/modules/report/service";
import {
  buildPremiumReportFoundation,
  resolveReportFoundationTypeKey,
  type ReportFoundation,
  type ReportUnlockState,
  type ReportSectionPlan,
} from "@/modules/report/report-foundation";
import { buildReportPresentationModel } from "@/modules/report/report-presentation";
import {
  getMonetizationUpgradeCopy,
  getUpgradeHrefForUserPlan,
  getUserPlanUsageModel,
  isPremiumPlan,
  type MonetizationPlanType,
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
  planType: MonetizationPlanType;
  status: "PREVIEW_LOCKED" | "FULL_ACCESS" | "LIMIT_REACHED";
  title: string;
  preview: string;
  fullReportSections: Array<{
    title: string;
    content: string;
  }>;
  sectionPlan: ReportSectionPlan[];
  presentation: ReturnType<typeof buildReportPresentationModel>;
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

function mapReportTypeToLensType(reportType: PremiumReportType) {
  return reportType;
}

function buildPreviewText(input: {
  foundation: ReportFoundation;
}) {
  const lens = premiumReportLensMap[
    mapReportTypeToLensType(input.foundation.reportType as PremiumReportType)
  ];

  return `${input.foundation.contextSummary.executiveSummary} This preview focuses on ${lens}. Deeper timing and full section analysis are available after unlocking the report.`;
}

function buildFullSections(input: {
  foundation: ReportFoundation;
}) {
  return input.foundation.sectionPlan.map((section) => ({
    title: section.title,
    content: section.content,
  }));
}

export async function generatePremiumReportForUser(input: {
  userId: string;
  reportType: string;
  chartReport: ChartReportState;
  insights: ChartInsights;
  currentCycle: CurrentCycleSummary;
  predictiveContext: ReportPredictiveContext | null;
}) {
  const reportType = normalizeReportType(input.reportType);
  const foundationType = resolveReportFoundationTypeKey(reportType);
  const { plan, usage } = await getUserPlanUsageModel(input.userId);
  const reportLimit = plan.usage_limits.premiumReportsPerMonth;
  const monthlyUsageReached =
    reportLimit !== null &&
    usage.premium_reports_generated_this_month >= reportLimit;
  const title = premiumReportTitleMap[reportType];
  const unlockState: ReportUnlockState = monthlyUsageReached
    ? "LIMIT_REACHED"
    : isPremiumPlan(plan.plan_type)
      ? "UNLOCKED"
      : "PREVIEW_LOCKED";
  const foundation = buildPremiumReportFoundation({
    reportType: foundationType,
    accessTier: plan.plan_type,
    unlockState,
    chartReport: input.chartReport,
    insights: input.insights,
    currentCycle: input.currentCycle,
    predictiveContext: input.predictiveContext,
    accuracy:
      input.chartReport.status === "ready" ? input.chartReport.accuracy : null,
  });
  const preview = buildPreviewText({
    foundation,
  });
  const presentation = buildReportPresentationModel(foundation);

  if (monthlyUsageReached) {
    const upgradeCopy = getMonetizationUpgradeCopy({
      prompt: "report-limit",
      surface: "protected",
    });

    return {
      reportType,
      planType: plan.plan_type,
      status: "LIMIT_REACHED",
      title,
      preview,
      fullReportSections: [],
      sectionPlan: foundation.sectionPlan,
      presentation,
      message: upgradeCopy.message,
      upgradeHref: getUpgradeHrefForUserPlan(plan.plan_type, "protected"),
    } satisfies PremiumReportOutput;
  }

  if (!isPremiumPlan(plan.plan_type)) {
    const upgradeCopy = getMonetizationUpgradeCopy({
      prompt: "report-preview",
      surface: "protected",
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
      planType: plan.plan_type,
      status: "PREVIEW_LOCKED",
      title,
      preview,
      fullReportSections: [],
      sectionPlan: foundation.sectionPlan,
      presentation,
      message: upgradeCopy.message,
      upgradeHref: getUpgradeHrefForUserPlan(plan.plan_type, "protected"),
    } satisfies PremiumReportOutput;
  }

  const fullReportSections = buildFullSections({
    foundation,
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
    planType: plan.plan_type,
    status: "FULL_ACCESS",
    title,
    preview,
    fullReportSections,
    sectionPlan: foundation.sectionPlan,
    presentation,
    message:
      "Full premium report generated from your saved chart context and current cycle data.",
    upgradeHref: null,
  } satisfies PremiumReportOutput;
}
