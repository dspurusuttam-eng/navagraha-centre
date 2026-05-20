import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NavagrahaAiIcon } from "@/components/icons/astrology-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import {
  getToolsHubCollections,
  getToolsHubHeroBadges,
} from "@/modules/astrology/utilities/tools-hub";
import { ToolsHubCatalog } from "@/components/tools/tools-hub-catalog";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "NAVAGRAHA Astrology Tools | Kundli, Reports & AI",
    description:
      "Explore Kundli, Panchang, Rashifal, Dasha, Transit, Matchmaking, Dosha + Yoga, Numerology, Muhurat / Calendar, Remedies, Reports, NAVAGRAHA Intelligence, Consultation, and future premium astrology utilities in one place.",
    path: "/tools",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology tools",
      "vedic astrology utilities",
      "kundli tools",
      "dasha tools",
      "transit tools",
      "matchmaking tools",
      "dosha yoga tools",
      "panchang tools",
      "numerology tools",
      "muhurat calendar tools",
      "remedy tools",
      "navagraha ai",
      "consultation",
      "navagraha intelligence",
      "astrology command center",
    ],
  });
}

export const revalidate = 3600;

function localizeCollections(
  locale: string,
  hasExplicitLocalePrefix: boolean,
) {
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });

  return getToolsHubCollections().map((collection) => ({
    ...collection,
    cards: collection.cards.map((card) => ({
      ...card,
      href: card.href ? localizeHref(card.href) : undefined,
      fallbackHref: card.fallbackHref ? localizeHref(card.fallbackHref) : undefined,
    })),
  }));
}

export default async function ToolsHubPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const collections = localizeCollections(locale, hasExplicitLocalePrefix);
  const heroBadges = getToolsHubHeroBadges();
  const allCards = collections.flatMap((collection) => collection.cards);
  const availableCount = allCards.filter((card) => card.status === "available").length;
  const requiresKundliCount = allCards.filter(
    (card) => card.status === "requires Kundli",
  ).length;
  const comingSoonCount = allCards.filter((card) => card.status === "coming soon").length;
  const liveCollectionsCount = collections.length;

  return (
    <>
      <PageViewTracker page="/tools" feature="tools-hub-page" />
      <AnalyticsEventTracker
        event="tools_hub_view"
        payload={{ page: "/tools", feature: "tools-hub-page" }}
      />

      <section className="border-b border-black/8 bg-white">
        <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-center lg:py-20">
          <div className="space-y-7">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              NAVAGRAHA Utility Hub
            </Badge>

            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                NAVAGRAHA Astrology Tools
              </h1>
              <p className="max-w-3xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Explore Kundli, Rashifal, Panchang, Dasha, Transit, Matchmaking,
                Numerology, Remedies, Reports, NAVAGRAHA Intelligence and future
                premium astrology utilities in one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedLink
                href={localizeHref("/kundli")}
                eventName="premium_utility_cta_click"
                eventPayload={{ page: "/tools", feature: "tools-hub-hero-kundli" }}
                className={buttonStyles({
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Kundli
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="premium_ai_cta_click"
                eventPayload={{ page: "/tools", feature: "tools-hub-hero-ai" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Ask NI
              </TrackedLink>
            </div>

            <div className="flex flex-wrap gap-2">
              {heroBadges.map((badge) => (
                <Badge
                  key={badge}
                  tone="trust"
                  className="border border-black/8 bg-white px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden border-black/8 bg-white shadow-[0_18px_44px_rgba(17,24,39,0.06)] before:opacity-0">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(184,137,67,0.08),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(17,24,39,0.03),transparent_26%),radial-gradient(circle_at_72%_82%,rgba(184,137,67,0.05),transparent_32%)]" />
            <div className="relative flex h-full flex-col gap-5 p-5 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <NavagrahaAiIcon className="h-12 w-12" />
                  <div>
                    <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
                      Command Center Snapshot
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-ink-strong)]">
                      Bright white, route-safe, and scalable.
                    </p>
                  </div>
                </div>
                <Badge tone="trust">Premium</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Live now",
                    value: availableCount,
                    note: "available tools",
                  },
                  {
                    label: "Guided paths",
                    value: requiresKundliCount,
                    note: "require Kundli",
                  },
                  {
                    label: "Future intelligence",
                    value: comingSoonCount,
                    note: "NI placeholders",
                  },
                  {
                    label: "Collections",
                    value: liveCollectionsCount,
                    note: "navigation groups",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[var(--radius-xl)] border border-black/8 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                  >
                    <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-ink-strong)]">
                      {item.value}
                    </p>
                    <p className="text-[length:var(--font-size-body-xs)] text-[color:var(--color-ink-body)]">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
                <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
                  Category rails
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Core Vedic Tools",
                    "Advanced Astrology Tools",
                    "NAVAGRAHA Intelligence",
                    "Learning + Content",
                    "Services + Commerce",
                  ].map((rail) => (
                    <span
                      key={rail}
                      className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2 text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--color-ink-strong)]"
                    >
                      {rail}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TrackedLink
                  href={localizeHref("/reports")}
                  eventName="report_cta_click"
                  eventPayload={{ page: "/tools", feature: "tools-hub-hero-reports" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  View Reports
                </TrackedLink>
                <TrackedLink
                  href={localizeHref("/consultation")}
                  eventName="consultation_cta_click"
                  eventPayload={{ page: "/tools", feature: "tools-hub-hero-consultation" }}
                  className={buttonStyles({
                    size: "sm",
                    className: "w-full justify-center",
                  })}
                >
                  Book Consultation
                </TrackedLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14 lg:py-16">
          <ToolsHubCatalog collections={collections} />
        </Container>
      </section>

      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14">
          <Card className="border-black/8 bg-white shadow-[0_16px_38px_rgba(17,24,39,0.06)] before:opacity-0">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="space-y-3">
                <Badge tone="trust">NAVAGRAHA Intelligence</Badge>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
                  style={{
                    letterSpacing: "var(--tracking-display)",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Future intelligence modules, ready for expansion
                </h2>
                <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Kundli NI, Dasha NI, Transit NI, Panchang NI, Remedy NI,
                  Numerology NI, Career NI, Finance NI, Marriage NI, Business
                  NI, Vastu NI, Palmistry NI, and Face Reading NI are exposed as
                  future-ready placeholders only.
                </p>
              </div>

              <TrackedLink
                href={localizeHref("/ai")}
                eventName="premium_ai_cta_click"
                eventPayload={{ page: "/tools", feature: "tools-hub-future-ai-link" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center lg:w-auto",
                })}
              >
                Ask NI
              </TrackedLink>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
