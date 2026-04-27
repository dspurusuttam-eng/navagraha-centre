import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type TrustNoteProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function TrustNote({
  title = "Guidance Note",
  description = "Recommendations are intended for guidance and reflection. Choose products or services based on your needs and proper consultation.",
  className,
}: Readonly<TrustNoteProps>) {
  return (
    <Card tone="light" className={cn("space-y-2 border-[rgba(184,137,67,0.2)]", className)}>
      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
        {title}
      </p>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {description}
      </p>
    </Card>
  );
}

