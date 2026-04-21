import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type PlaceholderTone = "gold" | "midnight";

const toneStyles: Record<PlaceholderTone, string> = {
  gold: "bg-[radial-gradient(circle_at_top_left,rgba(215,187,131,0.2),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,236,216,0.94)_100%)]",
  midnight:
    "bg-[radial-gradient(circle_at_bottom_right,rgba(215,187,131,0.16),transparent_30%),linear-gradient(180deg,rgba(255,252,246,0.98)_0%,rgba(244,232,219,0.94)_100%)]",
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
        "relative overflow-hidden border-[color:var(--color-border)] p-0",
        toneStyles[tone],
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),transparent_48%)]" />
      <div className="absolute inset-y-0 right-[12%] w-px bg-[rgba(184,137,67,0.2)]" />
      <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full border border-[color:var(--color-border-strong)]" />
      <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-[rgba(222,199,154,0.36)] blur-xl" />

      <div className="relative flex min-h-[360px] flex-col justify-between gap-10 p-7 sm:p-8">
        <div className="space-y-4">
          <Badge tone="accent">{eyebrow}</Badge>
          <div className="space-y-3">
            <h3
              className="max-w-lg font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              {title}
            </h3>
            <p className="max-w-md text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {description}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {annotations.map((item) => (
            <div
              key={item}
              className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.74)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-strong)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
