import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  ConsultationIcon,
  NavagrahaAiIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { UtilityIcon } from "@/components/graphics/utility-icons";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getAstrologyUtilityHubSections,
  getAstrologyUtilityRelatedBlocks,
  getUtilityStatusLabel,
  getUtilityStatusTone,
  type UtilityHubTool,
} from "@/modules/astrology/utilities";

export const metadata = buildPageMetadata({
  title: "Astrology Tools & Utilities Hub",
  description:
    "Explore NAVAGRAHA CENTRE tools for Kundli, Divisional Charts, Dasha, Transit, Matchmaking, Dosha, Yoga, Panchang, Muhurat, Numerology, Remedies, Reports, NAVAGRAHA AI, and Consultation.",
  path: "/tools",
  keywords: [
    "astrology tools",
    "vedic astrology utilities",
    "kundli tools",
    "dasha tools",
    "transit tools",
    "matchmaking tools",
    "panchang tools",
    "numerology tools",
    "remedy tools",
    "navagraha ai tools",
  ],
});
export const revalidate = 3600;
const toolGroups = getAstrologyUtilityHubSections();
const premiumPathways = getAstrologyUtilityRelatedBlocks();

function getToolIcon(icon: UtilityHubTool["icon"]) {
  switch (icon) {
    case "kundli":
    case "compatibility":
    case "rashifal":
    case "panchang":
    case "numerology":
    case "calculators":
    case "muhurta":
      return <UtilityIcon name={icon} />;
    case "ai":
      return <NavagrahaAiIcon className="h-12 w-12" />;
    case "report":
      return <ReportIcon className="h-12 w-12" />;
    case "consultation":
      return <ConsultationIcon className="h-12 w-12" />;
    default:
      return <UtilityIcon name="kundli" />;
  }
}

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
          "Kundli, Dasha, Transit, Matchmaking, Panchang, Muhurat, Numerology, Remedies, and Reports in one route.",
          "Clear internal pathways from free utilities to deeper guidance without clutter.",
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
          category={group.eyebrow === "Premium + Human Guidance" ? "ai" : "utilities"}
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
                  <Badge tone={getUtilityStatusTone(card.status)}>
                    {getUtilityStatusLabel(card.status)}
                  </Badge>
                </div>
                <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {card.title}
                </h3>
                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  {card.description}
                </p>
                <TrackedLink
                  href={card.href || card.fallbackHref}
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
        eyebrow="Related Paths"
        title="Contextual next steps from utility to deeper guidance."
        description="These pathways keep free utility value intact while offering clear next-step continuity."
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
