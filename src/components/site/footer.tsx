import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[rgba(7,6,5,0.86)]">
      <Container className="grid gap-10 py-[var(--space-12)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.75fr)]">
        <div className="space-y-5">
          <Badge tone="neutral">NAVAGRAHA CENTRE</Badge>
          <div className="space-y-3">
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
          </div>
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
      </Container>
    </footer>
  );
}
