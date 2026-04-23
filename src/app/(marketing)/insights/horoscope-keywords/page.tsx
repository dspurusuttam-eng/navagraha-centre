import { buildPageMetadata } from "@/lib/metadata";
import { getContentAdapter } from "@/modules/content";
import { InsightsSeoLandingPage } from "@/modules/content/components/insights-seo-landing-page";
import {
  getEntriesForInsightsSeoLanding,
  requireInsightsSeoLanding,
} from "@/modules/content/insights-authority";

const landing = requireInsightsSeoLanding("horoscope-keywords");

export const metadata = buildPageMetadata({
  title: landing.metadataTitle,
  description: landing.metadataDescription,
  path: landing.path,
  keywords: landing.keywords,
});

export const revalidate = 3600;

export default async function InsightsHoroscopeKeywordsPage() {
  const entries = await getContentAdapter().listPublishedEntries();

  return (
    <InsightsSeoLandingPage
      landing={landing}
      entries={getEntriesForInsightsSeoLanding("horoscope-keywords", entries)}
    />
  );
}
