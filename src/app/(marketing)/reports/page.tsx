import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import type { ReactNode } from "react";

const heroActions = [
  {
    href: "#report-path-selector",
    label: "View Report Options",
    tone: "accent" as const,
    feature: "reports-view-options",
  },
  {
    href: "/kundli",
    label: "Generate Kundli",
    tone: "secondary" as const,
    feature: "reports-generate-kundli",
  },
  {
    href: "/ai",
    label: "Ask NI",
    tone: "ni" as const,
    feature: "reports-ask-ni",
  },
  {
    href: "/consultation",
    label: "Consult Expert",
    tone: "secondary" as const,
    feature: "reports-consult-expert",
  },
] as const;

const quickRail = [
  { label: "Paths", href: "#report-path-selector" },
  { label: "Packages", href: "#report-package-hierarchy" },
  { label: "Categories", href: "#report-categories" },
  { label: "How It Works", href: "#how-reports-work" },
  { label: "Ask NI", href: "/ai" },
] as const;

const pathSelector = [
  {
    need: "General life direction",
    report: "Life / Kundli Report",
    href: "/kundli",
    description: "Start with chart context before choosing deeper report layers.",
  },
  {
    need: "Career guidance",
    report: "Career Report",
    href: "/reports",
    description: "Use structured career themes without invented availability or pricing.",
  },
  {
    need: "Marriage guidance",
    report: "Marriage Report",
    href: "/matchmaking",
    description: "Connect relationship questions with Kundli and compatibility context.",
  },
  {
    need: "Finance clarity",
    report: "Finance Report",
    href: "/reports",
    description: "Frame finance questions as guidance, never as certainty or guarantees.",
  },
  {
    need: "Timing analysis",
    report: "Dasha / Transit Report",
    href: "/dasha",
    description: "Review life-phase timing with Dasha and present movement through Transit.",
  },
  {
    need: "Remedy direction",
    report: "Remedy Guidance Report",
    href: "/remedies",
    description: "Use remedy categories responsibly after chart and timing context.",
  },
  {
    need: "Expert review",
    report: "Consultation-ready Report",
    href: "/consultation",
    description: "Move to human review when decisions need high-context interpretation.",
  },
] as const;

const packageHierarchy = [
  {
    title: "Essential Report",
    description:
      "A concise structure for the core chart question, key themes, and next safe steps.",
    layers: ["Kundli basis", "focused theme", "responsible notes"],
  },
  {
    title: "Advanced Report",
    description:
      "A deeper structure for chart layers, Dasha or Transit timing, and decision context.",
    layers: ["chart depth", "timing layer", "question map"],
  },
  {
    title: "Premium Report",
    description:
      "A synthesis-ready structure for users who may continue into consultation review.",
    layers: ["full context", "follow-up questions", "expert bridge"],
  },
] as const;

const reportCategories = [
  {
    title: "Kundli & Life",
    items: ["Kundli Report", "Life Overview Report", "Personality / Lagna Report"],
    description:
      "Build from the birth chart foundation before moving into specialized questions.",
  },
  {
    title: "Career & Finance",
    items: ["Career Report", "Finance Report", "Business Timing Report"],
    description:
      "Organize professional and resource questions without certainty claims.",
  },
  {
    title: "Marriage & Family",
    items: ["Marriage Report", "Matchmaking Report", "Compatibility Review"],
    description:
      "Connect relationship questions with chart context and careful interpretation.",
  },
  {
    title: "Timing & Prediction",
    items: ["Dasha Report", "Transit Report", "Annual Guidance"],
    description:
      "Review timing layers as guidance, not fixed outcomes or instant decisions.",
  },
  {
    title: "Dosha & Remedies",
    items: ["Dosha-Yoga Report", "Remedy Guidance Report", "Navagraha Remedy Direction"],
    description:
      "Link diagnosis, timing, and remedy direction with responsible boundaries.",
  },
] as const;

const timelineSteps = [
  "Generate Kundli context",
  "Select report focus",
  "Review structured layers",
  "Ask NI for explanation",
  "Continue to J P Sarmah / consultation if needed",
  "Save only when the real report system is active",
] as const;

const safePaths = [
  { label: "Kundli", href: "/kundli" },
  { label: "Ask NI", href: "/ai" },
  { label: "Consultation", href: "/consultation" },
  { label: "Matchmaking", href: "/matchmaking" },
  { label: "Dosha-Yoga", href: "/dosha-yoga" },
  { label: "Remedies", href: "/remedies" },
  { label: "Dasha", href: "/dasha" },
  { label: "Transit", href: "/transit" },
  { label: "Panchang", href: "/panchang" },
  { label: "Tools", href: "/tools" },
  { label: "Reports", href: "/reports" },
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Reports & Life Guidance",
    description:
      "Premium Vedic report pathways for Kundli, career, marriage, finance, timing, remedies, and consultation-ready interpretation.",
    path: "/reports",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology reports",
      "kundli report",
      "career report",
      "marriage report",
      "finance report",
      "dasha report",
      "transit report",
      "remedy guidance report",
    ],
  });
}

