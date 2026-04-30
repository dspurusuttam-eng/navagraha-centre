import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardTone = "default" | "muted" | "accent" | "light" | "contrast";

const toneStyles: Record<CardTone, string> = {
  default:
    "border-[color:var(--card-default-border)] bg-[image:var(--card-default-bg)] text-[color:var(--color-text-secondary)] backdrop-blur-sm",
  muted:
    "border-[color:var(--card-muted-border)] bg-[image:var(--card-muted-bg)] text-[color:var(--color-text-secondary)] backdrop-blur-sm",
  accent:
    "border-[color:var(--card-accent-border)] bg-[image:var(--card-accent-bg)] text-[color:var(--color-text-secondary)] backdrop-blur-sm",
  light:
    "border-[color:var(--card-light-border)] bg-[image:var(--card-light-bg)] text-[color:var(--card-light-text)] shadow-[var(--card-light-shadow)]",
  contrast:
    "border-[color:var(--card-contrast-border)] bg-[image:var(--card-contrast-bg)] text-[color:var(--color-text-secondary)]",
};

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
  interactive?: boolean;
};

export function Card({
  className,
  tone = "default",
  interactive = false,
  ...props
}: Readonly<CardProps>) {
  return (
    <div
      className={cn(
        "brand-signature-grid relative overflow-hidden rounded-[var(--radius-card)] border p-[var(--space-card-padding)] shadow-[var(--shadow-card-soft)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-emphasized)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(130deg,rgba(185,139,70,0.12),rgba(255,255,255,0)_42%,rgba(185,139,70,0.08)_100%)] before:opacity-90 sm:p-[var(--space-card-padding-lg)]",
        toneStyles[tone],
        interactive &&
          "hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
      {...props}
    />
  );
}
