"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { stripLocaleFromPathname } from "@/modules/localization/config";
import type { ToolsNavigationModel } from "@/components/site/tools-navigation-data";

type ToolsMegaMenuProps = {
  navigation: ToolsNavigationModel;
};

function getPathnameFromHref(href: string) {
  try {
    return new URL(href, "https://navagraha.local").pathname;
  } catch {
    return href.startsWith("/") ? href : `/${href}`;
  }
}

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function ToolsMegaMenu({ navigation }: Readonly<ToolsMegaMenuProps>) {
  const pathname = usePathname();
  const currentPath = stripLocaleFromPathname(pathname ?? "/");
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toolsPath = stripLocaleFromPathname(getPathnameFromHref(navigation.allToolsHref));
  const toolsActive =
    currentPath === toolsPath || currentPath.startsWith(`${toolsPath}/`) || open;

  const filteredNavigation = useMemo(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return navigation;
    }

    const groups = navigation.groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            matchesQuery(item.label, normalizedQuery) ||
            matchesQuery(item.description, normalizedQuery) ||
            matchesQuery(group.title, normalizedQuery),
        ),
      }))
      .filter((group) => group.items.length > 0);
    const popularTools = navigation.popularTools.filter((item) =>
      matchesQuery(`${item.label} ${item.description}`, normalizedQuery),
    );

    return {
      ...navigation,
      popularTools,
      groups,
    };
  }, [navigation, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          "inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal rounded-none border-x-transparent border-t-transparent border-b-[2px] border-b-transparent bg-transparent px-1.5 text-center text-[0.64rem] font-medium uppercase leading-[1.2] tracking-[0.1em] !text-[color:var(--color-ink-strong)] shadow-none transition [transition-duration:var(--motion-duration-base)] hover:bg-transparent hover:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-ivory)] 2xl:px-2.5",
          toolsActive &&
            "border-b-[var(--color-accent-gold)] !text-black",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        Tools
        <span aria-hidden="true" className="text-[0.62rem]">
          {open ? "^" : "v"}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          className="fixed left-1/2 top-[9rem] z-[70] w-[min(74rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[1.35rem] border border-black/10 bg-[rgba(255,254,250,0.98)] p-4 text-left shadow-[0_24px_70px_rgba(17,24,39,0.18)] backdrop-blur-xl"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(16rem,0.74fr)_minmax(0,1.26fr)]">
            <div className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_10px_26px_rgba(17,24,39,0.05)]">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-trust-text)]">
                NAVAGRAHA Tools
              </p>
              <p className="mt-2 text-[0.86rem] leading-5 text-[color:var(--color-ink-body)]">
                Vedic astrology utilities and guidance.
              </p>
              <label className="mt-4 block">
                <span className="sr-only">Find a tool</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a tool"
                  className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/10 bg-white px-3 text-[0.82rem] text-[color:var(--color-ink-strong)] outline-none transition placeholder:text-[color:var(--color-ink-muted)] focus:border-[rgba(185,139,70,0.5)] focus:ring-2 focus:ring-[color:var(--color-accent-ring)]"
                />
              </label>
              <Link
                href={navigation.allToolsHref}
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(185,139,70,0.42)] bg-[rgba(185,139,70,0.1)] px-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-accent-strong)] transition hover:bg-[rgba(185,139,70,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              >
                View all tools
              </Link>
            </div>

            <div className="grid gap-4">
              <section className="grid gap-2">
                <p className="px-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
                  Popular Tools
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {filteredNavigation.popularTools.map((item) => (
                    <Link
                      key={`desktop-popular-${item.key}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="min-h-12 rounded-[var(--radius-lg)] border border-black/8 bg-white px-3 py-2 text-[0.74rem] font-semibold text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)] transition hover:border-[rgba(185,139,70,0.34)] hover:bg-[rgba(185,139,70,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>

              {filteredNavigation.groups.length ? (
                <div className="grid max-h-[min(68vh,35rem)] gap-3 overflow-y-auto pr-1 lg:grid-cols-2">
                  {filteredNavigation.groups.map((group) => (
                    <section
                      key={`desktop-tools-${group.key}`}
                      className="rounded-[1.1rem] border border-black/8 bg-white p-3 shadow-[0_8px_22px_rgba(17,24,39,0.04)]"
                    >
                      <p className="text-[0.72rem] font-semibold text-[color:var(--color-ink-strong)]">
                        {group.title}
                      </p>
                      <p className="mt-1 text-[0.68rem] leading-4 text-[color:var(--color-ink-muted)]">
                        {group.description}
                      </p>
                      <div className="mt-3 grid gap-1.5">
                        {group.items.map((item) => (
                          <Link
                            key={`desktop-tools-${group.key}-${item.key}`}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="rounded-[0.85rem] px-2.5 py-2 text-[0.74rem] font-semibold text-[color:var(--color-ink-strong)] transition hover:bg-[rgba(185,139,70,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="rounded-[var(--radius-lg)] border border-black/8 bg-white px-4 py-3 text-[0.82rem] text-[color:var(--color-ink-body)]">
                  No matching tools found.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
