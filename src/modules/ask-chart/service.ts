import "server-only";

import { generateConsultationReply } from "@/lib/ai/consultation-engine";
import { getPrisma } from "@/lib/prisma";
import { getAiGroundedTextService } from "@/modules/ai/server";
import { resolvePromptVersionByTemplateKey } from "@/modules/ai/prompt-versioning";
import type { AiTaskKind } from "@/modules/ai/tasks";
import { getAstrologyService } from "@/modules/astrology/server";
import type { BirthDetails, NatalChartResponse, PlanetaryBody } from "@/modules/astrology/types";
import { getContentAdapter } from "@/modules/content/server";
import { getChartOverview, type ChartOverview } from "@/modules/onboarding/service";
import { getRemedyRecommendationService } from "@/modules/remedies/service";
import { getRelatedProductsForRemedySlugs } from "@/modules/shop/service";
import type {
  AskMyChartConversation,
  AskMyChartMessage,
  AskMyChartPageData,
  AskMyChartSessionSummary,
} from "@/modules/ask-chart/types";

const askMyChartChannelKey = "ask-my-chart";
const maxQuestionLength = 700;
const maxSessionHistory = 8;

const starterPrompts = [
  "What does my ascendant mean?",
  "Why was this remedy recommended?",
  "What are the strongest themes in my chart?",
  "How should I understand my current cycle?",
  "What should I focus on over the next month?",
] as const;

const planetaryKeywordMap = [
  { body: "SUN", patterns: [/\bsun\b/i, /\bsolar\b/i] },
  { body: "MOON", patterns: [/\bmoon\b/i, /\blunar\b/i] },
  { body: "MARS", patterns: [/\bmars\b/i] },
  { body: "MERCURY", patterns: [/\bmercury\b/i] },
  { body: "JUPITER", patterns: [/\bjupiter\b/i] },
  { body: "VENUS", patterns: [/\bvenus\b/i] },
  { body: "SATURN", patterns: [/\bsaturn\b/i] },
  { body: "RAHU", patterns: [/\brahu\b/i, /\bnorth node\b/i] },
  { body: "KETU", patterns: [/\bketu\b/i, /\bsouth node\b/i] },
] as const satisfies readonly {
  body: PlanetaryBody;
  patterns: readonly RegExp[];
}[];

const houseKeywordMap = [
  { house: 1, patterns: [/\b1st house\b/i, /\bfirst house\b/i, /\bhouse 1\b/i] },
  { house: 2, patterns: [/\b2nd house\b/i, /\bsecond house\b/i, /\bhouse 2\b/i] },
  { house: 3, patterns: [/\b3rd house\b/i, /\bthird house\b/i, /\bhouse 3\b/i] },
  { house: 4, patterns: [/\b4th house\b/i, /\bfourth house\b/i, /\bhouse 4\b/i] },
  { house: 5, patterns: [/\b5th house\b/i, /\bfifth house\b/i, /\bhouse 5\b/i] },
  { house: 6, patterns: [/\b6th house\b/i, /\bsixth house\b/i, /\bhouse 6\b/i] },
  { house: 7, patterns: [/\b7th house\b/i, /\bseventh house\b/i, /\bhouse 7\b/i] },
  { house: 8, patterns: [/\b8th house\b/i, /\beighth house\b/i, /\bhouse 8\b/i] },
  { house: 9, patterns: [/\b9th house\b/i, /\bninth house\b/i, /\bhouse 9\b/i] },
  { house: 10, patterns: [/\b10th house\b/i, /\btenth house\b/i, /\bhouse 10\b/i] },
  { house: 11, patterns: [/\b11th house\b/i, /\beleventh house\b/i, /\bhouse 11\b/i] },
  { house: 12, patterns: [/\b12th house\b/i, /\btwelfth house\b/i, /\bhouse 12\b/i] },
] as const;

const aspectKeywordMap = [
  { type: "CONJUNCTION", patterns: [/\bconjunction\b/i, /\bconjunct\b/i] },
  { type: "SEXTILE", patterns: [/\bsextile\b/i] },
  { type: "SQUARE", patterns: [/\bsquare\b/i] },
  { type: "TRINE", patterns: [/\btrine\b/i] },
  { type: "OPPOSITION", patterns: [/\bopposition\b/i, /\bopposed\b/i] },
] as const;

