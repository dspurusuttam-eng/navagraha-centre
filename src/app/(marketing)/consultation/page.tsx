import type { ReactNode } from "react";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createPersonSchema,
  createServiceSchema,
} from "@/lib/seo/schema";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

const heroActions = [
  {
    href: "#prepare-consultation",
    label: "Prepare for Consultation",
    tone: "accent" as const,
    feature: "consultation-prepare",
  },
  {
    href: "/kundli",
    label: "Generate Kundli",
    tone: "secondary" as const,
    feature: "consultation-generate-kundli",
  },
  {
    href: "/reports",
    label: "View Reports",
    tone: "secondary" as const,
    feature: "consultation-view-reports",
  },
  {
    href: "/ai",
    label: "Ask NI",
    tone: "ni" as const,
    feature: "consultation-ask-ni",
  },
] as const;

const quickRail = [
  { label: "Concerns", href: "#consultation-paths" },
  { label: "Prepare", href: "#prepare-consultation" },
  { label: "Categories", href: "#consultation-categories" },
  { label: "How It Works", href: "#how-consultation-works" },
  { label: "Ask NI", href: "/ai" },
] as const;

const consultationPaths = [
  {
    concern: "Career & Work",
    href: "/kundli",
    description:
      "Frame career direction, education, work pressure, and role changes with chart context first.",
  },
  {
    concern: "Marriage & Relationship",
    href: "/matchmaking",
    description:
      "Prepare relationship questions with Kundli, timing, and compatibility context.",
  },
  {
    concern: "Finance & Business",
    href: "/reports",
    description:
      "Organize finance and business questions as guidance topics, not certainty claims.",
  },
  {
    concern: "Health-related Guidance Boundary",
    href: "/consultation",
    description:
      "Keep wellbeing questions within responsible boundaries and involve licensed care where needed.",
  },
  {
    concern: "Dosha / Remedies",
    href: "/dosha-yoga",
    description:
      "Review Dosha-Yoga and remedy direction without fear-based claims or instant fixes.",
  },
  {
    concern: "Dasha / Transit Timing",
    href: "/dasha",
    description:
      "Connect life-phase timing with Dasha and current movement before deeper review.",
  },
  {
    concern: "Family / Life Direction",
    href: "/reports",
    description:
      "Turn broad life decisions into a clear question set before human interpretation.",
  },
  {
    concern: "Report Review",
    href: "/reports",
    description:
      "Use existing report context to prepare sharper follow-up questions.",
  },
] as const;

const timelineSteps = [
  "Choose your concern",
  "Prepare accurate birth details",
  "Generate or review Kundli",
  "Check Dasha / Transit / Dosha context",
  "Ask NI for basic explanation",
  "Continue under J P Sarmah guidance",
  "Follow responsible next steps",
] as const;

const preparationChecklist = [
  "Date of birth",
  "Exact birth time",
  "Birth place",
  "Main question",
  "Existing Kundli or report, if any",
  "Recent life event context",
  "Preferred language",
] as const;

const consultationCategories = [
  {
    group: "Life & Career",
    items: [
      "Career direction",
      "Job or business timing",
      "Education guidance",
      "Finance and business review",
    ],
  },
  {
    group: "Marriage & Family",
    items: [
      "Marriage timing",
      "Matchmaking review",
      "Relationship concerns",
      "Family decision support",
    ],
  },
  {
    group: "Kundli & Timing",
    items: [
      "Kundli reading",
      "Dasha review",
      "Transit timing",
      "Panchang / Muhurat support",
    ],
  },
  {
    group: "Dosha & Remedies",
    items: [
      "Dosha-Yoga review",
      "Remedy direction",
      "Navagraha guidance",
      "Report follow-up",
    ],
  },
] as const;

