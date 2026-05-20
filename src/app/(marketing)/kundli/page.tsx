import { TrackedLink } from "@/components/analytics/tracked-link";
import { KundliPageHeroVisual } from "@/components/graphics/kundli-page-visual";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import {
  kundliHeroBadges,
  kundliNextStepCards,
  kundliPreviewItems,
  kundliTrustNote,
} from "@/modules/kundli/kundli-foundation";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

type KundliHeroPreviewItem = (typeof kundliPreviewItems)[number];

function localizeHref(locale: string, hasExplicitLocalePrefix: boolean, href: string) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function KundliPreviewCard({ item }: Readonly<{ item: KundliHeroPreviewItem }>) {
  return (
    <Card
      tone="default"
      className="space-y-3 border-black/8 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-gold)]" />
        <p className="text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
          {item.title}
        </p>
      </div>
      <p className="text-[0.82rem] leading-6 text-[color:var(--color-ink-body)]">{item.description}</p>
    </Card>
  );
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("kundli", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/kundli",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "free kundli",
      "AI birth chart analysis",
      "lagna chart",
      "vedic kundli",
      "rashi and navamsa guidance",
    ],
  });
}

export const revalidate = 3600;

export default async function KundliPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localize = (href: string) => localizeHref(locale, hasExplicitLocalePrefix, href);

  return (
    <>
      <PageViewTracker page="/kundli" feature="kundli-page" />

      <main className="launch-page launch-page-kundli min-h-screen bg-[#FFFFFF] pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-[#111111] md:pb-0">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(300px,0.94fr)] lg:items-center lg:py-14">
            <div className="space-y-6 sm:space-y-7">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  NAVAGRAHA CENTRE
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  Free Kundli
                </Badge>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h1
                  className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-sm)] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                  style={{
                    letterSpacing: "0.01em",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Free Kundli &amp; Birth Chart
                </h1>
                <p className="max-w-[46rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Generate your Vedic birth chart with 12-planet positions, Lagna, Nakshatra, Dasha
                  readiness, Transit context and NAVAGRAHA AI guidance support.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                <TrackedLink
                  href={localize("/sign-up")}
                  eventName="cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-hero-primary" }}
                  className={buttonStyles({
                    tone: "accent",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
                <TrackedLink
                  href={localize("/reports")}
                  eventName="report_cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-hero-secondary" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Explore Kundli Reports
                </TrackedLink>
              </div>

              <div className="flex flex-wrap gap-2">
                {kundliHeroBadges.map((badge) => (
                  <Badge
                    key={badge}
                    tone="trust"
                    className="border border-black/8 bg-white px-2.5 py-1 text-[0.56rem] uppercase tracking-[0.06em] text-[color:var(--color-ink-strong)] sm:px-3 sm:py-1.5 sm:text-[0.64rem] sm:tracking-[0.1em]"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            <KundliPageHeroVisual />
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="space-y-5 py-9 sm:py-10">
            <div className="space-y-2">
              <Badge tone="trust" className="border border-black/8 bg-white">
                Kundli Intelligence Preview
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                What the Kundli foundation prepares for you
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                This preview stays chart-aware without fabricating planetary positions or output data.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {kundliPreviewItems.map((item) => (
                <KundliPreviewCard key={item.title} item={item} />
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-9 sm:py-10">
            <Card
              tone="default"
              className="space-y-3 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <Badge tone="trust" className="border border-black/8 bg-white w-fit">
                Privacy Note
              </Badge>
              <p className="max-w-4xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                {kundliTrustNote}
              </p>
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="space-y-5 py-9 sm:py-10">
            <div className="space-y-2">
              <Badge tone="trust" className="border border-black/8 bg-white">
                After Your Kundli
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                Next steps after the chart is ready
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Use the saved Kundli foundation to continue into timing, reports, AI, and human guidance.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {kundliNextStepCards.map((card) => {
                const content = (
                  <Card
                    tone="default"
                    className="flex h-full flex-col gap-3 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <Badge tone="trust" className="border border-black/8 bg-white">
                          After Kundli
                        </Badge>
                        <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-body-lg)] text-[color:var(--color-ink-strong)]">
                          {card.title}
                        </h3>
                      </div>
                      <Badge tone={card.statusTone ?? "neutral"}>{card.statusLabel}</Badge>
                    </div>

                    <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      {card.description}
                    </p>

                    <span className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.18)] bg-white px-[1.125rem] text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
                      {card.ctaLabel}
                    </span>
                  </Card>
                );

                return card.href ? (
                  <TrackedLink
                    key={card.title}
                    href={localize(card.href)}
                    eventName={card.eventName}
                    eventPayload={{ page: "/kundli", feature: card.feature }}
                    className="block h-full"
                  >
                    {content}
                  </TrackedLink>
                ) : (
                  <div key={card.title} className="h-full">
                    {content}
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
