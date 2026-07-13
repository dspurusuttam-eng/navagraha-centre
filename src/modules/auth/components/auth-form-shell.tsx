import Link from "next/link";
import { NavagrahaLogo } from "@/components/brand/navagraha-logo";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PremiumPageShell, PremiumStatusBadge } from "@/components/ui/premium";

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
};

export function AuthFormShell({
  eyebrow,
  title,
  description,
  highlights,
  alternateHref,
  alternateLabel,
  children,
}: Readonly<AuthFormShellProps>) {
  return (
    <PremiumPageShell
      className="py-[var(--space-8)] sm:py-[var(--space-12)]"
      tone="soft"
    >
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-center">
        <div className="space-y-7">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)] transition hover:text-[color:var(--color-foreground)]"
          >
            <NavagrahaLogo variant="auth" priority />
            <span>Return To NAVAGRAHA CENTRE</span>
          </Link>

          <div className="space-y-4">
            <PremiumStatusBadge status="LIVE">{eyebrow}</PremiumStatusBadge>
            <h1
              className="max-w-3xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[color:var(--color-foreground)] sm:text-[length:var(--font-size-display-lg)]"
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

          <Card tone="accent" className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              What this unlocks
            </p>
            <ul className="space-y-3">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="border-b border-[color:var(--color-border)] pb-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)] last:border-b-0 last:pb-0"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="space-y-6 p-7 sm:p-8">
          {children}
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Need a different entry point?{" "}
            <Link
              href={alternateHref}
              className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-foreground)]"
            >
              {alternateLabel}
            </Link>
          </p>
        </Card>
      </Container>
    </PremiumPageShell>
  );
}
