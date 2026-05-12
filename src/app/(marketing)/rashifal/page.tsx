import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AdSlot } from "@/components/monetization/AdSlot";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import { rashifalSigns } from "@/modules/rashifal/content";
import { RetentionPreferenceBridge } from "@/modules/retention/components/retention-preference-bridge";

const rashifalTabs = [
  {
    title: "Daily Rashifal",
    active: true,
    statusLabel: "Active",
    description: "Daily sign guidance published from the astrologer's desk.",
  },
  {
    title: "Monthly Rashifal",
    href: "/monthly-rashifal",
    statusLabel: "Published",
    description: "Monthly overview when you want a broader planning lens.",
  },
  {
    title: "Yearly Rashifal",
    statusLabel: "Coming Soon",
    description: "Future-ready annual guidance from the same desk workflow.",
  },
] as const;

const rashifalGuidanceCards = [
  {
    title: "Panchang Today",
    href: "/panchang",
    ctaLabel: "Open Panchang",
    description: "Check timing context before making daily decisions.",
    feature: "rashifal-guidance-panchang",
  },
  {
    title: "Daily Remedy",
    href: "/tools",
    ctaLabel: "View Remedies",
    description: "Move from daily reading into cautious remedy discovery.",
    feature: "rashifal-guidance-remedy",
  },
  {
    title: "Ask NAVAGRAHA AI",
    href: "/tools",
    ctaLabel: "Ask AI",
    description: "Use chart-aware support after you read the public forecast.",
    feature: "rashifal-guidance-ai",
  },
  {
    title: "Generate Kundli",
    href: "/kundli",
    ctaLabel: "Open Kundli",
    description: "Create a saved chart when you want personal guidance.",
    feature: "rashifal-guidance-kundli",
  },
] as const;

function localizeHref(locale: string, hasExplicitLocalePrefix: boolean, href: string) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function RashifalSignCard({
  locale,
  hasExplicitLocalePrefix,
  slug,
  name,
  icon,
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
  slug: string;
  name: string;
  icon: string;
}>) {
  const href = localizeHref(locale, hasExplicitLocalePrefix, `/rashifal/${slug}`);

  return (
    <TrackedLink
      href={href}
      eventName="rashifal_view"
      eventPayload={{ page: "/rashifal", feature: `rashifal-sign-${slug}` }}
      className="block h-full"
    >
      <Card
        tone="default"
        interactive
        className="flex h-full flex-col gap-4 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-black/12"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.12)]">
            {icon}
          </span>
          <Badge tone="trust">Daily</Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-[1rem] font-semibold text-[color:var(--color-ink-strong)]">
            {name}
          </h3>
          <p className="text-[0.8rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
            View Rashifal
          </p>
        </div>

        <span className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center" })}>
          View Rashifal
        </span>
      </Card>
    </TrackedLink>
  );
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("rashifal", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/rashifal",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "daily rashifal",
      "today horoscope",
      "zodiac signs",
      "monthly rashifal",
      "yearly rashifal",
    ],
  });
}

export const revalidate = 3600;

