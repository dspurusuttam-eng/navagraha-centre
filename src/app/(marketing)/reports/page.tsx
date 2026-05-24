import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { ConsultationCTA } from "@/components/monetization/ConsultationCTA";
import { ReportCTA } from "@/components/monetization/ReportCTA";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { PremiumReportsGraphic } from "@/components/graphics/service-graphics";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import {
  CredibilityMarkersSection,
  ExpectationSettingSection,
  SampleProofPreviewSection,
  GuidanceNotesSection,
  ThreeStepProcessSection,
  TrustIndicatorStrip,
} from "@/modules/marketing/components/trust-conversion-sections";
import {
  ConsultationTiersSection,
  ReportPackagesSection,
} from "@/modules/subscriptions/components/revenue-readiness-panels";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("reports", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/reports",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology reports",
      "kundli report",
      "career report",
      "marriage report",
      "vedic remedies report",
    ],
  });
}

const reportTrustIndicators = [
  "Vedic chart-based system",
  "Lahiri sidereal foundation",
  "Human-guided interpretation",
  "Launch preview access",
  "Structured astrology workflow",
] as const;

const reportGuidanceNotes = [
  {
    name: "Report Structure",
    quote:
      "Report layers should move from chart context to deeper guidance without implying generated samples or guaranteed results.",
    tag: "Report Depth",
  },
  {
    name: "Consultation Bridge",
    quote:
      "Users should understand when a report is enough and when human consultation is more appropriate.",
    tag: "Career + Consultation",
  },
  {
    name: "Offer Clarity",
    quote:
      "Report options should be framed clearly without free-generation or pressure.",
    tag: "Premium Clarity",
  },
] as const;

