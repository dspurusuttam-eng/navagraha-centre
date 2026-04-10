import "server-only";

import { buildChartSummaryInsights } from "@/lib/astrology/chart-summary";
import { fallbackCurrentCycleSummary } from "@/lib/astrology/current-cycle";
import { nakshatraLabelMap, planetLabelMap, zodiacSignLabelMap } from "@/lib/astrology/constants";
import { fallbackChartInsights, loadChartAnalysisContext } from "@/lib/ai/chart-analysis";
import { getCurrentCycleSummary } from "@/lib/ai/current-cycle";
import { suggestRemedies } from "@/lib/ai/remedies-engine";
import type { ConsultationReply } from "@/lib/ai/types";
import type { NatalChartResponse, PlanetPosition, PlanetaryBody } from "@/modules/astrology/types";

const supportedQuestionPattern =
  /\b(ascendant|rising|chart|theme|themes|planet|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu|house|aspect|cycle|transit|dasha|remedy|recommend|week|weeks|month|months|calendar|roadmap|upcoming)\b/i;

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

function isCareerTimingQuestion(question: string) {
  return (
    /\b(career|work|profession|reputation|public role)\b/i.test(question) &&
    /\b(period|timing|cycle|right now|current|focus)\b/i.test(question)
  );
}

function isGuidanceCalendarQuestion(question: string) {
  return /\b(next week|next few weeks|next month|next 30 days|next 90 days|upcoming|calendar|roadmap|coming weeks|coming month)\b/i.test(
    question
  );
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

function buildCurrentCycleAnswer(
  question: string,
  currentCycle: typeof fallbackCurrentCycleSummary
) {
  if (currentCycle.status !== "ready") {
    return [
      currentCycle.unavailableReason ??
        "Current timing could not be refreshed just now.",
      "I do not want to improvise timing language without a grounded dasha and transit snapshot.",
    ].join("\n\n");
  }

  const wantsCareerTiming = isCareerTimingQuestion(question);
  const relevantLifeAreaPattern = wantsCareerTiming
    ? /\bcareer\b|\breputation\b|\bpublic role\b|\bwork routines\b/i
    : null;
  const focusAreas = relevantLifeAreaPattern
    ? currentCycle.synthesis.activeAreas.filter((area) =>
        area.lifeAreas.some((lifeArea) => relevantLifeAreaPattern.test(lifeArea))
      )
    : currentCycle.synthesis.activeAreas;
  const supportiveWindows = relevantLifeAreaPattern
    ? currentCycle.synthesis.supportiveWindows.filter((area) =>
        area.lifeAreas.some((lifeArea) => relevantLifeAreaPattern.test(lifeArea))
      )
    : currentCycle.synthesis.supportiveWindows;
  const cautionWindows = relevantLifeAreaPattern
    ? currentCycle.synthesis.cautionWindows.filter((area) =>
        area.lifeAreas.some((lifeArea) => relevantLifeAreaPattern.test(lifeArea))
      )
    : currentCycle.synthesis.cautionWindows;
  const focusLine = focusAreas[0]?.summary ?? currentCycle.synthesis.overview;
  const supportiveLine = supportiveWindows[0]
    ? `${supportiveWindows[0].title} ${supportiveWindows[0].summary}`
    : wantsCareerTiming
      ? "No especially supportive career window stands out more strongly than the broader chart context right now."
      : "No especially supportive transit window stands out more strongly than the broader chart context right now.";
  const cautionLine = cautionWindows[0]
    ? `${cautionWindows[0].title} ${cautionWindows[0].summary}`
    : wantsCareerTiming
      ? "Career timing does not show a clear warning signal beyond the need for measured pacing and realistic expectations."
      : "No single caution window dominates beyond the usual need for steadier judgement.";
  const dashaLine = currentCycle.dasha
    ? `${formatBody(currentCycle.dasha.lord)} mahadasha is active until ${new Date(currentCycle.dasha.endAtUtc).toLocaleDateString("en-IN", {
        dateStyle: "medium",
      })}.`
    : "The current dasha could not be refreshed just now.";

  return [
    dashaLine,
    focusLine,
    supportiveLine,
    cautionLine,
    wantsCareerTiming
      ? "Read this as a timing emphasis around career and public role, not as a guaranteed yes-or-no outcome."
      : "Read this as a timing emphasis, not a fixed prediction.",
  ].join("\n\n");
}

function buildGuidanceCalendarAnswer(
  question: string,
  currentCycle: typeof fallbackCurrentCycleSummary
) {
  if (currentCycle.status !== "ready") {
    return [
      currentCycle.unavailableReason ??
        "A grounded timing calendar is not available right now.",
      "I do not want to improvise a timeline without a stored chart and a fresh transit snapshot.",
    ].join("\n\n");
  }

  const normalizedQuestion = question.toLowerCase();
  const bucket =
    normalizedQuestion.includes("next week") ||
    normalizedQuestion.includes("coming weeks")
      ? currentCycle.guidanceCalendar.buckets.find(
          (entry) => entry.key === "NEXT_7_DAYS"
        )
      : normalizedQuestion.includes("next month") ||
          normalizedQuestion.includes("next 30 days")
        ? currentCycle.guidanceCalendar.buckets.find(
            (entry) => entry.key === "NEXT_30_DAYS"
          )
        : normalizedQuestion.includes("next 90 days")
          ? currentCycle.guidanceCalendar.buckets.find(
              (entry) => entry.key === "NEXT_90_DAYS"
            )
          : currentCycle.guidanceCalendar.buckets.find(
              (entry) => entry.key === "NEXT_30_DAYS"
            );

  if (!bucket) {
    return currentCycle.guidanceCalendar.overview;
  }

  const leadEntry = bucket.entries[0];
  const cautionEntry = bucket.entries.find(
    (entry) => entry.kind === "CAUTION_WINDOW"
  );

  return [
    bucket.summary,
    leadEntry
      ? `${leadEntry.title} ${leadEntry.summary}`
      : "No stronger timing entry is standing out in this window beyond steady pacing.",
    cautionEntry
      ? `${cautionEntry.title} ${cautionEntry.summary}`
      : "No dominant caution window is standing out more strongly than the broader chart pattern here.",
    "Use this as a planning guide, not as a guaranteed prediction.",
  ].join("\n\n");
}

export async function generateConsultationReply(
  question: string,
  userId: string
): Promise<ConsultationReply> {
  try {
    const normalizedQuestion = normalizeQuestion(question);
    const [context, insights, currentCycle, remedies] = await Promise.all([
      loadChartAnalysisContext(userId),
      loadChartAnalysisContext(userId).then((loaded) =>
        loaded.overview.chart ? buildChartSummaryInsights(loaded.overview.chart) : fallbackChartInsights
      ),
      getCurrentCycleSummary(userId).catch((error) => {
        console.error("getCurrentCycleSummary failed", error);
        return fallbackCurrentCycleSummary;
      }),
      suggestRemedies(userId).catch((error) => {
        console.error("suggestRemedies failed", error);
        return [];
      }),
    ]);

    if (
      !supportedQuestionPattern.test(normalizedQuestion) &&
      !isCareerTimingQuestion(normalizedQuestion)
    ) {
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

    if (
      /cycle|transit|dasha/i.test(normalizedQuestion) ||
      isGuidanceCalendarQuestion(normalizedQuestion) ||
      isCareerTimingQuestion(normalizedQuestion)
    ) {
      return {
        answer: isGuidanceCalendarQuestion(normalizedQuestion)
          ? buildGuidanceCalendarAnswer(normalizedQuestion, currentCycle)
          : buildCurrentCycleAnswer(normalizedQuestion, currentCycle),
        followUpSuggestions: [
          "Ask which life areas are most emphasized in this cycle.",
          "Ask what your ascendant means in the current timing context.",
          "Ask what the next month emphasizes most.",
        ],
        sourceLabels: isGuidanceCalendarQuestion(normalizedQuestion)
          ? ["dasha", "transit", "guidance-calendar"]
          : ["dasha", "transit", "current-cycle"],
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
