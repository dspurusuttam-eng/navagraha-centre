import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
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

export default async function DashboardPage() {
  const session = await requireUserSession();
  const [overview, chartOverview] = await Promise.all([
    getDashboardOverview(session.user.id),
    getChartOverview(session.user.id),
  ]);
  const hasBirthProfile = Boolean(chartOverview.birthProfile);
  const hasChart = Boolean(chartOverview.chartRecord && chartOverview.chart);

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
            <p>
              The protected member flow now supports secure birth-profile
              intake, consultation booking, chart persistence, and a dedicated
              chart overview route.
            </p>
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
          </div>
        </Card>
      </div>
    </Section>
  );
}
