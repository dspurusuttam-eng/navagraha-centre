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

type FooterLink = {
  href: string;
  label: string;
};

type FooterColumn = {
  title: string;
  links: readonly FooterLink[];
};

function getFeatureRoute(featureKey: string) {
  return (
    featureStatusRegistry.find((feature) => feature.featureKey === featureKey)
      ?.route ?? "/"
  );
}

function buildFooterLink({
  featureKey,
  label,
  localizeHref,
}: {
  featureKey: string;
  label?: string;
  localizeHref: (href: string) => string;
}): FooterLink | null {
  const feature = featureStatusRegistry.find(
    (entry) => entry.featureKey === featureKey
  );

  if (!feature || feature.visibility !== "LIVE" || !feature.runtimeEnabled) {
    return null;
  }

  return {
    href: localizeHref(feature.route),
    label: label ?? feature.label,
  };
}

export async function Footer() {
  const requestLocale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedRoutePath(requestLocale, href, {
      forcePrefix: hasExplicitLocalePrefix || requestLocale !== defaultLocale,
    });

  const guidanceLinks = [
    buildFooterLink({ featureKey: "desk", localizeHref }),
    buildFooterLink({ featureKey: "consult", localizeHref }),
    buildFooterLink({ featureKey: "acharya", localizeHref }),
    buildFooterLink({ featureKey: "learn", localizeHref }),
  ].filter((link): link is FooterLink => Boolean(link));

  const supportLinks = [
    buildFooterLink({ featureKey: "support", localizeHref }),
    buildFooterLink({ featureKey: "contact", localizeHref }),
    buildFooterLink({ featureKey: "privacy", localizeHref }),
    buildFooterLink({ featureKey: "terms", localizeHref }),
    buildFooterLink({ featureKey: "disclaimer", localizeHref }),
    buildFooterLink({ featureKey: "methodology", localizeHref }),
    buildFooterLink({
      featureKey: "refund-cancellation",
      label: "Refund",
      localizeHref,
    }),
  ].filter((link): link is FooterLink => Boolean(link));

  const footerColumns: readonly FooterColumn[] = [
    {
      title: "Guidance",
      links: guidanceLinks,
    },
    {
      title: "Support",
      links: supportLinks,
    },
  ];
  const homeHref = localizeHref(getFeatureRoute("home"));

  return (
    <footer
      data-nosnippet
      className="border-t border-[rgba(185,139,70,0.32)] bg-white text-[color:var(--color-ink-strong)]"
    >
      <Container className="space-y-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[var(--space-5)] sm:pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pt-[var(--space-6)] xl:space-y-3 xl:pb-[var(--space-7)]">
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

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:gap-4">
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className="rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.18)] bg-white p-3 shadow-[0_6px_14px_rgba(5,5,5,0.03)]"
              >
                <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-gold-dark)]">
                  {column.title}
                </h2>
                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="mobile-safe-text inline-flex min-h-11 min-w-11 max-w-full items-center rounded-sm text-[length:var(--font-size-body-sm)] font-medium text-[color:var(--color-text-primary)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-accent-gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
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

        <div className="rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.22)] bg-white px-4 py-3 text-[0.72rem] font-semibold tracking-[0.04em] text-[color:var(--color-text-primary)] shadow-[0_6px_14px_rgba(5,5,5,0.03)]">
          <p>
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </Container>
    </footer>
  );
}
