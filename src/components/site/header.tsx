import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { NavigationLink } from "@/components/site/navigation-link";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
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

type NavigationGroup = {
  title: string;
  items: readonly NavigationItem[];
};

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

  const primaryNavigation: readonly NavigationItem[] = [
    { href: localizeHref("/"), label: copy.navigation.home },
    { href: localizeHref("/kundli"), label: copy.navigation.kundli },
    { href: localizeHref("/compatibility"), label: copy.navigation.compatibility },
    { href: localizeHref("/rashifal"), label: copy.navigation.rashifal },
    { href: localizeHref("/panchang"), label: copy.navigation.panchang },
    { href: localizeHref("/numerology"), label: copy.footer.links.numerology },
    { href: localizeHref("/ai"), label: copy.navigation.ai },
    { href: localizeHref("/reports"), label: copy.navigation.reports },
    { href: localizeHref("/consultation"), label: copy.navigation.consultation },
    { href: localizeHref("/insights"), label: copy.navigation.insights },
    { href: localizeHref("/shop"), label: copy.navigation.shop },
  ] as const;

  const utilityNavigation: readonly NavigationItem[] = [
    { href: localizeHref("/tools"), label: copy.navigation.tools },
    { href: localizeHref("/numerology"), label: copy.footer.links.numerology },
    { href: localizeHref("/calculators"), label: copy.navigation.calculators },
    { href: localizeHref("/muhurta"), label: copy.navigation.timeTools },
    { href: localizeHref("/compatibility"), label: copy.navigation.compatibility },
  ] as const;

  const contentNavigation: readonly NavigationItem[] = [
    { href: localizeHref("/from-the-desk"), label: "From the Desk" },
    { href: localizeHref("/insights"), label: copy.navigation.insights },
    { href: localizeHref("/daily-rashifal"), label: copy.navigation.dailyRashifal },
    { href: localizeHref("/insights/remedies"), label: "Remedies / Guidance" },
  ] as const;

  const mobilePrimaryNavigation: readonly NavigationItem[] = [
    { href: localizeHref("/kundli"), label: copy.navigation.kundli },
    { href: localizeHref("/rashifal"), label: copy.navigation.rashifal },
    { href: localizeHref("/panchang"), label: copy.navigation.panchang },
  ] as const;

  const mobileGroups: readonly NavigationGroup[] = [
    { title: "Primary", items: mobilePrimaryNavigation },
    { title: "Utilities", items: utilityNavigation },
    { title: "NAVAGRAHA AI", items: [{ href: localizeHref("/ai"), label: copy.navigation.ai }] },
    {
      title: "Services",
      items: [
        { href: localizeHref("/reports"), label: copy.navigation.reports },
        { href: localizeHref("/consultation"), label: copy.navigation.consultation },
      ],
    },
    { title: "Content", items: contentNavigation },
    { title: "Shop", items: [{ href: localizeHref("/shop"), label: copy.navigation.shop }] },
  ] as const;

  return (
    <header
      data-nosnippet
      className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(255,254,250,0.95)] shadow-[0_8px_24px_rgba(96,74,45,0.08)] backdrop-blur-xl"
    >
      <Container className="py-3">
        <div className="hidden items-center gap-4 xl:flex">
          <Link
            href={localizeHref("/")}
            className="min-w-0 shrink-0 transition [transition-duration:var(--motion-duration-base)] hover:text-[var(--color-accent)]"
          >
            <span
              className="block font-[family-name:var(--font-display)] text-[1.42rem] leading-none text-[var(--color-ink-strong)]"
              style={{ letterSpacing: "0.1em" }}
            >
              {siteConfig.name}
            </span>
            <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-trust-text)]">
              ভাগ্য গণনা কাৰ্যালয় Since 1950
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex flex-1 items-center justify-center gap-0.5"
          >
            {primaryNavigation.map((item) => (
              <NavigationLink
                key={item.href}
                href={item.href}
                className="min-h-10 max-w-[8.5rem] px-2.5 text-[0.64rem] 2xl:px-3"
              >
                {item.label}
              </NavigationLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <Link
              href={localizeHref("/dashboard")}
              className={buttonStyles({
                tone: "tertiary",
                size: "sm",
                className: "whitespace-nowrap",
              })}
            >
              Login / Sign Up
            </Link>
            <TrackedLink
              href={localizeHref("/kundli")}
              eventName="cta_click"
              eventPayload={{ page: "global-header", feature: "header-generate-kundli" }}
              className={buttonStyles({ size: "sm", className: "whitespace-nowrap" })}
            >
              {copy.cta.generateKundli}
            </TrackedLink>
          </div>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <Link
            href={localizeHref("/")}
            className="mobile-safe-text mr-auto min-w-0 max-w-[10rem] sm:max-w-none"
          >
            <span
              className="block truncate font-[family-name:var(--font-display)] text-[1.08rem] leading-none text-[var(--color-ink-strong)]"
              style={{ letterSpacing: "0.08em" }}
            >
              NAVAGRAHA
            </span>
            <span className="mt-1 hidden text-[0.54rem] uppercase tracking-[0.1em] text-[var(--color-trust-text)] sm:block">
              ভাগ্য গণনা কাৰ্যালয় Since 1950
            </span>
          </Link>

          <TrackedLink
            href={localizeHref("/kundli")}
            eventName="cta_click"
            eventPayload={{ page: "global-header-mobile", feature: "header-generate-kundli" }}
            className={buttonStyles({ size: "sm", className: "shrink-0 px-3 sm:px-[1.125rem]" })}
          >
            <span className="sm:hidden">Kundli</span>
            <span className="hidden sm:inline">Generate Kundli</span>
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
                {mobileGroups.map((group) => (
                  <div key={group.title} className="grid gap-2">
                    <p className="px-3 text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                      {group.title}
                    </p>
                    <div className="grid gap-1">
                      {group.items.map((item) => (
                        <NavigationLink
                          key={`${group.title}-${item.href}`}
                          href={item.href}
                          tone={group.title === "Primary" ? "ghost" : "tertiary"}
                          className="w-full justify-start"
                        >
                          {item.label}
                        </NavigationLink>
                      ))}
                    </div>
                  </div>
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
