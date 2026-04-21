import { cn } from "@/lib/cn";

export function fieldStyles(className?: string) {
  return cn(
    "w-full rounded-[var(--radius-lg)] border border-[color:var(--field-border)] bg-[image:var(--field-bg)] px-4 py-3 text-[length:var(--font-size-body-md)] text-[color:var(--field-text)] shadow-[var(--field-shadow)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)] placeholder:text-[color:var(--field-placeholder)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] focus-visible:border-[color:var(--field-border-focus)] disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
}
