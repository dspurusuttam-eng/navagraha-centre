import "server-only";

import type { ConsultationStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getChartOverview, type ChartOverview } from "@/modules/onboarding/service";
import type { PlanetaryBody } from "@/modules/astrology/types";
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

function formatBody(body: PlanetaryBody) {
  return body.charAt(0) + body.slice(1).toLowerCase();
}

function formatSign(sign: string) {
  return sign.charAt(0) + sign.slice(1).toLowerCase();
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

function getDominantBodyNarrative(body: PlanetaryBody) {
  switch (body) {
    case "SUN":
      return "A solar emphasis supports visibility, direction, and stronger personal leadership themes.";
    case "MOON":
      return "A lunar emphasis supports emotional sensitivity, care, and intuitive responsiveness.";
    case "MARS":
      return "A Martian emphasis supports initiative, courage, and faster movement around priorities.";
    case "MERCURY":
      return "A Mercurial emphasis supports communication, analysis, and pattern recognition.";
    case "JUPITER":
      return "A Jupiter emphasis supports guidance, meaning, and long-range perspective.";
    case "VENUS":
      return "A Venus emphasis supports refinement, relationship awareness, and aesthetic harmony.";
    case "SATURN":
      return "A Saturn emphasis supports discipline, patience, and long-term structural focus.";
    case "RAHU":
      return "A Rahu emphasis points toward ambitious growth, experimentation, and unusual appetite for change.";
    case "KETU":
      return "A Ketu emphasis points toward detachment, introspection, and a quieter spiritual tone.";
    default:
      return "The chart carries a clear focal point that benefits from steady observation.";
  }
}

function getChallengeNarrative(body: PlanetaryBody) {
  switch (body) {
    case "SATURN":
      return "Saturn-heavy periods can feel slower or more demanding, so steady pacing matters more than urgency.";
    case "RAHU":
      return "Rahu-heavy patterns can amplify restlessness or overreach, so discernment is important before acting quickly.";
    case "KETU":
      return "Ketu-heavy patterns can create distance or uncertainty, so grounding routines help keep perspective clear.";
    case "MARS":
      return "Mars-heavy emphasis can sharpen drive, but it also benefits from restraint before conflict or overexertion.";
    default:
      return `${formatBody(body)} is active here, so balance matters as much as talent or momentum.`;
  }
}

function buildStrengths(context: ChartAnalysisContext) {
  if (!context.overview.chart) {
    return [
      "The protected account shell is ready to hold a structured birth profile and future chart record.",
      "Consultation context can still be stored safely while the chart layer is being completed.",
    ];
  }

  const chart = context.overview.chart;
  const strengths = [
    `${formatSign(chart.ascendantSign)} rising sets a composed frame for the chart's overall tone.`,
    ...chart.summary.dominantBodies
      .slice(0, 2)
      .map((body) => getDominantBodyNarrative(body)),
  ];

  const supportiveAspect = chart.aspects.find(
    (aspect) => aspect.type === "TRINE" || aspect.type === "CONJUNCTION"
  );

  if (supportiveAspect) {
    strengths.push(
      `A ${supportiveAspect.type.toLowerCase()} between ${supportiveAspect.source} and ${supportiveAspect.target} adds a clear point of natural flow in the chart.`
    );
  }

  return strengths.slice(0, 3);
}

function buildChallenges(context: ChartAnalysisContext) {
  if (!context.overview.chart) {
    return [
      "No stored natal chart is available yet, so the system is intentionally avoiding inferred astrological detail.",
    ];
  }

  const chart = context.overview.chart;
  const challengeLines = chart.summary.dominantBodies
    .slice(0, 2)
    .map((body) => getChallengeNarrative(body));
  const tenseAspect = chart.aspects.find(
    (aspect) => aspect.type === "SQUARE" || aspect.type === "OPPOSITION"
  );

  if (tenseAspect) {
    challengeLines.push(
      `A ${tenseAspect.type.toLowerCase()} involving ${tenseAspect.source} and ${tenseAspect.target} suggests a theme best handled with patience rather than pressure.`
    );
  }

  return challengeLines.slice(0, 3);
}

function buildRecommendations(context: ChartAnalysisContext) {
  if (!context.overview.birthProfile) {
    return [
      "Complete the birth-profile onboarding flow so the dashboard can ground future insights in saved chart data.",
      "Add a precise birth time and timezone if available to improve later chart interpretation.",
    ];
  }

  const chart = context.overview.chart;
  const recommendations = [
    "Use the report and chart pages together so narrative insight stays anchored to stored chart facts.",
  ];

  if (chart?.summary.dominantBodies.includes("SATURN")) {
    recommendations.push(
      "Favor steady routines and slower commitments over rushed decisions while Saturn themes remain prominent."
    );
  }

  if (chart?.summary.dominantBodies.includes("MOON")) {
    recommendations.push(
      "Keep emotional regulation and rest practices close to the center of your weekly rhythm."
    );
  }

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

  return `${name} chart currently centers on ${formatSign(chart.ascendantSign)} rising with ${dominantBodies} carrying the clearest emphasis. ${chart.summary.narrative}`;
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
