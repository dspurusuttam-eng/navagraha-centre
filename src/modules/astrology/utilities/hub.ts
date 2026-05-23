import type { UtilityIconName } from "@/components/graphics/utility-icons";
import type { TrackedEventName } from "@/lib/analytics/types";

export type UtilityHubStatus = "available" | "coming soon" | "requires Kundli";

export type UtilityHubCategory =
  | "birth chart"
  | "timing"
  | "relationship"
  | "insight"
  | "support"
  | "guidance";

export type UtilityHubTool = {
  key: string;
  title: string;
  description: string;
  href: string;
  fallbackHref: string;
  ctaLabel: string;
  status: UtilityHubStatus;
  category: UtilityHubCategory;
  icon: UtilityIconName | "ai" | "report" | "consultation";
  feature: string;
  eventName: TrackedEventName;
};

export type UtilityHubSection = {
  eyebrow: string;
  title: string;
  description: string;
  cards: readonly UtilityHubTool[];
};

export type UtilityHubPathway = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  feature: string;
};

export type UtilityRecommendation = {
  key: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  reason: string;
  status: UtilityHubStatus;
  category: UtilityHubCategory;
};

export type UtilityRecommendationInput = {
  hasActiveKundli: boolean;
  viewedMatchmaking?: boolean;
  hasDoshaOrYogaFindings?: boolean;
  viewedPanchang?: boolean;
  viewedNumerology?: boolean;
};

