import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import type { GeneratedUserReport } from "@/lib/ai/types";
import type { PlanetaryBody } from "@/modules/astrology";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { OfferRecommendationPanel } from "@/modules/offers/components/offer-recommendation-panel";
import type { OfferRecommendationResult } from "@/modules/offers/types";
import { type RemedyRecommendation } from "@/modules/remedies";
import { PremiumProductCatalogSection } from "@/modules/report/components/premium-product-catalog-section";
import { PremiumReportGenerator } from "@/modules/report/components/premium-report-generator";
import { getLabelForRemedyType } from "@/modules/report/components/remedy-presenter";
import { reportDisclosures, type ChartReportReadyState } from "@/modules/report/service";
import { getMonetizationUpgradeCopy } from "@/modules/subscriptions";
import { SubscriptionValuePanel } from "@/modules/subscriptions/components/subscription-value-panel";
import type { SubscriptionRetentionIntelligenceSnapshot } from "@/modules/subscriptions/types";

function formatBody(body: PlanetaryBody) {
  return body.charAt(0) + body.slice(1).toLowerCase();
}

function formatSign(sign: string) {
  return sign.charAt(0) + sign.slice(1).toLowerCase();
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not generated yet";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPriorityTier(value: RemedyRecommendation["priorityTier"]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatConfidenceLabel(value: RemedyRecommendation["confidenceLabel"]) {
  switch (value) {
    case "HIGH_CONFIDENCE":
      return "High Confidence";
    case "MODERATE_CONFIDENCE":
      return "Moderate Confidence";
    case "OPTIONAL_SUPPORT":
      return "Optional Support";
    default:
      return value;
  }
}

