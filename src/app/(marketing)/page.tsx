import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  CalculatorIcon,
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
  PanchangIcon,
  RashifalIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { UtilityIcon } from "@/components/graphics/utility-icons";
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

type LocalizeHref = (href: string) => string;

type IconKey =
  | "ai"
  | "article"
  | "authority"
  | "consultation"
  | "dasha"
  | "kundli"
  | "matching"
  | "muhurat"
  | "panchang"
  | "remedies"
  | "report"
  | "rashifal"
  | "shop"
  | "transit"
  | "video";

type ToolTile = {
  label: string;
  href: string;
  icon: IconKey;
  accent: string;
  feature: string;
};

type RailItem = {
  label: string;
  href: string;
  feature: string;
};

const categoryRail: readonly RailItem[] = [
  { label: "Home", href: "/", feature: "home-rail-home" },
  { label: "Tools", href: "/tools", feature: "home-rail-tools" },
  { label: "Reports", href: "/reports", feature: "home-rail-reports" },
  { label: "Consult", href: "/consultation", feature: "home-rail-consult" },
  { label: "Shop", href: "/shop", feature: "home-rail-shop" },
  { label: "Learn", href: "/articles", feature: "home-rail-learn" },
] as const;

const toolTiles: readonly ToolTile[] = [
  {
    label: "Kundli",
    href: "/kundli",
    icon: "kundli",
    accent: "border-[rgba(185,139,70,0.42)]",
    feature: "home-dashboard-tool-kundli",
  },
  {
    label: "Panchang",
    href: "/panchang",
    icon: "panchang",
    accent: "border-[rgba(185,139,70,0.42)]",
    feature: "home-dashboard-tool-panchang",
  },
  {
    label: "Rashifal",
    href: "/rashifal",
    icon: "rashifal",
    accent: "border-[rgba(185,139,70,0.42)]",
    feature: "home-dashboard-tool-rashifal",
  },
  {
    label: "Dasha",
    href: "/dasha",
    icon: "dasha",
    accent: "border-[rgba(5,5,5,0.34)]",
    feature: "home-dashboard-tool-dasha",
  },
  {
    label: "Transit",
    href: "/transit",
    icon: "transit",
    accent: "border-[rgba(5,5,5,0.34)]",
    feature: "home-dashboard-tool-transit",
  },
  {
    label: "Matching",
    href: "/matchmaking",
    icon: "matching",
    accent: "border-[rgba(111,28,42,0.34)]",
    feature: "home-dashboard-tool-matchmaking",
  },
  {
    label: "Muhurat",
    href: "/muhurat",
    icon: "muhurat",
    accent: "border-[rgba(206,161,57,0.5)]",
    feature: "home-dashboard-tool-muhurat",
  },
  {
    label: "Remedies",
    href: "/remedies",
    icon: "remedies",
    accent: "border-[rgba(19,122,83,0.42)]",
    feature: "home-dashboard-tool-remedies",
  },
] as const;

const niChips: readonly RailItem[] = [
  { label: "Career", href: "/ai", feature: "home-ni-chip-career" },
  { label: "Marriage", href: "/ai", feature: "home-ni-chip-marriage" },
  { label: "Remedy", href: "/ai", feature: "home-ni-chip-remedy" },
  { label: "Dasha", href: "/ai", feature: "home-ni-chip-dasha" },
  { label: "Transit", href: "/ai", feature: "home-ni-chip-transit" },
] as const;

const reportItems: readonly RailItem[] = [
  { label: "PDF Reports", href: "/reports", feature: "home-reports-pdf" },
  {
    label: "Handmade Kundli",
    href: "/consultation",
    feature: "home-reports-handmade-kundli",
  },
] as const;

const authorityItems: readonly RailItem[] = [
  { label: "Articles", href: "/articles", feature: "home-jps-articles" },
  {
    label: "Consultation",
    href: "/consultation",
    feature: "home-jps-consultation",
  },
  {
    label: "From the Desk",
    href: "/from-the-desk",
    feature: "home-jps-from-the-desk",
  },
] as const;

const learningItems: readonly RailItem[] = [
  { label: "Latest Articles", href: "/articles", feature: "home-learn-articles" },
  { label: "Videos", href: youtubeChannelUrl, feature: "home-learn-videos" },
  { label: "Learning", href: "/articles", feature: "home-learn-learning" },
] as const;

