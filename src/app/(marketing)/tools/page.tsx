import type { ReactNode } from "react";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { UtilityIcon } from "@/components/graphics/utility-icons";
import {
  CalculatorIcon,
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
  PanchangIcon,
  RashifalIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "NAVAGRAHA Tools | Vedic Tools Hub",
    description:
      "Open Kundli, Panchang, Rashifal, Dasha, Transit, Matchmaking, Muhurat, Remedies, Reports, Consultation, and Ask NI from the NAVAGRAHA Tools Hub.",
    path: "/tools",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology tools",
      "vedic astrology tools",
      "kundli tools",
      "panchang tools",
      "dasha tools",
      "transit tools",
      "matchmaking tools",
      "muhurat tools",
      "remedy tools",
      "ask ni",
      "navagraha intelligence",
      "astrology reports",
    ],
  });
}

export const revalidate = 3600;

type LocalizeHref = (href: string) => string;

type HubIcon =
  | "ai"
  | "consultation"
  | "dasha"
  | "dosha"
  | "kundli"
  | "learning"
  | "matching"
  | "muhurat"
  | "panchang"
  | "remedies"
  | "report"
  | "rashifal"
  | "transit";

type HubLink = {
  label: string;
  href: string;
  feature: string;
  icon?: HubIcon;
  accent?: string;
};

type HubGroup = {
  id: string;
  title: string;
  items: readonly HubLink[];
};

const categoryRail: readonly { label: string; href: string }[] = [
  { label: "All", href: "#all" },
  { label: "Birth", href: "#birth" },
  { label: "Daily", href: "#daily" },
  { label: "Timing", href: "#timing" },
  { label: "Relationship", href: "#birth" },
  { label: "Dasha", href: "#dasha-transit" },
  { label: "Remedies", href: "#dosha-remedies" },
  { label: "Reports", href: "#reports-consultation" },
  { label: "Learning", href: "#learning" },
] as const;

const featuredTools: readonly HubLink[] = [
  {
    label: "Kundli",
    href: "/kundli",
    feature: "tools-dashboard-featured-kundli",
    icon: "kundli",
    accent: "border-[rgba(185,139,70,0.42)]",
  },
  {
    label: "Panchang",
    href: "/panchang",
    feature: "tools-dashboard-featured-panchang",
    icon: "panchang",
    accent: "border-[rgba(185,139,70,0.42)]",
  },
  {
    label: "Rashifal",
    href: "/rashifal",
    feature: "tools-dashboard-featured-rashifal",
    icon: "rashifal",
    accent: "border-[rgba(185,139,70,0.42)]",
  },
  {
    label: "Dasha",
    href: "/dasha",
    feature: "tools-dashboard-featured-dasha",
    icon: "dasha",
    accent: "border-[rgba(5,5,5,0.34)]",
  },
  {
    label: "Transit",
    href: "/transit",
    feature: "tools-dashboard-featured-transit",
    icon: "transit",
    accent: "border-[rgba(5,5,5,0.34)]",
  },
  {
    label: "Matching",
    href: "/matchmaking",
    feature: "tools-dashboard-featured-matching",
    icon: "matching",
    accent: "border-[rgba(111,28,42,0.34)]",
  },
  {
    label: "Muhurat",
    href: "/muhurat",
    feature: "tools-dashboard-featured-muhurat",
    icon: "muhurat",
    accent: "border-[rgba(206,161,57,0.5)]",
  },
  {
    label: "Remedies",
    href: "/remedies",
    feature: "tools-dashboard-featured-remedies",
    icon: "remedies",
    accent: "border-[rgba(19,122,83,0.42)]",
  },
] as const;

const niChips: readonly HubLink[] = [
  { label: "Kundli", href: "/ai", feature: "tools-dashboard-ni-kundli" },
  { label: "Career", href: "/ai", feature: "tools-dashboard-ni-career" },
  { label: "Marriage", href: "/ai", feature: "tools-dashboard-ni-marriage" },
  { label: "Remedy", href: "/ai", feature: "tools-dashboard-ni-remedy" },
  { label: "Dasha", href: "/ai", feature: "tools-dashboard-ni-dasha" },
  { label: "Transit", href: "/ai", feature: "tools-dashboard-ni-transit" },
] as const;

