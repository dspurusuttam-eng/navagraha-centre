import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import type { ReactNode } from "react";
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
import { UtilityIcon } from "@/components/graphics/utility-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("home", locale);

  return createPageMetadata({
    title: localized.title,
    description: localized.description,
    path: "/",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "AI Vedic astrology",
      "kundli",
      "daily rashifal",
      "daily panchang",
      "numerology",
      "astrology reports",
    ],
  });
}

export const revalidate = 3600;

const hasBrandLogo = existsSync(
  join(process.cwd(), "public", "brand", "navagraha-om-logo.png"),
);

const youtubeChannelUrl =
  "https://youtube.com/@navagrahaastrologicalcentre?si=UlIJg9BmEClecPqL";

type IconKey =
  | "ai"
  | "article"
  | "authority"
  | "calculator"
  | "consultation"
  | "dasha"
  | "kundli"
  | "learning"
  | "matching"
  | "muhurat"
  | "numerology"
  | "panchang"
  | "report"
  | "rashifal"
  | "service"
  | "shop"
  | "transit"
  | "video";

type RouteCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: IconKey;
  feature: string;
};

type StaticCard = {
  title: string;
  description: string;
  cta?: string;
  href?: string;
  icon: IconKey;
  feature: string;
};

const categoryTabs = [
  { label: "Home", href: "#top" },
  { label: "Daily", href: "#daily" },
  { label: "Kundli", href: "/kundli" },
  { label: "NI", href: "#navagraha-intelligence" },
  { label: "Reports", href: "/reports" },
  { label: "Consultation", href: "/consultation" },
  { label: "Puja", href: "#vedic-services" },
  { label: "Shop", href: "/shop" },
  { label: "Learn", href: "#learning" },
  { label: "Videos", href: "#videos" },
  { label: "Account", href: "/sign-in" },
] as const;

const firstToolGrid: readonly RouteCard[] = [
  {
    title: "Kundli",
    description: "Generate a clean Vedic birth chart.",
    href: "/kundli",
    cta: "Generate",
    icon: "kundli",
    feature: "home-first-grid-kundli",
  },
  {
    title: "Rashifal",
    description: "Open daily zodiac guidance.",
    href: "/rashifal",
    cta: "Read",
    icon: "rashifal",
    feature: "home-first-grid-rashifal",
  },
  {
    title: "Panchang",
    description: "View daily timing context.",
    href: "/panchang",
    cta: "Open",
    icon: "panchang",
    feature: "home-first-grid-panchang",
  },
  {
    title: "Ask NI",
    description: "Start NAVAGRAHA Intelligence.",
    href: "/ai",
    cta: "Ask",
    icon: "ai",
    feature: "home-first-grid-ask-ni",
  },
  {
    title: "Matching",
    description: "Check compatibility safely.",
    href: "/matchmaking",
    cta: "Match",
    icon: "matching",
    feature: "home-first-grid-matching",
  },
  {
    title: "Dasha",
    description: "Review time-period guidance.",
    href: "/dasha",
    cta: "Open",
    icon: "dasha",
    feature: "home-first-grid-dasha",
  },
  {
    title: "Transit",
    description: "See current Gochar context.",
    href: "/transit",
    cta: "Open",
    icon: "transit",
    feature: "home-first-grid-transit",
  },
  {
    title: "Muhurat",
    description: "Open planning and timing tools.",
    href: "/muhurat",
    cta: "Open",
    icon: "muhurat",
    feature: "home-first-grid-muhurat",
  },
] as const;

const dailyCards: readonly RouteCard[] = [
  {
    title: "Today Rashifal",
    description: "Start with calm daily guidance.",
    href: "/rashifal",
    cta: "Read Rashifal",
    icon: "rashifal",
    feature: "home-daily-rashifal",
  },
  {
    title: "Today Panchang",
    description: "Open the daily Panchang surface.",
    href: "/panchang",
    cta: "Open Panchang",
    icon: "panchang",
    feature: "home-daily-panchang",
  },
  {
    title: "Transit Check",
    description: "Review current planetary motion.",
    href: "/transit",
    cta: "Open Transit",
    icon: "transit",
    feature: "home-daily-transit",
  },
  {
    title: "Muhurat Planning",
    description: "Move from day context to timing.",
    href: "/muhurat",
    cta: "Open Muhurat",
    icon: "muhurat",
    feature: "home-daily-muhurat",
  },
] as const;

