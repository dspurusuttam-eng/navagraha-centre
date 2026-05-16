"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  CalculatorIcon,
  KundliIcon,
  PanchangIcon,
} from "@/components/icons/astrology-icons";
import { defaultLocale, getLocalizedPath, type SupportedLocale } from "@/modules/localization/config";
import { cn } from "@/lib/cn";

type BottomLinkAction = {
  type: "link";
  label: string;
  href: string;
  icon: "home" | "kundli" | "panchang" | "tools";
};

type BottomMoreAction = {
  type: "more";
  label: string;
  icon: "more";
};

type BottomAction = BottomLinkAction | BottomMoreAction;

type MoreSection = {
  title: string;
  links: readonly {
    label: string;
    href: string;
  }[];
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

function MoreGlyph() {
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
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h14" />
    </svg>
  );
}

function BarIcon({ icon }: Readonly<{ icon: BottomAction["icon"] }>) {
  switch (icon) {
    case "home":
      return <HomeGlyph />;
    case "kundli":
      return <KundliIcon className="h-9 w-9" />;
    case "panchang":
      return <PanchangIcon className="h-9 w-9" />;
    case "tools":
      return <CalculatorIcon className="h-9 w-9" />;
    case "more":
    default:
      return <MoreGlyph />;
  }
}

function isActiveHref(pathname: string, href: string) {
  const normalizedHref = normalizePathname(href);

  return normalizedHref === "/"
    ? pathname === normalizedHref || pathname === `${normalizedHref}/`
    : pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}