const toolGroups: readonly HubGroup[] = [
  {
    id: "birth",
    title: "Birth & Kundli",
    items: [
      { label: "Kundli", href: "/kundli", feature: "tools-group-kundli", icon: "kundli" },
      {
        label: "Matchmaking",
        href: "/matchmaking",
        feature: "tools-group-matchmaking",
        icon: "matching",
      },
      { label: "Reports", href: "/reports", feature: "tools-group-birth-reports", icon: "report" },
    ],
  },
  {
    id: "daily",
    title: "Daily Guidance",
    items: [
      { label: "Rashifal", href: "/rashifal", feature: "tools-group-rashifal", icon: "rashifal" },
      { label: "Panchang", href: "/panchang", feature: "tools-group-panchang", icon: "panchang" },
      { label: "Transit", href: "/transit", feature: "tools-group-daily-transit", icon: "transit" },
    ],
  },
  {
    id: "timing",
    title: "Timing & Muhurat",
    items: [
      { label: "Muhurat", href: "/muhurat", feature: "tools-group-muhurat", icon: "muhurat" },
      { label: "Panchang", href: "/panchang", feature: "tools-group-timing-panchang", icon: "panchang" },
    ],
  },
  {
    id: "dasha-transit",
    title: "Dasha & Transit",
    items: [
      { label: "Dasha", href: "/dasha", feature: "tools-group-dasha", icon: "dasha" },
      { label: "Transit", href: "/transit", feature: "tools-group-transit", icon: "transit" },
    ],
  },
  {
    id: "dosha-remedies",
    title: "Dosha & Remedies",
    items: [
      { label: "Dosha-Yoga", href: "/dosha-yoga", feature: "tools-group-dosha-yoga", icon: "dosha" },
      { label: "Remedies", href: "/remedies", feature: "tools-group-remedies", icon: "remedies" },
    ],
  },
  {
    id: "reports-consultation",
    title: "Reports & Consultation",
    items: [
      { label: "Reports", href: "/reports", feature: "tools-group-reports", icon: "report" },
      {
        label: "Consultation",
        href: "/consultation",
        feature: "tools-group-consultation",
        icon: "consultation",
      },
      {
        label: "Handmade Kundli",
        href: "/consultation",
        feature: "tools-group-handmade-kundli",
        icon: "report",
      },
    ],
  },
  {
    id: "learning",
    title: "Learning",
    items: [
      { label: "Articles", href: "/articles", feature: "tools-group-articles", icon: "learning" },
      {
        label: "From the Desk",
        href: "/from-the-desk",
        feature: "tools-group-from-the-desk",
        icon: "learning",
      },
      { label: "Ask NI", href: "/ai", feature: "tools-group-ask-ni", icon: "ai" },
    ],
  },
] as const;

const supportLinks: readonly HubLink[] = [
  {
    label: "J P Sarmah Desk",
    href: "/from-the-desk",
    feature: "tools-support-desk",
    icon: "learning",
  },
  {
    label: "Consultation",
    href: "/consultation",
    feature: "tools-support-consultation",
    icon: "consultation",
  },
  { label: "Ask NI", href: "/ai", feature: "tools-support-ask-ni", icon: "ai" },
] as const;

function localize(localizeHref: LocalizeHref, href: string) {
  return href.startsWith("#") ? href : localizeHref(href);
}

