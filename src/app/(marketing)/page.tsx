import type { ReactNode } from "react";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
  PanchangIcon,
  RashifalIcon,
} from "@/components/icons/astrology-icons";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/seo/metadata";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "NAVAGRAHA CENTRE Kundli PWA",
    description:
      "Generate a Janam Kundli, understand the result with Ask NI, and continue to human consultation when needed.",
    path: "/",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "janam kundli",
      "kundli",
      "ask ni",
      "vedic consultation",
      "navagraha centre",
    ],
  });
}

export const revalidate = 3600;

type LocalizeHref = (href: string) => string;

type HomeIconName =
  | "kundli"
  | "ai"
  | "consult"
  | "today"
  | "learn"
  | "shop"
  | "panchang"
  | "rashifal"
  | "muhurat"
  | "trust"
  | "play";

type LinkCard = {
  title: string;
  description: string;
  href: string;
  icon: HomeIconName;
  feature: string;
};

const heroTiles: readonly LinkCard[] = [
  {
    title: "Kundli",
    description: "Birth chart",
    href: "/kundli",
    icon: "kundli",
    feature: "home-hero-bento-kundli",
  },
  {
    title: "Ask NI",
    description: "Simple terms",
    href: "/ai",
    icon: "ai",
    feature: "home-hero-bento-ask-ni",
  },
  {
    title: "Consult",
    description: "Guidance",
    href: "/consultation",
    icon: "consult",
    feature: "home-hero-bento-consult",
  },
  {
    title: "Today",
    description: "Daily utility",
    href: "/panchang",
    icon: "today",
    feature: "home-hero-bento-today",
  },
] as const;

const quickActions: readonly LinkCard[] = [
  {
    title: "Janam Kundli",
    description: "Generate chart",
    href: "/kundli",
    icon: "kundli",
    feature: "home-quick-janam-kundli",
  },
  {
    title: "Ask NI",
    description: "Understand terms",
    href: "/ai",
    icon: "ai",
    feature: "home-quick-ask-ni",
  },
  {
    title: "Consult",
    description: "Acharya guidance",
    href: "/consultation",
    icon: "consult",
    feature: "home-quick-consult",
  },
  {
    title: "Today",
    description: "Panchang view",
    href: "/panchang",
    icon: "today",
    feature: "home-quick-today",
  },
  {
    title: "Learn",
    description: "Astrology basics",
    href: "/learn",
    icon: "learn",
    feature: "home-quick-learn",
  },
  {
    title: "Vedic Shop",
    description: "Catalogue only",
    href: "/shop",
    icon: "shop",
    feature: "home-quick-shop",
  },
] as const;

const askNiPrompts = [
  "What is Lagna?",
  "What is Rashi?",
  "What does Dasha mean?",
  "What does my Kundli result mean?",
] as const;

const dailyGuidance: readonly LinkCard[] = [
  {
    title: "Panchang",
    description: "Daily calendar",
    href: "/panchang",
    icon: "panchang",
    feature: "home-today-panchang",
  },
  {
    title: "Rashifal",
    description: "Daily guidance",
    href: "/daily-rashifal",
    icon: "rashifal",
    feature: "home-today-rashifal",
  },
  {
    title: "Muhurat",
    description: "Timing basics",
    href: "/muhurat",
    icon: "muhurat",
    feature: "home-today-muhurat",
  },
] as const;

const primaryPath: readonly LinkCard[] = [
  {
    title: "Kundli",
    description: "Generate and view your birth chart.",
    href: "/kundli",
    icon: "kundli",
    feature: "home-path-kundli",
  },
  {
    title: "Ask NI",
    description: "Understand chart terms in simple language.",
    href: "/ai",
    icon: "ai",
    feature: "home-path-ask-ni",
  },
  {
    title: "Consultation",
    description: "Continue with trusted human guidance.",
    href: "/consultation",
    icon: "consult",
    feature: "home-path-consultation",
  },
] as const;

const trustPoints = [
  "Guidance-first",
  "Private birth details",
  "No AI guaranteed outcomes",
  "Consult Acharya for personal decisions",
  "Acharya Guidance",
] as const;

