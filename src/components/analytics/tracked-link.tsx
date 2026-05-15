"use client";

import Link, { type LinkProps } from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import {
  trackAiStartClick,
  trackConsultationBookClick,
  trackHomepageCtaClick,
  trackKundliGenerateClick,
  trackPanchangView,
  trackReportPreviewClick,
  trackReportUnlockClick,
  trackRashifalView,
} from "@/lib/analytics/conversion-events";
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
  pathname: string | null,
  payload: AnalyticsEventPayload
) {
  if (!pathname) {
    return [];
  }

  const normalizedPath = pathname.toLowerCase();
  const normalizedFeature =
    typeof payload.feature === "string" ? payload.feature.toLowerCase() : "";
  const normalizedPage =
    typeof payload.page === "string" ? payload.page.toLowerCase() : "";
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

  if (normalizedPage === "/" || normalizedFeature.startsWith("home-")) {
    companionEvents.push("homepage_cta_click");
  }

  if (normalizedPath.startsWith("/kundli") || normalizedFeature.includes("kundli")) {
    companionEvents.push("kundli_generate_click");
  }

  if (
    normalizedPath.startsWith("/rashifal") ||
    normalizedFeature.includes("rashifal")
  ) {
    companionEvents.push("rashifal_view");
  }

    if (
      normalizedPath.startsWith("/panchang") ||
      normalizedPath.startsWith("/muhurat") ||
      normalizedPath.startsWith("/muhurta") ||
      normalizedFeature.includes("panchang") ||
      normalizedFeature.includes("muhurat") ||
      normalizedFeature.includes("muhurta")
    ) {
      companionEvents.push("panchang_view");
    }

  if (normalizedPath.startsWith("/ai") || normalizedFeature.includes("ai")) {
    companionEvents.push("ai_start_click");
  }

  if (
    normalizedPath.startsWith("/consultation") ||
    normalizedFeature.includes("consultation")
  ) {
    companionEvents.push("consultation_book_click");
  }

  if (
    normalizedPath.startsWith("/reports") ||
    normalizedPath.endsWith("-report") ||
    normalizedFeature.includes("report")
  ) {
    companionEvents.push("report_preview_click");
  }

  if (
    eventName === "premium_click" &&
    (normalizedPage === "/reports" || normalizedFeature.includes("reports-cta"))
  ) {
    companionEvents.push("report_unlock_click");
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
    const companionEvents = getCompanionEvents(eventName, pathname, eventPayload ?? {});

    const route =
      typeof eventPayload?.route === "string"
        ? eventPayload.route
        : typeof eventPayload?.page === "string"
          ? eventPayload.page
          : pathname ?? undefined;
    const source =
      typeof eventPayload?.feature === "string"
        ? eventPayload.feature
        : typeof eventPayload?.source === "string"
          ? eventPayload.source
          : "tracked-link";
    const safeContext = {
      route,
      locale:
        typeof eventPayload?.locale === "string" ? eventPayload.locale : undefined,
      toolKey:
        typeof eventPayload?.tool === "string" ? eventPayload.tool : undefined,
      section:
        typeof eventPayload?.section === "string"
          ? eventPayload.section
          : undefined,
      cta:
        typeof eventPayload?.cta === "string" ? eventPayload.cta : undefined,
      source,
      status:
        typeof eventPayload?.status === "string" ? eventPayload.status : undefined,
      planKey:
        typeof eventPayload?.planKey === "string"
          ? eventPayload.planKey
          : undefined,
    };

    if (companionEvents.includes("homepage_cta_click")) {
      trackHomepageCtaClick(safeContext);
    }

    if (companionEvents.includes("kundli_generate_click")) {
      trackKundliGenerateClick(safeContext);
    }

    if (companionEvents.includes("rashifal_view")) {
      trackRashifalView(safeContext);
    }

    if (companionEvents.includes("panchang_view")) {
      trackPanchangView(safeContext);
    }

    if (companionEvents.includes("ai_start_click")) {
      trackAiStartClick(safeContext);
    }

    if (companionEvents.includes("consultation_book_click")) {
      trackConsultationBookClick(safeContext);
    }

    if (companionEvents.includes("report_preview_click")) {
      trackReportPreviewClick(safeContext);
    }

    if (companionEvents.includes("report_unlock_click")) {
      trackReportUnlockClick(safeContext);
    }

    for (const companionEvent of companionEvents) {
      if (
        companionEvent === "homepage_cta_click" ||
        companionEvent === "kundli_generate_click" ||
        companionEvent === "dashboard_checkin" ||
        companionEvent === "rashifal_view" ||
        companionEvent === "panchang_view" ||
        companionEvent === "report_preview_click" ||
        companionEvent === "report_unlock_click" ||
        companionEvent === "ai_start_click" ||
        companionEvent === "consultation_book_click" ||
        companionEvent === "language_switch" ||
        companionEvent === "pwa_install_prompt" ||
        companionEvent === "pwa_install_success"
      ) {
        continue;
      }

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