const utilityHubSections: readonly UtilityHubSection[] = [
  {
    eyebrow: "Birth Chart Tools",
    title: "Start with Kundli foundations",
    description:
      "Generate the birth chart first, then continue into deeper chart layers when needed.",
    cards: [
      {
        key: "kundli",
        title: "Kundli / Birth Chart",
        description: "Create your main natal chart and birth profile foundation.",
        href: "/kundli",
        fallbackHref: "/kundli",
        ctaLabel: "Generate Kundli",
        status: "available",
        category: "birth chart",
        icon: "kundli",
        feature: "utility-hub-kundli",
        eventName: "utility_card_click",
      },
      {
        key: "divisional-charts",
        title: "Divisional Charts",
        description: "Review D1, D9, D10, and readiness for deeper divisional layers.",
        href: "/kundli",
        fallbackHref: "/kundli",
        ctaLabel: "Open Chart",
        status: "requires Kundli",
        category: "birth chart",
        icon: "kundli",
        feature: "utility-hub-divisional-charts",
        eventName: "utility_card_click",
      },
    ],
  },
  {
    eyebrow: "Timing Intelligence",
    title: "Use daily and cyclical timing tools",
    description:
      "Move from broad timing context into Dasha and transit-aware guidance when a chart is available.",
    cards: [
      {
        key: "dasha",
        title: "Dasha",
        description: "Check Mahadasha, Antardasha, and Pratyantardasha timing.",
        href: "/dasha",
        fallbackHref: "/dasha",
        ctaLabel: "View Dasha",
        status: "requires Kundli",
        category: "timing",
        icon: "kundli",
        feature: "utility-hub-dasha",
        eventName: "utility_card_click",
      },
      {
        key: "transit",
        title: "Transit / Gochar",
        description: "Review personalized transit cues against the active Kundli.",
        href: "/transit",
        fallbackHref: "/transit",
        ctaLabel: "Check Transit",
        status: "requires Kundli",
        category: "timing",
        icon: "kundli",
        feature: "utility-hub-transit",
        eventName: "utility_card_click",
      },
      {
        key: "panchang",
        title: "Panchang",
        description: "Open tithi, nakshatra, yoga, and daily timing support.",
        href: "/panchang",
        fallbackHref: "/panchang",
        ctaLabel: "Open Panchang",
        status: "available",
        category: "timing",
        icon: "panchang",
        feature: "utility-hub-panchang",
        eventName: "panchang_tool_click",
      },
      {
        key: "muhurat",
        title: "Muhurat",
        description: "Use daily timing windows for practical planning support.",
        href: "/muhurat",
        fallbackHref: "/panchang",
        ctaLabel: "Open Muhurat",
        status: "available",
        category: "timing",
        icon: "muhurta",
        feature: "utility-hub-muhurat",
        eventName: "muhurta_tool_click",
      },
    ],
  },
  {
    eyebrow: "Relationship Tools",
    title: "Go from compatibility to guidance",
    description:
      "Use matchmaking and compatibility tools to continue into reports or consultation when appropriate.",
    cards: [
      {
        key: "matchmaking",
        title: "Matchmaking",
        description: "Run Guna Milan and compatibility intelligence from chart inputs.",
        href: "/matchmaking",
        fallbackHref: "/matchmaking",
        ctaLabel: "Check Compatibility",
        status: "requires Kundli",
        category: "relationship",
        icon: "compatibility",
        feature: "utility-hub-matchmaking",
        eventName: "utility_card_click",
      },
      {
        key: "dosha",
        title: "Dosha Detection",
        description: "Check calm dosha context and optional support mapping.",
        href: "/dosha-yoga",
        fallbackHref: "/dosha-yoga",
        ctaLabel: "View Dosha Layer",
        status: "requires Kundli",
        category: "relationship",
        icon: "kundli",
        feature: "utility-hub-dosha",
        eventName: "utility_card_click",
      },
      {
        key: "yoga",
        title: "Yoga Detection",
        description: "Review supportive and structural yoga patterns in the chart.",
        href: "/dosha-yoga",
        fallbackHref: "/dosha-yoga",
        ctaLabel: "View Yoga Layer",
        status: "requires Kundli",
        category: "relationship",
        icon: "kundli",
        feature: "utility-hub-yoga",
        eventName: "utility_card_click",
      },
    ],
  },
  {
    eyebrow: "Support + Guidance",
    title: "Complement chart reading with practical layers",
    description:
      "Use number-based, remedy-based, and report-based pathways as optional support layers.",
    cards: [
      {
        key: "numerology",
        title: "Numerology",
        description: "Check core numbers and optional number-based guidance.",
        href: "/numerology",
        fallbackHref: "/numerology",
        ctaLabel: "Explore Numerology",
        status: "available",
        category: "support",
        icon: "numerology",
        feature: "utility-hub-numerology",
        eventName: "numerology_tool_click",
      },
      {
        key: "remedies",
        title: "Remedies",
        description: "Review calm, optional support suggestions and remedy pathways.",
        href: "/remedies",
        fallbackHref: "/insights/remedies",
        ctaLabel: "Open Remedies",
        status: "available",
        category: "support",
        icon: "kundli",
        feature: "utility-hub-remedies",
        eventName: "utility_card_click",
      },
      {
        key: "reports",
        title: "Reports",
        description: "Continue from utilities into premium report continuity.",
        href: "/reports",
        fallbackHref: "/reports",
        ctaLabel: "Open Reports",
        status: "requires Kundli",
        category: "support",
        icon: "report",
        feature: "utility-hub-reports",
        eventName: "utility_card_click",
      },
    ],
  },
  {
    eyebrow: "Premium + Human Guidance",
    title: "Continue into Ask NI or consultation when needed",
    description:
      "Move from self-serve utility work into NAVAGRAHA Intelligence guidance or a human-led session.",
    cards: [
      {
        key: "ask-ai",
        title: "Ask NI",
        description: "Use NAVAGRAHA Intelligence for chart-aware questions with safe guidance continuity.",
        href: "/ai",
        fallbackHref: "/ai",
        ctaLabel: "Ask NI",
        status: "requires Kundli",
        category: "guidance",
        icon: "ai",
        feature: "utility-hub-ai",
        eventName: "utility_card_click",
      },
      {
        key: "consultation",
        title: "Consultation",
        description: "Book or continue a human consultation path when deeper review is needed.",
        href: "/consultation",
        fallbackHref: "/consultation",
        ctaLabel: "Book Consultation",
        status: "available",
        category: "guidance",
        icon: "consultation",
        feature: "utility-hub-consultation",
        eventName: "utility_card_click",
      },
    ],
  },
] as const;

