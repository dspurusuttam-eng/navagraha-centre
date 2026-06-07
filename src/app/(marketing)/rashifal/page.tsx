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

const rashifalVedicNames: Record<string, string> = {
  aries: "Mesh",
  taurus: "Vrishabh",
  gemini: "Mithun",
  cancer: "Kark",
  leo: "Singh",
  virgo: "Kanya",
  libra: "Tula",
  scorpio: "Vrishchik",
  sagittarius: "Dhanu",
  capricorn: "Makar",
  aquarius: "Kumbh",
  pisces: "Meen",
};

const dailyRail = [
  {
    title: "Panchang",
    href: "/panchang",
    description: "Daily timing",
    feature: "rashifal-rail-panchang",
  },
  {
    title: "Transit",
    href: "/transit",
    description: "Planet movement",
    feature: "rashifal-rail-transit",
  },
  {
    title: "Dasha",
    href: "/dasha",
    description: "Period context",
    feature: "rashifal-rail-dasha",
  },
  {
    title: "Remedies",
    href: "/remedies",
    description: "Cautious support",
    feature: "rashifal-rail-remedies",
  },
  {
    title: "Ask NI",
    href: "/ai",
    description: "Context support",
    feature: "rashifal-rail-ask-ni",
  },
] as const;

const timingBridgeCards = [
  {
    title: "Panchang Timing",
    href: "/panchang",
    ctaLabel: "Open Panchang",
    description: "Use daily Tithi, Nakshatra, and timing context before reading broad guidance.",
    feature: "rashifal-bridge-panchang",
  },
  {
    title: "Transit Guidance",
    href: "/transit",
    ctaLabel: "Open Transit",
    description: "Connect public zodiac guidance with current planetary movement.",
    feature: "rashifal-bridge-transit",
  },
  {
    title: "Dasha Timing",
    href: "/dasha",
    ctaLabel: "Open Dasha",
    description: "Use Dasha as a deeper timing layer when personal chart context is available.",
    feature: "rashifal-bridge-dasha",
  },
] as const;

const deskBridgeCards = [
  {
    title: "Articles",
    href: "/articles",
    ctaLabel: "Read Articles",
    description: "Continue into manually written astrology explainers and public guidance.",
    feature: "rashifal-articles",
  },
  {
    title: "From the Desk",
    href: "/from-the-desk",
    ctaLabel: "Open Desk",
    description: "Read public notes and authority-led context from the J P Sarmah desk.",
    feature: "rashifal-from-the-desk",
  },
] as const;

const supportCards = [
  {
    title: "Reports",
    href: "/reports",
    ctaLabel: "View Report Options",
    description: "Move from public daily guidance into deeper report options when needed.",
    feature: "rashifal-reports",
  },
  {
    title: "Consultation Support",
    href: "/consultation",
    ctaLabel: "Request Guidance",
    description: "Use human-reviewed support for decisions that need more than public Rashifal.",
    feature: "rashifal-consultation",
  },
] as const;

const hasRashifalContent = rashifalSigns.length > 0;

