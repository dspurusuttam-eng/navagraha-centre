"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import {
  navagrahaIconRegistry,
  type NavagrahaIconRegistryKey,
} from "@/components/icons/navagraha-icon-registry";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { stripLocaleFromPathname } from "@/modules/localization/config";

export type SiteDrawerItem = {
  href: string;
  iconName?: NavagrahaIconRegistryKey | null;
  label: string;
};

export type SiteDrawerGroup = {
  items: readonly SiteDrawerItem[];
  title: string;
};

type SiteDrawerProps = {
  accountItems: readonly SiteDrawerItem[];
  currentLocale: string;
  groups: readonly SiteDrawerGroup[];
  triggerClassName?: string;
  triggerLabel: string;
  triggerContent: ReactNode;
};

function getPathnameFromHref(href: string) {
  try {
    return new URL(href, "https://navagraha.local").pathname;
  } catch {
    return href.startsWith("/") ? href : `/${href}`;
  }
}

function DrawerIcon({
  iconName,
  label,
}: {
  iconName?: NavagrahaIconRegistryKey | null;
  label: string;
}) {
  const icon = iconName
    ? navagrahaIconRegistry.find(
        (entry) =>
          entry.featureName === iconName &&
          entry.availabilityStatus === "available" &&
          entry.repositoryPath
      )
    : null;

  if (icon?.repositoryPath) {
    return (
      <span
        aria-hidden="true"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(185,139,70,0.2)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(17,17,17,0.05)]"
      >
        <Image
          alt=""
          className="h-5 w-5 object-contain"
          height={20}
          src={icon.repositoryPath}
          width={20}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(185,139,70,0.2)] bg-[rgba(185,139,70,0.08)] text-[0.68rem] font-bold uppercase text-[var(--color-antique-gold-dark)]"
    >
      {label.slice(0, 1)}
    </span>
  );
}

export function SiteDrawer({
  accountItems,
  currentLocale,
  groups,
  triggerClassName,
  triggerContent,
  triggerLabel,
}: Readonly<SiteDrawerProps>) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const currentPath = stripLocaleFromPathname(pathname ?? "/");

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function closeDrawer() {
    setOpen(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
    ).filter((element) => !element.hasAttribute("disabled"));

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        aria-controls={drawerId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={triggerLabel}
        className={triggerClassName}
        type="button"
        onClick={() => setOpen(true)}
      >
        {triggerContent}
      </button>

      {open ? (
        <div
          className="pointer-events-none fixed inset-0 isolate z-[80]"
          role="presentation"
        >
          <button
            aria-label="Close menu"
            className="pointer-events-auto absolute inset-0 z-0 h-full w-full cursor-default bg-[rgba(5,5,5,0.2)]"
            type="button"
            onClick={closeDrawer}
          />
          <div
            ref={panelRef}
            aria-label="Site menu"
            aria-modal="true"
            className="pointer-events-auto relative z-10 flex h-[100dvh] w-[min(100vw,25rem)] flex-col overflow-y-auto border-r border-[rgba(185,139,70,0.2)] bg-white p-4 shadow-[0_18px_40px_rgba(5,5,5,0.12)] sm:p-5"
            id={drawerId}
            role="dialog"
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(185,139,70,0.18)] pb-4">
              <p className="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#111111]">
                NAVAGRAHA
              </p>
              <button
                className={buttonStyles({
                  tone: "tertiary",
                  size: "sm",
                  className: "h-11 min-h-11 w-11 px-0",
                })}
                type="button"
                onClick={closeDrawer}
              >
                <span className="sr-only">Close menu</span>
                <span aria-hidden="true" className="text-lg leading-none">
                  X
                </span>
              </button>
            </div>

            {/* Bottom padding must clear the fixed mobile action dock (z-50, xl:hidden) so the
                last drawer sections (Language, Account) stay reachable; same clearance
                convention as the footer. */}
            <nav
              aria-label="Site navigation"
              className="grid gap-5 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] xl:pb-5"
            >
              {groups.map((group) => (
                <section key={group.title} className="grid gap-2">
                  <h2 className="px-1 text-[0.64rem] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                    {group.title}
                  </h2>
                  <div className="grid gap-1.5">
                    {group.items.map((item) => {
                      const targetPath = stripLocaleFromPathname(
                        getPathnameFromHref(item.href)
                      );
                      const isActive =
                        targetPath === "/"
                          ? currentPath === "/"
                          : currentPath === targetPath ||
                            currentPath.startsWith(`${targetPath}/`);

                      return (
                        <Link
                          key={`${group.title}-${item.href}`}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.18)] bg-white px-3 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.04)] transition hover:border-[rgba(185,139,70,0.38)] hover:bg-[rgba(185,139,70,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
                            isActive &&
                              "border-[rgba(185,139,70,0.42)] bg-[rgba(185,139,70,0.08)]"
                          )}
                          href={item.href}
                          onClick={() => setOpen(false)}
                        >
                          <DrawerIcon
                            iconName={item.iconName}
                            label={item.label}
                          />
                          <span className="min-w-0 truncate">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}

              <section className="grid gap-2 border-t border-[rgba(185,139,70,0.18)] pt-5">
                <h2 className="px-1 text-[0.64rem] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                  LANGUAGE
                </h2>
                <LanguageSwitcher
                  currentLocale={currentLocale}
                  variant="inline"
                />
              </section>

              {accountItems.length > 0 ? (
                <section className="grid gap-2 border-t border-[rgba(185,139,70,0.18)] pt-5">
                  <h2 className="px-1 text-[0.64rem] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                    ACCOUNT
                  </h2>
                  <div className="grid gap-1.5">
                    {accountItems.map((item) => {
                      const targetPath = stripLocaleFromPathname(
                        getPathnameFromHref(item.href)
                      );
                      const isActive =
                        targetPath === "/"
                          ? currentPath === "/"
                          : currentPath === targetPath ||
                            currentPath.startsWith(`${targetPath}/`);

                      return (
                        <Link
                          key={`account-${item.href}`}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.18)] bg-white px-3 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.04)] transition hover:border-[rgba(185,139,70,0.38)] hover:bg-[rgba(185,139,70,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
                            isActive &&
                              "border-[rgba(185,139,70,0.42)] bg-[rgba(185,139,70,0.08)]"
                          )}
                          href={item.href}
                          onClick={() => setOpen(false)}
                        >
                          <DrawerIcon
                            iconName={item.iconName}
                            label={item.label}
                          />
                          <span className="min-w-0 truncate">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
