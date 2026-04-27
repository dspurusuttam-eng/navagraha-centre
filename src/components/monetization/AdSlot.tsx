"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { trackRevenueEvent } from "@/lib/analytics/revenue-events";
import {
  isAdSenseReady,
  monetizationConfig,
  shouldRenderMonetizationPlacement,
  type MonetizationPlacement,
} from "@/lib/monetization/monetization-config";
import { AdDisclosure } from "@/components/monetization/AdDisclosure";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  placement: MonetizationPlacement;
  format?: "banner" | "rectangle" | "responsive";
  className?: string;
  minHeight?: number;
  showPlaceholder?: boolean;
  responsive?: boolean;
  lazy?: boolean;
};

const placementLabelByKey: Record<MonetizationPlacement, string> = {
  blog_after_intro: "Blog: After Intro",
  blog_mid_article: "Blog: Mid Article",
  blog_before_related: "Blog: Before Related",
  rashifal_after_intro: "Rashifal: After Intro",
  rashifal_mid_content: "Rashifal: Mid Content",
  panchang_after_summary: "Panchang: After Summary",
  tool_result_bottom: "Tool Result: Bottom",
  homepage_soft_slot: "Homepage: Soft Slot",
  sidebar_desktop: "Sidebar: Desktop",
};

function getMinHeight(format: AdSlotProps["format"], minHeight?: number) {
  if (typeof minHeight === "number" && Number.isFinite(minHeight)) {
    return minHeight;
  }

  if (format === "rectangle") {
    return 280;
  }

  if (format === "banner") {
    return 120;
  }

  return 180;
}

export function AdSlot({
  placement,
  format = "responsive",
  className,
  minHeight,
  showPlaceholder = monetizationConfig.enableAdPlaceholders,
  responsive = true,
  lazy = true,
}: Readonly<AdSlotProps>) {
  const slotRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);
  const hasRenderedAdRef = useRef(false);
  const isPlacementAllowed = shouldRenderMonetizationPlacement(placement);
  const shouldRenderRealAd = isPlacementAllowed && isAdSenseReady();
  const resolvedMinHeight = getMinHeight(format, minHeight);

  useEffect(() => {
    if (!slotRef.current || hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;
    trackRevenueEvent("adsense_slot_view", {
      page: typeof window !== "undefined" ? window.location.pathname : "unknown",
      placement,
      format,
    });
  }, [format, placement]);

  useEffect(() => {
    if (!shouldRenderRealAd || !slotRef.current || hasRenderedAdRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      hasRenderedAdRef.current = true;
      trackRevenueEvent("article_ad_slot_rendered", {
        page: window.location.pathname,
        placement,
        format,
      });
    } catch {
      // Ads should never break page rendering.
    }
  }, [format, placement, shouldRenderRealAd]);

  if (!isPlacementAllowed) {
    return null;
  }

  if (!shouldRenderRealAd && !showPlaceholder) {
    return null;
  }

  return (
    <Card
      tone="light"
      className={cn(
        "space-y-3 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.92)]",
        className
      )}
      style={{ minHeight: `${resolvedMinHeight}px` }}
      data-ad-placement={placement}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone="outline">{placementLabelByKey[placement]}</Badge>
        <AdDisclosure />
      </div>

      {shouldRenderRealAd ? (
        <ins
          ref={(node) => {
            slotRef.current = node;
          }}
          className="adsbygoogle block w-full overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,255,255,0.9)]"
          style={{
            display: "block",
            minHeight: `${resolvedMinHeight - 48}px`,
          }}
          data-ad-client={monetizationConfig.adsensePublisherId}
          data-ad-slot={monetizationConfig.adsenseDefaultSlotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
          data-loading-strategy={lazy ? "lazy" : "eager"}
        />
      ) : (
        <div
          ref={(node) => {
            slotRef.current = node;
          }}
          className="grid place-items-center rounded-[var(--radius-lg)] border border-dashed border-[rgba(184,137,67,0.28)] bg-[rgba(255,253,247,0.9)] px-4 text-center"
          style={{ minHeight: `${resolvedMinHeight - 48}px` }}
        >
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Ad-safe placeholder. Real AdSense will activate after publisher and slot
            environment variables are configured.
          </p>
        </div>
      )}
    </Card>
  );
}

