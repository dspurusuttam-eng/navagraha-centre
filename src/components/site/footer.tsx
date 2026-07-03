import Link from "next/link";
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
      forcePrefix: hasExplicitLocalePrefix || requestLocale !== defaultLocale,
    });

  const footerColumns: readonly FooterColumn[] = [
    {
      title: "Guidance",
      links: [
        { href: localizeHref("/kundli"), label: "Generate Kundli" },
        { href: localizeHref("/ai"), label: "Ask NI" },
        { href: localizeHref("/consultation"), label: "Consult Acharya" },
      ],
    },
    {
      title: "Explore",
      links: [
        { href: localizeHref("/learn"), label: "Learn" },
        { href: localizeHref("/shop"), label: "Vedic Shop" },
      ],
    },
    {
      title: "Secondary",
      links: [
        { href: localizeHref("/panchang"), label: "Panchang" },
        { href: localizeHref("/rashifal"), label: "Rashifal" },
        { href: localizeHref("/reports"), label: "Reports" },
        { href: localizeHref("/tools"), label: "Tools" },
      ],
    },
    {
      title: "Platform / Support",
      links: [
        { href: localizeHref("/contact"), label: "Contact" },
        { href: localizeHref("/privacy"), label: "Privacy" },
        { href: localizeHref("/terms"), label: "Terms" },
        { href: localizeHref("/sign-in"), label: "Account" },
      ],
    },
  ];

  return (
    <footer
      data-nosnippet
      className="border-t border-[rgba(185,139,70,0.32)] bg-white text-[color:var(--color-ink-strong)]"
    >
      <Container className="space-y-5 pb-[calc(var(--space-8)+6rem)] pt-[var(--space-8)] sm:pb-[calc(var(--space-10)+6rem)] sm:pt-[var(--space-10)] xl:space-y-6 xl:pb-[var(--space-10)]">
        <div className="grid gap-7 rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.26)] bg-white p-5 shadow-[0_12px_30px_rgba(5,5,5,0.05)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-9 lg:p-6 xl:p-7">
          <div className="space-y-4">
            <Link
              href={localizeHref("/")}
              className="inline-block transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
            >
              <span className="block min-w-0 whitespace-nowrap">
                <span className="block text-[1rem] font-semibold uppercase leading-none tracking-[0.18em] text-[#050505] sm:text-[1.08rem] lg:text-[1.12rem]">
                  NAVAGRAHA CENTRE
                </span>
                <span className="mt-1 block text-[0.46rem] font-semibold uppercase leading-none tracking-[0.3em] text-[var(--color-antique-gold-dark)] sm:text-[0.49rem] lg:text-[0.5rem]">
                  Vedic astrology guidance platform
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-[length:var(--font-size-body-sm)] leading-relaxed text-[color:var(--color-text-secondary)]">
              Generate a Janam Kundli, understand the result with Ask NI, and
              continue to human consultation when needed.
            </p>
            <p className="inline-flex rounded-full border border-[rgba(185,139,70,0.36)] bg-white px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-antique-gold-dark)] shadow-[0_8px_20px_rgba(185,139,70,0.08)]">
              Guidance-first. No guaranteed outcomes.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className="rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.2)] bg-white p-4 xl:p-5"
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

        <div className="flex min-w-0 flex-col gap-3 border-t border-[rgba(185,139,70,0.28)] pt-5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-text-primary)] sm:flex-row sm:items-center sm:justify-between xl:pt-6">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
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
              Account
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
