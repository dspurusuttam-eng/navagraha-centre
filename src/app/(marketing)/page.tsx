import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  AskNIIcon,
  ConsultIcon,
  GuidanceIcon,
  LearnIcon,
  MuhuratIcon,
  PlayIcon,
} from "@/components/icons/navagraha-icons";
import {
  NavagrahaPremiumIcon,
  type NavagrahaPremiumIconName,
} from "@/components/icons/navagraha-premium-icons";
import {
  PremiumIconBase,
  type PremiumIconTone,
} from "@/components/icons/premium-icon";
import { Container } from "@/components/ui/container";
import { createPageMetadata } from "@/lib/seo/metadata";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { HomeRailControls } from "./home-rail-controls";

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
  | "panchang"
  | "rashifal"
  | "numerology"
  | "muhurat"
  | "trust"
  | "play";

type LinkCard = {
  title: string;
  description?: string;
  href: string;
  icon: HomeIconName;
  feature: string;
};

const utilityItems: readonly LinkCard[] = [
  {
    title: "Kundli",
    href: "/kundli",
    icon: "kundli",
    feature: "home-utility-kundli",
  },
  {
    title: "Panchang",
    href: "/panchang",
    icon: "panchang",
    feature: "home-utility-panchang",
  },
  {
    title: "Rashifal",
    href: "/rashifal",
    icon: "rashifal",
    feature: "home-utility-rashifal",
  },
  {
    title: "Numerology",
    href: "/ai",
    icon: "numerology",
    feature: "home-utility-numerology",
  },
] as const;

const askNiQuestions: readonly LinkCard[] = [
  {
    title: "Marriage?",
    href: "/ai",
    icon: "ai",
    feature: "home-ask-ni-marriage",
  },
  {
    title: "Career?",
    href: "/ai",
    icon: "ai",
    feature: "home-ask-ni-career",
  },
  {
    title: "Muhurat?",
    href: "/ai",
    icon: "muhurat",
    feature: "home-ask-ni-muhurat",
  },
  {
    title: "Dasha?",
    href: "/ai",
    icon: "kundli",
    feature: "home-ask-ni-dasha",
  },
  {
    title: "Business?",
    href: "/ai",
    icon: "learn",
    feature: "home-ask-ni-business",
  },
  {
    title: "Wellbeing?",
    href: "/ai",
    icon: "trust",
    feature: "home-ask-ni-wellbeing",
  },
  {
    title: "Mantra?",
    href: "/ai",
    icon: "trust",
    feature: "home-ask-ni-mantra",
  },
  {
    title: "Gochar?",
    href: "/ai",
    icon: "rashifal",
    feature: "home-ask-ni-gochar",
  },
] as const;

const reportItems = ["Kundli", "Matching", "Muhurat", "Numerology"] as const;

const tools: readonly LinkCard[] = [
  {
    title: "Match",
    href: "/tools",
    icon: "trust",
    feature: "home-tools-match",
  },
  {
    title: "Manglik",
    href: "/tools",
    icon: "kundli",
    feature: "home-tools-manglik",
  },
  {
    title: "Lo Shu",
    href: "/tools",
    icon: "numerology",
    feature: "home-tools-lo-shu",
  },
  {
    title: "Name No.",
    href: "/tools",
    icon: "numerology",
    feature: "home-tools-name-no",
  },
  {
    title: "Baby Name",
    href: "/tools",
    icon: "learn",
    feature: "home-tools-baby-name",
  },
  {
    title: "Vehicle No.",
    href: "/tools",
    icon: "numerology",
    feature: "home-tools-vehicle-no",
  },
  {
    title: "Dasha",
    href: "/ai",
    icon: "kundli",
    feature: "home-tools-dasha",
  },
  {
    title: "Muhurat",
    href: "/muhurat",
    icon: "muhurat",
    feature: "home-tools-muhurat",
  },
] as const;

