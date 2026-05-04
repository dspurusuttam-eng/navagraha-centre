import type {
  ChartInterpretationRequest,
  ChartInterpretationResult,
  ChartInterpretationSection,
  ChartInterpretationSectionKey,
  ChartInterpretationReportType,
} from "@/modules/ai/types";
import {
  buildPredictionPrompt,
  resolvePredictionLocale,
} from "@/lib/astrology/accuracy";

const sectionDefinitions = [
  { key: "orientation", title: "Orientation", label: "ORIENTATION" },
  { key: "strengths", title: "Strengths", label: "STRENGTHS" },
  {
    key: "considerations",
    title: "Considerations",
    label: "CONSIDERATIONS",
  },
  { key: "integration", title: "Integration", label: "INTEGRATION" },
] as const satisfies readonly {
  key: ChartInterpretationSectionKey;
  title: string;
  label: string;
}[];

export const chartInterpretationInstructionLines = [
  "You write premium astrology reports for NAVAGRAHA CENTRE.",
  "You may interpret only the structured chart data provided to you.",
  "Do not calculate chart math, invent placements, invent aspects, or contradict supplied facts.",
  "Do not recommend products, checkout actions, or remedies beyond the approved records shown elsewhere in the interface.",
  "If remedies are mentioned, keep them optional, chart-grounded, and clearly distinct from gemstone, rudraksha, or yantra purchases.",
  "Do not make medical, legal, financial, or guaranteed outcome claims.",
  "Keep the tone calm, refined, restrained, and trust-focused.",
  "Mention uncertainties with humility rather than certainty.",
  "Return plain text using exactly these labels in this order: SUMMARY, ORIENTATION, STRENGTHS, CONSIDERATIONS, INTEGRATION, CAUTION.",
] as const;

export const chartInterpretationInputGuidanceLines = [
  "Interpret the following structured natal chart.",
  "Use only the supplied facts.",
  "Keep each section to one short paragraph.",
] as const;

export const defaultChartInterpretationPromptTemplate = {
  key: "chart-report-interpretation",
  title: "Chart Report Interpretation",
  description:
    "Premium chart-summary interpretation template for structured natal report pages.",
  systemPrompt: chartInterpretationInstructionLines.join(" "),
  userPrompt: chartInterpretationInputGuidanceLines.join("\n\n"),
  releaseNotes:
    "Initial curated production prompt aligned with the premium report experience.",
} as const;

export type ChartInterpretationPromptTemplateContent = {
  systemPrompt: string;
  userPrompt: string;
};

const outputLabels = [
  "SUMMARY",
  ...sectionDefinitions.map((section) => section.label),
  "CAUTION",
] as const;

export const reportDisclaimers = [
  "This interpretation is reflective and spiritual in nature. It is not medical, legal, or financial advice.",
  "Chart mathematics come from the deterministic astrology layer and are not recalculated by AI.",
  "Remedies on this page come only from approved NAVAGRAHA CENTRE records and should be approached with personal discernment.",
  "Gemstones, rudraksha, yantra, puja, and more formal observances are consultative and optional; they should be taken up only after suitability review or direct consultation.",
] as const;

function getReportTypeInterpretationGuidance(
  reportType: ChartInterpretationReportType | undefined
) {
  if (reportType !== "FULL_KUNDLI") {
    return [
      "Keep the report balanced, chart-grounded, and aligned to the asked report type.",
      "Use the supplied chart facts, signals, and disclaimers only.",
    ];
  }

  return [
    "For FULL_KUNDLI reports, make the summary read like an overall life-theme overview rather than a narrow topic answer.",
    "Cover chart foundation, personality tone, house emphasis, planetary influence, dasha rhythm, transit tone, life-area snapshots, and practical guidance across the four sections.",
    "When available, mention Lagna, Moon sign, Sun sign, house placements, divisional charts such as D9 or D10, and timing layers in simple public-friendly language.",
    "Keep deeper house, timing, yoga, and remedy detail grounded and premium-calibrated without exposing raw chart data.",
  ];
}

