import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import {
  consultationHost,
  consultationPackages,
  consultationProcess,
  recommendConsultationNextAction,
} from "@/modules/consultations";

export const metadata = buildPageMetadata({
  title: "Consultations With Joy Prakash Sarmah",
  description:
    "Reserve a premium astrology consultation with Joy Prakash Sarmah through NAVAGRAHA CENTRE's calm, explicit booking flow.",
  path: "/consultation",
  keywords: [
    "Joy Prakash Sarmah consultation",
    "premium astrology booking",
    "manual astrology booking flow",
  ],
});

function formatCurrencyFromMinor(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function ConsultationPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    intent?: string;
  }>;
}>) {
  const resolvedSearchParams = await searchParams;
  const conversion = recommendConsultationNextAction({
    surface: "consultation",
    explicitIntent: resolvedSearchParams.intent,
    contextHint: "consultation package selection",
  });

  return (
    <>
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

      <Section
        eyebrow="Service Packages"
        title="Packages built for different kinds of consultation depth."
        description={conversion.guidanceLine}
      >
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
                <Badge tone="outline">
                  From {formatCurrencyFromMinor(item.priceFromMinor)}
                </Badge>
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
                <Link
                  href={`/dashboard/consultations/book?package=${item.slug}`}
                  className={buttonStyles({ tone: "secondary", size: "sm" })}
                >
                  Reserve This Format
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="How It Works"
        title="The flow stays manual, explicit, and easy to follow."
        description="The consultation path stays human-led, avoids hidden complexity, and keeps timezone handling explicit."
        tone="muted"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {consultationProcess.map((step, index) => (
            <Card key={step.title} className="space-y-4">
              <Badge tone="neutral">{`0${index + 1}`}</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {step.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

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
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/consultations/book"
              className={buttonStyles({ size: "lg" })}
            >
              Continue To Booking
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
