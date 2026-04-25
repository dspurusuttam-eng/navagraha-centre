import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  CalculatorIcon,
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
  NumerologyIcon,
  PanchangIcon,
  RashifalIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import type { TrackedEventName } from "@/lib/analytics/types";

export const metadata = buildPageMetadata({
  title: "Astrology Tools & Utilities Hub",
  description:
    "Explore NAVAGRAHA CENTRE tools for Kundli, Panchang, Muhurta-lite, Numerology, Compatibility, calculators, NAVAGRAHA AI, and premium reports.",
  path: "/tools",
  keywords: [
    "astrology tools",
    "vedic astrology utilities",
    "kundli calculators",
    "panchang tools",
    "numerology tools",
    "navagraha ai tools",
  ],
});
export const revalidate = 3600;

type ToolCard = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  eventName: TrackedEventName;
  feature: string;
  icon:
    | "kundli"
    | "panchang"
    | "rashifal"
    | "numerology"
    | "calculator"
    | "ai"
    | "report"
    | "consultation";
};

type ToolGroup = {
  eyebrow: string;
  title: string;
  description: string;
  cards: readonly ToolCard[];
};

const toolGroups: readonly ToolGroup[] = [
  {
    eyebrow: "Birth Chart Tools",
    title: "Start with core chart fundamentals",
    description:
      "Generate your Kundli or use fast chart calculators before moving into deeper interpretation layers.",
    cards: [
      {
        title: "Kundli Generator",
        description: "Create your full sidereal chart foundation and house map.",
        href: "/kundli",
        ctaLabel: "Generate Kundli",
        eventName: "utility_card_click",
        feature: "tools-hub-kundli",
        icon: "kundli",
      },
      {
        title: "Moon Sign Calculator",
        description: "Resolve your Moon sign quickly from date, time, and place.",
        href: "/calculators",
        ctaLabel: "Open Calculator",
        eventName: "calculator_tool_click",
        feature: "tools-hub-moon-sign",
        icon: "calculator",
      },
      {
        title: "Nakshatra Calculator",
        description: "Check Moon nakshatra and pada for practical chart context.",
        href: "/calculators",
        ctaLabel: "Open Calculator",
        eventName: "calculator_tool_click",
        feature: "tools-hub-nakshatra",
        icon: "calculator",
      },
      {
        title: "Lagna Calculator",
        description: "Calculate ascendant sign and degree with full birth inputs.",
        href: "/calculators",
        ctaLabel: "Open Calculator",
        eventName: "calculator_tool_click",
        feature: "tools-hub-lagna",
        icon: "calculator",
      },
    ],
  },
  {
    eyebrow: "Daily Astrology Tools",
    title: "Check daily timing and guidance",
    description:
      "Use Panchang, Rashifal, and Muhurta-lite to stay aligned with day-level astrological timing.",
    cards: [
      {
        title: "Panchang",
        description:
          "View Tithi, Vara, Nakshatra, Yoga, Karana, transitions, and guidance.",
        href: "/panchang",
        ctaLabel: "Open Panchang",
        eventName: "panchang_tool_click",
        feature: "tools-hub-panchang",
        icon: "panchang",
      },
      {
        title: "Daily Rashifal",
        description:
          "Get sign-specific daily guidance with clear and structured output.",
        href: "/rashifal",
        ctaLabel: "Open Rashifal",
        eventName: "utility_card_click",
        feature: "tools-hub-rashifal",
        icon: "rashifal",
      },
      {
        title: "Muhurta-lite / Time Tools",
        description: "Check Rahu Kaal, Gulika, Yamaganda, and Abhijit Muhurta.",
        href: "/muhurta",
        ctaLabel: "Open Time Tools",
        eventName: "muhurta_tool_click",
        feature: "tools-hub-muhurta",
        icon: "panchang",
      },
      {
        title: "Auspicious Date Check",
        description:
          "Run a quick date suitability signal powered by Panchang context.",
        href: "/calculators",
        ctaLabel: "Check Date",
        eventName: "calculator_tool_click",
        feature: "tools-hub-date-check",
        icon: "calculator",
      },
    ],
  },
  {
    eyebrow: "Relationship Tools",
    title: "Move from quick compatibility to depth",
    description:
      "Start with a quick signal and continue into full compatibility and report layers when needed.",
    cards: [
      {
        title: "Compatibility",
        description: "Run a full compatibility flow with chart-aware interpretation.",
        href: "/compatibility",
        ctaLabel: "Check Compatibility",
        eventName: "utility_card_click",
        feature: "tools-hub-compatibility",
        icon: "consultation",
      },
      {
        title: "Compatibility Quick Score",
        description:
          "Use a fast two-DOB utility before opening the full compatibility journey.",
        href: "/calculators",
        ctaLabel: "Open Quick Score",
        eventName: "calculator_tool_click",
        feature: "tools-hub-compatibility-quick",
        icon: "calculator",
      },
    ],
  },
  {
    eyebrow: "Numerology Tools",
    title: "Add number-based guidance layers",
    description:
      "Use numerology outputs as a complementary lens alongside chart and timing tools.",
    cards: [
      {
        title: "Numerology AI / Calculator",
        description:
          "Discover core numbers, tendencies, strengths, and growth notes in one premium utility.",
        href: "/numerology",
        ctaLabel: "Explore Numerology",
        eventName: "numerology_tool_click",
        feature: "tools-hub-numerology",
        icon: "numerology",
      },
      {
        title: "Birth + Destiny Quick Calculator",
        description:
          "Run a fast DOB-based number check for quick personal pattern awareness.",
        href: "/calculators",
        ctaLabel: "Run Quick Check",
        eventName: "calculator_tool_click",
        feature: "tools-hub-birth-destiny",
        icon: "calculator",
      },
    ],
  },
  {
    eyebrow: "Premium + AI Tools",
    title: "Go deeper with chart-aware intelligence",
    description:
      "Continue from free utility outcomes into AI, premium reports, and consultation pathways.",
    cards: [
      {
        title: "Ask My Chart",
        description:
          "Ask focused chart questions with structured assistant grounding.",
        href: "/kundli-ai",
        ctaLabel: "Ask My Chart",
        eventName: "utility_card_click",
        feature: "tools-hub-ask-my-chart",
        icon: "ai",
      },
      {
        title: "NAVAGRAHA AI",
        description:
          "Use the flagship AI family for chart-aware personal guidance.",
        href: "/ai",
        ctaLabel: "Try NAVAGRAHA AI",
        eventName: "utility_card_click",
        feature: "tools-hub-ai",
        icon: "ai",
      },
      {
        title: "Premium Reports",
        description:
          "Unlock deeper report layers after your utility and chart checks.",
        href: "/reports",
        ctaLabel: "Get Free Report",
        eventName: "utility_card_click",
        feature: "tools-hub-reports",
        icon: "report",
      },
    ],
  },
] as const;

