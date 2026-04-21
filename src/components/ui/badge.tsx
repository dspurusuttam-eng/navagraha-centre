import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "accent" | "neutral" | "outline" | "trust";

const toneStyles: Record<BadgeTone, string> = {
  accent:
    "border-[color:var(--color-border-strong)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
  neutral:
    "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.74)] text-[color:var(--color-ink-body)]",
  outline:
    "border-[color:var(--color-border-strong)] bg-transparent text-[color:var(--color-ink-strong)]",
  trust:
    "border-[color:var(--color-trust-border)] bg-[color:var(--color-trust-bg-soft)] text-[color:var(--color-trust-text)]",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({
  className,
  tone = "accent",
  ...props
}: Readonly<BadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1 text-[var(--font-size-label)] font-medium uppercase tracking-[var(--tracking-label)] transition [transition-duration:var(--motion-duration-fast)]",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
