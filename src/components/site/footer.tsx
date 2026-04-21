import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { globalCtaCopy } from "@/modules/localization/copy";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-section-contrast-elevated)_0%,var(--color-section-contrast)_100%)]">
      <Container className="space-y-10 py-[var(--space-12)]">
        <div className="grid gap-6 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.03)] p-6 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-center">
          <div className="space-y-3">
            <Badge tone="trust">NAVAGRAHA CENTRE</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Structured Vedic guidance with chart precision, NAVAGRAHA AI, and expert consultation.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Begin with Kundli generation, continue into compatibility, Rashifal, reports, or astrologer-led consultation.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <Link href="/sign-up" className={buttonStyles({ size: "sm" })}>
              {globalCtaCopy.generateKundli}
            </Link>
            <Link
              href="/kundli-ai"
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              {globalCtaCopy.exploreAi}
            </Link>
            <Link
              href="/consultation"
              className={buttonStyles({ size: "sm", tone: "tertiary" })}
            >
              {globalCtaCopy.bookConsultation}
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
          <div className="space-y-5">
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              {siteConfig.name}
            </h3>
            <p className="max-w-md text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {siteConfig.description}
            </p>
            <p className="text-[0.78rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent-strong)]">
              Joy Prakash Sarmah authority remains visible where relevant.
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Methodology baseline: Vedic sidereal chart context (Lahiri aligned), chart-aware AI interpretation, and optional consultation-led depth.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {siteConfig.footerGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  {group.title}
                </p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-foreground)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-5 text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/sign-in" className="hover:text-[color:var(--color-foreground)]">
              Login
            </Link>
            <Link href="/dashboard" className="hover:text-[color:var(--color-foreground)]">
              Account
            </Link>
            <Link href="/contact" className="hover:text-[color:var(--color-foreground)]">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-[color:var(--color-foreground)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[color:var(--color-foreground)]">
              Terms
            </Link>
            <Link href="/pricing" className="hover:text-[color:var(--color-foreground)]">
              Plans
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
