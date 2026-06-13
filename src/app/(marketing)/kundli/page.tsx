import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { getSession } from "@/modules/auth/server";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import { getOnboardingSnapshot } from "@/modules/onboarding/service";
import { GenerateKundliControl } from "./generate-kundli-control";

const heroChips = ["Lagna", "Rashi", "Dasha"] as const;

const birthDetailFields = {
  name: { label: "Name", value: "From profile", marker: "N" },
  date: { label: "Date", value: "Date of Birth", marker: "D" },
  time: { label: "Time", value: "Time of Birth", marker: "T" },
  place: { label: "Birth Place", value: "City, Country", marker: "P" },
} as const;

const timedBirthFields = [
  birthDetailFields.date,
  birthDetailFields.time,
] as const;

const preferenceFields = [
  { label: "Chart Style", value: "East Indian", tone: "gold" },
  { label: "Language", value: "Preference", tone: "green" },
] as const;

const nextSteps = [
  {
    title: "Patrika",
    href: "/reports",
    cta: "Janam Patrika",
    eventName: "report_cta_click",
    feature: "kundli-next-janam-patrika",
  },
  {
    title: "Consult",
    href: "/consultation",
    cta: "Consult Expert",
    eventName: "consultation_cta_click",
    feature: "kundli-next-consult-expert",
  },
  {
    title: "Ask NI",
    href: "/ai",
    cta: "Ask NI",
    eventName: "cta_click",
    feature: "kundli-next-ask-ni",
  },
] as const;

type KundliAccessState =
  | {
      status: "unauthenticated";
      eyebrow: string;
      title: string;
      message: string;
      ctaMode: "sign-in";
    }
  | {
      status: "profile-incomplete";
      eyebrow: string;
      title: string;
      message: string;
      ctaMode: "paused";
    }
  | {
      status: "ready";
      eyebrow: string;
      title: string;
      message: string;
      ctaMode: "prepared";
    }
  | {
      status: "unknown";
      eyebrow: string;
      title: string;
      message: string;
      ctaMode: "paused";
    };

function localizeHref(locale: string, hasExplicitLocalePrefix: boolean, href: string) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function SacredDot({ tone = "gold" }: Readonly<{ tone?: "gold" | "green" }>) {
  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 rounded-full ${
        tone === "green"
          ? "bg-[#4CBB17] shadow-[0_0_0_6px_rgba(76,187,23,0.08)]"
          : "bg-[var(--color-accent-gold)] shadow-[0_0_0_6px_rgba(184,137,67,0.09)]"
      }`}
    />
  );
}

function getProfileStatusLine(status: KundliAccessState["status"]) {
  switch (status) {
    case "ready":
      return "Profile ready";
    case "profile-incomplete":
      return "Profile details needed";
    case "unknown":
      return "Profile check paused";
    default:
      return "Sign in required";
  }
}

function getGenerateNote(status: KundliAccessState["status"]) {
  switch (status) {
    case "ready":
      return "Ready from verified profile details.";
    case "profile-incomplete":
      return "Complete profile details before generation.";
    case "unknown":
      return "Profile readiness could not be confirmed.";
    default:
      return "Sign in to generate from your profile.";
  }
}

function BirthDetailRow({
  field,
  compact = false,
}: Readonly<{
  field: (typeof birthDetailFields)[keyof typeof birthDetailFields];
  compact?: boolean;
}>) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_9px_20px_rgba(17,17,17,0.04)] ${
        compact ? "py-1.5" : "py-2"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-[0.78rem] border border-[rgba(184,137,67,0.22)] bg-white font-bold text-[color:var(--color-accent-strong)] shadow-[0_8px_18px_rgba(17,17,17,0.04)] ${
          compact ? "h-8 w-8 text-[0.74rem]" : "h-8 w-8 text-[0.76rem]"
        }`}
      >
        {field.marker}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.11em] text-[color:var(--color-accent-strong)]">
          {field.label}
        </span>
        <span className="mt-0.5 block truncate text-[0.8rem] font-semibold text-[#111111] sm:text-[0.86rem]">
          {field.value}
        </span>
      </span>
    </div>
  );
}