function HubDashboardIcon({
  icon,
  className = "",
}: Readonly<{ icon: HubIcon; className?: string }>) {
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
    case "dosha":
      return (
        <UtilityIcon
          name="calculators"
          className={`border-[rgba(196,54,45,0.34)] bg-[rgba(255,241,238,0.78)] text-[color:var(--color-coral)] ${className}`}
        />
      );
    case "kundli":
      return <KundliIcon className={className} />;
    case "learning":
      return (
        <UtilityIcon
          name="calculators"
          className={`border-[rgba(206,161,57,0.42)] bg-[rgba(251,241,203,0.66)] text-[color:var(--color-yellow-sapphire)] ${className}`}
        />
      );
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
    case "remedies":
      return (
        <UtilityIcon
          name="kundli"
          className={`border-[rgba(19,122,83,0.38)] bg-[rgba(231,246,239,0.78)] text-[color:var(--color-emerald)] ${className}`}
        />
      );
    case "report":
      return (
        <ReportIcon
          className={`border-[rgba(185,139,70,0.36)] bg-[color:var(--color-pearl)] text-[color:var(--color-accent-gold-dark)] ${className}`}
        />
      );
    default:
      return <KundliIcon className={className} />;
  }
}

function RailLink({
  item,
  localizeHref,
  active = false,
}: Readonly<{ item: { label: string; href: string }; localizeHref: LocalizeHref; active?: boolean }>) {
  return (
    <a
      href={localize(localizeHref, item.href)}
      className={`inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold text-[color:var(--color-ink-black)] ${
        active
          ? "border-[rgba(185,139,70,0.5)] bg-[rgba(255,248,231,0.72)]"
          : "border-black/10 bg-white"
      }`}
    >
      {item.label}
    </a>
  );
}

function ScrollHint({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative">
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/90 to-transparent"
      />
    </div>
  );
}

function ToolTile({ item, localizeHref }: Readonly<{ item: HubLink; localizeHref: LocalizeHref }>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="utility_card_click"
      eventPayload={{ page: "/tools", feature: item.feature }}
      className={`group flex min-h-[6.7rem] min-w-0 max-w-full flex-col items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border ${item.accent} bg-white px-2.5 py-3.5 text-center shadow-[0_10px_24px_rgba(5,5,5,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(5,5,5,0.08)] sm:min-h-[7.35rem] sm:gap-3 sm:py-4`}
    >
      <HubDashboardIcon icon={item.icon ?? "kundli"} className="h-11 w-11 sm:h-12 sm:w-12" />
      <span className="max-w-full whitespace-nowrap text-[0.78rem] font-semibold leading-tight text-[color:var(--color-ink-black)] sm:text-sm">
        {item.label}
      </span>
    </TrackedLink>
  );
}

function GroupItem({ item, localizeHref }: Readonly<{ item: HubLink; localizeHref: LocalizeHref }>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="utility_card_click"
      eventPayload={{ page: "/tools", feature: item.feature }}
      className="flex min-w-0 items-center gap-3 rounded-[var(--radius-lg)] border border-black/10 bg-white p-3 text-[color:var(--color-ink-black)] shadow-[0_8px_18px_rgba(5,5,5,0.04)] transition hover:border-[rgba(185,139,70,0.42)]"
    >
      <HubDashboardIcon icon={item.icon ?? "kundli"} className="h-10 w-10 shrink-0" />
      <span className="min-w-0 truncate text-sm font-semibold">{item.label}</span>
    </TrackedLink>
  );
}

