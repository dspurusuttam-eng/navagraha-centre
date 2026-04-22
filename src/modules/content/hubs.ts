export type ContentHubSubtopic = {
  title: string;
  description: string;
  href: string;
};

export type ContentHubCallToAction = {
  label: string;
  href: string;
};

export type ContentHub = {
  slug: string;
  path: string;
  title: string;
  description: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroHighlights: readonly string[];
  heroNote: string;
  subtopics: readonly ContentHubSubtopic[];
  conversionCtas: readonly ContentHubCallToAction[];
  relatedHubSlugs: readonly string[];
  metadata: {
    title: string;
    description: string;
    keywords: readonly string[];
  };
};

export const contentHubs: readonly ContentHub[] = [
  {
    slug: "horoscope",
    path: "/horoscope-hub",
    title: "Rashifal & Horoscope Hub",
    description:
      "A structured authority layer for daily and monthly horoscope guidance, linked to chart tools and practical next actions.",
    heroEyebrow: "Rashifal / Horoscope Hub",
    heroTitle: "Horoscope guidance organized for clarity, cadence, and utility.",
    heroDescription:
      "This hub connects daily and monthly horoscope pathways with chart-first tools so users can move from general guidance to personal context without friction.",
    heroHighlights: [
      "Daily and monthly guidance grouped under one clear public knowledge surface",
      "Internal links designed for both discoverability and practical navigation",
      "Calm, non-sensational language aligned to premium editorial standards",
    ],
    heroNote:
      "Use this hub as the entry point when users begin from general rashifal interest before generating a personalized chart.",
    subtopics: [
      {
        title: "Daily Rashifal",
        description:
          "Start with daily guidance in a concise format designed for repeat engagement and readability.",
        href: "/daily-rashifal",
      },
      {
        title: "Daily Horoscope Surface",
        description:
          "Explore the broader horoscope route optimized for search entry and conversion into chart flow.",
        href: "/daily-horoscope",
      },
      {
        title: "Monthly Forecast Insight",
        description:
          "Read the monthly editorial forecast for structured timing themes and reflective planning.",
        href: "/insights/april-2026-monthly-forecast",
      },
      {
        title: "Generate Your Kundli",
        description:
          "Move from sign-level guidance into your personalized sidereal chart context.",
        href: "/sign-up",
      },
    ],
    conversionCtas: [
      { label: "Generate Your Kundli", href: "/sign-up" },
      { label: "Ask My Chart", href: "/kundli-ai" },
    ],
    relatedHubSlugs: ["nakshatra", "graha", "compatibility"],
    metadata: {
      title: "Rashifal & Horoscope Hub",
      description:
        "Explore NAVAGRAHA CENTRE's Rashifal and horoscope authority hub with daily guidance, monthly forecasts, and chart-linked next steps.",
      keywords: [
        "rashifal hub",
        "daily horoscope guidance",
        "monthly forecast astrology",
        "vedic horoscope insights",
      ],
    },
  },
  {
    slug: "nakshatra",
    path: "/nakshatra-hub",
    title: "Nakshatra Hub",
    description:
      "A focused entry surface explaining how nakshatra context supports chart interpretation and report depth.",
    heroEyebrow: "Nakshatra Hub",
    heroTitle: "Understand nakshatra context through chart-backed astrology flows.",
    heroDescription:
      "Nakshatra and pada insights are used as structured interpretation layers inside NAVAGRAHA CENTRE chart outputs and AI guidance.",
    heroHighlights: [
      "Nakshatra appears as a structured field inside planetary chart output",
      "Interpretation remains chart-grounded rather than generic content",
      "Clear bridges to reports, Ask My Chart, and consultation",
    ],
    heroNote:
      "The nakshatra hub is designed as a quality knowledge layer that supports user trust before deeper paid journeys.",
    subtopics: [
      {
        title: "Ask My Chart (Nakshatra Questions)",
        description:
          "Use chart-aware assistant flows to ask nakshatra-specific questions with profile context.",
        href: "/kundli-ai",
      },
      {
        title: "Career Report Layer",
        description:
          "Review premium report depth where nakshatra patterns become more actionable.",
        href: "/career-report",
      },
      {
        title: "Finance Report Layer",
        description:
          "Explore financial interpretation pathways connected to chart placements and timing themes.",
        href: "/finance-report",
      },
      {
        title: "Consultation Guidance",
        description:
          "Book consultation for nuance when nakshatra interpretation needs human depth.",
        href: "/consultation",
      },
    ],
    conversionCtas: [
      { label: "Explore NAVAGRAHA AI", href: "/kundli-ai" },
      { label: "Book Free Consultation", href: "/consultation" },
    ],
    relatedHubSlugs: ["graha", "navagraha-ai", "consultation"],
    metadata: {
      title: "Nakshatra Hub",
      description:
        "Learn how NAVAGRAHA CENTRE uses nakshatra context in chart-aware AI guidance, reports, and consultation journeys.",
      keywords: [
        "nakshatra hub",
        "vedic nakshatra guidance",
        "nakshatra and pada insights",
        "chart-based astrology interpretation",
      ],
    },
  },
  {
    slug: "graha",
    path: "/graha-hub",
    title: "Graha / Planet Hub",
    description:
      "A clean planet-centric hub for understanding graha placements, chart interpretation, and follow-up actions.",
    heroEyebrow: "Graha / Planet Hub",
    heroTitle: "Planetary context organized for practical chart interpretation.",
    heroDescription:
      "This hub connects graha-focused learning with chart generation, AI interpretation, and premium report depth for users who want structure over noise.",
    heroHighlights: [
      "Planetary interpretation tied to verified sidereal chart context",
      "Clean progression from free chart value to deeper premium layers",
      "Structured links to AI tools, reports, and consultation",
    ],
    heroNote:
      "The goal is discoverability and trust: useful graha context with clear pathways into real product flows.",
    subtopics: [
      {
        title: "AI Kundli Reading",
        description:
          "Use AI chart reading to understand graha placements through a structured summary layer.",
        href: "/kundli-ai",
      },
      {
        title: "Ask My Chart",
        description:
          "Ask focused graha questions inside your protected chart-aware assistant flow.",
        href: "/kundli-ai",
      },
      {
        title: "Health / Wellbeing Report",
        description:
          "Review premium report pathways for deeper interpretation tied to planetary context.",
        href: "/health-report",
      },
      {
        title: "Consultation Explainer",
        description:
          "Move into astrologer-led interpretation when chart complexity requires human judgment.",
        href: "/consultation-explainer",
      },
    ],
    conversionCtas: [
      { label: "Generate Your Kundli", href: "/sign-up" },
      { label: "Open Reports", href: "/career-report" },
    ],
    relatedHubSlugs: ["nakshatra", "horoscope", "navagraha-ai"],
    metadata: {
      title: "Graha / Planet Hub",
      description:
        "Explore NAVAGRAHA CENTRE's graha hub for planet-based chart understanding, AI interpretation, and premium astrology pathways.",
      keywords: [
        "graha hub",
        "planetary astrology insights",
        "vedic planet interpretation",
        "sidereal chart planet guidance",
      ],
    },
  },
  {
    slug: "compatibility",
    path: "/compatibility-hub",
    title: "Compatibility & Marriage Hub",
    description:
      "A relationship-focused authority hub linking compatibility tools, AI explanation, premium reports, and consultation.",
    heroEyebrow: "Compatibility / Marriage Hub",
    heroTitle: "Compatibility guidance from first check to deeper relationship clarity.",
    heroDescription:
      "Use this hub to move from initial compatibility exploration into chart-aware AI guidance, premium analysis, and private consultation where needed.",
    heroHighlights: [
      "Structured compatibility entry points with clean conversion paths",
      "Balanced framing that avoids exaggerated certainty",
      "Clear relationship between self-service tools and consultation depth",
    ],
    heroNote:
      "Compatibility content is designed for trust and practicality: helpful context first, premium depth when users are ready.",
    subtopics: [
      {
        title: "Marriage Compatibility Tool",
        description:
          "Start with compatibility-focused guidance in a direct and globally readable surface.",
        href: "/marriage-compatibility",
      },
      {
        title: "Love Horoscope Entry",
        description:
          "Use horoscope-oriented relationship content as a lighter public exploration path.",
        href: "/love-horoscope",
      },
      {
        title: "Compatibility Report Layer",
        description:
          "Continue into premium report depth for nuanced relationship interpretation.",
        href: "/career-report",
      },
      {
        title: "Compatibility Consultation",
        description:
          "Book a focused consultation for relationship dynamics that require human interpretation.",
        href: "/consultation?intent=compatibility-focused",
      },
    ],
    conversionCtas: [
      { label: "Check Compatibility", href: "/marriage-compatibility" },
      { label: "Book Compatibility Consultation", href: "/consultation" },
    ],
    relatedHubSlugs: ["horoscope", "consultation", "navagraha-ai"],
    metadata: {
      title: "Compatibility & Marriage Hub",
      description:
        "Explore compatibility and marriage-focused astrology pathways at NAVAGRAHA CENTRE with tools, AI support, and consultation follow-up.",
      keywords: [
        "marriage compatibility hub",
        "relationship astrology guidance",
        "vedic compatibility insights",
        "compatibility consultation",
      ],
    },
  },
  {
    slug: "consultation",
    path: "/consultation-explainer",
    title: "Consultation Explainer Hub",
    description:
      "A service-intent authority page that clarifies consultation structure, expectations, and follow-up pathways.",
    heroEyebrow: "Consultation Explainer Hub",
    heroTitle: "Consultation clarity before booking improves trust and conversion.",
    heroDescription:
      "This hub explains how consultation journeys are structured and when users should move from self-service chart tools into astrologer-led interpretation.",
    heroHighlights: [
      "Service clarity designed for decision confidence before booking",
      "Links between chart output, AI guidance, and consultation depth",
      "Authority framing centered on Joy Prakash Sarmah",
    ],
    heroNote:
      "Consultation explainers should reduce hesitation and set realistic expectations without aggressive selling.",
    subtopics: [
      {
        title: "Consultation Booking",
        description:
          "Move directly into private consultation flow with clear intent and next-step continuity.",
        href: "/consultation",
      },
      {
        title: "How Private Consultations Are Structured",
        description:
          "Read the service explainer article for a transparent overview of consultation process.",
        href: "/insights/how-private-consultations-are-structured",
      },
      {
        title: "Meet Joy Prakash Sarmah",
        description:
          "Review astrologer authority profile and consultation style before booking.",
        href: "/joy-prakash-sarmah",
      },
      {
        title: "Remedy Discernment Guide",
        description:
          "Understand remedy boundaries and optional framing before selecting follow-up recommendations.",
        href: "/insights/how-to-approach-remedies-with-discernment",
      },
    ],
    conversionCtas: [
      { label: "Book Free Consultation", href: "/consultation" },
      { label: "View Services", href: "/services" },
    ],
    relatedHubSlugs: ["compatibility", "navagraha-ai", "graha"],
    metadata: {
      title: "Consultation Explainer Hub",
      description:
        "Understand consultation structure, authority framing, and follow-up paths at NAVAGRAHA CENTRE before booking.",
      keywords: [
        "astrology consultation guide",
        "consultation explainer",
        "joy prakash sarmah consultation",
        "premium astrology booking",
      ],
    },
  },
  {
    slug: "navagraha-ai",
    path: "/navagraha-ai-explainer",
    title: "NAVAGRAHA AI Explainer Hub",
    description:
      "A flagship AI authority page that connects chart-aware tools, premium layers, and practical user journeys.",
    heroEyebrow: "NAVAGRAHA AI Explainer Hub",
    heroTitle: "Chart-aware AI guidance, presented as a coherent premium product family.",
    heroDescription:
      "This hub explains how NAVAGRAHA AI tools relate to Kundli, compatibility, reports, and consultation so users can navigate the ecosystem with clarity.",
    heroHighlights: [
      "AI responses grounded in saved chart context, not generic chatbot output",
      "Clear free-to-premium progression with contextual upgrade pathways",
      "Cross-linked AI tools that support retention and deeper guidance",
    ],
    heroNote:
      "The AI explainer is a trust and conversion layer: transparent about what AI does, and how to use it productively.",
    subtopics: [
      {
        title: "NAVAGRAHA AI Product Family",
        description:
          "Explore the flagship AI surface and linked tools for Kundli, compatibility, and insight depth.",
        href: "/kundli-ai",
      },
      {
        title: "Ask My Chart",
        description:
          "Use the protected assistant for chart-grounded follow-up questions and premium depth prompts.",
        href: "/kundli-ai",
      },
      {
        title: "Career Prediction Entry",
        description:
          "Bridge AI guidance with report-oriented pathways for career and planning decisions.",
        href: "/career-prediction",
      },
      {
        title: "Pricing & Upgrade Path",
        description:
          "Review plan differences and choose the right subscription layer for deeper AI usage.",
        href: "/pricing",
      },
    ],
    conversionCtas: [
      { label: "Explore NAVAGRAHA AI", href: "/kundli-ai" },
      { label: "Generate Your Kundli", href: "/sign-up" },
    ],
    relatedHubSlugs: ["graha", "consultation", "compatibility"],
    metadata: {
      title: "NAVAGRAHA AI Explainer Hub",
      description:
        "Understand NAVAGRAHA AI as a chart-aware product family linking Kundli, assistant guidance, premium reports, and consultation.",
      keywords: [
        "navagraha ai explainer",
        "ai astrology platform",
        "chart-aware ai guidance",
        "premium astrology ai tools",
      ],
    },
  },
] as const;

export function getContentHubBySlug(slug: string) {
  return contentHubs.find((hub) => hub.slug === slug) ?? null;
}

export function getRequiredContentHubBySlug(slug: string): ContentHub {
  const hub = getContentHubBySlug(slug);

  if (!hub) {
    throw new Error(`Missing content hub: ${slug}`);
  }

  return hub;
}

export function getRelatedContentHubs(hub: ContentHub) {
  return hub.relatedHubSlugs
    .map((relatedSlug) => getContentHubBySlug(relatedSlug))
    .filter((entry): entry is ContentHub => entry !== null);
}
