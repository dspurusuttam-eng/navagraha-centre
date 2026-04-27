import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { monetizationConfig } from "@/lib/monetization/monetization-config";
import { SponsoredDisclosure } from "@/components/monetization/SponsoredDisclosure";
import { globalMonetizationCopy } from "@/modules/localization/copy";

type GemstoneGuidanceCTAProps = {
  pagePath: string;
  placement: string;
  title?: string;
  description?: string;
  className?: string;
};

export function GemstoneGuidanceCTA({
  pagePath,
  placement,
  title = "Gemstone guidance should stay chart-specific",
  description = "Gemstones should be selected only after proper chart analysis. Use consultation first, then explore shop options carefully.",
  className,
}: Readonly<GemstoneGuidanceCTAProps>) {
  if (!monetizationConfig.enableShopCTA) {
    return null;
  }

  return (
    <Card tone="light" className={cn("space-y-4 border-[rgba(184,137,67,0.24)]", className)}>
      <Badge tone="trust">{globalMonetizationCopy.gemstoneGuidance}</Badge>
      <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
        {title}
      </h3>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {description}
      </p>
      <div className="flex flex-wrap gap-3">
        <TrackedLink
          href={monetizationConfig.consultationUrl}
          eventName="gemstone_guidance_click"
          eventPayload={{ page: pagePath, placement, cta: "gemstone-consultation" }}
          className={buttonStyles({ size: "sm", className: "w-full justify-center sm:w-auto" })}
        >
          {globalMonetizationCopy.talkToAstrologer}
        </TrackedLink>
        <TrackedLink
          href={monetizationConfig.shopUrl}
          eventName="shop_cta_click"
          eventPayload={{ page: pagePath, placement, cta: "gemstone-shop" }}
          className={buttonStyles({
            size: "sm",
            tone: "tertiary",
            className: "w-full justify-center sm:w-auto",
          })}
        >
          {globalMonetizationCopy.exploreShop}
        </TrackedLink>
      </div>
      <SponsoredDisclosure />
    </Card>
  );
}
