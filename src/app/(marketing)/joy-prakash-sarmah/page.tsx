import Link from "next/link";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { recommendConsultationNextAction } from "@/modules/consultations";
import {
  AstrologerAuthoritySection,
  CredibilityMarkersSection,
  ExpectationSettingSection,
} from "@/modules/marketing/components/trust-conversion-sections";
import { astrologerPage } from "@/modules/marketing/content";

export const metadata = buildPageMetadata({
  ...astrologerPage.metadata,
});

export default async function JoyPrakashSarmahPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    intent?: string;
  }>;
}>) {
  const resolvedSearchParams = await searchParams;
  const conversion = recommendConsultationNextAction({
    surface: "astrologer-profile",
    explicitIntent: resolvedSearchParams.intent,
    contextHint: "astrologer profile review",
  });

  return (
    <>
      <PageHero
        {...astrologerPage.hero}
        note={`${astrologerPage.hero.note} Recommended path: ${conversion.intentLabel}.`}
        primaryAction={{
          href: conversion.bestNextAction.href,
          label: conversion.bestNextAction.label,
        }}
        secondaryAction={{
          href: conversion.alternateAction.href,
          label: conversion.alternateAction.label,
          tone: "secondary",
        }}
      />

      <Section
        description="This public profile is designed to establish trust through tone, presence, and approach rather than invented biography details or exaggerated claims."
        eyebrow="Profile"
        title="A visible consultation authority at the center of the brand"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <EditorialPlaceholder
            annotations={[
              "Lead consulting presence",
              "Measured interpretation style",
              "Premium public-facing trust",
            ]}
            description="A refined visual treatment supports the profile while keeping the emphasis on tone, presence, and approach."
            eyebrow="Profile Portrait"
            title="Joy Prakash Sarmah"
          />

          <div className="grid gap-4">
            {astrologerPage.profileCards.map((item) => (
              <Card key={item.title} className="space-y-3">
                <Badge tone="neutral">Profile Detail</Badge>
                <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                  {item.title}
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section
        tone="muted"
        description="The profile should help visitors understand the kinds of conversations Joy Prakash Sarmah is best positioned to lead."
        eyebrow="Areas Of Guidance"
        title="Focus areas presented with restraint and clarity"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {astrologerPage.focusAreas.map((area) => (
            <Card
              key={area.title}
              interactive
              className="flex h-full flex-col gap-4"
            >
              <Badge tone="outline">Focus</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {area.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {area.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="transparent"
        eyebrow="Methodology"
        title="How the guidance system is positioned"
        description="Authority comes from a clear methodology, transparent boundaries, and consistent consultation handling rather than exaggerated claims."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="space-y-3">
            <Badge tone="outline">Vedic Foundation</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Chart context is built from Vedic sidereal structure with Lahiri ayanamsha alignment.
            </p>
          </Card>
          <Card className="space-y-3">
            <Badge tone="outline">Interpretation Model</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              NAVAGRAHA AI supports structured interpretation, while Joy Prakash Sarmah leads high-context human consultation.
            </p>
          </Card>
          <Card className="space-y-3">
            <Badge tone="outline">Trust Boundaries</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Guidance remains calm and non-deterministic, with remedies presented as optional support rather than pressure.
            </p>
          </Card>
        </div>
      </Section>

      <AstrologerAuthoritySection pagePath="/joy-prakash-sarmah" tone="light" />

      <ExpectationSettingSection tone="transparent" />

      <CredibilityMarkersSection
        pagePath="/joy-prakash-sarmah"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-4">
            <Badge tone="accent">Contact</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Continue to inquiry when the fit feels right.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.guidanceLine}
            </p>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.bestNextAction.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={conversion.bestNextAction.href}
              className={buttonStyles({ size: "lg" })}
            >
              {conversion.bestNextAction.label}
            </Link>
            <Link
              href={conversion.alternateAction.href}
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              {conversion.alternateAction.label}
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
