import { cn } from "@/lib/cn";

export function fieldStyles(className?: string) {
  return cn(
    "w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-strong)] bg-[linear-gradient(180deg,rgba(18,25,43,0.96)_0%,rgba(10,15,28,0.95)_100%)] px-4 py-3 text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)] shadow-[0_10px_24px_rgba(9,14,28,0.2)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)] placeholder:text-[color:var(--color-muted-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] focus-visible:border-[rgba(240,217,164,0.74)] disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
}
