import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonTone =
  | "accent"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "ni"
  | "premium";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const baseStyles =
  "inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border text-sm font-medium uppercase tracking-[var(--tracking-label)] whitespace-normal text-center leading-[1.2] break-words transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-emphasized)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-ivory)] disabled:pointer-events-none disabled:opacity-40";

const toneStyles: Record<ButtonTone, string> = {
  accent:
    "border-[color:var(--button-primary-border)] bg-[image:var(--button-primary-bg)] text-[color:var(--button-primary-text)] shadow-[var(--shadow-glow)] hover:-translate-y-0.5 hover:border-[color:var(--button-primary-hover-border)] hover:brightness-[1.03] hover:shadow-[0_16px_38px_rgba(185,139,70,0.3)]",
  secondary:
    "border-[color:var(--button-secondary-border)] bg-[image:var(--button-secondary-bg)] text-[color:var(--button-secondary-text)] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.56)] hover:text-[color:var(--color-text-primary)]",
  tertiary:
    "border-[color:var(--button-tertiary-border)] bg-[color:var(--button-tertiary-bg)] text-[color:var(--button-tertiary-text)] shadow-[var(--button-tertiary-shadow)] hover:-translate-y-0.5 hover:border-[rgba(185,139,70,0.34)] hover:bg-[color:var(--button-tertiary-bg-hover)] hover:text-[color:var(--button-tertiary-text-hover)]",
  ghost:
    "border-transparent bg-transparent text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-accent-soft)] hover:text-[color:var(--color-text-primary)]",
  ni:
    "border-[color:var(--button-cta-ni-border)] bg-[image:var(--button-cta-ni-bg)] text-[color:var(--button-cta-ni-text)] shadow-[0_12px_28px_rgba(0,109,255,0.18)] hover:-translate-y-0.5 hover:brightness-[1.04]",
  premium:
    "border-[color:var(--button-cta-premium-border)] bg-[color:var(--button-cta-premium-bg)] text-[color:var(--button-cta-premium-text)] shadow-[0_14px_32px_rgba(5,5,5,0.18)] hover:-translate-y-0.5 hover:brightness-[1.08]",
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