type AskMyChartIntent =
  | "PLACEMENT_EXPLANATION"
  | "HOUSE_OR_ASPECT_EXPLANATION"
  | "CHART_SUMMARY"
  | "REMEDY_EXPLANATION"
  | "TRANSIT_EXPLANATION"
  | "UNSUPPORTED";

type AskMyChartClassification = {
  intent: AskMyChartIntent;
  taskKind: AiTaskKind;
  supported: boolean;
  guidance: string;
};

type AskMyChartToolBundle = {
  chartSnapshot: {
    chartId: string;
    ascendantSign: string;
    dominantBodies: PlanetaryBody[];
    narrative: string;
    generatedAtUtc: string | null;
  };
  chartSummaryFacts: {
    ascendantSign: string;
    houseSystem: string;
    dominantBodies: PlanetaryBody[];
    narrative: string;
    matchingPlacements: {
      body: PlanetaryBody;
      sign: string;
      house: number;
      retrograde: boolean;
    }[];
    matchingHouses: {
      house: number;
      sign: string;
      ruler: PlanetaryBody;
    }[];
    matchingAspects: {
      source: string;
      type: string;
      target: string;
      orb: number;
      exact: boolean;
    }[];
  };
  transitSnapshot: null | {
    window: {
      fromDateUtc: string;
      toDateUtc: string;
    };
    transits: {
      id: string;
      body: PlanetaryBody;
      sign: string;
      house: number;
      summary: string;
      intensity: string;
    }[];
    aspects: {
      source: string;
      type: string;
      target: string;
      orb: number;
      exact: boolean;
    }[];
  };
  approvedRemedies: {
    remedies: {
      id: string;
      slug: string;
      title: string;
      type: string;
      priorityTier: string;
      confidenceLabel: string;
      summary: string;
      cautionNote: string | null;
      whyThisRemedy: {
        summary: string;
        chartGrounding: string;
        approvedRecordBasis: string;
      };
      cautions: {
        label: string;
        note: string;
      }[];
      productMapping: {
        note: string;
        purchaseRequired: false;
      };
      signalKey: string;
    }[];
    consultationPreparation: {
      summary: string;
      topRecommendations: {
        slug: string;
        title: string;
        priorityTier: string;
        confidenceLabel: string;
        note: string;
      }[];
    };
  };
  relatedProducts: {
    products: {
      id: string;
      slug: string;
      name: string;
      summary: string;
      priceLabel: string;
      categoryLabel: string;
    }[];
  };
  publishedInsights: {
    entries: {
      slug: string;
      title: string;
      excerpt: string;
      type: string;
      publishedAt: string;
    }[];
  };
  consultationContext: null | {
    confirmationCode: string;
    serviceLabel: string;
    topicFocus: string | null;
    intakeSummary: string | null;
    remedyPreparation?: {
      summary: string;
      topRecommendations: {
        slug: string;
        title: string;
        priorityTier: string;
        confidenceLabel: string;
        note: string;
      }[];
    };
  };
};

type AskMyChartReplyResult = {
  assistantMessage: string;
  providerKey: string;
  model: string | null;
  taskKind: AiTaskKind;
  promptTemplateKey: string;
  promptVersionLabel: string;
  toolBundle: AskMyChartToolBundle;
  classification: AskMyChartClassification;
  usedToolNames: string[];
  refused: boolean;
};

function normalizeQuestion(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createInputHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16);
}

function createSessionTitle(question: string) {
  const normalized = normalizeQuestion(question);

  if (!normalized) {
    return "New chart conversation";
  }

  return normalized.length > 72 ? `${normalized.slice(0, 69)}...` : normalized;
}

function formatPreview(content: string) {
  const normalized = normalizeQuestion(content);

  return normalized.length > 92 ? `${normalized.slice(0, 89)}...` : normalized;
}

function formatEnumLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatSignLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function classifyQuestion(question: string): AskMyChartClassification {
  const normalized = question.toLowerCase();

  if (/\b(remedy|recommended remedy|gemstone|mantra|rudraksha|yantra|puja|mala)\b/i.test(normalized)) {
    return {
      intent: "REMEDY_EXPLANATION",
      taskKind: "REMEDY_EXPLANATION",
      supported: true,
      guidance: "Explain only approved remedy records already mapped from the user's chart.",
    };
  }

  if (
    /\b(current cycle|transit|transits|right now|current period|current phase|dasha|mahadasha)\b/i.test(
      normalized
    )
  ) {
    return {
      intent: "TRANSIT_EXPLANATION",
      taskKind: "TRANSIT_EXPLANATION",
      supported: true,
      guidance: "Explain current transit meaning only if grounded transit data is available.",
    };
  }

  if (/\b(ascendant|rising|placement|planet|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)\b/i.test(normalized)) {
    return {
      intent: "PLACEMENT_EXPLANATION",
      taskKind: "CHART_EXPLANATION",
      supported: true,
      guidance: "Explain the user's existing natal placements without recalculating chart math.",
    };
  }

  if (/\b(house|aspect|conjunction|trine|square|sextile|opposition)\b/i.test(normalized)) {
    return {
      intent: "HOUSE_OR_ASPECT_EXPLANATION",
      taskKind: "CHART_EXPLANATION",
      supported: true,
      guidance: "Explain houses or aspects only from stored chart facts.",
    };
  }

  if (/\b(chart|theme|themes|summary|strongest|focus)\b/i.test(normalized)) {
    return {
      intent: "CHART_SUMMARY",
      taskKind: "CHART_EXPLANATION",
      supported: true,
      guidance: "Summarize the strongest grounded themes in the existing chart.",
    };
  }

  return {
    intent: "UNSUPPORTED",
    taskKind: "CHART_EXPLANATION",
    supported: false,
    guidance:
      "Gracefully refuse questions outside grounded chart interpretation and redirect toward consultation.",
  };
}

function getMentionedBodies(question: string) {
  const bodies = new Set<PlanetaryBody>();

  for (const entry of planetaryKeywordMap) {
    if (entry.patterns.some((pattern) => pattern.test(question))) {
      bodies.add(entry.body);
    }
  }

  return Array.from(bodies);
}

function getMentionedHouses(question: string) {
  const houses = new Set<number>();

  for (const entry of houseKeywordMap) {
    if (entry.patterns.some((pattern) => pattern.test(question))) {
      houses.add(entry.house);
    }
  }

  return Array.from(houses);
}

function getMentionedAspectTypes(question: string) {
  const aspects = new Set<string>();

  for (const entry of aspectKeywordMap) {
    if (entry.patterns.some((pattern) => pattern.test(question))) {
      aspects.add(entry.type);
    }
  }

  return Array.from(aspects);
}

