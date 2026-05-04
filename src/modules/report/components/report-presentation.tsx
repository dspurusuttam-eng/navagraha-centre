import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ReportPresentationBlock } from "@/modules/report/report-presentation-types";

export function ReportPresentationSurface({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("report-print-surface", className)}>{children}</div>
  );
}

export function ReportPresentationCover({
  eyebrow,
  title,
  summary,
  lead,
  badges,
}: Readonly<{
  eyebrow: string;
  title: string;
  summary: string;
  lead: string;
  badges: Array<{ label: string; value: string }>;
}>) {
  return (
    <Card tone="accent" className="report-print-card report-print-avoid-break space-y-6">
      <div className="space-y-2">
        <p className="section-label text-[color:var(--color-accent)]">{eyebrow}</p>
        <h2 className="card-heading mobile-safe-text text-[length:var(--font-size-title-lg)]">
          {title}
        </h2>
        <p className="meta-text mobile-safe-text text-[length:var(--font-size-body-lg)]">
          {summary}
        </p>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-4 py-4">
        <p className="section-label text-[color:var(--color-accent)]">Chart Orientation</p>
        <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
          {lead}
        </p>
      </div>

      <div className="mobile-safe-cluster">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className="rounded-full border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]"
          >
            <span className="text-[color:var(--color-accent)]">{badge.label}:</span>{" "}
            {badge.value}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ReportPresentationMetaGrid({
  items,
}: Readonly<{
  items: Array<{ label: string; value: string }>;
}>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="report-print-card report-print-avoid-break space-y-1 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
        >
          <p className="section-label text-[color:var(--color-accent)]">{item.label}</p>
          <p className="meta-text text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ReportPresentationBlockCard({
  block,
}: Readonly<{
  block: ReportPresentationBlock;
}>) {
  return (
    <Card className={block.className} tone={block.locked ? "muted" : "default"}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="section-label text-[color:var(--color-accent)]">{block.title}</p>
        {block.locked ? <Badge tone="outline">Locked Preview</Badge> : null}
        {block.premiumOnly ? <Badge tone="neutral">Premium</Badge> : null}
      </div>
      <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
        {block.content}
      </p>
      {block.locked && block.previewTeaser ? (
        <p className="mt-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {block.previewTeaser}
        </p>
      ) : null}
      {block.lockedMessage ? (
        <p className="mt-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {block.lockedMessage}
        </p>
      ) : null}
      {block.locked && block.softCtaHref && block.softCtaLabel ? (
        <div className="report-no-print">
          <Link
            href={block.softCtaHref}
            className="mt-3 inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-foreground)] transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)]"
          >
            {block.softCtaLabel}
          </Link>
        </div>
      ) : null}
    </Card>
  );
}

export function ReportPresentationCtaBlock({
  title,
  message,
  cta,
}: Readonly<{
  title: string;
  message: string;
  cta: ReactNode;
}>) {
  return (
    <Card className="report-print-card report-print-avoid-break space-y-4">
      <p className="section-label text-[color:var(--color-accent)]">{title}</p>
      <p className="meta-text text-[length:var(--font-size-body-sm)]">{message}</p>
      <div className="flex flex-wrap gap-3">{cta}</div>
    </Card>
  );
}
