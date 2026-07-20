"use client";

import { useEffect, useState } from "react";
import { trackArticleShare } from "@/lib/analytics/conversion-events";

type ArticleShareBarProps = {
  /** Absolute, locale-correct canonical URL of the article. */
  url: string;
  title: string;
  /** Route path recorded with the anonymous share event. */
  route: string;
  locale?: string;
};

const pillClass =
  "inline-flex min-h-11 items-center rounded-[var(--ui-radius-pill)] border border-[color:var(--ui-color-border-gold)] bg-white px-4 text-sm font-semibold text-[color:var(--ui-color-text-primary)] shadow-[var(--ui-shadow-sm)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] motion-reduce:hover:translate-y-0";

/**
 * Client share bar for Desk articles: native system share first (the primary
 * mobile action), WhatsApp and Copy Link always available, then the classic
 * web targets. Every action records an anonymous channel event — never the
 * recipient, never clipboard contents.
 */
export function ArticleShareBar({ url, title, route, locale }: Readonly<ArticleShareBarProps>) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const record = (channel: string) =>
    trackArticleShare({ route, locale, source: channel, section: "article" });

  async function shareNative() {
    // Rendered unconditionally to avoid hydration branches; browsers without
    // the Web Share API (mostly desktop) get the copy behaviour instead.
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, url });
      record("native");
    } catch {
      // Dismissed the sheet — not an error, not recorded.
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      record("copy");
    } catch {
      // Clipboard API unavailable (very old WebView): fall back to a prompt the
      // user can copy from manually.
      window.prompt("Copy this link", url);
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title}\n${url}`);
  const external = [
    { label: "WhatsApp", channel: "whatsapp", href: `https://wa.me/?text=${encodedText}` },
    { label: "X", channel: "x", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}` },
    { label: "Facebook", channel: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "LinkedIn", channel: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      <button className={pillClass} type="button" onClick={shareNative}>
        Share
      </button>
      <button
        aria-live="polite"
        className={pillClass}
        type="button"
        onClick={copyLink}
      >
        {copied ? "Copied ✓" : "Copy Link"}
      </button>
      {external.map((target) => (
        <a
          className={pillClass}
          href={target.href}
          key={target.channel}
          rel="noreferrer"
          target="_blank"
          onClick={() => record(target.channel)}
        >
          {target.label}
        </a>
      ))}
    </div>
  );
}
