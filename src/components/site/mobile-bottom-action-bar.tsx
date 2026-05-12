"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
} from "@/components/icons/astrology-icons";
import { defaultLocale, getLocalizedPath, type SupportedLocale } from "@/modules/localization/config";
import { cn } from "@/lib/cn";

type BottomAction = {
  label: string;
  href: string;
  icon: "home" | "ai" | "kundli" | "consult";
};

export type MobileBottomActionBarProps = {
  locale: SupportedLocale;
  hasExplicitLocalePrefix: boolean;
};

function localizeHref(
  locale: SupportedLocale,
  hasExplicitLocalePrefix: boolean,
  href: string,
) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function normalizePathname(pathname: string | null) {
  if (!pathname) {
    return "/";
  }

  const trimmed = pathname.trim().replace(/\/+$/, "");
  return trimmed.length ? trimmed : "/";
}

function HomeGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6.5 10.5V19h11V10.5" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

function BarIcon({ icon }: Readonly<{ icon: BottomAction["icon"] }>) {
  switch (icon) {
    case "home":
      return <HomeGlyph />;
    case "ai":
      return <NavagrahaAiIcon className="h-9 w-9" />;
    case "kundli":
      return <KundliIcon className="h-9 w-9" />;
    case "consult":
    default:
      return <ConsultationIcon className="h-9 w-9" />;
  }
}

export function MobileBottomActionBar({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<MobileBottomActionBarProps>) {
  const pathname = normalizePathname(usePathname());

  const homeHref = localizeHref(locale, hasExplicitLocalePrefix, "/");
  const toolsHref = localizeHref(locale, hasExplicitLocalePrefix, "/tools");
  const kundliHref = localizeHref(locale, hasExplicitLocalePrefix, "/kundli");
  const consultationHref = localizeHref(locale, hasExplicitLocalePrefix, "/consultation");

  const hideForPaths = new Set(
    [
      "/sign-in",
      "/sign-up",
      "/forgot-password",
      "/reset-password",
      "/privacy",
      "/terms",
      "/disclaimer",
      "/refund-cancellation",
      "/style-guide",
    ].map((path) => localizeHref(locale, hasExplicitLocalePrefix, path))
  );

  if (hideForPaths.has(pathname)) {
    return null;
  }

  const bottomActions: readonly BottomAction[] = [
    { label: "Home", href: homeHref, icon: "home" },
    { label: "Ask AI", href: toolsHref, icon: "ai" },
    { label: "Kundli", href: kundliHref, icon: "kundli" },
    { label: "Consult", href: consultationHref, icon: "consult" },
  ];

  const isHome = pathname === homeHref || pathname === `${homeHref}/`;

  return (
    <>
      {isHome ? (
        <div className="fixed inset-x-0 bottom-[4.95rem] z-50 flex justify-center px-3 md:hidden">
          <Link
            href={consultationHref}
            className="group flex w-full max-w-[22rem] items-center gap-3 rounded-[1.5rem] border border-[rgba(73,116,193,0.32)] bg-[linear-gradient(145deg,#1f4ea8_0%,#234c94_100%)] px-4 py-3 text-white shadow-[0_18px_36px_rgba(19,53,110,0.24)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(244,213,143,0.38)] bg-[rgba(255,255,255,0.12)] text-[var(--color-accent-gold)] shadow-[0_10px_24px_rgba(19,53,110,0.12)]">
              <ConsultationIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[0.72rem] uppercase tracking-[0.16em] text-[rgba(255,247,229,0.82)]">
                Consult J P Sarmah
              </span>
              <span className="block text-[0.8rem] font-medium text-white">
                JYOTISH BHASKAR guidance
              </span>
            </span>
          </Link>
        </div>
      ) : null}

      <nav
        aria-label="Mobile quick actions"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/8 bg-white/98 shadow-[0_-10px_28px_rgba(17,24,39,0.08)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-4 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-2">
          {bottomActions.map((action) => {
            const active =
              action.href === "/"
                ? pathname === action.href || pathname === `${action.href}/`
                : pathname === action.href || pathname.startsWith(`${action.href}/`);

            return (
              <Link
                key={action.label}
                href={action.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1.5 rounded-[1.1rem] px-2 py-2 text-center transition [transition-duration:var(--motion-duration-base)]",
                  active
                    ? "bg-[rgba(184,137,67,0.08)] text-[color:var(--color-accent-strong)]"
                    : "text-[color:var(--color-ink-strong)] hover:bg-black/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border bg-white",
                    active
                      ? "border-[rgba(184,137,67,0.36)] text-[color:var(--color-accent-strong)] shadow-[0_8px_18px_rgba(184,137,67,0.16)]"
                      : "border-black/8 text-[color:var(--color-ink-strong)]"
                  )}
                >
                  <BarIcon icon={action.icon} />
                </span>
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] leading-none">
                  {action.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-0.5 w-8 rounded-full bg-transparent",
                    active ? "bg-[var(--color-accent-gold)]" : ""
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
