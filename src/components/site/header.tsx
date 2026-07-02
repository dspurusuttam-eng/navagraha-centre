import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
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
      forcePrefix: hasExplicitLocalePrefix || requestLocale !== defaultLocale,
    });

  const desktopNavigationPrimary: readonly NavigationItem[] = [
    { href: localizeHref("/"), label: "Home" },
    { href: localizeHref("/kundli"), label: "Kundli" },
    { href: localizeHref("/rashifal"), label: "Daily Guidance" },
    { href: localizeHref("/tools"), label: "Tools" },
    { href: localizeHref("/reports"), label: "Reports" },
    { href: localizeHref("/consultation"), label: "Consultation" },
    { href: localizeHref("/learn"), label: "Learn" },
    { href: localizeHref("/sign-in"), label: "Account" },
  ] as const;

  const toolsNavigation = buildLocalizedToolsNavigation(localizeHref);

  const mobileMenuItems: readonly NavigationItem[] = [
    { href: localizeHref("/panchang"), label: "Panchang" },
    { href: localizeHref("/rashifal"), label: "Rashifal" },
    { href: localizeHref("/reports"), label: "Reports" },
    { href: localizeHref("/learn"), label: "Learn" },
    { href: localizeHref("/shop"), label: "Vedic Shop" },
    { href: localizeHref("/tools"), label: "Tools" },
    { href: localizeHref("/privacy"), label: "Privacy" },
    { href: localizeHref("/terms"), label: "Terms" },
    { href: localizeHref("/contact"), label: "Contact" },
  ] as const;

  return (
    <header
      data-nosnippet
      className="sticky top-0 z-50 bg-white xl:bg-transparent"
    >
      <div className="hidden bg-transparent xl:block xl:pt-3">
        <Container className="xl:!px-6 2xl:!px-10">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-[rgba(185,139,70,0.18)] bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(17,17,17,0.04),0_10px_24px_rgba(17,17,17,0.05)] 2xl:px-5">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              {topTrustItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[rgba(185,139,70,0.24)] bg-white px-3 py-1 text-[0.62rem] tracking-[0.04em] text-[var(--color-ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_2px_8px_rgba(17,17,17,0.04)]"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-gold)]"
                  />
                  <span className="mobile-safe-text">{item}</span>
                </span>
              ))}
            </div>
            <div className="relative z-10 h-9 w-10 shrink-0 [&_details]:h-9 [&_details]:w-10 [&_summary]:flex [&_summary]:h-9 [&_summary]:w-10 [&_summary]:max-w-none [&_summary]:cursor-pointer [&_summary]:items-center [&_summary]:justify-center [&_summary]:overflow-hidden [&_summary]:rounded-[13px] [&_summary]:border [&_summary]:border-[rgba(76,187,23,0.22)] [&_summary]:bg-white [&_summary]:p-0 [&_summary]:text-[0px] [&_summary]:text-transparent [&_summary]:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.07),0_0_8px_rgba(76,187,23,0.08)] [&_summary]:marker:content-none [&_summary]:[-webkit-tap-highlight-color:transparent] [&_summary::-webkit-details-marker]:hidden">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center whitespace-nowrap text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#4CBB17]"
              >
                {requestLocale.toUpperCase()}
              </span>
              <LanguageSwitcher variant="compact" />
            </div>
          </div>
        </Container>
      </div>

      <div className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(185,139,70,0.16)] bg-white shadow-[0_1px_0_rgba(17,17,17,0.05),0_8px_20px_rgba(17,17,17,0.06)] xl:hidden">
        <Container className="!px-[10px] py-1.5 min-[390px]:!px-3 sm:!px-8">
          <div className="flex min-h-[3rem] w-full items-center justify-between gap-1.5 min-[390px]:gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 min-[390px]:gap-2">
              <details className="group relative shrink-0">
                <summary
                  aria-label={copy.navigation.menu}
                  className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-[rgba(17,17,17,0.08)] bg-white text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(17,17,17,0.06)] marker:content-none [-webkit-tap-highlight-color:transparent] [&::-webkit-details-marker]:hidden"
                >
                  <span
                    aria-hidden="true"
                    className="text-[1.4rem] leading-none text-[#111111]"
                  >
                    {"\u2630"}
                  </span>
                </summary>
                <div className="absolute top-[calc(100%+0.55rem)] z-30 max-h-[calc(100vh-5.5rem)] w-[min(calc(100vw-1.5rem),23rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[rgba(185,139,70,0.18)] bg-white p-3 shadow-[0_16px_34px_rgba(5,5,5,0.07)] [inset-inline-start:0]">
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
                <span className="block truncate whitespace-nowrap text-[17px] font-bold uppercase leading-none tracking-[0.08em] text-[#111111] min-[390px]:text-[18px] min-[430px]:text-[19px] sm:text-[19px] sm:tracking-[0.1em]">
                  NAVAGRAHA
                </span>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <TrackedLink
                href="/ai"
                eventName="premium_ai_cta_click"
                eventPayload={{
                  page: "global-header-mobile",
                  feature: "header-ask-ni",
                }}
                className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[rgba(56,189,248,0.22)] bg-white px-2.5 text-[13px] font-bold tracking-[0.01em] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.08),0_0_10px_rgba(56,189,248,0.10)] transition hover:border-[rgba(56,189,248,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] min-[390px]:px-3 min-[430px]:text-[14px]"
              >
                <span>Ask NI</span>
              </TrackedLink>

              <TrackedLink
                href={localizeHref("/reports")}
                eventName="cta_click"
                eventPayload={{
                  page: "global-header-mobile",
                  feature: "header-bell",
                  route: "/reports",
                }}
                aria-label="Notifications"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(184,134,11,0.18)] bg-white text-[#B8860B] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(17,17,17,0.07)] transition hover:border-[rgba(184,134,11,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                >
                  <path d="M15 17H9" />
                  <path d="M18 16H6a1 1 0 0 1-.8-1.6l1.3-1.7A3 3 0 0 0 7 11V9a5 5 0 1 1 10 0v2a3 3 0 0 0 .5 1.6l1.3 1.8A1 1 0 0 1 18 16Z" />
                  <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
                </svg>
              </TrackedLink>

              <div className="relative z-10 h-9 w-10 shrink-0 [&_details]:h-9 [&_details]:w-10 [&_summary]:flex [&_summary]:h-9 [&_summary]:w-10 [&_summary]:max-w-none [&_summary]:cursor-pointer [&_summary]:items-center [&_summary]:justify-center [&_summary]:overflow-hidden [&_summary]:rounded-[13px] [&_summary]:border [&_summary]:border-[rgba(76,187,23,0.22)] [&_summary]:bg-white [&_summary]:p-0 [&_summary]:text-[0px] [&_summary]:text-transparent [&_summary]:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.07),0_0_8px_rgba(76,187,23,0.08)] [&_summary]:marker:content-none [&_summary]:[-webkit-tap-highlight-color:transparent] [&_summary::-webkit-details-marker]:hidden min-[390px]:w-11 [&_details]:min-w-0 [&_summary]:min-w-0">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.04em] text-[#4CBB17] min-[430px]:text-[14px]"
                >
                  {requestLocale.toUpperCase()}
                </span>
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="h-[3.25rem] xl:hidden" aria-hidden="true" />

      <Container className="!px-3 py-2 sm:!px-8 lg:!px-10 xl:pb-4 xl:pt-2">
        <div className="hidden xl:flex">
          <div className="flex w-full items-center justify-between gap-5 rounded-[1.7rem] border border-[rgba(185,139,70,0.18)] bg-white px-5 py-3.5 shadow-[0_1px_0_rgba(17,17,17,0.04),0_14px_30px_rgba(17,17,17,0.055)] 2xl:px-6">
            <Link
              href={localizeHref("/")}
              className="min-w-0 shrink-0 pr-4 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
            >
              <span className="block min-w-0 whitespace-nowrap">
                <span className="block text-[1.05rem] font-bold uppercase leading-none tracking-[0.2em] text-[#050505] xl:text-[1.08rem] 2xl:text-[1.14rem]">
                  NAVAGRAHA CENTRE
                </span>
                <span className="mt-1.5 block text-[0.5rem] font-semibold uppercase leading-none tracking-[0.3em] text-[var(--color-antique-gold-dark)] xl:text-[0.52rem] 2xl:text-[0.56rem]">
                  Vedic Astrology • Ask NI
                </span>
              </span>
            </Link>

            <nav
              aria-label="Primary navigation"
              className="flex min-w-0 flex-1 items-center justify-end gap-1.5 2xl:gap-2"
            >
              {desktopNavigationPrimary.map((item) =>
                item.label === "Tools" ? (
                  <ToolsMegaMenu key={item.href} navigation={toolsNavigation} />
                ) : (
                  <NavigationLink
                    key={item.href}
                    href={item.href}
                    className="min-h-10 rounded-full border border-transparent bg-transparent px-2.5 text-[0.64rem] font-semibold tracking-[0.08em] !text-[color:var(--color-ink-strong)] shadow-none hover:border-[rgba(185,139,70,0.22)] hover:bg-[rgba(185,139,70,0.06)] hover:!text-black 2xl:px-3"
                    activeClassName="rounded-full border-[rgba(185,139,70,0.28)] bg-white !text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.06)]"
                  >
                    {item.label}
                  </NavigationLink>
                )
              )}
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
