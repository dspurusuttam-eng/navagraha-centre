import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { monetizationConfig } from "@/lib/monetization/monetization-config";
import { globalMonetizationCopy } from "@/modules/localization/copy";

type PremiumAICTAProps = {
  pagePath: string;
  placement: string;
  title?: string;
  description?: string;
  className?: string;
};

export function PremiumAICTA({
  pagePath,
  placement,
  title = "Premium AI pathways for deeper guidance",
  description = "Deep Kundli analysis, yearly prediction, and advanced AI guidance can connect free tools with report and consultation pathways when more depth is needed.",
  className,
}: Readonly<PremiumAICTAProps>) {
  if (!monetizationConfig.enablePremiumAICTA) {
    return null;
  }

  return (
    <Card tone="light" className={cn("cta-block space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{globalMonetizationCopy.premiumAi}</Badge>
        <Badge tone="outline">Premium Pathway</Badge>
      </div>
      <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
        {title}
      </h3>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {description}
      </p>
      <div className="flex flex-wrap gap-3">
        <TrackedLink
          href={monetizationConfig.navagrahaAIUrl}
          eventName="premium_ai_cta_click"
          eventPayload={{ page: pagePath, placement, cta: "premium-ai" }}
          className={buttonStyles({ size: "sm", className: "w-full justify-center sm:w-auto" })}
        >
          NAVAGRAHA AI
        </TrackedLink>
        <TrackedLink
          href={monetizationConfig.reportsUrl}
          eventName="report_cta_click"
          eventPayload={{ page: pagePath, placement, cta: "premium-ai-reports" }}
          className={buttonStyles({
            size: "sm",
            tone: "secondary",
            className: "w-full justify-center sm:w-auto",
          })}
        >
          {globalMonetizationCopy.viewReports}
        </TrackedLink>
      </div>
    </Card>
  );
}
