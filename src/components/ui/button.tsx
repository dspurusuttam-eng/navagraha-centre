import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonTone = "accent" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border text-sm font-medium uppercase tracking-[var(--tracking-label)] whitespace-nowrap transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-emphasized)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] disabled:pointer-events-none disabled:opacity-40";

const toneStyles: Record<ButtonTone, string> = {
  accent:
    "border-[rgba(243,218,170,0.72)] bg-[linear-gradient(135deg,var(--color-accent)_0%,var(--color-accent-strong)_100%)] text-[color:var(--color-accent-contrast)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 hover:border-[color:var(--color-accent-strong)] hover:brightness-[1.03] hover:shadow-[var(--shadow-lg)]",
  secondary:
    "border-[color:var(--color-border-strong)] bg-[linear-gradient(180deg,rgba(34,29,24,0.94)_0%,rgba(20,17,14,0.94)_100%)] text-[color:var(--color-foreground)] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:border-[rgba(243,218,170,0.6)] hover:text-[color:var(--color-accent-strong)]",
  ghost:
    "border-transparent bg-transparent text-[color:var(--color-muted)] hover:bg-[color:var(--color-accent-soft)] hover:text-[color:var(--color-foreground)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-11 px-[1.125rem] text-[0.72rem]",
  md: "min-h-12 px-[1.375rem] text-[0.74rem]",
  lg: "min-h-[3.25rem] px-7 text-[0.76rem]",
};

export function buttonStyles({
  tone = "accent",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    baseStyles,
    toneStyles[tone],
    sizeStyles[size],
    fullWidth && "w-full",
    className
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function Button({
  className,
  tone = "accent",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button
      className={buttonStyles({ tone, size, fullWidth, className })}
      type={type}
      {...props}
    />
  );
}