function localizeHref(locale: string, hasExplicitLocalePrefix: boolean, href: string) {
  if (href.startsWith("#")) {
    return href;
  }

  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function ZodiacSignCard({
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
  const vedicName = rashifalVedicNames[slug] ?? name;

  return (
    <TrackedLink
      href={href}
      eventName="rashifal_view"
      eventPayload={{ page: "/rashifal", feature: `rashifal-sign-${slug}` }}
      className="group block h-full"
    >
      <Card
        tone="default"
        interactive
        className="relative flex h-full min-h-[7.75rem] flex-col justify-between overflow-hidden border-[rgba(184,137,67,0.18)] bg-white p-3.5 shadow-[0_14px_34px_rgba(17,24,39,0.045)] before:opacity-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-[rgba(184,137,67,0.34)] sm:min-h-[8.5rem] sm:p-4"
      >
        <span className="pointer-events-none absolute -right-5 -top-6 h-20 w-20 rounded-full border border-[rgba(184,137,67,0.16)]" />
        <div className="relative flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-white text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.10)]">
            {icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-[0.96rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
              {name}
            </h3>
            <p className="text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
              {vedicName}
            </p>
          </div>
        </div>
        <span className="relative mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-[color:var(--color-accent-strong)]">
          Read sign guidance
        </span>
      </Card>
    </TrackedLink>
  );
}

function RouteCard({
  locale,
  hasExplicitLocalePrefix,
  title,
  href,
  description,
  ctaLabel,
  feature,
  tone = "default",
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
  title: string;
  href: string;
  description: string;
  ctaLabel: string;
  feature: string;
  tone?: "default" | "ask" | "authority";
}>) {
  const hrefValue = localizeHref(locale, hasExplicitLocalePrefix, href);
  const isAsk = tone === "ask";
  const isAuthority = tone === "authority";

  return (
    <TrackedLink
      href={hrefValue}
      eventName="cta_click"
      eventPayload={{ page: "/rashifal", feature }}
      className="block h-full"
    >
      <Card
        tone="default"
        interactive
        className={`flex h-full flex-col gap-3 border bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 ${
          isAsk
            ? "border-[rgba(0,195,255,0.24)] shadow-[0_18px_44px_rgba(0,195,255,0.08)]"
            : isAuthority
              ? "border-[rgba(116,28,45,0.22)]"
              : "border-black/8 hover:border-[rgba(184,137,67,0.28)]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[0.98rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isAsk ? "bg-[#00c8ff]" : isAuthority ? "bg-[#741c2d]" : "bg-[color:var(--color-accent-strong)]"
            }`}
          />
        </div>
        <p className="flex-1 text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {description}
        </p>
        <span
          className={buttonStyles({
            size: "sm",
            tone: isAsk ? "secondary" : "ghost",
            className: "w-full justify-center",
          })}
        >
          {ctaLabel}
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

      <main className="launch-page launch-page-rashifal min-h-screen overflow-hidden bg-white pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <section className="relative overflow-hidden border-b border-[rgba(155,122,74,0.14)] bg-white">
          <div className="pointer-events-none absolute right-0 top-[-7rem] h-64 w-64 rounded-full border border-[rgba(184,137,67,0.16)]" />
          <div className="pointer-events-none absolute right-6 top-[-4.5rem] h-44 w-44 rounded-full border border-[rgba(184,137,67,0.18)]" />
          <div className="pointer-events-none absolute bottom-[-5rem] left-0 h-40 w-40 rounded-full border border-[rgba(184,137,67,0.10)]" />
          <Container className="relative grid gap-5 py-7 sm:py-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(300px,1.05fr)] lg:items-center lg:py-11">
            <div className="space-y-4">
              <div className="space-y-2.5">
                <h1
                  className="max-w-3xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-sm)] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                  style={{
                    letterSpacing: "0.01em",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Rashifal - Daily Zodiac Guidance
                </h1>
                <p className="max-w-[43rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Read daily zodiac guidance, explore Panchang timing, Transit, Dasha, and Ask NI support.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <TrackedLink
                  href={localizeHref(locale, hasExplicitLocalePrefix, "#daily-rashifal")}
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
                  href={localizeHref(locale, hasExplicitLocalePrefix, "/ai")}
                  eventName="cta_click"
                  eventPayload={{ page: "/rashifal", feature: "rashifal-hero-ask-ni" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full justify-center border-[rgba(0,195,255,0.28)] text-[color:var(--color-ink-strong)] sm:w-auto",
                  })}
                >
                  Ask NI
                </TrackedLink>
              </div>
            </div>

            <Card className="relative overflow-hidden border-[rgba(184,137,67,0.20)] bg-white p-4 shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0 sm:p-5">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[rgba(184,137,67,0.20)]" />
              <div className="pointer-events-none absolute right-5 top-5 h-20 w-20 rounded-full border border-dashed border-[rgba(184,137,67,0.22)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="trust" className="border border-black/8 bg-white">
                    Today&apos;s flow
                  </Badge>
                  <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                    12 signs
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {rashifalSigns.slice(0, 12).map((sign) => (
                    <TrackedLink
                      key={sign.slug}
                      href={localizeHref(locale, hasExplicitLocalePrefix, `/rashifal/${sign.slug}`)}
                      eventName="rashifal_view"
                      eventPayload={{ page: "/rashifal", feature: `rashifal-hero-sign-${sign.slug}` }}
                      className="rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-2.5 py-2 text-center text-[0.72rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_10px_24px_rgba(17,24,39,0.04)] transition-colors hover:border-[rgba(184,137,67,0.36)]"
                    >
                      <span className="block text-[0.78rem] text-[color:var(--color-accent-strong)]">
                        {sign.icon}
                      </span>
                      <span className="mt-1 block truncate">{sign.name}</span>
                    </TrackedLink>
                  ))}
                </div>
                <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Select a sign first. Then use timing, Transit, Dasha, Ask NI, or human-reviewed guidance where needed.
                </p>
              </div>
            </Card>
          </Container>
        </section>

        <section className="border-b border-[rgba(155,122,74,0.14)] bg-white">
          <Container className="space-y-4 py-5 sm:py-7">
            <div className="flex w-full max-w-full min-w-0 gap-2 overflow-x-auto pb-1 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pr-0 [&::-webkit-scrollbar]:hidden">
              {dailyRail.map((item) => (
                <TrackedLink
                  key={item.title}
                  href={localizeHref(locale, hasExplicitLocalePrefix, item.href)}
                  eventName="cta_click"
                  eventPayload={{ page: "/rashifal", feature: item.feature }}
                  className={`min-w-[8rem] rounded-[1.1rem] border bg-white px-3.5 py-3 shadow-[0_10px_24px_rgba(17,24,39,0.04)] sm:min-w-0 sm:flex-1 ${
                    item.title === "Ask NI"
                      ? "border-[rgba(0,195,255,0.28)]"
                      : "border-[rgba(184,137,67,0.18)]"
                  }`}
                >
                  <span className="block text-[0.78rem] font-semibold text-[color:var(--color-ink-strong)]">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--color-ink-body)]">
                    {item.description}
                  </span>
                </TrackedLink>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-[rgba(155,122,74,0.14)] bg-white scroll-mt-24" id="daily-rashifal">
          <Container className="space-y-4 py-7 sm:py-9">
            <div className="space-y-2">
              <h2 className="text-[length:var(--font-size-title-md)] font-semibold text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-title-lg)]">
                Today&apos;s Rashifal action area
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Keep the path simple: choose a zodiac sign and continue into the latest available sign reading.
              </p>
            </div>

            {hasRashifalContent ? (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rashifalSigns.map((sign) => (
                  <ZodiacSignCard
                    key={sign.slug}
                    locale={locale}
                    hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                    slug={sign.slug}
                    name={sign.name}
                    icon={sign.icon}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0">
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-strong)]">
                  Today&apos;s Rashifal will be published from the desk soon.
                </p>
              </Card>
            )}
          </Container>
        </section>

        <section className="pt-6">
          <AdSlot placement="rashifal_after_intro" />
        </section>

        <section className="border-b border-[rgba(155,122,74,0.14)] bg-white">
          <Container className="py-7 sm:py-9">
            <Card className="relative overflow-hidden border-[rgba(0,195,255,0.22)] bg-white p-4 shadow-[0_18px_46px_rgba(0,195,255,0.08)] before:opacity-0 sm:p-5">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-[rgba(0,195,255,0.18)]" />
              <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-2">
                  <Badge tone="outline" className="w-fit border-[rgba(0,195,255,0.28)] bg-white text-[color:var(--color-ink-strong)]">
                    NAVAGRAHA Intelligence support
                  </Badge>
                  <h2 className="text-[length:var(--font-size-title-md)] font-semibold text-[color:var(--color-ink-strong)]">
                    Ask NI for daily context
                  </h2>
                  <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Ask NI is powered by NAVAGRAHA Intelligence and helps users understand zodiac guidance, Panchang timing, Transit, Dasha, and practical Vedic context.
                  </p>
                </div>
                <TrackedLink
                  href={localizeHref(locale, hasExplicitLocalePrefix, "/ai")}
                  eventName="cta_click"
                  eventPayload={{ page: "/rashifal", feature: "rashifal-ask-ni-bridge" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full justify-center border-[rgba(0,195,255,0.30)] sm:w-auto",
                  })}
                >
                  Ask NI
                </TrackedLink>
              </div>
            </Card>
          </Container>
        </section>

        <section className="border-b border-[rgba(155,122,74,0.14)] bg-white">
          <Container className="space-y-4 py-7 sm:py-9">
            <div className="space-y-2">
              <h2 className="text-[length:var(--font-size-title-md)] font-semibold text-[color:var(--color-ink-strong)]">
                Panchang, Transit, and Dasha bridge
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Use these tools as context layers. This section does not display generated results or timing claims.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {timingBridgeCards.map((card) => (
                <RouteCard
                  key={card.title}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                  {...card}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-[rgba(155,122,74,0.14)] bg-white">
          <Container className="space-y-4 py-7 sm:py-9">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <Card className="border-[rgba(116,28,45,0.22)] bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 sm:p-5">
                <div className="space-y-3">
                  <Badge tone="outline" className="w-fit border-[rgba(116,28,45,0.24)] bg-white text-[#741c2d]">
                    J P Sarmah authority
                  </Badge>
                  <h2 className="text-[length:var(--font-size-title-md)] font-semibold text-[color:var(--color-ink-strong)]">
                    Human-reviewed guidance stays separate.
                  </h2>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    J P Sarmah remains the human authority. Ask NI is assistance, not replacement. Human-reviewed consultation supports deeper guidance.
                  </p>
                </div>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                {deskBridgeCards.map((card) => (
                  <RouteCard
                    key={card.title}
                    locale={locale}
                    hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                    tone="authority"
                    {...card}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-[rgba(155,122,74,0.14)] bg-white">
          <Container className="space-y-4 py-7 sm:py-9">
            <div className="space-y-2">
              <h2 className="text-[length:var(--font-size-title-md)] font-semibold text-[color:var(--color-ink-strong)]">
                Reports and consultation support
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Use public guidance for orientation. For deeper decisions, continue into report options or human-reviewed support.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {supportCards.map((card) => (
                <RouteCard
                  key={card.title}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                  {...card}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-7 sm:py-9">
            <Card className="border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.045)] before:opacity-0 sm:p-5">
              <div className="space-y-2">
                <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                  Guidance-first trust note
                </h2>
                <p className="max-w-4xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Rashifal is guidance-first. Results are not guaranteed. For deeper decisions, use human-reviewed guidance.
                </p>
              </div>
            </Card>
          </Container>
        </section>

        <section className="pt-6">
          <AdSlot placement="rashifal_mid_content" />
        </section>
      </main>
    </>
  );
}
