import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { generateUserReport } from "@/lib/ai/report-generator";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ChartReportPage } from "@/modules/report/components/chart-report-page";

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
  try {
    const report = await generateUserReport(session.user.id, session.user.name);

    return <ChartReportPage report={report} />;
  } catch {
    return (
      <Section
        eyebrow="Private Report"
        title="Your report surface is available, but the data layer needs a fresh attempt."
        description="The protected report route is still intact. Please refresh the route or return after confirming your onboarding data."
        tone="transparent"
        className="pt-0"
      >
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
}
