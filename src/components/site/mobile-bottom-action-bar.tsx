"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import {
  CalculatorIcon,
  KundliIcon,
  PanchangIcon,
} from "@/components/icons/astrology-icons";
import {
  buildLocalizedToolsNavigation,
  type ToolsNavigationGroup,
  type ToolsNavigationModel,
} from "@/components/site/tools-navigation-data";
import { defaultLocale, getLocalizedPath, type SupportedLocale } from "@/modules/localization/config";
import { cn } from "@/lib/cn";

type BottomLinkAction = {
  type: "link";
  label: string;
  href: string;
  icon: "home" | "kundli" | "panchang";
};

type BottomToolsAction = {
  type: "tools";
  label: string;
  icon: "tools";
};

type BottomMoreAction = {
  type: "more";
  label: string;
  icon: "more";
};

type BottomAction = BottomLinkAction | BottomToolsAction | BottomMoreAction;

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

function matchesToolQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function filterToolsNavigation(
  navigation: ToolsNavigationModel,
  query: string,
): ToolsNavigationModel {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return navigation;
  }

  const groups: ToolsNavigationGroup[] = navigation.groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          matchesToolQuery(item.label, normalizedQuery) ||
          matchesToolQuery(item.description, normalizedQuery) ||
          matchesToolQuery(group.title, normalizedQuery),
      ),
    }))
    .filter((group) => group.items.length > 0);
  const popularTools = navigation.popularTools.filter((item) =>
    matchesToolQuery(`${item.label} ${item.description}`, normalizedQuery),
  );

  return {
    ...navigation,
    popularTools,
    groups,
  };
}

function getShellAccentClass({
  href,
  key,
  label,
}: {
  href?: string;
  key?: string;
  label?: string;
}) {
  const value = `${href ?? ""} ${key ?? ""} ${label ?? ""}`.toLowerCase();

  if (value.includes("/ai") || value.includes("ask-ni") || value.includes("ask ni")) {
    return "border-[rgba(0,109,255,0.42)] bg-[rgba(0,215,255,0.08)] text-[color:var(--color-text-primary)] shadow-[0_8px_22px_rgba(0,109,255,0.1)] hover:border-[rgba(0,109,255,0.58)] hover:bg-[rgba(0,215,255,0.12)]";
  }

  if (value.includes("remedies")) {
    return "border-[rgba(16,132,95,0.32)] bg-white text-[color:var(--color-text-primary)] hover:border-[rgba(16,132,95,0.52)] hover:bg-[rgba(16,132,95,0.08)]";
  }

  if (value.includes("muhurat") || value.includes("articles")) {
    return "border-[rgba(224,173,31,0.34)] bg-white text-[color:var(--color-text-primary)] hover:border-[rgba(224,173,31,0.56)] hover:bg-[rgba(224,173,31,0.09)]";
  }

  if (
    value.includes("consultation") ||
    value.includes("from-the-desk") ||
    value.includes("desk")
  ) {
    return "border-[rgba(122,16,34,0.28)] bg-white text-[color:var(--color-text-primary)] hover:border-[rgba(122,16,34,0.5)] hover:bg-[rgba(122,16,34,0.07)]";
  }

  if (value.includes("reports")) {
    return "border-[rgba(185,139,70,0.3)] bg-[color:var(--color-report-pearl)] text-[color:var(--color-text-primary)] hover:border-[rgba(185,139,70,0.5)] hover:bg-white";
  }

  if (value.includes("dosha")) {
    return "border-[rgba(217,74,61,0.3)] bg-white text-[color:var(--color-text-primary)] hover:border-[rgba(217,74,61,0.52)] hover:bg-[rgba(217,74,61,0.07)]";
  }

  return "border-[rgba(185,139,70,0.22)] bg-white text-[color:var(--color-text-primary)] hover:border-[rgba(185,139,70,0.42)] hover:bg-[rgba(185,139,70,0.08)]";
}

