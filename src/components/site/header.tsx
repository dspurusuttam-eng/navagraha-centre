import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NavagrahaLogo } from "@/components/brand/navagraha-logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { NavigationLink } from "@/components/site/navigation-link";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getGlobalCopyBundleForLocale } from "@/modules/localization/copy";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

type NavigationItem = {
  href: string;
  label: string;
};

const topTrustItems = [
  "Trusted Vedic Guidance",
  "Secure & Confidential",
  "Expert Astrologer Support",
] as const;

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

  const desktopNavigationBeforeTools: readonly NavigationItem[] = [
    { href: localizeHref("/"), label: "Home" },
    { href: localizeHref("/kundli"), label: "Kundli" },
    { href: localizeHref("/rashifal"), label: "Rashifal" },
    { href: localizeHref("/compatibility"), label: "Matchmaking" },
    { href: localizeHref("/panchang"), label: "Panchang" },
  ] as const;

  const desktopNavigationAfterTools: readonly NavigationItem[] = [
    { href: localizeHref("/reports"), label: "Reports" },
    { href: localizeHref("/consultation"), label: "Consultation" },
    { href: localizeHref("/shop"), label: "Shop" },
    { href: localizeHref("/from-the-desk"), label: "From the Desk" },
  ] as const;

  const utilityNavigation: readonly NavigationItem[] = [
    { href: localizeHref("/tools"), label: copy.navigation.tools },
    { href: localizeHref("/numerology"), label: copy.footer.links.numerology },
    { href: localizeHref("/calculators"), label: copy.navigation.calculators },
    { href: localizeHref("/muhurta"), label: copy.navigation.timeTools },
    { href: localizeHref("/compatibility"), label: copy.navigation.compatibility },
  ] as const;

  const mobileMenuItems: readonly NavigationItem[] = [
    { href: localizeHref("/"), label: "Home" },
    { href: localizeHref("/kundli"), label: "Kundli" },
    { href: localizeHref("/rashifal"), label: "Rashifal" },
    { href: localizeHref("/compatibility"), label: "Matchmaking" },
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
      className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(255,254,250,0.95)] shadow-[0_8px_24px_rgba(96,74,45,0.08)] backdrop-blur-xl"
    >
      <div className="border-b border-[color:var(--color-border)] bg-[rgba(255,255,255,0.84)]">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {topTrustItems.map((item) => (
              <span
                key={item}
                className="inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[rgba(185,139,70,0.24)] bg-[rgba(255,253,247,0.9)] px-2.5 py-1 text-[0.62rem] tracking-[0.04em] text-[var(--color-ink-strong)]"
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
            className="min-w-0 shrink-0 transition [transition-duration:var(--motion-duration-base)] hover:text-[var(--color-accent)]"
          >
            <NavagrahaLogo />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-1 items-center justify-center gap-0.5"
          >
            {desktopNavigationBeforeTools.map((item) => (
              <NavigationLink
                key={item.href}
                href={item.href}
                className="min-h-10 rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-transparent bg-transparent px-2 text-[0.63rem] text-[var(--color-ink-body)] shadow-none hover:bg-transparent hover:text-[var(--color-ink-strong)] 2xl:px-2.5"
                activeClassName="rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-[var(--color-accent-gold)] bg-transparent text-[var(--color-ink-strong)] shadow-none"
              >
                {item.label}
              </NavigationLink>
            ))}
            <details className="group relative">
              <summary
                aria-label="Tools"
                className={buttonStyles({
                  tone: "ghost",
                  size: "sm",
                  className:
                    "min-h-10 rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-transparent bg-transparent px-2 text-[0.63rem] text-[var(--color-ink-body)] shadow-none hover:bg-transparent hover:text-[var(--color-ink-strong)] marker:content-none 2xl:px-2.5 [&::-webkit-details-marker]:hidden",
                })}
              >
                Tools
              </summary>
              <div className="absolute top-[calc(100%+0.55rem)] z-40 max-h-[min(72vh,28rem)] w-[min(calc(100vw-2rem),18rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,254,250,0.98)] p-3 shadow-[var(--shadow-md)] [inset-inline-start:0]">
                <div className="grid gap-1" role="list">
                  {utilityNavigation.map((item) => (
                    <NavigationLink
                      key={item.href}
                      href={item.href}
                      className="w-full justify-start"
                    >
                      {item.label}
                    </NavigationLink>
                  ))}
                </div>
              </div>
            </details>
            {desktopNavigationAfterTools.map((item) => (
              <NavigationLink
                key={item.href}
                href={item.href}
                className="min-h-10 rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-transparent bg-transparent px-2 text-[0.63rem] text-[var(--color-ink-body)] shadow-none hover:bg-transparent hover:text-[var(--color-ink-strong)] 2xl:px-2.5"
                activeClassName="rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-[var(--color-accent-gold)] bg-transparent text-[var(--color-ink-strong)] shadow-none"
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
              className={buttonStyles({ size: "sm", className: "whitespace-nowrap" })}
            >
              Ask NAVAGRAHA AI
            </TrackedLink>
            <Link
              href={localizeHref("/dashboard")}
              className={buttonStyles({
                tone: "tertiary",
                size: "sm",
                className: "whitespace-nowrap",
              })}
            >
              Login / Account
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <Link
            href={localizeHref("/")}
            className="mr-auto"
          >
            <NavagrahaLogo compact />
          </Link>

          <TrackedLink
            href={localizeHref("/ai")}
            eventName="premium_ai_cta_click"
            eventPayload={{ page: "global-header-mobile", feature: "header-ask-ai" }}
            className={buttonStyles({
              size: "sm",
              className: "shrink-0 px-2.5 text-[0.64rem] sm:px-3",
            })}
          >
            <span>Ask AI</span>
          </TrackedLink>

          <details className="group relative">
            <summary
              aria-label={copy.navigation.menu}
              className={buttonStyles({
                tone: "tertiary",
                size: "sm",
                className:
                  "shrink-0 cursor-pointer list-none px-3 marker:content-none whitespace-nowrap sm:px-4",
              })}
            >
              {copy.navigation.menu}
            </summary>
            <div className="absolute top-[calc(100%+0.6rem)] max-h-[calc(100vh-5.5rem)] w-[min(calc(100vw-2rem),23rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,254,250,0.98)] p-3 shadow-[var(--shadow-md)] [inset-inline-end:0]">
              <nav aria-label="Mobile navigation" className="grid gap-4">
                <div className="grid gap-2">
                  <p className="px-3 text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                    Menu
                  </p>
                  <div className="grid gap-1">
                    {mobileMenuItems.map((item) => (
                      <NavigationLink
                        key={`mobile-nav-${item.href}`}
                        href={item.href}
                        tone="tertiary"
                        className="w-full justify-start"
                      >
                        {item.label}
                      </NavigationLink>
                    ))}
                  </div>
                </div>
                <div className="mt-1 border-t border-[color:var(--color-border)] pt-3">
                  <p className="px-3 pb-2 text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                    Language
                  </p>
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
