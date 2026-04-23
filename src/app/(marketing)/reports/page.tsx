import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import {
  CredibilityMarkersSection,
  ExpectationSettingSection,
  SampleProofPreviewSection,
  TestimonialsSection,
  ThreeStepProcessSection,
  TrustIndicatorStrip,
} from "@/modules/marketing/components/trust-conversion-sections";
import {
  ConsultationTiersSection,
  ReportPackagesSection,
} from "@/modules/subscriptions/components/revenue-readiness-panels";

export const metadata = buildPageMetadata({
  title: "Reports",
  description:
    "Explore NAVAGRAHA CENTRE report packages with clear value hierarchy and limited launch free access.",
  path: "/reports",
  keywords: [
    "astrology reports",
    "career report",
    "compatibility report",
    "premium report packages",
  ],
});

const reportTrustIndicators = [
  "Vedic chart-based system",
  "Lahiri sidereal foundation",
  "Human-guided interpretation",
  "Limited-time free access",
  "Structured astrology workflow",
] as const;

const reportTestimonials = [
  {
    name: "K. Banerjee",
    quote:
      "The report layers made it easy to move from quick insight to deeper guidance without confusion.",
    tag: "Report Depth",
  },
  {
    name: "D. Saikia",
    quote:
      "I got practical direction first and then used consultation only where the decisions were sensitive.",
    tag: "Career + Consultation",
  },
  {
    name: "V. Nair",
    quote:
      "The free preview had real value, and the premium structure felt clear rather than aggressive.",
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

      <PageHero
        eyebrow="Report Hub"
        title="Premium report architecture prepared for launch conversion."
        description="The report system is structured into Essential, Advanced, and Premium value layers while all services remain free during limited launch access."
        highlights={[
          "Future-ready package hierarchy without activating payments.",
          "Clear progression from report preview to deeper interpretation.",
          "Direct path into consultation and AI follow-up when needed.",
        ]}
        note="Use this hub to compare report depth quickly, then continue with the report that fits your current decision context."
        primaryAction={{ href: "/career-report", label: "Get Free Report" }}
        secondaryAction={{ href: "/ai", label: "Start Free Analysis" }}
        supportTitle="Launch Offer Structure"
      />

      <TrustIndicatorStrip items={reportTrustIndicators} />

      <ThreeStepProcessSection
        tone="light"
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
              "Continue into NAVAGRAHA AI or consultation when you need nuanced, human-guided follow-up.",
          },
        ]}
      />

      <ReportPackagesSection pagePath="/reports" tone="light" />

      <Section
        tone="muted"
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
            <Card key={item.title} interactive className="space-y-3">
              <Badge tone="trust">Currently Free</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.description}
              </p>
              <TrackedLink
                href={item.href}
                eventName="report_preview_opened"
                eventPayload={{ page: "/reports", feature: `report-entry-${item.title}` }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
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

      <TestimonialsSection
        pagePath="/reports"
        testimonials={reportTestimonials}
        tone="muted"
        title="Users trust reports when value hierarchy is clear."
        description="Feedback shows that users convert better when reports are structured, calm, and chart-grounded."
      />

      <ExpectationSettingSection tone="transparent" />

      <CredibilityMarkersSection
        pagePath="/reports"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Premium Experience</Badge>
            <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
              Continue from report insight to guided interpretation.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Start with reports, ask deeper follow-up in NAVAGRAHA AI, then move into consultation when high-context decisions need human guidance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href="/ai"
              eventName="premium_click"
              eventPayload={{ page: "/reports", feature: "reports-cta-ai" }}
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              Try NAVAGRAHA AI
            </TrackedLink>
            <TrackedLink
              href="/consultation"
              eventName="premium_click"
              eventPayload={{ page: "/reports", feature: "reports-cta-consultation" }}
              className={buttonStyles({ size: "sm" })}
            >
              Book Free Consultation
            </TrackedLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
