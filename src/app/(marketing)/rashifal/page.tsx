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
    href: "#daily-rashifal",
    active: true,
    statusLabel: "Active",
    ctaLabel: "Open Reading",
  },
  {
    title: "Monthly Rashifal",
    href: "#monthly-rashifal",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
  },
  {
    title: "Yearly Rashifal",
    href: "#yearly-rashifal",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
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

const hasRashifalContent = rashifalSigns.length > 0;

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
        className="flex h-full min-h-[15rem] flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-black/12 sm:min-h-[16rem]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.12)]">
            {icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-[0.98rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
              {name}
            </h3>
            <Badge tone="trust" className="border border-black/8 bg-white">
              Daily Guidance
            </Badge>
          </div>
        </div>

        <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          Read the latest manually published daily guidance from the astrologer&apos;s desk.
        </p>

        <span
          className={buttonStyles({
            size: "sm",
            tone: "accent",
            className: "w-full justify-center",
          })}
        >
          Read Rashifal
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

      <main className="min-h-screen bg-[#FFFFFF] pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-center lg:py-12">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Daily Guidance
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  From the Desk
                </Badge>
              </div>

              <div className="space-y-2.5 sm:space-y-4">
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

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
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

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                    className="border border-black/8 bg-white px-2 py-1 text-[0.56rem] uppercase tracking-[0.05em] text-[color:var(--color-ink-strong)] sm:px-3 sm:py-1.5 sm:text-[0.64rem] sm:tracking-[0.1em]"
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
          <Container className="py-4 sm:py-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {rashifalTabs.map((tab) => {
                const isActive = "active" in tab && tab.active;
                const tabClassName = isActive
                  ? "border-[rgba(184,137,67,0.32)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(247,234,204,0.96)_100%)] text-[color:var(--color-ink-strong)] shadow-[0_12px_26px_rgba(17,24,39,0.06)]"
                  : "border-black/8 bg-white text-[color:var(--color-ink-strong)]";

                return (
                  <TrackedLink
                    key={tab.title}
                    href={localizeHref(locale, hasExplicitLocalePrefix, tab.href)}
                    eventName="cta_click"
                    eventPayload={{
                      page: "/rashifal",
                      feature: `rashifal-tab-${tab.title.toLowerCase().replace(/\s+/g, "-")}`,
                    }}
                    className="block h-full"
                  >
                    <Card
                      tone="default"
                      interactive
                      className={`flex h-full min-h-[5.1rem] flex-col justify-between gap-1.5 border px-3 py-3 text-left before:opacity-0 ${tabClassName}`}
                    >
                      <div className="space-y-1">
                        <h2 className="text-[0.96rem] font-semibold leading-tight sm:text-[1rem]">
                          {tab.title}
                        </h2>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          tone={isActive ? "trust" : "outline"}
                          className="border border-black/8 bg-white text-[0.66rem] uppercase tracking-[0.07em] text-[color:var(--color-accent-strong)]"
                        >
                          {tab.statusLabel}
                        </Badge>
                        <span
                          className={`text-[0.7rem] font-medium uppercase tracking-[0.09em] ${
                            isActive
                              ? "text-[color:var(--color-accent-strong)]"
                              : "text-[color:var(--color-ink-strong)]"
                          }`}
                        >
                          {tab.ctaLabel}
                        </span>
                      </div>
                    </Card>
                  </TrackedLink>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-5 sm:py-7">
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

        <section className="border-b border-black/8 bg-white scroll-mt-24" id="daily-rashifal">
          <Container className="py-7 sm:py-9" id="rashifal-reading">
            <div className="space-y-3">
              <div className="space-y-2">
                <h2 className="text-[length:var(--font-size-title-md)] font-semibold text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-title-lg)]">
                  Today&apos;s Rashifal Reading
                </h2>
                <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Daily Rashifal content is manually published from the astrologer&apos;s desk. Select your zodiac sign and read the latest available guidance.
                </p>
              </div>

              {hasRashifalContent ? (
                <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                  {rashifalSigns.map((sign) => {
                    const signHref = localizeHref(locale, hasExplicitLocalePrefix, `/rashifal/${sign.slug}`);

                    return (
                      <TrackedLink
                        key={sign.slug}
                        href={signHref}
                        eventName="cta_click"
                        eventPayload={{ page: "/rashifal", feature: `rashifal-reading-${sign.slug}` }}
                        className="block h-full"
                      >
                        <Card
                          tone="default"
                          interactive
                          className="flex h-full flex-col gap-4 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-black/12"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.12)]">
                                {sign.icon}
                              </span>
                              <div className="min-w-0">
                                <h3 className="text-[0.95rem] font-semibold text-[color:var(--color-ink-strong)]">
                                  {sign.name}
                                </h3>
                                <p className="text-[0.72rem] uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
                                  Select your sign
                                </p>
                              </div>
                            </div>
                            <Badge tone="neutral" className="shrink-0">
                              Reading
                            </Badge>
                          </div>

                          <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                            {sign.shortPrediction}
                          </p>

                          <div className="grid gap-2 rounded-[1rem] border border-black/8 bg-white p-2.5 text-[0.74rem] text-[color:var(--color-ink-body)] shadow-[0_8px_20px_rgba(17,24,39,0.04)] sm:grid-cols-3 sm:p-3">
                            <div>
                              <p className="uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">Love</p>
                              <p className="mt-1 line-clamp-3">{sign.love}</p>
                            </div>
                            <div>
                              <p className="uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">Career</p>
                              <p className="mt-1 line-clamp-3">{sign.career}</p>
                            </div>
                            <div>
                              <p className="uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">Business</p>
                              <p className="mt-1 line-clamp-3">{sign.business}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge tone="trust" className="border border-black/8 bg-white">
                              {sign.luckyColor}
                            </Badge>
                            <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                              Lucky {sign.luckyNumber}
                            </Badge>
                            <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                              {sign.luckyTime}
                            </Badge>
                          </div>

                          <span
                            className={buttonStyles({
                              size: "sm",
                              tone: "secondary",
                              className: "w-full justify-center",
                            })}
                          >
                            Read Rashifal
                          </span>
                        </Card>
                      </TrackedLink>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0">
                  <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-strong)]">
                    Today&apos;s Rashifal will be published from the desk soon.
                  </p>
                </Card>
              )}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white scroll-mt-24" id="monthly-rashifal">
          <Container className="py-7 sm:py-9">
            <Card className="space-y-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Monthly Rashifal
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-strong)]">
                Monthly Rashifal will be published from the desk soon.
              </p>
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white scroll-mt-24" id="yearly-rashifal">
          <Container className="py-7 sm:py-9">
            <Card className="space-y-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Yearly Rashifal
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-strong)]">
                Yearly Rashifal will be published from the desk soon.
              </p>
            </Card>
          </Container>
        </section>

        <section className="pt-6">
          <AdSlot placement="rashifal_after_intro" />
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-7 sm:py-9">
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
          <Container className="py-7 sm:py-9">
            <div className="space-y-3">
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Today&apos;s Guidance Companion
                </Badge>
                <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Continue from today&apos;s guidance into Panchang timing, remedies, AI support, or a personal chart.
                </p>
              </div>

              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
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
                      className="flex h-full flex-col gap-3 border-black/8 bg-white p-3.5 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-black/12 sm:p-4"
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

