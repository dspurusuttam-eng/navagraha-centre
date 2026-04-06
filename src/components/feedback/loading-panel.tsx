import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type LoadingPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function LoadingPanel({
  eyebrow,
  title,
  description,
}: Readonly<LoadingPanelProps>) {
  return (
    <Container className="py-[var(--space-16)]">
      <Card tone="accent" className="space-y-5">
        <div className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            {eyebrow}
          </p>
          <h1
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            {title}
          </h1>
          <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.035)]"
            />
          ))}
        </div>
      </Card>
    </Container>
  );
}
