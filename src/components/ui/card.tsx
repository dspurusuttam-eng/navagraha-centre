import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardTone = "default" | "muted" | "accent";

const toneStyles: Record<CardTone, string> = {
  default:
    "border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(27,24,20,0.96)_0%,rgba(14,12,10,0.96)_100%)] backdrop-blur-sm",
  muted:
    "border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(24,21,18,0.86)_0%,rgba(13,11,10,0.88)_100%)] backdrop-blur-sm",
  accent:
    "border-[rgba(215,187,131,0.32)] bg-[linear-gradient(180deg,rgba(52,40,24,0.9)_0%,rgba(20,16,12,0.96)_100%)] backdrop-blur-sm",
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
