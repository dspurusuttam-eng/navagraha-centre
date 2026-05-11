"use client";

import { useMemo, useState } from "react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  ConsultationIcon,
  NavagrahaAiIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { UtilityIcon } from "@/components/graphics/utility-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { getUtilityStatusLabel, getUtilityStatusTone } from "@/modules/astrology/utilities";
import {
  getToolsHubFilterTabs,
  type ToolsHubCard,
  type ToolsHubCollection,
  type ToolsHubFilterKey,
} from "@/modules/astrology/utilities/tools-hub";

const filterTabs = getToolsHubFilterTabs();

type ToolsHubCatalogProps = {
  collections: readonly ToolsHubCollection[];
};

function getToolIcon(icon: ToolsHubCard["icon"], className = "h-12 w-12") {
  switch (icon) {
    case "ai":
      return <NavagrahaAiIcon className={className} />;
    case "report":
      return <ReportIcon className={className} />;
    case "consultation":
      return <ConsultationIcon className={className} />;
    default:
      return <UtilityIcon name={icon} className={className} />;
  }
}

function matchesFilter(card: ToolsHubCard, filter: ToolsHubFilterKey) {
  if (filter === "all") {
    return true;
  }

  if (filter === "coming-soon") {
    return card.status === "coming soon";
  }

  return card.filterKey === filter;
}

export function ToolsHubCatalog({ collections }: Readonly<ToolsHubCatalogProps>) {
  const [activeFilter, setActiveFilter] = useState<ToolsHubFilterKey>("all");

  const filteredCollections = useMemo(() => {
    return collections
      .map((collection) => ({
        ...collection,
        cards: collection.cards.filter((card) => matchesFilter(card, activeFilter)),
      }))
      .filter((collection) => collection.cards.length > 0);
  }, [collections, activeFilter]);

  const filterCounts = useMemo(() => {
    const counts = new Map<ToolsHubFilterKey, number>();

    for (const tab of filterTabs) {
      counts.set(tab.key, 0);
    }

    for (const collection of collections) {
      for (const card of collection.cards) {
        counts.set("all", (counts.get("all") ?? 0) + 1);
        counts.set(card.filterKey, (counts.get(card.filterKey) ?? 0) + 1);
        if (card.status === "coming soon") {
          counts.set("coming-soon", (counts.get("coming-soon") ?? 0) + 1);
        }
      }
    }

    return counts;
  }, [collections]);

  const activeTab = filterTabs.find((tab) => tab.key === activeFilter) ?? filterTabs[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = tab.key === activeFilter;
          const count = filterCounts.get(tab.key) ?? 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-[0.72rem] font-medium transition",
                isActive
                  ? "border-[rgba(184,137,67,0.38)] bg-white text-[color:var(--color-ink-strong)] shadow-[0_10px_24px_rgba(17,24,39,0.06)]"
                  : "border-black/8 bg-white text-[color:var(--color-ink-muted)] hover:border-black/12 hover:text-[color:var(--color-ink-strong)]",
              )}
            >
              <span>{tab.label}</span>
              <span className="rounded-full border border-[rgba(184,137,67,0.18)] px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge tone="trust" className="w-fit border border-black/8 bg-white">
            Filtered Discovery
          </Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
            {activeTab.description}
          </p>
        </div>
        <p className="text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
          Showing {filteredCollections.reduce((total, collection) => total + collection.cards.length, 0)} tools across {filteredCollections.length} collections
        </p>
      </div>

      <div className="space-y-10">
        {filteredCollections.map((collection) => (
          <section key={collection.key} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Badge tone="trust" className="w-fit border border-black/8 bg-white">
                  {collection.eyebrow}
                </Badge>
                <div className="space-y-2">
                  <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                    {collection.title}
                  </h3>
                  <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    {collection.description}
                  </p>
                </div>
              </div>
              <Badge tone="outline" className="w-fit border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                {collection.cards.length} {collection.cards.length === 1 ? "tool" : "tools"}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {collection.cards.map((card) => {
                const isComingSoon = card.status === "coming soon";
                const cardTone = getUtilityStatusTone(card.status);
                const statusLabel = getUtilityStatusLabel(card.status);

                return (
                  <Card
                    key={card.key}
                    tone="default"
                    interactive={!isComingSoon}
                    className="flex h-full flex-col gap-4 border-black/8 bg-white bg-none shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0 hover:border-black/12"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {getToolIcon(card.icon)}
                        <div className="space-y-1">
                          <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]">
                            {collection.eyebrow}
                          </p>
                          <h4 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                            {card.title}
                          </h4>
                        </div>
                      </div>
                      <Badge tone={cardTone}>{statusLabel}</Badge>
                    </div>

                    <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      {card.description}
                    </p>

                    {isComingSoon ? (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.18)] bg-white px-[1.125rem] text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
                        {card.ctaLabel}
                      </span>
                    ) : (
                      <TrackedLink
                        href={card.href ?? card.fallbackHref ?? "/tools"}
                        eventName={card.eventName}
                        eventPayload={{ page: "/tools", feature: card.feature, tool: card.title }}
                        className={buttonStyles({
                          size: "sm",
                          tone: "secondary",
                          className: "w-full justify-center",
                        })}
                      >
                        {card.ctaLabel}
                      </TrackedLink>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
