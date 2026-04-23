import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { AskMyChartAssistant } from "@/modules/ask-chart/components/ask-my-chart-assistant";
import { AiProductFamilySection } from "@/modules/marketing/components/ai-product-family-section";
import { getAskMyChartPageData } from "@/modules/ask-chart/service";

export const metadata = buildPageMetadata({
  title: "Ask My Chart",
  description:
    "Ask grounded chart-aware questions inside your private NAVAGRAHA CENTRE dashboard.",
  path: "/dashboard/ask-my-chart",
  keywords: [
    "ask my chart",
    "chart copilot",
    "grounded astrology assistant",
  ],
});

export default async function AskMyChartPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    session?: string;
  }>;
}>) {
  const session = await requireUserSession();
  const { session: sessionId } = await searchParams;
  let pageData: Awaited<ReturnType<typeof getAskMyChartPageData>>;

  try {
    pageData = await getAskMyChartPageData(session.user.id, sessionId);
  } catch {
    return (
      <Section
        eyebrow="Ask My Chart"
        title="The copilot surface is available, but the chart context needs a fresh load."
        description="Your protected assistant route is still in place. Please refresh the page or return after confirming your saved chart data."
        tone="transparent"
        className="pt-0"
      >
        <PageViewTracker page="/dashboard/ask-my-chart" feature="ask-my-chart" />
        <AnalyticsEventTracker
          event="ai_opened"
          payload={{ page: "/dashboard/ask-my-chart", feature: "ask-my-chart" }}
        />

        <Card className="space-y-5">
          <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            NAVAGRAHA CENTRE kept this route stable instead of surfacing a hard
            error. Once the chart context reconnects, the assistant will return
            to grounded replies from your stored data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              Back to Dashboard
            </Link>
            <Link
              href="/dashboard/onboarding"
              className={buttonStyles({ size: "lg" })}
            >
              Review Birth Details
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  if (pageData.status === "needs-chart") {
    return (
      <Section
        eyebrow="Ask My Chart"
        title="Complete your chart onboarding before starting the copilot."
        description="The assistant only responds from stored chart data, approved remedies, and grounded context already attached to your account."
        tone="transparent"
        className="pt-0"
      >
        <PageViewTracker page="/dashboard/ask-my-chart" feature="ask-my-chart" />
        <AnalyticsEventTracker
          event="ai_opened"
          payload={{ page: "/dashboard/ask-my-chart", feature: "ask-my-chart" }}
        />

        <Card className="space-y-5">
          <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Once your birth profile and initial chart are saved, Ask My Chart
            will be able to explain placements, aspects, themes, remedies, and
            current cycle context without drifting into unsupported answers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/onboarding"
              className={buttonStyles({ size: "lg" })}
            >
              Complete Onboarding
            </Link>
            <Link
              href="/dashboard/chart"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              Review Chart Area
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  return (
    <>
      <PageViewTracker page="/dashboard/ask-my-chart" feature="ask-my-chart" />
      <AnalyticsEventTracker
        event="ai_opened"
        payload={{ page: "/dashboard/ask-my-chart", feature: "ask-my-chart" }}
      />

      <Section
        eyebrow="Ask My Chart"
        title="A private copilot for grounded chart questions."
        description="This assistant stays inside your stored chart context, approved remedies, and available transit or consultation context. It does not improvise chart math or unsupported advice."
        tone="transparent"
        className="pt-0"
      >
        <AskMyChartAssistant initialData={pageData} />
      </Section>
      <AiProductFamilySection
        surface="protected"
        pagePath="/dashboard/ask-my-chart"
        tone="muted"
        eyebrow="NAVAGRAHA AI Ecosystem"
        title="Continue within the AI family based on your current question."
        description="Move from Ask My Chart into compatibility, report depth, remedy guidance, or consultation without losing chart context."
      />
    </>
  );
}