function hasCompleteBirthProfile(
  snapshot: Awaited<ReturnType<typeof getOnboardingSnapshot>>
) {
  const requiredValues = [
    snapshot.defaults.birthDate,
    snapshot.defaults.birthTime,
    snapshot.defaults.city,
    snapshot.defaults.country,
    snapshot.defaults.timezone,
    snapshot.defaults.latitude,
    snapshot.defaults.longitude,
  ];

  return snapshot.status.hasBirthProfile && requiredValues.every(Boolean);
}

async function getKundliAccessState(): Promise<KundliAccessState> {
  const session = await getSession().catch(() => null);

  if (!session) {
    return {
      status: "unauthenticated",
      eyebrow: "Sign-in required",
      title: "Sign in to generate from your profile.",
      message: "Your protected profile is required before generation.",
      ctaMode: "sign-in",
    };
  }

  const snapshot = await getOnboardingSnapshot(session.user.id).catch(() => null);

  if (!snapshot) {
    return {
      status: "unknown",
      eyebrow: "Profile check paused",
      title: "We could not confirm birth profile readiness.",
      message: "Generation is paused until profile readiness is confirmed.",
      ctaMode: "paused",
    };
  }

  if (!hasCompleteBirthProfile(snapshot)) {
    return {
      status: "profile-incomplete",
      eyebrow: "Profile details needed",
      title: "Complete birth details are required before generation.",
      message: "Date, time, place, timezone and coordinates are required.",
      ctaMode: "paused",
    };
  }

  return {
    status: "ready",
    eyebrow: "Profile ready",
    title: "Your protected birth profile appears ready.",
    message: "Ready from verified profile details.",
    ctaMode: "prepared",
  };
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("kundli", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/kundli",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "kundli",
      "janam kundli",
      "NAVAGRAHA Intelligence birth chart guidance",
      "lagna chart",
      "vedic kundli",
      "rashi and navamsa guidance",
    ],
  });
}

export const dynamic = "force-dynamic";