const shopItems: readonly RailItem[] = [
  { label: "Gemstone", href: "/shop", feature: "home-shop-gemstone" },
  { label: "Rudraksha", href: "/shop", feature: "home-shop-rudraksha" },
  { label: "Mala", href: "/shop", feature: "home-shop-mala" },
  { label: "Bracelet", href: "/shop", feature: "home-shop-bracelet" },
  { label: "Kavacham", href: "/shop", feature: "home-shop-kavacham" },
  { label: "Puja Items", href: "/shop", feature: "home-shop-puja-items" },
] as const;

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function routeFor(href: string, localizeHref: LocalizeHref) {
  return isExternalHref(href) ? href : localizeHref(href);
}

function DashboardIcon({
  icon,
  className = "",
}: Readonly<{ icon: IconKey; className?: string }>) {
  switch (icon) {
    case "ai":
      return (
        <NavagrahaAiIcon
          className={`border-[rgba(0,214,255,0.52)] bg-[rgba(0,214,255,0.1)] text-[color:var(--color-ni-cyan)] ${className}`}
        />
      );
    case "consultation":
      return (
        <ConsultationIcon
          className={`border-[rgba(111,28,42,0.36)] bg-[rgba(111,28,42,0.08)] text-[color:var(--color-ruby-maroon)] ${className}`}
        />
      );
    case "dasha":
    case "transit":
      return (
        <CalculatorIcon
          className={`border-[rgba(5,5,5,0.22)] bg-white text-[color:var(--color-ink-black)] ${className}`}
        />
      );
    case "kundli":
      return <KundliIcon className={className} />;
    case "matching":
      return (
        <UtilityIcon
          name="compatibility"
          className={`border-[rgba(111,28,42,0.28)] bg-white text-[color:var(--color-ruby-maroon)] ${className}`}
        />
      );
    case "muhurat":
      return (
        <UtilityIcon
          name="muhurta"
          className={`border-[rgba(206,161,57,0.5)] bg-[rgba(251,241,203,0.72)] text-[color:var(--color-yellow-sapphire)] ${className}`}
        />
      );
    case "panchang":
      return <PanchangIcon className={className} />;
    case "rashifal":
      return <RashifalIcon className={className} />;
    case "report":
      return (
        <ReportIcon
          className={`border-[rgba(185,139,70,0.36)] bg-[color:var(--color-pearl)] text-[color:var(--color-accent-gold-dark)] ${className}`}
        />
      );
    case "remedies":
      return (
        <span
          aria-hidden="true"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(19,122,83,0.36)] bg-[rgba(19,122,83,0.08)] text-[color:var(--color-emerald)] shadow-[var(--shadow-xs)] ${className}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
            className="h-6 w-6"
          >
            <path d="M12 20V9" />
            <path d="M12 14c-4.2 0-6.8-2.2-7.4-6.3C8.7 7.4 11.3 9.2 12 14z" />
            <path d="M12 12.8c.8-4.1 3.3-6 7.4-6.3C18.8 10.7 16.2 12.8 12 12.8z" />
          </svg>
        </span>
      );
    default:
      return (
        <span
          aria-hidden="true"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(185,139,70,0.28)] bg-white text-[0.68rem] font-semibold text-[color:var(--color-ink-black)] shadow-[var(--shadow-xs)] ${className}`}
        >
          {icon === "video"
            ? "VID"
            : icon === "shop"
              ? "SH"
              : icon === "authority"
                ? "JPS"
                : "NC"}
        </span>
      );
  }
}

function RailLink({
  item,
  localizeHref,
  active = false,
  className = "",
}: Readonly<{
  item: RailItem;
  localizeHref: LocalizeHref;
  active?: boolean;
  className?: string;
}>) {
  const href = routeFor(item.href, localizeHref);
  const classes = [
    "inline-flex min-h-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border bg-white px-3 text-center text-[0.68rem] font-semibold uppercase tracking-[0.08em] whitespace-nowrap text-[color:var(--color-ink-black)] transition hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.58)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:px-4 sm:text-[0.72rem] sm:tracking-[0.1em]",
    active
      ? "border-[rgba(185,139,70,0.58)] shadow-[inset_0_-2px_0_var(--color-antique-gold)]"
      : "border-[rgba(185,139,70,0.22)] shadow-[0_8px_18px_rgba(5,5,5,0.04)]",
    className,
  ].join(" ");

  if (isExternalHref(item.href)) {
    return (
      <a href={href} className={classes}>
        {item.label}
      </a>
    );
  }

  return (
    <TrackedLink
      href={href}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className={classes}
    >
      {item.label}
    </TrackedLink>
  );
}

function CategoryRail({ localizeHref }: Readonly<{ localizeHref: LocalizeHref }>) {
  return (
    <section className="border-b border-[rgba(185,139,70,0.18)] bg-white">
      <Container className="py-3">
        <nav
          aria-label="Homepage dashboard rail"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pr-7 [scrollbar-width:none] [scroll-padding-inline:1rem] sm:mx-0 sm:px-0 sm:pr-0 sm:[scroll-padding-inline:0px] [&::-webkit-scrollbar]:hidden"
        >
          {categoryRail.map((item) => (
            <RailLink
              key={item.label}
              item={item}
              localizeHref={localizeHref}
              active={item.href === "/"}
            />
          ))}
        </nav>
      </Container>
    </section>
  );
}

function ToolTileLink({
  tile,
  localizeHref,
}: Readonly<{ tile: ToolTile; localizeHref: LocalizeHref }>) {
  return (
    <TrackedLink
      href={localizeHref(tile.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: tile.feature, route: tile.href }}
      className={`group flex min-h-[6.25rem] min-w-0 flex-col items-center justify-center gap-2.5 rounded-[1.25rem] border ${tile.accent} bg-white px-2 py-4 text-center shadow-[0_12px_28px_rgba(5,5,5,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(5,5,5,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:min-h-[6.3rem] sm:gap-3 sm:px-2.5`}
    >
      <DashboardIcon icon={tile.icon} />
      <span className="max-w-full break-normal text-[0.69rem] font-semibold leading-tight tracking-[0.01em] text-[color:var(--color-ink-black)] [overflow-wrap:normal] sm:text-[0.76rem] sm:tracking-[0.03em]">
        {tile.label}
      </span>
    </TrackedLink>
  );
}

function DashboardTitleBlock() {
  return (
    <section
      id="top"
      className="border-b border-[rgba(185,139,70,0.18)] bg-white"
    >
      <Container className="py-7 sm:py-9">
        <div className="flex min-w-0 items-center gap-4">
          {hasBrandLogo ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[rgba(185,139,70,0.42)] bg-black shadow-[0_14px_30px_rgba(5,5,5,0.14)]">
              <Image
                src="/brand/navagraha-om-logo.png"
                alt="NAVAGRAHA CENTRE golden Om mandala logo"
                fill
                priority
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(185,139,70,0.42)] bg-white text-sm font-semibold text-[color:var(--color-ink-black)]">
              NC
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-antique-gold)]">
              NAVAGRAHA CENTRE
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2.05rem,9vw,4.25rem)] leading-[0.95] text-[color:var(--color-ink-black)]">
              Vedic Astrology App Dashboard
            </h1>
            <p className="mt-3 text-[0.88rem] font-semibold text-[color:var(--color-ink-black)]">
              Kundli &bull; Panchang &bull; Rashifal &bull; Ask NI
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ToolIconGrid({ localizeHref }: Readonly<{ localizeHref: LocalizeHref }>) {
  return (
    <section className="bg-white">
      <Container className="py-7 sm:py-9">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
          {toolTiles.map((tile) => (
            <ToolTileLink
              key={tile.label}
              tile={tile}
              localizeHref={localizeHref}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function AskNiStrip({ localizeHref }: Readonly<{ localizeHref: LocalizeHref }>) {
  return (
    <section className="bg-white">
      <Container className="pb-7 sm:pb-9">
        <TrackedLink
          href={localizeHref("/ai")}
          eventName="cta_click"
          eventPayload={{ page: "/", feature: "home-ni-strip", route: "/ai" }}
          className="block rounded-[1.6rem] border border-[rgba(185,139,70,0.52)] bg-[color:var(--color-onyx)] p-4 text-white shadow-[0_18px_40px_rgba(5,5,5,0.22)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ni-cyan)] sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <DashboardIcon icon="ai" />
              <div className="min-w-0">
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ni-cyan)]">
                  Ask NI
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-[1.35rem] leading-tight text-white sm:text-[1.65rem]">
                  NAVAGRAHA Intelligence
                </h2>
              </div>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pr-5 [scrollbar-width:none] [scroll-padding-inline:0.25rem] sm:mx-0 sm:px-0 sm:pr-1 sm:[scroll-padding-inline:0px] [&::-webkit-scrollbar]:hidden">
              {niChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-[rgba(0,214,255,0.34)] bg-[rgba(0,214,255,0.08)] px-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-ni-cyan)]"
                >
                  {chip.label}
                </span>
              ))}
              <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
            </div>
          </div>
        </TrackedLink>
      </Container>
    </section>
  );
}

function ShowcaseCard({
  eyebrow,
  title,
  icon,
  items,
  localizeHref,
  className,
}: Readonly<{
  eyebrow: string;
  title: string;
  icon: IconKey;
  items: readonly RailItem[];
  localizeHref: LocalizeHref;
  className: string;
}>) {
  return (
    <section className="bg-white">
      <Container className="pb-7 sm:pb-9">
        <div
          className={`rounded-[1.6rem] border p-4 shadow-[0_16px_34px_rgba(5,5,5,0.06)] sm:p-5 ${className}`}
        >
          <div className="flex items-start gap-3">
            <DashboardIcon icon={icon} />
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent-gold-dark)]">
                {eyebrow}
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.55rem] leading-tight text-[color:var(--color-ink-black)]">
                {title}
              </h2>
            </div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item) => (
              <RailLink
                key={item.label}
                item={item}
                localizeHref={localizeHref}
                className="min-w-[9.25rem]"
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function AuthorityCard({ localizeHref }: Readonly<{ localizeHref: LocalizeHref }>) {
  return (
    <section className="bg-white">
      <Container className="pb-7 sm:pb-9">
        <div className="rounded-[1.6rem] border border-[rgba(111,28,42,0.32)] bg-[linear-gradient(135deg,#ffffff,rgba(111,28,42,0.07))] p-4 shadow-[0_16px_34px_rgba(111,28,42,0.08)] sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-center">
            <div className="flex items-start gap-3">
              <DashboardIcon icon="authority" />
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ruby-maroon)]">
                  Human authority
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.6rem] leading-tight text-[color:var(--color-ink-black)]">
                  J P Sarmah Desk
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--color-ink-black)]">
                  Joy Prakash Sarmah is the human authority. Ask NI is AI-guided assistance.
                </p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {authorityItems.map((item) => (
                <RailLink
                  key={item.label}
                  item={item}
                  localizeHref={localizeHref}
                  className="min-w-[9.25rem]"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ShopCategoryRail({ localizeHref }: Readonly<{ localizeHref: LocalizeHref }>) {
  return (
    <section className="bg-white pb-8 sm:pb-10">
      <Container>
        <div className="rounded-[1.6rem] border border-[rgba(185,139,70,0.22)] bg-white p-4 shadow-[0_16px_34px_rgba(5,5,5,0.05)] sm:p-5">
          <div className="flex items-start gap-3">
            <DashboardIcon icon="shop" />
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent-gold-dark)]">
                Shop rail
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.5rem] leading-tight text-[color:var(--color-ink-black)]">
                Vedic categories
              </h2>
            </div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shopItems.map((item) => (
              <RailLink
                key={item.label}
                item={item}
                localizeHref={localizeHref}
                className="min-w-[8.75rem]"
              />
            ))}
          </div>
        </div>
      </Container>
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
      <PageViewTracker page="/" feature="home-page-dashboard-34-2a" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />

      <main className="launch-page launch-page-home min-w-0 bg-white pb-20 text-[color:var(--color-ink-black)]">
        <CategoryRail localizeHref={localizeHref} />
        <DashboardTitleBlock />
        <ToolIconGrid localizeHref={localizeHref} />
        <AskNiStrip localizeHref={localizeHref} />
        <ShowcaseCard
          eyebrow="Reports"
          title="Reports & Handmade Kundli"
          icon="report"
          items={reportItems}
          localizeHref={localizeHref}
          className="border-[rgba(185,139,70,0.28)] bg-[linear-gradient(135deg,var(--color-pearl),#ffffff)]"
        />
        <AuthorityCard localizeHref={localizeHref} />
        <ShowcaseCard
          eyebrow="Learning"
          title="Articles & Videos"
          icon="article"
          items={learningItems}
          localizeHref={localizeHref}
          className="border-[rgba(206,161,57,0.34)] bg-[linear-gradient(135deg,#ffffff,rgba(251,241,203,0.42))]"
        />
        <ShopCategoryRail localizeHref={localizeHref} />
      </main>
    </>
  );
}
