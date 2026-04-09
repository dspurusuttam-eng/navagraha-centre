import "server-only";

import { buildChartSummaryInsights } from "@/lib/astrology/chart-generator";
import { nakshatraLabelMap, planetLabelMap, zodiacSignLabelMap } from "@/lib/astrology/constants";
import { fallbackChartInsights, loadChartAnalysisContext } from "@/lib/ai/chart-analysis";
import { suggestRemedies } from "@/lib/ai/remedies-engine";
import type { ConsultationReply } from "@/lib/ai/types";
import { getAstrologyService } from "@/modules/astrology/server";
import type { BirthDetails, NatalChartResponse, PlanetPosition, PlanetaryBody } from "@/modules/astrology/types";

const supportedQuestionPattern =
  /\b(ascendant|rising|chart|theme|themes|planet|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu|house|aspect|cycle|transit|dasha|remedy|recommend)\b/i;

const bodyPatterns = [
  { body: "SUN", pattern: /\bsun\b|\bsolar\b/i },
  { body: "MOON", pattern: /\bmoon\b|\blunar\b/i },
  { body: "MARS", pattern: /\bmars\b/i },
  { body: "MERCURY", pattern: /\bmercury\b/i },
  { body: "JUPITER", pattern: /\bjupiter\b/i },
  { body: "VENUS", pattern: /\bvenus\b/i },
  { body: "SATURN", pattern: /\bsaturn\b/i },
  { body: "RAHU", pattern: /\brahu\b|\bnorth node\b/i },
  { body: "KETU", pattern: /\bketu\b|\bsouth node\b/i },
] as const satisfies ReadonlyArray<{
  body: PlanetaryBody;
  pattern: RegExp;
}>;

function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/g, " ");
}

function formatBody(body: PlanetaryBody) {
  return planetLabelMap[body];
}

function formatSign(sign: keyof typeof zodiacSignLabelMap) {
  return zodiacSignLabelMap[sign];
}

function ordinalHouse(house: number) {
  const suffix =
    house % 10 === 1 && house % 100 !== 11
      ? "st"
      : house % 10 === 2 && house % 100 !== 12
        ? "nd"
        : house % 10 === 3 && house % 100 !== 13
          ? "rd"
          : "th";

  return `${house}${suffix}`;
}

function buildUnsupportedAnswer() {
  return [
    "I can help with grounded chart questions only: natal placements, houses, aspects, remedies already mapped inside the app, and current timing context from your stored chart.",
    "For broader decisions beyond that scope, please use the report page or book a consultation with Joy Prakash Sarmah.",
  ].join("\n\n");
}

function createFallbackConsultationReply(): ConsultationReply {
  return {
    answer:
      "No chart data is available yet. Complete onboarding first so the assistant can respond from saved chart context.",
    followUpSuggestions: [
      "Complete onboarding to generate your first chart.",
      "Return here once chart data is available.",
    ],
    sourceLabels: ["fallback"],
    remedies: [],
    providerKey: "vedic-consultation-engine",
    model: null,
    supported: true,
  };
}

function getMentionedBody(question: string) {
  return bodyPatterns.find((entry) => entry.pattern.test(question))?.body ?? null;
}

function getMentionedHouse(question: string) {
  const match = question.match(/\b([1-9]|1[0-2])(st|nd|rd|th)? house\b|\bhouse ([1-9]|1[0-2])\b/i);

  if (!match) {
    return null;
  }

  const value = Number(match[1] ?? match[3]);

  return Number.isFinite(value) ? value : null;
}

function toBirthDetails(
  chart: NonNullable<Awaited<ReturnType<typeof loadChartAnalysisContext>>["overview"]["birthProfile"]>
): BirthDetails {
  return {
    dateLocal: chart.birthDate,
    timeLocal: chart.birthTime ?? "00:00",
    timezone: chart.timezone,
    place: {
      city: chart.city,
      region: chart.region ?? undefined,
      country: chart.country,
      latitude: chart.latitude,
      longitude: chart.longitude,
    },
  };
}

function getPlanetLine(planet: PlanetPosition) {
  const nakshatraLine = planet.nakshatra
    ? ` in ${nakshatraLabelMap[planet.nakshatra.name]} pada ${planet.nakshatra.pada}`
    : "";
  const retrogradeLine = planet.retrograde ? " and is retrograde" : "";

  return `${formatBody(planet.body)} is placed in ${formatSign(planet.sign)} in the ${ordinalHouse(planet.house)} house${nakshatraLine}${retrogradeLine}.`;
}

