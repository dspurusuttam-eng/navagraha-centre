import type { UtilityIconName } from "@/components/graphics/utility-icons";
import type { BadgeTone } from "@/components/ui/badge";
import type { TrackedEventName } from "@/lib/analytics/types";
import type { UtilityHubStatus } from "@/modules/astrology/utilities/hub";

export type ToolsHubFilterKey =
  | "all"
  | "kundli"
  | "daily-guidance"
  | "ai-ni"
  | "reports"
  | "learning"
  | "shop-remedies"
  | "services"
  | "coming-soon";

export type ToolsHubCard = {
  key: string;
  title: string;
  description: string;
  href?: string;
  fallbackHref?: string;
  ctaLabel: string;
  status: UtilityHubStatus;
  statusLabel?: string;
  statusTone?: BadgeTone;
  metaLabel?: string;
  metaTone?: BadgeTone;
  filterKey: Exclude<ToolsHubFilterKey, "all">;
  icon: UtilityIconName | "ai" | "report" | "consultation";
  feature: string;
  eventName: TrackedEventName;
};

export type ToolsHubCollection = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: readonly ToolsHubCard[];
};

export type ToolsHubFilterTab = {
  key: ToolsHubFilterKey;
  label: string;
  description: string;
};

export const toolsHubHeroBadges = [
  "Free Astrology Tools",
  "Premium Reports",
  "NAVAGRAHA Intelligence",
  "Human Astrologer Guidance",
] as const;

export const toolsHubFilterTabs: readonly ToolsHubFilterTab[] = [
  {
    key: "all",
    label: "All",
    description: "Show every NAVAGRAHA utility and service pathway.",
  },
  {
    key: "kundli",
    label: "Kundli",
    description: "Birth chart, compatibility, and Kundli-first utilities.",
  },
  {
    key: "daily-guidance",
    label: "Daily Guidance",
    description: "Rashifal, Panchang, Dasha, Transit, and Muhurat.",
  },
  {
    key: "ai-ni",
    label: "NAVAGRAHA Intelligence",
    description: "NAVAGRAHA AI and future intelligence modules.",
  },
  {
    key: "reports",
    label: "Reports",
    description: "Premium reports, dosha analysis, and deeper review layers.",
  },
  {
    key: "learning",
    label: "Learning",
    description: "Editorial content, desk updates, and learning surfaces.",
  },
  {
    key: "shop-remedies",
    label: "Remedies / Shop",
    description: "Optional spiritual support, items, and remedy pathways.",
  },
  {
    key: "services",
    label: "Consultation",
    description: "Consultation and human-guided premium support.",
  },
  {
    key: "coming-soon",
    label: "Coming Soon",
    description: "Future-ready modules that are not live yet.",
  },
] as const;

