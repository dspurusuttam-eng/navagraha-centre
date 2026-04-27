import { cn } from "@/lib/cn";

type AstrologyDisclaimerProps = {
  text: string;
  className?: string;
};

export function AstrologyDisclaimer({
  text,
  className,
}: Readonly<AstrologyDisclaimerProps>) {
  if (!text.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.22)] bg-[rgba(215,187,131,0.08)] px-4 py-4",
        className
      )}
    >
      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
        Guidance Disclaimer
      </p>
      <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
        {text}
      </p>
    </div>
  );
}
