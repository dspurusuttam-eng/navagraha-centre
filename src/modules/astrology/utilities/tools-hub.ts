import type { UtilityIconName } from "@/components/graphics/utility-icons";
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
    label: "AI / NI",
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
    label: "Shop / Remedies",
    description: "Optional spiritual support, items, and remedy pathways.",
  },
  {
    key: "services",
    label: "Services",
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
        fallbackHref: "/dashboard/onboarding",
        ctaLabel: "Generate Kundli",
        status: "available",
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
        filterKey: "daily-guidance",
        icon: "rashifal",
        feature: "tools-hub-rashifal",
        eventName: "rashifal_view",
      },
      {
        key: "dasha",
        title: "Dasha",
        description: "Check Mahadasha, Antardasha, and time-cycle context.",
        href: "/dashboard",
        fallbackHref: "/dashboard/onboarding",
        ctaLabel: "View Dasha",
        status: "requires Kundli",
        filterKey: "daily-guidance",
        icon: "kundli",
        feature: "tools-hub-dasha",
        eventName: "utility_card_click",
      },
      {
        key: "transit",
        title: "Transit / Gochar",
        description: "Review the current planetary movement layer against the active chart.",
        href: "/dashboard",
        fallbackHref: "/dashboard/onboarding",
        ctaLabel: "Check Transit",
        status: "requires Kundli",
        filterKey: "daily-guidance",
        icon: "kundli",
        feature: "tools-hub-transit",
        eventName: "utility_card_click",
      },
      {
        key: "matchmaking",
        title: "Matchmaking",
        description: "Review compatibility and relationship signals in a structured flow.",
        href: "/compatibility",
        fallbackHref: "/dashboard/onboarding",
        ctaLabel: "Check Match",
        status: "requires Kundli",
        filterKey: "kundli",
        icon: "compatibility",
        feature: "tools-hub-matchmaking",
        eventName: "utility_card_click",
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
        description: "Review D1, D9, D10, and higher-level chart context.",
        href: "/dashboard/chart",
        fallbackHref: "/dashboard/onboarding",
        ctaLabel: "Open Chart",
        status: "requires Kundli",
        filterKey: "kundli",
        icon: "kundli",
        feature: "tools-hub-divisional-charts",
        eventName: "utility_card_click",
      },
      {
        key: "dosha-detection",
        title: "Dosha Detection",
        description: "Check calm dosha context with optional support mapping nearby.",
        href: "/reports",
        fallbackHref: "/dashboard/chart",
        ctaLabel: "View Dosha",
        status: "requires Kundli",
        filterKey: "reports",
        icon: "kundli",
        feature: "tools-hub-dosha",
        eventName: "report_cta_click",
      },
      {
        key: "yoga-detection",
        title: "Yoga Detection",
        description: "Review structural and supportive yoga patterns in the chart.",
        href: "/reports",
        fallbackHref: "/dashboard/chart",
        ctaLabel: "View Yoga",
        status: "requires Kundli",
        filterKey: "reports",
        icon: "kundli",
        feature: "tools-hub-yoga",
        eventName: "report_cta_click",
      },
      {
        key: "muhurat",
        title: "Muhurat",
        description: "Use practical timing windows for planning and decision support.",
        href: "/muhurta",
        fallbackHref: "/panchang",
        ctaLabel: "Open Muhurat",
        status: "available",
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
        fallbackHref: "/insights/remedies",
        ctaLabel: "Open Remedies",
        status: "available",
        filterKey: "shop-remedies",
        icon: "kundli",
        feature: "tools-hub-remedies",
        eventName: "utility_card_click",
      },
      {
        key: "reports",
        title: "Reports",
        description: "Move into premium report continuity when you want deeper context.",
        href: "/reports",
        fallbackHref: "/dashboard/reports",
        ctaLabel: "Explore Reports",
        status: "requires Kundli",
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
        key: "kundli-ni",
        title: "Kundli NI",
        description: "Future chart intelligence layer for deeper guidance.",
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
        href: "/consultation",
        fallbackHref: "/consultation",
        ctaLabel: "Book Consultation",
        status: "available",
        filterKey: "services",
        icon: "consultation",
        feature: "tools-hub-consultation",
        eventName: "consultation_cta_click",
      },
      {
        key: "gemstones",
        title: "Gemstones, Rudraksha & Vedic Items",
        description: "Explore optional spiritual support products and remedy-aligned items.",
        href: "/shop",
        fallbackHref: "/shop",
        ctaLabel: "Explore Shop",
        status: "available",
        filterKey: "shop-remedies",
        icon: "kundli",
        feature: "tools-hub-shop",
        eventName: "shop_cta_click",
      },
      {
        key: "spiritual-guidance",
        title: "Optional Remedy Guidance",
        description: "Use calm support language for mantra, charity, and worship pathways.",
        href: "/remedies",
        fallbackHref: "/remedies",
        ctaLabel: "View Remedies",
        status: "available",
        filterKey: "shop-remedies",
        icon: "kundli",
        feature: "tools-hub-spiritual-guidance",
        eventName: "gemstone_guidance_click",
      },
      {
        key: "future-videos",
        title: "Video Guidance / YouTube",
        description: "Video and social guidance will be added when real channels and assets are ready.",
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

export function getToolsHubCollections() {
  return toolsHubCollections;
}

export function getToolsHubFilterTabs() {
  return toolsHubFilterTabs;
}

export function getToolsHubHeroBadges() {
  return toolsHubHeroBadges;
}
