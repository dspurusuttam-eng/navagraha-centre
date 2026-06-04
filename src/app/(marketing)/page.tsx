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

type AskNiUtilityItem = RailItem & {
  icon: IconKey;
  accent: string;
};

const categoryRail: readonly RailItem[] = [
  { label: "Home", href: "/", feature: "home-rail-home" },
  { label: "Tools", href: "/tools", feature: "home-rail-tools" },
  { label: "Reports", href: "/reports", feature: "home-rail-reports" },
  { label: "Consult", href: "/consultation", feature: "home-rail-consult" },
  { label: "Shop", href: "/shop", feature: "home-rail-shop" },
  { label: "Learn", href: "/articles", feature: "home-rail-learn" },
] as const;

const symbolTiles: readonly ToolTile[] = [
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
    label: "Ask NI",
    href: "/ai",
    icon: "ai",
    accent: "border-[rgba(0,214,255,0.38)]",
    feature: "home-dashboard-tool-ai",
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
    label: "Remedies",
    href: "/remedies",
    icon: "remedies",
    accent: "border-[rgba(19,122,83,0.42)]",
    feature: "home-dashboard-tool-remedies",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "report",
    accent: "border-[rgba(185,139,70,0.3)]",
    feature: "home-dashboard-tool-reports",
  },
  {
    label: "Shop",
    href: "/shop",
    icon: "shop",
    accent: "border-[rgba(185,139,70,0.3)]",
    feature: "home-dashboard-tool-shop",
  },
  {
    label: "Consult",
    href: "/consultation",
    icon: "consultation",
    accent: "border-[rgba(111,28,42,0.28)]",
    feature: "home-dashboard-tool-consult",
  },
] as const;

const askNiUtilities: readonly AskNiUtilityItem[] = [
  {
    label: "Kundli",
    href: "/ai",
    feature: "home-ni-chip-kundli",
    icon: "kundli",
    accent: "border-[rgba(185,139,70,0.34)]",
  },
  {
    label: "Today",
    href: "/ai",
    feature: "home-ni-chip-today",
    icon: "panchang",
    accent: "border-[rgba(185,139,70,0.28)]",
  },
  {
    label: "Muhurat",
    href: "/ai",
    feature: "home-ni-chip-muhurat",
    icon: "muhurat",
    accent: "border-[rgba(206,161,57,0.34)]",
  },
  {
    label: "Remedy",
    href: "/ai",
    feature: "home-ni-chip-remedy",
    icon: "remedies",
    accent: "border-[rgba(19,122,83,0.34)]",
  },
  {
    label: "Match",
    href: "/ai",
    feature: "home-ni-chip-match",
    icon: "matching",
    accent: "border-[rgba(111,28,42,0.34)]",
  },
  {
    label: "Career",
    href: "/ai",
    feature: "home-ni-chip-career",
    icon: "report",
    accent: "border-[rgba(0,214,255,0.42)]",
  },
  {
    label: "Report",
    href: "/ai",
    feature: "home-ni-chip-report",
    icon: "report",
    accent: "border-[rgba(185,139,70,0.3)]",
  },
  {
    label: "Spiritual",
    href: "/ai",
    feature: "home-ni-chip-spiritual",
    icon: "remedies",
    accent: "border-[rgba(19,122,83,0.34)]",
  },
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
  { label: "Articles", href: "/articles", feature: "home-learn-articles" },
  { label: "Videos", href: youtubeChannelUrl, feature: "home-learn-videos" },
  { label: "Acharya", href: "/from-the-desk", feature: "home-learn-acharya" },
  { label: "NI Module", href: "/ai", feature: "home-learn-ni-module" },
] as const;

const shopItems: ReadonlyArray<
  RailItem & { icon: IconKey; accent: string }