export const toolsHubCollections: readonly ToolsHubCollection[] = [
  {
    key: "core-vedic-tools",
    eyebrow: "Core Vedic Tools",
    title: "Fast entry points into the main astrology flows",
    description:
      "These are the everyday tools people expect from NAVAGRAHA CENTRE, organized for quick discovery on mobile and desktop.",
    cards: [
      {
        key: "kundli",
        title: "Kundli / Birth Chart",
        description: "Generate the main natal chart foundation with lagna, houses, and planets.",
        href: "/kundli",
        fallbackHref: "/kundli",
        ctaLabel: "Generate Kundli",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "kundli",
        icon: "kundli",
        feature: "tools-hub-kundli",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "panchang",
        title: "Panchang",
        description: "Open tithi, nakshatra, yoga, karana, sunrise, and day context.",
        href: "/panchang",
        fallbackHref: "/panchang",
        ctaLabel: "Open Panchang",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "daily-guidance",
        icon: "panchang",
        feature: "tools-hub-panchang",
        eventName: "panchang_tool_click",
      },
      {
        key: "rashifal",
        title: "Rashifal",
        description: "Read daily sign guidance with practical planning cues.",
        href: "/rashifal",
        fallbackHref: "/rashifal",
        ctaLabel: "Read Today",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "daily-guidance",
        icon: "rashifal",
        feature: "tools-hub-rashifal",
        eventName: "rashifal_view",
      },
      {
        key: "dasha",
        title: "Dasha",
        description: "Check Mahadasha, Antardasha, and time-cycle context.",
        href: "/dasha",
        fallbackHref: "/dasha",
        ctaLabel: "Open Dasha",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "daily-guidance",
        icon: "kundli",
        feature: "tools-hub-dasha",
        eventName: "utility_card_click",
      },
      {
        key: "transit",
        title: "Transit / Gochar",
        description: "Review the current planetary movement layer against the active chart.",
        href: "/transit",
        fallbackHref: "/transit",
        ctaLabel: "Open Transit",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "daily-guidance",
        icon: "kundli",
        feature: "tools-hub-transit",
        eventName: "utility_card_click",
      },
      {
        key: "matchmaking",
        title: "Matchmaking",
        description: "Review compatibility and relationship signals in a structured flow.",
        href: "/matchmaking",
        fallbackHref: "/matchmaking",
        ctaLabel: "Open Matchmaking",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "kundli",
        icon: "compatibility",
        feature: "tools-hub-matchmaking",
        eventName: "utility_card_click",
      },
      {
        key: "numerology",
        title: "Numerology",
        description: "Explore core numbers, name energy, and optional guidance patterns.",
        href: "/numerology",
        fallbackHref: "/numerology",
        ctaLabel: "Open Numerology",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "kundli",
        icon: "numerology",
        feature: "tools-hub-numerology",
        eventName: "numerology_tool_click",
      },
    ],
  },
  {
    key: "advanced-astrology-tools",
    eyebrow: "Advanced Astrology Tools",
    title: "Deeper chart analysis when you need more context",
    description:
      "These tools support structured interpretation, timing, and optional guidance without overstating certainty.",
    cards: [
      {
        key: "divisional-charts",
        title: "Divisional Charts",
        description: "Review D1, D9, D10, and higher-level chart context after creating a Kundli.",
        href: "/kundli",
        fallbackHref: "/kundli",
        ctaLabel: "Open Kundli",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "kundli",
        icon: "kundli",
        feature: "tools-hub-divisional-charts",
        eventName: "utility_card_click",
      },
      {
        key: "dosha-yoga",
        title: "Dosha + Yoga",
        description: "Review dosha and yoga indicators in a calm, report-style flow.",
        href: "/dosha-yoga",
        fallbackHref: "/dosha-yoga",
        ctaLabel: "Open Dosha + Yoga",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "reports",
        icon: "kundli",
        feature: "tools-hub-dosha-yoga",
        eventName: "report_cta_click",
      },
      {
        key: "muhurat",
        title: "Muhurat / Calendar",
        description: "Use practical timing windows and calendar support for planning.",
        href: "/muhurat",
        fallbackHref: "/panchang",
        ctaLabel: "Open Muhurat",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "daily-guidance",
        icon: "muhurta",
        feature: "tools-hub-muhurat",
        eventName: "muhurta_tool_click",
      },
      {
        key: "remedies",
        title: "Remedies",
        description: "Review calm, optional support routines and remedy pathways.",
        href: "/remedies",
        fallbackHref: "/remedies",
        ctaLabel: "Open Remedies",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "shop-remedies",
        icon: "kundli",
        feature: "tools-hub-remedies",
        eventName: "utility_card_click",
      },
      {
        key: "reports",
        title: "Reports",
        description: "Move into premium report continuity when you want deeper context.",
        metaLabel: "Premium Report",
        metaTone: "accent",
        href: "/reports",
        fallbackHref: "/reports",
        ctaLabel: "Explore Reports",
        status: "available",
        statusLabel: "Report",
        statusTone: "accent",
        filterKey: "reports",
        icon: "report",
        feature: "tools-hub-reports",
        eventName: "report_cta_click",
      },
    ],
  },
  {
    key: "navagraha-intelligence",
    eyebrow: "NAVAGRAHA Intelligence",
    title: "Future intelligence modules ready for expansion",
    description:
      "These are structured placeholders for future NI modules. They remain visible as future-ready positioning only.",
    cards: [
      {
        key: "navagraha-ai",
        title: "NAVAGRAHA AI",
        description: "Ask chart-aware questions and continue into deeper interpretation.",
        metaLabel: "AI Tool",
        metaTone: "trust",
        href: "/ai",
        fallbackHref: "/ai",
        ctaLabel: "Ask NAVAGRAHA AI",
        status: "available",
        statusLabel: "AI Tool",
        statusTone: "trust",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-navagraha-ai",
        eventName: "premium_ai_cta_click",
      },
      {
        key: "kundli-ni",
        title: "Kundli NI",
        description: "Future chart intelligence layer for deeper guidance.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-kundli-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "dasha-ni",
        title: "Dasha NI",
        description: "Future intelligence for time-cycle interpretation.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-dasha-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "transit-ni",
        title: "Transit NI",
        description: "Future intelligence for movement-aware timing.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-transit-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "panchang-ni",
        title: "Panchang NI",
        description: "Future intelligence for day context and planning.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-panchang-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "remedy-ni",
        title: "Remedy NI",
        description: "Future intelligence for optional support pathways.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-remedy-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "numerology-ni",
        title: "Numerology NI",
        description: "Future intelligence for number-based guidance.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "numerology",
        feature: "tools-hub-numerology-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "career-ni",
        title: "Career NI",
        description: "Future intelligence for work and direction support.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-career-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "finance-ni",
        title: "Finance NI",
        description: "Future intelligence for financial context and planning.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-finance-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "marriage-ni",
        title: "Marriage NI",
        description: "Future intelligence for relationship support.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-marriage-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "business-ni",
        title: "Business NI",
        description: "Future intelligence for ventures and strategic decisions.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-business-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "vastu-ni",
        title: "Vastu NI",
        description: "Future intelligence for space and directional context.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-vastu-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "palmistry-ni",
        title: "Palmistry NI",
        description: "Future intelligence for palm-based reading support.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-palmistry-ni",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "face-reading-ni",
        title: "Face Reading NI",
        description: "Future intelligence for face reading support.",
        metaLabel: "Future Intelligence",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "ai-ni",
        icon: "ai",
        feature: "tools-hub-face-reading-ni",
        eventName: "premium_utility_cta_click",
      },
    ],
  },
  {
    key: "learning-content",
    eyebrow: "Learning + Content",
    title: "Editorial guidance and learning surfaces",
    description:
      "These entry points keep the tools hub connected to the desk, content, and future education surfaces.",
    cards: [
      {
        key: "from-the-desk",
        title: "From the Desk",
        description: "Read manually published Rashifal, Panchang, and remedies content.",
        metaLabel: "Learning",
        metaTone: "trust",
        href: "/from-the-desk",
        fallbackHref: "/from-the-desk",
        ctaLabel: "Read From the Desk",
        status: "available",
        filterKey: "learning",
        icon: "panchang",
        feature: "tools-hub-from-the-desk",
        eventName: "from_the_desk_read",
      },
      {
        key: "astrology-learning",
        title: "Astrology Learning",
        description: "Learn planets, houses, Rashis, Dasha, Panchang, and remedies.",
        metaLabel: "Coming Soon",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "learning",
        icon: "calculators",
        feature: "tools-hub-astrology-learning",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "daily-rashifal",
        title: "Daily Rashifal",
        description: "Read daily sign guidance and practical planning context.",
        href: "/daily-rashifal",
        fallbackHref: "/daily-rashifal",
        ctaLabel: "Read Daily",
        status: "available",
        filterKey: "daily-guidance",
        icon: "rashifal",
        feature: "tools-hub-daily-rashifal",
        eventName: "daily_rashifal_view",
      },
      {
        key: "monthly-rashifal",
        title: "Monthly Rashifal",
        description: "Use broader monthly context for planning and return visits.",
        metaLabel: "Learning",
        metaTone: "trust",
        href: "/monthly-rashifal",
        fallbackHref: "/monthly-rashifal",
        ctaLabel: "Read Monthly",
        status: "available",
        filterKey: "learning",
        icon: "rashifal",
        feature: "tools-hub-monthly-rashifal",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "yearly-rashifal",
        title: "Yearly Rashifal",
        description: "Yearly guidance will live here when the route is added.",
        metaLabel: "Coming Soon",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "coming-soon",
        icon: "rashifal",
        feature: "tools-hub-yearly-rashifal",
        eventName: "premium_utility_cta_click",
      },
      {
        key: "panchang-guidance",
        title: "Panchang Guidance",
        description: "Keep daily timing guidance readable from the content lane.",
        metaLabel: "Daily Guidance",
        metaTone: "trust",
        href: "/panchang",
        fallbackHref: "/panchang",
        ctaLabel: "Open Panchang",
        status: "available",
        filterKey: "daily-guidance",
        icon: "panchang",
        feature: "tools-hub-panchang-guidance",
        eventName: "panchang_view",
      },
      {
        key: "video-guidance",
        title: "NAVAGRAHA Videos & Guidance",
        description: "Video learning will live here once the channel and assets are ready.",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "coming-soon",
        icon: "ai",
        feature: "tools-hub-video-guidance",
        eventName: "premium_utility_cta_click",
      },
    ],
  },
  {
    key: "services-commerce",
    eyebrow: "Services + Commerce",
    title: "Human guidance and optional spiritual support",
    description:
      "Use these pathways for consultation and optional spiritual commerce without turning the page into a sales wall.",
    cards: [
      {
        key: "consultation",
        title: "Consultation with JYOTISH BHASKAR J P SARMAH",
        description: "Book human guidance for important life decisions and chart review.",
        metaLabel: "Premium Service",
        metaTone: "trust",
        href: "/consultation",
        fallbackHref: "/consultation",
        ctaLabel: "Book Consultation",
        status: "available",
        statusLabel: "Consultation",
        statusTone: "accent",
        filterKey: "services",
        icon: "consultation",
        feature: "tools-hub-consultation",
        eventName: "consultation_cta_click",
      },
      {
        key: "gemstones",
        title: "Gemstones, Rudraksha & Vedic Items",
        description: "Explore optional spiritual support products and remedy-aligned items.",
        metaLabel: "Optional",
        metaTone: "trust",
        href: "/shop",
        fallbackHref: "/shop",
        ctaLabel: "Explore Shop",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "shop-remedies",
        icon: "kundli",
        feature: "tools-hub-shop",
        eventName: "shop_cta_click",
      },
      {
        key: "spiritual-guidance",
        title: "Optional Remedy Guidance",
        description: "Use calm support language for mantra, charity, and worship pathways.",
        metaLabel: "Available",
        metaTone: "trust",
        href: "/remedies",
        fallbackHref: "/remedies",
        ctaLabel: "View Remedies",
        status: "available",
        statusLabel: "Open",
        statusTone: "trust",
        filterKey: "shop-remedies",
        icon: "kundli",
        feature: "tools-hub-spiritual-guidance",
        eventName: "gemstone_guidance_click",
      },
      {
        key: "future-videos",
        title: "Video Guidance / YouTube",
        description: "Video and social guidance will be added when real channels and assets are ready.",
        metaLabel: "Coming Soon",
        metaTone: "outline",
        ctaLabel: "Coming Soon",
        status: "coming soon",
        filterKey: "coming-soon",
        icon: "ai",
        feature: "tools-hub-videos",
        eventName: "premium_utility_cta_click",
      },
    ],
  },
] as const;


