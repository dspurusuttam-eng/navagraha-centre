import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { globalCtaCopy, globalNavigationCopy } from "@/modules/localization/copy";

const primaryNavigation = [
  { href: "/kundli", label: globalNavigationCopy.kundli },
  { href: "/compatibility", label: globalNavigationCopy.compatibility },
  { href: "/rashifal", label: globalNavigationCopy.rashifal },
  { href: "/ai", label: globalNavigationCopy.ai },
  { href: "/reports", label: globalNavigationCopy.reports },
] as const;

const secondaryNavigation = [
  { href: "/tools", label: globalNavigationCopy.tools },
  { href: "/consultation", label: globalNavigationCopy.consultation },
  { href: "/shop", label: globalNavigationCopy.shop },
  { href: "/insights", label: globalNavigationCopy.insights },
  { href: "/calculators", label: globalNavigationCopy.calculators },
  { href: "/muhurta", label: globalNavigationCopy.timeTools },
  { href: "/pricing", label: globalNavigationCopy.pricing },
] as const;

export function Header() {
  return (
    <header
      data-nosnippet
      className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(255,254,250,0.95)] shadow-[0_8px_24px_rgba(96,74,45,0.08)] backdrop-blur-xl"
    >
      <Container className="py-3">
        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href="/"
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
            <Link
              href="/dashboard"
              className={buttonStyles({ tone: "tertiary", size: "sm" })}
            >
              {globalNavigationCopy.account}
            </Link>
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{ page: "global-header", feature: "header-generate-kundli" }}
              className={buttonStyles({ size: "sm" })}
            >
              {globalCtaCopy.generateKundli}
            </TrackedLink>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/"
            className="mr-auto font-[family-name:var(--font-display)] text-[1.2rem] text-[var(--color-ink-strong)]"
            style={{ letterSpacing: "0.08em" }}
          >
            NAVAGRAHA
          </Link>

          <TrackedLink
            href="/kundli"
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
              {globalNavigationCopy.menu}
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.6rem)] w-[min(90vw,22rem)] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,254,250,0.98)] p-3 shadow-[var(--shadow-md)]">
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
                <div className="mt-1 grid gap-2 border-t border-[color:var(--color-border)] pt-3">
                  <Link
                    href="/dashboard"
                    className={buttonStyles({
                      tone: "tertiary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    {globalNavigationCopy.account}
                  </Link>
                  <TrackedLink
                    href="/kundli-ai"
                    eventName="cta_click"
                    eventPayload={{ page: "global-header-mobile", feature: "header-try-ai" }}
                    className={buttonStyles({
                      tone: "secondary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    {globalCtaCopy.exploreAi}
                  </TrackedLink>
                  <TrackedLink
                    href="/reports"
                    eventName="cta_click"
                    eventPayload={{ page: "global-header-mobile", feature: "header-get-report" }}
                    className={buttonStyles({
                      tone: "secondary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    {globalCtaCopy.unlockFullReport}
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