> = [
  { label: "Gemstone", href: "/shop", feature: "home-shop-gemstone", icon: "shop", accent: "border-[rgba(185,139,70,0.28)]" },
  { label: "Rudraksha", href: "/shop", feature: "home-shop-rudraksha", icon: "remedies", accent: "border-[rgba(19,122,83,0.34)]" },
  { label: "Mala", href: "/shop", feature: "home-shop-mala", icon: "remedies", accent: "border-[rgba(185,139,70,0.28)]" },
  { label: "Kavacham", href: "/shop", feature: "home-shop-kavacham", icon: "shop", accent: "border-[rgba(185,139,70,0.28)]" },
  { label: "Yantra", href: "/shop", feature: "home-shop-yantra", icon: "kundli", accent: "border-[rgba(185,139,70,0.34)]" },
  { label: "Bracelet", href: "/shop", feature: "home-shop-bracelet", icon: "shop", accent: "border-[rgba(111,28,42,0.28)]" },
  { label: "Puja/Yagya", href: "/shop", feature: "home-shop-puja-items", icon: "muhurat", accent: "border-[rgba(206,161,57,0.34)]" },
  { label: "Reports", href: "/reports", feature: "home-shop-reports", icon: "report", accent: "border-[rgba(185,139,70,0.3)]" },
  { label: "Patrika", href: "/consultation", feature: "home-shop-patrika", icon: "kundli", accent: "border-[rgba(185,139,70,0.34)]" },
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
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(19,122,83,0.36)] bg-[rgba(19,122,83,0.08)] text-[color:var(--color-emerald)] ${className}`}
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
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(185,139,70,0.28)] bg-white text-[0.68rem] font-semibold text-[color:var(--color-ink-black)] ${className}`}
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
      ? "border-[rgba(185,139,70,0.58)] bg-[rgba(251,241,203,0.22)]"
      : "border-[rgba(185,139,70,0.22)]",
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
    <section className="hidden border-b border-[rgba(185,139,70,0.18)] bg-white md:block">
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
      className="group flex min-h-[6.9rem] min-w-0 snap-start snap-always flex-col items-center justify-center gap-2 rounded-[0.95rem] border border-[rgba(185,139,70,0.14)] bg-white px-2 py-3 text-center transition hover:border-[rgba(185,139,70,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:min-h-[7.25rem] sm:gap-2.5 sm:px-2.5"
    >
      <RailGlyph icon={tile.icon} accent={tile.accent} />
      <span className="max-w-full break-normal text-[0.56rem] font-semibold leading-tight tracking-[0.03em] text-[color:var(--color-ink-black)] [overflow-wrap:normal] sm:text-[0.68rem] sm:tracking-[0.05em]">
        {tile.label}
      </span>
    </TrackedLink>
  );
}