function getToolIcon(icon: ToolCard["icon"]) {
  switch (icon) {
    case "kundli":
      return <KundliIcon />;
    case "panchang":
      return <PanchangIcon />;
    case "rashifal":
      return <RashifalIcon />;
    case "numerology":
      return <NumerologyIcon />;
    case "calculator":
      return <CalculatorIcon />;
    case "ai":
      return <NavagrahaAiIcon />;
    case "report":
      return <ReportIcon />;
    case "consultation":
      return <ConsultationIcon />;
    default:
      return <KundliIcon />;
  }
}

const premiumPathways = [
  {
    title: "Panchang to personalized guidance",
    description:
      "Use daily timing first, then continue into personal chart intelligence when decisions matter.",
    primaryHref: "/panchang",
    primaryLabel: "Open Panchang",
    secondaryHref: "/consultation",
    secondaryLabel: "Book Consultation",
    feature: "tools-premium-panchang",
  },
  {
    title: "Numerology to deeper AI reading",
    description:
      "Start with core number outputs, then continue into AI for broader interpretation.",
    primaryHref: "/numerology",
    primaryLabel: "Open Numerology",
    secondaryHref: "/ai",
    secondaryLabel: "Try NAVAGRAHA AI",
    feature: "tools-premium-numerology",
  },
  {
    title: "Calculators to full Kundli context",
    description:
      "Convert quick utility checks into full chart generation and sustained guidance.",
    primaryHref: "/calculators",
    primaryLabel: "Open Calculators",
    secondaryHref: "/kundli",
    secondaryLabel: "Generate Kundli",
    feature: "tools-premium-calculators",
  },
  {
    title: "Muhurta-lite for important dates",
    description:
      "Use daily timing windows, then book consultation for high-stakes date selection.",
    primaryHref: "/muhurta",
    primaryLabel: "Open Time Tools",
    secondaryHref: "/consultation",
    secondaryLabel: "Book Consultation",
    feature: "tools-premium-muhurta",
  },
  {
    title: "Compatibility quick to full report",
    description:
      "Begin with quick compatibility and move into complete report depth when required.",
    primaryHref: "/calculators",
    primaryLabel: "Open Quick Score",
    secondaryHref: "/reports",
    secondaryLabel: "Get Free Report",
    feature: "tools-premium-compatibility",
  },
] as const;

