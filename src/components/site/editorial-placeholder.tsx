import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type PlaceholderTone = "gold" | "midnight";

const toneStyles: Record<PlaceholderTone, string> = {
  gold: "bg-[radial-gradient(circle_at_top_left,rgba(215,187,131,0.22),transparent_32%),linear-gradient(180deg,rgba(33,25,18,0.96)_0%,rgba(14,12,10,0.96)_100%)]",
  midnight:
    "bg-[radial-gradient(circle_at_bottom_right,rgba(215,187,131,0.16),transparent_26%),linear-gradient(180deg,rgba(18,19,23,0.96)_0%,rgba(10,10,12,0.96)_100%)]",
};

export type EditorialPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  annotations: string[];
  tone?: PlaceholderTone;
  className?: string;
};

export function EditorialPlaceholder({
  eyebrow,
  title,
  description,
  annotations,
  tone = "gold",
  className,
}: Readonly<EditorialPlaceholderProps>) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-0",
        toneStyles[tone],
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_48%)]" />
      <div className="absolute inset-y-0 right-[12%] w-px bg-[rgba(255,255,255,0.08)]" />
      <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full border border-[color:var(--color-border-strong)]" />
      <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-[rgba(255,255,255,0.03)] blur-xl" />

      <div className="relative flex min-h-[360px] flex-col justify-between gap-10 p-7 sm:p-8">
        <div className="space-y-4">
          <Badge tone="accent">{eyebrow}</Badge>
          <div className="space-y-3">
            <h3
              className="max-w-lg font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              {title}
            </h3>
            <p className="max-w-md text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {description}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {annotations.map((item) => (
            <div
              key={item}
              className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