const advancedSystems: readonly LinkCard[] = [
  {
    title: "Jaimini",
    href: "/learn",
    icon: "kundli",
    feature: "home-advanced-jaimini",
  },
  {
    title: "KP",
    href: "/learn",
    icon: "panchang",
    feature: "home-advanced-kp",
  },
  {
    title: "Lal Kitab",
    href: "/learn",
    icon: "learn",
    feature: "home-advanced-lal-kitab",
  },
  {
    title: "Vastu",
    href: "/consultation",
    icon: "consult",
    feature: "home-advanced-vastu",
  },
  {
    title: "Matchmaking",
    href: "/consultation",
    icon: "trust",
    feature: "home-advanced-matchmaking",
  },
  {
    title: "Astro Yogas",
    href: "/learn",
    icon: "rashifal",
    feature: "home-advanced-astro-yogas",
  },
] as const;

const deskCards: readonly LinkCard[] = [
  {
    title: "Profile",
    description: "History, vision, mathematics",
    href: "/learn",
    icon: "kundli",
    feature: "home-desk-profile",
  },
  {
    title: "Support",
    description: "Help, reports, consultation",
    href: "/contact",
    icon: "trust",
    feature: "home-desk-support",
  },
] as const;

const latestTopics: readonly LinkCard[] = [
  {
    title: "Marriage Timing",
    href: "/ai",
    icon: "trust",
    feature: "home-topics-marriage-timing",
  },
  {
    title: "Dasha Period",
    href: "/ai",
    icon: "kundli",
    feature: "home-topics-dasha-period",
  },
  {
    title: "Graha Remedy",
    href: "/consultation",
    icon: "rashifal",
    feature: "home-topics-graha-remedy",
  },
  {
    title: "Muhurat Guide",
    href: "/learn",
    icon: "muhurat",
    feature: "home-topics-muhurat-guide",
  },
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

function getPremiumHomeIconName(
  icon: HomeIconName
): NavagrahaPremiumIconName | null {
  if (icon === "kundli") {
    return "kundli";
  }

  if (icon === "panchang" || icon === "today") {
    return "panchang";
  }

  if (icon === "rashifal") {
    return "rashifal";
  }

  if (icon === "numerology") {
    return "numerology";
  }

  return null;
}

function getHomeIconGlyph(icon: HomeIconName) {
  if (icon === "ai") {
    return <AskNIIcon />;
  }

  if (icon === "consult") {
    return <ConsultIcon />;
  }

  if (icon === "muhurat") {
    return <MuhuratIcon />;
  }

  if (icon === "play") {
    return <PlayIcon />;
  }

  if (icon === "trust") {
    return <GuidanceIcon />;
  }

  return <LearnIcon />;
}

function getHomeIconTone(icon: HomeIconName): PremiumIconTone {
  if (icon === "ai" || icon === "trust") {
    return "green";
  }

  return "gold";
}

function AppIcon({
  icon,
  size = "md",
}: Readonly<{ icon: HomeIconName; size?: "sm" | "md" | "lg" }>) {
  const premiumIconName = getPremiumHomeIconName(icon);

  if (premiumIconName) {
    const premiumIconSize = size === "lg" ? 58 : size === "sm" ? 44 : 52;

    return (
      <NavagrahaPremiumIcon
        name={premiumIconName}
        size={premiumIconSize}
        className="shrink-0"
      />
    );
  }

  return (
    <PremiumIconBase
      icon={getHomeIconGlyph(icon)}
      size={size}
      tone={getHomeIconTone(icon)}
    />
  );
}

function UtilityIconItem({
  item,
  localizeHref,
}: Readonly<{ item: LinkCard; localizeHref: LocalizeHref }>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className="group flex min-h-[5.15rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-[1.05rem] border border-[rgba(185,139,70,0.22)] bg-white px-1.5 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_18px_rgba(17,17,17,0.045)] transition hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:min-h-[5.75rem] sm:gap-2 sm:px-2.5 sm:py-3"
    >
      <AppIcon icon={item.icon} size="sm" />
      <span className="block max-w-full whitespace-nowrap text-[0.64rem] font-extrabold leading-tight text-[#111111] min-[390px]:text-[0.68rem] sm:text-[0.82rem]">
        {item.title}
      </span>
    </TrackedLink>
  );
}