function getHouseLine(chart: NatalChartResponse, houseNumber: number) {
  const house = chart.houses.find((entry) => entry.house === houseNumber);

  if (!house) {
    return null;
  }

  const occupants = chart.planets
    .filter((planet) => planet.house === houseNumber)
    .map((planet) => formatBody(planet.body));
  const occupantLine = occupants.length
    ? ` Occupants here: ${occupants.join(", ")}.`
    : " No graha is occupying this house directly in the stored chart.";

  return `The ${ordinalHouse(houseNumber)} house opens in ${formatSign(house.sign)} and is ruled by ${formatBody(house.ruler)}.${occupantLine}`;
}

function getAspectLine(chart: NatalChartResponse) {
  const vedicAspect = chart.vedicAspects?.[0];

  if (vedicAspect) {
    return `${formatBody(vedicAspect.source)} holds a ${vedicAspect.relation.toLowerCase().replace(/_/g, " ")} aspect to ${formatBody(vedicAspect.target as PlanetaryBody)}. ${vedicAspect.rationale}`;
  }

  const aspect = chart.aspects[0];

  if (!aspect) {
    return "No major stored aspect is available to explain here yet.";
  }

  return `${formatBody(aspect.source as PlanetaryBody)} forms a ${aspect.type.toLowerCase()} with ${formatBody(aspect.target as PlanetaryBody)} at an orb of ${aspect.orb.toFixed(2)} degrees.`;
}

