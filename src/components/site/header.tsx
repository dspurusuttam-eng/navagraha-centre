import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

const primaryNavigation = [
  { href: "/kundli", label: "Kundli" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/rashifal", label: "Rashifal" },
  { href: "/ai", label: "AI" },
  { href: "/reports", label: "Reports" },
] as const;

const secondaryNavigation = [
  { href: "/consultation", label: "Consultation" },
  { href: "/shop", label: "Shop" },
  { href: "/insights", label: "Insights" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(255,254,250,0.95)] backdrop-blur-xl">
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
                  className: "min-h-11 px-4 text-[0.72rem]",
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
              Account
            </Link>
            <Link href="/kundli" className={buttonStyles({ size: "sm" })}>
              Generate Kundli
            </Link>
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

          <Link href="/kundli" className={buttonStyles({ size: "sm" })}>
            <span className="sm:hidden">Kundli</span>
            <span className="hidden sm:inline">Generate Kundli</span>
          </Link>

          <details className="group relative">
            <summary
              className={buttonStyles({
                tone: "tertiary",
                size: "sm",
                className: "cursor-pointer list-none px-4 marker:content-none",
              })}
            >
              Menu
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
                    Account
                  </Link>
                  <Link
                    href="/kundli-ai"
                    className={buttonStyles({
                      tone: "secondary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    Try NAVAGRAHA AI
                  </Link>
                  <Link
                    href="/reports"
                    className={buttonStyles({
                      tone: "secondary",
                      size: "sm",
                      className: "w-full justify-center",
                    })}
                  >
                    Get Free Report
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
