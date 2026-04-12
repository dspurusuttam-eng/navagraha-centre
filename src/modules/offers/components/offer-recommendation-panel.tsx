import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OfferRecommendationResult } from "@/modules/offers/types";

type OfferRecommendationPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  recommendations: OfferRecommendationResult;
  variant?: "compact" | "expanded";
  className?: string;
};

function getPriorityTone(
  priority: NonNullable<
    OfferRecommendationResult["primaryRecommendation"]
  >["priority"]
) {
  switch (priority) {
    case "PRIMARY":
      return "accent" as const;
    case "SUPPORTIVE":
      return "outline" as const;
    default:
      return "neutral" as const;
  }
}

export function OfferRecommendationPanel({
  eyebrow,
  title,
  description,
  recommendations,
  variant = "compact",
  className,
}: Readonly<OfferRecommendationPanelProps>) {
  const recommendation = recommendations.primaryRecommendation;

  if (!recommendation) {
    return null;
  }

  const isExpanded = variant === "expanded";

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

      <div className="space-y-4 rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={getPriorityTone(recommendation.priority)}>
            {recommendation.priority}
          </Badge>
          <Badge tone="neutral">{recommendation.kindLabel}</Badge>
          {recommendation.optionalPurchase ? (
            <Badge tone="outline">Optional Purchase</Badge>
          ) : null}
        </div>

        <div className="space-y-3">
          <h3 className="text-[length:var(--font-size-body-lg)] text-[color:var(--color-foreground)]">
            {recommendation.title}
          </h3>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {recommendation.summary}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {recommendation.description}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Why this appears
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {recommendation.rationale}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {recommendation.safetyNote}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={recommendation.href}
            className={buttonStyles({
              size: isExpanded ? "lg" : "sm",
              tone: "secondary",
            })}
          >
            {recommendation.ctaLabel}
          </Link>
        </div>
      </div>

      {recommendations.secondaryRecommendations.length ? (
        <div className="space-y-3">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Also worth considering
          </p>
          <div className="space-y-3">
            {recommendations.secondaryRecommendations
              .slice(0, isExpanded ? 2 : 1)
              .map((item) => (
                <div
                  key={item.key}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={getPriorityTone(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge tone="neutral">{item.kindLabel}</Badge>
                    {item.optionalPurchase ? (
                      <Badge tone="outline">Optional Purchase</Badge>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {item.summary}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {item.safetyNote}
                  </p>
                  <div className="mt-3">
                    <Link
                      href={item.href}
                      className={buttonStyles({ size: "sm", tone: "ghost" })}
                    >
                      {item.ctaLabel}
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