const latestGuidanceVideos = [
  {
    id: "4q4vc37or6Y",
    title: "Vastu for Home",
    href: "https://youtu.be/4q4vc37or6Y",
  },
  {
    id: "ix26NQI3GCM",
    title: "Solar Eclipse Guidance",
    href: "https://youtu.be/ix26NQI3GCM",
  },
  {
    id: "X4FimyT1J7Y",
    title: "Birth Chart Guidance",
    href: "https://youtu.be/X4FimyT1J7Y",
  },
  {
    id: "69d1avGBc6I",
    title: "Bohag Month Rashifal",
    href: "https://youtu.be/69d1avGBc6I",
  },
  {
    id: "buVPTZoFrXo",
    title: "Career by Birth Rashi",
    href: "https://youtu.be/buVPTZoFrXo",
  },
  {
    id: "arEV5CknDjE",
    title: "Til and Destiny",
    href: "https://youtu.be/arEV5CknDjE",
  },
  {
    id: "NCu6TbVQaww",
    title: "Numerology by Name",
    href: "https://youtu.be/NCu6TbVQaww",
  },
  {
    id: "z2yeLNcyWzU",
    title: "Meaning of Dreams",
    href: "https://youtu.be/z2yeLNcyWzU",
  },
  {
    id: "kOxgqP55D7M",
    title: "September Rashifal",
    href: "https://youtu.be/kOxgqP55D7M",
  },
] as const;

const exploreCards: readonly LinkCard[] = [
  {
    title: "Learn",
    description: "Short basics before deeper questions.",
    href: "/learn",
    icon: "learn",
    feature: "home-explore-learn",
  },
  {
    title: "Vedic Shop",
    description: "Browse the catalogue without checkout pressure.",
    href: "/shop",
    icon: "shop",
    feature: "home-explore-shop",
  },
] as const;

function IconShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--color-accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_16px_rgba(17,17,17,0.07)]"
    >
      {children}
    </span>
  );
}

function AppIcon({ icon }: Readonly<{ icon: HomeIconName }>) {
  if (icon === "kundli") {
    return <KundliIcon className="h-10 w-10 border-0 shadow-none" />;
  }

  if (icon === "ai") {
    return <NavagrahaAiIcon className="h-10 w-10 border-0 shadow-none" />;
  }

  if (icon === "consult") {
    return <ConsultationIcon className="h-10 w-10 border-0 shadow-none" />;
  }

  if (icon === "panchang" || icon === "today") {
    return <PanchangIcon className="h-10 w-10 border-0 shadow-none" />;
  }

  if (icon === "rashifal") {
    return <RashifalIcon className="h-10 w-10 border-0 shadow-none" />;
  }

  return (
    <IconShell>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {icon === "shop" ? (
          <>
            <path d="M6.5 10.2h11L16.9 19H7.1z" />
            <path d="M8 10.2V8.7c0-2 1.8-3.6 4-3.6s4 1.6 4 3.6v1.5" />
          </>
        ) : icon === "muhurat" ? (
          <>
            <circle cx="12" cy="12" r="7.4" />
            <path d="M12 7.2v5l3.2 2" />
            <path d="M7.3 4.8 5.4 6.7M16.7 4.8l1.9 1.9" />
          </>
        ) : icon === "play" ? (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="m10 8.8 5 3.2-5 3.2z" />
          </>
        ) : icon === "trust" ? (
          <>
            <path d="M12 3.8 18 6v5.2c0 3.7-2.4 6.8-6 8.9-3.6-2.1-6-5.2-6-8.9V6z" />
            <path d="m9.2 12.1 1.8 1.8 3.9-4" />
          </>
        ) : (
          <>
            <path d="M6 5.5h12v13H6z" />
            <path d="M9 9h6" />
            <path d="M9 12.3h6" />
            <path d="M9 15.6h3.5" />
          </>
        )}
      </svg>
    </IconShell>
  );
}

function HeroBentoTile({
  tile,
  localizeHref,
}: Readonly<{
  tile: LinkCard;
  localizeHref: LocalizeHref;
}>) {
  return (
    <TrackedLink
      href={localizeHref(tile.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: tile.feature, route: tile.href }}
      className="group block min-w-0 rounded-[1.25rem] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-10px_18px_rgba(184,137,67,0.035),0_12px_24px_rgba(17,17,17,0.07)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
    >
      <div className="flex items-center gap-2.5">
        <AppIcon icon={tile.icon} />
        <div className="min-w-0">
          <p className="truncate text-[0.82rem] font-extrabold text-[#111111]">
            {tile.title}
          </p>
          <p className="mt-0.5 truncate text-[0.68rem] font-semibold text-[#111111]/68">
            {tile.description}
          </p>
        </div>
      </div>
    </TrackedLink>
  );
}

