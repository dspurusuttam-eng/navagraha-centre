import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import { PanchangToolPanel } from "@/modules/panchang/components/panchang-tool-panel";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("panchang", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/panchang",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "daily panchang",
      "tithi",
      "nakshatra",
      "yoga",
      "karana",
      "muhurat",
    ],
  });
}
export const revalidate = 3600;

const panchangFaqEntries = [
  {
    question: "How is this Panchang calculated?",
    answer:
      "The tool resolves place and timezone first, then calculates Tithi, Vara, Nakshatra, Yoga, and Karana using deterministic sidereal/Lahiri-aligned astrology calculations.",
  },
  {
    question: "Why do transition timings matter?",
    answer:
      "Transition timings show when core Panchang factors change during the day, helping you plan important work windows with better timing awareness.",
  },
  {
    question: "Should I check Panchang or Rashifal first?",
    answer:
      "Use Panchang for daily timing context first, then open Rashifal for sign-level guidance and NAVAGRAHA AI for chart-aware interpretation.",
  },
  {
    question: "Can I use this without creating an account?",
    answer:
      "Yes. Panchang is public for daily use. You can generate your Kundli later if you want deeper personalized guidance.",
  },
] as const;

const panchangFaqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: panchangFaqEntries.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: entry.answer,
    },
  })),
} as const;

export default function PanchangPage() {
  return (
    <>
      <PageViewTracker page="/panchang" feature="panchang-page" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(panchangFaqStructuredData),
        }}
      />

      <PageHero
        eyebrow="Daily Panchang Utility"
        title="Daily Panchang factors in one clean, reusable, chart-consistent format."
        description="Generate Tithi, Vara, Nakshatra, Yoga, Karana, sunrise, sunset, and moon sign for your selected date and place."
        highlights={[
          "Deterministic Panchang output using sidereal/Lahiri system alignment.",
          "Timezone-aware sunrise and sunset for location-specific daily context.",
          "Advanced timing utilities include Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta.",
          "Structured output ready for future AI, report, and content integration.",
        ]}
        note="Panchang is a timing reference layer and should be used with practical judgment for important decisions."
        primaryAction={{
          href: "#panchang-tool",
          label: "Start Free Analysis",
          eventName: "cta_click",
          eventPayload: {
            page: "/panchang",
            feature: "panchang-hero-primary",
          },
        }}
        secondaryAction={{
          href: "/ai",
          label: "Try NAVAGRAHA AI",
          eventName: "cta_click",
          eventPayload: {
            page: "/panchang",
            feature: "panchang-hero-secondary",
          },
        }}
        supportTitle="Daily Panchang Snapshot"
      />

      <Section
        tone="light"
        eyebrow="Panchang Tool"
        title="Generate a complete daily Panchang profile with transitions and guidance."
        description="Enter date and place once to view core values, next transitions, and structured daily guidance in one clean result flow."
      >
        <div id="panchang-tool">
          <PanchangToolPanel />
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="How It Works"
        title="Three focused steps behind this Panchang engine."
        description="The flow is lightweight, deterministic, and aligned with current astrology engine conventions."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Validate date + place",
              description:
                "Input normalization runs first, then place resolution derives coordinates and timezone cleanly.",
            },
            {
              title: "Calculate core factors",
              description:
                "Sun and Moon sidereal longitudes drive Tithi, Nakshatra, Yoga, and Karana with deterministic formulas.",
            },
            {
              title: "Return daily structure",
              description:
                "Output includes core Panchang values, next-change transitions, and conservative guidance blocks for daily planning.",
            },
          ].map((item) => (
            <Card key={item.title} tone="light" className="space-y-3">
              <Badge tone="trust">Step</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Daily Use"
        title="Use Panchang as a practical daily timing layer."
        description="Keep the flow simple: check the core factors, note transition windows, then continue into deeper chart-aware tools when needed."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card tone="light" className="space-y-3">
            <Badge tone="trust">Daily Rhythm</Badge>
            <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              Start with timing clarity
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Check Tithi, Nakshatra, and Yoga first to understand the day&apos;s overall tone before major decisions.
            </p>
          </Card>
          <Card tone="light" className="space-y-3">
            <Badge tone="trust">Transition Awareness</Badge>
            <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              Watch next-change timings
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use transition timings as planning checkpoints for meetings, focused work, and important commitments.
            </p>
          </Card>
          <Card tone="light" className="space-y-3">
            <Badge tone="trust">Deeper Layer</Badge>
            <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              Add personalization when needed
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Continue into Kundli, NAVAGRAHA AI, and consultation when you need chart-level interpretation beyond daily timing.
            </p>
          </Card>
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Panchang FAQ"
        title="Common questions about daily Panchang usage."
        description="These answers are intentionally concise and practical for everyday checking."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {panchangFaqEntries.map((entry) => (
            <Card key={entry.question} tone="light" className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {entry.question}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {entry.answer}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Related Tools"
        title="Continue from Panchang into complementary guidance surfaces."
        description="Internal links are kept focused so you can move into the right next tool without clutter."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              href: "/tools",
              label: "Explore All Tools",
              title: "Tools Hub",
              description:
                "Open the utility hub to move across chart, timing, numerology, and AI layers cleanly.",
              feature: "panchang-related-tools-hub",
              eventName: "utility_card_click" as const,
            },
            {
              href: "/muhurta",
              label: "Open Muhurta-lite",
              title: "Muhurta-lite",
              description:
                "Focused daily timing windows for Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta.",
              feature: "panchang-related-muhurta",
              eventName: "muhurta_tool_click" as const,
            },
            {
              href: "/rashifal",
              label: "Open Daily Rashifal",
              title: "Rashifal",
              description:
                "Sign-level daily guidance to complement timing context from Panchang.",
              feature: "panchang-related-rashifal",
              eventName: "utility_card_click" as const,
            },
            {
              href: "/numerology",
              label: "Open Numerology",
              title: "Numerology",
              description:
                "Explore number-based tendencies alongside your daily Panchang timing layer.",
              feature: "panchang-related-numerology",
              eventName: "numerology_tool_click" as const,
            },
            {
              href: "/reports",
              label: "Get Free Report",
              title: "Premium Reports",
              description:
                "Move from daily signals into deeper structured interpretation and planning.",
              feature: "panchang-related-reports",
              eventName: "premium_utility_cta_click" as const,
            },
            {
              href: "/consultation",
              label: "Book Consultation",
              title: "Consultation",
              description:
                "Discuss timing and chart context directly with guided human interpretation.",
              feature: "panchang-related-consultation",
              eventName: "premium_utility_cta_click" as const,
            },
          ].map((item) => (
            <Card key={item.title} tone="light" className="flex h-full flex-col gap-3">
              <Badge tone="trust">{item.title}</Badge>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
              <TrackedLink
                href={item.href}
                eventName={item.eventName}
                eventPayload={{ page: "/panchang", feature: item.feature }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                {item.label}
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Continue Journey</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Move from daily Panchang into chart and AI guidance.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use Panchang for daily timing context, then continue with Kundli and NAVAGRAHA AI for deeper personal interpretation.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{
                page: "/panchang",
                feature: "panchang-final-kundli",
              }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/ai"
              eventName="cta_click"
              eventPayload={{
                page: "/panchang",
                feature: "panchang-final-ai",
              }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Explore NAVAGRAHA AI
            </TrackedLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
