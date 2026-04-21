"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { siteConfig, type SiteNavItem } from "@/config/site";
import { globalCtaCopy } from "@/modules/localization/copy";
import { ShopCartLink } from "@/modules/shop/components/shop-cart-link";

type SiteSection = "marketing" | "app" | "admin";

const sectionConfig: Record<
  SiteSection,
  {
    label: string;
    description: string;
    navigation: readonly SiteNavItem[];
    action: {
      href: string;
      label: string;
    };
  }
> = {
  marketing: {
    label: "Marketing",
    description:
      "Premium astrology surfaces for chart, AI, consultation, and trust-led exploration.",
    navigation: siteConfig.marketingNav,
    action: {
      href: "/sign-up",
      label: globalCtaCopy.generateKundli,
    },
  },
  app: {
    label: "App",
    description:
      "Protected member surfaces for onboarding, consultation booking, chart review, and account continuity.",
    navigation: siteConfig.appNav,
    action: {
      href: "/dashboard/consultations/book",
      label: "Book Consultation",
    },
  },
  admin: {
    label: "Admin",
    description:
      "Internal operations surface for orders, consultations, and catalog governance.",
    navigation: siteConfig.adminNav,
    action: {
      href: "/dashboard",
      label: "Member Dashboard",
    },
  },
};

export type NavbarProps = {
  section: SiteSection;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ section }: Readonly<NavbarProps>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentSection = sectionConfig[section];
  const isMarketing = section === "marketing";

  const primaryCta = currentSection.action;
  const secondaryCta = useMemo(
    () =>
      isMarketing
        ? { href: "/kundli-ai", label: globalCtaCopy.exploreAi }
        : { href: "/consultation", label: globalCtaCopy.bookConsultation },
    [isMarketing]
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl",
        isMarketing
          ? "border-[rgba(29,34,53,0.14)] bg-[rgba(251,248,242,0.95)]"
          : "border-[color:var(--color-border)] bg-[rgba(10,15,28,0.9)]"
      )}
    >
      <Container className="py-3 sm:py-4">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className={cn(
                    "font-[family-name:var(--font-display)] text-2xl transition [transition-duration:var(--motion-duration-base)] sm:text-3xl",
                    isMarketing
                      ? "text-[var(--color-ink-strong)] hover:text-[var(--color-accent)]"
                      : "text-[color:var(--color-foreground)] hover:text-[color:var(--color-accent)]"
                  )}
                  style={{ letterSpacing: "0.14em" }}
                >
                  {siteConfig.name}
                </Link>
                <span
                  className={cn(
                    "inline-flex rounded-[var(--radius-pill)] border px-3 py-1 text-[var(--font-size-label)] uppercase tracking-[var(--tracking-label)]",
                    isMarketing
                      ? "border-[var(--color-trust-border)] bg-[var(--color-trust-bg)] text-[var(--color-trust-text)]"
                      : "border-[color:var(--color-border-strong)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                  )}
                >
                  {currentSection.label}
                </span>
              </div>
              <p
                className={cn(
                  "max-w-2xl text-[0.74rem] leading-[var(--line-height-copy)] sm:text-[length:var(--font-size-body-sm)]",
                  isMarketing
                    ? "text-[var(--color-ink-muted)]"
                    : "text-[color:var(--color-muted)]"
                )}
              >
                {currentSection.description}
              </p>
            </div>

            <button
              type="button"
              className={cn(
                buttonStyles({
                  size: "sm",
                  tone: isMarketing ? "tertiary" : "secondary",
                }),
                "min-h-11 px-4 lg:hidden"
              )}
              aria-expanded={mobileOpen}
              aria-controls="global-mobile-nav"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>

          <div
            className={cn(
              "hidden items-center justify-between gap-3 rounded-[var(--radius-lg)] border p-2 lg:flex",
              isMarketing
                ? "border-[rgba(29,34,53,0.14)] bg-[rgba(255,255,255,0.84)]"
                : "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.03)]"
            )}
          >
            <nav
              aria-label={`${currentSection.label} navigation`}
              className="flex flex-wrap items-center gap-1.5"
            >
              {currentSection.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-[var(--radius-pill)] border px-3 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)]",
                    isMarketing
                      ? "border-transparent text-[var(--color-ink-muted)] hover:border-[rgba(29,34,53,0.2)] hover:bg-[var(--color-trust-bg)] hover:text-[var(--color-ink-strong)]"
                      : "border-transparent text-[color:var(--color-muted)] hover:border-[color:var(--color-border)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[color:var(--color-foreground)]",
                    isActiveRoute(pathname, item.href) &&
                      (isMarketing
                        ? "border-[rgba(95,75,160,0.3)] bg-[var(--color-trust-bg)] text-[var(--color-ink-strong)]"
                        : "border-[color:var(--color-border-strong)] bg-[rgba(255,255,255,0.05)] text-[color:var(--color-foreground)]"),
                    item.label === "NAVAGRAHA AI" &&
                      isMarketing &&
                      "border-[rgba(184,137,67,0.3)] bg-[rgba(184,137,67,0.12)] text-[var(--color-accent)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {isMarketing ? <ShopCartLink /> : null}
            </nav>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={primaryCta.href}
                className={buttonStyles({ size: "sm", tone: "accent" })}
              >
                {primaryCta.label}
              </Link>
              <Link
                href={secondaryCta.href}
                className={buttonStyles({
                  size: "sm",
                  tone: isMarketing ? "secondary" : "tertiary",
                })}
              >
                {secondaryCta.label}
              </Link>
              <Link
                href={isMarketing ? "/sign-in" : "/dashboard"}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                })}
              >
                {isMarketing ? globalCtaCopy.signInAccount : "Account"}
              </Link>
            </div>
          </div>

          <div
            id="global-mobile-nav"
            className={cn(
              "rounded-[var(--radius-lg)] border p-3 lg:hidden",
              isMarketing
                ? "border-[rgba(29,34,53,0.14)] bg-[rgba(255,255,255,0.88)]"
                : "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.03)]",
              mobileOpen ? "block" : "hidden"
            )}
          >
            <nav
              aria-label={`${currentSection.label} mobile navigation`}
              className="grid gap-2"
            >
              {currentSection.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-[var(--radius-md)] border px-3 py-3 text-[0.74rem] uppercase tracking-[0.16em] transition [transition-duration:var(--motion-duration-base)]",
                    isMarketing
                      ? "border-[rgba(29,34,53,0.14)] text-[var(--color-ink-body)]"
                      : "border-[color:var(--color-border)] text-[color:var(--color-foreground)]",
                    isActiveRoute(pathname, item.href) &&
                      (isMarketing
                        ? "bg-[var(--color-trust-bg)] text-[var(--color-ink-strong)]"
                        : "bg-[rgba(255,255,255,0.06)]")
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={primaryCta.href}
                onClick={() => setMobileOpen(false)}
                className={buttonStyles({
                  size: "sm",
                  tone: "accent",
                  className: "mt-1 w-full justify-center",
                })}
              >
                {primaryCta.label}
              </Link>
              <Link
                href={secondaryCta.href}
                onClick={() => setMobileOpen(false)}
                className={buttonStyles({
                  size: "sm",
                  tone: isMarketing ? "secondary" : "tertiary",
                  className: "w-full justify-center",
                })}
              >
                {secondaryCta.label}
              </Link>
              <Link
                href={isMarketing ? "/sign-in" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                {isMarketing ? globalCtaCopy.signInAccount : "Account"}
              </Link>
              {isMarketing ? <ShopCartLink /> : null}
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