export const revalidate = 3600;

function ReportLineGraphic() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-4 top-6 h-36 overflow-hidden sm:inset-x-8"
    >
      <div className="absolute left-4 top-3 h-28 w-20 rounded-[1.5rem] border border-[rgba(5,5,5,0.22)] bg-[#FFFFFF]" />
      <div className="absolute left-9 top-8 h-28 w-20 rounded-[1.5rem] border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF]" />
      <div className="absolute right-4 top-1 h-32 w-32 rounded-full border border-[rgba(5,5,5,0.14)]" />
      <div className="absolute right-12 top-9 h-16 w-16 rounded-full border border-[rgba(5,5,5,0.22)]" />
      <div className="absolute left-12 right-12 top-24 h-px bg-[rgba(5,5,5,0.18)]" />
      <div className="absolute left-[calc(50%-0.25rem)] top-[5.7rem] h-2 w-2 rounded-full bg-[#050505]" />
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

export default function ReportsPage() {
  return (
    <>
      <PageViewTracker page="/reports" feature="reports-page" />
      <AnalyticsEventTracker
        event="report_view"
        payload={{ page: "/reports", feature: "reports-page" }}
      />

      <main className="bg-[#FFFFFF] text-[#050505]">
        <section className="relative isolate overflow-hidden bg-[#FFFFFF] px-4 pb-10 pt-7 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.74fr)] lg:items-stretch">
            <div className="relative z-10 min-w-0 space-y-6 rounded-[2.35rem] border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF] p-5 shadow-[0_24px_70px_rgba(5,5,5,0.06)] sm:p-7 lg:p-9">
              <p className="inline-flex max-w-full whitespace-normal rounded-full border border-[rgba(5,5,5,0.18)] bg-[#FFFFFF] px-3 py-1 text-left text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.18em] text-[#050505] sm:tracking-[0.22em]">
                Premium Astrology Reports · Chart-Based Guidance
              </p>
              <div className="max-w-3xl space-y-4">
                <h1 className="text-[clamp(2.35rem,9vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.075em] text-[#050505]">
                  Reports & Life Guidance
                </h1>
                <p className="max-w-2xl text-[1.03rem] leading-8 text-[#171717] sm:text-[1.15rem]">
                  Structured Vedic report pathways for Kundli, career, marriage,
                  finance, timing, remedies, and consultation-ready interpretation.
                </p>
              </div>
              <div className="grid gap-3 min-[380px]:grid-cols-2 sm:flex sm:flex-wrap">
                {heroActions.map((action) => (
                  <TrackedLink
                    key={action.label}
                    href={action.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/reports", feature: action.feature }}
                    className={buttonStyles({
                      size: "sm",
                      tone: action.tone,
                      className: "min-h-12 w-full justify-center px-4 sm:w-auto sm:px-5",
                    })}
                  >
                    {action.label}
                  </TrackedLink>
                ))}
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {quickRail.map((item) => (
                  <TrackedLink
                    key={item.label}
                    href={item.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/reports", feature: `rail-${item.label}` }}
                    className="shrink-0 rounded-full border border-[rgba(5,5,5,0.13)] bg-[#FFFFFF] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#050505]"
                  >
                    {item.label}
                  </TrackedLink>
                ))}
              </div>
            </div>

            <div className="relative min-h-[22rem] min-w-0 overflow-hidden rounded-[2.35rem] border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF] p-5 shadow-[0_24px_70px_rgba(5,5,5,0.05)]">
              <ReportLineGraphic />
              <div className="relative z-10 mt-36 space-y-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                  Clean report architecture
                </p>
                <h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#050505]">
                  Pick the report path by decision, not by marketplace noise.
                </h2>
                <p className="text-sm leading-6 text-[#171717]">
                  Reports stay trust-led: chart context first, structured layers
                  second, Ask NI explanation and human review only when needed.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {["Chart", "Timing", "Review"].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[rgba(5,5,5,0.12)] bg-[#FFFFFF] px-3 py-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#050505]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="report-path-selector" className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7">
            <SectionHeader
              label="Report Path Selector"
              title="Choose the report direction by life question."
              description="A cleaner alternative to dense report marketplaces: start with the user's need, then move toward the right report structure."
            />
            <div className="grid gap-3 lg:grid-cols-7">
              {pathSelector.map((item, index) => (
                <TrackedLink
                  key={item.need}
                  href={item.href}
                  eventName="cta_click"
                  eventPayload={{ page: "/reports", feature: item.report }}
                  className="group rounded-[1.6rem] border border-[rgba(5,5,5,0.14)] bg-[#FFFFFF] p-4 text-left shadow-[0_16px_38px_rgba(5,5,5,0.04)] transition hover:border-[rgba(5,5,5,0.34)]"
                >
                  <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(5,5,5,0.2)] text-[0.72rem] font-semibold text-[#050505]">
                    {index + 1}
                  </span>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#050505]">
                    {item.need}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.035em] text-[#050505]">
                    {item.report}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#171717]">{item.description}</p>
                </TrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section
          id="report-package-hierarchy"
          className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl space-y-7">
            <SectionHeader
              label="Report Package Hierarchy"
              title="Depth is explained without fake commerce."
              description="Package names describe structure only. No fake values, fake availability, or inactive transaction flow is presented."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {packageHierarchy.map((item) => (
                <LineCard key={item.title} className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-semibold leading-tight tracking-[-0.045em] text-[#050505]">
                      {item.title}
                    </h3>
                    <span className="h-10 w-10 shrink-0 rounded-full border border-[rgba(5,5,5,0.16)] bg-[#FFFFFF]" />
                  </div>
                  <p className="text-sm leading-6 text-[#171717]">{item.description}</p>
                  <div className="space-y-2">
                    {item.layers.map((layer) => (
                      <div
                        key={layer}
                        className="flex items-center gap-3 rounded-full border border-[rgba(5,5,5,0.1)] bg-[#FFFFFF] px-3 py-2 text-sm text-[#050505]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#050505]" />
                        {layer}
                      </div>
                    ))}
                  </div>
                </LineCard>
              ))}
            </div>
          </div>
        </section>

        <section id="report-categories" className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7">
            <SectionHeader
              label="Report Categories"
              title="Organized around decisions, timing, and interpretation."
              description="Category cards stay informational unless a safe public route already exists. This keeps the page future-ready without pretending inactive systems are live."
            />
            <div className="grid gap-4 lg:grid-cols-5">
              {reportCategories.map((category) => (
                <LineCard key={category.title} className="space-y-4">
                  <h3 className="text-xl font-semibold leading-tight tracking-[-0.04em] text-[#050505]">
                    {category.title}
                  </h3>
                  <p className="text-sm leading-6 text-[#171717]">{category.description}</p>
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

        <section id="how-reports-work" className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <LineCard className="relative overflow-hidden">
              <div className="absolute inset-x-8 top-12 h-px bg-[rgba(5,5,5,0.16)]" />
              <div className="relative z-10 space-y-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#050505]">
                  How Reports Work
                </p>
                <h2 className="text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[#050505]">
                  A report should move in layers.
                </h2>
                <p className="text-[0.96rem] leading-7 text-[#171717]">
                  The path begins with Kundli context, moves through focus and
                  timing, then continues into explanation or expert review only
                  when needed.
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
                Ask NI Report Companion
              </p>
              <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1] tracking-[-0.055em] text-[#050505]">
                Ask NI can help decode the report language.
              </h2>
              <p className="text-sm leading-7 text-[#171717]">
                Ask NI can help explain report sections, chart terms, and what
                kind of report may fit your current question. It does not replace
                J P Sarmah or create unsupported report outputs.
              </p>
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{ page: "/reports", feature: "ask-ni-report-companion" }}
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
                Reports become stronger with expert interpretation.
              </h2>
              <p className="text-sm leading-7 text-[#171717]">
                Reports become more meaningful when Kundli structure, Dasha,
                Transit, Dosha, remedies, and practical life context are reviewed
                under expert guidance.
              </p>
              <div className="flex flex-wrap gap-3">
                <TrackedLink
                  href="/consultation"
                  eventName="cta_click"
                  eventPayload={{ page: "/reports", feature: "consult-expert" }}
                  className={buttonStyles({ size: "sm" })}
                >
                  Consult Expert
                </TrackedLink>
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{ page: "/reports", feature: "generate-kundli" }}
                  className={buttonStyles({ size: "sm", tone: "secondary" })}
                >
                  Generate Kundli
                </TrackedLink>
              </div>
            </LineCard>
          </div>
        </section>

        <section className="bg-[#FFFFFF] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7">
            <SectionHeader
              label="Safe Navigation"
              title="Continue through clear public paths."
              description="The Reports command centre connects to existing safe public surfaces only. No private, admin, transaction, or inactive file-flow routes are exposed."
            />
            <div className="flex flex-wrap justify-center gap-2">
              {safePaths.map((path) => (
                <TrackedLink
                  key={path.label}
                  href={path.href}
                  eventName="cta_click"
                  eventPayload={{ page: "/reports", feature: path.label }}
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
                  Report Trust & Privacy Boundary
                </p>
                <h2 className="text-[clamp(1.65rem,4vw,2.8rem)] font-semibold leading-[1] tracking-[-0.055em] text-[#050505]">
                  Guidance stays structured, private, and non-absolute.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "No guaranteed outcomes or fixed certainty claims.",
                  "No invented previews or unsupported report outputs.",
                  "Not a replacement for licensed professional guidance.",
                  "Private birth details should be handled responsibly.",
                  "Report guidance depends on accurate birth details.",
                  "Human review is recommended for sensitive decisions.",
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
