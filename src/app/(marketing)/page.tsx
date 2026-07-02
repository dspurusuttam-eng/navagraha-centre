import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
} from "@/components/icons/astrology-icons";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const primaryCards = [
  {
    title: "Kundli",
    description: "Start with your birth chart and basic chart structure.",
    href: "/kundli",
    feature: "home-card-kundli",
    icon: "kundli",
  },
  {
    title: "Consultation",
    description: "Prepare your concern for careful human guidance.",
    href: "/consultation",
    feature: "home-card-consultation",
    icon: "consult",
  },
  {
    title: "Ask NI",
    description: "Understand Kundli terms in simple language.",
    href: "/ai",
    feature: "home-card-ask-ni",
    icon: "ai",
  },
  {
    title: "Learn",
    description: "Read the basics before asking deeper questions.",
    href: "/learn",
    feature: "home-card-learn",
    icon: "learn",
  },
  {
    title: "Vedic Shop",
    description: "Browse guidance-first categories only.",
    href: "/shop",
    feature: "home-card-shop",
    icon: "shop",
  },
] as const;

function AppIcon({
  icon,
}: Readonly<{ icon: (typeof primaryCards)[number]["icon"] }>) {
  if (icon === "kundli") {
    return <KundliIcon className="h-9 w-9" />;
  }

  if (icon === "consult") {
    return <ConsultationIcon className="h-6 w-6" />;
  }

  if (icon === "ai") {
    return <NavagrahaAiIcon className="h-6 w-6" />;
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
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
      ) : (
        <>
          <path d="M6 5.5h12v13H6z" />
          <path d="M9 9h6" />
          <path d="M9 12.3h6" />
          <path d="M9 15.6h3.5" />
        </>
      )}
    </svg>
  );
}

function KundliVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[15rem] rounded-[2rem] border border-[rgba(184,137,67,0.28)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-10px_22px_rgba(184,137,67,0.045),0_18px_34px_rgba(17,17,17,0.075)] sm:max-w-[17rem] sm:p-5"
    >
      <div className="absolute inset-5 rounded-[1.45rem] border border-black/10" />
      <div className="absolute inset-10 rounded-full border border-[rgba(76,187,23,0.32)]" />
      <div className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-[rgba(184,137,67,0.26)]" />
      <div className="absolute left-5 top-1/2 h-px w-[calc(100%-2.5rem)] -translate-y-1/2 bg-[rgba(184,137,67,0.26)]" />
      <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-[calc(100%-2.5rem)] rotate-45 border border-[rgba(184,137,67,0.2)]" />
      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(76,187,23,0.42)] bg-white text-[0.7rem] font-black text-[#2f7e16] shadow-[0_10px_20px_rgba(17,17,17,0.08)]">
        OM
      </span>
      {["Lagna", "Rashi", "Dasha"].map((label, index) => (
        <span
          key={label}
          className={`absolute rounded-full border bg-white px-2 py-1 text-[0.55rem] font-extrabold uppercase tracking-[0.08em] shadow-[0_7px_12px_rgba(17,17,17,0.055)] ${
            index === 0
              ? "left-4 top-4 border-[rgba(184,137,67,0.34)] text-[color:var(--color-accent-strong)]"
              : index === 1
                ? "right-4 top-12 border-[rgba(76,187,23,0.34)] text-[#2f7e16]"
                : "bottom-5 left-1/2 -translate-x-1/2 border-[rgba(184,137,67,0.34)] text-[color:var(--color-accent-strong)]"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function ShortcutCard({
  card,
  localizeHref,
}: Readonly<{
  card: (typeof primaryCards)[number];
  localizeHref: LocalizeHref;
}>) {
  return (
    <TrackedLink
      href={localizeHref(card.href)}
      eventName="cta_click"
      eventPayload={{ page: "/", feature: card.feature, route: card.href }}
      className="block min-w-0"
    >
      <Card
        tone="default"
        className="flex min-h-[7.35rem] min-w-0 flex-col justify-between border-[rgba(184,137,67,0.22)] bg-white p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_16px_rgba(184,137,67,0.035),0_12px_22px_rgba(17,17,17,0.06)] before:opacity-0 sm:min-h-[8.5rem] sm:p-4"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(184,137,67,0.26)] bg-white text-[color:var(--color-accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_7px_13px_rgba(17,17,17,0.06)]">
          <AppIcon icon={card.icon} />
        </span>
        <div className="mt-3 min-w-0">
          <h2 className="text-[1rem] font-extrabold leading-tight text-[#111111]">
            {card.title}
          </h2>
          <p className="mt-1 text-[0.78rem] font-semibold leading-5 text-[#111111]/80">
            {card.description}
          </p>
        </div>
      </Card>
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
      <PageViewTracker page="/" feature="kundli-first-home" />

      <main className="launch-page launch-page-home min-w-0 overflow-hidden bg-white pb-[calc(7rem+env(safe-area-inset-bottom))] text-[#111111] xl:pb-12">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-5 py-4 sm:py-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.58fr)] lg:items-center">
            <div className="min-w-0 rounded-[1.55rem] border border-[rgba(184,137,67,0.24)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-9px_18px_rgba(184,137,67,0.035),0_16px_30px_rgba(17,17,17,0.065)] sm:p-6">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[color:var(--color-accent-strong)]">
                Kundli-first Vedic guidance
              </p>
              <h1
                className="mt-2 font-[family-name:var(--font-display)] text-[2.35rem] font-semibold text-[#111111] sm:text-[3.6rem] lg:text-[4.2rem]"
                style={{ lineHeight: "0.95" }}
              >
                NAVAGRAHA CENTRE
              </h1>
              <p className="mt-3 max-w-2xl text-[0.98rem] font-semibold leading-6 text-[#111111] sm:text-[1.08rem]">
                Generate your Janam Kundli, understand the result with Ask NI,
                and continue into human guidance when the question needs care.
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

            <KundliVisual />
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-4 sm:py-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                Primary path
              </p>
              <span className="h-2 w-2 rounded-full bg-[#4CBB17] shadow-[0_0_0_4px_rgba(76,187,23,0.09)]" />
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {primaryCards.map((card) => (
                <ShortcutCard
                  key={card.title}
                  card={card}
                  localizeHref={localizeHref}
                />
              ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-[rgba(184,137,67,0.18)] bg-white">
          <Container className="grid gap-3 py-4 sm:grid-cols-3 sm:py-6">
            {[
              "Guidance-first",
              "Private birth details",
              "No guaranteed outcomes",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1rem] border border-[rgba(184,137,67,0.22)] bg-white px-4 py-3 text-center text-[0.82rem] font-extrabold text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_14px_rgba(17,17,17,0.045)]"
              >
                {item}
              </div>
            ))}
          </Container>
        </section>
      </main>
    </>
  );
}
