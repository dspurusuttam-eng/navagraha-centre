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

  const footerColumns = [
    {
      title: copy.footer.columns.centre,
      links: [
        { href: localizeHref("/about"), label: copy.footer.links.about },
        { href: localizeHref("/contact"), label: copy.footer.links.contact },
        { href: localizeHref("/from-the-desk"), label: copy.navigation.insights },
        { href: localizeHref("/joy-prakash-sarmah"), label: copy.footer.links.astrologer },
      ],
    },
    {
      title: copy.footer.columns.tools,
      links: [
        { href: localizeHref("/tools"), label: copy.footer.links.allTools },
        { href: localizeHref("/kundli"), label: copy.navigation.kundli },
        { href: localizeHref("/rashifal"), label: copy.navigation.rashifal },
        { href: localizeHref("/compatibility"), label: copy.navigation.compatibility },
        { href: localizeHref("/numerology"), label: copy.footer.links.numerology },
        { href: localizeHref("/calculators"), label: copy.navigation.calculators },
        { href: localizeHref("/muhurta"), label: copy.footer.links.muhurtaLite },
      ],
    },
    {
      title: copy.footer.columns.services,
      links: [
        { href: localizeHref("/reports"), label: copy.navigation.reports },
        { href: localizeHref("/consultation"), label: copy.navigation.consultation },
        { href: localizeHref("/shop"), label: copy.navigation.shop },
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
            <Link href={localizeHref("/privacy")} className="hover:text-[var(--color-ink-strong)]">
              {copy.footer.links.privacy}
            </Link>
            <Link href={localizeHref("/terms")} className="hover:text-[var(--color-ink-strong)]">
              {copy.footer.links.terms}
            </Link>
            <Link href={localizeHref("/disclaimer")} className="hover:text-[var(--color-ink-strong)]">
              {copy.footer.links.disclaimer}
            </Link>
            <Link
              href={localizeHref("/refund-cancellation")}
              className="hover:text-[var(--color-ink-strong)]"
            >
              {copy.footer.links.refundPolicy}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
