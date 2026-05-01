import Link from "next/link";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getGlobalCopyBundleForLocale } from "@/modules/localization/copy";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

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
  const copy = await getGlobalCopyBundleForLocale(requestLocale);
  const localizeHref = (href: string) =>
    getLocalizedPath(requestLocale, href, {
      forcePrefix:
        requestLocale !== defaultLocale ||
        hasExplicitLocalePrefix,
    });

  const footerColumns: readonly FooterColumn[] = [
    {
      title: "Core Utilities",
      links: [
        { href: localizeHref("/kundli"), label: copy.navigation.kundli },
        { href: localizeHref("/rashifal"), label: copy.navigation.rashifal },
        { href: localizeHref("/panchang"), label: copy.navigation.panchang },
        { href: localizeHref("/numerology"), label: copy.footer.links.numerology },
        { href: localizeHref("/calculators"), label: copy.navigation.calculators },
        { href: localizeHref("/muhurta"), label: copy.footer.links.muhurtaLite },
        { href: localizeHref("/compatibility"), label: copy.navigation.compatibility },
      ],
    },
    {
      title: "NAVAGRAHA AI",
      links: [
        { href: localizeHref("/ai"), label: copy.navigation.ai },
        { href: localizeHref("/ai"), label: copy.navigation.askMyChart },
        { href: localizeHref("/kundli-ai"), label: "Kundli AI" },
        { href: localizeHref("/numerology"), label: "Numerology AI" },
      ],
    },
    {
      title: copy.footer.columns.services,
      links: [
        { href: localizeHref("/reports"), label: copy.navigation.reports },
        { href: localizeHref("/consultation"), label: copy.navigation.consultation },
        { href: localizeHref("/pricing"), label: copy.navigation.pricing },
        { href: localizeHref("/shop"), label: copy.navigation.shop },
      ],
    },
    {
      title: "Content",
      links: [
        { href: localizeHref("/from-the-desk"), label: "From the Desk" },
        { href: localizeHref("/insights"), label: copy.navigation.insights },
        { href: localizeHref("/daily-rashifal"), label: copy.navigation.dailyRashifal },
        { href: localizeHref("/insights/monthly"), label: "Monthly Forecast" },
        { href: localizeHref("/insights/remedies"), label: "Remedies / Guidance" },
      ],
    },
    {
      title: "Trust / Legal",
      links: [
        { href: localizeHref("/about"), label: copy.footer.links.about },
        { href: localizeHref("/contact"), label: copy.footer.links.contact },
        { href: localizeHref("/privacy"), label: copy.footer.links.privacy },
        { href: localizeHref("/terms"), label: copy.footer.links.terms },
        { href: localizeHref("/refund-cancellation"), label: copy.footer.links.refundPolicy },
        { href: localizeHref("/disclaimer"), label: copy.footer.links.disclaimer },
      ],
    },
  ];

  return (
    <footer
      data-nosnippet
      className="border-t border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-base-0)_0%,var(--color-base-1)_78%,#f6ecd9_100%)]"
    >
      <Container className="space-y-8 py-[var(--space-10)] sm:py-[var(--space-12)]">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_2fr] lg:gap-10">
          <div className="space-y-4">
            <Link
              href={localizeHref("/")}
              className="inline-block font-[family-name:var(--font-display)] text-[1.45rem] text-[var(--color-ink-strong)] transition [transition-duration:var(--motion-duration-base)] hover:text-[var(--color-accent)]"
              style={{ letterSpacing: "0.1em" }}
            >
              {siteConfig.name}
            </Link>
            <p className="max-w-sm text-[length:var(--font-size-body-sm)] leading-relaxed text-[var(--color-ink-body)]">
              Premium Vedic astrology, daily guidance, AI tools, reports, consultation,
              and spiritual products from NAVAGRAHA CENTRE.
            </p>
            <p className="section-label inline-flex rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-3 py-2 text-[var(--color-trust-text)]">
              Guidance-first. No guaranteed outcomes.
            </p>
          </div>

          <div className="grid min-w-0 gap-8 sm:grid-cols-2 xl:grid-cols-5">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <h2 className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {column.title}
                </h2>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="mobile-safe-text inline-block max-w-full text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)] transition [transition-duration:var(--motion-duration-base)] hover:text-[var(--color-ink-strong)]"
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

        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,254,250,0.72)] p-4 shadow-[var(--shadow-sm)]">
          <div className="mb-3 text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
            {copy.footer.languageLabel}
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex min-w-0 flex-col gap-3 border-t border-[color:var(--color-border)] pt-5 text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <Link href={localizeHref("/privacy")} className="mobile-safe-text hover:text-[var(--color-ink-strong)]">
              {copy.footer.links.privacy}
            </Link>
            <Link href={localizeHref("/terms")} className="mobile-safe-text hover:text-[var(--color-ink-strong)]">
              {copy.footer.links.terms}
            </Link>
            <Link href={localizeHref("/disclaimer")} className="mobile-safe-text hover:text-[var(--color-ink-strong)]">
              {copy.footer.links.disclaimer}
            </Link>
            <Link
              href={localizeHref("/refund-cancellation")}
              className="mobile-safe-text hover:text-[var(--color-ink-strong)]"
            >
              {copy.footer.links.refundPolicy}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