const supportPaths = [
  { label: "Kundli", href: "/kundli" },
  { label: "Reports", href: "/reports" },
  { label: "Dasha", href: "/dasha" },
  { label: "Transit", href: "/transit" },
  { label: "Panchang", href: "/panchang" },
  { label: "Dosha-Yoga", href: "/dosha-yoga" },
  { label: "Remedies", href: "/remedies" },
  { label: "Matchmaking", href: "/matchmaking" },
  { label: "Tools", href: "/tools" },
  { label: "Ask NI", href: "/ai" },
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Consultation Guidance",
    description:
      "Responsible Vedic consultation preparation for Kundli, career, marriage, finance, timing, Dosha-Yoga, remedies, reports, and life decisions.",
    path: "/consultation",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology consultation",
      "J P Sarmah",
      "vedic consultation",
      "kundli consultation",
      "consultation preparation",
      "chart guidance",
    ],
  });
}

export const revalidate = 3600;

function ConsultationLineGraphic() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-4 top-6 h-40 overflow-hidden sm:inset-x-8"
    >
      <div className="absolute left-4 top-5 h-28 w-24 rounded-[1.5rem] border border-[rgba(5,5,5,0.2)] bg-[#FFFFFF]" />
      <div className="absolute left-10 top-11 h-28 w-24 rounded-[1.5rem] border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF]" />
      <div className="absolute right-5 top-4 h-32 w-32 rounded-full border border-[rgba(5,5,5,0.16)]" />
      <div className="absolute right-14 top-12 h-14 w-14 rounded-full border border-[rgba(5,5,5,0.24)]" />
      <div className="absolute left-14 right-16 top-[6.4rem] h-px bg-[rgba(5,5,5,0.18)]" />
      <div className="absolute left-[calc(50%-0.25rem)] top-[6.05rem] h-2 w-2 rounded-full bg-[#050505]" />
    </div>
  );
}

function SectionHeader({
  label,
  title,
  description,
}: Readonly<{
  label: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="mx-auto max-w-3xl space-y-3 text-center">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#050505]">
        {label}
      </p>
      <h2 className="text-[clamp(1.55rem,4vw,2.6rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-[#050505]">
        {title}
      </h2>
      <p className="text-[0.96rem] leading-7 text-[#171717]">{description}</p>
    </div>
  );
}

