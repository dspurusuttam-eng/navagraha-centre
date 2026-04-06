import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardTone = "default" | "muted" | "accent";

const toneStyles: Record<CardTone, string> = {
  default:
    "border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(26,23,20,0.94)_0%,rgba(16,14,12,0.94)_100%)]",
  muted: "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.025)]",
  accent:
    "border-[rgba(215,187,131,0.28)] bg-[linear-gradient(180deg,rgba(46,35,21,0.86)_0%,rgba(19,15,11,0.95)_100%)]",
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
        "rounded-[var(--radius-2xl)] border p-6 shadow-[var(--shadow-md)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-emphasized)]",
        toneStyles[tone],
        interactive &&
          "hover:-translate-y-1 hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-lg)]",
        className
      )}
      {...props}
    />
  );
}
