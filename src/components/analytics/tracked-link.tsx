"use client";

import Link, { type LinkProps } from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import type {
  AnalyticsEventPayload,
  TrackedEventName,
} from "@/lib/analytics/types";

type TrackedLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  eventName?: TrackedEventName;
  eventPayload?: AnalyticsEventPayload;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function readHrefPathname(href: LinkProps["href"]) {
  if (typeof href === "string") {
    return href;
  }

  if (href instanceof URL) {
    return href.pathname;
  }

  if (href && typeof href === "object" && "pathname" in href) {
    const pathname = href.pathname;

    return typeof pathname === "string" ? pathname : null;
  }

  return null;
}

function getCompanionEvents(
  eventName: TrackedEventName,
  pathname: string | null
) {
  if (!pathname) {
    return [];
  }

  const normalizedPath = pathname.toLowerCase();
  const companionEvents: TrackedEventName[] = [];

  if (eventName === "cta_click" || eventName === "premium_click") {
    if (normalizedPath.startsWith("/kundli")) {
      companionEvents.push("generate_kundli_click");
    }

    if (
      normalizedPath === "/ai" ||
      normalizedPath.startsWith("/dashboard/ask-my-chart")
    ) {
      companionEvents.push("ai_opened");
    }

    if (normalizedPath.startsWith("/consultation")) {
      companionEvents.push("consultation_click");
    }

    if (normalizedPath.startsWith("/dashboard/consultations/book")) {
      companionEvents.push("consultation_click", "consultation_started");
    }

    if (
      normalizedPath.startsWith("/reports") ||
      normalizedPath.endsWith("-report")
    ) {
      companionEvents.push("report_preview_opened", "report_view");
    }

    if (normalizedPath.startsWith("/shop")) {
      companionEvents.push("shop_interaction");
    }
  }

  return [...new Set(companionEvents)];
}

export function TrackedLink({
  children,
  eventName = "premium_click",
  eventPayload,
  onClick,
  ...props
}: Readonly<TrackedLinkProps>) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    trackEvent(eventName, eventPayload ?? {});

    const pathname = readHrefPathname(props.href);
    const companionEvents = getCompanionEvents(eventName, pathname);

    for (const companionEvent of companionEvents) {
      trackEvent(companionEvent, eventPayload ?? {});
    }

    onClick?.(event);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
