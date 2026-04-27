import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AuthorAuthorityBlockProps = {
  consultationHref: string;
};

export function AuthorAuthorityBlock({
  consultationHref,
}: Readonly<AuthorAuthorityBlockProps>) {
  return (
    <Card tone="accent" className="space-y-4">
      <Badge tone="accent">From the Desk of J P Sarmah</Badge>
      <div className="space-y-2">
        <h2
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          J P Sarmah
        </h2>
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)]">
          Vedic Astrologer and Spiritual Guide - NAVAGRAHA CENTRE
        </p>
      </div>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        Guidance is grounded in chart-first Vedic interpretation, calm human review, and
        practical spiritual direction without exaggerated guarantees.
      </p>
      <Link
        href={consultationHref}
        className={buttonStyles({ tone: "secondary", size: "sm" })}
      >
        Book Consultation With J P Sarmah
      </Link>
    </Card>
  );
}
