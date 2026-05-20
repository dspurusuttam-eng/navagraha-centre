import Link from "next/link";
import { NavagrahaLogo } from "@/components/brand/navagraha-logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { defaultLocale } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { getLocalizedRoutePath } from "@/modules/localization/routes";

type FooterLink = {
  href: string;
  label: string;
};

type FooterColumn = {
  title: string;
  links: readonly FooterLink[];
};

export async function Footer() {
  const requestLocale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedRoutePath(requestLocale, href, {
      forcePrefix:
        hasExplicitLocalePrefix || requestLocale !== defaultLocale,
    });

  const footerColumns: readonly FooterColumn[] = [
    {
      title: "Guidance",
      links: [
        { href: localizeHref("/kundli"), label: "Kundli" },
        { href: localizeHref("/rashifal"), label: "Rashifal" },
        { href: localizeHref("/panchang"), label: "Panchang" },
        { href: localizeHref("/ai"), label: "Ask NI" },
        { href: localizeHref("/dasha"), label: "Dasha" },
        { href: localizeHref("/transit"), label: "Transit" },
        { href: localizeHref("/muhurat"), label: "Muhurat" },
      ],
    },
    {
      title: "Services",
      links: [
        { href: localizeHref("/reports"), label: "Reports" },
        { href: localizeHref("/reports"), label: "Handmade Kundli / Reports" },
        { href: localizeHref("/consultation"), label: "Consultation" },
        { href: localizeHref("/shop"), label: "Shop" },
      ],
    },
    {
      title: "Learn",
      links: [
        { href: localizeHref("/articles"), label: "Articles" },
        { href: localizeHref("/from-the-desk"), label: "J P Sarmah Desk" },
        { href: localizeHref("/tools"), label: "Tools" },
      ],
    },
    {
      title: "Company / Support",
      links: [
        { href: localizeHref("/contact"), label: "Contact" },
        { href: localizeHref("/privacy"), label: "Privacy" },
        { href: localizeHref("/terms"), label: "Terms" },
        { href: localizeHref("/sign-in"), label: "Sign in" },
      ],
    },
  ];

  return (
    <footer
      data-nosnippet
      className="border-t border-[rgba(185,139,70,0.34)] bg-white text-[color:var(--color-ink-strong)]"
    >
      <Container className="space-y-7 py-[var(--space-8)] sm:py-[var(--space-10)]">
        <div className="grid gap-7 rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.28)] bg-white p-5 shadow-[0_14px_34px_rgba(5,5,5,0.06)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.55fr)] lg:gap-8 sm:p-6">
          <div className="space-y-4">
            <Link
              href={localizeHref("/")}
              className="inline-block transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
            >
              <NavagrahaLogo variant="footer-light" className="w-[10.5rem] sm:w-[12rem]" />
            </Link>
            <p className="max-w-sm text-[length:var(--font-size-body-sm)] leading-relaxed text-[color:var(--color-text-secondary)]">
              Premium Vedic astrology, NAVAGRAHA Intelligence, reports,
              consultation, and verified public guidance routes from NAVAGRAHA
              CENTRE.
            </p>
            <p className="inline-flex rounded-full border border-[rgba(185,139,70,0.36)] bg-white px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-antique-gold-dark)] shadow-[0_8px_20px_rgba(185,139,70,0.08)]">
              Guidance-first. No guaranteed outcomes.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className="rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.22)] bg-white p-4"
              >
                <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-gold-dark)]">
                  {column.title}
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="mobile-safe-text inline-block max-w-full text-[length:var(--font-size-body-sm)] font-medium text-[color:var(--color-text-primary)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-accent-gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
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

        <div className="rounded-[var(--radius-xl)] border border-[rgba(185,139,70,0.24)] bg-white p-4 shadow-[0_14px_34px_rgba(5,5,5,0.05)]">
          <div className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-antique-gold-dark)]">
            Language
          </div>
          <LanguageSwitcher variant="compact" />
        </div>

        <div className="flex min-w-0 flex-col gap-3 border-t border-[rgba(185,139,70,0.28)] pt-5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-text-primary)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <Link
              href={localizeHref("/privacy")}
              className="mobile-safe-text hover:text-[color:var(--color-accent-gold-dark)]"
            >
              Privacy
            </Link>
            <Link
              href={localizeHref("/terms")}
              className="mobile-safe-text hover:text-[color:var(--color-accent-gold-dark)]"
            >
              Terms
            </Link>
            <Link
              href={localizeHref("/contact")}
              className="mobile-safe-text hover:text-[color:var(--color-accent-gold-dark)]"
            >
              Contact
            </Link>
            <Link
              href={localizeHref("/sign-in")}
              className="mobile-safe-text hover:text-[color:var(--color-accent-gold-dark)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
