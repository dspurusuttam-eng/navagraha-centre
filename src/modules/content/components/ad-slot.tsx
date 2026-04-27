import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type AdSlotProps = {
  placement: "after-intro" | "mid-article" | "before-related" | "sidebar";
  format?: "banner" | "rectangle" | "responsive";
  className?: string;
};

function placementLabel(placement: AdSlotProps["placement"]) {
  switch (placement) {
    case "after-intro":
      return "Ad Slot: After Intro";
    case "mid-article":
      return "Ad Slot: Mid Article";
    case "before-related":
      return "Ad Slot: Before Related Articles";
    case "sidebar":
      return "Ad Slot: Sidebar";
    default:
      return "Ad Slot";
  }
}

export function AdSlot({
  placement,
  format = "responsive",
  className,
}: Readonly<AdSlotProps>) {
  return (
    <Card
      className={cn(
        "border-dashed border-[color:var(--color-border)] bg-[rgba(255,255,255,0.56)]",
        className
      )}
    >
      <div className="space-y-3">
        <Badge tone="outline">{placementLabel(placement)}</Badge>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          Reserved ad-safe placeholder. Format: {format}.
        </p>
      </div>
    </Card>
  );
}