function SectionTitle({ title }: Readonly<{ title: string }>) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <h2 className="text-[1.08rem] font-extrabold leading-tight text-[#111111] sm:text-[1.28rem]">
        {title}
      </h2>
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full bg-[#4CBB17] shadow-[0_0_0_5px_rgba(76,187,23,0.1)]"
      />
    </div>
  );
}

function RailCard({
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
      className="group flex min-h-[5.35rem] w-[5.35rem] shrink-0 snap-start flex-col justify-between rounded-[1rem] border border-[rgba(185,139,70,0.18)] bg-white p-2.5 shadow-[0_7px_16px_rgba(17,17,17,0.04)] transition hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:w-auto sm:p-3"
    >
      <AppIcon icon={item.icon} size="sm" />
      <span className="text-[0.76rem] font-extrabold leading-tight text-[#111111] [overflow-wrap:normal] [word-break:normal] sm:text-[0.82rem]">
        {item.title}
      </span>
    </TrackedLink>
  );
}

function CompactCard({
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
      className="group flex min-h-[5.65rem] min-w-0 flex-col justify-between rounded-[1.15rem] border border-[rgba(185,139,70,0.18)] bg-white p-3.5 shadow-[0_8px_18px_rgba(17,17,17,0.045)] transition hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
    >
      <AppIcon icon={item.icon} size="sm" />
      <span className="text-[0.86rem] font-extrabold leading-tight text-[#111111]">
        {item.title}
      </span>
    </TrackedLink>
  );
}

