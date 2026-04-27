import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getGlobalCopyBundleForLocale } from "@/modules/localization/copy";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function Header() {
  const requestLocale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const copy = await getGlobalCopyBundleForLocale(requestLocale);

  const localizeHref = (href: string) =>
    getLocalizedPath(requestLocale, href, {
      forcePrefix:
        requestLocale !== defaultLocale ||
        hasExplicitLocalePrefix,
    });

  const primaryNavigation = [
    { href: localizeHref("/kundli"), label: copy.navigation.kundli },
    { href: localizeHref("/compatibility"), label: copy.navigation.compatibility },
    { href: localizeHref("/rashifal"), label: copy.navigation.rashifal },
    { href: localizeHref("/ai"), label: copy.navigation.ai },
    { href: localizeHref("/reports"), label: copy.navigation.reports },
  ] as const;

  const secondaryNavigation = [
    { href: localizeHref("/tools"), label: copy.navigation.tools },
    { href: localizeHref("/consultation"), label: copy.navigation.consultation },
    { href: localizeHref("/shop"), label: copy.navigation.shop },
    { href: localizeHref("/from-the-desk"), label: copy.navigation.insights },
    { href: localizeHref("/calculators"), label: copy.navigation.calculators },
    { href: localizeHref("/muhurta"), label: copy.navigation.timeTools },
    { href: localizeHref("/pricing"), label: copy.navigation.pricing },
  ] as const;

  return (
    <header
      data-nosnippet
      className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(255,254,250,0.95)] shadow-[0_8px_24px_rgba(96,74,45,0.08)] backdrop-blur-xl"
    >
      <Container className="py-3">
        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href={localizeHref("/")}
            className="shrink-0 font-[family-name:var(--font-display)] text-[1.55rem] text-[var(--color-ink-strong)] transition [transition-duration:var(--motion-duration-base)] hover:text-[var(--color-accent)]"
            style={{ letterSpacing: "0.1em" }}
          >
            {siteConfig.name}
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-1 items-center justify-center gap-1"
          >
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={buttonStyles({
                  tone: "ghost",
                  size: "sm",
                  className: "min-h-11 px-4 text-[0.69rem]",
                })}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <Link
              href={localizeHref("/dashboard")}
              className={buttonStyles({ tone: "tertiary", size: "sm" })}
            >
              {copy.navigation.account}
            </Link>
            <TrackedLink
              href={localizeHref("/kundli")}
              eventName="cta_click"
              eventPayload={{ page: "global-header", feature: "header-generate-kundli" }}
              className={buttonStyles({ size: "sm" })}
            >
              {copy.cta.generateKundli}
            </TrackedLink>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href={localizeHref("/")}
            className="mr-auto font-[family-name:var(--font-display)] text-[1.2rem] text-[var(--color-ink-strong)]"
            style={{ letterSpacing: "0.08em" }}
          >
            NAVAGRAHA
          </Link>

          <TrackedLink
            href={localizeHref("/kundli")}
            eventName="cta_click"
            eventPayload={{ page: "global-header-mobile", feature: "header-generate-kundli" }}
            className={buttonStyles({ size: "sm" })}
          >
            <span className="sm:hidden">Kundli</span>
            <span className="hidden sm:inline">Generate Kundli</span>
          </TrackedLink>

          <details className="group relative">
            <summary
              className={buttonStyles({
                tone: "tertiary",
                size: "sm",
                className: "cursor-pointer list-none px-4 marker:content-none",
              })}
            >
              {copy.navigation.menu}
            </summary>
            <div className="absolute top-[calc(100%+0.6rem)] w-[min(90vw,22rem)] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,254,250,0.98)] p-3 shadow-[var(--shadow-md)] [inset-inline-end:0]">
              <nav aria-label="Mobile navigation" className="grid gap-2">
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={buttonStyles({
                      tone: "ghost",
                      size: "sm",
                      className: "w-full justify-start",
                    })}
                  >
                    {item.label}
                  </Link>
                ))}
                {secondaryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={buttonStyles({
                      tone: "tertiary",
                      size: "sm",
                      className: "w-full justify-start",
                    })}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-1 border-t border-[color:var(--color-border)] pt-3">
                  <LanguageSwitcher variant="compact" />
                </div>
                <div className="mt-1 grid gap-2 border-t border-[color:var(--color-border)] pt-3">
                  <Link
                    href={localizeHref("/dashboard")}
                    className={buttonStyles({
                      tone: "tertiary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    {copy.navigation.account}
                  </Link>
                  <TrackedLink
                    href={localizeHref("/kundli-ai")}
                    eventName="cta_click"
                    eventPayload={{ page: "global-header-mobile", feature: "header-try-ai" }}
                    className={buttonStyles({
                      tone: "secondary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    {copy.cta.exploreAi}
                  </TrackedLink>
                  <TrackedLink
                    href={localizeHref("/reports")}
                    eventName="cta_click"
                    eventPayload={{ page: "global-header-mobile", feature: "header-get-report" }}
                    className={buttonStyles({
                      tone: "secondary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    {copy.cta.unlockFullReport}
                  </TrackedLink>
                </div>
              </nav>
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
