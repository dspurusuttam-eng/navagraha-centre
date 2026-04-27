import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { monetizationConfig } from "@/lib/monetization/monetization-config";
import { globalMonetizationCopy } from "@/modules/localization/copy";

type ReportCTAProps = {
  pagePath: string;
  placement: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  startingPrice?: string;
  className?: string;
};

export function ReportCTA({
  pagePath,
  placement,
  title = "Get a detailed astrology report",
  description = "Move from quick guidance into deeper chart interpretation with structured report layers.",
  ctaLabel = globalMonetizationCopy.viewReports,
  startingPrice = "Pricing unlocks in premium phase",
  className,
}: Readonly<ReportCTAProps>) {
  if (!monetizationConfig.enableReportCTA) {
    return null;
  }

  return (
    <Card tone="light" className={cn("space-y-4 border-[rgba(184,137,67,0.24)]", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">Reports</Badge>
        <Badge tone="outline">{startingPrice}</Badge>
      </div>
      <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
        {title}
      </h3>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {description}
      </p>
      <div className="flex flex-wrap gap-3">
        <TrackedLink
          href={monetizationConfig.reportsUrl}
          eventName="report_cta_click"
          eventPayload={{ page: pagePath, placement, cta: "reports" }}
          className={buttonStyles({ size: "sm", className: "w-full justify-center sm:w-auto" })}
        >
          {ctaLabel}
        </TrackedLink>
        <TrackedLink
          href={monetizationConfig.consultationUrl}
          eventName="consultation_cta_click"
          eventPayload={{ page: pagePath, placement, cta: "reports-consultation" }}
          className={buttonStyles({
            size: "sm",
            tone: "secondary",
            className: "w-full justify-center sm:w-auto",
          })}
        >
          {globalMonetizationCopy.talkToAstrologer}
        </TrackedLink>
      </div>
    </Card>
  );
}
