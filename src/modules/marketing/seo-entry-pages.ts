import { siteConfig } from "@/config/site";

type SeoEntryMetadata = {
  title: string;
  description: string;
  keywords: readonly string[];
};

type SeoEntryHero = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: readonly string[];
  note: string;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction: {
    href: string;
    label: string;
  };
};

type SeoEntrySectionCard = {
  title: string;
  description: string;
};

type SeoEntryFaqItem = {
  question: string;
  answer: string;
};

type SeoEntryPremiumTeaser = {
  title: string;
  description: string;
  href: string;
  label: string;
};

export type SeoEntryPageKey =
  | "kundli-ai"
  | "marriage-compatibility"
  | "daily-horoscope"
  | "rashifal"
  | "career-report"
  | "finance-report"
  | "health-report";

export type SeoEntryPage = {
  key: SeoEntryPageKey;
  path: `/${SeoEntryPageKey}`;
  metadata: SeoEntryMetadata;
  hero: SeoEntryHero;
  valueCards: readonly SeoEntrySectionCard[];
  flowCards: readonly SeoEntrySectionCard[];
  faqItems: readonly SeoEntryFaqItem[];
  relatedPages: readonly SeoEntryPageKey[];
  premiumTeaser: SeoEntryPremiumTeaser;
};

