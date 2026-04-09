import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  createEmptyChartOverview,
  fallbackChartInsights,
  generateChartInsights,
} from "@/lib/ai/chart-analysis";
import { generateUserReport } from "@/lib/ai/report-generator";
import type { ChartInsights, GeneratedUserReport } from "@/lib/ai/types";
import { buildPageMetadata } from "@/lib/metadata";
import { getDashboardOverview } from "@/modules/account/service";
import { requireUserSession } from "@/modules/auth/server";
import { getChartOverview } from "@/modules/onboarding/service";

export const metadata = buildPageMetadata({
  title: "Dashboard",
  description:
    "Protected NAVAGRAHA CENTRE dashboard foundation for profile, data, and future member workflows.",
  path: "/dashboard",
  keywords: ["member dashboard", "private astrology account", "account home"],
});

function createFallbackDashboardOverview() {
  return {
    readinessScore: 0,
    counts: {
      birthData: 0,
      charts: 0,
      consultations: 0,
      orders: 0,
    },
  };
}

function createFallbackUserReport(): GeneratedUserReport {
  return {
    chartReport: {
      status: "empty",
      overview: createEmptyChartOverview(),
    },
    insights: fallbackChartInsights,
    consultationNotes: [],
    remedies: [],
    reportSummary: {
      headline: "Your private workspace is available.",
      overview:
        "No chart or consultation data is available yet, so the dashboard is showing a safe fallback state.",
    },
  };
}

export default async function DashboardPage() {
  const session = await requireUserSession();
  const [overview, chartOverview, insights, report] = await Promise.all([
    (async () => {
      try {
        return await getDashboardOverview(session.user.id);
      } catch (error) {
        console.error("Dashboard overview failed", error);

        return createFallbackDashboardOverview();
      }
    })(),
    (async () => {
      try {
        return await getChartOverview(session.user.id);
      } catch (error) {
        console.error("Chart overview failed", error);

        return createEmptyChartOverview();
      }
    })(),
    (async (): Promise<ChartInsights> => {
      try {
        return await generateChartInsights(session.user.id);
      } catch (error) {
        console.error("Dashboard insights failed", error);

        return fallbackChartInsights;
      }
    })(),
    (async (): Promise<GeneratedUserReport> => {
      try {
        return await generateUserReport(session.user.id, session.user.name);
      } catch (error) {
        console.error("Dashboard report failed", error);

        return createFallbackUserReport();
      }
    })(),
  ]);
  const hasBirthProfile = Boolean(chartOverview.birthProfile);
  const hasChart = Boolean(chartOverview.chartRecord && chartOverview.chart);
  const leadConsultationNote = report.consultationNotes[0]?.note ?? null;
  const leadRemedy = report.remedies[0] ?? null;

  return (
    <Section
      eyebrow="Dashboard"
      title="Your private chart workspace is taking shape."
      description="The protected dashboard now carries account persistence, birth-profile onboarding, and a structured first-chart destination inside the same member shell."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Profile Readiness
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {overview.readinessScore}/4
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Identity, location, and a primary birth record move this workspace
            toward a dependable chart foundation.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Primary Birth Profile
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {hasBirthProfile ? "Ready" : "Pending"}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {hasBirthProfile
              ? "A primary birth profile is attached to the account."
              : "The onboarding flow will save the first private birth profile."}
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Initial Chart
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {hasChart ? overview.counts.charts : "0"}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {hasChart
              ? "A stored natal chart is available for structured review."
              : "Generate the first chart after completing birth onboarding."}
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Consultations
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {overview.counts.consultations}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Confirmed and requested consultations stay visible inside the member
            shell with explicit timezone handling.
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Current Focus
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {hasChart
                ? "Your first structured natal chart is ready to review."
                : hasBirthProfile
                  ? "The birth profile is saved. Generate or refresh the initial chart next."
                  : "Complete the guided onboarding flow to generate the first chart."}
            </h2>
          </div>

          <div className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>{insights.summary}</p>
            <p>{report.reportSummary.overview}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/onboarding"
                className={buttonStyles({ size: "lg" })}
              >
                {hasBirthProfile ? "Update Birth Details" : "Start Onboarding"}
              </Link>
              <Link
                href="/dashboard/chart"
                className={buttonStyles({ size: "lg", tone: "secondary" })}
              >
                View Chart Overview
              </Link>
              <Link
                href="/dashboard/consultations"
                className={buttonStyles({ size: "lg", tone: "ghost" })}
              >
                View Consultations
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Strengths
                </p>
                <div className="mt-3 space-y-2">
                  {insights.strengths.slice(0, 2).map((strength) => (
                    <p key={strength}>{strength}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Challenges
                </p>
                <div className="mt-3 space-y-2">
                  {insights.challenges.slice(0, 2).map((challenge) => (
                    <p key={challenge}>{challenge}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Next Steps
                </p>
                <div className="mt-3 space-y-2">
                  {insights.recommendations.slice(0, 2).map((recommendation) => (
                    <p key={recommendation}>{recommendation}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card tone="accent" className="space-y-5">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Chart Status
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Birth profile:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {hasBirthProfile ? "Saved" : "Not added yet"}
              </span>
            </p>
            <p>
              Latest provider:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {chartOverview.chartRecord?.providerKey ?? "Not generated yet"}
              </span>
            </p>
            <p>
              Generated:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {chartOverview.chartRecord?.generatedAtUtc
                  ? new Date(
                      chartOverview.chartRecord.generatedAtUtc
                    ).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Not generated yet"}
              </span>
            </p>
            <p>
              Consultation context:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {leadConsultationNote ?? "No consultation notes saved yet"}
              </span>
            </p>
            <p>
              Supportive remedy cue:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {leadRemedy?.title ?? "Will appear after chart insights are available"}
              </span>
            </p>
          </div>
        </Card>
      </div>
    </Section>
  );
}