const reportCards: readonly StaticCard[] = [
  {
    title: "Handmade Kundli",
    description:
      "Premium human-guided Kundli preparation is treated as the strongest service pathway.",
    href: "/consultation",
    cta: "Request Guidance",
    icon: "authority",
    feature: "home-premium-handmade-kundli",
  },
  {
    title: "Digital PDF Reports",
    description:
      "Structured report paths stay connected to verified report surfaces.",
    href: "/reports",
    cta: "Explore Reports",
    icon: "report",
    feature: "home-premium-digital-reports",
  },
  {
    title: "Kundli First",
    description:
      "Users can generate a chart before moving into reports, consultation, or deeper guidance.",
    href: "/kundli",
    cta: "Generate Kundli",
    icon: "kundli",
    feature: "home-premium-kundli-first",
  },
] as const;

const serviceCards: readonly StaticCard[] = [
  {
    title: "Consultation",
    description: "Human guidance by Joy Prakash Sarmah for important decisions.",
    href: "/consultation",
    cta: "Book Consultation",
    icon: "consultation",
    feature: "home-service-consultation",
  },
  {
    title: "Puja",
    description:
      "Service pathway reserved for verified availability and safe inquiry flow.",
    icon: "service",
    feature: "home-service-puja",
  },
  {
    title: "Hawan",
    description:
      "Ritual service presentation stays non-claiming until service details are verified.",
    icon: "service",
    feature: "home-service-hawan",
  },
  {
    title: "Yagya",
    description:
      "Planned service pathway with no dates, packages, or outcome claims.",
    icon: "service",
    feature: "home-service-yagya",
  },
  {
    title: "Digital PDF Reports",
    description: "Report discovery is routed to the existing public reports hub.",
    href: "/reports",
    cta: "View Reports",
    icon: "report",
    feature: "home-service-reports",
  },
] as const;

const shopCategories: readonly StaticCard[] = [
  {
    title: "Gemstone",
    description: "Category pathway into the existing shop route.",
    href: "/shop",
    cta: "Open Shop",
    icon: "shop",
    feature: "home-shop-gemstone",
  },
  {
    title: "Rudraksha",
    description: "Spiritual category pathway linked to the real shop route.",
    href: "/shop",
    cta: "Open Shop",
    icon: "shop",
    feature: "home-shop-rudraksha",
  },
  {
    title: "Mala",
    description: "Vedic category pathway into the existing shop route.",
    href: "/shop",
    cta: "Open Shop",
    icon: "shop",
    feature: "home-shop-mala",
  },
  {
    title: "Bracelet",
    description: "Category pathway routed safely to the shop hub.",
    href: "/shop",
    cta: "Open Shop",
    icon: "shop",
    feature: "home-shop-bracelet",
  },
  {
    title: "Kavacham",
    description: "Protective item category structure without guarantee claims.",
    href: "/shop",
    cta: "Open Shop",
    icon: "shop",
    feature: "home-shop-kavacham",
  },
  {
    title: "Puja Items",
    description: "Ritual item category structure connected to the shop route.",
    href: "/shop",
    cta: "Open Shop",
    icon: "shop",
    feature: "home-shop-puja-items",
  },
] as const;

const trustItems = [
  "Single human authority",
  "Frontend-only foundation",
  "Safe public routes",
  "Verified content only",
] as const;

function VisualIcon({ icon }: Readonly<{ icon: IconKey }>) {
  switch (icon) {
    case "ai":
      return <NavagrahaAiIcon />;
    case "calculator":
    case "dasha":
    case "transit":
      return <CalculatorIcon />;
    case "consultation":
      return <ConsultationIcon />;
    case "kundli":
      return <KundliIcon />;
    case "matching":
      return <UtilityIcon name="compatibility" />;
    case "muhurat":
      return <UtilityIcon name="muhurta" />;
    case "numerology":
      return <NumerologyIcon />;
    case "panchang":
      return <PanchangIcon />;
    case "rashifal":
      return <RashifalIcon />;
    case "report":
      return <ReportIcon />;
    default:
      return (
        <span
          aria-hidden="true"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(184,137,67,0.34)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.96)_0%,rgba(247,234,204,0.9)_70%,rgba(238,214,166,0.82)_100%)] text-[0.72rem] font-semibold text-[rgba(130,86,25,0.95)] shadow-[0_8px_20px_rgba(121,85,33,0.12)]"
        >
          {icon === "video"
            ? "VID"
            : icon === "shop"
              ? "SH"
              : icon === "learning"
                ? "LN"
                : icon === "authority"
                  ? "JPS"
                  : "NC"}
        </span>
      );
  }
}