const seoEntryPages: Record<SeoEntryPageKey, SeoEntryPage> = {
  "kundli-ai": {
    key: "kundli-ai",
    path: "/kundli-ai",
    metadata: {
      title: "Kundli AI Chart Reading",
      description:
        "Generate your chart foundation with NAVAGRAHA AI and move into chart-aware guidance, Ask My Chart, and premium reports.",
      keywords: [
        "kundli ai",
        "vedic birth chart",
        "online kundli reading",
        "chart-aware assistant",
      ],
    },
    hero: {
      eyebrow: "Kundli AI",
      title: "Build your chart foundation before any interpretation.",
      description:
        "Start with your birth details, generate a deterministic sidereal chart, and continue with chart-aware guidance in a protected member flow.",
      highlights: [
        "Birth context validation with place, timezone, and UTC conversion",
        "Saved chart reuse so your chart remains stable across app surfaces",
        "Ask My Chart responses grounded in your stored chart context",
      ],
      note: "Chart guidance is interpretive and reflective. It is not a promise of guaranteed life outcomes.",
      primaryAction: {
        href: "/sign-up",
        label: "Create Free Account",
      },
      secondaryAction: {
        href: "/dashboard/onboarding",
        label: "Generate My Chart",
      },
    },
    valueCards: [
      {
        title: "Trusted chart pipeline",
        description:
          "Birth inputs are normalized and verified before chart generation to keep interpretation boundaries clear.",
      },
      {
        title: "Reusable chart context",
        description:
          "Your saved chart powers dashboard, reports, and assistant responses without repeated ad hoc rebuilds.",
      },
      {
        title: "Premium depth when needed",
        description:
          "Free access starts your journey; premium layers unlock deeper structured chart review and report depth.",
      },
    ],
    flowCards: [
      {
        title: "Step 1: Complete onboarding",
        description:
          "Add birth date, time, and place. The system resolves location and timezone with validation safeguards.",
      },
      {
        title: "Step 2: Review chart view",
        description:
          "Open your protected chart surface to inspect Lagna, houses, and graha placements.",
      },
      {
        title: "Step 3: Continue in Ask My Chart",
        description:
          "Ask chart-grounded questions and receive structured responses aligned to your saved chart context.",
      },
    ],
    faqItems: [
      {
        question: "Does this page provide instant life predictions?",
        answer:
          "No. The flow is chart-first and interpretation-led, with clear boundaries and no guarantees.",
      },
      {
        question: "Can I use this without creating an account?",
        answer:
          "You can explore the page publicly, but chart generation and assistant features require a member account.",
      },
      {
        question: "Where do I ask chart questions after signup?",
        answer:
          "Use the protected Ask My Chart surface after onboarding and chart creation.",
      },
    ],
    relatedPages: ["daily-horoscope", "career-report", "marriage-compatibility"],
    premiumTeaser: {
      title: "Unlock premium chart depth when you need more context",
      description:
        "Premium plans expand assistant depth and report layers while keeping the same calm, non-sensational tone.",
      href: "/pricing",
      label: "View Plan Options",
    },
  },
  "marriage-compatibility": {
    key: "marriage-compatibility",
    path: "/marriage-compatibility",
    metadata: {
      title: "Marriage Compatibility Guidance",
      description:
        "Explore marriage compatibility guidance through a calm astrology process that routes into structured consultation and chart review.",
      keywords: [
        "marriage compatibility astrology",
        "relationship astrology consultation",
        "kundli compatibility guidance",
        "compatibility reading",
      ],
    },
    hero: {
      eyebrow: "Marriage Compatibility",
      title: "Evaluate compatibility with structure, context, and discretion.",
      description:
        "Use a measured compatibility flow that prioritizes chart context, discussion quality, and consultation-ready clarity.",
      highlights: [
        "Compatibility intent routing into the right consultation format",
        "Chart-grounded context for relationship dynamics and timing themes",
        "Calm language without fear framing or certainty claims",
      ],
      note: "Compatibility interpretation supports thoughtful decisions. It does not replace personal judgment.",
      primaryAction: {
        href: "/consultation?intent=compatibility-focused",
        label: "Book Compatibility Consultation",
      },
      secondaryAction: {
        href: "/sign-up",
        label: "Start With My Chart",
      },
    },
    valueCards: [
      {
        title: "Structured compatibility path",
        description:
          "Move from inquiry to consultation through a defined route instead of generic, ungrounded chat.",
      },
      {
        title: "Context-aware support",
        description:
          "Pair chart review with relationship-focused prompts so discussions stay practical and clear.",
      },
      {
        title: "Premium follow-up options",
        description:
          "Continue with focused reports or follow-up sessions when deeper relationship themes need careful review.",
      },
    ],
    flowCards: [
      {
        title: "Step 1: Share consultation intent",
        description:
          "Choose the compatibility route so intake and recommendations stay aligned to your goal.",
      },
      {
        title: "Step 2: Review chart context",
        description:
          "Use saved chart context to ground key relationship themes before or after consultation.",
      },
      {
        title: "Step 3: Continue with follow-up",
        description:
          "Use post-consultation recommendations for report or remedy follow-up when relevant.",
      },
    ],
    faqItems: [
      {
        question: "Is compatibility presented as a guaranteed result?",
        answer:
          "No. Compatibility guidance is interpretive support, not certainty or deterministic outcomes.",
      },
      {
        question: "Can I start from a free account?",
        answer:
          "Yes. You can begin with account setup and chart onboarding, then choose consultation depth.",
      },
      {
        question: "Where do premium compatibility insights appear?",
        answer:
          "Premium depth appears in protected report and assistant surfaces, based on your plan and chart context.",
      },
    ],
    relatedPages: ["kundli-ai", "rashifal", "health-report"],
    premiumTeaser: {
      title: "Add compatibility depth only when useful",
      description:
        "Premium report and assistant layers can support deeper analysis without pressure or urgency tactics.",
      href: "/pricing",
      label: "Explore Premium Reports",
    },
  },
  "daily-horoscope": {
    key: "daily-horoscope",
    path: "/daily-horoscope",
    metadata: {
      title: "Daily Horoscope With Chart Context",
      description:
        "Move from generic daily horoscope browsing to chart-aware daily guidance inside NAVAGRAHA AI.",
      keywords: [
        "daily horoscope",
        "personalized horoscope",
        "chart-aware daily guidance",
        "vedic daily insights",
      ],
    },
    hero: {
      eyebrow: "Daily Horoscope",
      title: "Turn daily horoscope curiosity into chart-aware direction.",
      description:
        "This entry page helps you move from broad horoscope content to personalized chart context, current-cycle guidance, and structured assistant support.",
      highlights: [
        "Public daily-intent page with clear route into member chart setup",
        "Current-cycle context connected to your validated chart record",
        "Assistant-ready flow for timing and focus-area questions",
      ],
      note: "Daily guidance is reflective support, not deterministic certainty.",
      primaryAction: {
        href: "/sign-up",
        label: "Get Personalized Daily Insights",
      },
      secondaryAction: {
        href: "/insights",
        label: "Read Insights Library",
      },
    },
    valueCards: [
      {
        title: "From broad to personal",
        description:
          "Start from public discovery, then move into your own chart context for personalized interpretation.",
      },
      {
        title: "Timing-aware guidance",
        description:
          "Use current-cycle context to understand emphasis areas, cautions, and practical focus themes.",
      },
      {
        title: "Assistant continuity",
        description:
          "Ask follow-up questions in Ask My Chart so daily insights stay connected to your actual chart.",
      },
    ],
    flowCards: [
      {
        title: "Step 1: Create member profile",
        description:
          "Sign up and complete onboarding once so daily guidance can stay chart-aware.",
      },
      {
        title: "Step 2: Review current cycle",
        description:
          "Check timing and focus areas from your dashboard chart and report surfaces.",
      },
      {
        title: "Step 3: Ask specific questions",
        description:
          "Use Ask My Chart to clarify what is active now and how to interpret the period.",
      },
    ],
    faqItems: [
      {
        question: "Is this the same as a generic zodiac feed?",
        answer:
          "No. The flow is designed to route into your chart context for personalized interpretation.",
      },
      {
        question: "Do I need premium access to start?",
        answer:
          "No. You can begin with a free account and unlock deeper premium layers only if needed.",
      },
      {
        question: "Can I still book a consultation from here?",
        answer:
          "Yes. Consultation paths remain available when you want human-led interpretation.",
      },
    ],
    relatedPages: ["rashifal", "career-report", "finance-report"],
    premiumTeaser: {
      title: "Need deeper daily interpretation?",
      description:
        "Premium access extends response depth and report detail while keeping language calm and non-sensational.",
      href: "/pricing",
      label: "See Premium Access",
    },
  },
  rashifal: {
    key: "rashifal",
    path: "/rashifal",
    metadata: {
      title: "Rashifal Guidance With NAVAGRAHA AI",
      description:
        "Explore rashifal entry guidance and move into personalized chart, assistant, and report surfaces within NAVAGRAHA CENTRE.",
      keywords: [
        "rashifal",
        "aaj ka rashifal guidance",
        "vedic rashifal insights",
        "personalized rashifal",
      ],
    },
    hero: {
      eyebrow: "Rashifal",
      title: "Start with rashifal interest, continue with your own chart.",
      description:
        "This page is built for users searching rashifal-style guidance and routes them into the chart-backed NAVAGRAHA member journey.",
      highlights: [
        "Search-friendly entry page for rashifal intent",
        "Clear bridge into onboarding, chart view, and assistant surfaces",
        "Trust-safe language with no fear framing or exaggerated claims",
      ],
      note: "Rashifal interest is the entry point; your chart context provides deeper personal relevance.",
      primaryAction: {
        href: "/sign-up",
        label: "Start My Rashifal Journey",
      },
      secondaryAction: {
        href: "/dashboard/ask-my-chart",
        label: "Ask My Chart",
      },
    },
    valueCards: [
      {
        title: "Intent-aware entry",
        description:
          "The page captures rashifal search intent while directing users into a higher-quality chart workflow.",
      },
      {
        title: "Chart-backed continuity",
        description:
          "Once chart data is available, assistant and report flows remain consistent across the protected app.",
      },
      {
        title: "Calm premium tone",
        description:
          "The experience avoids urgency language and keeps spiritual guidance measured and transparent.",
      },
    ],
    flowCards: [
      {
        title: "Step 1: Sign up and add birth details",
        description:
          "Complete onboarding so rashifal-style exploration can connect to chart-aware context.",
      },
      {
        title: "Step 2: View chart and themes",
        description:
          "Use dashboard chart and report pages for structured house and graha context.",
      },
      {
        title: "Step 3: Continue with assistant or consultation",
        description:
          "Choose Ask My Chart for self-serve clarity or consultation for deeper human review.",
      },
    ],
    faqItems: [
      {
        question: "Is rashifal content on this page generic?",
        answer:
          "It is an entry surface designed to route you into personalized chart-backed flows.",
      },
      {
        question: "Can I use this if I already have an account?",
        answer:
          "Yes. Sign in and continue directly in dashboard onboarding, chart, report, or assistant surfaces.",
      },
      {
        question: "Do product purchases affect interpretation?",
        answer:
          "No. Guidance and chart interpretation stand independently of commerce choices.",
      },
    ],
    relatedPages: ["daily-horoscope", "kundli-ai", "health-report"],
    premiumTeaser: {
      title: "Go beyond basic rashifal context",
      description:
        "Premium layers provide deeper reasoning and report depth while keeping output grounded in your chart.",
      href: "/pricing",
      label: "Open Report Surface",
    },
  },
  "career-report": {
    key: "career-report",
    path: "/career-report",
    metadata: {
      title: "Career Astrology Report",
      description:
        "Explore career report entry guidance and move into chart-backed report generation and premium analysis.",
      keywords: [
        "career astrology report",
        "career prediction report",
        "career kundli report",
        "professional timing astrology",
      ],
    },
    hero: {
      eyebrow: "Career Report",
      title: "Career clarity built on chart context, not generic advice.",
      description:
        "Use this page to enter the career-report journey, generate chart-backed report context, and continue with assistant or consultation follow-up.",
      highlights: [
        "Career-focused report entry mapped to protected report flow",
        "Chart-aware context for strengths, themes, and timing signals",
        "Premium report depth available when additional detail is needed",
      ],
      note: "Career guidance is reflective support and should be paired with practical planning and judgment.",
      primaryAction: {
        href: "/sign-up",
        label: "Generate Career Context",
      },
      secondaryAction: {
        href: "/dashboard/report",
        label: "Open Report Dashboard",
      },
    },
    valueCards: [
      {
        title: "Structured career lens",
        description:
          "Use one dedicated route for career-focused report intent instead of generic mixed-topic guidance.",
      },
      {
        title: "Assistant + report continuity",
        description:
          "Continue from report context into Ask My Chart for targeted follow-up questions.",
      },
      {
        title: "Consultation when needed",
        description:
          "Escalate to consultation when career decisions need deeper manual interpretation.",
      },
    ],
    flowCards: [
      {
        title: "Step 1: Build chart context",
        description:
          "Create your account and complete onboarding so report generation has a verified foundation.",
      },
      {
        title: "Step 2: Open report surface",
        description:
          "Use report tools to review chart themes and route into premium depth where appropriate.",
      },
      {
        title: "Step 3: Plan next action",
        description:
          "Move to assistant or consultation follow-up based on your confidence and context needs.",
      },
    ],
    faqItems: [
      {
        question: "Does this guarantee career outcomes?",
        answer:
          "No. Reports provide structured perspective, not guarantees or deterministic promises.",
      },
      {
        question: "Where do I access the full report?",
        answer:
          "Use the protected report surface after signup and onboarding completion.",
      },
      {
        question: "Can I combine this with consultation?",
        answer:
          "Yes. Consultation is available for deeper interpretation and practical follow-up.",
      },
    ],
    relatedPages: ["finance-report", "health-report", "kundli-ai"],
    premiumTeaser: {
      title: "Need advanced report depth?",
      description:
        "Premium report layers unlock deeper structure without changing the calm, trust-safe guidance style.",
      href: "/pricing",
      label: "Upgrade For Full Access",
    },
  },
  "finance-report": {
    key: "finance-report",
    path: "/finance-report",
    metadata: {
      title: "Finance Astrology Report",
      description:
        "Start finance-report intent in a chart-aware, trust-safe flow that connects to reports, assistant, and consultation paths.",
      keywords: [
        "finance astrology report",
        "wealth astrology guidance",
        "financial timing astrology",
        "chart-based finance report",
      ],
    },
    hero: {
      eyebrow: "Finance Report",
      title: "Finance-focused insights with careful boundaries.",
      description:
        "Explore a dedicated finance-report entry route that connects search intent to chart-backed report and assistant surfaces.",
      highlights: [
        "Focused finance-report entry instead of broad mixed-topic pages",
        "Chart-aware context and premium depth when required",
        "Clear disclaimer posture with no deterministic claim language",
      ],
      note: "Financial decisions require independent judgment. Astrology context should be used as reflective support.",
      primaryAction: {
        href: "/sign-up",
        label: "Start Finance Report Flow",
      },
      secondaryAction: {
        href: "/dashboard/report",
        label: "Go To Report Surface",
      },
    },
    valueCards: [
      {
        title: "Dedicated finance intent page",
        description:
          "A focused acquisition route helps users land on the right experience quickly.",
      },
      {
        title: "Protected report continuation",
        description:
          "Move from public entry to chart-backed report generation and structured assistant follow-up.",
      },
      {
        title: "Human escalation path",
        description:
          "Book consultation whenever interpretation needs deeper judgment.",
      },
    ],
    flowCards: [
      {
        title: "Step 1: Create account",
        description:
          "Set up your member account to unlock chart-backed report continuity.",
      },
      {
        title: "Step 2: Generate report context",
        description:
          "Use the report surface for finance-oriented insight and premium depth options.",
      },
      {
        title: "Step 3: Ask or consult",
        description:
          "Continue with Ask My Chart or consultation for deeper interpretation support.",
      },
    ],
    faqItems: [
      {
        question: "Is this financial advice?",
        answer:
          "No. This flow is astrology-based reflective support, not financial or investment advice.",
      },
      {
        question: "Can I start for free?",
        answer:
          "Yes. Free access starts your report journey with plan-based limits.",
      },
      {
        question: "Where can I see plan details?",
        answer: "Plan details and premium access options are available in settings.",
      },
    ],
    relatedPages: ["career-report", "daily-horoscope", "kundli-ai"],
    premiumTeaser: {
      title: "Unlock deeper finance-report reasoning",
      description:
        "Premium access increases report and assistant depth while keeping outputs grounded and cautious.",
      href: "/pricing",
      label: "Compare Plans",
    },
  },
  "health-report": {
    key: "health-report",
    path: "/health-report",
    metadata: {
      title: "Health Astrology Report",
      description:
        "Access a health-report entry page that routes into chart-backed guidance with careful safety framing and consultation options.",
      keywords: [
        "health astrology report",
        "wellness astrology guidance",
        "chart-based health insights",
        "vedic health report",
      ],
    },
    hero: {
      eyebrow: "Health Report",
      title: "Health-oriented guidance with explicit safety boundaries.",
      description:
        "Use this route for health-report intent and continue into chart-aware report and consultation paths without exaggerated claims.",
      highlights: [
        "Health-intent entry page with safe, non-alarmist framing",
        "Chart-aware report context for reflective wellness themes",
        "Clear route to consultation for nuanced personal discussion",
      ],
      note: "This guidance is not medical advice and should not replace licensed medical care.",
      primaryAction: {
        href: "/sign-up",
        label: "Start Health Report Flow",
      },
      secondaryAction: {
        href: "/consultation?intent=consultation-ready",
        label: "Book Consultation",
      },
    },
    valueCards: [
      {
        title: "Safety-first framing",
        description:
          "Copy and CTAs are designed to remain calm, clear, and free from fear-based language.",
      },
      {
        title: "Chart-aware context",
        description:
          "Health-report intent routes into the same validated chart pipeline used across the member app.",
      },
      {
        title: "Optional premium depth",
        description:
          "Premium layers can add structure and follow-up depth while preserving safety boundaries.",
      },
    ],
    flowCards: [
      {
        title: "Step 1: Complete onboarding",
        description:
          "Provide birth details once so report and assistant surfaces can use stable chart context.",
      },
      {
        title: "Step 2: Review report surface",
        description:
          "Open report and chart pages for structured context with transparent boundaries.",
      },
      {
        title: "Step 3: Continue responsibly",
        description:
          "Use consultation for deeper interpretation and seek licensed medical professionals for health decisions.",
      },
    ],
    faqItems: [
      {
        question: "Does this page provide medical diagnosis?",
        answer:
          "No. It provides astrology-oriented reflective context and is not a replacement for medical diagnosis or treatment.",
      },
      {
        question: "Can I ask follow-up health questions in the assistant?",
        answer:
          "You can ask chart-context questions, but medical claims and diagnosis are intentionally out of scope.",
      },
      {
        question: "Is purchase required for health guidance?",
        answer:
          "No. Commerce options remain optional and secondary to consultation and chart understanding.",
      },
    ],
    relatedPages: ["kundli-ai", "marriage-compatibility", "daily-horoscope"],
    premiumTeaser: {
      title: "Use premium depth only when it adds clarity",
      description:
        "Premium access can expand structured report depth while preserving non-medical safety boundaries.",
      href: "/pricing",
      label: "See Premium Access",
    },
  },
};

export function getSeoEntryPage(key: SeoEntryPageKey) {
  return seoEntryPages[key];
}

export function listSeoEntryPages() {
  return Object.values(seoEntryPages);
}

type StructuredDataObject = Record<string, unknown>;

export function getSeoEntryStructuredData(
  entry: SeoEntryPage
): StructuredDataObject[] {
  const pageUrl = new URL(entry.path, siteConfig.url).toString();
  const breadcrumbData: StructuredDataObject = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: entry.hero.eyebrow,
        item: pageUrl,
      },
    ],
  };

  const webPageData: StructuredDataObject = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: entry.metadata.title,
    description: entry.metadata.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  const output: StructuredDataObject[] = [webPageData, breadcrumbData];

  if (entry.faqItems.length) {
    output.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entry.faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return output;
}
