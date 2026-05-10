import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { AstrologyInfrastructureSnapshot } from "@/modules/astrology/core";
import {
  buildAstrologyChartSummary,
  createAstrologyInfrastructureSnapshot,
  type AstrologyChartSummary,
} from "@/modules/astrology/core";
import { normalizeUnifiedSiderealChart } from "@/modules/astrology/core/normalize";
import {
  buildDashaInfrastructureSnapshot,
  type DashaInfrastructureSnapshot,
} from "@/modules/astrology/dasha";
import {
  buildDoshaDetectionEngine,
  type DoshaInfrastructureSnapshot,
} from "@/modules/astrology/dosha";
import { buildRemedyIntelligenceEngine } from "@/modules/astrology/remedy/foundation";
import {
  buildTransitPersonalizedFoundation,
  type TransitPersonalizedFoundationSnapshot,
} from "@/modules/astrology/transit";
import {
  buildYogaDetectionEngine,
  type YogaInfrastructureSnapshot,
} from "@/modules/astrology/yoga";
import type { PanchangContextOutput } from "@/modules/panchang";

type ReadySnapshot<T> = AstrologyInfrastructureSnapshot<T> & {
  status: "ready";
  data: T;
};

export type DailyRemedyEngineInput = {
  remedyDate?: string | Date | null;
  panchang?: PanchangContextOutput | null | undefined;
  chart?: UnifiedSiderealChart | null | undefined;
  dashaSnapshot?: DashaInfrastructureSnapshot | null | undefined;
  transitSnapshot?: TransitPersonalizedFoundationSnapshot | null | undefined;
  doshaSnapshot?: DoshaInfrastructureSnapshot | null | undefined;
  yogaSnapshot?: YogaInfrastructureSnapshot | null | undefined;
};

export type DailyRemedyEngineData = {
  remedyDate: string;
  sourceContext: string[];
  dailyRemedy: string[];
  spiritualGuidance: string;
  mantraSuggestion: string | null;
  charitySuggestion: string | null;
  disciplineSuggestion: string | null;
  caution: string[];
  optional: true;
  guaranteedResult: false;
  missingReason: string | null;
  chartSummary: AstrologyChartSummary;
  dailyTone: string | null;
  summary: string;
  highlights: string[];
  warnings: string[];
  reportSummary: string;
  aiSummary: string;
};

export type DailyRemedyInfrastructureSnapshot =
  AstrologyInfrastructureSnapshot<DailyRemedyEngineData>;

function normalizeDate(value?: string | Date | null) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const resolved = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  return Number.isNaN(resolved.getTime())
    ? new Date().toISOString().slice(0, 10)
    : resolved.toISOString().slice(0, 10);
}

function isReady<T>(
  snapshot: AstrologyInfrastructureSnapshot<T> | null | undefined
): snapshot is ReadySnapshot<T> {
  return Boolean(snapshot?.status === "ready" && snapshot.data);
}

