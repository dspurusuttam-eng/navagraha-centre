import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles, type ButtonTone } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type HeroAction = {
  href: string;
  label: string;
  tone?: ButtonTone;
};

export type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: readonly string[];
  note?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  supportTitle?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  highlights,
  note,
  primaryAction,
  secondaryAction,
  supportTitle = "Foundation Snapshot",
}: Readonly<PageHeroProps>) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--color-border)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(205,176,124,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(205,176,124,0.08),transparent_24%)]" />
      <Container className="relative grid gap-10 py-[var(--space-14)] sm:py-[var(--space-16)] lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-start">
        <div className="space-y-7">
          <Badge tone="accent">{eyebrow}</Badge>

          <div className="space-y-5">
            <h1
              className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-lg)] text-[color:var(--color-foreground)] sm:text-[length:var(--font-size-display-xl)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              {title}
            </h1>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {description}
            </p>
          </div>

          {primaryAction || secondaryAction ? (
            <div className="flex flex-wrap gap-3">
              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className={buttonStyles({
                    tone: primaryAction.tone ?? "accent",
                    size: "lg",
                  })}
                >
                  {primaryAction.label}
                </Link>
              ) : null}

              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className={buttonStyles({
                    tone: secondaryAction.tone ?? "secondary",
                    size: "lg",
                  })}
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <Card tone="accent" className="flex flex-col gap-6 p-7">
          <div className="space-y-3">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {supportTitle}
            </p>
            <ul className="space-y-4">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="border-b border-[color:var(--color-border)] pb-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)] last:border-b-0 last:pb-0"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {note ? (
            <p className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
              {note}
            </p>
          ) : null}
        </Card>
      </Container>
    </section>
  );
}
