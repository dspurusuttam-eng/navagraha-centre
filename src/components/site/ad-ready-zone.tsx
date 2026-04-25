import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type AdReadyZoneProps = {
  label?: string;
  description?: string;
  className?: string;
};

export function AdReadyZone({
  label = "Sponsored Insights Zone",
  description = "Reserved in-content zone for future sponsor blocks while preserving reading flow and layout stability.",
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
