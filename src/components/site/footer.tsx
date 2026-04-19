import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[rgba(7,6,5,0.9)]">
      <Container className="space-y-10 py-[var(--space-12)]">
        <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge tone="neutral">NAVAGRAHA CENTRE</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Generate your chart foundation first, then continue into
              consultation, reports, and AI guidance.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className={buttonStyles({ size: "sm" })}>
              Generate Kundli
            </Link>
            <Link
              href="/consultation"
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              Book Consultation
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          <div className="space-y-5">
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              NAVAGRAHA CENTRE
            </h2>
            <p className="max-w-md text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {siteConfig.description}
            </p>
            <p className="text-[0.78rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Joy Prakash Sarmah authority remains visible where relevant.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {siteConfig.footerGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <p className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
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
            <Link href="/pricing" className="hover:text-[color:var(--color-foreground)]">
              Pricing
            </Link>
            <Link href="/insights" className="hover:text-[color:var(--color-foreground)]">
              Insights
            </Link>
            <Link href="/shop" className="hover:text-[color:var(--color-foreground)]">
              Shop
            </Link>
            <Link href="/kundli-ai" className="hover:text-[color:var(--color-foreground)]">
              NAVAGRAHA AI
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