function LineCard({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={`rounded-[2rem] border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF] p-5 shadow-[0_18px_48px_rgba(5,5,5,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export default async function ConsultationPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const consultationSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Consultation", path: "/consultation" },
      ],
    }),
    createServiceSchema({
      name: "Consultation Guidance",
      description:
        "Responsible Vedic consultation preparation with J P Sarmah for chart interpretation and practical life questions.",
      path: "/consultation",
      locale,
      serviceType: "Vedic Consultation Guidance",
    }),
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
  ];

  return (
    <>
      <JsonLd id="consultation-page-schema" data={consultationSchemas} />
      <PageViewTracker page="/consultation" feature="consultation-page" />
      <AnalyticsEventTracker
        event="consultation_click"
        payload={{ page: "/consultation", feature: "consultation-page" }}
      />

      <main className="bg-[#FFFFFF] text-[#050505]">
        <section className="relative isolate overflow-hidden bg-[#FFFFFF] px-4 pb-10 pt-7 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.74fr)] lg:items-stretch">
            <LineCard className="min-w-0 overflow-hidden p-5 sm:p-7 lg:p-8">
              <div className="flex min-h-full flex-col justify-between gap-8">
                <div className="space-y-5">
                  <p className="max-w-full text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                    Expert Consultation · J P Sarmah Guidance
                  </p>
                  <div className="space-y-4">
                    <h1 className="text-[clamp(2.25rem,10vw,5.9rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-[#050505]">
                      Consultation Guidance
                    </h1>
                    <p className="max-w-3xl text-[1rem] leading-7 text-[#171717] sm:text-[1.08rem]">
                      Responsible Vedic consultation for Kundli, career,
                      marriage, finance, timing, Dosha-Yoga, remedies, reports,
                      and life decisions — guided by chart context and expert
                      interpretation.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-[430px]:grid min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
                  {heroActions.map((action) => (
                    <TrackedLink
                      key={action.label}
                      href={action.href}
                      eventName="cta_click"
                      eventPayload={{ page: "/consultation", feature: action.feature }}
                      className={`${buttonStyles({
                        size: "sm",
                        tone: action.tone,
                      })} w-full sm:w-auto`}
                    >
                      {action.label}
                    </TrackedLink>
                  ))}
                </div>
              </div>
            </LineCard>

            <LineCard className="relative min-h-[24rem] min-w-0 overflow-hidden p-0">
              <ConsultationLineGraphic />
              <div className="relative z-10 flex min-h-[24rem] flex-col justify-end p-5 sm:p-7">
                <div className="space-y-4 rounded-[1.7rem] border border-[rgba(5,5,5,0.16)] bg-[#FFFFFF] p-5 shadow-[0_18px_40px_rgba(5,5,5,0.06)]">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                    Preparation-first flow
                  </p>
                  <p className="text-2xl font-semibold leading-tight tracking-[-0.05em] text-[#050505]">
                    Choose concern, prepare birth context, then continue with
                    careful human review.
                  </p>
                  <div className="grid gap-2 text-sm text-[#171717]">
                    {["Kundli context", "Timing layer", "Question clarity"].map(
                      (item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-full border border-[rgba(5,5,5,0.12)] bg-[#FFFFFF] px-3 py-2"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#050505]" />
                          {item}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </LineCard>
          </div>

          <div className="mx-auto mt-4 max-w-7xl overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {quickRail.map((item) => (
                <TrackedLink
                  key={item.label}
                  href={item.href}
                  eventName="cta_click"
                  eventPayload={{ page: "/consultation", feature: item.label }}
                  className="rounded-full border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#050505] shadow-[0_8px_20px_rgba(5,5,5,0.035)]"
                >
                  {item.label}
                </TrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section id="consultation-paths" className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7">
            <SectionHeader
              label="Consultation Path Selector"
              title="Start with the concern, not a marketplace."
              description="This page avoids crowded astrologer listings and instant-sales patterns. It helps users prepare the right question before expert guidance."
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {consultationPaths.map((item, index) => (
                <TrackedLink
                  key={item.concern}
                  href={item.href}
                  eventName="cta_click"
                  eventPayload={{ page: "/consultation", feature: item.concern }}
                  className="group rounded-[1.6rem] border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF] p-4 text-left shadow-[0_16px_38px_rgba(5,5,5,0.04)] transition hover:border-[rgba(5,5,5,0.34)]"
                >
                  <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(5,5,5,0.2)] text-[0.72rem] font-semibold text-[#050505]">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold leading-tight tracking-[-0.035em] text-[#050505]">
                    {item.concern}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#171717]">{item.description}</p>
                </TrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section id="prepare-consultation" className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <LineCard className="space-y-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                Preparation Checklist
              </p>
              <h2 className="text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[#050505]">
                Return here before deeper guidance.
              </h2>
              <p className="text-[0.96rem] leading-7 text-[#171717]">
                A prepared question and accurate birth context make consultation
                clearer, calmer, and more useful.
              </p>
            </LineCard>
            <div className="grid gap-3 sm:grid-cols-2">
              {preparationChecklist.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[1.4rem] border border-[rgba(5,5,5,0.13)] bg-[#FFFFFF] p-4 shadow-[0_12px_30px_rgba(5,5,5,0.035)]"
                >
                  <span className="h-5 w-5 shrink-0 rounded-full border border-[rgba(5,5,5,0.22)]" />
                  <p className="text-sm font-medium tracking-[-0.02em] text-[#050505]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="consultation-categories"
          className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl space-y-7">
            <SectionHeader
              label="Consultation Categories"
              title="Grouped around life questions and chart layers."
              description="Each group keeps the consultation path easy to revisit without creating a marketplace listing feel."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              {consultationCategories.map((category) => (
                <LineCard key={category.group} className="space-y-4">
                  <h3 className="text-xl font-semibold leading-tight tracking-[-0.04em] text-[#050505]">
                    {category.group}
                  </h3>
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <p
                        key={item}
                        className="rounded-2xl border border-[rgba(5,5,5,0.1)] bg-[#FFFFFF] px-3 py-2 text-sm text-[#050505]"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </LineCard>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-consultation-works"
          className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <LineCard className="relative overflow-hidden">
              <div className="absolute inset-x-8 top-12 h-px bg-[rgba(5,5,5,0.16)]" />
              <div className="relative z-10 space-y-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                  How Consultation Works
                </p>
                <h2 className="text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[#050505]">
                  A careful review moves in layers.
                </h2>
                <p className="text-[0.96rem] leading-7 text-[#171717]">
                  The path begins with the question, then connects Kundli,
                  timing, Dosha-Yoga, reports, Ask NI explanation, and expert
                  interpretation.
                </p>
              </div>
            </LineCard>
            <div className="space-y-3">
              {timelineSteps.map((step, index) => (
                <div
                  key={step}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-[1.5rem] border border-[rgba(5,5,5,0.13)] bg-[#FFFFFF] p-4 shadow-[0_12px_30px_rgba(5,5,5,0.035)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(5,5,5,0.18)] text-sm font-semibold text-[#050505]">
                    {index + 1}
                  </span>
                  <p className="self-center text-base font-medium tracking-[-0.02em] text-[#050505]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
            <LineCard className="space-y-5 border-[rgba(0,160,255,0.32)] shadow-[0_20px_60px_rgba(0,160,255,0.08)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#0077B6]">
                Ask NI Support
              </p>
              <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1] tracking-[-0.055em] text-[#050505]">
                Ask NI can help prepare better questions.
              </h2>
              <p className="text-sm leading-7 text-[#171717]">
                Ask NI can help you understand basic chart terms, report
                sections, and what questions to prepare before speaking with
                NAVAGRAHA CENTRE. It does not replace J P Sarmah or provide
                final human consultation.
              </p>
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{ page: "/consultation", feature: "ask-ni-support" }}
                className={buttonStyles({ size: "sm", tone: "ni" })}
              >
                Ask NI
              </TrackedLink>
            </LineCard>

            <LineCard className="space-y-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                J P Sarmah Authority Layer
              </p>
              <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1] tracking-[-0.055em] text-[#050505]">
                Serious guidance should not depend on one factor alone.
              </h2>
              <p className="text-sm leading-7 text-[#171717]">
                Kundli, Dasha, Transit, Dosha-Yoga, remedies, reports, and
                practical life context should be reviewed carefully under J P
                Sarmah&apos;s expert guidance.
              </p>
              <div className="flex flex-wrap gap-3">
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{ page: "/consultation", feature: "authority-kundli" }}
                  className={buttonStyles({ size: "sm", tone: "secondary" })}
                >
                  Generate Kundli
                </TrackedLink>
                <TrackedLink
                  href="/reports"
                  eventName="cta_click"
                  eventPayload={{ page: "/consultation", feature: "authority-reports" }}
                  className={buttonStyles({ size: "sm" })}
                >
                  View Reports
                </TrackedLink>
              </div>
            </LineCard>
          </div>
        </section>

        <section className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7">
            <SectionHeader
              label="Support Paths"
              title="Continue through safe public surfaces."
              description="The Consultation dashboard connects users to preparation and guidance surfaces only. It does not expose restricted, transaction, or inactive request-flow routes."
            />
            <div className="flex flex-wrap justify-center gap-2">
              {supportPaths.map((path) => (
                <TrackedLink
                  key={path.label}
                  href={path.href}
                  eventName="cta_click"
                  eventPayload={{ page: "/consultation", feature: path.label }}
                  className="rounded-full border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF] px-4 py-2 text-sm font-semibold text-[#050505] transition hover:border-[rgba(5,5,5,0.34)]"
                >
                  {path.label}
                </TrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FFFFFF] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <LineCard className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div className="space-y-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                  Trust & Boundary Note
                </p>
                <h2 className="text-[clamp(1.65rem,4vw,2.8rem)] font-semibold leading-[1] tracking-[-0.055em] text-[#050505]">
                  Guidance stays careful, prepared, and non-absolute.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Astrology guidance is not a guaranteed outcome.",
                  "It does not replace licensed health, legal, or finance professionals.",
                  "No instant result or transaction claim is presented.",
                  "Birth details should be handled responsibly.",
                  "Consultation quality depends on accurate details.",
                  "Clear questions support better interpretation.",
                ].map((item) => (
                  <p
                    key={item}
                    className="rounded-2xl border border-[rgba(5,5,5,0.1)] bg-[#FFFFFF] px-4 py-3 text-sm leading-6 text-[#171717]"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </LineCard>
          </div>
        </section>
      </main>
    </>
  );
}
