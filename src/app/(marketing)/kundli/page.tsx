import { TrackedLink } from "@/components/analytics/tracked-link";
import { ConsultationCTA } from "@/components/monetization/ConsultationCTA";
import { PremiumAICTA } from "@/components/monetization/PremiumAICTA";
import { ReportCTA } from "@/components/monetization/ReportCTA";
import { PageHero } from "@/components/site/page-hero";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import {
  CredibilityMarkersSection,
  ExpectationSettingSection,
  SampleProofPreviewSection,
  ThreeStepProcessSection,
  TrustIndicatorStrip,
} from "@/modules/marketing/components/trust-conversion-sections";

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
      "free kundli",
      "AI birth chart analysis",
      "lagna chart",
      "vedic kundli",
      "rashi and navamsa guidance",
    ],
  });
}
export const revalidate = 3600;

const kundliTrustIndicators = [
  "Vedic chart-based system",
  "Lahiri sidereal foundation",
  "Human-guided interpretation",
  "Limited-time free access",
  "Structured astrology workflow",
] as const;

export default function KundliPage() {
  return (
    <>
      <PageHero
        eyebrow="Kundli Foundation"
        title="Build your Kundli first, then unlock deeper personalized guidance."
        description="This route is designed as the primary chart entry. Start with validated birth context and continue into AI, reports, and consultation from one structured foundation."
        highlights={[
          "Validated birth context with location, timezone, and UTC normalization.",
          "Sidereal Lahiri chart pipeline with Lagna and house structure.",
          "Saved chart continuity across assistant, reports, and consultation surfaces.",
        ]}
        note="Deeper personalization begins after Kundli generation and saved-chart continuity."
        primaryAction={{ href: "/sign-up", label: "Generate Your Kundli" }}
        secondaryAction={{ href: "/dashboard/onboarding", label: "Continue To Onboarding" }}
        supportTitle="Chart-First Flow"
      />

      <TrustIndicatorStrip items={kundliTrustIndicators} />

      <ThreeStepProcessSection
        tone="light"
        title="How Kundli setup works in three steps."
        description="One stable process ensures chart quality before interpretation."
        steps={[
          {
            title: "Enter birth details",
            description:
              "Provide date, time, and place once through a validated onboarding flow.",
          },
          {
            title: "Generate chart foundation",
            description:
              "The system builds your sidereal chart, Lagna, houses, and planetary structure deterministically.",
          },
          {
            title: "Continue with guidance",
            description:
              "Use NAVAGRAHA AI, reports, and consultation with the same saved chart context.",
          },
        ]}
      />

      <Section
        tone="muted"
        eyebrow="Kundli Value"
        title="What you receive immediately after chart generation."
        description="The output is structured for clarity and continuation, not one-time generic reading."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Lagna + House Structure",
              description:
                "A complete whole-sign house model anchored to your Lagna for stable interpretation continuity.",
            },
            {
              title: "Planetary Context",
              description:
                "Graha placements, nakshatra references, and house mapping in one reusable chart object.",
            },
            {
              title: "Protected Reuse",
              description:
                "The chart is saved and reused for Ask My Chart, reports, and consultation follow-up.",
            },
          ].map((item) => (
            <Card key={item.title} className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] text-[var(--color-ink-strong)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <SampleProofPreviewSection tone="light" />

      <ExpectationSettingSection tone="transparent" />

      <CredibilityMarkersSection
        pagePath="/kundli"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />

      <Section className="pt-0" tone="transparent">
        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          <ConsultationCTA pagePath="/kundli" placement="kundli_footer" />
          <ReportCTA pagePath="/kundli" placement="kundli_footer" />
          <PremiumAICTA pagePath="/kundli" placement="kundli_footer" />
        </div>

        <Card tone="accent" className="flex flex-wrap items-center gap-3">
          <TrackedLink
            href="/sign-up"
            eventName="cta_click"
            eventPayload={{ page: "/kundli", feature: "kundli-final-cta-primary" }}
            className={buttonStyles({ size: "lg" })}
          >
            Generate Your Kundli
          </TrackedLink>
          <TrackedLink
            href="/ai"
            eventName="cta_click"
            eventPayload={{ page: "/kundli", feature: "kundli-final-cta-ai" }}
            className={buttonStyles({ size: "lg", tone: "secondary" })}
          >
            Try NAVAGRAHA AI
          </TrackedLink>
        </Card>
      </Section>
    </>
  );
}
