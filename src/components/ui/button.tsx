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
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border text-sm font-medium uppercase tracking-[var(--tracking-label)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-emphasized)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] disabled:pointer-events-none disabled:opacity-40";

const toneStyles: Record<ButtonTone, string> = {
  accent:
    "border-[color:var(--color-accent)] bg-[linear-gradient(135deg,var(--color-accent)_0%,var(--color-accent-strong)_100%)] text-[color:var(--color-accent-contrast)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
  secondary:
    "border-[color:var(--color-border-strong)] bg-[color:var(--color-panel)] text-[color:var(--color-foreground)] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
  ghost:
    "border-transparent bg-transparent text-[color:var(--color-muted)] hover:bg-[color:var(--color-accent-soft)] hover:text-[color:var(--color-foreground)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-[0.7rem]",
  md: "min-h-11 px-5",
  lg: "min-h-12 px-6",
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