function SectionHeader({
  id,
  eyebrow,
  title,
  description,
}: Readonly<{
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <div id={id} className="max-w-3xl scroll-mt-28 space-y-3">
      <Badge tone="trust" className="w-fit bg-white/80">
        {eyebrow}
      </Badge>
      <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--color-ink-strong)]">
        {title}
      </h2>
      <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
        {description}
      </p>
    </div>
  );
}

function CardLink({
  item,
  localizeHref,
  compact = false,
}: Readonly<{
  item: RouteCard | StaticCard;
  localizeHref: (href: string) => string;
  compact?: boolean;
}>) {
  const content = (
    <>
      <div className="flex items-start gap-3">
        <VisualIcon icon={item.icon} />
        <div className="min-w-0 space-y-1">
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold leading-snug text-[color:var(--color-ink-strong)]">
            {item.title}
          </h3>
          <p className="text-[0.82rem] leading-6 text-[color:var(--color-ink-body)]">
            {item.description}
          </p>
        </div>
      </div>
      {"href" in item && item.href && item.cta ? (
        <span className="mt-auto inline-flex min-h-10 items-center text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-gold-dark)]">
          {item.cta}
        </span>
      ) : (
        <span className="mt-auto inline-flex min-h-10 items-center text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
          Planned safely
        </span>
      )}
    </>
  );

  const className = [
    "group flex min-h-full flex-col gap-4 rounded-[var(--radius-card)] border border-[rgba(155,122,74,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(251,244,232,0.92))] p-4 shadow-[var(--shadow-card-soft)] transition hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.44)] hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
    compact ? "sm:p-4" : "sm:p-5",
  ].join(" ");

  if ("href" in item && item.href) {
    return (
      <TrackedLink
        href={localizeHref(item.href)}
        eventName="cta_click"
        eventPayload={{
          page: "/",
          feature: item.feature,
          route: item.href,
        }}
        className={className}
      >
        {content}
      </TrackedLink>
    );
  }

  return <div className={className}>{content}</div>;
}

function CategoryTabs({
  localizeHref,
}: Readonly<{ localizeHref: (href: string) => string }>) {
  return (
    <section className="sticky top-0 z-20 border-b border-[rgba(155,122,74,0.18)] bg-white/92 backdrop-blur-xl">
      <Container className="py-3">
        <nav aria-label="Homepage categories" className="flex gap-2 overflow-x-auto pb-1">
          {categoryTabs.map((tab) =>
            tab.href.startsWith("#") ? (
              <a
                key={tab.label}
                href={tab.href}
                className="inline-flex min-h-10 shrink-0 items-center rounded-[var(--radius-pill)] border border-[rgba(155,122,74,0.2)] bg-white px-4 text-[0.74rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_8px_18px_rgba(96,76,48,0.08)] transition hover:border-[rgba(185,139,70,0.4)] hover:text-[color:var(--color-accent-gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              >
                {tab.label}
              </a>
            ) : (
              <TrackedLink
                key={tab.label}
                href={localizeHref(tab.href)}
                eventName="cta_click"
                eventPayload={{
                  page: "/",
                  feature: `home-category-${tab.label.toLowerCase()}`,
                  route: tab.href,
                }}
                className="inline-flex min-h-10 shrink-0 items-center rounded-[var(--radius-pill)] border border-[rgba(155,122,74,0.2)] bg-white px-4 text-[0.74rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_8px_18px_rgba(96,76,48,0.08)] transition hover:border-[rgba(185,139,70,0.4)] hover:text-[color:var(--color-accent-gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              >
                {tab.label}
              </TrackedLink>
            ),
          )}
        </nav>
      </Container>
    </section>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-4">
      {hasBrandLogo ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[rgba(185,139,70,0.34)] bg-black shadow-[0_16px_34px_rgba(96,76,48,0.18)] sm:h-20 sm:w-20">
          <Image
            src="/brand/navagraha-om-logo.png"
            alt="NAVAGRAHA CENTRE golden Om mandala logo"
            fill
            priority
            sizes="80px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(185,139,70,0.34)] bg-[rgba(185,139,70,0.12)] text-[0.74rem] font-semibold text-[color:var(--color-accent-gold-dark)] sm:h-20 sm:w-20">
          NC
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-gold-dark)]">
          NAVAGRAHA CENTRE
        </p>
        <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--color-ink-body)]">
          Premium Vedic astrology dashboard
        </p>
      </div>
    </div>
  );
}

