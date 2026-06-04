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

      <Container className="!px-3 py-2 sm:!px-8 lg:!px-10 xl:py-3">
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

        <div className="flex min-h-14 w-full items-center justify-between gap-2 xl:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <details className="group relative shrink-0">
              <summary
                aria-label={copy.navigation.menu}
                className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-black/12 bg-white text-[#050505] shadow-[0_6px_16px_rgba(5,5,5,0.06)] marker:content-none [-webkit-tap-highlight-color:transparent] [&::-webkit-details-marker]:hidden"
              >
                <span aria-hidden="true" className="text-[1rem] leading-none text-[#050505]">
                  {"\u2630"}
                </span>
              </summary>
              <div className="absolute top-[calc(100%+0.55rem)] z-30 max-h-[calc(100vh-5.5rem)] w-[min(calc(100vw-1.5rem),23rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[rgba(185,139,70,0.3)] bg-white p-3 shadow-[var(--shadow-md)] [inset-inline-start:0]">
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
              className="block min-w-0 flex-1 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
            >
              <span className="block truncate whitespace-nowrap text-[0.6rem] font-semibold uppercase leading-none tracking-[0.08em] text-[#050505] min-[390px]:text-[0.66rem] sm:text-[0.78rem] sm:tracking-[0.12em]">
                <span className="sm:hidden">NAVAGRAHA</span>
                <span className="hidden sm:inline">NAVAGRAHA CENTRE</span>
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <TrackedLink
              href="/ai"
              eventName="premium_ai_cta_click"
              eventPayload={{ page: "global-header-mobile", feature: "header-ask-ni" }}
              className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[rgba(185,139,70,0.34)] bg-white px-2 text-[0.53rem] font-semibold tracking-[0.02em] text-[#050505] shadow-[0_6px_16px_rgba(5,5,5,0.05)] transition hover:border-[rgba(185,139,70,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:px-3 sm:text-[0.64rem]"
            >
              <span>Ask NI</span>
            </TrackedLink>

            <TrackedLink
              href={localizeHref("/reports")}
              eventName="cta_click"
              eventPayload={{ page: "global-header-mobile", feature: "header-bell", route: "/reports" }}
              aria-label="Bell"
              className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[rgba(185,139,70,0.34)] bg-white px-2 text-[0.54rem] font-semibold tracking-[0.02em] text-[#050505] shadow-[0_6px_16px_rgba(5,5,5,0.05)] transition hover:border-[rgba(185,139,70,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] sm:px-3 sm:text-[0.64rem]"
            >
              <span>Bell</span>
            </TrackedLink>

            <div className="relative z-10 h-10 w-10 shrink-0 [&_details]:h-10 [&_details]:w-10 [&_summary]:flex [&_summary]:h-10 [&_summary]:w-10 [&_summary]:max-w-none [&_summary]:cursor-pointer [&_summary]:items-center [&_summary]:justify-center [&_summary]:overflow-hidden [&_summary]:rounded-full [&_summary]:border [&_summary]:border-[rgba(185,139,70,0.34)] [&_summary]:bg-white [&_summary]:p-0 [&_summary]:text-[0px] [&_summary]:text-transparent [&_summary]:shadow-[0_6px_16px_rgba(5,5,5,0.05)] [&_summary]:marker:content-none [&_summary]:[-webkit-tap-highlight-color:transparent] [&_summary::-webkit-details-marker]:hidden">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.04em] text-[#050505]"
              >
                {requestLocale.toUpperCase()}
              </span>
              <LanguageSwitcher variant="compact" />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
