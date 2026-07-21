"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "@/lib/analytics/track-event";
import {
  defaultLocale,
  detectLocaleFromPathname,
  getLocalizedPath,
} from "@/modules/localization/config";

type FeedItem = {
  slug: string;
  title: string;
  path: string;
  publishedAt: string | null;
};

const LAST_SEEN_KEY = "nvg-notifications-last-seen";

function readLastSeen(): number {
  try {
    const value = window.localStorage.getItem(LAST_SEEN_KEY);
    return value ? Number(value) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeLastSeen(at: number) {
  try {
    window.localStorage.setItem(LAST_SEEN_KEY, String(at));
  } catch {
    /* private mode */
  }
}

type PushState = "unsupported" | "default" | "granted" | "denied" | "subscribed";

/**
 * Notification bell (left of Search). The centre itself works with no push
 * permission at all — it lists recently published Desk articles with an unread
 * badge from a local last-seen timestamp. Push is strictly opt-in via the
 * Enable button (permission is only ever requested after that tap).
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [pushState, setPushState] = useState<PushState>("unsupported");
  const [pushBusy, setPushBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pushedHistoryRef = useRef(false);
  const headingId = useId();
  const pathname = usePathname();
  const locale = detectLocaleFromPathname(pathname ?? "/") ?? defaultLocale;

  // Feed + unread badge (badge needs the feed, so one fetch serves both).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/desk/notifications")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { ok?: boolean; items?: FeedItem[] } | null) => {
        if (cancelled || !data?.ok || !Array.isArray(data.items)) return;
        setItems(data.items);
        const lastSeen = readLastSeen();
        setUnread(
          data.items.filter(
            (item) => new Date(item.publishedAt ?? 0).getTime() > lastSeen
          ).length
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Reflect current permission/subscription state (no prompt is ever triggered here).
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }
    if (Notification.permission === "denied") {
      setPushState("denied");
      return;
    }
    if (Notification.permission === "default") {
      setPushState("default");
      return;
    }
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.pushManager.getSubscription() ?? null)
      .then((subscription) => setPushState(subscription ? "subscribed" : "granted"))
      .catch(() => setPushState("granted"));
  }, []);

  /** Single dismissal path: unwinds our history entry when we pushed one. */
  const close = useCallback(() => {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      window.history.back();
      return;
    }
    setOpen(false);
    window.requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  // Escape (desktop) closes the sheet. Outside tap is handled by the scrim.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Android system Back (and browser Back) dismisses the sheet instead of
  // leaving the page — same throwaway-history-entry pattern as the drawer.
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ navagrahaNotifications: true }, "");
    pushedHistoryRef.current = true;
    const handlePopState = () => {
      pushedHistoryRef.current = false;
      setOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [open]);

  // Lock background scrolling without shifting layout (scrollbar compensated).
  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const current = Number.parseFloat(window.getComputedStyle(body).paddingRight || "0");
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  // Move focus into the sheet once it is on screen.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => panelRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      writeLastSeen(Date.now());
      setUnread(0);
      trackEvent("notification_bell_open", { route: pathname ?? "/" }, { dispatch: "idle" });
    }
  }

  async function enablePush() {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushState(permission === "denied" ? "denied" : "default");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const applicationServerKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
      if (!applicationServerKey) {
        setPushState("granted");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      const json = subscription.toJSON();
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, locale }),
      });
      if (response.ok) {
        setPushState("subscribed");
        trackEvent("push_subscribed", { locale }, { dispatch: "idle" });
      }
    } catch {
      /* stays in previous state; the centre keeps working without push */
    } finally {
      setPushBusy(false);
    }
  }

  async function disablePush() {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => {});
        await subscription.unsubscribe().catch(() => {});
        trackEvent("push_unsubscribed", { locale }, { dispatch: "idle" });
      }
      setPushState("granted");
    } finally {
      setPushBusy(false);
    }
  }

  const localize = (path: string) =>
    getLocalizedPath(locale, path, { forcePrefix: locale !== defaultLocale });

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(185,139,70,0.22)] bg-white text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.07)] transition hover:border-[rgba(185,139,70,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
        type="button"
        onClick={toggleOpen}
      >
        <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b8232f] px-1 text-[0.62rem] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open
        ? createPortal(
            <>
              {/* Scrim: outside-tap dismissal + focus containment. Mobile only —
                  the desktop popover is anchored and closes on Escape/blur. */}
              <button
                aria-label="Close notifications"
                className="fixed inset-0 z-[78] bg-[rgba(5,5,5,0.28)] xl:hidden"
                type="button"
                onClick={close}
              />

              {/* Mobile: a viewport-anchored sheet with 16px side margins that
                  sits ABOVE the fixed bottom dock. The previous panel mixed a
                  viewport-relative width (92vw) with bell-anchored positioning
                  (absolute right-0), so on every phone width its left edge fell
                  outside the viewport and the content was clipped.
                  Desktop (xl): the anchored popover, which fits comfortably. */}
              <div
                ref={panelRef}
                aria-labelledby={headingId}
                aria-modal="true"
                className="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] top-auto z-[80] flex max-h-[min(68vh,30rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(185,139,70,0.24)] bg-white shadow-[0_18px_40px_rgba(5,5,5,0.18)] outline-none xl:absolute xl:inset-x-auto xl:bottom-auto xl:right-4 xl:top-[4.25rem] xl:max-h-[32rem] xl:w-[22rem]"
                role="dialog"
                tabIndex={-1}
              >
                <div className="flex items-center justify-between gap-3 border-b border-[rgba(185,139,70,0.18)] px-4 py-3">
                  <h2
                    className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--color-antique-gold-dark)]"
                    id={headingId}
                  >
                    Notifications
                  </h2>
                  <button
                    aria-label="Close notifications"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(185,139,70,0.22)] bg-white text-[#111111] transition hover:bg-[rgba(185,139,70,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                    type="button"
                    onClick={close}
                  >
                    <span aria-hidden="true" className="text-base leading-none">
                      ✕
                    </span>
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
                  {items === null ? (
                    <p className="px-2 py-4 text-sm text-[color:var(--ui-color-text-muted)]">
                      Loading…
                    </p>
                  ) : items.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-[color:var(--ui-color-text-muted)]">
                      No articles yet. New Desk articles will appear here.
                    </p>
                  ) : (
                    <ul className="grid gap-0.5">
                      {items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            className="flex min-h-11 flex-col justify-center gap-0.5 rounded-[var(--radius-lg)] px-2.5 py-2.5 transition hover:bg-[rgba(185,139,70,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                            href={localize(item.path)}
                            onClick={() => {
                              trackEvent(
                                "notification_open",
                                { route: item.path, source: "bell" },
                                { dispatch: "idle" }
                              );
                              close();
                            }}
                          >
                            <span className="text-[0.82rem] font-semibold leading-5 text-[#111111] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                              {item.title}
                            </span>
                            {item.publishedAt ? (
                              <span className="text-[0.7rem] font-medium text-[color:var(--ui-color-text-muted)]">
                                {item.publishedAt.slice(0, 10)}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="shrink-0 border-t border-[rgba(185,139,70,0.18)] px-4 py-3">
                  {pushState === "unsupported" ? (
                    <p className="text-[0.72rem] leading-5 text-[color:var(--ui-color-text-muted)]">
                      New-article alerts appear here whenever you open the app.
                    </p>
                  ) : pushState === "denied" ? (
                    <p className="text-[0.72rem] leading-5 text-[color:var(--ui-color-text-muted)]">
                      Notifications are blocked in your device settings. The bell
                      still shows every new article here.
                    </p>
                  ) : pushState === "subscribed" ? (
                    <div className="grid gap-2">
                      <p className="text-[0.72rem] leading-5 text-[color:var(--ui-color-text-muted)]">
                        You will be notified when a new article is published.
                      </p>
                      <button
                        className="min-h-11 rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.24)] bg-white px-3 text-sm font-semibold text-[#111111] transition hover:bg-[rgba(185,139,70,0.06)] disabled:opacity-60"
                        disabled={pushBusy}
                        type="button"
                        onClick={disablePush}
                      >
                        Disable Notifications
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <p className="text-[0.72rem] leading-5 text-[color:var(--ui-color-text-muted)]">
                        Get an alert when a new Desk article is published. Your
                        device will ask for permission — nothing else is collected.
                      </p>
                      <button
                        className="min-h-11 rounded-[var(--radius-lg)] border border-[rgba(185,139,70,0.34)] bg-[rgba(185,139,70,0.08)] px-3 text-sm font-semibold text-[#111111] transition hover:bg-[rgba(185,139,70,0.14)] disabled:opacity-60"
                        disabled={pushBusy}
                        type="button"
                        onClick={enablePush}
                      >
                        Enable Notifications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