function mergeUnique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function buildSourceContext(input: {
  remedyDate: string;
  panchang?: PanchangContextOutput | null | undefined;
  chart?: UnifiedSiderealChart | null | undefined;
  dashaSnapshot?: DashaInfrastructureSnapshot | null | undefined;
  transitSnapshot?: TransitPersonalizedFoundationSnapshot | null | undefined;
  doshaSnapshot?: DoshaInfrastructureSnapshot | null | undefined;
  yogaSnapshot?: YogaInfrastructureSnapshot | null | undefined;
  remedySummary: string | null;
}) {
  const sourceContext: string[] = [];

  if (input.panchang) {
    sourceContext.push(
      `Panchang ${input.panchang.panchangDate} at ${input.panchang.locationLabel} (${input.panchang.timezone}).`
    );
    sourceContext.push(`Daily tone: ${input.panchang.dailyTone}.`);
    sourceContext.push(
      `Caution windows: ${input.panchang.timingWindows.cautionWindows.slice(0, 2).join(" | ")}.`
    );
    sourceContext.push(
      `Supportive timing: ${input.panchang.timingWindows.recommendedActivities.slice(0, 2).join(" | ")}.`
    );
  }

  if (isReady(input.dashaSnapshot)) {
    const current = input.dashaSnapshot.data.current_dasha_context.mahadasha;
    sourceContext.push(
      current
        ? `Dasha: ${current.planet} Mahadasha is active${input.dashaSnapshot.data.current_dasha_context.antardasha ? ` with ${input.dashaSnapshot.data.current_dasha_context.antardasha.planet} Antardasha` : ""}.`
        : "Dasha: current Mahadasha is unavailable."
    );
  }

  if (isReady(input.transitSnapshot)) {
    sourceContext.push(input.transitSnapshot.data.transitSummary);
    input.transitSnapshot.data.majorTransitHighlights.slice(0, 2).forEach((planet) => {
      sourceContext.push(planet.summary);
    });
  }

  if (isReady(input.doshaSnapshot)) {
    const presentDoshas = input.doshaSnapshot.data.doshas.filter((entry) => entry.status === "present");
    if (presentDoshas.length > 0) {
      sourceContext.push(
        `Dosha context: ${presentDoshas
          .slice(0, 2)
          .map((entry) => `${entry.doshaName} (${entry.severity})`)
          .join(" | ")}.`
      );
    }
  }

  if (isReady(input.yogaSnapshot)) {
    const presentYogas = input.yogaSnapshot.data.yogas.filter((entry) => entry.status === "present");
    if (presentYogas.length > 0) {
      sourceContext.push(
        `Yoga context: ${presentYogas
          .slice(0, 2)
          .map((entry) => `${entry.yogaName} (${entry.strength})`)
          .join(" | ")}.`
      );
    }
  }

  if (input.remedySummary) {
    sourceContext.push(`Remedy context: ${input.remedySummary}`);
  }

  if (input.chart?.verification?.is_verified_for_chart_logic) {
    sourceContext.push("Active Kundli context: verified chart overlay is available.");
  }

  return mergeUnique(sourceContext);
}

function buildDailyRemedyLines(input: {
  panchang?: PanchangContextOutput | null | undefined;
  dashaSnapshot?: DashaInfrastructureSnapshot | null | undefined;
  transitSnapshot?: TransitPersonalizedFoundationSnapshot | null | undefined;
  doshaSnapshot?: DoshaInfrastructureSnapshot | null | undefined;
  yogaSnapshot?: YogaInfrastructureSnapshot | null | undefined;
  remedyTitles: string[];
}) {
  const lines: string[] = [];

  if (input.panchang) {
    lines.push(
      `Follow ${input.panchang.locationLabel} Panchang timing as planning support, especially around the listed caution windows.`
    );
    lines.push(`Use ${input.panchang.dailyTone.toLowerCase()} pacing for the day.`);
  }

  if (isReady(input.dashaSnapshot) && input.dashaSnapshot.data.current_dasha_context.mahadasha) {
    lines.push(
      `${input.dashaSnapshot.data.current_dasha_context.mahadasha.planet} Mahadasha suggests keeping long-range priorities steady and practical.`
    );
  }

  if (isReady(input.transitSnapshot)) {
    const highlight = input.transitSnapshot.data.majorTransitHighlights[0];
    if (highlight) {
      lines.push(
        `${highlight.planetLabel} transit can be used as a timing cue for ${highlight.lifeAreaFocus[0] ?? "the current day"}.`
      );
    }
  }

  if (isReady(input.doshaSnapshot)) {
    const present = input.doshaSnapshot.data.doshas.find((entry) => entry.status === "present");
    if (present) {
      lines.push(
        `${present.doshaName} is read as context only; keep the response calm and practical.`
      );
    }
  }

  if (isReady(input.yogaSnapshot)) {
    const present = input.yogaSnapshot.data.yogas.find((entry) => entry.status === "present");
    if (present) {
      lines.push(
        `${present.yogaName} may support a constructive focus, but it should not be treated as a guarantee.`
      );
    }
  }

  if (input.remedyTitles.length > 0) {
    lines.push(
      `Optional support items: ${input.remedyTitles.slice(0, 3).join(" | ")}.`
    );
  }

  return mergeUnique(lines);
}