export default async function KundliPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localize = (href: string) => localizeHref(locale, hasExplicitLocalePrefix, href);
  const accessState = await getKundliAccessState();

  return (
    <>
      <PageViewTracker page="/kundli" feature="kundli-page" />

      <main className="launch-page launch-page-kundli min-h-screen overflow-hidden bg-white pb-[calc(6rem+env(safe-area-inset-bottom))] text-[#111111] md:pb-0">
        <section className="relative border-b border-black/8 bg-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_14%_12%,rgba(184,137,67,0.1),transparent_30%),radial-gradient(circle_at_88%_4%,rgba(76,187,23,0.08),transparent_26%)]" />
          <Container className="relative py-2.5 sm:py-5">
            <Card
              tone="default"
              className="min-w-0 overflow-hidden border-[rgba(184,137,67,0.22)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_14px_34px_rgba(17,17,17,0.055)] before:opacity-0 sm:p-5"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                    Janam Kundli
                  </Badge>
                  <h1
                    className="font-[family-name:var(--font-display)] text-[1.7rem] text-[#111111] sm:text-[2.45rem]"
                    style={{ letterSpacing: "0.005em", lineHeight: "var(--line-height-tight)" }}
                  >
                    Janam Kundli
                  </h1>
                  <p className="text-[0.88rem] leading-5 text-[color:var(--color-ink-body)] sm:text-[0.94rem] sm:leading-6">
                    Generate your birth chart with accurate birth details
                  </p>
                </div>
                <div className="w-fit rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.22)] bg-white px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_20px_rgba(17,17,17,0.045)]">
                  Generate Kundli
                </div>
              </div>
              <div className="mt-3 flex max-w-full flex-wrap gap-2">
                {heroChips.map((chip, index) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-black/8 bg-white px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#111111] shadow-[0_7px_16px_rgba(17,17,17,0.035)]"
                  >
                    <SacredDot tone={index === 1 ? "green" : "gold"} />
                    {chip}
                  </span>
                ))}
              </div>
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-2.5 sm:py-5">
            <Card
              tone="default"
              className="min-w-0 space-y-2.5 border-[rgba(184,137,67,0.24)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_16px_36px_rgba(17,17,17,0.055)] before:opacity-0 sm:space-y-4 sm:p-5"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Birth Details
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.2rem] text-[#111111] sm:text-[1.35rem]">
                    Profile form
                  </h2>
                </div>
                <span className="shrink-0 rounded-[var(--radius-pill)] border border-[rgba(76,187,23,0.22)] bg-white px-3 py-1.5 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-[#4CBB17] shadow-[0_7px_16px_rgba(17,17,17,0.035)]">
                  {getProfileStatusLine(accessState.status)}
                </span>
              </div>

              <div className="grid min-w-0 gap-2">
                <BirthDetailRow field={birthDetailFields.name} />

                <div className="grid min-w-0 grid-cols-2 gap-2">
                  {timedBirthFields.map((field) => (
                    <BirthDetailRow key={field.label} field={field} compact />
                  ))}
                </div>

                <BirthDetailRow field={birthDetailFields.place} />
              </div>

              <div className="grid min-w-0 gap-2">
                <div className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_9px_20px_rgba(17,17,17,0.04)]">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Gender
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {["Male", "Female"].map((item) => (
                      <span
                        key={item}
                        className="rounded-[0.8rem] border border-black/8 bg-white px-3 py-1.5 text-center text-[0.78rem] font-semibold text-[#111111] shadow-[0_7px_16px_rgba(17,17,17,0.035)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-2 gap-2">
                  {preferenceFields.map((field) => (
                    <div
                      key={field.label}
                      className={`rounded-[1rem] border bg-white px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_9px_20px_rgba(17,17,17,0.04)] ${
                        field.tone === "green"
                          ? "border-[rgba(76,187,23,0.18)]"
                          : "border-[rgba(184,137,67,0.18)]"
                      }`}
                    >
                      <p
                        className={`text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${
                          field.tone === "green"
                            ? "text-[#4CBB17]"
                            : "text-[color:var(--color-accent-strong)]"
                        }`}
                      >
                        {field.label}
                      </p>
                      <p className="mt-0.5 truncate text-[0.8rem] font-semibold text-[#111111] sm:text-[0.86rem]">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1rem] border border-[rgba(76,187,23,0.18)] bg-white px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_9px_20px_rgba(17,17,17,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#4CBB17]">
                    Status
                  </span>
                  <span className="text-[0.78rem] font-semibold text-[#111111]">
                    {accessState.eyebrow}
                  </span>
                </div>
              </div>

              <GenerateKundliControl
                accessStatus={accessState.status}
                ctaMode={accessState.ctaMode}
                signInHref={localize("/sign-in")}
                feature="kundli-profile-card-generate"
                note={getGenerateNote(accessState.status)}
              />
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="py-4 sm:py-6">
            <Card
              tone="default"
              className="min-w-0 border-[rgba(76,187,23,0.22)] bg-white p-4 shadow-[0_14px_30px_rgba(17,17,17,0.05)] before:opacity-0 sm:p-5"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#4CBB17]">
                    Birth Time?
                  </p>
                  <p className="mt-1 text-[0.9rem] font-semibold text-[#111111]">
                    Exact time improves chart accuracy.
                  </p>
                </div>
                <TrackedLink
                  href={localize("/consultation")}
                  eventName="consultation_cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-birth-time-help" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "sm",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Consult
                </TrackedLink>
              </div>
            </Card>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-3 py-4 sm:py-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                Next Step
              </p>
              <SacredDot tone="green" />
            </div>
            <div className="grid min-w-0 grid-cols-3 gap-2">
              {nextSteps.map((step) => (
                <TrackedLink
                  key={step.title}
                  href={localize(step.href)}
                  eventName={step.eventName}
                  eventPayload={{ page: "/kundli", feature: step.feature }}
                  className="block min-w-0"
                >
                  <Card
                    tone="default"
                    className="min-w-0 border-[rgba(184,137,67,0.2)] bg-white p-2.5 text-center shadow-[0_10px_22px_rgba(17,17,17,0.04)] transition hover:-translate-y-0.5 hover:border-[rgba(184,137,67,0.34)] before:opacity-0 sm:p-3.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-[0.58rem] font-semibold uppercase tracking-[0.09em] text-[color:var(--color-accent-strong)] sm:text-[0.68rem]">
                        {step.cta}
                      </p>
                      <h3 className="truncate font-[family-name:var(--font-display)] text-[0.9rem] text-[#111111] sm:text-[1rem]">
                        {step.title}
                      </h3>
                    </div>
                  </Card>
                </TrackedLink>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
