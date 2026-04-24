import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  createEmptyChartOverview,
  fallbackChartInsights,
  generateChartInsights,
} from "@/lib/ai/chart-analysis";
import { fallbackCurrentCycleSummary } from "@/lib/astrology/current-cycle";
import { generateUserReport } from "@/lib/ai/report-generator";
import type { ChartInsights, GeneratedUserReport } from "@/lib/ai/types";
import { buildPageMetadata } from "@/lib/metadata";
import { getDashboardOverview } from "@/modules/account/service";
import { DashboardEcosystemHome } from "@/modules/account/components/dashboard-ecosystem-home";
import {
  createEmptyDashboardEcosystemData,
  getDashboardEcosystemData,
  type DashboardEcosystemData,
} from "@/modules/account/dashboard-ecosystem";
import { requireUserSession } from "@/modules/auth/server";
import { getChartOverview } from "@/modules/onboarding/service";
import {
  createEmptyOfferRecommendationResult,
  type OfferRecommendationResult,
  getOfferRecommendations,
} from "@/modules/offers";
import { OfferRecommendationPanel } from "@/modules/offers/components/offer-recommendation-panel";
import {
  createFallbackSubscriptionRetentionSnapshot,
  getUserPlanUsageModel,
  getSubscriptionRetentionIntelligenceSnapshot,
  type SubscriptionRetentionIntelligenceSnapshot,
  type UserPlanModel,
  type UserPlanUsageModel,
} from "@/modules/subscriptions";
import { SubscriptionValuePanel } from "@/modules/subscriptions/components/subscription-value-panel";
import { RetentionEventTracker } from "@/modules/retention/components/retention-event-tracker";
import { RetentionSurfacePanel } from "@/modules/retention/components/retention-surface-panel";
import {
  getRetentionDashboardSnapshot,
  type RetentionDashboardSnapshot,
} from "@/modules/retention";

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
    currentCycle: fallbackCurrentCycleSummary,
    consultationNotes: [],
    remedies: [],
    predictiveContext: null,
    reportSummary: {
      headline: "Your private workspace is available.",
      overview:
        "No chart or consultation data is available yet, so the dashboard is showing a safe fallback state.",
    },
  };
}

function createFallbackRetentionDashboardState(): RetentionDashboardSnapshot {
  return {
    generatedAtUtc: new Date().toISOString(),
    lifecycleStage: "SIGNED_UP_NO_CHART",
    lifecycleLabel: "Chart Setup Pending",
    dailyInsight: {
      title: "Today's Insight",
      summary:
        "Your chart foundation is still incomplete, so the dashboard is holding back deeper interpretation intentionally.",
      supportingLine:
        "Complete onboarding to unlock chart-backed return surfaces.",
    },
    currentEnergy: {
      title: "Current Energy",
      summary:
        "A clearer energy snapshot appears after the chart has been generated and saved.",
      supportingLine:
        "Finish chart setup to move from account shell to active astrology context.",
    },
    panchang: {
      isAvailable: false,
      asOfDate: null,
      locationLabel: null,
      highlight:
        "Daily Panchang highlights become available after adding a location-ready profile.",
      spiritualTone:
        "Use Panchang as a calm daily timing reference before deeper chart interpretation.",
      suitableFocus:
        "Check Tithi, Nakshatra, and transition windows for practical day planning.",
      returnPromptTitle: "Revisit today’s Panchang",
      returnPromptSummary:
        "Open Panchang to generate today’s timing context for your selected place.",
      returnPromptHref: "/panchang",
      returnPromptCtaLabel: "Open Panchang",
    },
    recommendedNextStep: {
      title: "Complete your chart to unlock insights.",
      summary:
        "The protected chart, report, and assistant surfaces all become more useful after the first chart is saved.",
      href: "/dashboard/onboarding",
      ctaLabel: "Complete Chart Setup",
      emphasis: "FREE",
    },
    activity: {
      hasChart: false,
      hasAssistantUsage: false,
      assistantSessionCount: 0,
      lastAssistantActivityUtc: null,
      daysSinceAssistantActivity: null,
      isSubscribed: false,
      subscriptionLifecycle: "NO_SUBSCRIPTION",
    },
    analytics: {
      showChartIncompleteNudge: true,
      showPremiumFollowupNudge: false,
      showPanchangReturnPrompt: true,
    },
  };
}