function HeroCommand({
  localizeHref,
}: Readonly<{ localizeHref: (href: string) => string }>) {
  const commandLinks = [
    { label: "Generate Kundli", href: "/kundli", feature: "hero-command-kundli" },
    { label: "Today Panchang", href: "/panchang", feature: "hero-command-panchang" },
    { label: "Ask NI", href: "/ai", feature: "hero-command-ai" },
    { label: "Open Tools", href: "/tools", feature: "hero-command-tools" },
  ] as const;

  return (
    <div className="rounded-[var(--radius-card)] border border-[rgba(155,122,74,0.24)] bg-white/92 p-4 shadow-[var(--shadow-card-soft)] sm:p-5">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-muted)]">
        Start here
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {commandLinks.map((link) => (
          <TrackedLink
            key={link.href}
            href={localizeHref(link.href)}
            eventName="cta_click"
            eventPayload={{
              page: "/",
              feature: link.feature,
              route: link.href,
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(155,122,74,0.24)] bg-[rgba(255,255,255,0.94)] px-4 text-center text-[0.76rem] font-semibold text-[color:var(--color-ink-strong)] transition hover:border-[rgba(185,139,70,0.48)] hover:text-[color:var(--color-accent-gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
          >
            {link.label}
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}

function SymbolicAuthorityGraphic() {
  return (
    <div
      aria-label="Symbolic authority mark for J P Sarmah Desk"
      className="relative flex aspect-square min-h-44 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.28)] bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.98),rgba(246,232,206,0.94)_48%,rgba(232,211,167,0.78)_100%)] shadow-[0_18px_44px_rgba(96,76,48,0.16)]"
    >
      <div className="absolute inset-[12%] rounded-full border border-[rgba(185,139,70,0.24)]" />
      <div className="absolute inset-[22%] rotate-45 border border-[rgba(185,139,70,0.18)]" />
      <div className="absolute h-[70%] w-px bg-[rgba(185,139,70,0.14)]" />
      <div className="absolute h-px w-[70%] bg-[rgba(185,139,70,0.14)]" />
      <div className="relative rounded-full border border-[rgba(185,139,70,0.4)] bg-white/86 px-6 py-5 text-center shadow-[0_14px_28px_rgba(96,76,48,0.12)]">
        <p className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[color:var(--color-ink-strong)]">
          JPS
        </p>
        <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent-gold-dark)]">
          Desk
        </p>
      </div>
    </div>
  );
}

function SectionBand({
  id,
  children,
  className = "bg-white",
}: Readonly<{
  id?: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section
      id={id}
      className={`border-b border-[rgba(155,122,74,0.16)] ${className}`}
    >
      <Container className="py-10 sm:py-14">{children}</Container>
    </section>
  );
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/tools?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;

  return (
    <>
      <PageViewTracker page="/" feature="home-page-phase-33-1a" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />

      <section
        id="top"
        className="relative overflow-hidden border-b border-[rgba(155,122,74,0.18)] bg-[linear-gradient(180deg,#ffffff_0%,#fbf6ed_100%)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(185,139,70,0.1),transparent_28%),radial-gradient(circle_at_86%_14%,rgba(200,132,62,0.07),transparent_24%),linear-gradient(135deg,rgba(185,139,70,0.04)_0_1px,transparent_1px_18px)]" />
        <Container className="relative grid gap-8 pb-10 pt-8 sm:pb-14 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-center">
          <div className="space-y-7">
            <BrandMark />
            <div className="space-y-4">
              <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.35rem,9vw,5.1rem)] leading-[1.04] text-[color:var(--color-ink-black)]">
                Vedic Astrology in one app-like centre
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                Generate Kundli, open Panchang, read Rashifal, ask NAVAGRAHA
                Intelligence, and move toward reports or consultation through
                safe public routes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href={localizeHref("/kundli")}
                eventName="cta_click"
                eventPayload={{
                  page: "/",
                  feature: "home-hero-generate-kundli",
                  route: "/kundli",
                }}
                className={buttonStyles({
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Kundli
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="cta_click"
                eventPayload={{
                  page: "/",
                  feature: "home-hero-ask-ni",
                  route: "/ai",
                }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Ask NAVAGRAHA Intelligence
              </TrackedLink>
            </div>
            <HeroCommand localizeHref={localizeHref} />
          </div>

          <div className="rounded-[var(--radius-card)] border border-[rgba(155,122,74,0.22)] bg-white/84 p-5 shadow-[0_24px_70px_rgba(96,76,48,0.16)]">
            <div className="grid grid-cols-2 gap-3">
              {firstToolGrid.slice(0, 4).map((item) => (
                <CardLink
                  key={item.title}
                  item={item}
                  localizeHref={localizeHref}
                  compact
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <CategoryTabs localizeHref={localizeHref} />

      <SectionBand id="tools" className="bg-white">
        <SectionHeader
          eyebrow="First tool grid"
          title="Start with the eight highest-intent astrology actions"
          description="The first homepage grid keeps the Phase 32 utilities dominant and links only to safe public routes."
        />
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {firstToolGrid.map((item) => (
            <CardLink
              key={item.title}
              item={item}
              localizeHref={localizeHref}
              compact
            />
          ))}
        </div>
      </SectionBand>

      <SectionBand id="daily" className="bg-[linear-gradient(180deg,#fffefb,#fbf6ed)]">
        <SectionHeader
          eyebrow="Daily guidance"
          title="Daily guidance for repeat visits"
          description="Rashifal, Panchang, Transit, and Muhurat stay visible early while calculation-backed details remain inside their dedicated tools."
        />
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dailyCards.map((item) => (
            <CardLink
              key={item.title}
              item={item}
              localizeHref={localizeHref}
              compact
            />
          ))}
        </div>
      </SectionBand>

      <SectionBand id="navagraha-intelligence" className="bg-white">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <SectionHeader
            eyebrow="NAVAGRAHA Intelligence"
            title="Ask NI as guided Vedic assistance"
            description="NI is presented as a safe AI-guided support layer. It does not replace Joy Prakash Sarmah and does not claim guaranteed outcomes."
          />
          <div className="rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.26)] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(246,232,206,0.92))] p-5 shadow-[var(--shadow-card-soft)]">
            <div className="flex items-start gap-4">
              <VisualIcon icon="ai" />
              <div className="min-w-0 space-y-3">
                <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] leading-[var(--line-height-heading)] text-[color:var(--color-ink-strong)]">
                  Ask NAVAGRAHA Intelligence
                </h3>
                <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Open the existing AI guidance surface for structured,
                  privacy-safe assistance. Kundli, Remedy, Muhurat, Numerology,
                  Vastu, Palmistry, and Matchmaking NI remain future extensions
                  unless separately implemented.
                </p>
                <TrackedLink
                  href={localizeHref("/ai")}
                  eventName="cta_click"
                  eventPayload={{
                    page: "/",
                    feature: "home-ni-primary",
                    route: "/ai",
                  }}
                  className={buttonStyles({
                    size: "md",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Ask NI
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </SectionBand>

      <SectionBand id="authority" className="bg-[linear-gradient(180deg,#ffffff,#fbf6ed)]">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.55fr)] lg:items-center">
          <div className="space-y-5">
            <SectionHeader
              eyebrow="Single human authority"
              title="J P Sarmah Desk"
              description="Guidance by Joy Prakash Sarmah, Single Human Authority Astrologer. This section uses a symbolic authority graphic until a verified portrait is available."
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href={localizeHref("/from-the-desk")}
                eventName="cta_click"
                eventPayload={{
                  page: "/",
                  feature: "home-jps-desk",
                  route: "/from-the-desk",
                }}
                className={buttonStyles({
                  size: "md",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Read J P Sarmah Desk
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/consultation")}
                eventName="consultation_cta_click"
                eventPayload={{
                  page: "/",
                  feature: "home-jps-consultation",
                  route: "/consultation",
                }}
                className={buttonStyles({
                  size: "md",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Book Consultation
              </TrackedLink>
            </div>
          </div>
          <SymbolicAuthorityGraphic />
        </div>
      </SectionBand>

      <SectionBand id="reports" className="bg-white">
        <SectionHeader
          eyebrow="Reports + handmade Kundli"
          title="Premium guidance paths stay clear and honest"
          description="Digital PDF reports route to the reports hub. Handmade Kundli is the strongest premium path and currently routes to consultation for human guidance."
        />
        <div className="mt-7 grid gap-3 lg:grid-cols-3">
          {reportCards.map((item) => (
            <CardLink
              key={item.title}
              item={item}
              localizeHref={localizeHref}
            />
          ))}
        </div>
      </SectionBand>

      <SectionBand id="vedic-services" className="bg-[linear-gradient(180deg,#fffefb,#fbf6ed)]">
        <SectionHeader
          eyebrow="Consultation and Vedic services"
          title="Consultation, Puja, Hawan, Yagya, and reports"
          description="Consultation and digital reports use verified public routes. Puja, Hawan, and Yagya remain framed as planned service pathways until dedicated details are available."
        />
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {serviceCards.map((item) => (
            <CardLink
              key={item.title}
              item={item}
              localizeHref={localizeHref}
              compact
            />
          ))}
        </div>
      </SectionBand>

      <SectionBand id="shop" className="bg-white">
        <SectionHeader
          eyebrow="Vedic shop"
          title="Vedic categories linked to the shop"
          description="Gemstone, Rudraksha, Mala, Bracelet, Kavacham, and Puja Items are presented as category pathways into the existing shop route."
        />
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopCategories.map((item) => (
            <CardLink
              key={item.title}
              item={item}
              localizeHref={localizeHref}
              compact
            />
          ))}
        </div>
      </SectionBand>

      <SectionBand id="learning" className="bg-[linear-gradient(180deg,#ffffff,#fbf6ed)]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] lg:items-stretch">
          <div className="rounded-[var(--radius-card)] border border-[rgba(155,122,74,0.22)] bg-white/92 p-5 shadow-[var(--shadow-card-soft)]">
            <div className="flex items-start gap-4">
              <VisualIcon icon="learning" />
              <div className="space-y-3">
                <SectionHeader
                  eyebrow="Learning modules"
                  title="Learning modules prepared for verified content"
                  description="This homepage reserves a learning lane for future modules and uses the existing article index for verified public content."
                />
                <TrackedLink
                  href={localizeHref("/articles")}
                  eventName="cta_click"
                  eventPayload={{
                    page: "/",
                    feature: "home-learning-articles",
                    route: "/articles",
                  }}
                  className={buttonStyles({
                    size: "md",
                    tone: "secondary",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Open Articles
                </TrackedLink>
              </div>
            </div>
          </div>
          <div
            id="videos"
            className="rounded-[var(--radius-card)] border border-[rgba(155,122,74,0.22)] bg-white/92 p-5 shadow-[var(--shadow-card-soft)]"
          >
            <div className="flex items-start gap-4">
              <VisualIcon icon="video" />
              <div className="space-y-3">
                <Badge tone="trust">YouTube videos</Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] leading-[var(--line-height-heading)] text-[color:var(--color-ink-strong)]">
                  NAVAGRAHA Astrological Centre channel
                </h2>
                <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  The homepage links only to the verified channel URL. Video
                  listings should appear only when real metadata is available.
                </p>
                <a
                  href={youtubeChannelUrl}
                  className={buttonStyles({
                    size: "md",
                    tone: "secondary",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Open YouTube Channel
                </a>
              </div>
            </div>
          </div>
        </div>
      </SectionBand>

      <SectionBand id="articles" className="bg-white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:items-center">
          <SectionHeader
            eyebrow="Latest articles"
            title="Article index for verified content"
            description="This section provides a safe entry to the article index without inventing titles, dates, images, summaries, or author metadata."
          />
          <div className="rounded-[var(--radius-card)] border border-dashed border-[rgba(155,122,74,0.32)] bg-[rgba(255,255,255,0.82)] p-5">
            <div className="flex items-start gap-4">
              <VisualIcon icon="article" />
              <div className="space-y-3">
                <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                  Verified article index
                </h3>
                <p className="text-[0.88rem] leading-6 text-[color:var(--color-ink-body)]">
                  Published content opens through the existing articles route.
                </p>
                <TrackedLink
                  href={localizeHref("/articles")}
                  eventName="cta_click"
                  eventPayload={{
                    page: "/",
                    feature: "home-latest-articles",
                    route: "/articles",
                  }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Read Articles
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </SectionBand>

      <SectionBand className="bg-[linear-gradient(180deg,#fbf6ed,#ffffff)]">
        <div className="rounded-[var(--radius-card)] border border-[rgba(155,122,74,0.22)] bg-white/92 p-5 shadow-[var(--shadow-card-soft)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] lg:items-center">
            <div className="space-y-4">
              <Badge tone="trust">Trust / Legacy / Footer relation</Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--color-ink-strong)]">
                Launch-ready foundation for continued public operation
              </h2>
              <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                This public homepage keeps Phase 33 structure aligned with
                frozen astrology, Panchang, auth, sitemap, robots, ads, and
                backend boundaries.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.22)] bg-[rgba(255,250,240,0.92)] px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-trust-text)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionBand>
    </>
  );
}
