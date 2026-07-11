import Link from "next/link";
import { NavagrahaLogo } from "@/components/brand/navagraha-logo";
import { Container } from "@/components/ui/container";
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
      title: "Platform",
      links: [
        { href: localizeHref("/learn"), label: "Profile" },
        { href: localizeHref("/contact"), label: "Support" },
        { href: localizeHref("/privacy"), label: "Privacy" },
      ],
    },
    {
      title: "Access",
      links: [
        { href: localizeHref("/terms"), label: "Terms" },
        { href: localizeHref("/contact"), label: "Contact" },
        { href: localizeHref("/sign-in"), label: "Account" },
      ],
    },
  ];

  return (
    <footer
      data-nosnippet
      className="border-t border-[rgba(185,139,70,0.32)] bg-white text-[color:var(--color-ink-strong)]"
    >
      <Container className="space-y-3 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-[var(--space-6)] sm:pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:pt-[var(--space-8)] xl:space-y-3 xl:pb-[var(--space-8)]">
        <div className="grid gap-5 rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.24)] bg-white p-5 shadow-[0_10px_24px_rgba(5,5,5,0.045)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] lg:gap-7 lg:p-6">
          <div className="space-y-4">
            <Link
              href={localizeHref("/")}
              className="inline-flex max-w-full items-center gap-3 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
            >
              <NavagrahaLogo variant="footer-light" />
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
              Calculation-first Vedic Astrology &bull; Astronomical data &bull;
              Panchang mathematics &bull; Acharya guidance
            </p>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:gap-5">
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className="rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.2)] bg-white p-4 shadow-[0_8px_18px_rgba(5,5,5,0.035)]"
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

        <div className="flex min-w-0 flex-col gap-2 rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.22)] bg-white px-4 py-3 text-[0.72rem] font-semibold tracking-[0.04em] text-[color:var(--color-text-primary)] shadow-[0_8px_18px_rgba(5,5,5,0.035)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p>
            &copy; {new Date().getFullYear()}
          </p>
          <p className="max-w-full leading-5 text-[color:var(--color-antique-gold-dark)] sm:text-right">
            Since 1950 Legacy &bull; 12-Planet Calculations &bull; 28
            Nakshatras &bull; Guidance-first
          </p>
        </div>
      </Container>
    </footer>
  );
}