function QuickActionTile({
  item,
  localizeHref,
}: Readonly<{
  item: LinkCard;
  localizeHref: LocalizeHref;
}>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className="group flex min-h-[7.2rem] min-w-0 flex-col justify-between rounded-[1.25rem] bg-white p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-10px_20px_rgba(184,137,67,0.035),0_12px_24px_rgba(17,17,17,0.065)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:min-h-[7.6rem]"
    >
      <AppIcon icon={item.icon} />
      <span className="min-w-0">
        <span className="block text-[0.94rem] font-extrabold leading-tight text-[#111111]">
          {item.title}
        </span>
        <span className="mt-1 block text-[0.72rem] font-semibold leading-4 text-[#111111]/68">
          {item.description}
        </span>
      </span>
    </TrackedLink>
  );
}

function SectionTitle({
  eyebrow,
  title,
}: Readonly<{ eyebrow?: string; title: string }>) {
  return (
    <div className="flex min-w-0 items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.15em] text-[color:var(--color-accent-strong)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-[1.15rem] font-extrabold leading-tight text-[#111111] sm:text-[1.45rem]">
          {title}
        </h2>
      </div>
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full bg-[#4CBB17] shadow-[0_0_0_5px_rgba(76,187,23,0.1)]"
      />
    </div>
  );
}

function DailyGuidanceCard({
  item,
  localizeHref,
}: Readonly<{
  item: LinkCard;
  localizeHref: LocalizeHref;
}>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className="flex min-w-0 items-center gap-3 rounded-[1.2rem] bg-white px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_9px_18px_rgba(17,17,17,0.055)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
    >
      <AppIcon icon={item.icon} />
      <span className="min-w-0">
        <span className="block text-[0.9rem] font-extrabold text-[#111111]">
          {item.title}
        </span>
        <span className="block text-[0.72rem] font-semibold text-[#111111]/68">
          {item.description}
        </span>
      </span>
    </TrackedLink>
  );
}