export default function ToolsHubPage() {
  return (
    <>
      <PageViewTracker page="/tools" feature="tools-hub-page" />
      <AnalyticsEventTracker
        event="tools_hub_view"
        payload={{ page: "/tools", feature: "tools-hub-page" }}
      />

      <PageHero
        eyebrow="NAVAGRAHA Utility Hub"
        title="All astrology utilities, calculators, and intelligence paths in one clean hub."
        description="Discover tools by purpose, run quick checks, and continue into chart-aware AI, reports, and consultation through one premium utility structure."
        highlights={[
          "Birth chart tools, daily timing tools, relationship tools, and numerology in one route.",
          "Clear internal pathways from free utilities to deeper premium guidance.",
          "Consistent card hierarchy, analytics-safe interactions, and mobile-ready discovery.",
        ]}
        note="Utilities stay free and useful on their own, while deeper premium pathways remain contextual and non-intrusive."
        primaryAction={{
          href: "/kundli",
          label: "Generate Your Kundli",
          eventName: "premium_utility_cta_click",
          eventPayload: { page: "/tools", feature: "tools-hub-primary-kundli" },
        }}
        secondaryAction={{
          href: "/ai",
          label: "Try NAVAGRAHA AI",
          eventName: "premium_utility_cta_click",
          eventPayload: { page: "/tools", feature: "tools-hub-secondary-ai" },
        }}
        supportTitle="Utility Ecosystem Snapshot"
      />

      {toolGroups.map((group) => (
        <Section
          key={group.title}
          tone="light"
          eyebrow={group.eyebrow}
          title={group.title}
          description={group.description}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {group.cards.map((card) => (
              <Card
                key={`${group.title}-${card.title}`}
                tone="light"
                interactive
                className="flex h-full flex-col gap-4 border-[rgba(184,137,67,0.26)]"
              >
                <div className="flex items-center justify-between gap-3">
                  {getToolIcon(card.icon)}
                  <Badge tone="neutral">Tool</Badge>
                </div>
                <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {card.title}
                </h3>
                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  {card.description}
                </p>
                <TrackedLink
                  href={card.href}
                  eventName={card.eventName}
                  eventPayload={{ page: "/tools", feature: card.feature, tool: card.title }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "tertiary",
                    className: "w-full justify-center",
                  })}
                >
                  {card.ctaLabel}
                </TrackedLink>
              </Card>
            ))}
          </div>
        </Section>
      ))}

      <Section
        tone="muted"
        eyebrow="Premium Pathways"
        title="Contextual next steps from utility to deeper guidance."
        description="These pathways keep free utility value intact while offering clear premium continuity."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {premiumPathways.map((pathway) => (
            <Card
              key={pathway.title}
              tone="light"
              className="flex h-full flex-col gap-4 border-[rgba(184,137,67,0.24)]"
            >
              <Badge tone="trust">Utility to Premium</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {pathway.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {pathway.description}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <TrackedLink
                  href={pathway.primaryHref}
                  eventName="utility_card_click"
                  eventPayload={{ page: "/tools", feature: `${pathway.feature}-primary` }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "tertiary",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  {pathway.primaryLabel}
                </TrackedLink>
                <TrackedLink
                  href={pathway.secondaryHref}
                  eventName="premium_utility_cta_click"
                  eventPayload={{ page: "/tools", feature: `${pathway.feature}-secondary` }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  {pathway.secondaryLabel}
                </TrackedLink>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
