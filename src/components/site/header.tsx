import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NavagrahaLogo } from "@/components/brand/navagraha-logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { NavigationLink } from "@/components/site/navigation-link";
import { ToolsMegaMenu } from "@/components/site/tools-mega-menu";
import { buildLocalizedToolsNavigation } from "@/components/site/tools-navigation-data";
import { Container } from "@/components/ui/container";
import { defaultLocale } from "@/modules/localization/config";
import { getGlobalCopyBundleForLocale } from "@/modules/localization/copy";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { getLocalizedRoutePath } from "@/modules/localization/routes";

type NavigationItem = {
  href: string;
  label: string;
};

const topTrustItems = [
  "Since 1950 Legacy",
  "12-Planet Calculations",
  "Privacy-Safe Guidance",
] as const;

export async function Header() {
  const requestLocale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const copy = await getGlobalCopyBundleForLocale(requestLocale);

  const localizeHref = (href: string) =>
    getLocalizedRoutePath(requestLocale, href, {
      forcePrefix:
        hasExplicitLocalePrefix || requestLocale !== defaultLocale,
    });

  const desktopNavigationPrimary: readonly NavigationItem[] = [
    { href: localizeHref("/"), label: "Home" },
    { href: localizeHref("/kundli"), label: "Kundli" },
    { href: localizeHref("/rashifal"), label: "Daily Guidance" },
    { href: localizeHref("/tools"), label: "Tools" },
    { href: localizeHref("/reports"), label: "Reports" },
    { href: localizeHref("/consultation"), label: "Consultation" },
    { href: localizeHref("/articles"), label: "Learn" },
    { href: localizeHref("/sign-in"), label: "Account" },
  ] as const;

  const toolsNavigation = buildLocalizedToolsNavigation(localizeHref);

  const mobileMenuItems: readonly NavigationItem[] = [
    { href: localizeHref("/"), label: "Home" },
    { href: localizeHref("/kundli"), label: "Kundli" },
    { href: localizeHref("/rashifal"), label: "Daily Guidance" },
    { href: localizeHref("/tools"), label: "Tools" },
    { href: localizeHref("/reports"), label: "Reports" },
    { href: localizeHref("/consultation"), label: "Consultation" },
    { href: localizeHref("/articles"), label: "Learn" },
    { href: localizeHref("/sign-in"), label: "Account" },
  ] as const;

  return (
    <header
      data-nosnippet
      className="sticky top-0 z-50 border-b border-[rgba(5,5,5,0.16)] bg-white/95 shadow-[0_8px_24px_rgba(5,5,5,0.06)] backdrop-blur-xl"
    >
      <div className="hidden border-b border-[rgba(185,139,70,0.28)] bg-white xl:block">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {topTrustItems.map((item) => (
              <span
                key={item}
                className="inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[rgba(185,139,70,0.28)] bg-white px-2.5 py-1 text-[0.62rem] tracking-[0.04em] text-[var(--color-ink-strong)] shadow-[0_4px_12px_rgba(5,5,5,0.04)]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-gold)] shadow-[0_0_0_3px_rgba(185,139,70,0.14)]"
                />
                <span className="mobile-safe-text">{item}</span>
              </span>
            ))}
          </div>
          <LanguageSwitcher variant="compact" />
        </Container>
      </div>

      <Container className="!px-1 py-3 sm:!px-8 lg:!px-10">
        <div className="hidden items-center gap-4 xl:flex">
          <Link
            href={localizeHref("/")}
            className="min-w-0 shrink-0 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
          >
            <NavagrahaLogo variant="header" priority />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-1 items-center justify-end gap-0.5"
          >
            {desktopNavigationPrimary.map((item) =>
              item.label === "Tools" ? (
                <ToolsMegaMenu key={item.href} navigation={toolsNavigation} />
              ) : (
                <NavigationLink
                  key={item.href}
                  href={item.href}
                  className="min-h-10 rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-transparent bg-transparent px-1.5 text-[0.64rem] font-medium tracking-[0.1em] !text-[color:var(--color-ink-strong)] shadow-none hover:bg-transparent hover:!text-black 2xl:px-2.5"
                  activeClassName="rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-[var(--color-accent-gold)] bg-transparent !text-black shadow-none"
                >
                  {item.label}
                </NavigationLink>
              )
            )}
          </nav>
        </div>

        <div className="flex w-full items-center gap-1 overflow-hidden xl:hidden sm:gap-1.5">
          <details className="group relative shrink-0">
            <summary
              aria-label={copy.navigation.menu}
              className="flex h-8 w-[1.65rem] cursor-pointer list-none items-center justify-center rounded-full border border-black/10 bg-white text-[#050505] shadow-[0_6px_16px_rgba(5,5,5,0.06)] marker:content-none [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="text-[0.85rem] leading-none text-[#050505]">
                {"\u2630"}
              </span>
            </summary>
            <div className="absolute top-[calc(100%+0.6rem)] z-30 max-h-[calc(100vh-5.5rem)] w-[min(calc(100vw-2rem),23rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[rgba(185,139,70,0.3)] bg-white p-3 shadow-[var(--shadow-md)] [inset-inline-start:0]">
              <nav aria-label="Mobile navigation" className="grid gap-4">
                <div className="grid gap-2">
                  <p className="px-3 text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                    Menu
                  </p>
                  <div className="grid gap-1">
                    {mobileMenuItems.map((item) => (
                      <NavigationLink
                        key={`mobile-nav-${item.href}`}
                        href={item.href}
                        tone="ghost"
                        className="w-full justify-start border border-[rgba(185,139,70,0.2)] bg-white !text-[color:var(--color-ink-strong)] hover:border-[rgba(185,139,70,0.38)]"
                      >
                        {item.label}
                      </NavigationLink>
                    ))}
                  </div>
                </div>
                <div className="mt-1 border-t border-[rgba(185,139,70,0.24)] pt-3">
                  <p className="px-3 pb-2 text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                    Language
                  </p>
                  <LanguageSwitcher variant="compact" />
                </div>
              </nav>
            </div>
          </details>

          <Link
            href={localizeHref("/")}
            className="block min-w-0 overflow-hidden transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
          >
            <span className="block overflow-hidden whitespace-nowrap text-[0.32rem] font-semibold uppercase leading-none tracking-[0.01em] text-[#050505] min-[390px]:text-[0.37rem] sm:text-[0.64rem] sm:tracking-[0.12em]">
              NAVAGRAHA CENTRE
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-[0.35rem]">
            <TrackedLink
              href={localizeHref("/ai")}
              eventName="premium_ai_cta_click"
              eventPayload={{ page: "global-header-mobile", feature: "header-ask-ni" }}
              className="inline-flex h-7 w-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--button-cta-ni-border)] bg-[image:var(--button-cta-ni-bg)] px-1 text-[0.42rem] font-medium tracking-[0] text-[color:var(--button-cta-ni-text)] shadow-none sm:h-8 sm:w-auto sm:px-2 sm:text-[0.56rem] sm:shadow-[0_10px_24px_rgba(0,109,255,0.18)]"
            >
              <span>Ask NI</span>
            </TrackedLink>

            <div className="relative z-10 flex h-7 w-8 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white shadow-[0_6px_16px_rgba(5,5,5,0.06)] sm:h-8 sm:w-[2rem]">
              <div className="absolute inset-0 [&_summary]:flex [&_summary]:h-7 [&_summary]:w-8 [&_summary]:items-center [&_summary]:justify-center [&_summary]:rounded-full [&_summary]:px-0 [&_summary]:text-transparent [&_summary]:marker:content-none [&_summary]:[-webkit-tap-highlight-color:transparent] [&_summary::-webkit-details-marker]:hidden sm:[&_summary]:h-8 sm:[&_summary]:w-[2rem]">
                <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center whitespace-nowrap text-[0.5rem] font-semibold uppercase tracking-[0] text-[#050505] sm:text-[0.5rem]">
                  {requestLocale.toUpperCase()}
                </span>
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
