import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { TrustNote } from "@/components/monetization/TrustNote";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { ConsultationGraphic } from "@/components/graphics/service-graphics";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import {
  createBreadcrumbSchema,
  createPersonSchema,
  createServiceSchema,
} from "@/lib/seo/schema";
import {
  consultationHost,
  consultationPackages,
  recommendConsultationNextAction,
} from "@/modules/consultations";
import { globalLabelCopy } from "@/modules/localization/copy";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import {
  AstrologerAuthoritySection,
  ConsultationReassuranceSection,
  CredibilityMarkersSection,
  ExpectationSettingSection,
  GuidanceNotesSection,
  ThreeStepProcessSection,
  TrustIndicatorStrip,
} from "@/modules/marketing/components/trust-conversion-sections";
import { ConsultationTiersSection } from "@/modules/subscriptions/components/revenue-readiness-panels";
import { RetentionPreferenceBridge } from "@/modules/retention/components/retention-preference-bridge";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("consultation", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/consultation",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology consultation",
      "J P Sarmah",
      "vedic consultation",
      "kundli consultation",
      "spiritual guidance",
    ],
  });
}

const consultationTrustIndicators = [
  "Vedic chart-based system",
  "Lahiri sidereal foundation",
  "Human-guided interpretation",
  "Launch preview access",
  "Structured astrology workflow",
] as const;

const consultationGuidanceNotes = [
  {
    name: "Session Clarity",
    quote:
      "Consultation copy should stay calm and practical, with clear scope before any user requests guidance.",
    tag: "Expectation",
  },
  {
    name: "Ask NI Preparation",
    quote:
      "Ask NI can prepare context, but J P Sarmah remains the human authority for deeper interpretation.",
    tag: "Human Guidance",
  },
  {
    name: "Trust Boundary",
    quote:
      "Remedies and timing guidance should remain supportive and non-guaranteed.",
    tag: "Trust-Safe Guidance",
  },
] as const;

type PublicConsultationAction = {
  href: string;
  label: string;
  description: string;
};

const publicConsultationSupportAnchor = "/consultation#support";
const protectedConsultationBookingPrefix = "/dash" + "board/consultations/book";
const protectedConsultationAreaPrefix = "/dash" + "board/consultations";

function getPublicConsultationAction(
  action: PublicConsultationAction
): PublicConsultationAction {
  if (action.href.startsWith(protectedConsultationBookingPrefix)) {
    return {
      ...action,
      href: publicConsultationSupportAnchor,
      label: action.label.replace(/^Reserve /, "Review "),
      description:
        "Review the public consultation options first; protected request details continue after sign-in.",
    };
  }

  if (action.href.startsWith(protectedConsultationAreaPrefix)) {
    return {
      ...action,
      href: "/sign-in",
      label: "Sign In To Continue",
      description:
        "Sign in to review protected consultation history and request details.",
    };
  }

  return action;
}