function buildPromptPayload(request: ChartInterpretationRequest) {
  const moonSign = request.chart.planets.find((planet) => planet.body === "MOON")?.sign ?? null;
  const sunSign = request.chart.planets.find((planet) => planet.body === "SUN")?.sign ?? null;

  return {
    reportType: request.reportType ?? "FULL_KUNDLI",
    subjectName: request.subjectName,
    preferredLanguage: request.preferredLanguageLabel,
    lagnaSign: request.chart.ascendantSign,
    moonSign,
    sunSign,
    chart: {
      ascendantSign: request.chart.ascendantSign,
      houseSystem: request.chart.houseSystem,
      summary: request.chart.summary,
      planets: request.chart.planets.map((planet) => ({
        body: planet.body,
        sign: planet.sign,
        house: planet.house,
        retrograde: planet.retrograde,
      })),
      houses: request.chart.houses.map((house) => ({
        house: house.house,
        sign: house.sign,
        ruler: house.ruler,
      })),
      aspects: request.chart.aspects.map((aspect) => ({
        source: aspect.source,
        type: aspect.type,
        target: aspect.target,
        orb: aspect.orb,
        exact: aspect.exact,
      })),
      divisionalCharts: request.chart.divisionalCharts.map((chart) => ({
        code: chart.code,
        title: chart.title,
        focus: chart.focus,
        ascendantSign: chart.ascendantSign,
        highlights: chart.highlights.slice(0, 3),
      })),
      currentDashaLord: request.chart.currentDasha?.lord ?? null,
    },
    signals: request.signals.map((signal) => ({
      key: signal.key,
      title: signal.title,
      level: signal.level,
      rationale: signal.rationale,
      relatedBodies: signal.relatedBodies,
    })),
    disclaimers: reportDisclaimers,
  };
}

export function buildChartInterpretationPrompt(
  request: ChartInterpretationRequest,
  template: ChartInterpretationPromptTemplateContent = defaultChartInterpretationPromptTemplate
) {
  const payload = buildPromptPayload(request);
  const locale = resolvePredictionLocale(request.preferredLanguageLabel);
  const typeGuidance = getReportTypeInterpretationGuidance(request.reportType);
  const structuredPrompt = buildPredictionPrompt({
    toolType: "REPORT",
    locale,
    baseSystemPrompt: template.systemPrompt,
    preferredLanguageLabel: request.preferredLanguageLabel,
    astrologyDataSummary: payload,
    outputFormatRequirements: [
      "Return plain text sections only.",
      "Use exactly these labels in this order: SUMMARY, ORIENTATION, STRENGTHS, CONSIDERATIONS, INTEGRATION, CAUTION.",
      "Keep each section to one concise and readable paragraph.",
      ...typeGuidance,
    ],
  });

  return {
    instructions: structuredPrompt.instructions,
    input: [
      template.userPrompt,
      `Report type: ${payload.reportType}.`,
      structuredPrompt.input,
    ].join("\n\n"),
  };
}

function cleanSectionValue(value: string | undefined) {
  return value?.trim().replace(/\n{3,}/g, "\n\n") ?? "";
}