const utilityShortcutCards: readonly UtilityHubTool[] = [
  {
    key: "shortcut-kundli",
    title: "Generate Kundli",
    description: "Create your chart foundation.",
    href: "/kundli",
    fallbackHref: "/kundli",
    ctaLabel: "Open",
    status: "available",
    category: "birth chart",
    icon: "kundli",
    feature: "utility-shortcut-kundli",
    eventName: "utility_card_click",
  },
  {
    key: "shortcut-dasha",
    title: "View Dasha",
    description: "Open Mahadasha and timeline context.",
    href: "/dasha",
    fallbackHref: "/dasha",
    ctaLabel: "Open",
    status: "requires Kundli",
    category: "timing",
    icon: "kundli",
    feature: "utility-shortcut-dasha",
    eventName: "utility_card_click",
  },
  {
    key: "shortcut-transit",
    title: "Check Transit",
    description: "Review personalized transit cues.",
    href: "/transit",
    fallbackHref: "/transit",
    ctaLabel: "Open",
    status: "requires Kundli",
    category: "timing",
    icon: "kundli",
    feature: "utility-shortcut-transit",
    eventName: "utility_card_click",
  },
  {
    key: "shortcut-panchang",
    title: "View Panchang",
    description: "Open daily timing context.",
    href: "/panchang",
    fallbackHref: "/panchang",
    ctaLabel: "Open",
    status: "available",
    category: "timing",
    icon: "panchang",
    feature: "utility-shortcut-panchang",
    eventName: "panchang_tool_click",
  },
  {
    key: "shortcut-matchmaking",
    title: "Matchmaking",
    description: "Check compatibility flow.",
    href: "/matchmaking",
    fallbackHref: "/matchmaking",
    ctaLabel: "Open",
    status: "requires Kundli",
    category: "relationship",
    icon: "compatibility",
    feature: "utility-shortcut-matchmaking",
    eventName: "utility_card_click",
  },
  {
    key: "shortcut-numerology",
    title: "Numerology",
    description: "Review number-based guidance.",
    href: "/numerology",
    fallbackHref: "/numerology",
    ctaLabel: "Open",
    status: "available",
    category: "support",
    icon: "numerology",
    feature: "utility-shortcut-numerology",
    eventName: "numerology_tool_click",
  },
  {
    key: "shortcut-remedies",
    title: "Remedies",
    description: "Check optional support routines.",
    href: "/remedies",
    fallbackHref: "/insights/remedies",
    ctaLabel: "Open",
    status: "available",
    category: "support",
    icon: "kundli",
    feature: "utility-shortcut-remedies",
    eventName: "utility_card_click",
  },
  {
    key: "shortcut-ai",
    title: "Ask NI",
    description: "Continue with NAVAGRAHA Intelligence.",
    href: "/ai",
    fallbackHref: "/ai",
    ctaLabel: "Open",
    status: "requires Kundli",
    category: "guidance",
    icon: "ai",
    feature: "utility-shortcut-ai",
    eventName: "utility_card_click",
  },
  {
    key: "shortcut-reports",
    title: "Reports",
    description: "Open saved and premium reports.",
    href: "/reports",
    fallbackHref: "/reports",
    ctaLabel: "Open",
    status: "requires Kundli",
    category: "support",
    icon: "report",
    feature: "utility-shortcut-reports",
    eventName: "utility_card_click",
  },
  {
    key: "shortcut-consultation",
    title: "Consultation",
    description: "Continue to a human review path.",
    href: "/consultation",
    fallbackHref: "/consultation",
    ctaLabel: "Open",
    status: "available",
    category: "guidance",
    icon: "consultation",
    feature: "utility-shortcut-consultation",
    eventName: "utility_card_click",
  },
] as const;

const relatedUtilityBlocks: readonly UtilityHubPathway[] = [
  {
    title: "Kundli to deeper intelligence",
    description: "Move from birth chart generation into Dasha, Transit, reports, or AI.",
    primaryHref: "/kundli",
    primaryLabel: "Open Kundli",
    secondaryHref: "/ai",
    secondaryLabel: "Ask NI",
    feature: "utility-related-kundli",
  },
  {
    title: "Panchang to daily timing",
    description: "Continue into Muhurat, Rashifal, and optional remedy planning.",
    primaryHref: "/panchang",
    primaryLabel: "Open Panchang",
    secondaryHref: "/muhurat",
    secondaryLabel: "Open Muhurat",
    feature: "utility-related-panchang",
  },
  {
    title: "Matchmaking to guidance",
    description: "Continue into marriage reporting or a consultation review.",
    primaryHref: "/matchmaking",
    primaryLabel: "Check Compatibility",
    secondaryHref: "/consultation",
    secondaryLabel: "Book Consultation",
    feature: "utility-related-matchmaking",
  },
  {
    title: "Dosha / Yoga to optional support",
    description: "Continue into remedies, reports, or AI context when a chart signal is present.",
    primaryHref: "/remedies",
    primaryLabel: "Open Remedies",
    secondaryHref: "/reports",
    secondaryLabel: "Open Reports",
    feature: "utility-related-dosha-yoga",
  },
  {
    title: "Numerology to complementary review",
    description: "Move from number-based guidance into reports, NAVAGRAHA Intelligence, or consultation.",
    primaryHref: "/numerology",
    primaryLabel: "Open Numerology",
    secondaryHref: "/ai",
    secondaryLabel: "Ask NI",
    feature: "utility-related-numerology",
  },
] as const;

