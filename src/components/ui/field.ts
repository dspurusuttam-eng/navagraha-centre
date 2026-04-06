import { cn } from "@/lib/cn";

export function fieldStyles(className?: string) {
  return cn(
    "w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-field)] px-4 py-3 text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)] shadow-[var(--shadow-sm)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)] placeholder:text-[color:var(--color-muted-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
}
