import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles, type ButtonTone } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type {
  AnalyticsEventPayload,
  TrackedEventName,
} from "@/lib/analytics/types";

type HeroAction = {
  href: string;
  label: string;
  tone?: ButtonTone;
  eventName?: TrackedEventName;
  eventPayload?: AnalyticsEventPayload;
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
    <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-base-0)_0%,var(--color-base-1)_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(205,176,124,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(192,145,114,0.1),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_100%)]" />
      <Container className="relative grid gap-10 py-[var(--space-14)] sm:py-[var(--space-16)] lg:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)] lg:items-start">
        <div className="space-y-7">
          <Badge tone="accent">{eyebrow}</Badge>

          <div className="space-y-5">
            <h1
              className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-lg)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-xl)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              {title}
            </h1>
            <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {description}
            </p>
          </div>

          {primaryAction || secondaryAction ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {primaryAction ? (
                primaryAction.eventName ? (
                  <TrackedLink
                    href={primaryAction.href}
                    eventName={primaryAction.eventName}
                    eventPayload={primaryAction.eventPayload}
                    className={buttonStyles({
                      tone: primaryAction.tone ?? "accent",
                      size: "lg",
                      className: "w-full justify-center sm:w-auto",
                    })}
                  >
                    {primaryAction.label}
                  </TrackedLink>
                ) : (
                  <Link
                    href={primaryAction.href}
                    className={buttonStyles({
                      tone: primaryAction.tone ?? "accent",
                      size: "lg",
                      className: "w-full justify-center sm:w-auto",
                    })}
                  >
                    {primaryAction.label}
                  </Link>
                )
              ) : null}

              {secondaryAction ? (
                secondaryAction.eventName ? (
                  <TrackedLink
                    href={secondaryAction.href}
                    eventName={secondaryAction.eventName}
                    eventPayload={secondaryAction.eventPayload}
                    className={buttonStyles({
                      tone: secondaryAction.tone ?? "secondary",
                      size: "lg",
                      className: "w-full justify-center sm:w-auto",
                    })}
                  >
                    {secondaryAction.label}
                  </TrackedLink>
                ) : (
                  <Link
                    href={secondaryAction.href}
                    className={buttonStyles({
                      tone: secondaryAction.tone ?? "secondary",
                      size: "lg",
                      className: "w-full justify-center sm:w-auto",
                    })}
                  >
                    {secondaryAction.label}
                  </Link>
                )
              ) : null}
            </div>
          ) : null}

          {note ? (
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-muted)]">
              {note}
            </p>
          ) : null}
        </div>

        <Card tone="accent" className="flex flex-col gap-6 p-6 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-[minmax(120px,0.6fr)_minmax(0,1fr)] sm:items-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(185,139,70,0.34)] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98)_0%,rgba(248,236,214,0.9)_54%,rgba(228,200,149,0.36)_100%)] shadow-[0_14px_34px_rgba(104,78,35,0.16)]">
              <div className="relative h-20 w-20 rounded-full border border-[rgba(185,139,70,0.4)]">
                <span className="absolute left-1/2 top-1/2 h-0.5 w-16 -translate-x-1/2 -translate-y-1/2 bg-[rgba(185,139,70,0.24)]" />
                <span className="absolute left-1/2 top-1/2 h-0.5 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[rgba(185,139,70,0.22)]" />
                <span className="absolute left-1/2 top-1/2 h-0.5 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[rgba(185,139,70,0.22)]" />
                <span className="absolute left-1/2 top-1/2 h-16 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-[rgba(185,139,70,0.2)]" />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.82)] px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)]">
                Kundli Snapshot
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.82)] px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)]">
                Astrology Wheel
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.82)] px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)]">
                AI Context Layer
              </div>
            </div>
          </div>
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
        </Card>
      </Container>
    </section>
  );
}