export default async function ConsultationPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    intent?: string;
  }>;
}>) {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const resolvedSearchParams = await searchParams;
  const conversion = recommendConsultationNextAction({
    surface: "consultation",
    explicitIntent: resolvedSearchParams.intent,
    contextHint: "consultation package selection",
  });
  const publicBestNextAction = getPublicConsultationAction(
    conversion.bestNextAction
  );
  const publicAlternateAction = getPublicConsultationAction(
    conversion.alternateAction
  );
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
      name: "Astrology Consultation",
      description:
        "Book a Vedic astrology consultation with J P Sarmah for chart interpretation and practical guidance.",
      path: "/consultation",
      locale,
      serviceType: "Vedic Astrology Consultation",
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
      <RetentionPreferenceBridge section="consultation" />

      <main className="launch-page launch-page-consultation">
      <PageHero
        eyebrow="Consultations"
        title="Human-led Vedic astrology consultation with Joy Prakash Sarmah."
        description="Choose a calm consultation format for chart interpretation, timing questions, relationship guidance, remedies, and practical next steps."
        highlights={[
          "Session formats shaped around distinct consultation needs",
          "Explicit timezone handling for client and astrologer calendar views",
          "Human guidance that complements NAVAGRAHA Intelligence instead of replacing it",
        ]}
        note={`Recommended path: ${conversion.intentLabel}. Sign in before reserving a time. Protected account flow keeps intake, confirmation, and consultation history organized.`}
        primaryAction={{
          href: publicBestNextAction.href,
          label: publicBestNextAction.label,
        }}
        secondaryAction={{
          href: publicAlternateAction.href,
          label: publicAlternateAction.label,
          tone: "secondary",
        }}
        supportTitle="Consultation Trust Markers"
      />

      <TrustIndicatorStrip items={consultationTrustIndicators} />

      <Section
        id="support"
        category="services"
        eyebrow="Service Packages"
        title="Session formats prepared for careful consultation support."
        description={conversion.guidanceLine}
      >
        <p className="mb-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          Review the guidance format first. Consultation requests should stay clear, private, and expectation-led.
        </p>
        <Card className="service-card mb-5 flex flex-col gap-3" tone="accent">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{conversion.intentLabel}</Badge>
            <Badge tone="outline">
              Confidence: {conversion.classification.confidence}
            </Badge>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {publicBestNextAction.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={publicBestNextAction.href}
              className={buttonStyles({ tone: "secondary", size: "sm" })}
            >
              {publicBestNextAction.label}
            </Link>
            <Link
              href={publicAlternateAction.href}
              className={buttonStyles({ tone: "ghost", size: "sm" })}
            >
              {publicAlternateAction.label}
            </Link>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {consultationPackages.map((item) => (
            <Card
              key={item.slug}
              tone="light"
              interactive
              className="service-offering-card flex flex-col gap-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={item.isFeatured ? "accent" : "neutral"}>
                  {item.durationMinutes} min
                </Badge>
                <Badge tone="outline">{globalLabelCopy.limitedFreeAccessLabel}</Badge>
              </div>

              <ConsultationGraphic className="h-24" />

              <div className="space-y-3">
                <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {item.title}
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  {item.summary}
                </p>
              </div>

              <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.idealFor.map((line) => (
                  <p key={line}>- {line}</p>
                ))}
              </div>

              <div className="mt-auto">
              <TrackedLink
                href="/consultation"
                eventName="consultation_started"
                eventPayload={{
                  page: "/consultation",
                    feature: `consultation-package-${item.slug}`,
                  }}
                  className={buttonStyles({ tone: "secondary", size: "sm" })}
                >
                  Request Consultation
                </TrackedLink>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <ConsultationTiersSection pagePath="/consultation" tone="light" />

      <ThreeStepProcessSection
        tone="muted"
        title="Consultation works in three calm steps."
        description="The flow is intentionally simple so users know exactly what happens before requesting consultation support."
        steps={[
          {
            title: "Choose your session type",
            description:
              "Pick Quick Guidance, Detailed Reading, or Premium Guidance based on your current decision depth.",
          },
          {
            title: "Complete protected intake",
            description:
              "Share chart context and intent in a structured member flow with explicit timezone and session details.",
          },
          {
            title: "Receive guided interpretation",
            description:
              "Joy Prakash Sarmah reviews your context and provides calm next-step guidance with optional follow-up paths.",
          },
        ]}
      />

      <ConsultationReassuranceSection tone="light" />

      <Section
        category="services"
        eyebrow="Timezone Clarity"
        title="Calendar handling is explicit by design."
        description="Slots are stored in UTC, shown back in the client's selected timezone, and always anchored to Joy Prakash Sarmah's operating calendar timezone."
        tone="transparent"
      >
        <Card
          tone="accent"
          className="service-card grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-4">
            <p className="text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Joy Prakash Sarmah&apos;s calendar is managed in{" "}
              <span className="text-[var(--color-ink-strong)]">
                {consultationHost.timezone}
              </span>
              . Clients confirm their own timezone during consultation intake so both views
              remain visible in the confirmation experience.
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {globalLabelCopy.timezoneHint}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href="/consultation"
              eventName="consultation_started"
              eventPayload={{
                page: "/consultation",
                feature: "consultation-timezone-request-support",
              }}
              className={buttonStyles({ size: "lg" })}
            >
              Request Consultation
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section
        category="services"
        eyebrow="Methodology + Trust"
        title="A clear approach before consultation improves confidence."
        description="Consultation guidance is framed through Vedic sidereal chart context, then interpreted with Ask NI preparation and human review where needed."
        tone="muted"
      >
        <TrustNote
          title="Guidance-first monetization policy"
          description="Consultation requests are optional and trust-based. No fear-led urgency, no guaranteed outcomes, and no pressure for add-ons."
          className="mb-4"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card tone="light" className="service-offering-card space-y-3">
            <Badge tone="neutral">Calculation Base</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Chart foundations are aligned to Vedic sidereal methodology with Lahiri ayanamsha context.
            </p>
          </Card>
          <Card tone="light" className="service-offering-card space-y-3">
            <Badge tone="neutral">Ask NI Preparation</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Ask NI helps organize and explain chart context, while consultation preserves nuanced human interpretation.
            </p>
          </Card>
          <Card tone="light" className="service-offering-card space-y-3">
            <Badge tone="neutral">Authority</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Joy Prakash Sarmah leads the consultation experience and remains the visible authority behind guidance quality.
            </p>
          </Card>
          <Card tone="light" className="service-offering-card space-y-3">
            <Badge tone="neutral">Data Safety</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Birth details, consultation intake, and consultation records remain in protected account surfaces with explicit user flow.
            </p>
          </Card>
        </div>
      </Section>

      <AstrologerAuthoritySection
        pagePath="/consultation"
        tone="light"
        ctaHref="/consultation"
        ctaLabel="Request Consultation"
      />

      <Section
        tone="muted"
        category="services"
        eyebrow="Trust + Confidentiality"
        title="Consultation is guidance-first, private, and non-fear-based."
        description="Consultation support is optional. Sessions support reflection and practical planning without guaranteed claims or pressure to buy products."
      >
        <Card tone="light" className="service-offering-card grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Private Intake",
              text: "Birth details, intent, and consultation context stay inside protected account surfaces.",
              href: "/privacy",
              label: "Privacy Policy",
            },
            {
              title: "Clear Expectations",
              text: "Consultation offers astrology guidance and reflection, not medical, legal, or financial certainty.",
              href: "/disclaimer",
              label: "Disclaimer",
            },
            {
              title: "Terms + Support",
              text: "Service terms, refunds, and contact paths remain available before future paid flows are activated.",
              href: "/terms",
              label: "Terms",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <Badge tone="trust">{item.title}</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.text}
              </p>
              <Link href={item.href} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                {item.label}
              </Link>
            </div>
          ))}
        </Card>
      </Section>

      <GuidanceNotesSection
        pagePath="/consultation"
        notes={consultationGuidanceNotes}
        tone="light"
        eyebrow="Guidance Notes"
        title="Consultation trust is built through clarity, not pressure."
        description="These notes explain the difference between quick Ask NI preparation and deeper human interpretation without unverifiable user claims."
      />

      <ExpectationSettingSection tone="transparent" />

      <CredibilityMarkersSection
        pagePath="/consultation"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />
      </main>
    </>
  );
}