async function getTransitLine(
  birthDetails: BirthDetails
) {
  try {
    const transitSnapshot = await getAstrologyService().getTransitSnapshot({
      kind: "TRANSIT_SNAPSHOT",
      requestId: crypto.randomUUID(),
      birthDetails,
      window: {
        fromDateUtc: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        toDateUtc: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    const leadTransit = transitSnapshot.transits[0];

    if (!leadTransit) {
      return null;
    }

    return `${formatBody(leadTransit.body)} is currently moving through ${formatSign(leadTransit.sign)} in the ${ordinalHouse(leadTransit.house)} house. ${leadTransit.summary}`;
  } catch (error) {
    console.error("getTransitLine failed", error);

    return null;
  }
}

function buildSummaryAnswer(chart: NatalChartResponse) {
  const summaryInsights = buildChartSummaryInsights(chart);
  const yogaLine = chart.yogas?.length
    ? `${chart.yogas.map((yoga) => yoga.title).join(", ")} is present in the chart structure.`
    : "No named yoga dominates the stored chart more than the core graha pattern.";
  const dashaLine = chart.currentDasha
    ? `${formatBody(chart.currentDasha.lord)} mahadasha is the current timing backdrop.`
    : "No dasha timing is available yet.";

  return [
    chart.summary.narrative,
    summaryInsights.strengths[0] ?? fallbackChartInsights.summary,
    summaryInsights.challenges[0] ??
      "No leading caution line is stored beyond the main chart summary yet.",
    yogaLine,
    dashaLine,
  ].join("\n\n");
}

export async function generateConsultationReply(
  question: string,
  userId: string
): Promise<ConsultationReply> {
  try {
    const normalizedQuestion = normalizeQuestion(question);
    const [context, insights, remedies] = await Promise.all([
      loadChartAnalysisContext(userId),
      loadChartAnalysisContext(userId).then((loaded) =>
        loaded.overview.chart ? buildChartSummaryInsights(loaded.overview.chart) : fallbackChartInsights
      ),
      suggestRemedies(userId).catch((error) => {
        console.error("suggestRemedies failed", error);
        return [];
      }),
    ]);

    if (!supportedQuestionPattern.test(normalizedQuestion)) {
      return {
        answer: buildUnsupportedAnswer(),
        followUpSuggestions: [
          "Ask about your ascendant or a graha placement.",
          "Ask what your strongest chart themes are.",
        ],
        sourceLabels: ["policy"],
        remedies,
        providerKey: "vedic-consultation-engine",
        model: null,
        supported: false,
      };
    }

    if (!context.overview.chart || !context.overview.birthProfile) {
      return createFallbackConsultationReply();
    }

    const chart = context.overview.chart;
    const body = getMentionedBody(normalizedQuestion);
    const houseNumber = getMentionedHouse(normalizedQuestion);
    const latestConsultationNote = context.consultationNotes[0]?.note ?? null;
    const leadRemedy = remedies[0];

    if (/ascendant|rising/i.test(normalizedQuestion)) {
      const lagnaLine = chart.lagna
        ? `Your ascendant is ${formatSign(chart.lagna.sign)} at ${chart.lagna.degree}\u00b0 ${chart.lagna.minute}' in ${nakshatraLabelMap[chart.lagna.nakshatra.name]} pada ${chart.lagna.nakshatra.pada}.`
        : `Your ascendant sign is ${formatSign(chart.ascendantSign)}.`;

      return {
        answer: [
          lagnaLine,
          chart.summary.narrative,
          insights.recommendations[0] ??
            "Use the chart report for a fuller synthesis rather than isolating one factor too strongly.",
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask what your strongest graha themes are.",
          "Ask how the current dasha colors the chart.",
        ],
        sourceLabels: ["lagna", "chart-summary"],
        remedies,
        providerKey: "vedic-consultation-engine",
        model: null,
        supported: true,
      };
    }

    if (body) {
      const planet = chart.planets.find((entry) => entry.body === body);

      if (!planet) {
        return createFallbackConsultationReply();
      }

      return {
        answer: [
          getPlanetLine(planet),
          chart.summary.narrative,
          latestConsultationNote
            ? `Recent consultation context: ${latestConsultationNote}`
            : "If you want this placement weighed against the rest of the chart in a more personal way, the next step is the full report or a consultation.",
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask how this graha interacts with your current dasha.",
          "Ask what the strongest themes in your chart are.",
        ],
        sourceLabels: ["planet-placement", "chart-summary"],
        remedies,
        providerKey: "vedic-consultation-engine",
        model: null,
        supported: true,
      };
    }

    if (houseNumber) {
      const houseLine = getHouseLine(chart, houseNumber);

      return {
        answer: [
          houseLine ?? `The ${ordinalHouse(houseNumber)} house is not available in the stored chart payload yet.`,
          chart.summary.narrative,
          insights.challenges[0] ??
            "A house is best interpreted against the full chart rather than in isolation.",
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask which graha is strongest in your chart.",
          "Ask what your current dasha highlights first.",
        ],
        sourceLabels: ["house-structure", "chart-summary"],
        remedies,
        providerKey: "vedic-consultation-engine",
        model: null,
        supported: true,
      };
    }

    if (/aspect/i.test(normalizedQuestion)) {
      return {
        answer: [
          getAspectLine(chart),
          chart.summary.narrative,
          "Treat aspects as part of the whole chart pattern, not as a standalone verdict.",
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask which yoga patterns are present.",
          "Ask what the strongest themes in your chart are.",
        ],
        sourceLabels: ["aspects", "chart-summary"],
        remedies,
        providerKey: "vedic-consultation-engine",
        model: null,
        supported: true,
      };
    }

    if (/remedy|recommend/i.test(normalizedQuestion)) {
      return {
        answer: [
          chart.remedySignals[0]
            ? chart.remedySignals[0].rationale
            : chart.summary.narrative,
          leadRemedy
            ? `${leadRemedy.title} appears here because ${leadRemedy.reason}`
            : "No gentle support needs to be forced here if the chart does not call for one clearly.",
          leadRemedy?.note ??
            "If you want remedy guidance weighed more personally, consultation remains the safer path.",
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask why the current dasha matters.",
          "Ask what the strongest themes in your chart are.",
        ],
        sourceLabels: ["remedy-signals", "chart-summary"],
        remedies,
        providerKey: "vedic-consultation-engine",
        model: null,
        supported: true,
      };
    }

    if (/cycle|transit|dasha/i.test(normalizedQuestion)) {
      const transitLine = await getTransitLine(toBirthDetails(context.overview.birthProfile));
      const dashaLine = chart.currentDasha
        ? `${formatBody(chart.currentDasha.lord)} mahadasha is active until ${new Date(chart.currentDasha.endAtUtc).toLocaleDateString("en-IN", {
            dateStyle: "medium",
          })}.`
        : "No dasha timing is stored yet.";

      return {
        answer: [
          dashaLine,
          transitLine ??
            "A fresh transit snapshot is not available right now, so I am staying with the stored dasha and natal pattern instead of improvising.",
          chart.summary.narrative,
        ].join("\n\n"),
        followUpSuggestions: [
          "Ask which graha is strongest in your chart.",
          "Ask what your ascendant means in this cycle.",
        ],
        sourceLabels: ["dasha", "transit", "chart-summary"],
        remedies,
        providerKey: "vedic-consultation-engine",
        model: null,
        supported: true,
      };
    }

    return {
      answer: buildSummaryAnswer(chart),
      followUpSuggestions: [
        "Ask what your ascendant means.",
        "Ask how the current dasha colors the chart.",
        "Ask why a remedy was suggested.",
      ],
      sourceLabels: ["chart-summary", "yogas", "dasha"],
      remedies,
      providerKey: "vedic-consultation-engine",
      model: null,
      supported: true,
    };
  } catch (error) {
    console.error("generateConsultationReply failed", error);

    return createFallbackConsultationReply();
  }
}