function PathCard({
  item,
  index,
  localizeHref,
}: Readonly<{
  item: LinkCard;
  index: number;
  localizeHref: LocalizeHref;
}>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className="group relative min-w-0 rounded-[1.35rem] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_18px_rgba(76,187,23,0.025),0_12px_26px_rgba(17,17,17,0.06)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
    >
      <span className="absolute right-4 top-4 text-[0.68rem] font-black text-[color:var(--color-accent-strong)]">
        {index + 1}
      </span>
      <AppIcon icon={item.icon} />
      <h3 className="mt-4 text-[1rem] font-extrabold text-[#111111]">
        {item.title}
      </h3>
      <p className="mt-2 text-[0.82rem] font-semibold leading-5 text-[#111111]/72">
        {item.description}
      </p>
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

  return (
    <>
      <PageViewTracker page="/" feature="premium-utility-home" />

      <main className="launch-page launch-page-home min-w-0 overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="bg-white">
          <Container className="grid gap-4 py-4 sm:py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.6fr)] lg:items-center">
            <div className="min-w-0">
              <h1
                className="font-[family-name:var(--font-display)] text-[2.35rem] font-semibold uppercase tracking-[0.02em] text-[#111111] sm:text-[3.25rem] lg:text-[3.9rem]"
                style={{ lineHeight: "0.95" }}
              >
                NAVAGRAHA CENTRE
              </h1>
              <p className="mt-3 max-w-xl text-[1rem] font-semibold leading-6 text-[#111111]/82 sm:text-[1.08rem]">
                Generate Janam Kundli with trusted Vedic guidance.
              </p>
              <div className="mt-5 grid gap-3 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
                <TrackedLink
                  href={localizeHref("/kundli")}
                  eventName="cta_click"
                  eventPayload={{
                    page: "/",
                    feature: "home-primary-generate-kundli",
                  }}
                  className={buttonStyles({
                    tone: "accent",
                    size: "lg",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] sm:w-auto",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
                <TrackedLink
                  href={localizeHref("/ai")}
                  eventName="premium_ai_cta_click"
                  eventPayload={{ page: "/", feature: "home-secondary-ask-ni" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className:
                      "w-full justify-center rounded-[var(--radius-pill)] border-[rgba(76,187,23,0.34)] sm:w-auto",
                  })}
                >
                  Ask NI
                </TrackedLink>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {heroTiles.map((tile) => (
                <HeroBentoTile
                  key={tile.title}
                  tile={tile}
                  localizeHref={localizeHref}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-4 py-4 sm:py-6">
            <SectionTitle eyebrow="Quick actions" title="Start from here" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {quickActions.map((item) => (
                <QuickActionTile
                  key={item.title}
                  item={item}
                  localizeHref={localizeHref}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-4 sm:py-6">
            <div className="rounded-[1.55rem] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-10px_20px_rgba(76,187,23,0.025),0_14px_30px_rgba(17,17,17,0.065)] sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.15em] text-[color:var(--color-accent-strong)]">
                    Ask NI
                  </p>
                  <h2 className="mt-1 text-[1.12rem] font-extrabold leading-tight text-[#111111]">
                    Ask NI about your Kundli
                  </h2>
                </div>
                <div className="flex min-w-0 flex-wrap gap-2">
                  {askNiPrompts.map((prompt) => (
                    <TrackedLink
                      key={prompt}
                      href={localizeHref("/ai")}
                      eventName="premium_ai_cta_click"
                      eventPayload={{
                        page: "/",
                        feature: "home-ask-ni-prompt",
                        prompt,
                      }}
                      className="rounded-full bg-white px-3 py-2 text-[0.72rem] font-extrabold text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_6px_14px_rgba(17,17,17,0.055)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                    >
                      {prompt}
                    </TrackedLink>
                  ))}
                </div>
                <TrackedLink
                  href={localizeHref("/ai")}
                  eventName="premium_ai_cta_click"
                  eventPayload={{ page: "/", feature: "home-ask-ni-bar-cta" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "sm",
                    className:
                      "w-full rounded-[var(--radius-pill)] border-[rgba(76,187,23,0.36)] lg:w-auto",
                  })}
                >
                  Ask NI
                </TrackedLink>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-4 py-4 sm:py-6">
            <SectionTitle title="Today's Vedic Guidance" />
            <div className="grid gap-3 sm:grid-cols-3">
              {dailyGuidance.map((item) => (
                <DailyGuidanceCard
                  key={item.title}
                  item={item}
                  localizeHref={localizeHref}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-4 py-4 sm:py-6">
            <SectionTitle eyebrow="Primary path" title="Kundli -> Ask NI -> Consultation" />
            <div className="grid gap-3 lg:grid-cols-3">
              {primaryPath.map((item, index) => (
                <PathCard
                  key={item.title}
                  item={item}
                  index={index}
                  localizeHref={localizeHref}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-4 py-4 sm:py-6">
            <SectionTitle eyebrow="Guidance desk" title="Human trust stays central" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex min-h-[5.8rem] min-w-0 flex-col justify-between rounded-[1.2rem] bg-white p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_20px_rgba(17,17,17,0.055)]"
                >
                  <AppIcon icon="trust" />
                  <p className="mt-3 text-[0.82rem] font-extrabold leading-5 text-[#111111]">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-4 py-4 sm:py-6">
            <SectionTitle title="Latest Guidance" />
            <div
              className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
              aria-label="Latest Guidance video rail"
            >
              {latestGuidanceVideos.map((video) => (
                <a
                  key={video.id}
                  href={video.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${video.title}`}
                  className="group w-[15.5rem] shrink-0 snap-start rounded-[1.25rem] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_24px_rgba(17,17,17,0.06)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:w-[17.5rem] sm:p-4 lg:w-[18rem]"
                >
                  <div className="relative aspect-video overflow-hidden rounded-[1rem] bg-[rgba(185,139,70,0.08)]">
                    <span
                      aria-hidden="true"
                      className="block h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://img.youtube.com/vi/${video.id}/hqdefault.jpg)`,
                      }}
                    />
                    <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0),rgba(5,5,5,0.18))]" />
                    <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(17,17,17,0.16)]">
                      <AppIcon icon="play" />
                    </span>
                  </div>
                  <p className="mt-3 text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                    Guidance video
                  </p>
                  <h3 className="mt-1 min-h-[2.55rem] overflow-hidden text-[0.98rem] font-extrabold leading-[1.28] text-[#111111] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {video.title}
                  </h3>
                </a>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-4 py-4 sm:py-7">
            <SectionTitle eyebrow="Explore" title="Learn and browse safely" />
            <div className="grid gap-3 sm:grid-cols-2">
              {exploreCards.map((item) => (
                <TrackedLink
                  key={item.title}
                  href={localizeHref(item.href)}
                  eventName="cta_click"
                  eventPayload={{ page: "/", feature: item.feature, route: item.href }}
                  className="flex min-w-0 items-center gap-3 rounded-[1.35rem] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_24px_rgba(17,17,17,0.06)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                >
                  <AppIcon icon={item.icon} />
                  <span className="min-w-0">
                    <span className="block text-[1rem] font-extrabold text-[#111111]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[0.82rem] font-semibold leading-5 text-[#111111]/72">
                      {item.description}
                    </span>
                  </span>
                </TrackedLink>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
