import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentAdapter } from "@/modules/content";
import { InsightsSeoLandingPage } from "@/modules/content/components/insights-seo-landing-page";
import {
  getEntriesForInsightsSeoLanding,
  requireInsightsSeoLanding,
} from "@/modules/content/insights-authority";
import { rashifalSigns } from "@/modules/rashifal/content";

const landing = requireInsightsSeoLanding("zodiac-daily");

export const metadata = buildPageMetadata({
  title: landing.metadataTitle,
  description: landing.metadataDescription,
  path: landing.path,
  keywords: landing.keywords,
});

export const revalidate = 3600;

export default async function InsightsZodiacDailyPage() {
  const entries = await getContentAdapter().listPublishedEntries();

  return (
    <>
      <InsightsSeoLandingPage
        landing={landing}
        entries={getEntriesForInsightsSeoLanding("zodiac-daily", entries)}
      />

      <Section
        tone="muted"
        eyebrow="All Zodiac Daily Pages"
        title="Browse every zodiac daily Rashifal page."
        description="Use direct sign links for daily access and continue into personalized chart guidance when needed."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rashifalSigns.map((sign) => (
            <Card key={sign.slug} interactive className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                {sign.name}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {sign.shortPrediction}
              </p>
              <Link
                href={`/rashifal/${sign.slug}`}
                className={buttonStyles({
                  tone: "secondary",
                  size: "sm",
                  className: "w-full justify-center",
                })}
              >
                Read {sign.name} Rashifal
              </Link>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