export function getAstrologyUtilityHubSections() {
  return utilityHubSections;
}

export function getAstrologyUtilityShortcutCards() {
  return utilityShortcutCards;
}

export function getAstrologyUtilityRelatedBlocks() {
  return relatedUtilityBlocks;
}

export function getUtilityStatusLabel(status: UtilityHubStatus) {
  switch (status) {
    case "available":
      return "Available";
    case "coming soon":
      return "Coming Soon";
    case "requires Kundli":
      return "Requires Kundli";
    default:
      return "Available";
  }
}

export function getUtilityStatusTone(status: UtilityHubStatus) {
  switch (status) {
    case "available":
      return "trust";
    case "coming soon":
      return "outline";
    case "requires Kundli":
      return "neutral";
    default:
      return "neutral";
  }
}

export function buildCrossToolRecommendations(input: UtilityRecommendationInput) {
  const recommendations: UtilityRecommendation[] = [];
  const push = (...items: UtilityRecommendation[]) => {
    recommendations.push(...items);
  };

  if (!input.hasActiveKundli) {
    push(
      {
        key: "recommend-generate-kundli",
        title: "Generate Kundli first",
        description: "Create the chart foundation before moving into deeper tools.",
        href: "/kundli",
        ctaLabel: "Generate Kundli",
        reason: "No active Kundli is present, so the next step should be chart setup.",
        status: "available",
        category: "birth chart",
      },
      {
        key: "recommend-panchang",
        title: "Check Panchang",
        description: "Use daily timing context while chart setup is pending.",
        href: "/panchang",
        ctaLabel: "Open Panchang",
        reason: "Panchang stays useful even before the first chart is saved.",
        status: "available",
        category: "timing",
      },
      {
        key: "recommend-numerology",
        title: "Explore Numerology",
        description: "Use number-based guidance as a complementary entry point.",
        href: "/numerology",
        ctaLabel: "Open Numerology",
        reason: "Numerology can be used independently while chart setup is pending.",
        status: "available",
        category: "support",
      }
      );
  } else {
    let hasReportContinuation = false;
    let hasAiContinuation = false;

    if (input.viewedMatchmaking) {
      push(
        {
          key: "recommend-marriage-report",
          title: "Open Marriage Report",
          description: "Continue compatibility review in a structured report format.",
          href: "/reports",
          ctaLabel: "Open Report",
          reason: "Matchmaking history is present, so report continuity is useful.",
          status: "requires Kundli",
          category: "relationship",
        },
        {
          key: "recommend-consultation-matchmaking",
          title: "Book Consultation",
          description: "Use a soft human review path for compatibility context.",
          href: "/consultation",
          ctaLabel: "Book Consultation",
          reason: "Compatibility work often benefits from a consultation review.",
          status: "available",
          category: "guidance",
        }
      );
      hasReportContinuation = true;
    }

    if (input.hasDoshaOrYogaFindings) {
      push(
        {
          key: "recommend-remedies",
          title: "Open Remedies",
          description: "Review calm optional support guidance.",
          href: "/remedies",
          ctaLabel: "Open Remedies",
          reason: "Chart findings can be paired with optional remedy guidance.",
          status: "available",
          category: "support",
        },
        {
          key: "recommend-reports-dosha-yoga",
          title: "Open Reports",
          description: "Continue into a report context for interpretation continuity.",
          href: "/reports",
          ctaLabel: "Open Reports",
          reason: "Dosha or yoga signals are better consumed in a report layer.",
          status: "requires Kundli",
          category: "support",
        },
        {
          key: "recommend-ai-dosha-yoga",
          title: "Ask NI",
          description: "Continue into NAVAGRAHA Intelligence with safe context grounding.",
          href: "/ai",
          ctaLabel: "Ask NI",
          reason: "AI can help explain the pattern without fear-based language.",
          status: "requires Kundli",
          category: "guidance",
        }
      );
      hasReportContinuation = true;
      hasAiContinuation = true;
    }

    if (input.viewedPanchang) {
      push(
        {
          key: "recommend-rashifal",
          title: "Open Rashifal",
          description: "Move from daily timing into sign-level guidance.",
          href: "/rashifal",
          ctaLabel: "Open Rashifal",
          reason: "Panchang usage often flows naturally into Rashifal.",
          status: "available",
          category: "timing",
        },
        {
          key: "recommend-daily-remedy",
          title: "Open Daily Remedy",
          description: "Use optional daily support after timing review.",
          href: "/remedies",
          ctaLabel: "Open Remedies",
          reason: "Timing context can continue into optional daily support.",
          status: "available",
          category: "support",
        },
        {
          key: "recommend-muhurat",
          title: "Open Muhurat",
          description: "Review practical timing windows for planning.",
          href: "/muhurat",
          ctaLabel: "Open Muhurat",
          reason: "Panchang context naturally supports Muhurat planning.",
          status: "available",
          category: "timing",
        }
      );
    }

    if (input.viewedNumerology) {
      push(
        {
          key: "recommend-name-numerology",
          title: "Name Numerology",
          description: "Explore name-based number guidance.",
          href: "/numerology",
          ctaLabel: "Open Numerology",
          reason: "A numerology visit can continue into deeper number-based guidance.",
          status: "available",
          category: "support",
        },
        {
          key: "recommend-business-numerology",
          title: "Business Numerology",
          description: "Check optional business-name number guidance.",
          href: "/numerology",
          ctaLabel: "Open Numerology",
          reason: "Business-name analysis is a complementary numerology layer.",
          status: "available",
          category: "support",
        },
        {
          key: "recommend-numerology-report",
          title: "Open Reports",
          description: "Continue from numerology into reports or AI.",
          href: "/reports",
          ctaLabel: "Open Reports",
          reason: "Numerology insights can continue into reports or AI safely.",
          status: "requires Kundli",
          category: "support",
        },
        {
          key: "recommend-numerology-ai",
          title: "Ask NI",
          description: "Use NAVAGRAHA Intelligence to explain complementary number patterns.",
          href: "/ai",
          ctaLabel: "Ask NI",
          reason: "AI can help frame numerology results without overstating certainty.",
          status: "requires Kundli",
          category: "guidance",
        },
        {
          key: "recommend-numerology-consultation",
          title: "Book Consultation",
          description: "Use a human review path if you want deeper context.",
          href: "/consultation",
          ctaLabel: "Book Consultation",
          reason: "Consultation is a safe follow-on for numerology questions.",
          status: "available",
          category: "guidance",
        }
      );
      hasReportContinuation = true;
      hasAiContinuation = true;
    }

    push(
      {
        key: "recommend-dasha",
        title: "View Dasha",
        description: "Keep the active chart connected to Mahadasha timing.",
        href: "/dasha",
        ctaLabel: "View Dasha",
        reason: "An active Kundli is available, so dasha timing is a useful next layer.",
        status: "requires Kundli",
        category: "timing",
      },
      {
        key: "recommend-transit",
        title: "Check Transit",
        description: "Review current planetary movement against the chart.",
        href: "/transit",
        ctaLabel: "Check Transit",
        reason: "Transit is most useful when compared with a saved Kundli.",
        status: "requires Kundli",
        category: "timing",
      }
    );

    if (!hasReportContinuation) {
      push({
        key: "recommend-reports",
        title: "Open Reports",
        description: "Continue from the chart into a report layer.",
        href: "/reports",
        ctaLabel: "Open Reports",
        reason: "Reports become more relevant once a Kundli is available.",
        status: "requires Kundli",
        category: "support",
      });
    }

    if (!hasAiContinuation) {
      push({
        key: "recommend-ai",
        title: "Ask NI",
        description: "Move into NAVAGRAHA Intelligence continuity.",
        href: "/ai",
        ctaLabel: "Ask NI",
        reason: "A saved chart can ground AI continuity safely.",
        status: "requires Kundli",
        category: "guidance",
      });
    }
  }

  const unique = new Map<string, UtilityRecommendation>();

  for (const recommendation of recommendations) {
    if (!unique.has(recommendation.key)) {
      unique.set(recommendation.key, recommendation);
    }
  }

  return Array.from(unique.values());
}