export default function ReportsPage() {
  return (
    <>
      <PageViewTracker page="/reports" feature="reports-page" />
      <AnalyticsEventTracker
        event="report_view"
        payload={{ page: "/reports", feature: "reports-page" }}
      />

      <main className="launch-page launch-page-reports">
      <PageHero
        eyebrow="Premium Reports"
        title="Structured astrology reports for deeper chart-based guidance."
        description="Choose report depth by decision context: focused structure, expanded analysis, or premium synthesis that can continue into Ask NI follow-up or consultation."
        highlights={[
          "Chart-based analysis grounded in deterministic astrology outputs.",
          "Predictive intelligence context for timing, themes, and next steps.",
          "Private report paths with consultation follow-up when nuance is needed.",
        ]}
        note="Start with report options first. Deeper report and consultation pathways are positioned as optional next steps, not pressure."
        primaryAction={{ href: "/career-report", label: "View Report Options" }}
        secondaryAction={{ href: "/kundli", label: "Generate Kundli", tone: "secondary" }}
        supportTitle="Report Trust Markers"
      />

      <TrustIndicatorStrip items={reportTrustIndicators} />

      <ThreeStepProcessSection
        tone="light"
        eyebrow="How Reports Work"
        title="How reports move from preview to guided clarity."
        description="The report system keeps one simple three-step progression for users."
        steps={[
          {
            title: "Generate chart context",
            description:
              "Start with validated birth context so all report sections stay anchored to a trusted chart foundation.",
          },
          {
            title: "Review structured report layers",
            description:
              "Use Essential, Advanced, and Premium depth according to your current decision complexity.",
          },
          {
            title: "Escalate only when needed",
            description:
              "Continue into NAVAGRAHA Intelligence or consultation when you need nuanced, human-guided follow-up.",
          },
        ]}
      />

      <ReportPackagesSection pagePath="/reports" tone="light" />

      <Section
        tone="muted"
        category="services"
        eyebrow="Report Entry Paths"
        title="Choose your report focus"
        description="Each entry page routes into the same report architecture and protected continuity layers."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Career Report",
              href: "/career-report",
              description: "Professional direction, timing rhythm, and practical priorities.",
            },
            {
              title: "Marriage Report",
              href: "/marriage-compatibility",
              description: "Compatibility depth, communication themes, and relationship guidance.",
            },
            {
              title: "Finance Report",
              href: "/finance-report",
              description: "Resource discipline, planning rhythm, and risk-awareness context.",
            },
            {
              title: "Health Report",
              href: "/health-report",
              description: "Wellbeing pacing and reflective guidance with clear safety framing.",
            },
          ].map((item) => (
            <Card
              key={item.title}
              tone="light"
              interactive
              className="service-offering-card flex h-full flex-col space-y-3"
            >
              <Badge tone="trust">Report Option</Badge>
              <PremiumReportsGraphic className="h-24" />
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
              <TrackedLink
                href={item.href}
                eventName="report_preview_opened"
                eventPayload={{ page: "/reports", feature: `report-entry-${item.title}` }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "mt-auto w-full justify-center",
                })}
              >
                Open Report
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <ConsultationTiersSection pagePath="/reports" tone="light" />

      <SampleProofPreviewSection tone="light" />

      <GuidanceNotesSection
        pagePath="/reports"
        notes={reportGuidanceNotes}
        tone="muted"
        eyebrow="Guidance Notes"
        title="Reports stay trustworthy when value hierarchy is clear."
        description="These notes explain report structure without presenting unverifiable user claims."
      />

      <ExpectationSettingSection tone="transparent" />

      <CredibilityMarkersSection
        pagePath="/reports"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />

      <Section className="pt-0" tone="transparent">
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportCTA
            pagePath="/reports"
            placement="reports_mid"
            title="Need a focused report package?"
            description="Compare report categories, then start with the package that matches your current life decision."
            ctaLabel="View Report Options"
            startingPrice="Launch preview guidance"
          />
          <ConsultationCTA
            pagePath="/reports"
            placement="reports_mid"
            title="Need help choosing the right report?"
            description="Talk to an astrologer first if you need a clear report direction before committing."
          />
        </div>
      </Section>

      <Section
        className="pt-0"
        tone="transparent"
        category="services"
        eyebrow="Trust + Terms"
        title="Report access stays clear, private, and non-pressure."
        description="Reports are guidance tools. They do not guarantee outcomes or replace professional medical, legal, or financial advice."
      >
        <Card tone="light" className="service-offering-card grid gap-4 md:grid-cols-3">
          {[
            { href: "/privacy", label: "Privacy Policy", text: "How user data and account context are handled." },
            { href: "/terms", label: "Terms", text: "Service expectations and platform usage boundaries." },
            { href: "/refund-cancellation", label: "Refund Policy", text: "Refund and cancellation guidance for paid flows when active." },
          ].map((item) => (
            <div key={item.href} className="space-y-2">
              <Badge tone="trust">{item.label}</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.text}
              </p>
              <TrackedLink
                href={item.href}
                eventName="cta_click"
                eventPayload={{ page: "/reports", feature: `reports-trust-${item.label}` }}
                className={buttonStyles({ size: "sm", tone: "ghost" })}
              >
                Read {item.label}
              </TrackedLink>
            </div>
          ))}
        </Card>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="service-card grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Premium Experience</Badge>
            <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
              Continue from report insight to guided interpretation.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Start with reports, ask deeper follow-up in NAVAGRAHA Intelligence, then move into consultation when high-context decisions need human guidance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href="/ai"
              eventName="premium_click"
              eventPayload={{ page: "/reports", feature: "reports-cta-ai" }}
              className={buttonStyles({ size: "sm", tone: "ni" })}
            >
              Ask NI
            </TrackedLink>
            <TrackedLink
              href="/consultation"
              eventName="premium_click"
              eventPayload={{ page: "/reports", feature: "reports-cta-consultation" }}
              className={buttonStyles({ size: "sm" })}
            >
              Consultation Support
            </TrackedLink>
          </div>
        </Card>
      </Section>
      </main>
    </>
  );
}