async function getPrimaryBirthProfile(userId: string) {
  return getPrisma().birthData.findFirst({
    where: {
      userId,
      isPrimary: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

function toBirthDetails(
  profile: NonNullable<Awaited<ReturnType<typeof getPrimaryBirthProfile>>>
): BirthDetails {
  return {
    dateLocal: profile.birthDate,
    timeLocal: profile.birthTime ?? "00:00",
    timezone: profile.timezone,
    place: {
      city: profile.city,
      region: profile.region ?? undefined,
      country: profile.country,
      latitude: profile.latitude === null ? null : Number(profile.latitude),
      longitude: profile.longitude === null ? null : Number(profile.longitude),
    },
  };
}

function getMatchingPlacements(question: string, chart: NatalChartResponse) {
  const mentionedBodies = getMentionedBodies(question);
  const targetBodies = mentionedBodies.length
    ? mentionedBodies
    : chart.summary.dominantBodies.slice(0, 3);

  return chart.planets
    .filter((planet) => targetBodies.includes(planet.body))
    .slice(0, 4)
    .map((planet) => ({
      body: planet.body,
      sign: formatSignLabel(planet.sign),
      house: planet.house,
      retrograde: planet.retrograde,
    }));
}

function getMatchingHouses(question: string, chart: NatalChartResponse) {
  const mentionedHouses = getMentionedHouses(question);

  return chart.houses
    .filter((house) =>
      mentionedHouses.length ? mentionedHouses.includes(house.house) : house.house <= 4
    )
    .slice(0, 4)
    .map((house) => ({
      house: house.house,
      sign: formatSignLabel(house.sign),
      ruler: house.ruler,
    }));
}

function isPlanetaryBody(value: string): value is PlanetaryBody {
  return planetaryKeywordMap.some((entry) => entry.body === value);
}

function getMatchingAspects(question: string, chart: NatalChartResponse) {
  const mentionedBodies = getMentionedBodies(question);
  const mentionedAspectTypes = getMentionedAspectTypes(question);

  return chart.aspects
    .filter((aspect) => {
      const aspectMatches =
        !mentionedAspectTypes.length || mentionedAspectTypes.includes(aspect.type);
      const sourceMatches =
        typeof aspect.source === "string" &&
        isPlanetaryBody(aspect.source) &&
        mentionedBodies.includes(aspect.source);
      const targetMatches =
        typeof aspect.target === "string" &&
        isPlanetaryBody(aspect.target) &&
        mentionedBodies.includes(aspect.target);
      const bodyMatches = !mentionedBodies.length || sourceMatches || targetMatches;

      return aspectMatches && bodyMatches;
    })
    .slice(0, 4)
    .map((aspect) => ({
      source: aspect.source,
      type: formatEnumLabel(aspect.type),
      target: aspect.target,
      orb: aspect.orb,
      exact: aspect.exact,
    }));
}

async function getChartSnapshotTool(overview: ChartOverview) {
  if (!overview.chart || !overview.chartRecord) {
    throw new Error("A stored chart is required before Ask My Chart can respond.");
  }

  return {
    chartId: overview.chartRecord.id,
    ascendantSign: formatSignLabel(overview.chart.ascendantSign),
    dominantBodies: overview.chart.summary.dominantBodies,
    narrative: overview.chart.summary.narrative,
    generatedAtUtc: overview.chartRecord.generatedAtUtc,
  };
}

async function getChartSummaryFactsTool(question: string, overview: ChartOverview) {
  if (!overview.chart) {
    throw new Error("Chart summary facts are unavailable without a stored chart.");
  }

  return {
    ascendantSign: formatSignLabel(overview.chart.ascendantSign),
    houseSystem:
      overview.chart.houseSystem === "WHOLE_SIGN" ? "Whole Sign" : "Placidus",
    dominantBodies: overview.chart.summary.dominantBodies,
    narrative: overview.chart.summary.narrative,
    matchingPlacements: getMatchingPlacements(question, overview.chart),
    matchingHouses: getMatchingHouses(question, overview.chart),
    matchingAspects: getMatchingAspects(question, overview.chart),
  };
}

async function getTransitSnapshotTool(userId: string) {
  const primaryBirthProfile = await getPrimaryBirthProfile(userId);

  if (!primaryBirthProfile) {
    return null;
  }

  try {
    const now = new Date();
    const transitResponse = await getAstrologyService().getTransitSnapshot({
      kind: "TRANSIT_SNAPSHOT",
      requestId: crypto.randomUUID(),
      subjectId: userId,
      birthDetails: toBirthDetails(primaryBirthProfile),
      window: {
        fromDateUtc: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        toDateUtc: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    return {
      window: transitResponse.window,
      transits: transitResponse.transits.slice(0, 5).map((transit) => ({
        id: transit.id,
        body: transit.body,
        sign: formatSignLabel(transit.sign),
        house: transit.house,
        summary: transit.summary,
        intensity: formatEnumLabel(transit.intensity),
      })),
      aspects: transitResponse.aspects.slice(0, 4).map((aspect) => ({
        source: aspect.source,
        type: formatEnumLabel(aspect.type),
        target: aspect.target,
        orb: aspect.orb,
        exact: aspect.exact,
      })),
    };
  } catch {
    return null;
  }
}

async function getApprovedRemediesTool(
  userId: string,
  chartRecordId: string,
  chart: NatalChartResponse
) {
  const recommendations = await getRemedyRecommendationService().getRecommendations({
    chart,
    logContext: {
      userId,
      chartRecordId,
      surfaceKey: "ask-my-chart",
    },
  });

  return {
    remedies: recommendations.recommendations.map((recommendation) => ({
      id: recommendation.id,
      slug: recommendation.slug,
      title: recommendation.title,
      type: recommendation.type,
      priorityTier: recommendation.priorityTier,
      confidenceLabel: recommendation.confidenceLabel,
      summary: recommendation.summary,
      cautionNote: recommendation.cautionNote,
      whyThisRemedy: recommendation.whyThisRemedy,
      cautions: recommendation.cautions.map((caution) => ({
        label: caution.label,
        note: caution.note,
      })),
      productMapping: {
        note: recommendation.productMapping.note,
        purchaseRequired: recommendation.productMapping.purchaseRequired,
      },
      signalKey: recommendation.signalKey,
    })),
    consultationPreparation: recommendations.consultationPreparation,
  };
}

async function getRelatedProductsTool(remedySlugs: string[]) {
  const relatedMap = getRelatedProductsForRemedySlugs(remedySlugs);
  const products = remedySlugs.flatMap((slug) => relatedMap.get(slug) ?? []);

  return {
    products: products.slice(0, 6).map((product) => ({
      id: product.slug,
      slug: product.slug,
      name: product.name,
      summary: product.summary,
      priceLabel: product.priceLabel,
      categoryLabel: product.categoryLabel,
    })),
  };
}

async function getPublishedInsightsTool(question: string) {
  const entries = await getContentAdapter().listPublishedEntries();
  const normalizedQuestion = question.toLowerCase();
  const queryTerms = normalizedQuestion
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 4);

  const scoredEntries = entries
    .map((entry) => {
      const haystack = [entry.title, entry.excerpt, entry.description, ...entry.keywords]
        .join(" ")
        .toLowerCase();
      const score = queryTerms.reduce(
        (total, term) => total + (haystack.includes(term) ? 1 : 0),
        0
      );

      return {
        entry,
        score,
      };
    })
    .sort((left, right) => right.score - left.score);

  return {
    entries: scoredEntries
      .filter((item) => item.score > 0)
      .slice(0, 3)
      .map(({ entry }) => ({
        slug: entry.slug,
        title: entry.title,
        excerpt: entry.excerpt,
        type: entry.type,
        publishedAt: entry.publishedAt,
      })),
  };
}

async function getConsultationContextTool(
  userId: string,
  approvedRemedies: AskMyChartToolBundle["approvedRemedies"]["remedies"]
) {
  const consultation = await getPrisma().consultation.findFirst({
    where: {
      userId,
    },
    orderBy: [
      {
        scheduledFor: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      confirmationCode: true,
      serviceLabel: true,
      topicFocus: true,
      intakeSummary: true,
    },
  });

  if (!consultation) {
    return null;
  }

  return {
    confirmationCode: consultation.confirmationCode,
    serviceLabel: consultation.serviceLabel,
    topicFocus: consultation.topicFocus,
    intakeSummary: consultation.intakeSummary,
    remedyPreparation: approvedRemedies.length
      ? {
          summary:
            "Use the mapped remedies as consultation prep notes only. Personal judgement remains central in the live session.",
          topRecommendations: approvedRemedies.slice(0, 3).map((remedy) => ({
            slug: remedy.slug,
            title: remedy.title,
            priorityTier: remedy.priorityTier,
            confidenceLabel: remedy.confidenceLabel,
            note:
              remedy.confidenceLabel === "OPTIONAL_SUPPORT"
                ? "Lower-confidence support is best reviewed personally before stronger action."
                : remedy.whyThisRemedy.summary,
          })),
        }
      : undefined,
  };
}

function buildUnsupportedReply() {
  return [
    "I can help only with grounded questions about your stored chart, approved remedies, and current chart context inside NAVAGRAHA CENTRE.",
    "For broader life decisions or advice beyond that scope, please review your chart report or book a consultation with Joy Prakash Sarmah for a more personal reading.",
  ].join("\n\n");
}

function buildFallbackReply(
  classification: AskMyChartClassification,
  tools: AskMyChartToolBundle
) {
  const opening =
    `${tools.chartSnapshot.ascendantSign} rising with ${tools.chartSnapshot.dominantBodies
      .map(formatEnumLabel)
      .join(", ")} remains the clearest stored foundation in your chart.`;

  if (classification.intent === "REMEDY_EXPLANATION") {
    const firstRemedy = tools.approvedRemedies.remedies[0];

    if (!firstRemedy) {
      return [
        opening,
        "No approved remedy records are currently mapped to your stored chart signals, so I would avoid improvising guidance here.",
        "If you want deeper remedy review, the safest next step is a direct consultation.",
      ].join("\n\n");
    }

    return [
      opening,
      `${firstRemedy.title} appears because the approved record is linked to chart signals already present in your report. ${firstRemedy.whyThisRemedy.summary}`,
      firstRemedy.cautionNote ??
        firstRemedy.productMapping.note,
    ].join("\n\n");
  }

  if (classification.intent === "TRANSIT_EXPLANATION") {
    if (!tools.transitSnapshot?.transits.length) {
      return [
        opening,
        "A grounded transit snapshot is not available right now, so I do not want to improvise a current-cycle reading.",
        "You can return to the structured chart and report pages for natal context, or take the question into consultation for a live review.",
      ].join("\n\n");
    }

    const leadTransit = tools.transitSnapshot.transits[0];

    return [
      opening,
      `${formatEnumLabel(leadTransit.body)} is currently moving through ${leadTransit.sign} in house ${leadTransit.house}. ${leadTransit.summary}`,
      "Read this as a reflective timing cue rather than a fixed prediction, and keep the larger chart narrative in view.",
    ].join("\n\n");
  }

  const placementLine = tools.chartSummaryFacts.matchingPlacements.length
    ? `The clearest placement in your question points to ${tools.chartSummaryFacts.matchingPlacements
        .map(
          (placement) =>
            `${formatEnumLabel(placement.body)} in ${placement.sign}, house ${placement.house}`
        )
        .join("; ")}.`
    : tools.chartSummaryFacts.narrative;

  const aspectLine = tools.chartSummaryFacts.matchingAspects.length
    ? `Relevant aspect structure includes ${tools.chartSummaryFacts.matchingAspects
        .map(
          (aspect) =>
            `${aspect.source} ${aspect.type.toLowerCase()} ${aspect.target}`
        )
        .join("; ")}.`
    : "The strongest themes are better understood through the chart summary rather than a single isolated factor.";

  return [
    opening,
    placementLine,
    aspectLine,
    "I am keeping this answer anchored to stored chart facts only, so for a more personal synthesis the next best step is the full report or consultation.",
  ].join("\n\n");
}

async function buildToolBundle(
  userId: string,
  question: string,
  overview: ChartOverview
) {
  if (!overview.chart || !overview.chartRecord) {
    throw new Error("A stored chart is required before Ask My Chart can respond.");
  }

  const [chartSnapshot, chartSummaryFacts, transitSnapshot, approvedRemedies, publishedInsights] =
    await Promise.all([
      getChartSnapshotTool(overview),
      getChartSummaryFactsTool(question, overview),
      getTransitSnapshotTool(userId),
      getApprovedRemediesTool(userId, overview.chartRecord.id, overview.chart),
      getPublishedInsightsTool(question),
    ]);

  const relatedProducts = await getRelatedProductsTool(
    approvedRemedies.remedies.map((remedy) => remedy.slug)
  );
  const consultationContext = await getConsultationContextTool(
    userId,
    approvedRemedies.remedies
  );

  return {
    chartSnapshot,
    chartSummaryFacts,
    transitSnapshot,
    approvedRemedies,
    relatedProducts,
    publishedInsights,
    consultationContext,
  } satisfies AskMyChartToolBundle;
}

function getUsedToolNames(
  classification: AskMyChartClassification,
  toolBundle: AskMyChartToolBundle
) {
  const names = [
    "get_user_chart_snapshot",
    "get_current_chart_summary_facts",
    "get_published_insights",
  ];

  if (classification.intent === "REMEDY_EXPLANATION") {
    names.push("get_approved_remedies", "get_related_products");
  }

  if (classification.intent === "TRANSIT_EXPLANATION" && toolBundle.transitSnapshot) {
    names.push("get_current_transit_snapshot");
  }

  if (toolBundle.consultationContext) {
    names.push("get_consultation_context");
  }

  return names;
}

async function generateAssistantReply(
  userName: string,
  question: string,
  overview: ChartOverview,
  toolBundle: AskMyChartToolBundle
): Promise<AskMyChartReplyResult> {
  const classification = classifyQuestion(question);

  if (!classification.supported) {
    return {
      assistantMessage: buildUnsupportedReply(),
      providerKey: "policy-refusal",
      model: null,
      taskKind: classification.taskKind,
      promptTemplateKey: "ask-my-chart-copilot",
      promptVersionLabel: "v1",
      toolBundle,
      classification,
      usedToolNames: getUsedToolNames(classification, toolBundle),
      refused: true,
    };
  }

  const promptVersion = await resolvePromptVersionByTemplateKey(
    "ask-my-chart-copilot"
  );
  const fallbackText = buildFallbackReply(classification, toolBundle);
  const groundedTextService = getAiGroundedTextService();
  const response = await groundedTextService.generateReply({
    taskKind: classification.taskKind,
    promptTemplateKey: promptVersion.templateKey,
    promptVersionLabel: promptVersion.label,
    instructions: promptVersion.systemPrompt,
    input: [
      promptVersion.userPrompt,
      JSON.stringify(
        {
          userName,
          preferredLanguage: overview.preferredLanguageLabel,
          userQuestion: question,
          groundedScope: classification.guidance,
          toolContext: toolBundle,
        },
        null,
        2
      ),
    ].join("\n\n"),
    fallbackText,
  });

  return {
    assistantMessage: response.text,
    providerKey: response.providerKey,
    model: response.model,
    taskKind: classification.taskKind,
    promptTemplateKey: response.promptTemplateKey,
    promptVersionLabel: response.promptVersionLabel,
    toolBundle,
    classification,
    usedToolNames: getUsedToolNames(classification, toolBundle),
    refused: false,
  };
}

function mapSessionSummary(record: {
  id: string;
  title: string | null;
  updatedAt: Date;
  messages: { content: string }[];
}) {
  return {
    id: record.id,
    title: record.title ?? "New chart conversation",
    updatedAtUtc: record.updatedAt.toISOString(),
    preview: record.messages[0]?.content
      ? formatPreview(record.messages[0].content)
      : "Grounded chart conversation",
  } satisfies AskMyChartSessionSummary;
}

function mapMessage(record: {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
  content: string;
  createdAt: Date;
}) {
  return {
    id: record.id,
    role: record.role === "USER" ? "user" : "assistant",
    content: record.content,
    createdAtUtc: record.createdAt.toISOString(),
  } satisfies AskMyChartMessage;
}

export async function listAskMyChartSessions(userId: string) {
  const sessions = await getPrisma().aiConversationSession.findMany({
    where: {
      userId,
      channelKey: askMyChartChannelKey,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: maxSessionHistory,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          content: true,
        },
      },
    },
  });

  return sessions.map(mapSessionSummary);
}

export async function getAskMyChartConversation(
  userId: string,
  sessionId: string
): Promise<AskMyChartConversation | null> {
  const session = await getPrisma().aiConversationSession.findFirst({
    where: {
      id: sessionId,
      userId,
      channelKey: askMyChartChannelKey,
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return {
    session: {
      id: session.id,
      title: session.title ?? "New chart conversation",
      updatedAtUtc: session.updatedAt.toISOString(),
      preview: session.messages.length
        ? formatPreview(session.messages[session.messages.length - 1]?.content ?? "")
        : "Grounded chart conversation",
    },
    messages: session.messages.map(mapMessage),
  };
}

export async function createAskMyChartSession(userId: string) {
  const session = await getPrisma().aiConversationSession.create({
    data: {
      userId,
      channelKey: askMyChartChannelKey,
      title: "New chart conversation",
      context: {
        surface: askMyChartChannelKey,
      },
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      messages: {
        take: 0,
        select: {
          content: true,
        },
      },
    },
  });

  return mapSessionSummary(session);
}

export async function getAskMyChartPageData(
  userId: string,
  selectedSessionId?: string | null
): Promise<AskMyChartPageData> {
  const overview = await getChartOverview(userId);

  if (!overview.chart || !overview.chartRecord) {
    return {
      status: "needs-chart",
      starterPrompts,
    };
  }

  const sessions = await listAskMyChartSessions(userId);
  const activeSessionId = selectedSessionId ?? sessions[0]?.id ?? null;
  const activeConversation = activeSessionId
    ? await getAskMyChartConversation(userId, activeSessionId)
    : null;

  return {
    status: "ready",
    starterPrompts,
    sessions,
    activeConversation,
  };
}

export async function sendAskMyChartMessage(input: {
  userId: string;
  userName: string;
  sessionId: string;
  message: string;
}) {
  const question = normalizeQuestion(input.message);

  if (!question) {
    throw new Error("Enter a grounded chart question before sending.");
  }

  if (question.length > maxQuestionLength) {
    throw new Error(
      `Keep each question within ${maxQuestionLength} characters for a focused response.`
    );
  }

  const prisma = getPrisma();
  const [sessionRecord, overview] = await Promise.all([
    prisma.aiConversationSession.findFirst({
      where: {
        id: input.sessionId,
        userId: input.userId,
        channelKey: askMyChartChannelKey,
      },
      select: {
        id: true,
        title: true,
      },
    }),
    getChartOverview(input.userId),
  ]);

  if (!sessionRecord) {
    throw new Error("This Ask My Chart conversation could not be found.");
  }

  if (!overview.chart || !overview.chartRecord) {
    throw new Error(
      "Complete your chart onboarding first so the assistant can stay grounded in stored chart data."
    );
  }

  await prisma.aiConversationMessage.create({
    data: {
      sessionId: sessionRecord.id,
      role: "USER",
      content: question,
    },
  });

  if (!sessionRecord.title || sessionRecord.title === "New chart conversation") {
    await prisma.aiConversationSession.update({
      where: {
        id: sessionRecord.id,
      },
      data: {
        title: createSessionTitle(question),
      },
    });
  }

  const promptTemplateKey = "ask-my-chart-copilot";

  try {
    const reply = await generateConsultationReply(question, input.userId);

    await Promise.all([
      prisma.aiConversationMessage.create({
        data: {
          sessionId: sessionRecord.id,
          role: "ASSISTANT",
          content: reply.answer,
          providerKey: reply.providerKey,
          model: reply.model,
          toolName: askMyChartChannelKey,
          toolPayload: {
            sourceLabels: reply.sourceLabels,
            followUpSuggestions: reply.followUpSuggestions,
            supported: reply.supported,
          },
        },
      }),
      prisma.aiTaskRun.create({
        data: {
          sessionId: sessionRecord.id,
          userId: input.userId,
          taskKind: classifyQuestion(question).taskKind,
          status: "SUCCEEDED",
          providerKey: reply.providerKey,
          model: reply.model,
          promptTemplateKey: "vedic-consultation-engine",
          promptVersionLabel: "v1",
          inputHash: createInputHash(question),
          inputPayload: {
            question,
            sourceLabels: reply.sourceLabels,
          },
          outputPayload: {
            answer: reply.answer,
            followUpSuggestions: reply.followUpSuggestions,
          },
          normalizedOutput: {
            answer: reply.answer,
          },
          policyPassed: reply.supported,
          policyViolations: reply.supported
            ? []
            : [
                {
                  rule: "OUT_OF_SCOPE",
                  message: "Question was outside grounded chart context.",
                },
              ],
          completedAt: new Date(),
        },
      }),
    ]);

    return getAskMyChartConversation(input.userId, sessionRecord.id);
  } catch (error) {
    await prisma.aiTaskRun.create({
      data: {
        sessionId: sessionRecord.id,
        userId: input.userId,
        taskKind: classifyQuestion(question).taskKind,
        status: "FAILED",
        providerKey: "vedic-consultation-engine",
        model: null,
        promptTemplateKey,
        promptVersionLabel: "v1",
        inputHash: createInputHash(question),
        inputPayload: {
          question,
        },
        errorMessage:
          error instanceof Error ? error.message : "Unknown Ask My Chart failure.",
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

export const askMyChartStarterPrompts = starterPrompts;