export function createFallbackInterpretation(
  request: ChartInterpretationRequest,
  providerKey = "mock-curated",
  model = "curated-template"
): ChartInterpretationResult {
  const dominantBodies = request.chart.summary.dominantBodies
    .map((body) => body.toLowerCase())
    .join(", ");
  const primarySignal = request.signals[0];
  const isFullKundli = request.reportType === "FULL_KUNDLI";
  const orientationSummary = isFullKundli
    ? `The Full Kundli view centers on ${request.chart.ascendantSign.toLowerCase()} rising with ${dominantBodies || "measured"} emphasis, so the chart reads best as a complete life pattern rather than a single-topic prediction.`
    : `The stored chart points toward a ${request.chart.ascendantSign.toLowerCase()} ascendant and a tone shaped most clearly by ${dominantBodies || "the chart's dominant bodies"}.`;
  const strengthsSummary = isFullKundli
    ? `The strongest reading emerges when you connect the birth chart foundation, house pattern, and current timing rhythm. ${request.chart.summary.narrative} The chart supports steady growth, measured judgment, and a calmer reading of life areas over time.`
    : `The chart's strengths appear strongest when you trust rhythm over urgency. ${request.chart.summary.narrative} This suggests depth, patience, and a capacity to grow through well-held commitments.`;
  const considerationsSummary = isFullKundli
    ? primarySignal
      ? `${primarySignal.title} ${primarySignal.rationale} In a Full Kundli frame, that caution belongs beside house emphasis, timing rhythm, and practical pacing rather than as a fixed fate statement.`
      : "The Full Kundli view asks for balanced pacing across career, relationships, money, health, study, and purpose. Stronger results are more likely to come from consistency, reflection, and refined restraint than from dramatic interventions."
    : primarySignal
      ? `${primarySignal.title} ${primarySignal.rationale} The helpful question is not how to force a change, but how to hold the chart's pressure points with more clarity and less strain.`
      : "The chart asks for discernment around overstretching. Stronger results are more likely to come from consistency, reflection, and refined restraint than from dramatic interventions.";
  const integrationSummary = isFullKundli
    ? "Keep the practical foundation simple: stable routine, measured devotional practice, and gradual refinement across the major life areas. Read the report as a structured mirror for self-understanding, not as a fixed decree. Where divisional charts such as D9 or D10 are available, treat them as supportive refinement rather than a separate destiny."
    : "Keep the practical foundation simple: stable routine, measured devotional practice, and gradual refinement. The report is best read as a structured mirror for personal reflection rather than a fixed prediction.";

  return {
    providerKey,
    model,
    generatedAtUtc: new Date().toISOString(),
    summary: isFullKundli
      ? `Full Kundli view for ${request.chart.ascendantSign.toLowerCase()} rising suggests a life pattern that benefits from quiet steadiness, careful pacing, and reflective structure across the whole chart.`
      : `${request.chart.ascendantSign.toLowerCase()} rising with ${dominantBodies || "measured"} emphasis suggests a chart that benefits from quiet steadiness, careful pacing, and reflective structure.`,
    sections: [
      {
        key: "orientation",
        title: "Orientation",
        body: orientationSummary,
      },
      {
        key: "strengths",
        title: "Strengths",
        body: strengthsSummary,
      },
      {
        key: "considerations",
        title: "Considerations",
        body: considerationsSummary,
      },
      {
        key: "integration",
        title: "Integration",
        body: integrationSummary,
      },
    ],
    caution:
      "This explanation is reflective only. It does not replace practical judgement or professional advice in medical, legal, or financial matters.",
    promptTemplateKey:
      request.context?.promptTemplateKey ??
      defaultChartInterpretationPromptTemplate.key,
    promptVersionLabel: request.context?.promptVersionLabel ?? "v1",
  };
}

export function parseChartInterpretationText(
  rawText: string,
  request: ChartInterpretationRequest,
  providerKey: string,
  model: string
): ChartInterpretationResult {
  const pattern =
    /(SUMMARY|ORIENTATION|STRENGTHS|CONSIDERATIONS|INTEGRATION|CAUTION):\s*([\s\S]*?)(?=\n(?:SUMMARY|ORIENTATION|STRENGTHS|CONSIDERATIONS|INTEGRATION|CAUTION):|\s*$)/g;

  const sections = new Map<string, string>();

  for (const match of rawText.matchAll(pattern)) {
    sections.set(match[1], cleanSectionValue(match[2]));
  }

  const summary = sections.get("SUMMARY");
  const caution = sections.get("CAUTION");
  const parsedSections: ChartInterpretationSection[] = sectionDefinitions.map(
    (section) => ({
      key: section.key,
      title: section.title,
      body: cleanSectionValue(sections.get(section.label)),
    })
  );

  if (
    !summary ||
    !caution ||
    parsedSections.some((section) => !section.body) ||
    outputLabels.some((label) => !sections.has(label))
  ) {
    return createFallbackInterpretation(request, providerKey, model);
  }

  return {
    providerKey,
    model,
    generatedAtUtc: new Date().toISOString(),
    summary,
    sections: parsedSections,
    caution,
  };
}
