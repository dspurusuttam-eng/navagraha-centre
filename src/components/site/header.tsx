import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NavagrahaLogo } from "@/components/brand/navagraha-logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { NavigationLink } from "@/components/site/navigation-link";
import { buttonStyles } from "@/components/ui/button";
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
    { href: localizeHref("/rashifal"), label: "Rashifal" },
    { href: localizeHref("/panchang"), label: "Panchang" },
    { href: localizeHref("/tools"), label: "Tools" },
    { href: localizeHref("/reports"), label: "Reports" },
    { href: localizeHref("/consultation"), label: "Consultation" },
    { href: localizeHref("/from-the-desk"), label: "From the Desk" },
  ] as const;

  const mobileMenuItems: readonly NavigationItem[] = [
    { href: localizeHref("/"), label: "Home" },
    { href: localizeHref("/kundli"), label: "Kundli" },
    { href: localizeHref("/rashifal"), label: "Rashifal" },
    { href: localizeHref("/panchang"), label: "Panchang" },
    { href: localizeHref("/tools"), label: "Tools" },
    { href: localizeHref("/reports"), label: "Reports" },
    { href: localizeHref("/consultation"), label: "Consultation" },
    { href: localizeHref("/shop"), label: "Shop" },
    { href: localizeHref("/from-the-desk"), label: "From the Desk" },
  ] as const;

  return (
    <header
      data-nosnippet
      className="sticky top-0 z-50 border-b border-black/8 bg-white/95 shadow-[0_8px_24px_rgba(17,24,39,0.06)] backdrop-blur-xl"
    >
      <div className="hidden border-b border-black/6 bg-white xl:block">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {topTrustItems.map((item) => (
              <span
                key={item}
                className="inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-black/8 bg-white px-2.5 py-1 text-[0.62rem] tracking-[0.04em] text-[var(--color-ink-strong)] shadow-[0_4px_12px_rgba(17,24,39,0.04)]"
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

      <Container className="py-3">
        <div className="hidden items-center gap-4 xl:flex">
          <Link
            href={localizeHref("/")}
            className="min-w-0 shrink-0 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
          >
            <NavagrahaLogo variant="header" priority />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-1 items-center justify-center gap-0.5"
          >
            {desktopNavigationPrimary.map((item) => (
              <NavigationLink
                key={item.href}
                href={item.href}
                className="min-h-10 rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-transparent bg-transparent px-2 text-[0.68rem] font-medium tracking-[0.14em] !text-[color:var(--color-ink-strong)] shadow-none hover:bg-transparent hover:!text-black 2xl:px-2.5"
                activeClassName="rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-[var(--color-accent-gold)] bg-transparent !text-black shadow-none"
              >
                {item.label}
              </NavigationLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <TrackedLink
              href={localizeHref("/ai")}
              eventName="premium_ai_cta_click"
              eventPayload={{ page: "global-header", feature: "header-ask-navagraha-ai" }}
              className={buttonStyles({
                tone: "accent",
                size: "sm",
                className: "whitespace-nowrap",
              })}
            >
              Ask NAVAGRAHA AI
            </TrackedLink>
            <Link
              href={localizeHref("/sign-in")}
              className={buttonStyles({
                tone: "ghost",
                size: "sm",
                className:
                  "whitespace-nowrap border border-black/10 bg-white text-[color:var(--color-ink-strong)] shadow-none hover:border-black/15 hover:bg-black/5",
              })}
            >
              Login / Account
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-1.5 xl:hidden">
          <Link
            href={localizeHref("/")}
            className="min-w-0 shrink-0 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
          >
            <NavagrahaLogo variant="mobile" priority />
          </Link>

          <TrackedLink
            href={localizeHref("/ai")}
            eventName="premium_ai_cta_click"
            eventPayload={{ page: "global-header-mobile", feature: "header-ask-ai" }}
            className={buttonStyles({
              tone: "accent",
              size: "sm",
              className: "shrink-0 px-2.5 text-[0.64rem] sm:px-3",
            })}
          >
            <span>Ask AI</span>
          </TrackedLink>

          <LanguageSwitcher variant="compact" />

          <details className="group relative justify-self-end">
            <summary
              aria-label={copy.navigation.menu}
              className={buttonStyles({
                tone: "ghost",
                size: "sm",
                className:
                  "shrink-0 cursor-pointer list-none whitespace-nowrap border border-black/10 bg-white px-3 text-[color:var(--color-ink-strong)] marker:content-none sm:px-4 [&::-webkit-details-marker]:hidden",
              })}
            >
              {copy.navigation.menu}
            </summary>
            <div className="absolute top-[calc(100%+0.6rem)] max-h-[calc(100vh-5.5rem)] w-[min(calc(100vw-2rem),23rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-black/8 bg-white p-3 shadow-[var(--shadow-md)] [inset-inline-end:0]">
              <nav aria-label="Mobile navigation" className="grid gap-4">
                <div className="grid gap-2">
                  <p className="px-3 text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-muted)]">
                    Menu
                  </p>
                  <div className="grid gap-1">
                    {mobileMenuItems.map((item) => (
                      <NavigationLink
                        key={`mobile-nav-${item.href}`}
                        href={item.href}
                        tone="ghost"
                        className="w-full justify-start border border-black/6 bg-white !text-[color:var(--color-ink-strong)]"
                      >
                        {item.label}
                      </NavigationLink>
                    ))}
                  </div>
                </div>
                <div className="mt-1 border-t border-black/6 pt-3">
                  <p className="px-3 pb-2 text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-muted)]">
                    Language
                  </p>
                  <LanguageSwitcher variant="compact" />
                </div>
                <div className="mt-1 grid gap-2 border-t border-black/6 pt-3">
                  <Link
                    href={localizeHref("/sign-in")}
                    className={buttonStyles({
                      tone: "ghost",
                      size: "sm",
                      className:
                        "w-full justify-center border border-black/10 bg-white text-[color:var(--color-ink-strong)]",
                    })}
                  >
                    Login / Account
                  </Link>
                </div>
              </nav>
            </div>
          </details>
        </div>
      </Container>
    </header>
  );
}
