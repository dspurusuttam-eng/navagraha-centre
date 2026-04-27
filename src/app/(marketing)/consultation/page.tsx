import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
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
  TestimonialsSection,
  ThreeStepProcessSection,
  TrustIndicatorStrip,
} from "@/modules/marketing/components/trust-conversion-sections";
import { ConsultationTiersSection } from "@/modules/subscriptions/components/revenue-readiness-panels";

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
  "Limited-time free access",
  "Structured astrology workflow",
] as const;

const consultationTestimonials = [
  {
    name: "T. Gupta",
    quote:
      "The session gave clarity on what to focus on next. It felt calm and practical, not dramatic.",
    tag: "Session Clarity",
  },
  {
    name: "L. Deka",
    quote:
      "AI helped me prepare questions, but consultation gave the nuance I needed for a major decision.",
    tag: "AI + Human Guidance",
  },
  {
    name: "J. Singh",
    quote:
      "I appreciated the clear boundaries and the way remedies were explained as supportive, not guaranteed.",
    tag: "Trust-Safe Guidance",
  },
] as const;

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

      <PageHero
        eyebrow="Consultations"
        title="Reserve a calm, premium consultation with Joy Prakash Sarmah."
        description="This booking flow is designed to feel explicit and composed: choose the right format, reserve a slot with clear timezone handling, and keep intake context protected inside the member dashboard."
        highlights={[
          "Service packages shaped around distinct consultation needs",
          "Explicit timezone handling for both client and astrologer calendar views",
          "Manual workflow centered on Joy Prakash Sarmah rather than generic automation",
        ]}
        note={`Recommended path: ${conversion.intentLabel}. Sign in before reserving a time. The private dashboard holds the booking form, confirmation, and consultation history.`}
        primaryAction={{
          href: conversion.bestNextAction.href,
          label: conversion.bestNextAction.label,
        }}
        secondaryAction={{
          href: conversion.alternateAction.href,
          label: conversion.alternateAction.label,
          tone: "secondary",
        }}
        supportTitle="Recommended Next Step"
      />

      <TrustIndicatorStrip items={consultationTrustIndicators} />

      <Section
        eyebrow="Service Packages"
        title="Session formats currently open under limited launch free access."
        description={conversion.guidanceLine}
      >
        <p className="mb-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          This consultation is currently free under limited launch access.
        </p>
        <Card className="mb-5 flex flex-col gap-3" tone="accent">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{conversion.intentLabel}</Badge>
            <Badge tone="outline">
              Confidence: {conversion.classification.confidence}
            </Badge>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {conversion.bestNextAction.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={conversion.bestNextAction.href}
              className={buttonStyles({ tone: "secondary", size: "sm" })}
            >
              {conversion.bestNextAction.label}
            </Link>
            <Link
              href={conversion.alternateAction.href}
              className={buttonStyles({ tone: "ghost", size: "sm" })}
            >
              {conversion.alternateAction.label}
            </Link>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {consultationPackages.map((item) => (
            <Card key={item.slug} interactive className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={item.isFeatured ? "accent" : "neutral"}>
                  {item.durationMinutes} min
                </Badge>
                <Badge tone="outline">{globalLabelCopy.limitedFreeAccessLabel}</Badge>
              </div>

              <div className="space-y-3">
                <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                  {item.title}
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {item.summary}
                </p>
              </div>

              <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.idealFor.map((line) => (
                  <p key={line}>- {line}</p>
                ))}
              </div>

              <div className="mt-auto">
                <TrackedLink
                  href={`/dashboard/consultations/book?package=${item.slug}`}
                  eventName="consultation_started"
                  eventPayload={{
                    page: "/consultation",
                    feature: `consultation-package-${item.slug}`,
                  }}
                  className={buttonStyles({ tone: "secondary", size: "sm" })}
                >
                  Book Free Consultation
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
        description="The flow is intentionally simple so users know exactly what happens before booking."
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
        eyebrow="Timezone Clarity"
        title="Calendar handling is explicit by design."
        description="Slots are stored in UTC, shown back in the client's selected timezone, and always anchored to Joy Prakash Sarmah's operating calendar timezone."
        tone="transparent"
      >
        <Card
          tone="accent"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-4">
            <p className="text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Joy Prakash Sarmah&apos;s calendar is managed in{" "}
              <span className="text-[color:var(--color-foreground)]">
                {consultationHost.timezone}
              </span>
              . Clients confirm their own timezone during booking so both views
              remain visible in the confirmation experience.
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {globalLabelCopy.timezoneHint}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href="/dashboard/consultations/book"
              eventName="consultation_started"
              eventPayload={{
                page: "/consultation",
                feature: "consultation-timezone-continue-booking",
              }}
              className={buttonStyles({ size: "lg" })}
            >
              Continue To Booking
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section
        eyebrow="Methodology + Trust"
        title="A clear approach before booking improves confidence."
        description="Consultation guidance is framed through Vedic sidereal chart context, then interpreted with AI support and human review where needed."
        tone="muted"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="space-y-3">
            <Badge tone="neutral">Calculation Base</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Chart foundations are aligned to Vedic sidereal methodology with Lahiri ayanamsha context.
            </p>
          </Card>
          <Card className="space-y-3">
            <Badge tone="neutral">AI + Jyotish</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              AI helps organize and explain chart context, while consultation preserves nuanced human interpretation.
            </p>
          </Card>
          <Card className="space-y-3">
            <Badge tone="neutral">Authority</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Joy Prakash Sarmah leads the consultation experience and remains the visible authority behind guidance quality.
            </p>
          </Card>
          <Card className="space-y-3">
            <Badge tone="neutral">Data Safety</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Birth details, booking intake, and consultation records remain in protected account surfaces with explicit user flow.
            </p>
          </Card>
        </div>
      </Section>

      <AstrologerAuthoritySection
        pagePath="/consultation"
        tone="light"
        ctaHref="/dashboard/consultations/book"
        ctaLabel="Continue To Booking"
      />

      <TestimonialsSection
        pagePath="/consultation"
        testimonials={consultationTestimonials}
        tone="light"
        title="Consultation trust is built through clarity, not pressure."
        description="These experiences highlight the difference between quick AI help and deeper human interpretation."
      />

      <ExpectationSettingSection tone="transparent" />

      <CredibilityMarkersSection
        pagePath="/consultation"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />
    </>
  );
}