function NavagrahaOrbitPanel() {
  const orbitNodes = Array.from({ length: 9 }, (_, index) => {
    const angle = (index / 9) * Math.PI * 2 - Math.PI / 2;
    const radius = 72;
    const x = 88 + Math.cos(angle) * radius;
    const y = 88 + Math.sin(angle) * radius;

    return { index, x, y };
  });

  return (
    <div className="hidden min-w-0 rounded-[1.55rem] border border-[rgba(185,139,70,0.18)] bg-white p-4 lg:block">
      <div className="grid grid-cols-[11rem_minmax(0,1fr)] items-center gap-4">
        <div
          aria-hidden="true"
          className="relative h-44 w-44 rounded-full border border-[rgba(185,139,70,0.3)] bg-white"
        >
          <span className="absolute inset-5 rounded-full border border-[rgba(5,5,5,0.18)]" />
          <span className="absolute inset-[3.35rem] rounded-full border border-[rgba(185,139,70,0.36)]" />
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(185,139,70,0.5)] bg-[color:var(--color-ink-black)]" />
          {orbitNodes.map((node) => (
            <span
              key={node.index}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(185,139,70,0.52)] bg-white"
              style={{ left: node.x, top: node.y }}
            />
          ))}
          <span className="absolute left-1/2 top-[1.4rem] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[color:var(--color-emerald)]" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-antique-gold-dark)]">
            Navagraha Orbit
          </p>
          <p className="mt-3 text-sm font-medium leading-6 text-[color:var(--color-ink-black)]">
            Daily guidance begins with Panchang, Moon sign context,
            planetary movement and human-led interpretation.
          </p>
          <div className="mt-4 grid gap-2">
            <span className="h-px bg-[rgba(185,139,70,0.24)]" />
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-black)]">
              J P Sarmah guided
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RailGlyph({
  icon,
  accent,
  size = "md",
}: Readonly<{ icon: IconKey; accent: string; size?: "md" | "sm" }>) {
  const frame = [
    size === "sm"
      ? "inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white text-[color:var(--color-ink-black)] transition-transform duration-300 group-hover:scale-[1.03]"
      : "inline-flex h-12 w-12 items-center justify-center rounded-full border bg-white text-[color:var(--color-ink-black)] transition-transform duration-300 group-hover:scale-[1.03]",
    accent,
  ].join(" ");
  const glyphClassName = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  switch (icon) {
    case "kundli":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(255,252,242,1)_0%,rgba(251,241,203,0.92)_58%,rgba(236,214,151,0.7)_100%)] text-[color:var(--color-accent-gold-dark)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <rect x="4" y="4" width="16" height="16" rx="2.25" />
            <path d="M4 12h16M12 4v16M4 4l16 16M20 4L4 20" />
            <path d="M12 8.5l.55 1.1 1.2.2-.86.82.2 1.14-1.09-.58-1.09.58.2-1.14-.86-.82 1.2-.2z" />
          </svg>
        </span>
      );
    case "panchang":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,1)_0%,rgba(252,246,228,0.96)_58%,rgba(238,219,169,0.72)_100%)] text-[color:var(--color-yellow-sapphire)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <rect x="4.5" y="5.2" width="15" height="13.6" rx="2.1" />
            <path d="M7.8 3.9v2.6M16.2 3.9v2.6M4.5 9.2h15" />
            <path d="M12 13.2a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6z" />
            <path d="M12 10.2l1.65.95" />
          </svg>
        </span>
      );
    case "rashifal":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(252,246,255,1)_0%,rgba(233,222,255,0.92)_58%,rgba(200,180,255,0.72)_100%)] text-[#7b61d6]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <circle cx="12" cy="12" r="8.1" />
            <circle cx="12" cy="12" r="5.1" />
            <path d="M12 3.9v1.8M12 18.3v1.8M3.9 12h1.8M18.3 12h1.8M6.3 6.3l1.25 1.25M16.45 16.45l1.25 1.25M17.7 6.3l-1.25 1.25M7.55 16.45l-1.25 1.25" />
          </svg>
        </span>
      );
    case "ai":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(240,255,252,1)_0%,rgba(204,250,242,0.94)_58%,rgba(163,236,221,0.72)_100%)] text-[color:var(--color-ni-cyan)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <circle cx="12" cy="12" r="6.8" />
            <path d="M12 4.2v2.2M12 17.6v2.2M4.2 12h2.2M17.6 12h2.2" />
            <path d="M12 8.1l.9 1.7 1.7.4-1.25 1.2.28 1.7-1.63-.86-1.63.86.28-1.7-1.25-1.2 1.7-.4z" />
          </svg>
        </span>
      );
    case "matching":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(255,246,248,1)_0%,rgba(255,219,227,0.94)_58%,rgba(246,181,196,0.72)_100%)] text-[color:var(--color-ruby-maroon)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <circle cx="8.2" cy="9" r="3.1" />
            <circle cx="15.8" cy="9" r="3.1" />
            <path d="M6.1 18.2c.7-2.4 2.4-3.7 4.1-3.7s3.4 1.3 4.1 3.7" />
            <path d="M8.2 9.1h7.6" />
            <path d="M10.7 13.6h2.6" />
          </svg>
        </span>
      );
    case "muhurat":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(255,250,235,1)_0%,rgba(251,229,181,0.94)_58%,rgba(241,196,98,0.72)_100%)] text-[color:var(--color-yellow-sapphire)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <path d="M12 4.2v3.2" />
            <path d="M9.2 11c0-2.1 1.2-3.5 2.8-3.5s2.8 1.4 2.8 3.5c0 1.9-1.2 3-2.8 3s-2.8-1.1-2.8-3z" />
            <path d="M8.2 19h7.6" />
            <path d="M9.7 16.9c.65.22 1.35.34 2.3.34s1.65-.12 2.3-.34" />
          </svg>
        </span>
      );
    case "dasha":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(240,248,255,1)_0%,rgba(208,227,255,0.94)_58%,rgba(147,180,255,0.72)_100%)] text-[color:var(--color-ink-black)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <path d="M5 12h14" />
            <path d="M7 9.2V14.8" />
            <path d="M11 7.8V16.2" />
            <path d="M15 9.2V14.8" />
            <circle cx="12" cy="12" r="7.6" />
          </svg>
        </span>
      );
    case "transit":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(239,255,251,1)_0%,rgba(206,243,239,0.94)_58%,rgba(145,213,205,0.72)_100%)] text-[color:var(--color-emerald)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M4.2 12a7.8 7.8 0 0 1 15.6 0" />
            <path d="M12 4.2v2.6" />
            <path d="M17.5 8.5l-1.8 1" />
          </svg>
        </span>
      );
    case "remedies":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(240,255,247,1)_0%,rgba(212,245,226,0.94)_58%,rgba(191,225,202,0.72)_100%)] text-[color:var(--color-emerald)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <path d="M12 20V9" />
            <path d="M12 14c-4.2 0-6.8-2.2-7.4-6.3C8.7 7.4 11.3 9.2 12 14z" />
            <path d="M12 12.8c.8-4.1 3.3-6 7.4-6.3C18.8 10.7 16.2 12.8 12 12.8z" />
          </svg>
        </span>
      );
    case "report":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(255,250,235,1)_0%,rgba(252,232,170,0.94)_58%,rgba(230,186,95,0.72)_100%)] text-[color:var(--color-accent-gold-dark)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <path d="M7 3.8h8l3 3V20.2H7z" />
            <path d="M15 3.8v3h3" />
            <path d="M9.4 11.1h5.2M9.4 14.5h5.2M9.4 17.8h3.2" />
            <path d="M13.2 8.2l.7 1.4 1.6.2-1.15 1.1.27 1.58-1.42-.75-1.42.75.27-1.58-1.15-1.1 1.6-.2z" />
          </svg>
        </span>
      );
    case "shop":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(255,248,238,1)_0%,rgba(240,220,189,0.94)_58%,rgba(194,154,92,0.72)_100%)] text-[color:var(--color-ink-black)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <path d="M6.5 10.2h11L16.9 19H7.1z" />
            <path d="M8 10.2V8.7c0-2 1.8-3.6 4-3.6s4 1.6 4 3.6v1.5" />
            <path d="M9.4 13.2h5.2" />
            <path d="M12 7.4l1 1.9 2.1.3-1.5 1.5.4 2.1-2-1.1-2 1.1.4-2.1-1.5-1.5 2.1-.3z" />
          </svg>
        </span>
      );
    case "consultation":
      return (
        <span
          aria-hidden="true"
          className={`${frame} bg-[radial-gradient(circle_at_30%_28%,rgba(255,244,246,1)_0%,rgba(244,211,220,0.94)_58%,rgba(214,150,170,0.72)_100%)] text-[color:var(--color-ruby-maroon)]`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.55"
            className={glyphClassName}
          >
            <path d="M12 5.2c-2.1 0-3.8 1.6-3.8 3.6 0 1.2.6 2.2 1.6 2.9V13l2.2-1 2.2 1v-1.3c1-.7 1.6-1.7 1.6-2.9 0-2-1.7-3.6-3.8-3.6z" />
            <path d="M7.2 19.1c.8-2.7 2.7-4.1 4.8-4.1s4 1.4 4.8 4.1" />
            <path d="M10 9.2h4" />
          </svg>
        </span>
      );
    default:
      return (
        <span
          aria-hidden="true"
          className={`${frame} ${accent}`}
        >
          {icon === "video"
            ? "VID"
            : icon === "article"
              ? "ART"
              : icon === "authority"
                ? "JPS"
                : "NC"}
        </span>
      );
  }
}