export const toolsHubRecommendationBlocks: readonly {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  feature: string;
  statusLabel: string;
  statusTone?: BadgeTone;
}[] = [
  {
    key: "new-user-kundli",
    eyebrow: "Start here",
    title: "New user? Start with Free Kundli",
    description:
      "Create the chart foundation first, then continue into Dasha, Transit, Reports, or AI when the chart is ready.",
    primaryHref: "/kundli",
    primaryLabel: "Generate Kundli",
    secondaryHref: "/panchang",
    secondaryLabel: "View Panchang",
    feature: "tools-hub-recommendation-kundli",
    statusLabel: "Available",
    statusTone: "trust",
  },
  {
    key: "post-kundli-path",
    eyebrow: "After Kundli",
    title: "Explore Dasha, Reports and Follow-up Guidance",
    description:
      "Use the public timing tools to continue into Dasha, reports, and consultation when the chart is ready.",
    primaryHref: "/dasha",
    primaryLabel: "Open Dasha",
    secondaryHref: "/reports",
    secondaryLabel: "Open Reports",
    feature: "tools-hub-recommendation-post-kundli",
    statusLabel: "Requires Kundli",
    statusTone: "neutral",
  },
  {
    key: "daily-visitor-path",
    eyebrow: "Daily visitor",
    title: "Check Rashifal, Panchang and Daily Remedy",
    description:
      "Keep the homepage useful for return visits with practical daily guidance and optional support pathways.",
    primaryHref: "/rashifal",
    primaryLabel: "Read Rashifal",
    secondaryHref: "/remedies",
    secondaryLabel: "Open Remedies",
    feature: "tools-hub-recommendation-daily",
    statusLabel: "Available",
    statusTone: "trust",
  },
  {
    key: "human-guidance-path",
    eyebrow: "Human guidance",
    title: "Need human guidance? Consult J P Sarmah",
    description:
      "Use a human review path for important decisions, supported by chart context and NAVAGRAHA Intelligence.",
    primaryHref: "/consultation",
    primaryLabel: "Book Consultation",
    secondaryHref: "/from-the-desk",
    secondaryLabel: "Read From the Desk",
    feature: "tools-hub-recommendation-consultation",
    statusLabel: "Premium Service",
    statusTone: "accent",
  },
  {
    key: "future-intelligence-path",
    eyebrow: "Future intelligence",
    title: "Explore future NAVAGRAHA Intelligence tools",
    description:
      "Follow the expanding AI-assisted roadmap for Kundli NI, Dasha NI, Transit NI, Panchang NI, Remedy NI, Numerology NI and more.",
    primaryHref: "/ai",
    primaryLabel: "Ask NAVAGRAHA AI",
    secondaryHref: "/tools",
    secondaryLabel: "Browse Tools",
    feature: "tools-hub-recommendation-future-ni",
    statusLabel: "Future Intelligence",
    statusTone: "outline",
  },
] as const;

export function getToolsHubRecommendationBlocks() {
  return toolsHubRecommendationBlocks;
}
export function getToolsHubCollections() {
  return toolsHubCollections;
}

export function getToolsHubFilterTabs() {
  return toolsHubFilterTabs;
}

export function getToolsHubHeroBadges() {
  return toolsHubHeroBadges;
}
