import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { monetizationConfig } from "@/lib/monetization/monetization-config";
import { globalMonetizationCopy } from "@/modules/localization/copy";

type ConsultationCTAProps = {
  pagePath: string;
  placement: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  className?: string;
};

export function ConsultationCTA({
  pagePath,
  placement,
  title = "Need a deeper personal chart analysis?",
  description = "Book a consultation with Joy Prakash Sarmah for chart-specific guidance.",
  ctaLabel = globalMonetizationCopy.bookConsultation,
  className,
}: Readonly<ConsultationCTAProps>) {
  if (!monetizationConfig.enableConsultationCTA) {
    return null;
  }

  return (
    <Card tone="light" className={cn("space-y-4 border-[rgba(184,137,67,0.24)]", className)}>
      <Badge tone="trust">Consultation</Badge>
      <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
        {title}
      </h3>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {description}
      </p>
      <TrackedLink
        href={monetizationConfig.consultationUrl}
        eventName="consultation_cta_click"
        eventPayload={{ page: pagePath, placement, cta: "consultation" }}
        className={buttonStyles({ size: "sm", className: "w-full justify-center sm:w-auto" })}
      >
        {ctaLabel}
      </TrackedLink>
    </Card>
  );
}
