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

export function TrackedLink({
  children,
  eventName = "premium_click",
  eventPayload,
  onClick,
  ...props
}: Readonly<TrackedLinkProps>) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    trackEvent(eventName, eventPayload ?? {});
    onClick?.(event);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