function DeskCard({
  item,
  localizeHref,
}: Readonly<{ item: LinkCard; localizeHref: LocalizeHref }>) {
  return (
    <TrackedLink
      href={localizeHref(item.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: item.feature, route: item.href }}
      className="group flex min-w-0 items-center gap-3 rounded-[1.25rem] border border-[rgba(185,139,70,0.2)] bg-white p-4 shadow-[0_10px_22px_rgba(17,17,17,0.045)] transition hover:-translate-y-0.5 hover:border-[rgba(76,187,23,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
    >
      <AppIcon icon={item.icon} />
      <span className="min-w-0">
        <span className="block text-[0.98rem] font-extrabold text-[#111111]">
          {item.title}
        </span>
        <span className="mt-1 block text-[0.72rem] font-semibold leading-4 text-[#111111]/68">
          {item.description}
        </span>
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

  return (
    <>
      <PageViewTracker page="/" feature="premium-utility-home" />

      <main className="launch-page launch-page-home min-w-0 overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="bg-white">
          <Container className="py-3 sm:py-4 xl:max-w-6xl">
            <div className="grid grid-cols-4 gap-2.5 rounded-[1.35rem] border border-[rgba(185,139,70,0.16)] bg-white p-2.5 shadow-[0_10px_22px_rgba(17,17,17,0.04)] sm:gap-3 sm:p-3">
              {utilityItems.map((item) => (
                <UtilityIconItem
                  key={item.title}
                  item={item}
                  localizeHref={localizeHref}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-1.5 sm:py-3 xl:max-w-6xl">
            <HomeRailControls
              label="Ask NI question rail"
              leftLabel="Scroll Ask NI topics left"
              rightLabel="Scroll Ask NI topics right"
              className="flex snap-x gap-2.5 overflow-x-auto rounded-[1.35rem] border border-[rgba(76,187,23,0.14)] bg-white p-2.5 shadow-[0_8px_18px_rgba(17,17,17,0.035)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {askNiQuestions.map((item) => (
                <TrackedLink
                  key={item.title}
                  href={localizeHref(item.href)}
                  eventName="premium_ai_cta_click"
                  eventPayload={{
                    page: "/",
                    feature: item.feature,
                    route: item.href,
                    prompt: item.title,
                  }}
                  className="flex min-h-12 w-[6.65rem] shrink-0 snap-start items-center justify-center rounded-full border border-[rgba(76,187,23,0.22)] bg-white px-3 text-center text-[0.78rem] font-extrabold text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_16px_rgba(17,17,17,0.05)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:w-[8.1rem] sm:text-[0.82rem]"
                >
                  {item.title}
                </TrackedLink>
              ))}
            </HomeRailControls>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-2 sm:py-4 xl:max-w-6xl">
            <div className="grid gap-3 rounded-[1.35rem] border border-[rgba(185,139,70,0.22)] bg-white p-4 shadow-[0_10px_22px_rgba(17,17,17,0.04)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4">
              <div className="min-w-0">
                <h1 className="text-[1.05rem] font-extrabold leading-tight text-[#111111] sm:text-[1.2rem]">
                  Personal Vedic Reports
                </h1>
                <p className="mt-2 text-[0.78rem] font-semibold leading-5 text-[#111111]/68">
                  {reportItems.join(" \u2022 ")}
                </p>
              </div>
              <TrackedLink
                href={localizeHref("/reports")}
                eventName="cta_click"
                eventPayload={{
                  page: "/",
                  feature: "home-reports-view",
                  route: "/reports",
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent-gold)] px-5 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_20px_rgba(185,139,70,0.18)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              >
                View Reports
              </TrackedLink>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-2 sm:py-4 xl:max-w-6xl">
            <div className="rounded-[1.35rem] border border-[rgba(185,139,70,0.16)] bg-white p-3 shadow-[0_10px_22px_rgba(17,17,17,0.035)] sm:p-4">
              <SectionTitle title="Tools" />
              <div
                className="mt-3 flex snap-x gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:pb-0 xl:gap-3.5 [&::-webkit-scrollbar]:hidden"
                aria-label="Vedic tools rail"
              >
                {tools.map((item) => (
                  <RailCard
                    key={item.title}
                    item={item}
                    localizeHref={localizeHref}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-2 sm:py-4 xl:max-w-6xl">
            <div className="rounded-[1.35rem] border border-[rgba(185,139,70,0.16)] bg-white p-3 shadow-[0_10px_22px_rgba(17,17,17,0.035)] sm:p-4">
              <SectionTitle title="Advanced Systems" />
              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
                {advancedSystems.map((item) => (
                  <CompactCard
                    key={item.title}
                    item={item}
                    localizeHref={localizeHref}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-2 sm:py-4 xl:max-w-6xl">
            <div className="rounded-[1.35rem] border border-[rgba(185,139,70,0.16)] bg-white p-3 shadow-[0_10px_22px_rgba(17,17,17,0.035)] sm:p-4">
              <SectionTitle title="Desk" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {deskCards.map((item) => (
                  <DeskCard
                    key={item.title}
                    item={item}
                    localizeHref={localizeHref}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-2 sm:py-4 xl:max-w-6xl">
            <div className="rounded-[1.35rem] border border-[rgba(185,139,70,0.16)] bg-white p-3 shadow-[0_10px_22px_rgba(17,17,17,0.035)] sm:p-4">
              <SectionTitle title="Latest Topics" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {latestTopics.map((item) => (
                  <CompactCard
                    key={item.title}
                    item={item}
                    localizeHref={localizeHref}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-2 sm:py-4 xl:max-w-6xl">
            <SectionTitle title="Latest Guidance" />
            <HomeRailControls
              label="Latest Guidance video rail"
              leftLabel="Scroll latest guidance left"
              rightLabel="Scroll latest guidance right"
              className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden"
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
                      <PlayIcon className="h-5 w-5" />
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
            </HomeRailControls>
          </Container>
        </section>
      </main>
    </>
  );
}
