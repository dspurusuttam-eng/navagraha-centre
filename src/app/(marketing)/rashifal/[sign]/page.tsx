import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { getRashifalSignBySlug, rashifalSigns } from "@/modules/rashifal/content";

type RashifalSignPageProps = {
  params: Promise<{
    sign: string;
  }>;
};

export function generateStaticParams() {
  return rashifalSigns.map((sign) => ({
    sign: sign.slug,
  }));
}

export async function generateMetadata({
  params,
}: RashifalSignPageProps): Promise<Metadata> {
  const { sign } = await params;
  const signData = getRashifalSignBySlug(sign);

  if (!signData) {
    return buildPageMetadata({
      title: "Rashifal",
      description: "Daily Rashifal guidance for all zodiac signs.",
      path: "/rashifal",
    });
  }

  return buildPageMetadata({
    title: `${signData.name} Rashifal - Daily Horoscope`,
    description: `Read today's ${signData.name} Rashifal with love, career, business, lucky color, number, and lucky time guidance.`,
    path: `/rashifal/${signData.slug}`,
    keywords: [
      `${signData.name.toLowerCase()} rashifal`,
      `${signData.name.toLowerCase()} daily horoscope`,
      `${signData.name.toLowerCase()} lucky color`,
      `${signData.name.toLowerCase()} lucky number`,
    ],
  });
}

export const revalidate = 3600;

export default async function RashifalSignPage({
  params,
}: RashifalSignPageProps) {
  const { sign } = await params;
  const signData = getRashifalSignBySlug(sign);

  if (!signData) {
    notFound();
  }

  return (
    <>
      <PageViewTracker
        page={`/rashifal/${signData.slug}`}
        feature={`rashifal-sign-${signData.slug}`}
      />
      <AnalyticsEventTracker
        event="rashifal_page_view"
        payload={{
          page: `/rashifal/${signData.slug}`,
          feature: `rashifal-sign-${signData.slug}`,
        }}
      />

      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,#fffefb_0%,#fcf4e7_54%,#f8ecd8_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(210,166,90,0.2),transparent_34%),radial-gradient(circle_at_86%_16%,rgba(208,164,112,0.16),transparent_34%),radial-gradient(circle_at_70%_88%,rgba(188,145,87,0.12),transparent_38%)]" />
        <Container className="relative grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-center">
          <div className="space-y-6">
            <Badge tone="trust">{signData.name} Rashifal</Badge>
            <div className="space-y-4">
              <h1
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                {signData.name} Daily Horoscope
              </h1>
              <p className="max-w-[44rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {signData.shortPrediction}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{
                  page: `/rashifal/${signData.slug}`,
                  feature: "sign-page-generate-kundli",
                }}
                className={buttonStyles({
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Kundli
              </TrackedLink>
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{
                  page: `/rashifal/${signData.slug}`,
                  feature: "sign-page-try-ai",
                }}
                className={buttonStyles({
                  tone: "secondary",
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Try AI Free
              </TrackedLink>
            </div>
          </div>

          <Card className="space-y-4 border-[rgba(184,137,67,0.28)] bg-[linear-gradient(165deg,rgba(255,255,255,0.96)_0%,rgba(248,236,216,0.9)_100%)]">
            <Badge tone="trust">Lucky Indicators</Badge>
            <div className="grid gap-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              <p>
                <span className="font-medium text-[var(--color-ink-strong)]">
                  Lucky Color:
                </span>{" "}
                {signData.luckyColor}
              </p>
              <p>
                <span className="font-medium text-[var(--color-ink-strong)]">
                  Lucky Number:
                </span>{" "}
                {signData.luckyNumber}
              </p>
              <p>
                <span className="font-medium text-[var(--color-ink-strong)]">
                  Lucky Time:
                </span>{" "}
                {signData.luckyTime}
              </p>
            </div>
          </Card>
        </Container>
      </section>

      <Section
        tone="light"
        eyebrow="Full Rashifal"
        title={`${signData.name} today in detail`}
        description="Complete sign-level guidance for love, career, business, and daily focus."
        contentClassName="[&>div>p]:text-[var(--color-ink-body)]"
      >
        <Card
          tone="light"
          className="space-y-7 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.94)] p-5 sm:space-y-8 sm:p-6"
        >
          <ul className="space-y-4 sm:space-y-5">
            {signData.fullDescription.map((line) => (
              <li
                key={line}
                className="rounded-[var(--radius-md)] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-strong)] sm:px-4 sm:py-3"
              >
                {line}
              </li>
            ))}
          </ul>

          <div className="space-y-4 border-t border-[rgba(184,137,67,0.24)] pt-6 sm:pt-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Love", value: signData.love },
                { label: "Career", value: signData.career },
                { label: "Business", value: signData.business },
              ].map((entry) => (
                <div
                  key={entry.label}
                  className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.22)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
                >
                  <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                    {entry.label}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-strong)]">
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        eyebrow="All Zodiac Signs"
        title="Explore other sign pages"
        description="Use internal sign links for complete daily coverage."
      >
        <Card className="mb-6 border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.9)]">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            This sign follows the same daily structure as all others, making
            cross-sign comparisons easy without changing the reading format.
          </p>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rashifalSigns.map((entry) => (
            <TrackedLink
              key={entry.slug}
              href={`/rashifal/${entry.slug}`}
              eventName="cta_click"
              eventPayload={{
                page: `/rashifal/${signData.slug}`,
                feature: `cross-sign-${entry.slug}`,
              }}
              className={`rounded-[var(--radius-lg)] border px-4 py-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] transition [transition-duration:var(--motion-duration-base)] ${
                entry.slug === signData.slug
                  ? "border-[rgba(184,137,67,0.5)] bg-[rgba(184,137,67,0.12)] text-[var(--color-ink-strong)]"
                  : "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] text-[var(--color-ink-body)] hover:border-[rgba(184,137,67,0.34)]"
              }`}
            >
              {entry.name}
            </TrackedLink>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <TrackedLink
            href="/rashifal"
            eventName="cta_click"
            eventPayload={{
              page: `/rashifal/${signData.slug}`,
              feature: "return-main-rashifal",
            }}
            className={buttonStyles({
              tone: "tertiary",
              size: "sm",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Back to Main Rashifal
          </TrackedLink>
          <TrackedLink
            href="/ai"
            eventName="cta_click"
            eventPayload={{
              page: `/rashifal/${signData.slug}`,
              feature: "sign-page-ask-ai",
            }}
            className={buttonStyles({
              tone: "secondary",
              size: "sm",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Ask NAVAGRAHA AI
          </TrackedLink>
          <TrackedLink
            href="/kundli"
            eventName="cta_click"
            eventPayload={{
              page: `/rashifal/${signData.slug}`,
              feature: "sign-page-personalized-kundli",
            }}
            className={buttonStyles({
              size: "sm",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Get Personalized Rashifal
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