export default async function RashifalPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return (
    <>
      <PageViewTracker page="/rashifal" feature="rashifal-page" />
      <AnalyticsEventTracker
        event="rashifal_page_view"
        payload={{ page: "/rashifal", feature: "rashifal-main" }}
      />
      <AnalyticsEventTracker
        event="rashifal_view"
        payload={{ page: "/rashifal", feature: "rashifal-main-view" }}
      />
      <RetentionPreferenceBridge section="rashifal" />

      <main className="min-h-screen bg-[#FFFFFF] pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-center lg:py-14">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Daily Guidance
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  From the Desk
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
                  Daily Rashifal
                </h1>
                <p className="max-w-[46rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Read daily, monthly and yearly zodiac guidance published from the astrologer&apos;s desk with Panchang, transit and Vedic astrology context.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                <TrackedLink
                  href={localizeHref(locale, hasExplicitLocalePrefix, "/daily-rashifal")}
                  eventName="daily_rashifal_view"
                  eventPayload={{ page: "/rashifal", feature: "rashifal-hero-daily" }}
                  className={buttonStyles({
                    tone: "accent",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Read Today&apos;s Rashifal
                </TrackedLink>
                <TrackedLink
                  href={localizeHref(locale, hasExplicitLocalePrefix, "/panchang")}
                  eventName="cta_click"
                  eventPayload={{ page: "/rashifal", feature: "rashifal-hero-panchang" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Explore Panchang
                </TrackedLink>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Daily Guidance",
                  "Panchang Context",
                  "Vedic Astrology",
                  "From the Desk",
                  "Assamese / English / Hindi Ready",
                ].map((badge) => (
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

            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Manual Publishing
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  Premium White
                </Badge>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Daily Rashifal",
                  "Monthly Rashifal",
                  "Yearly Rashifal",
                  "Panchang context",
                  "Transit context",
                  "Human astrologer desk",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.1rem] border border-black/8 bg-white px-3 py-2.5 text-[0.74rem] text-[color:var(--color-ink-body)] shadow-[0_10px_24px_rgba(17,24,39,0.04)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-5 sm:py-7">
            <div className="grid gap-3 md:grid-cols-3">
              {rashifalTabs.map((tab) => {
                if ("active" in tab && tab.active) {
                  return (
                    <div
                      key={tab.title}
                      className="rounded-[1.1rem] border border-[rgba(184,137,67,0.24)] bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,236,216,0.92)_100%)] p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-strong)]">
                          {tab.title}
                        </h2>
                        <Badge tone="accent">Active</Badge>
                      </div>
                      <p className="mt-2 text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                        {tab.description}
                      </p>
                    </div>
                  );
                }

                if ("href" in tab && tab.href) {
                  return (
                    <TrackedLink
                      key={tab.title}
                      href={localizeHref(locale, hasExplicitLocalePrefix, tab.href)}
                      eventName="cta_click"
                      eventPayload={{ page: "/rashifal", feature: `rashifal-tab-${tab.title.toLowerCase().replace(/\s+/g, "-")}` }}
                      className="block h-full"
                    >
                      <Card
                        tone="default"
                        interactive
                        className="flex h-full flex-col gap-2 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-strong)]">
                            {tab.title}
                          </h2>
                          <Badge tone="neutral">{tab.statusLabel}</Badge>
                        </div>
                        <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                          {tab.description}
                        </p>
                        <span className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center" })}>
                          View Rashifal
                        </span>
                      </Card>
                    </TrackedLink>
                  );
                }

                return (
                  <Card
                    key={tab.title}
                    className="flex h-full flex-col gap-2 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-strong)]">
                        {tab.title}
                      </h2>
                      <Badge tone="neutral">{tab.statusLabel}</Badge>
                    </div>
                    <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      {tab.description}
                    </p>
                    <span
                      className={buttonStyles({
                        size: "sm",
                        tone: "ghost",
                        className: "w-full justify-center pointer-events-none opacity-60",
                      })}
                      aria-disabled="true"
                    >
                      Coming Soon
                    </span>
                  </Card>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-6 sm:py-7">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {rashifalSigns.map((sign) => (
                <RashifalSignCard
                  key={sign.slug}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                  slug={sign.slug}
                  name={sign.name}
                  icon={sign.icon}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="pt-6">
          <AdSlot placement="rashifal_after_intro" />
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-9 sm:py-10">
            <Card className="space-y-3 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0">
              <Badge tone="trust" className="border border-black/8 bg-white w-fit">
                FROM THE DESK OF J P SARMAH
              </Badge>
              <p className="max-w-4xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Daily Rashifal, Monthly Rashifal, Yearly Rashifal, Panchang guidance and Vedic astrology insights are manually prepared and published from the astrologer&apos;s desk.
              </p>
              <TrackedLink
                href={localizeHref(locale, hasExplicitLocalePrefix, "/from-the-desk")}
                eventName="cta_click"
                eventPayload={{ page: "/rashifal", feature: "rashifal-from-the-desk" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Read From the Desk
              </TrackedLink>
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-9 sm:py-10">
            <div className="space-y-4">
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Today&apos;s Guidance Companion
                </Badge>
                <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Continue from today&apos;s guidance into Panchang timing, remedies, AI support, or a personal chart.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {rashifalGuidanceCards.map((card) => (
                  <TrackedLink
                    key={card.title}
                    href={localizeHref(locale, hasExplicitLocalePrefix, card.href)}
                    eventName="cta_click"
                    eventPayload={{ page: "/rashifal", feature: card.feature }}
                    className="block h-full"
                  >
                    <Card
                      tone="default"
                      interactive
                      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-black/12"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.12)]">
                          {card.title.slice(0, 1)}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-[0.92rem] font-semibold text-[color:var(--color-ink-strong)]">
                            {card.title}
                          </h3>
                          <p className="text-[0.72rem] uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
                            Safe navigation
                          </p>
                        </div>
                      </div>
                      <p className="flex-1 text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                        {card.description}
                      </p>
                      <span className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center" })}>
                        {card.ctaLabel}
                      </span>
                    </Card>
                  </TrackedLink>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="pt-6">
          <AdSlot placement="rashifal_mid_content" />
        </section>
      </main>
    </>
  );
}
