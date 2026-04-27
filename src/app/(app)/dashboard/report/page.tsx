import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { generateUserReport } from "@/lib/ai/report-generator";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import {
  createEmptyOfferRecommendationResult,
  getOfferRecommendations,
  type OfferRecommendationResult,
} from "@/modules/offers";
import {
  createFallbackSubscriptionRetentionSnapshot,
  getSubscriptionRetentionIntelligenceSnapshot,
  type SubscriptionRetentionIntelligenceSnapshot,
} from "@/modules/subscriptions";
import { ChartReportPage } from "@/modules/report/components/chart-report-page";
import { getRequestLocaleDefinition } from "@/modules/localization/request";

export const metadata = buildPageMetadata({
  title: "Chart Report",
  description:
    "Review the first private NAVAGRAHA CENTRE chart report with structured chart facts, AI interpretation, and approved remedies.",
  path: "/dashboard/report",
  keywords: [
    "private astrology report",
    "chart interpretation",
    "approved remedies",
  ],
});

export default async function DashboardReportPage() {
  const session = await requireUserSession();
  const localeDefinition = await getRequestLocaleDefinition();
  let report: Awaited<ReturnType<typeof generateUserReport>> | null = null;
  let offers: OfferRecommendationResult =
    createEmptyOfferRecommendationResult("report");
  let subscriptionState: SubscriptionRetentionIntelligenceSnapshot =
    createFallbackSubscriptionRetentionSnapshot();
  let hasLoadError = false;

  try {
    [report, offers, subscriptionState] = await Promise.all([
      generateUserReport(
        session.user.id,
        session.user.name,
        localeDefinition.label,
        localeDefinition.code
      ),
      (async (): Promise<OfferRecommendationResult> => {
        try {
          return await getOfferRecommendations({
            userId: session.user.id,
            surfaceKey: "report",
          });
        } catch (error) {
          console.error("Report offers failed", error);

          return createEmptyOfferRecommendationResult("report");
        }
      })(),
      (async (): Promise<SubscriptionRetentionIntelligenceSnapshot> => {
        try {
          return await getSubscriptionRetentionIntelligenceSnapshot(
            session.user.id
          );
        } catch (error) {
          console.error("Report subscription state failed", error);

          return createFallbackSubscriptionRetentionSnapshot();
        }
      })(),
    ]);
  } catch {
    hasLoadError = true;
  }

  if (hasLoadError || !report) {
    return (
      <Section
        eyebrow="Private Report"
        title="Your report surface is available, but the data layer needs a fresh attempt."
        description="The protected report route is still intact. Please refresh the route or return after confirming your onboarding data."
        tone="transparent"
        className="pt-0"
      >
        <PageViewTracker page="/dashboard/report" feature="dashboard-report" />
        <AnalyticsEventTracker
          event="report_view"
          payload={{ page: "/dashboard/report", feature: "dashboard-report-fallback" }}
        />

        <Card className="space-y-3">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            NAVAGRAHA CENTRE kept your protected route stable instead of showing
            a hard crash. Once the content layer reconnects, this page will load
            your chart summary, consultation context, and report output again.
          </p>
        </Card>
      </Section>
    );
  }

  return (
    <>
      <PageViewTracker page="/dashboard/report" feature="dashboard-report" />
      <AnalyticsEventTracker
        event="report_view"
        payload={{ page: "/dashboard/report", feature: "dashboard-report" }}
      />
      <ChartReportPage
        report={report}
        offers={offers}
        subscriptionState={subscriptionState}
      />
    </>
  );
}
