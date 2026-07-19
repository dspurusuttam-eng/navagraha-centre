"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
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
  /**
   * "primary" renders the MVP destinations as prominent icon rows; "compact"
   * renders supporting links as quieter text rows so the drawer keeps a clear
   * hierarchy instead of one long undifferentiated list.
   */
  variant?: "primary" | "compact";
};

type SiteDrawerProps = {
  accountItems: readonly SiteDrawerItem[];
  currentLocale: string;
  groups: readonly SiteDrawerGroup[];
  triggerClassName?: string;
  triggerLabel: string;
  triggerContent: ReactNode;
};

/** Marks the history entry pushed while the drawer is open. */
const DRAWER_HISTORY_KEY = "navagrahaDrawer";

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
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(185,139,70,0.2)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_rgba(17,17,17,0.05)]"
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
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(185,139,70,0.2)] bg-[rgba(185,139,70,0.08)] text-[0.7rem] font-bold uppercase text-[var(--color-antique-gold-dark)]"
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
  // Drives the enter transition: the panel mounts offscreen, then animates in on
  // the next frame. Closing unmounts immediately so dismissal always feels instant.
  const [entered, setEntered] = useState(false);
  const drawerId = useId();
  const titleId = `${drawerId}-title`;
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pushedHistoryRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = stripLocaleFromPathname(pathname ?? "/");

  // Lock background scrolling without shifting layout: the scrollbar width is
  // returned as padding so desktop content cannot jump when the drawer opens.
  useEffect(() => {
    if (!open) {
      return;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(
        window.getComputedStyle(body).paddingRight || "0"
      );
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  // Move focus into the panel once it is on screen.
  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setEntered(true);
      panelRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  /** Single dismissal path so the enter transition always resets with the panel. */
  const dismiss = useCallback(() => {
    setEntered(false);
    setOpen(false);
  }, []);

  // Android system Back (and browser Back) must dismiss the drawer before it
  // leaves the page: opening pushes a throwaway history entry that Back pops.
  useEffect(() => {
    if (!open) {
      return;
    }

    window.history.pushState({ [DRAWER_HISTORY_KEY]: true }, "");
    pushedHistoryRef.current = true;

    const handlePopState = () => {
      pushedHistoryRef.current = false;
      dismiss();
      triggerRef.current?.focus();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [open, dismiss]);

  const closeDrawer = useCallback(() => {
    if (pushedHistoryRef.current) {
      // Pop our own entry; the popstate handler closes the drawer and keeps the
      // history stack clean so a later Back does not replay the same page.
      pushedHistoryRef.current = false;
      window.history.back();
      return;
    }

    dismiss();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [dismiss]);

  /**
   * Navigating from the drawer first unwinds the drawer's history entry, then
   * routes — otherwise the stack keeps a duplicate of the originating page.
   */
  const navigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (
        !pushedHistoryRef.current ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.button !== 0
      ) {
        dismiss();
        return;
      }

      event.preventDefault();
      pushedHistoryRef.current = false;
      dismiss();

      let settled = false;
      const go = () => {
        if (settled) return;
        settled = true;
        window.removeEventListener("popstate", go);
        router.push(href);
      };

      window.addEventListener("popstate", go, { once: true });
      window.history.back();
      // Safety net: never strand a tap if popstate is delayed or suppressed.
      window.setTimeout(go, 120);
    },
    [dismiss, router]
  );

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

  const renderItem = (
    item: SiteDrawerItem,
    keyPrefix: string,
    variant: "primary" | "compact"
  ) => {
    const targetPath = stripLocaleFromPathname(getPathnameFromHref(item.href));
    const isActive =
      targetPath === "/"
        ? currentPath === "/"
        : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

    return (
      <Link
        key={`${keyPrefix}-${item.href}`}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-lg)] border font-bold uppercase text-[#111111] transition-colors [transition-duration:var(--motion-duration-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]",
          variant === "primary"
            ? "min-h-[3.25rem] border-[rgba(185,139,70,0.18)] bg-white px-3 py-2.5 text-[0.8rem] tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.04)] hover:border-[rgba(185,139,70,0.38)] hover:bg-[rgba(185,139,70,0.06)]"
            : "min-h-[2.9rem] border-transparent px-3 py-2 text-[0.74rem] tracking-[0.07em] text-[#1a1a1a] hover:border-[rgba(185,139,70,0.22)] hover:bg-[rgba(185,139,70,0.05)]",
          isActive &&
            "border-[rgba(185,139,70,0.42)] bg-[rgba(185,139,70,0.08)] text-black"
        )}
        href={item.href}
        // Primary destinations render dynamically, so "auto" prefetch would only
        // warm the loading shell. The drawer is only mounted while open, so
        // fetching the full payload here is targeted rather than wasteful.
        prefetch={variant === "primary" && !isActive ? true : undefined}
        onClick={(event) => navigate(event, item.href)}
      >
        {variant === "primary" ? (
          <DrawerIcon iconName={item.iconName} label={item.label} />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              isActive
                ? "bg-[var(--color-antique-gold-dark)]"
                : "bg-[rgba(185,139,70,0.35)]"
            )}
          />
        )}
        <span className="min-w-0 truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        aria-controls={open ? drawerId : undefined}
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
            className={cn(
              "pointer-events-auto absolute inset-0 z-0 h-full w-full cursor-default bg-[rgba(5,5,5,0.28)] transition-opacity duration-150 ease-out motion-reduce:transition-none",
              entered ? "opacity-100" : "opacity-0"
            )}
            type="button"
            onClick={closeDrawer}
          />
          <div
            ref={panelRef}
            aria-labelledby={titleId}
            aria-modal="true"
            className={cn(
              "pointer-events-auto relative z-10 flex h-[100dvh] w-[min(100vw,25rem)] flex-col overflow-y-auto overscroll-contain border-r border-[rgba(185,139,70,0.2)] bg-white px-4 shadow-[0_18px_40px_rgba(5,5,5,0.12)] outline-none transition-transform duration-[160ms] ease-out will-change-transform motion-reduce:transition-none sm:px-5",
              entered ? "translate-x-0" : "-translate-x-full"
            )}
            id={drawerId}
            role="dialog"
            style={{
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(185,139,70,0.18)] pb-4">
              <p
                className="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#111111]"
                id={titleId}
              >
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
              className="grid gap-6 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] xl:pb-5"
            >
              {groups.map((group) => {
                const variant = group.variant ?? "primary";

                return (
                  <section key={group.title} className="grid gap-2">
                    <h2 className="px-1 text-[0.64rem] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                      {group.title}
                    </h2>
                    <div className={variant === "primary" ? "grid gap-1.5" : "grid gap-0.5"}>
                      {group.items.map((item) =>
                        renderItem(item, group.title, variant)
                      )}
                    </div>
                  </section>
                );
              })}

              <section className="grid gap-2 border-t border-[rgba(185,139,70,0.18)] pt-5">
                <h2 className="px-1 text-[0.64rem] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                  LANGUAGE
                </h2>
                <LanguageSwitcher currentLocale={currentLocale} variant="inline" />
              </section>

              {accountItems.length > 0 ? (
                <section className="grid gap-2 border-t border-[rgba(185,139,70,0.18)] pt-5">
                  <h2 className="px-1 text-[0.64rem] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-antique-gold-dark)]">
                    ACCOUNT
                  </h2>
                  <div className="grid gap-1.5">
                    {accountItems.map((item) =>
                      renderItem(item, "account", "primary")
                    )}
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
