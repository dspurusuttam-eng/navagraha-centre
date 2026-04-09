import "server-only";

import type { ConsultationStatus } from "@prisma/client";
import { buildChartSummaryInsights } from "@/lib/astrology/chart-generator";
import { nakshatraLabelMap, planetLabelMap, zodiacSignLabelMap } from "@/lib/astrology/constants";
import { getPrisma } from "@/lib/prisma";
import { getChartOverview, type ChartOverview } from "@/modules/onboarding/service";
import type {
  ChartInsights,
  ConsultationNoteSummary,
} from "@/lib/ai/types";

type ChartAnalysisContext = {
  user: {
    id: string;
    name: string;
  } | null;
  overview: ChartOverview;
  consultationNotes: ConsultationNoteSummary[];
};

export const fallbackChartInsights: ChartInsights = {
  summary: "No chart data available yet.",
  strengths: [],
  challenges: [],
  recommendations: [],
};

export function createEmptyChartOverview(): ChartOverview {
  return {
    preferredLanguage: null,
    preferredLanguageLabel: "English",
    birthProfile: null,
    chartRecord: null,
    chart: null,
  };
}

function createFallbackChartAnalysisContext(): ChartAnalysisContext {
  return {
    user: null,
    overview: createEmptyChartOverview(),
    consultationNotes: [],
  };
}

function formatBody(body: keyof typeof planetLabelMap) {
  return planetLabelMap[body];
}

function formatSign(sign: keyof typeof zodiacSignLabelMap) {
  return zodiacSignLabelMap[sign];
}

function formatStatus(status: ConsultationStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function firstNameFrom(name: string | null | undefined) {
  if (!name) {
    return "Your";
  }

  return name.split(/\s+/)[0] ?? "Your";
}

function buildStrengths(context: ChartAnalysisContext) {
  if (!context.overview.chart) {
    return [
      "The protected account shell is ready to hold a structured birth profile and future chart record.",
      "Consultation context can still be stored safely while the chart layer is being completed.",
    ];
  }

  const chart = context.overview.chart;

  return buildChartSummaryInsights(chart).strengths.slice(0, 3);
}

function buildChallenges(context: ChartAnalysisContext) {
  if (!context.overview.chart) {
    return [
      "No stored natal chart is available yet, so the system is intentionally avoiding inferred astrological detail.",
    ];
  }

  const chart = context.overview.chart;

  return buildChartSummaryInsights(chart).challenges.slice(0, 3);
}

function buildRecommendations(context: ChartAnalysisContext) {
  if (!context.overview.birthProfile) {
    return [
      "Complete the birth-profile onboarding flow so the dashboard can ground future insights in saved chart data.",
      "Add a precise birth time and timezone if available to improve later chart interpretation.",
    ];
  }

  const chart = context.overview.chart;
  const recommendations = chart
    ? buildChartSummaryInsights(chart).recommendations
    : [
        "Use the report and chart pages together so narrative insight stays anchored to stored chart facts.",
      ];

  if (context.consultationNotes.length) {
    recommendations.push(
      "Review your latest consultation note before your next question so the assistant can stay aligned with that context."
    );
  } else {
    recommendations.push(
      "Book a consultation when you want a human-led reading that can weigh nuance beyond the first automated summary."
    );
  }

  return recommendations.slice(0, 3);
}

function buildSummary(context: ChartAnalysisContext) {
  const name = firstNameFrom(context.user?.name);

  if (!context.overview.chart) {
    return `${name} private workspace is ready for chart-aware guidance, but a stored natal chart is still needed before the system should offer a fuller astrological summary.`;
  }

  const chart = context.overview.chart;
  const dominantBodies = chart.summary.dominantBodies
    .slice(0, 3)
    .map(formatBody)
    .join(", ");
  const dashaLine = chart.currentDasha
    ? ` ${formatBody(chart.currentDasha.lord)} mahadasha is currently active.`
    : "";
  const lagnaNakshatra = chart.lagna?.nakshatra
    ? ` Lagna falls in ${nakshatraLabelMap[chart.lagna.nakshatra.name]} pada ${chart.lagna.nakshatra.pada}.`
    : "";

  return `${name} chart currently centers on ${formatSign(chart.ascendantSign)} rising with ${dominantBodies} carrying the clearest emphasis.${dashaLine}${lagnaNakshatra} ${chart.summary.narrative}`;
}

export async function loadChartAnalysisContext(
  userId: string
): Promise<ChartAnalysisContext> {
  try {
    const prisma = getPrisma();
    const [user, overview, consultations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
        },
      }),
      getChartOverview(userId),
      prisma.consultation.findMany({
        where: { userId },
        orderBy: [
          { scheduledFor: "desc" },
          { updatedAt: "desc" },
        ],
        take: 3,
        select: {
          id: true,
          serviceLabel: true,
          status: true,
          scheduledFor: true,
          internalNotes: true,
          intakeSummary: true,
          topicFocus: true,
        },
      }),
    ]);

    return {
      user,
      overview,
      consultationNotes: consultations.map((consultation) => ({
        id: consultation.id,
        serviceLabel: consultation.serviceLabel,
        statusLabel: formatStatus(consultation.status),
        scheduledForUtc: consultation.scheduledFor?.toISOString() ?? null,
        note:
          consultation.internalNotes ??
          consultation.intakeSummary ??
          consultation.topicFocus ??
          "A consultation context record is available for future follow-up.",
      })),
    };
  } catch (error) {
    console.error("loadChartAnalysisContext failed", error);

    return createFallbackChartAnalysisContext();
  }
}

export async function generateChartInsights(
  userId: string
): Promise<ChartInsights> {
  try {
    const context = await loadChartAnalysisContext(userId);

    if (!context.overview.chart || !context.overview.chartRecord) {
      return fallbackChartInsights;
    }

    return {
      summary: buildSummary(context),
      strengths: buildStrengths(context),
      challenges: buildChallenges(context),
      recommendations: buildRecommendations(context),
    };
  } catch (error) {
    console.error("generateChartInsights failed", error);

    return fallbackChartInsights;
  }
}