function DashboardTitleBlock({ localizeHref }: Readonly<{ localizeHref: LocalizeHref }>) {
  return (
    <section
      id="top"
      className="border-b border-[rgba(185,139,70,0.18)] bg-white"
    >
      <Container className="py-3 sm:py-5 lg:py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-center">
          <div className="min-w-0 rounded-[1.55rem] border border-[rgba(185,139,70,0.18)] bg-white p-4 sm:p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-antique-gold-dark)]">
              Sacred Daily Dashboard
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.55rem,6.6vw,3.1rem)] leading-[0.96] text-[color:var(--color-ink-black)]">
              Today at NAVAGRAHA
            </h1>
            <p className="mt-1.5 max-w-2xl text-[0.88rem] leading-6 text-[color:var(--color-ink-black)] sm:text-[0.98rem]">
              Panchang | Rashifal | Muhurat | Kundli | Ask NI
            </p>
            <p className="mt-2 max-w-xl text-[0.78rem] font-medium leading-5 text-[color:var(--color-ink-black)] sm:text-[0.86rem]">
              Human-guided by J P Sarmah, assisted by Ask NI.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <TrackedLink
                href={localizeHref("/panchang")}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "home-top-panchang", route: "/panchang" }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(185,139,70,0.34)] bg-white px-3 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-black)] transition hover:border-[rgba(185,139,70,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:px-4 sm:text-[0.66rem]"
              >
                Panchang
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="premium_ai_cta_click"
                eventPayload={{ page: "/", feature: "home-top-ai", route: "/ai" }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(185,139,70,0.34)] bg-[color:var(--color-ink-black)] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:border-[rgba(185,139,70,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:px-4 sm:text-[0.66rem]"
              >
                Ask NI
              </TrackedLink>
            </div>
          </div>

          <NavagrahaOrbitPanel />
        </div>
      </Container>
    </section>
  );
}

function SymbolGrid({ localizeHref }: Readonly<{ localizeHref: LocalizeHref }>) {
  return (
    <section className="bg-white">
      <Container className="py-4 px-3 sm:px-8 sm:py-8">
        <div className="-mx-3 grid grid-flow-col auto-cols-[calc((100%-1rem)/3)] gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 pr-6 [scrollbar-width:none] [scroll-padding-inline:0.75rem] snap-x snap-mandatory sm:mx-0 sm:auto-cols-[7.1rem] sm:px-0 sm:pr-0 sm:[scroll-padding-inline:0px] sm:gap-3 [&::-webkit-scrollbar]:hidden">
          {symbolTiles.map((tile) => (
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
      <Container className="pb-6 sm:pb-8">
        <TrackedLink
          href={localizeHref("/ai")}
          eventName="cta_click"
          eventPayload={{ page: "/", feature: "home-ni-strip", route: "/ai" }}
          className="block rounded-[1.6rem] border border-[rgba(185,139,70,0.28)] bg-[linear-gradient(180deg,#101010_0%,#050505_100%)] p-2.5 text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:p-5"
        >
          <div className="grid gap-2.5 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:items-start">
            <div className="flex min-w-0 items-center gap-2">
              <DashboardIcon icon="ai" className="hidden sm:inline-flex" />
              <div className="min-w-0">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(251,241,203,0.82)]">
                  ASK NI
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-[1.35rem] leading-tight text-white sm:text-[1.6rem]">
                  NAVAGRAHA Intelligence
                </h2>
              </div>
            </div>
            <div className="-mx-1 grid grid-flow-col auto-cols-[calc((100%-1rem)/3)] gap-2 overflow-x-auto px-1 pb-1 pr-5 [scrollbar-width:none] [scroll-padding-inline:0.25rem] snap-x snap-mandatory sm:mx-0 sm:auto-cols-[8.5rem] sm:px-0 sm:pr-1 sm:[scroll-padding-inline:0px] [&::-webkit-scrollbar]:hidden">
              {askNiUtilities.map((item) => (
                <AskNiUtilityLink
                  key={item.label}
                  item={item}
                  localizeHref={localizeHref}
                />
              ))}
              <span aria-hidden="true" className="w-1 shrink-0 sm:hidden" />
            </div>
          </div>
        </TrackedLink>
      </Container>
    </section>
  );
}

function AskNiUtilityLink({
  item,
  localizeHref,
}: Readonly<{ item: AskNiUtilityItem; localizeHref: LocalizeHref }>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="premium_ai_cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className="group flex min-h-[5.65rem] min-w-0 snap-start flex-col items-center justify-start gap-1 rounded-[1.05rem] border border-[rgba(185,139,70,0.24)] bg-white/95 px-2 py-2.5 text-center text-[color:var(--color-ink-black)] transition hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
    >
      <RailGlyph icon={item.icon} accent={item.accent} size="sm" />
      <span className="min-w-0 max-w-full break-words text-[0.64rem] font-semibold leading-[1.08] tracking-[0.03em] text-[color:var(--color-ink-black)] sm:text-[0.6rem]">
        {item.label}
      </span>
    </TrackedLink>
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
  title?: string;
  icon: IconKey;
  items: readonly RailItem[];
  localizeHref: LocalizeHref;
  className: string;
}>) {
  return (
    <section className="bg-white">
      <Container className="pb-7 sm:pb-9">
        <div
          className={`rounded-[1.6rem] border p-4 sm:p-5 ${className}`}
        >
          <div className="flex items-start gap-3">
            <DashboardIcon icon={icon} />
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent-gold-dark)]">
                {eyebrow}
              </p>
              {title ? (
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.55rem] leading-tight text-[color:var(--color-ink-black)]">
                  {title}
                </h2>
              ) : null}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:overflow-x-auto sm:pb-1 sm:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item) => (
              <RailLink
                key={item.label}
                item={item}
                localizeHref={localizeHref}
                className="w-full min-w-0 sm:min-w-[9.25rem]"
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
        <div className="rounded-[1.6rem] border border-[rgba(111,28,42,0.24)] bg-white p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-center">
            <div className="flex items-start gap-3">
              <DashboardIcon icon="authority" />
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ruby-maroon)]">
                  J P Sarmah Desk
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--color-ink-black)]">
                  Human-guided Vedic astrology authority, with Ask NI as
                  the assistance layer.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {authorityItems.map((item) => (
                <RailLink
                  key={item.label}
                  item={item}
                  localizeHref={localizeHref}
                  className="w-full min-w-0 justify-center"
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
        <div className="rounded-[1.6rem] border border-[rgba(185,139,70,0.18)] bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <DashboardIcon icon="shop" />
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent-gold-dark)]">
                Vedic shop
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.45rem] leading-tight text-[color:var(--color-ink-black)]">
                Guided categories
              </h2>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {shopItems.map((item) => (
              <ShopGridTile
                key={item.label}
                item={item}
                localizeHref={localizeHref}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ShopGridTile({
  item,
  localizeHref,
}: Readonly<{ item: (typeof shopItems)[number]; localizeHref: LocalizeHref }>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className="group flex min-h-[6.7rem] flex-col items-center justify-center gap-2 rounded-[1rem] border border-[rgba(185,139,70,0.16)] bg-white px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
    >
      <RailGlyph icon={item.icon} accent={item.accent} size="sm" />
      <span className="max-w-full break-normal text-[0.64rem] font-semibold leading-tight text-[color:var(--color-ink-black)] sm:text-[0.72rem]">
        {item.label}
      </span>
    </TrackedLink>
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
        <DashboardTitleBlock localizeHref={localizeHref} />
        <SymbolGrid localizeHref={localizeHref} />
        <AskNiStrip localizeHref={localizeHref} />
        <ShowcaseCard
          eyebrow="REPORTS"
          title=""
          icon="report"
          items={reportItems}
          localizeHref={localizeHref}
          className="border-[rgba(185,139,70,0.28)] bg-white"
        />
        <AuthorityCard localizeHref={localizeHref} />
        <ShowcaseCard
          eyebrow="LEARNING"
          title="Education Paths"
          icon="article"
          items={learningItems}
          localizeHref={localizeHref}
          className="border-[rgba(206,161,57,0.34)] bg-white"
        />
        <ShopCategoryRail localizeHref={localizeHref} />
      </main>
    </>
  );
}
