import Link from "next/link";
import { NavagrahaLogo } from "@/components/brand/navagraha-logo";
import { Container } from "@/components/ui/container";
import { featureStatusRegistry } from "@/config/feature-status-registry";
import { defaultLocale } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { getLocalizedRoutePath } from "@/modules/localization/routes";
// C8E: footer details are Admin-managed (controlled static fallback until published).
import { getPublicBrandSettings } from "@/modules/site-settings/public-settings";

type FooterLink = {
  href: string;
  label: string;
};

function getFeatureRoute(featureKey: string) {
  return (
    featureStatusRegistry.find((feature) => feature.featureKey === featureKey)
      ?.route ?? "/"
  );
}

export async function Footer() {
  const brand = await getPublicBrandSettings();
  const requestLocale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedRoutePath(requestLocale, href, {
      forcePrefix: hasExplicitLocalePrefix || requestLocale !== defaultLocale,
    });

  // FINAL LOCKED public footer set. Exactly five crawlable links.
  // Copyright and disclaimer protections live inside Terms; Refund stays hidden until paid
  // consultation is activated, so neither has a footer link.
  const footerLinks: readonly FooterLink[] = [
    { href: localizeHref("/support"), label: "Support" },
    { href: localizeHref("/contact"), label: "Contact" },
    { href: localizeHref("/privacy"), label: "Privacy" },
    { href: localizeHref("/terms"), label: "Terms" },
    { href: localizeHref("/methodology"), label: "Method" },
  ];

  const homeHref = localizeHref(getFeatureRoute("home"));

  return (
    <footer
      data-nosnippet
      className="border-t border-[rgba(185,139,70,0.32)] bg-white text-[color:var(--color-ink-strong)]"
    >
      {/* Single source of mobile-dock clearance; --space-7 does not exist in the token
          scale, so desktop uses the defined --space-8 (2rem) instead of collapsing to 0. */}
      <Container className="space-y-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[var(--space-5)] sm:pt-[var(--space-6)] xl:space-y-3 xl:pb-[var(--space-8)]">
        <div className="grid gap-4 rounded-[var(--radius-card)] border border-[rgba(185,139,70,0.24)] bg-white p-4 shadow-[0_8px_20px_rgba(5,5,5,0.04)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start lg:gap-6 lg:p-5">
          <div>
            <Link
              href={homeHref}
              className="inline-flex max-w-full items-center gap-3 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
            >
              <NavagrahaLogo variant="footer-light" />
              <span className="block min-w-0 whitespace-nowrap">
                <span className="block text-[1rem] font-semibold uppercase leading-none tracking-[0.18em] text-[#050505] sm:text-[1.08rem] lg:text-[1.12rem]">
                  NAVAGRAHA CENTRE
                </span>
              </span>
            </Link>
          </div>

          <nav aria-label="Footer" className="min-w-0">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="mobile-safe-text inline-flex min-h-11 items-center rounded-sm text-[length:var(--font-size-body-sm)] font-medium text-[color:var(--color-text-primary)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-accent-gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.22)] bg-white px-4 py-3 text-[0.72rem] font-semibold tracking-[0.04em] text-[color:var(--color-text-primary)] shadow-[0_6px_14px_rgba(5,5,5,0.03)]">
          {/* Exact locked copyright line. */}
          <p>&copy; 2026 NAVAGRAHA CENTRE. All rights reserved.</p>
          {brand.footer.addressLine ? (
            <p className="mt-1 font-medium text-[color:var(--color-text-secondary)]">
              {brand.footer.addressLine}
            </p>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