function pickSupportSentence(
  fallback: string,
  options: Array<string | null | undefined>
) {
  return options.find((value) => Boolean(value)) ?? fallback;
}

function buildSupportSuggestions(input: {
  panchang?: PanchangContextOutput | null | undefined;
  remedyTitles: string[];
  remedyTypes: string[];
}) {
  const mantraSuggestion = pickSupportSentence(
    input.panchang
      ? "A short calm mantra after sunrise can support a steady day."
      : "A short mantra practice can be used as a gentle support routine.",
    [
      input.remedyTypes.includes("mantra")
        ? "Use the mantra support routine that feels calm and sustainable."
        : null,
      input.remedyTitles.find((title) => /mantra/i.test(title)) ?? null,
    ]
  );

  const charitySuggestion = pickSupportSentence(
    "Choose one small act of service or charity if you want a gentle support practice.",
    [
      input.remedyTypes.includes("charity")
        ? "Keep charity modest, regular, and within your budget."
        : null,
      input.remedyTitles.find((title) => /charity|service/i.test(title)) ?? null,
    ]
  );

  const disciplineSuggestion = pickSupportSentence(
    "Use one stable routine or discipline to keep the day grounded.",
    [
      input.panchang
        ? "Use Rahu Kaal, Gulika Kaal, and Yamaganda as planning caution windows rather than danger signals."
        : null,
      input.remedyTypes.includes("discipline")
        ? "Keep any discipline or fasting practice light, safe, and sustainable."
        : null,
    ]
  );

  return {
    mantraSuggestion: mantraSuggestion ?? null,
    charitySuggestion: charitySuggestion ?? null,
    disciplineSuggestion: disciplineSuggestion ?? null,
  };
}

function buildCautions(input: {
  panchang?: PanchangContextOutput | null | undefined;
  remedyTitles: string[];
  doshaSnapshot?: DoshaInfrastructureSnapshot | null | undefined;
  yogaSnapshot?: YogaInfrastructureSnapshot | null | undefined;
  dashaSnapshot?: DashaInfrastructureSnapshot | null | undefined;
  transitSnapshot?: TransitPersonalizedFoundationSnapshot | null | undefined;
  chart?: UnifiedSiderealChart | null | undefined;
}) {
  const cautions: string[] = [];

  if (input.panchang) {
    cautions.push(...input.panchang.timingWindows.cautionWindows);
    cautions.push("Abhijit Muhurta and Brahma Muhurta are supportive planning references, not guarantees.");
  }

  if (isReady(input.doshaSnapshot)) {
    cautions.push(
      ...input.doshaSnapshot.data.warnings,
      "Dosha readings are contextual and should not be treated as fear-based conclusions."
    );
  }

  if (isReady(input.yogaSnapshot)) {
    cautions.push(
      ...input.yogaSnapshot.data.warnings,
      "Yoga readings are structural patterns and should not be treated as certainty language."
    );
  }

  if (isReady(input.dashaSnapshot) && !input.dashaSnapshot.data.current_dasha_context.mahadasha) {
    cautions.push("Dasha context is incomplete, so timing support should stay broad and cautious.");
  }

  if (isReady(input.transitSnapshot) && !input.transitSnapshot.data.natalOverlayAvailable) {
    cautions.push("Transit overlay is general only; no exact natal overlay should be inferred.");
  }

  if (input.remedyTitles.some((title) => /gemstone/i.test(title))) {
    cautions.push("Gemstone suggestions require qualified astrologer review before wearing.");
  }

  if (input.remedyTitles.some((title) => /rudraksha/i.test(title))) {
    cautions.push("Rudraksha suggestions are optional and should never be forced.");
  }

  if (!input.chart?.verification?.is_verified_for_chart_logic && input.chart) {
    cautions.push("Chart basis is not verified for astrology logic, so remedy guidance stays very general.");
  }

  return mergeUnique([
    ...cautions,
    "No remedy here guarantees success, wealth, marriage, health, or result certainty.",
    "Use the guidance as an optional support layer, not as a substitute for judgment or consultation.",
  ]);
}

