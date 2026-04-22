import { cn } from "@/lib/cn";
import type { ShopProductVisualTone } from "@/modules/shop/types";

const toneStyles: Record<ShopProductVisualTone, string> = {
  gold: "bg-[radial-gradient(circle_at_top_left,rgba(215,187,131,0.24),transparent_34%),linear-gradient(180deg,rgba(255,251,244,0.96)_0%,rgba(245,235,216,0.94)_100%)]",
  midnight:
    "bg-[radial-gradient(circle_at_bottom_right,rgba(215,187,131,0.18),transparent_30%),linear-gradient(180deg,rgba(255,250,242,0.96)_0%,rgba(242,231,214,0.94)_100%)]",
  ember:
    "bg-[radial-gradient(circle_at_top_right,rgba(215,140,92,0.22),transparent_32%),linear-gradient(180deg,rgba(255,249,240,0.96)_0%,rgba(242,228,206,0.94)_100%)]",
};

type ProductMerchArtProps = {
  eyebrow: string;
  title: string;
  annotations: string[];
  tone: ShopProductVisualTone;
  compact?: boolean;
};

export function ProductMerchArt({
  eyebrow,
  title,
  annotations,
  tone,
  compact = false,
}: Readonly<ProductMerchArtProps>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-2xl)] border border-[color:var(--color-border)]",
        toneStyles[tone],
        compact ? "min-h-[220px] p-5" : "min-h-[380px] p-7"
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),transparent_46%)]" />
      <div className="absolute left-7 top-7 h-24 w-24 rounded-full border border-[rgba(184,137,67,0.2)]" />
      <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-[rgba(184,137,67,0.08)] blur-2xl" />
      <div className="absolute inset-y-0 right-[18%] w-px bg-[rgba(184,137,67,0.16)]" />

      <div className="relative flex h-full flex-col justify-between gap-8">
        <div className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            {eyebrow}
          </p>
          <h3
            className={cn(
              "max-w-xl font-[family-name:var(--font-display)] text-[color:var(--color-foreground)]",
              compact
                ? "text-[length:var(--font-size-title-sm)]"
                : "text-[length:var(--font-size-title-lg)]"
            )}
            style={{
              letterSpacing: "var(--tracking-display)",
              lineHeight: "var(--line-height-tight)",
            }}
          >
            {title}
          </h3>
        </div>

        <div
          className={cn(
            "grid gap-3",
            compact ? "sm:grid-cols-1" : "sm:grid-cols-2"
          )}
        >
          {annotations.slice(0, compact ? 2 : 3).map((item) => (
            <div
              key={item}
              className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.76)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-strong)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
