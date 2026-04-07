import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-[var(--space-16)]">
      <Card tone="accent" className="space-y-5">
        <div className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Not Found
          </p>
          <h1
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            This page is not part of the current NAVAGRAHA CENTRE path.
          </h1>
          <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            The requested route does not exist or is not available on the
            public website.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonStyles({ size: "sm" })}>
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Open Dashboard
          </Link>
        </div>
      </Card>
    </Container>
  );
}
