import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type AdReadyZoneProps = {
  label?: string;
  description?: string;
  className?: string;
};

export function AdReadyZone({
  label = "Future Sponsored Placement",
  description = "Reserved content-safe slot for future AdSense integration. No live ad script is loaded in this phase.",
  className,
}: Readonly<AdReadyZoneProps>) {
  return (
    <Card
      className={cn(
        "border-dashed border-[color:var(--color-border)] bg-[rgba(255,255,255,0.58)]",
        className
      )}
    >
      <div className="space-y-3">
        <Badge tone="outline">{label}</Badge>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          {description}
        </p>
      </div>
    </Card>
  );
}