export default async function ToolsHubPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });

  return (
    <>
      <PageViewTracker page="/tools" feature="tools-hub-page" />
      <AnalyticsEventTracker
        event="tools_hub_view"
        payload={{ page: "/tools", feature: "tools-hub-dashboard" }}
      />

      <main className="launch-page launch-page-tools bg-white">
        <section id="all" className="border-b border-black/10 bg-white">
          <Container className="space-y-7 pb-7 pt-5 sm:pb-9 sm:pt-8 lg:space-y-9 lg:pb-12 lg:pt-10">
            <ScrollHint>
              <nav
                aria-label="Tools categories"
                className="-mx-4 max-w-[calc(100%+2rem)] overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex w-max max-w-none gap-2 pr-16 sm:flex-wrap sm:pr-0">
                  {categoryRail.map((item, index) => (
                    <RailLink
                      key={item.label}
                      item={item}
                      localizeHref={localizeHref}
                      active={index === 0}
                    />
                  ))}
                </div>
              </nav>
            </ScrollHint>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-[color:var(--color-accent-gold-dark)]">
                NAVAGRAHA Tools
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[color:var(--color-ink-black)] sm:text-4xl lg:text-5xl">
                Vedic Tools Hub
              </h1>
              <p className="text-base font-medium text-[color:var(--color-ink-body)]">
                Kundli &bull; Panchang &bull; Dasha &bull; Ask NI
              </p>
            </div>

            <div className="grid min-w-0 max-w-full grid-cols-3 gap-2.5 min-[390px]:grid-cols-4 sm:gap-3 lg:grid-cols-8">
              {featuredTools.map((tool) => (
                <ToolTile key={tool.label} item={tool} localizeHref={localizeHref} />
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/10 bg-white">
          <Container className="py-7 max-[389px]:pt-20 sm:py-9 lg:py-11">
            <TrackedLink
              href={localizeHref("/ai")}
              eventName="premium_ai_cta_click"
              eventPayload={{ page: "/tools", feature: "tools-dashboard-ask-ni-strip" }}
              className="block max-w-full rounded-[var(--radius-xl)] border border-[rgba(185,139,70,0.46)] bg-[color:var(--color-onyx)] p-3.5 text-white shadow-[0_18px_34px_rgba(5,5,5,0.16)] sm:p-5"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <NavagrahaAiIcon className="h-11 w-11 shrink-0 border-[rgba(0,214,255,0.62)] bg-[rgba(0,214,255,0.12)] text-[color:var(--color-ni-cyan)] sm:h-12 sm:w-12" />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-[color:var(--color-ni-cyan)]">
                      Ask NI
                    </p>
                    <p className="text-sm font-medium text-white">NAVAGRAHA Intelligence</p>
                  </div>
                </div>

                <div className="flex min-w-0 max-w-full flex-wrap gap-1.5 sm:gap-2 sm:justify-end">
                  {niChips.map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex min-h-8 shrink-0 items-center rounded-full border border-[rgba(0,214,255,0.34)] bg-[rgba(0,214,255,0.08)] px-3 text-sm font-semibold text-white sm:min-h-9"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>
            </TrackedLink>
          </Container>
        </section>

        <section className="border-b border-black/10 bg-white">
          <Container className="space-y-5 py-8 sm:py-10 lg:py-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[color:var(--color-ink-black)] sm:text-3xl">
                Tool Groups
              </h2>
              <span className="hidden text-sm font-semibold text-[color:var(--color-accent-gold-dark)] sm:inline">
                Direct access
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {toolGroups.map((group) => (
                <section
                  id={group.id}
                  key={group.id}
                  className="scroll-mt-24 rounded-[var(--radius-xl)] border border-black/10 bg-white p-4 shadow-[0_12px_26px_rgba(5,5,5,0.04)]"
                >
                  <h3 className="text-base font-semibold text-[color:var(--color-ink-black)]">
                    {group.title}
                  </h3>
                  <div className="mt-3 grid gap-2">
                    {group.items.map((item) => (
                      <GroupItem key={`${group.id}-${item.label}`} item={item} localizeHref={localizeHref} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pb-24">
            <div className="rounded-[var(--radius-xl)] border border-[rgba(111,28,42,0.22)] bg-white p-4 shadow-[0_14px_30px_rgba(5,5,5,0.05)] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[color:var(--color-ink-black)]">
                    J P Sarmah Desk
                  </h2>
                  <p className="max-w-2xl text-sm font-medium text-[color:var(--color-ink-body)]">
                    Human guidance stays separate from NAVAGRAHA Intelligence.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[28rem]">
                  {supportLinks.map((item) => (
                    <GroupItem key={item.label} item={item} localizeHref={localizeHref} />
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