export function MobileBottomActionBar({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<MobileBottomActionBarProps>) {
  const pathname = normalizePathname(usePathname());
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuTitleId = useId();

  const homeHref = localizeHref(locale, hasExplicitLocalePrefix, "/");
  const toolsHref = localizeHref(locale, hasExplicitLocalePrefix, "/tools");
  const kundliHref = localizeHref(locale, hasExplicitLocalePrefix, "/kundli");
  const panchangHref = localizeHref(locale, hasExplicitLocalePrefix, "/panchang");

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

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  const bottomActions: readonly BottomAction[] = [
    { type: "link", label: "Home", href: homeHref, icon: "home" },
    { type: "link", label: "Kundli", href: kundliHref, icon: "kundli" },
    { type: "link", label: "Panchang", href: panchangHref, icon: "panchang" },
    { type: "link", label: "Tools", href: toolsHref, icon: "tools" },
    { type: "more", label: "More", icon: "more" },
  ];

  const moreSections: readonly MoreSection[] = [
    {
      title: "Daily guidance",
      links: [
        { label: "Rashifal", href: localizeHref(locale, hasExplicitLocalePrefix, "/rashifal") },
        { label: "Ask NI", href: localizeHref(locale, hasExplicitLocalePrefix, "/ai") },
        { label: "Reports", href: localizeHref(locale, hasExplicitLocalePrefix, "/reports") },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Consultation", href: localizeHref(locale, hasExplicitLocalePrefix, "/consultation") },
        { label: "Shop", href: localizeHref(locale, hasExplicitLocalePrefix, "/shop") },
        { label: "Articles", href: localizeHref(locale, hasExplicitLocalePrefix, "/articles") },
        { label: "From the Desk", href: localizeHref(locale, hasExplicitLocalePrefix, "/from-the-desk") },
      ],
    },
    {
      title: "Account and policies",
      links: [
        { label: "Sign-in", href: localizeHref(locale, hasExplicitLocalePrefix, "/sign-in") },
        { label: "About", href: localizeHref(locale, hasExplicitLocalePrefix, "/about") },
        { label: "Contact", href: localizeHref(locale, hasExplicitLocalePrefix, "/contact") },
        { label: "Privacy", href: localizeHref(locale, hasExplicitLocalePrefix, "/privacy") },
        { label: "Terms", href: localizeHref(locale, hasExplicitLocalePrefix, "/terms") },
        { label: "Disclaimer", href: localizeHref(locale, hasExplicitLocalePrefix, "/disclaimer") },
        { label: "Refund", href: localizeHref(locale, hasExplicitLocalePrefix, "/refund-cancellation") },
      ],
    },
  ];

  if (hideForPaths.has(pathname)) {
    return null;
  }

  return (
    <>
      {moreOpen ? (
        <>
          <button
            type="button"
            aria-label="Close More menu"
            className="fixed inset-0 z-40 bg-black/18 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div
            id={moreMenuTitleId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${moreMenuTitleId}-title`}
            className="fixed inset-x-3 bottom-[calc(6.15rem+env(safe-area-inset-bottom))] z-[60] max-h-[min(68vh,32rem)] overflow-y-auto rounded-[1.35rem] border border-black/10 bg-[rgba(255,254,250,0.98)] p-4 shadow-[0_22px_60px_rgba(17,24,39,0.22)] backdrop-blur-xl md:hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id={`${moreMenuTitleId}-title`}
                  className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-trust-text)]"
                >
                  More
                </p>
                <p className="mt-1 text-[0.82rem] leading-5 text-[color:var(--color-ink-body)]">
                  Daily guidance, services, learning, account and policies.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[color:var(--color-ink-strong)]"
                aria-label="Close More menu"
                onClick={() => setMoreOpen(false)}
              >
                <span aria-hidden="true">X</span>
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              {moreSections.map((section) => (
                <div key={section.title} className="grid gap-2">
                  <p className="px-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
                    {section.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {section.links.map((link) => (
                      <Link
                        key={`${section.title}-${link.href}`}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className="min-h-11 rounded-[var(--radius-lg)] border border-black/8 bg-white px-3 py-2 text-[0.78rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_8px_22px_rgba(17,24,39,0.05)] transition hover:border-[rgba(185,139,70,0.34)] hover:bg-[rgba(185,139,70,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
      <nav
        aria-label="Mobile quick actions"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/12 bg-white shadow-[0_-14px_34px_rgba(17,24,39,0.12)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-5 px-1.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5">
          {bottomActions.map((action) => {
            const active =
              action.type === "more" ? moreOpen : isActiveHref(pathname, action.href);
            const actionClassName = cn(
              "flex min-w-0 flex-col items-center gap-1.25 rounded-[1.1rem] px-1.5 py-2 text-center transition [transition-duration:var(--motion-duration-base)]",
              active
                ? "bg-[rgba(184,137,67,0.1)] text-[color:var(--color-accent-strong)]"
                : "text-[color:var(--color-ink-strong)] hover:bg-black/5"
            );
            const iconClassName = cn(
              "flex h-10 w-10 items-center justify-center rounded-full border bg-white",
              active
                ? "border-[rgba(184,137,67,0.4)] text-[color:var(--color-accent-strong)] shadow-[0_8px_18px_rgba(184,137,67,0.18)]"
                : "border-black/12 text-[color:var(--color-ink-strong)]"
            );
            const content = (
              <>
                <span className={iconClassName}>
                  <BarIcon icon={action.icon} />
                </span>
                <span className="text-[0.58rem] font-semibold uppercase tracking-[0.035em] leading-none text-[color:var(--color-ink-strong)] sm:text-[0.64rem]">
                  {action.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-0.5 w-8 rounded-full bg-transparent",
                    active ? "bg-[var(--color-accent-gold)]" : ""
                  )}
                />
              </>
            );

            if (action.type === "more") {
              return (
                <button
                  key={action.label}
                  type="button"
                  aria-expanded={moreOpen}
                  aria-controls={moreMenuTitleId}
                  className={actionClassName}
                  onClick={() => setMoreOpen((current) => !current)}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={action.label}
                href={action.href}
                aria-current={active ? "page" : undefined}
                className={actionClassName}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
