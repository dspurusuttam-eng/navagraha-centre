"use client";

import { useEffect, useRef, useState } from "react";

type ArticleLikeButtonProps = {
  slug: string;
};

const STORAGE_KEY = "nvg-device-token";

/** Opaque random token, generated once per browser — never derived from identity. */
function getDeviceToken(): string | null {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing;
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    const token = Array.from(bytes, (b) => "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"[b % 64]).join("");
    window.localStorage.setItem(STORAGE_KEY, token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Anonymous like/unlike control for a published Desk article. Optimistic UI,
 * reconciled with the server response; disabled quietly when storage or the
 * API is unavailable so the article page never breaks because of it.
 */
export function ArticleLikeButton({ slug }: Readonly<ArticleLikeButtonProps>) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    tokenRef.current = getDeviceToken();
    const device = tokenRef.current ? `&device=${encodeURIComponent(tokenRef.current)}` : "";
    fetch(`/api/desk/likes?slug=${encodeURIComponent(slug)}${device}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { ok?: boolean; count?: number; liked?: boolean } | null) => {
        if (cancelled || !data?.ok) return;
        setCount(typeof data.count === "number" ? data.count : 0);
        setLiked(Boolean(data.liked));
      })
      .catch(() => {
        // Leave the control in its dormant state.
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function toggle() {
    const token = tokenRef.current;
    if (!token || busy || count === null) return;
    const nextLiked = !liked;
    setBusy(true);
    setLiked(nextLiked);
    setCount((value) => (value === null ? value : Math.max(0, value + (nextLiked ? 1 : -1))));
    try {
      const response = await fetch("/api/desk/likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, device: token, action: nextLiked ? "like" : "unlike" }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        count?: number;
        liked?: boolean;
      } | null;
      if (data?.ok && typeof data.count === "number") {
        setCount(data.count);
        setLiked(Boolean(data.liked));
      } else {
        // Server rejected (throttle/unpublished): roll the optimistic step back.
        setLiked(!nextLiked);
        setCount((value) => (value === null ? value : Math.max(0, value + (nextLiked ? -1 : 1))));
      }
    } catch {
      setLiked(!nextLiked);
      setCount((value) => (value === null ? value : Math.max(0, value + (nextLiked ? -1 : 1))));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      aria-label={liked ? "Unlike this article" : "Like this article"}
      aria-pressed={liked}
      className="inline-flex min-h-11 items-center gap-2 rounded-[var(--ui-radius-pill)] border border-[color:var(--ui-color-border-gold)] bg-white px-4 text-sm font-semibold text-[color:var(--ui-color-text-primary)] shadow-[var(--ui-shadow-sm)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] disabled:opacity-60 motion-reduce:hover:translate-y-0"
      disabled={busy || count === null}
      type="button"
      onClick={toggle}
    >
      <span aria-hidden="true" className={liked ? "text-[#b8232f]" : "text-[color:var(--ui-color-text-muted)]"}>
        {liked ? "♥" : "♡"}
      </span>
      <span>{count === null ? "Like" : count}</span>
    </button>
  );
}