function ReportMetric({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="space-y-1 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
        {label}
      </p>
      <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

function ReportSignalList({
  signals,
}: Readonly<{
  signals: ChartReportReadyState["signals"];
}>) {
  return (
    <div className="space-y-3">
      {signals.map((signal) => (
        <div
          key={signal.key}
          className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
              {signal.title}
            </p>
            <Badge tone="neutral">{signal.level}</Badge>
          </div>
          <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {signal.rationale}
          </p>
          {signal.relatedBodies.length ? (
            <p className="mt-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Related bodies: {signal.relatedBodies.map(formatBody).join(", ")}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function RemedyCard({
  remedy,
}: Readonly<{
  remedy: RemedyRecommendation;
}>) {
  return (
    <Card key={remedy.slug} interactive className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">{getLabelForRemedyType(remedy.type)}</Badge>
        <Badge tone="neutral">{formatPriorityTier(remedy.priorityTier)}</Badge>
        <Badge tone="neutral">{formatConfidenceLabel(remedy.confidenceLabel)}</Badge>
      </div>

      <div className="space-y-3">
        <h3
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          {remedy.title}
        </h3>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {remedy.summary}
        </p>
      </div>

      <div className="space-y-3 rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-4 py-4">
        <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Why it appears here
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
          {remedy.whyThisRemedy.summary}
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {remedy.whyThisRemedy.chartGrounding}
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {remedy.whyThisRemedy.approvedRecordBasis}
        </p>
      </div>

      {remedy.cautionNote || remedy.cautions.length ? (
        <div className="space-y-3">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Care Notes
          </p>
          {remedy.cautionNote ? (
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {remedy.cautionNote}
            </p>
          ) : null}
          <div className="space-y-2">
            {remedy.cautions.map((caution) => (
              <div
                key={caution.key}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
              >
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  {caution.label}
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {caution.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {remedy.relatedProducts.length ? (
        <div className="space-y-3">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Optional Related Product Records
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="outline">{remedy.productMapping.safety.optionalPurchaseLabel}</Badge>
            <Badge tone="neutral">Contextual Reference</Badge>
          </div>
          <div className="space-y-3">
            {remedy.relatedProducts.map((product) => (
              <Link
                key={product.slug}
                href={product.href}
                className="block rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4 transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)] hover:bg-[rgba(255,255,255,0.04)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                    {product.name}
                  </p>
                  <Badge tone="neutral">{product.categoryLabel}</Badge>
                </div>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {product.summary}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  <span>{product.priceLabel}</span>
                  <span>{product.relationshipNote}</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {remedy.productMapping.note}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {remedy.productMapping.safety.nonGuaranteeNote}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {remedy.productMapping.safety.noPressureNote}
          </p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Product Note
          </p>
          <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {remedy.productMapping.note}
          </p>
          <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {remedy.productMapping.safety.standaloneRemedyNote}
          </p>
        </div>
      )}

      {remedy.followUpSuggestions.length ? (
        <div className="space-y-3">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Suggested Next Step
          </p>
          <div className="space-y-2">
            {remedy.followUpSuggestions.slice(0, 2).map((suggestion) => (
              <div
                key={`${remedy.slug}-${suggestion.title}`}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
              >
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {suggestion.title}
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {suggestion.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function ChartReportPage({
  report,
  offers,
  subscriptionState,
}: Readonly<{
  report: GeneratedUserReport;
  offers: OfferRecommendationResult;
  subscriptionState: SubscriptionRetentionIntelligenceSnapshot;
}>) {
  const chartReport = report.chartReport;
  const hasDeeperReportLayers = subscriptionState.featureGates.deeperReportLayers;
  const reportPlanType =
    subscriptionState.access.plan?.id === "PRO"
      ? "PRO"
      : subscriptionState.access.plan?.id === "PREMIUM"
        ? "PREMIUM"
        : "FREE";
  const reportUpgradeCopy = getMonetizationUpgradeCopy({
    prompt: "report-preview",
    surface: "protected",
    planType: reportPlanType,
  });
  const reportProCopy =
    subscriptionState.recommendation?.planId === "PRO"
      ? getMonetizationUpgradeCopy({
          prompt: "report-pro",
          surface: "protected",
          planType: "PREMIUM",
        })
      : null;

  if (chartReport.status === "empty") {
    return (
      <Section
        eyebrow="Private Report"
        title="Your first interpretation report will appear after chart generation."
        description="Complete onboarding and store the initial natal chart first. The report layer depends on that persisted structured chart."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {report.insights.summary}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Next Steps
              </p>
              <div className="mt-3 space-y-2">
                {report.insights.recommendations.map((line) => (
                  <p
                    key={line}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Consultation Context
              </p>
              <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {report.consultationNotes[0]?.note ??
                  "No consultation notes are attached yet. This report will become richer once a chart and consultation context are both saved."}
              </p>
            </div>
          </div>
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
              Review Chart
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  const dominantBodies = chartReport.overview.chart.summary.dominantBodies
    .map(formatBody)
    .join(", ");

  return (
    <Section
      eyebrow="Private Report"
      title="A calm first reading built on structured chart facts."
      description="This report keeps the chart mathematics and remedy selection deterministic, while the explanation layer stays interpretive, premium, and carefully bounded."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card tone="accent" className="relative overflow-hidden space-y-6">
          <div className="pointer-events-none absolute right-[-10%] top-[-12%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(215,187,131,0.22)_0%,rgba(215,187,131,0)_70%)]" />
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Badge tone="accent">Premium Report</Badge>
            <Badge tone="neutral">{chartReport.interpretation.providerKey}</Badge>
          </div>

          <div className="relative z-10 space-y-4">
            <h2
              className="max-w-3xl font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {formatSign(chartReport.overview.chart.ascendantSign)} rising with{" "}
              {dominantBodies} carrying the clearest emphasis.
            </h2>
            <p className="max-w-3xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {chartReport.interpretation.summary}
            </p>
          </div>

          <div className="relative z-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportMetric
              label="Ascendant"
              value={formatSign(chartReport.overview.chart.ascendantSign)}
            />
            <ReportMetric
              label="Provider"
              value={chartReport.overview.chartRecord.providerKey}
            />
            <ReportMetric
              label="Chart Generated"
              value={formatDateTime(chartReport.overview.chartRecord.generatedAtUtc)}
            />
            <ReportMetric
              label="Report Language"
              value={chartReport.overview.preferredLanguageLabel}
            />
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Chart Foundations
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              The stored chart remains the factual source of truth.
            </h2>
          </div>

          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Birth profile:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {chartReport.overview.birthProfile.label}
              </span>
            </p>
            <p>
              Birthplace:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {chartReport.overview.birthProfile.city}
                {chartReport.overview.birthProfile.region
                  ? `, ${chartReport.overview.birthProfile.region}`
                  : ""}
                {`, ${chartReport.overview.birthProfile.country}`}
              </span>
            </p>
            <p>
              Timezone:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {chartReport.overview.birthProfile.timezone}
              </span>
            </p>
            <p>
              House system:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {chartReport.overview.chart.houseSystem === "WHOLE_SIGN"
                  ? "Whole Sign"
                  : "Placidus"}
              </span>
            </p>
            <p>
              Summary narrative:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {chartReport.overview.chart.summary.narrative}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/chart"
              className={buttonStyles({ tone: "secondary", size: "lg" })}
            >
              View Structured Chart
            </Link>
            <Link
              href="/dashboard/onboarding"
              className={buttonStyles({ tone: "ghost", size: "lg" })}
            >
              Update Birth Details
            </Link>
          </div>
        </Card>

        <OfferRecommendationPanel
          eyebrow="Recommended Next Step"
          title="Keep the next step aligned to the chart, the session context, and the approved remedy record."
          description="These recommendations stay soft by design and never imply extra payment features or guaranteed outcomes."
          recommendations={offers}
        />

        <SubscriptionValuePanel
          snapshot={subscriptionState}
          eyebrow="Subscription"
          title="Membership continuity for deeper report work."
          description="Your current plan status and optional upgrade pathway stay visible while keeping this report calm and non-intrusive."
        />
      </div>

      <PremiumProductCatalogSection
        surface="protected"
        pagePath="/dashboard/report"
        planType={reportPlanType}
        includeKeys={[
          "career-report",
          "marriage-report",
          "finance-report",
          "health-report",
          "deep-ai-reading",
          "consultation-guidance",
        ]}
        unlockedKeys={
          hasDeeperReportLayers
            ? [
                "career-report",
                "marriage-report",
                "finance-report",
                "health-report",
                "deep-ai-reading",
              ]
            : undefined
        }
        upgradeHref={reportUpgradeCopy.upgradeHref}
        tone="muted"
        eyebrow="Premium Product Catalog"
        title="Reports and premium guidance in one structured catalog"
        description="Move from chart context into report depth, AI continuation, and consultation follow-up without fragmented upsell surfaces."
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Content Intelligence
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              A calmer summary layer for the stored chart and recent context.
            </h2>
          </div>

          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {report.reportSummary.overview}
          </p>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Strengths
              </p>
              <div className="mt-3 space-y-2">
                {report.insights.strengths.map((line) => (
                  <p
                    key={line}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Challenges
              </p>
              <div className="mt-3 space-y-2">
                {report.insights.challenges.map((line) => (
                  <p
                    key={line}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Recommendations
              </p>
              <div className="mt-3 space-y-2">
                {report.insights.recommendations.map((line) => (
                  <p
                    key={line}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Current Timing
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              A transit-aware timing layer built from current dasha and live graha movement.
            </h2>
          </div>

          {report.currentCycle.status === "ready" ? (
            <div className="space-y-4">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {report.currentCycle.synthesis.overview}
              </p>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Active Areas
                  </p>
                  <div className="mt-3 space-y-3">
                    {report.currentCycle.synthesis.activeAreas.slice(0, 2).map((area) => (
                      <div key={area.key} className="space-y-1">
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                          {area.title}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                          {area.summary}
                        </p>
                        <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                          {area.timeframeLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Care In Timing
                  </p>
                  <div className="mt-3 space-y-3">
                    {report.currentCycle.synthesis.cautionWindows.slice(0, 2).map((item) => (
                      <div key={item.key} className="space-y-1">
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                          {item.title}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                          {item.summary}
                        </p>
                      </div>
                    ))}
                    {!report.currentCycle.synthesis.cautionWindows.length ? (
                      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                        No dominant caution window is standing out beyond the need
                        for measured pacing.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <ReportMetric
                  label="Dasha Lord"
                  value={report.currentCycle.dasha?.lord ?? "Not available"}
                />
                <ReportMetric
                  label="Transit Snapshot"
                  value={formatDateTime(report.currentCycle.transitSnapshot.asOfUtc)}
                />
                <ReportMetric
                  label="Lead Transit"
                  value={
                    report.currentCycle.transitSnapshot.planets[0]
                      ? `${formatBody(report.currentCycle.transitSnapshot.planets[0].body)} / house ${report.currentCycle.transitSnapshot.planets[0].house}`
                      : "Not available"
                  }
                />
              </div>

              <div className="space-y-3">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Guidance Calendar
                </p>
                <div className="grid gap-4 lg:grid-cols-3">
                  {report.currentCycle.guidanceCalendar.buckets.map((bucket) => (
                    <div
                      key={bucket.key}
                      className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                    >
                      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                        {bucket.label}
                      </p>
                      <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                        {bucket.summary}
                      </p>
                      <div className="mt-3 space-y-3">
                        {bucket.entries.slice(0, 2).map((entry) => (
                          <div key={entry.key} className="space-y-1">
                            <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                              {entry.title}
                            </p>
                            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                              {entry.summary}
                            </p>
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
            </div>
          ) : (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {report.currentCycle.unavailableReason}
              </p>
            </div>
          )}
        </Card>

          {hasDeeperReportLayers ? (
            <>
            <Card className="space-y-5">
              <div className="space-y-2">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  AI Interpretation
                </p>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  Explanation stays interpretive, never computational.
                </h2>
              </div>

              <div className="space-y-4">
                {chartReport.interpretation.sections.map((section) => (
                  <div
                    key={section.key}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5"
                  >
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      {section.title}
                    </p>
                    <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-5">
              <div className="space-y-2">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Chart Signals
                </p>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  Deterministic cues used for remedy matching.
                </h2>
              </div>

              <ReportSignalList signals={chartReport.signals} />
            </Card>
          </>
        ) : (
          <>
            <AnalyticsEventTracker
              event="upgrade_prompt_view"
              payload={{
                page: "/dashboard/report",
                surface: "protected",
                feature: "report-premium-lock",
              }}
            />
            <Card className="space-y-5">
              <div className="space-y-2">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Premium Report Layers
                </p>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  This deeper report layer is part of premium access.
                </h2>
              </div>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {reportUpgradeCopy.message}
              </p>
              <div className="flex flex-wrap gap-3">
                <TrackedLink
                  href={reportUpgradeCopy.upgradeHref}
                  className={buttonStyles({ size: "sm", tone: "secondary" })}
                  eventName="upgrade_started"
                  eventPayload={{
                    page: "/dashboard/report",
                    surface: "protected",
                    feature: "report-premium-lock",
                  }}
                >
                  {reportUpgradeCopy.ctaLabel}
                </TrackedLink>
                <Link
                  href={subscriptionState.nextAction.href}
                  className={buttonStyles({ size: "sm", tone: "ghost" })}
                >
                  {subscriptionState.recommendation?.ctaLabel ??
                    subscriptionState.nextAction.label}
                </Link>
              </div>
            </Card>
          </>
        )}

        <PremiumReportGenerator />

        {reportProCopy ? (
          <>
            <AnalyticsEventTracker
              event="upgrade_prompt_view"
              payload={{
                page: "/dashboard/report",
                surface: "protected",
                feature: "report-pro-continuity",
                plan: "PREMIUM",
              }}
            />
            <Card className="space-y-5">
              <div className="space-y-2">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Pro Continuity
                </p>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  {reportProCopy.title}
                </h2>
              </div>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {reportProCopy.message}
              </p>
              <TrackedLink
                href={reportProCopy.upgradeHref}
                className={buttonStyles({ size: "sm", tone: "secondary" })}
                eventName="upgrade_started"
                eventPayload={{
                  page: "/dashboard/report",
                  surface: "protected",
                  feature: "report-pro-continuity",
                  plan: "PREMIUM",
                }}
              >
                {reportProCopy.ctaLabel}
              </TrackedLink>
            </Card>
          </>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Consultation Context
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Recent notes that can support a more informed next conversation.
            </h2>
          </div>

          {report.consultationNotes.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {report.consultationNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {note.serviceLabel}
                    </p>
                    <Badge tone="neutral">{note.statusLabel}</Badge>
                  </div>
                  <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {note.note}
                  </p>
                  {note.scheduledForUtc ? (
                    <p className="mt-3 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      {formatDateTime(note.scheduledForUtc)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                No consultation notes are attached yet. When they are added, this
                report will keep them available beside the chart summary.
              </p>
            </div>
          )}
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Recommended Remedies
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Only approved records appear here.
            </h2>
          </div>

          {chartReport.remedies.length ? (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {chartReport.remedies.map((remedy) => (
                <RemedyCard key={remedy.slug} remedy={remedy} />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                The chart report is ready, but no approved remedy records
                matched the current signal set yet.
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Caution
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Read the interpretation as guidance, not certainty.
            </h2>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {chartReport.interpretation.caution}
          </p>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Disclosures
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              The boundaries of this first report page.
            </h2>
          </div>

          <div className="space-y-3">
            {reportDisclosures.map((line) => (
              <p
                key={line}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
              >
                {line}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
