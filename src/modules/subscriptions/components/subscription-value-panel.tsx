import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getMonetizationUpgradeCopy,
  getPlanComparisonRows,
  getPostUpgradeNextAction,
  getSubscriptionLifecycleLabel,
  type SubscriptionRetentionIntelligenceSnapshot,
} from "@/modules/subscriptions";
import type { UserPlanModel, UserPlanUsageModel } from "@/modules/subscriptions";

type SubscriptionValuePanelProps = {
  snapshot: SubscriptionRetentionIntelligenceSnapshot;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  userPlan?: UserPlanModel;
  usage?: UserPlanUsageModel;
  upgradeHref?: string;
};

export function SubscriptionValuePanel({
  snapshot,
  eyebrow = "Membership",
  title = "Your subscription context",
  description = "Keep premium guidance optional, clear, and paced to your real usage rhythm.",
  className,
  userPlan,
  usage,
  upgradeHref,
}: Readonly<SubscriptionValuePanelProps>) {
  const lifecycleLabel = getSubscriptionLifecycleLabel(snapshot);
  const planTitle = snapshot.access.plan?.title ?? "Free Access";
  const activePlanType = userPlan?.plan_type ?? "FREE";
  const nextBillingLabel =
    snapshot.access.subscription?.nextBillingDateUtc ??
    snapshot.latestSubscription?.nextBillingDateUtc ??
    null;
  const planRow =
    getPlanComparisonRows().find((row) => row.planType === activePlanType) ??
    getPlanComparisonRows()[0];
  const contextualUpgradeCopy = getMonetizationUpgradeCopy({
    prompt: "return-usage",
    surface: "protected",
    planType: activePlanType,
  });
  const postUpgradeAction =
    activePlanType === "PREMIUM" || activePlanType === "PRO"
      ? getPostUpgradeNextAction(activePlanType)
      : null;

  return (
    <Card className={className ? `${className} space-y-5` : "space-y-5"}>
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          {eyebrow}
        </p>
        <h2
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          {title}
        </h2>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {description}
        </p>
      </div>

      <div className="space-y-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={snapshot.access.isSubscribed ? "accent" : "outline"}>
            {planTitle}
          </Badge>
          <Badge tone="neutral">{lifecycleLabel}</Badge>
          {userPlan ? <Badge tone="neutral">{userPlan.plan_type}</Badge> : null}
        </div>

        {nextBillingLabel ? (
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Next billing date:{" "}
            <span className="text-[color:var(--color-foreground)]">
              {new Date(nextBillingLabel).toLocaleDateString("en-IN", {
                dateStyle: "medium",
              })}
            </span>
          </p>
        ) : (
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Membership is optional. You can continue with free guidance and
            choose premium only when you need deeper continuity.
          </p>
        )}

        <div className="space-y-2">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Plan Value
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {planRow.shortDescription}
          </p>
        </div>

        <div className="space-y-2 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Included Depth
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {planRow.aiQuestions}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {planRow.reports}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {planRow.assistantDepth}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {planRow.advancedInsights}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {planRow.continuity}
          </p>
        </div>

        <div className="space-y-2">
          {snapshot.benefitsSummary.slice(0, 3).map((line) => (
            <p
              key={line}
              className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
            >
              {line}
            </p>
          ))}
        </div>

        {usage ? (
          <div className="space-y-2 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Usage Left
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              AI questions today:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {usage.ai_questions_remaining_today === null
                  ? "Unlimited"
                  : usage.ai_questions_remaining_today}
              </span>
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Premium report generations this month:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {usage.premium_reports_remaining_this_month === null
                  ? "Unlimited"
                  : usage.premium_reports_remaining_this_month}
              </span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-4 py-4">
        <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Continue Your Insights
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {snapshot.nudge.summary}
        </p>
      </div>

      {postUpgradeAction ? (
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Premium Confirmation
          </p>
          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {postUpgradeAction.title}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {postUpgradeAction.message}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={postUpgradeAction.href}
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              {postUpgradeAction.ctaLabel}
            </Link>
            <Link
              href={postUpgradeAction.secondaryHref}
              className={buttonStyles({ size: "sm", tone: "ghost" })}
            >
              {postUpgradeAction.secondaryCtaLabel}
            </Link>
          </div>
        </div>
      ) : null}

      {snapshot.recommendation ? (
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{snapshot.recommendation.planId}</Badge>
            <Badge tone="neutral">{snapshot.recommendation.priority}</Badge>
          </div>
          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {snapshot.recommendation.title}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {snapshot.recommendation.summary}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {contextualUpgradeCopy.message}
          </p>
          <Link
            href={snapshot.recommendation.href}
            className={buttonStyles({ size: "sm", tone: "secondary" })}
          >
            {snapshot.recommendation.ctaLabel}
          </Link>
        </div>
      ) : null}

      {upgradeHref ? (
        <Link
          href={upgradeHref}
          className={buttonStyles({ size: "sm", tone: "secondary" })}
        >
          Upgrade Plan
        </Link>
      ) : null}
    </Card>
  );
}
