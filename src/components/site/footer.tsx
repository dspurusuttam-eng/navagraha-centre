import Link from "next/link";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { globalFooterCopy, globalNavigationCopy } from "@/modules/localization/copy";

export function Footer() {
  const footerColumns = [
    {
      title: globalFooterCopy.columns.centre,
      links: [
        { href: "/about", label: globalFooterCopy.links.about },
        { href: "/contact", label: globalFooterCopy.links.contact },
        { href: "/joy-prakash-sarmah", label: globalFooterCopy.links.astrologer },
      ],
    },
    {
      title: globalFooterCopy.columns.tools,
      links: [
        { href: "/tools", label: globalFooterCopy.links.allTools },
        { href: "/kundli", label: globalNavigationCopy.kundli },
        { href: "/rashifal", label: globalNavigationCopy.rashifal },
        { href: "/compatibility", label: globalNavigationCopy.compatibility },
        { href: "/numerology", label: globalFooterCopy.links.numerology },
        { href: "/calculators", label: globalNavigationCopy.calculators },
        { href: "/muhurta", label: globalFooterCopy.links.muhurtaLite },
      ],
    },
    {
      title: globalFooterCopy.columns.services,
      links: [
        { href: "/reports", label: globalNavigationCopy.reports },
        { href: "/consultation", label: globalNavigationCopy.consultation },
        { href: "/shop", label: globalNavigationCopy.shop },
      ],
    },
  ] as const;

  return (
    <footer
      data-nosnippet
      className="border-t border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-base-0)_0%,var(--color-base-1)_78%,#f6ecd9_100%)]"
    >
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

        <LanguageSwitcher />

        <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-5 text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--color-ink-strong)]">
              {globalFooterCopy.links.privacy}
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-ink-strong)]">
              {globalFooterCopy.links.terms}
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--color-ink-strong)]">
              {globalFooterCopy.links.disclaimer}
            </Link>
            <Link
              href="/refund-cancellation"
              className="hover:text-[var(--color-ink-strong)]"
            >
              {globalFooterCopy.links.refundPolicy}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