export default async function DashboardPage() {
  const session = await requireUserSession();
  const [
    overview,
    chartOverview,
    insights,
    report,
    offers,
    subscriptionState,
    userPlanState,
    ecosystemState,
  ] =
    await Promise.all([
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
      (async (): Promise<OfferRecommendationResult> => {
        try {
          return await getOfferRecommendations({
            userId: session.user.id,
            surfaceKey: "dashboard",
          });
        } catch (error) {
          console.error("Dashboard offers failed", error);

          return createEmptyOfferRecommendationResult("dashboard");
        }
      })(),
      (async (): Promise<SubscriptionRetentionIntelligenceSnapshot> => {
        try {
          return await getSubscriptionRetentionIntelligenceSnapshot(
            session.user.id
          );
        } catch (error) {
          console.error("Dashboard subscription state failed", error);

          return createFallbackSubscriptionRetentionSnapshot();
        }
      })(),
      (async (): Promise<{
        plan: UserPlanModel;
        usage: UserPlanUsageModel;
      }> => {
        try {
          return await getUserPlanUsageModel(session.user.id);
        } catch (error) {
          console.error("Dashboard user-plan usage failed", error);

          return {
            plan: {
              plan_type: "FREE",
              plan_expiry: null,
              usage_limits: {
                aiQuestionsPerDay: 3,
                premiumReportsPerMonth: 1,
                premiumInsightsEnabled: false,
              },
              source_subscription_plan_id: null,
            },
            usage: {
              ai_questions_used_today: 0,
              ai_questions_remaining_today: 3,
              premium_reports_generated_this_month: 0,
              premium_reports_remaining_this_month: 1,
            },
          };
        }
      })(),
      (async (): Promise<DashboardEcosystemData> => {
        try {
          return await getDashboardEcosystemData(session.user.id);
        } catch (error) {
          console.error("Dashboard ecosystem state failed", error);

          return createEmptyDashboardEcosystemData();
        }
      })(),
    ]);
  const retentionState = await (async (): Promise<RetentionDashboardSnapshot> => {
    try {
      return await getRetentionDashboardSnapshot({
        userId: session.user.id,
        chartOverview,
        insights,
        report,
        subscriptionState,
        userPlan: userPlanState.plan,
      });
    } catch (error) {
      console.error("Dashboard retention state failed", error);

      return createFallbackRetentionDashboardState();
    }
  })();
  const hasBirthProfile = Boolean(chartOverview.birthProfile);
  const hasChart = Boolean(chartOverview.chartRecord && chartOverview.chart);
  const leadConsultationNote = report.consultationNotes[0]?.note ?? null;
  const leadRemedy = report.remedies[0] ?? null;
  const currentCycle = report.currentCycle;
  const hasAdvancedTimingInsights = subscriptionState.featureGates.advancedTimingInsights;

  return (
    <Section
      eyebrow="Dashboard"
      title="Your private chart workspace is taking shape."
      description="The protected dashboard now carries account persistence, birth-profile onboarding, and a structured first-chart destination inside the same member shell."
      tone="transparent"
      className="pt-0"
    >
      <PageViewTracker page="/dashboard" feature="dashboard-home" />

      <RetentionEventTracker snapshot={retentionState} userPlan={userPlanState.plan} />

      <DashboardEcosystemHome
        userName={session.user.name}
        chartOverview={chartOverview}
        retentionState={retentionState}
        ecosystem={ecosystemState}
      />

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

      <div className="mt-6">
        <RetentionSurfacePanel snapshot={retentionState} />
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

        <div className="space-y-6">
          <SubscriptionValuePanel
            snapshot={subscriptionState}
            userPlan={userPlanState.plan}
            usage={userPlanState.usage}
            upgradeHref="/dashboard/chart"
            eyebrow="Service Access"
            title="Access status in your current workflow."
            description="Current access and retention guidance stay visible without pressure."
          />

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
                  {leadRemedy?.title ??
                    "Will appear after chart insights are available"}
                </span>
              </p>
            </div>
          </Card>

          <OfferRecommendationPanel
            eyebrow="Recommended Next Offer"
            title="A calm next step, based on your current member context."
            description="These suggestions stay advisory and context-led. They do not imply urgency, scarcity, or any missing payment flow."
            recommendations={offers}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Current Cycle
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Timing context grounded in live transits and the current dasha.
            </h2>
          </div>

          {currentCycle.status === "ready" ? (
            <div className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p>{currentCycle.synthesis.overview}</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Top Focus Areas
                  </p>
                  <div className="mt-3 space-y-3">
                    {currentCycle.synthesis.activeAreas.slice(0, 2).map((area) => (
                      <div key={area.key} className="space-y-1">
                        <p className="text-[color:var(--color-foreground)]">
                          {area.title}
                        </p>
                        <p>{area.summary}</p>
                        <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                          {area.timeframeLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Caution Notes
                  </p>
                  <div className="mt-3 space-y-3">
                    {currentCycle.synthesis.cautionWindows.slice(0, 2).map((item) => (
                      <div key={item.key} className="space-y-1">
                        <p className="text-[color:var(--color-foreground)]">
                          {item.title}
                        </p>
                        <p>{item.summary}</p>
                      </div>
                    ))}
                    {!currentCycle.synthesis.cautionWindows.length ? (
                      <p>
                        No dominant caution window stands out beyond the normal need
                        for measured pacing.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Time-Sensitive Highlights
                  </p>
                  <div className="mt-3 space-y-2">
                    {currentCycle.synthesis.timeSensitiveHighlights.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>

              {hasAdvancedTimingInsights ? (
                <div className="space-y-3">
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Guidance Calendar
                  </p>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {currentCycle.guidanceCalendar.buckets.map((bucket) => (
                      <div
                        key={bucket.key}
                        className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                      >
                        <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                          {bucket.label}
                        </p>
                        <p className="mt-3">{bucket.summary}</p>
                        <div className="mt-3 space-y-3">
                          {bucket.entries.slice(0, 2).map((entry) => (
                            <div key={entry.key} className="space-y-1">
                              <p className="text-[color:var(--color-foreground)]">
                                {entry.title}
                              </p>
                              <p>{entry.summary}</p>
                              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                                {entry.timeframeLabel}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-5 py-5">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Advanced Timing
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    This deeper timing layer is currently free under limited launch access. Continue with timing summaries and deeper analysis while access is open.
                  </p>
                  <Link
                    href="/dashboard/chart"
                    className={buttonStyles({ size: "sm", tone: "secondary", className: "mt-4" })}
                  >
                    Start Free Analysis
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {currentCycle.unavailableReason}
              </p>
            </div>
          )}
        </Card>

        <Card tone="accent" className="space-y-5">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Timing Snapshot
          </p>
          {hasAdvancedTimingInsights ? (
            <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p>
                Dasha:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {currentCycle.dasha
                    ? `${currentCycle.dasha.lord} until ${new Date(
                        currentCycle.dasha.endAtUtc
                      ).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}`
                    : "Not available"}
                </span>
              </p>
              <p>
                Transit snapshot:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {currentCycle.transitSnapshot.asOfUtc
                    ? new Date(currentCycle.transitSnapshot.asOfUtc).toLocaleString(
                        "en-IN",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )
                    : "Not available"}
                </span>
              </p>
              <p>
                Lead transit:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {currentCycle.transitSnapshot.planets[0]
                    ? `${currentCycle.transitSnapshot.planets[0].body} in ${currentCycle.transitSnapshot.planets[0].sign}, house ${currentCycle.transitSnapshot.planets[0].house}`
                    : "No transit snapshot available"}
                </span>
              </p>
              <p>
                Follow-up theme:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {currentCycle.synthesis.followUpThemes[0]?.title ??
                    "Will appear once timing context is available"}
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p>
                Timing snapshots include dasha timing windows and richer transit sequencing.
              </p>
              <p>
                These layers are currently free under limited launch access.
              </p>
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}
