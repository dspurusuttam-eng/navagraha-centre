import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function Footer() {
  const footerColumns = [
    {
      title: "Centre",
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/joy-prakash-sarmah", label: "Astrologer" },
      ],
    },
    {
      title: "Tools",
      links: [
        { href: "/kundli", label: "Kundli" },
        { href: "/rashifal", label: "Rashifal" },
        { href: "/compatibility", label: "Compatibility" },
      ],
    },
    {
      title: "Services",
      links: [
        { href: "/reports", label: "Reports" },
        { href: "/consultation", label: "Consultation" },
        { href: "/shop", label: "Shop" },
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-base-0)_0%,var(--color-base-1)_100%)]">
      <Container className="space-y-8 py-[var(--space-10)] sm:py-[var(--space-12)]">
        <div className="grid gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h2 className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                {column.title}
              </h2>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)] transition [transition-duration:var(--motion-duration-base)] hover:text-[var(--color-ink-strong)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-5 text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--color-ink-strong)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-ink-strong)]">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
