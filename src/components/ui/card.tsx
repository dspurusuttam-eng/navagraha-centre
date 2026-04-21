import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardTone = "default" | "muted" | "accent" | "light" | "contrast";

const toneStyles: Record<CardTone, string> = {
  default:
    "border-[color:var(--card-default-border)] bg-[image:var(--card-default-bg)] text-[color:var(--color-ink-body)] backdrop-blur-sm",
  muted:
    "border-[color:var(--card-muted-border)] bg-[image:var(--card-muted-bg)] text-[color:var(--color-ink-body)] backdrop-blur-sm",
  accent:
    "border-[color:var(--card-accent-border)] bg-[image:var(--card-accent-bg)] text-[color:var(--color-ink-body)] backdrop-blur-sm",
  light:
    "border-[color:var(--card-light-border)] bg-[image:var(--card-light-bg)] text-[color:var(--card-light-text)] shadow-[var(--card-light-shadow)]",
  contrast:
    "border-[color:var(--card-contrast-border)] bg-[image:var(--card-contrast-bg)] text-[color:var(--color-ink-body)]",
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
        "rounded-[var(--radius-2xl)] border p-5 shadow-[var(--shadow-md)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-emphasized)] sm:p-6",
        toneStyles[tone],
        interactive &&
          "hover:-translate-y-1 hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-lg)]",
        className
      )}
      {...props}
    />
  );
}