export function MobileBottomActionBar({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<MobileBottomActionBarProps>) {
  const pathname = normalizePathname(usePathname());
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsQuery, setToolsQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const toolsMenuTitleId = useId();
  const moreMenuTitleId = useId();

  const homeHref = localizeHref(locale, hasExplicitLocalePrefix, "/");
  const toolsHref = localizeHref(locale, hasExplicitLocalePrefix, "/tools");
  const kundliHref = localizeHref(locale, hasExplicitLocalePrefix, "/kundli");
  const panchangHref = localizeHref(locale, hasExplicitLocalePrefix, "/panchang");
  const toolsNavigation = useMemo(
    () =>
      buildLocalizedToolsNavigation((href) =>
        localizeHref(locale, hasExplicitLocalePrefix, href),
      ),
    [locale, hasExplicitLocalePrefix],
  );
  const filteredToolsNavigation = useMemo(
    () => filterToolsNavigation(toolsNavigation, toolsQuery),
    [toolsNavigation, toolsQuery],
  );

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
    if (!toolsOpen && !moreOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setToolsOpen(false);
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
  }, [toolsOpen, moreOpen]);

  const bottomActions: readonly BottomAction[] = [
    { type: "link", label: "Home", href: homeHref, icon: "home" },
    { type: "link", label: "Kundli", href: kundliHref, icon: "kundli" },
    { type: "link", label: "Panchang", href: panchangHref, icon: "panchang" },
    { type: "tools", label: "Tools", icon: "tools" },
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
      title: "Services and learning",
      links: [
        { label: "Consultation", href: localizeHref(locale, hasExplicitLocalePrefix, "/consultation") },
        { label: "Shop", href: localizeHref(locale, hasExplicitLocalePrefix, "/shop") },
        { label: "Articles", href: localizeHref(locale, hasExplicitLocalePrefix, "/articles") },
        { label: "From the Desk", href: localizeHref(locale, hasExplicitLocalePrefix, "/from-the-desk") },
      ],
    },
    {
      title: "Company / Support",
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

  const closeToolsAfterRouteSelection = () => {
    window.setTimeout(() => setToolsOpen(false), 0);
  };

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
            className="fixed inset-0 z-40 bg-black/18 xl:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div
            id={moreMenuTitleId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${moreMenuTitleId}-title`}
            className="fixed inset-x-3 bottom-[calc(6.15rem+env(safe-area-inset-bottom))] z-[60] max-h-[min(68vh,32rem)] overflow-y-auto rounded-[1.35rem] border border-[rgba(185,139,70,0.32)] bg-white p-4 shadow-[0_22px_60px_rgba(5,5,5,0.18)] backdrop-blur-xl xl:hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id={`${moreMenuTitleId}-title`}
                  className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-antique-gold-dark)]"
                >
                  More
                </p>
                <p className="mt-1 text-[0.82rem] leading-5 text-[color:var(--color-text-secondary)]">
                  Daily guidance, services, learning, account and support.
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
                  <p className="px-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-antique-gold-dark)]">
                    {section.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {section.links.map((link) => (
                      <Link
                        key={`${section.title}-${link.href}`}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "min-h-11 rounded-[var(--radius-lg)] border px-3 py-2 text-[0.78rem] font-semibold shadow-[0_8px_22px_rgba(5,5,5,0.05)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
                          getShellAccentClass(link),
                        )}
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
      {toolsOpen ? (
        <>
          <button
            type="button"
            aria-label="Close Tools drawer"
            className="fixed inset-0 z-40 bg-black/18 xl:hidden"
            onClick={() => setToolsOpen(false)}
          />
          <div
            id={toolsMenuTitleId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${toolsMenuTitleId}-title`}
            className="fixed inset-x-3 bottom-[calc(6.15rem+env(safe-area-inset-bottom))] top-[4.75rem] z-[60] overflow-y-auto rounded-[1.35rem] border border-[rgba(185,139,70,0.32)] bg-white p-4 shadow-[0_22px_60px_rgba(5,5,5,0.18)] backdrop-blur-xl xl:hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id={`${toolsMenuTitleId}-title`}
                  className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-antique-gold-dark)]"
                >
                  NAVAGRAHA Tools
                </p>
                <p className="mt-1 text-[0.82rem] leading-5 text-[color:var(--color-text-secondary)]">
                  Vedic astrology utilities and guidance.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[color:var(--color-ink-strong)]"
                aria-label="Close Tools drawer"
                onClick={() => setToolsOpen(false)}
              >
                <span aria-hidden="true">X</span>
              </button>
            </div>

            <label className="mt-4 block">
              <span className="sr-only">Find a tool</span>
              <input
                type="search"
                value={toolsQuery}
                onChange={(event) => setToolsQuery(event.target.value)}
                placeholder="Find a tool"
                className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/10 bg-white px-3 text-[0.82rem] text-[color:var(--color-ink-strong)] outline-none transition placeholder:text-[color:var(--color-ink-muted)] focus:border-[rgba(185,139,70,0.5)] focus:ring-2 focus:ring-[color:var(--color-accent-ring)]"
              />
            </label>

            <div className="mt-4 grid gap-5">
              <section className="grid gap-2">
                  <p className="px-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-antique-gold-dark)]">
                  Quick access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {filteredToolsNavigation.popularTools.map((item) => (
                    <Link
                      key={`mobile-popular-${item.key}`}
                      href={item.href}
                      onClick={() => setToolsOpen(false)}
                      className={cn(
                        "min-h-11 rounded-[var(--radius-lg)] border px-3 py-2 text-[0.78rem] font-semibold shadow-[0_8px_22px_rgba(5,5,5,0.05)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
                        getShellAccentClass(item),
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>

              {filteredToolsNavigation.groups.length ? (
                filteredToolsNavigation.groups.map((section) => (
                  <section key={`mobile-tools-${section.key}`} className="grid gap-2">
                    <div className="px-1">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-antique-gold-dark)]">
                        {section.title}
                      </p>
                      <p className="mt-1 text-[0.72rem] leading-4 text-[color:var(--color-text-secondary)]">
                        {section.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {section.items.map((link) => (
                        <Link
                          key={`mobile-tools-${section.key}-${link.key}`}
                          href={link.href}
                          onClick={() => setToolsOpen(false)}
                          className={cn(
                            "min-h-11 rounded-[var(--radius-lg)] border px-3 py-2 text-[0.78rem] font-semibold shadow-[0_8px_22px_rgba(5,5,5,0.05)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
                            getShellAccentClass(link),
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <p className="rounded-[var(--radius-lg)] border border-black/8 bg-white px-4 py-3 text-[0.82rem] text-[color:var(--color-ink-body)]">
                  No matching tools found.
                </p>
              )}

              <Link
                href={toolsNavigation.allToolsHref}
                onClick={closeToolsAfterRouteSelection}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(185,139,70,0.42)] bg-[rgba(185,139,70,0.1)] px-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-accent-strong)] transition hover:bg-[rgba(185,139,70,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              >
                View all tools
              </Link>
            </div>
          </div>
        </>
      ) : null}
      <nav
        aria-label="Mobile quick actions"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(185,139,70,0.34)] bg-white shadow-[0_-14px_34px_rgba(5,5,5,0.1)] backdrop-blur-xl xl:hidden"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-5 px-1.5 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5">
          {bottomActions.map((action) => {
            const active =
              action.type === "more"
                ? moreOpen
                : action.type === "tools"
                  ? toolsOpen || isActiveHref(pathname, toolsHref)
                  : isActiveHref(pathname, action.href);
            const actionClassName = cn(
              "flex min-w-0 flex-col items-center gap-1.25 rounded-[1.1rem] px-1.5 py-2 text-center transition [transition-duration:var(--motion-duration-base)]",
              active
                ? "bg-[rgba(184,137,67,0.1)] text-[color:var(--color-accent-strong)]"
                : "text-[color:var(--color-ink-strong)] hover:bg-[rgba(185,139,70,0.08)]"
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
                  onClick={() => {
                    setToolsOpen(false);
                    setMoreOpen((current) => !current);
                  }}
                >
                  {content}
                </button>
              );
            }

            if (action.type === "tools") {
              return (
                <button
                  key={action.label}
                  type="button"
                  aria-expanded={toolsOpen}
                  aria-controls={toolsMenuTitleId}
                  className={actionClassName}
                  onClick={() => {
                    setMoreOpen(false);
                    setToolsOpen((current) => !current);
                  }}
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