function buildDailyGuidance(input: {
  panchang?: PanchangContextOutput | null | undefined;
  remedyTitles: string[];
  dailyLines: string[];
}) {
  const firstTone = input.panchang?.dailyTone ?? "Balanced";
  const firstSentence = input.panchang
    ? `${firstTone} daily support from ${input.panchang.locationLabel}.`
    : "Daily support assembled from available astrology context.";

  const dailyTone = input.panchang?.dailyTone ?? "Balanced";
  const spiritualGuidance = [
    firstSentence,
    input.dailyLines[0] ?? "Keep the day calm, practical, and non-forced.",
    input.remedyTitles[0] ? `Optional support: ${input.remedyTitles[0]}.` : null,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return {
    spiritualGuidance,
    dailyTone,
  };
}

function buildSummary(input: {
  sourceContext: string[];
  dailyRemedy: string[];
  remedyTitles: string[];
  missingReason: string | null;
}) {
  return {
    summary: input.sourceContext.length
      ? `Daily remedy assembled from ${input.sourceContext.length} available context sources with optional, non-guaranteed support suggestions.`
      : "Daily remedy context is unavailable.",
    highlights: input.dailyRemedy.slice(0, 3),
    warnings: [
      ...(input.missingReason ? [input.missingReason] : []),
      "Remedy guidance is optional and should not be treated as a guaranteed outcome.",
    ],
    reportSummary:
      "The daily remedy engine provides calm, optional support suggestions based on the currently available Panchang, chart, timing, dosha, yoga, Dasha, and transit context.",
    aiSummary:
      "Use the daily remedy output as a soft support layer. Do not turn it into certainty language, pressure, or a purchase requirement.",
  };
}

function buildReadinessChartSummary(chart: UnifiedSiderealChart | null): AstrologyChartSummary {
  if (chart) {
    const normalized = normalizeUnifiedSiderealChart(chart);

    if (normalized) {
      return buildAstrologyChartSummary(normalized, {
        chartKind: "READINESS",
        note:
          "Daily remedy is assembled from available astrology context with optional, non-guaranteed support suggestions.",
      });
    }
  }

  return {
    version: "2026-05",
    chart_kind: "READINESS",
    ascendant_sign: null,
    moon_sign: null,
    dominant_bodies: [],
    supportive_bodies: [],
    challenging_bodies: [],
    active_houses: [],
    note: "Daily remedy is running in readiness mode using currently available context.",
  };
}

export function buildDailyRemedyEngine(input: DailyRemedyEngineInput): DailyRemedyInfrastructureSnapshot {
  const normalizedChart = input.chart ? normalizeUnifiedSiderealChart(input.chart) : null;
  const panchang = input.panchang ?? null;
  const remedyDate = normalizeDate(input.remedyDate ?? panchang?.panchangDate ?? input.chart?.birth_context?.date_local);

  const doshaSnapshot =
    input.doshaSnapshot ?? (input.chart ? buildDoshaDetectionEngine({ chart: input.chart }) : null);
  const yogaSnapshot =
    input.yogaSnapshot ?? (input.chart ? buildYogaDetectionEngine({ chart: input.chart }) : null);
  const dashaSnapshot =
    input.dashaSnapshot ?? (input.chart ? buildDashaInfrastructureSnapshot({ chart: input.chart, asOfDateUtc: panchang?.generatedAt ?? new Date() }) : null);
  const transitSnapshot =
    input.transitSnapshot ?? (input.chart ? buildTransitPersonalizedFoundation({ transitDateUtc: panchang?.as_of_utc ?? new Date(), natalChart: input.chart }) : null);
  const remedySnapshot =
    input.chart
      ? buildRemedyIntelligenceEngine({
          chart: input.chart,
          doshaSnapshot,
          yogaSnapshot,
        })
      : null;

  const hasAnySource = Boolean(
    panchang ||
      normalizedChart ||
      isReady(doshaSnapshot) ||
      isReady(yogaSnapshot) ||
      isReady(dashaSnapshot) ||
      isReady(transitSnapshot) ||
      isReady(remedySnapshot)
  );

  if (!hasAnySource) {
    return createAstrologyInfrastructureSnapshot({
      status: "unavailable",
      data: null,
      error: {
        code: "INVALID_CHART_CONTEXT",
        message:
          "Daily remedy requires Panchang or chart context, or at least one structured astrology source.",
      },
    });
  }

  const remedyTitles = [
    ...(isReady(remedySnapshot) ? remedySnapshot.data.remedies.slice(0, 4).map((remedy) => remedy.title) : []),
    ...(isReady(doshaSnapshot)
      ? doshaSnapshot.data.doshas
          .filter((entry) => entry.status === "present" || entry.status === "partial")
          .slice(0, 2)
          .map((entry) => entry.doshaName)
      : []),
    ...(isReady(yogaSnapshot)
      ? yogaSnapshot.data.yogas
          .filter((entry) => entry.status === "present" || entry.status === "partial")
          .slice(0, 2)
          .map((entry) => entry.yogaName)
      : []),
  ];

  const dailyRemedy = buildDailyRemedyLines({
    panchang,
    dashaSnapshot,
    transitSnapshot,
    doshaSnapshot,
    yogaSnapshot,
    remedyTitles,
  });
  const sourceContext = buildSourceContext({
    remedyDate,
    panchang,
    chart: input.chart,
    dashaSnapshot,
    transitSnapshot,
    doshaSnapshot,
    yogaSnapshot,
    remedySummary: isReady(remedySnapshot) ? remedySnapshot.data.summary : null,
  });
  const support = buildSupportSuggestions({
    panchang,
    remedyTitles,
    remedyTypes: isReady(remedySnapshot)
      ? remedySnapshot.data.remedies.map((remedy) => remedy.remedyType)
      : [],
  });
  const cautions = buildCautions({
    panchang,
    remedyTitles,
    doshaSnapshot,
    yogaSnapshot,
    dashaSnapshot,
    transitSnapshot,
    chart: input.chart,
  });
  const guidance = buildDailyGuidance({
    panchang,
    remedyTitles,
    dailyLines: dailyRemedy,
  });
  const summaryPack = buildSummary({
    sourceContext,
    dailyRemedy,
    remedyTitles,
    missingReason: null,
  });
  const chartSummary = isReady(remedySnapshot)
    ? remedySnapshot.data.chartSummary
    : buildReadinessChartSummary(input.chart ?? null);

  const resultData: DailyRemedyEngineData = {
    remedyDate,
    sourceContext,
    dailyRemedy,
    spiritualGuidance: guidance.spiritualGuidance,
    mantraSuggestion: support.mantraSuggestion,
    charitySuggestion: support.charitySuggestion,
    disciplineSuggestion: support.disciplineSuggestion,
    caution: cautions,
    optional: true,
    guaranteedResult: false,
    missingReason: null,
    chartSummary,
    dailyTone: guidance.dailyTone,
    summary: summaryPack.summary,
    highlights: summaryPack.highlights,
    warnings: summaryPack.warnings,
    reportSummary: summaryPack.reportSummary,
    aiSummary: summaryPack.aiSummary,
  };

  return createAstrologyInfrastructureSnapshot({
    status:
      sourceContext.length > 0
        ? "ready"
        : "partial",
    data: resultData,
    error: null,
  });
}

export const buildDailyRemedyInfrastructureSnapshot = buildDailyRemedyEngine;
