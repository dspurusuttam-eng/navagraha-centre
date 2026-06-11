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

const profileDetails = [
  { label: "Name", note: "Required after sign-in" },
  { label: "Gender", note: "Profile detail" },
  { label: "Date of Birth", note: "Exact date required" },
  { label: "Time of Birth", note: "Exact time improves Lagna" },
  { label: "Birth Place", note: "City and country context" },
  { label: "Language Preference", note: "Experience preference" },
  { label: "Chart Style", note: "East Indian" },
] as const;

const advancedDetails = [
  { label: "Ayanamsa", note: "Backend default only" },
  { label: "Time Zone", note: "From verified profile" },
  { label: "Coordinates", note: "From verified profile" },
  { label: "Chart Type", note: "Display preview" },
] as const;

const resultItems = [
  "Lagna Chart",
  "Rashi Chart",
  "Navamsa",
  "Graha Position",
  "Dasha",
  "Basic Interpretation",
] as const;

const nextSteps = [
  {
    title: "Janam Patrika",
    description: "Move into guided report pathways when you need a deeper written view.",
    href: "/reports",
    cta: "Reports",
    eventName: "report_cta_click",
    feature: "kundli-next-janam-patrika",
  },
  {
    title: "Consult Expert",
    description: "Use human guidance for important life decisions and birth-time uncertainty.",
    href: "/consultation",
    cta: "Consultation",
    eventName: "consultation_cta_click",
    feature: "kundli-next-consult-expert",
  },
  {
    title: "Ask NI",
    description: "Use NAVAGRAHA Intelligence as an assistance layer after chart context is ready.",
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
      title: "Generate Kundli from your protected profile.",
      message:
        "Sign in first. NAVAGRAHA does not submit public birth details from this page.",
      ctaMode: "sign-in",
    };
  }

  const snapshot = await getOnboardingSnapshot(session.user.id).catch(() => null);

  if (!snapshot) {
    return {
      status: "unknown",
      eyebrow: "Profile check paused",
      title: "We could not confirm birth profile readiness.",
      message:
        "Generation remains paused until verified profile details can be checked safely.",
      ctaMode: "paused",
    };
  }

  if (!hasCompleteBirthProfile(snapshot)) {
    return {
      status: "profile-incomplete",
      eyebrow: "Profile details needed",
      title: "Complete birth details are required before generation.",
      message:
        "A verified date, time, place, timezone and coordinates are needed before real Kundli generation can run.",
      ctaMode: "paused",
    };
  }

  return {
    status: "ready",
    eyebrow: "Profile ready",
    title: "Your protected birth profile appears ready.",
    message:
      "Generation can run from verified profile details. Only real backend response fields will be shown.",
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

      <main className="launch-page launch-page-kundli min-h-screen overflow-hidden bg-white pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-[#111111] md:pb-0">
        <section className="relative border-b border-black/8 bg-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_16%_18%,rgba(184,137,67,0.09),transparent_31%),radial-gradient(circle_at_84%_8%,rgba(76,187,23,0.07),transparent_26%)]" />
          <Container className="relative grid min-w-0 gap-5 py-7 sm:py-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,0.72fr)] lg:items-center lg:py-11">
            <div className="min-w-0 space-y-5">
              <div className="space-y-3">
                <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                  Birth Chart Foundation
                </Badge>
                <div className="space-y-2">
                  <h1
                    className="max-w-3xl font-[family-name:var(--font-display)] text-[2.35rem] text-[#111111] sm:text-[length:var(--font-size-display-md)]"
                    style={{ letterSpacing: "0.005em", lineHeight: "var(--line-height-tight)" }}
                  >
                    Janam Kundli
                  </h1>
                  <p className="max-w-[39rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Generate your birth chart with accurate birth details
                  </p>
                </div>
                <div className="flex w-fit max-w-full flex-wrap items-center gap-2 rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.2)] bg-white px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_20px_rgba(17,17,17,0.04)]">
                  <span>Lagna</span>
                  <span aria-hidden="true">•</span>
                  <span>Rashi</span>
                  <span aria-hidden="true">•</span>
                  <span>Navamsa</span>
                  <span aria-hidden="true">•</span>
                  <span>Dasha</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <GenerateKundliControl
                  accessStatus={accessState.status}
                  ctaMode={accessState.ctaMode}
                  signInHref={localize("/sign-in")}
                  feature="kundli-generate-primary"
                  note={accessState.message}
                />
                <TrackedLink
                  href={localize("/consultation")}
                  eventName="consultation_cta_click"
                  eventPayload={{ page: "/kundli", feature: "kundli-birth-time-help-top" }}
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Birth Time Help
                </TrackedLink>
              </div>
            </div>

            <Card
              tone="default"
              className="relative min-w-0 overflow-hidden border-[rgba(184,137,67,0.24)] bg-white shadow-[0_18px_42px_rgba(17,17,17,0.06)] before:opacity-0"
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(184,137,67,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(184,137,67,0.28)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="trust" className="border border-black/8 bg-white">
                    Structural View
                  </Badge>
                  <SacredDot tone="green" />
                </div>
                <div className="relative mx-auto aspect-square w-full max-w-[17.5rem]">
                  <div className="absolute inset-[6%] rounded-[2rem] border border-[rgba(184,137,67,0.2)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(17,17,17,0.045)]" />
                  <div className="absolute inset-[17%] rounded-[1.45rem] border border-black/8" />
                  <div className="absolute inset-[29%] rounded-full border border-dashed border-[rgba(184,137,67,0.32)]" />
                  <div className="absolute left-1/2 top-[14%] h-[72%] w-px -translate-x-1/2 bg-black/8" />
                  <div className="absolute left-[14%] top-1/2 h-px w-[72%] -translate-y-1/2 bg-black/8" />
                  <div className="absolute left-1/2 top-1/2 flex h-[35%] w-[35%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-white shadow-[0_14px_32px_rgba(17,17,17,0.055)]">
                    <div className="text-center">
                      <p className="text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--color-accent-strong)]">
                        Janam
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-[1.15rem] tracking-[0.12em] text-[#111111]">
                        K
                      </p>
                      <p className="mt-1 text-[0.56rem] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
                        Chart
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[0.82rem] leading-6 text-[color:var(--color-ink-body)]">
                  This page prepares the Kundli experience safely. Chart details appear only after a
                  real authenticated profile-based generation flow.
                </p>
                <div className="rounded-[1rem] border border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_rgba(17,17,17,0.04)]">
                  <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    {accessState.eyebrow}
                  </p>
                  <p className="mt-1 text-[0.88rem] font-semibold leading-5 text-[#111111]">
                    {accessState.title}
                  </p>
                  <p className="mt-1 text-[0.78rem] leading-5 text-[color:var(--color-ink-body)]">
                    {accessState.message}
                  </p>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="grid min-w-0 gap-4 py-7 sm:py-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
            <Card
              tone="default"
              className="min-w-0 space-y-5 border-[rgba(184,137,67,0.24)] bg-white shadow-[0_16px_36px_rgba(17,17,17,0.055)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                  Profile Details
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[#111111]">
                  3D Birth Details checklist
                </h2>
                <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Kundli generation uses verified profile details after sign-in. This static shell
                  does not submit public birth details.
                </p>
              </div>

              <div className="grid min-w-0 gap-2.5 sm:grid-cols-2">
                {profileDetails.map((detail, index) => (
                  <div
                    key={detail.label}
                    className="min-w-0 rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_rgba(17,17,17,0.04)]"
                  >
                    <div className="flex items-center gap-2">
                      <SacredDot tone={index === profileDetails.length - 1 ? "green" : "gold"} />
                      <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                        {detail.label}
                      </p>
                    </div>
                    <p className="mt-2 text-[0.84rem] font-medium text-[#111111]">{detail.note}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <GenerateKundliControl
                  accessStatus={accessState.status}
                  ctaMode={accessState.ctaMode}
                  signInHref={localize("/sign-in")}
                  feature="kundli-profile-card-generate"
                  note={
                    accessState.status === "ready"
                      ? "Generation can now run from verified profile details."
                      : "This page will not generate a chart until sign-in and verified profile details are confirmed."
                  }
                />
              </div>
            </Card>

            <div className="min-w-0 space-y-4">
              <Card
                tone="default"
                className="min-w-0 space-y-3 border-[rgba(76,187,23,0.22)] bg-white shadow-[0_14px_30px_rgba(17,17,17,0.05)] before:opacity-0"
              >
                <div className="flex items-center gap-2">
                  <SacredDot tone="green" />
                  <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[#4CBB17]">Trust Note</p>
                </div>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  For accurate Kundli, exact date, time and place are important.
                </p>
              </Card>

              <Card
                tone="default"
                className="min-w-0 space-y-4 border-[rgba(184,137,67,0.22)] bg-white shadow-[0_14px_30px_rgba(17,17,17,0.05)] before:opacity-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                      Advanced Details +
                    </p>
                    <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-body-lg)] text-[#111111]">
                      Static preview only
                    </h2>
                  </div>
                  <Badge tone="outline" className="border border-black/8 bg-white text-[#111111]">
                    Not editable here
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {advancedDetails.map((item) => (
                    <div
                      key={item.label}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-[0.95rem] border border-black/8 bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(17,17,17,0.035)]"
                    >
                      <span className="text-[0.78rem] font-semibold text-[#111111]">{item.label}</span>
                      <span className="text-right text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--color-ink-muted)]">
                        {item.note}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="space-y-5 py-7 sm:py-9">
            <div className="space-y-2">
              <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                What You Will Get
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[#111111]">
                Kundli output prepared for real backend response
              </h2>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {resultItems.map((item, index) => (
                <div
                  key={item}
                  className="min-w-0 rounded-[1.1rem] border border-[rgba(184,137,67,0.2)] bg-white px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_rgba(17,17,17,0.045)]"
                >
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(184,137,67,0.24)] bg-white shadow-[0_8px_18px_rgba(17,17,17,0.04)]">
                    <span className="text-[0.72rem] font-bold text-[color:var(--color-accent-strong)]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-[0.78rem] font-semibold leading-5 text-[#111111]">{item}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-b border-black/8 bg-white">
          <Container className="grid min-w-0 gap-4 py-7 sm:py-9 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <Card
              tone="default"
              className="min-w-0 space-y-4 border-[rgba(184,137,67,0.24)] bg-white shadow-[0_16px_36px_rgba(17,17,17,0.055)] before:opacity-0"
            >
              <div className="flex items-center gap-2">
                <SacredDot />
                <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                  Result
                </p>
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[#111111]">
                Kundli result will appear after generation.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                No sample chart, prediction, Dasha, dosha, remedy, or interpretation is shown before
                a real authenticated backend response.
              </p>
            </Card>

            <Card
              tone="default"
              className="min-w-0 space-y-4 border-[rgba(76,187,23,0.22)] bg-white shadow-[0_16px_36px_rgba(17,17,17,0.055)] before:opacity-0"
            >
              <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                Birth Time Help
              </Badge>
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[#111111]">
                  Not sure about birth time?
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Exact time improves Lagna, Dasha and chart accuracy.
                </p>
              </div>
              <TrackedLink
                href={localize("/consultation")}
                eventName="consultation_cta_click"
                eventPayload={{ page: "/kundli", feature: "kundli-birth-time-help" }}
                className={buttonStyles({
                  tone: "secondary",
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Consult Astrologer
              </TrackedLink>
            </Card>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="space-y-5 py-7 sm:py-9">
            <div className="space-y-2">
              <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                Next Steps
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[#111111]">
                Continue safely after your Kundli foundation
              </h2>
            </div>

            <div className="grid min-w-0 gap-3 md:grid-cols-3">
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
                    className="h-full min-w-0 space-y-4 border-[rgba(184,137,67,0.22)] bg-white shadow-[0_14px_32px_rgba(17,17,17,0.05)] transition hover:-translate-y-0.5 hover:border-[rgba(184,137,67,0.36)] before:opacity-0"
                  >
                    <div className="flex items-center gap-2">
                      <SacredDot tone={step.href === "/ai" ? "green" : "gold"} />
                      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                        {step.cta}
                      </p>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-body-lg)] text-[#111111]">
                      {step.title}
                    </h3>
                    <p className="text-[0.86rem] leading-6 text-[color:var(--color-ink-body)]">
                      {step.description}
                    </p>
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
