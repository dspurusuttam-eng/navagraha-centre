"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardHubData } from "@/modules/account/dashboard-hub";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function badgeTone(hasKundli: boolean) {
  return hasKundli ? ("accent" as const) : ("neutral" as const);
}

export function DashboardAIHistory({
  hub,
}: Readonly<{
  hub: DashboardHubData;
}>) {
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const moduleLabels = useMemo(() => ["All", ...new Set(hub.ai.historyItems.map((item) => item.moduleLabel))], [hub.ai.historyItems]);

  const visibleItems = useMemo(() => {
    if (selectedModule === "All") {
      return hub.ai.historyItems;
    }

    return hub.ai.historyItems.filter((item) => item.moduleLabel === selectedModule);
  }, [hub.ai.historyItems, selectedModule]);
  const selectedConversationLabel = (item: DashboardHubData["ai"]["historyItems"][number]) =>
    item.relatedKundliLabel ?? (item.relatedKundliId ? "Linked to your Kundli" : "No Kundli linked");

  return (
    <div className="space-y-6">
      <Card tone="accent" className="space-y-3">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
          Ask NAVAGRAHA AI
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
          Safe AI history and chart continuity
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          This dashboard view shows only safe conversation metadata, recent question snippets, and continuation links. Raw prompts, system instructions, and full transcripts remain hidden.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Total sessions</p>
          <p className="mt-2 text-[1.25rem] text-[#111111]">{hub.ai.historyCount}</p>
        </Card>
        <Card>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Ask My Chart</p>
          <p className="mt-2 text-[1.25rem] text-[#111111]">
            {hub.readiness.canAskMyChart ? "Ready" : "Generate Kundli first"}
          </p>
        </Card>
        <Card>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Active Kundli</p>
          <p className="mt-2 text-[1.25rem] text-[#111111]">{hub.ai.currentKundliLabel ?? "Unavailable"}</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Filter by module
            </p>
            <p className="text-[length:var(--font-size-body-sm)] text-[#4A4A4A]">
              Filter to keep conversation history readable without exposing raw chat content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {moduleLabels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedModule(label)}
                className={buttonStyles({
                  size: "sm",
                  tone: selectedModule === label ? "secondary" : "ghost",
                })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-5 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.ai.emptyStateLabel}
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white p-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="accent">{item.moduleLabel}</Badge>
                      <Badge tone={badgeTone(Boolean(item.relatedKundliId))}>{selectedConversationLabel(item)}</Badge>
                    </div>
                    <h2 className="text-[1rem] text-[#111111]">{item.title}</h2>
                  </div>
                  <div className="text-right text-[0.82rem] text-[#4A4A4A]">
                    <p>Created {formatDateTime(item.createdAtUtc)}</p>
                    <p>Updated {formatDateTime(item.updatedAtUtc)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Question
                    </p>
                    <p className="mt-1 text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">
                      {item.firstQuestion}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Safe snippet
                    </p>
                    <p className="mt-1 text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">
                      {item.lastMessageSnippet}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Continue
                    </p>
                    <p className="mt-1 text-[0.92rem] text-[#111111]">
                      Continue from the same chart-safe thread.
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Access
                    </p>
                    <p className="mt-1 text-[0.92rem] text-[#111111]">
                      {hub.readiness.canContinueAIHistory ? "Conversation ready" : "Ask NAVAGRAHA AI ready"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={item.continueHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
                    Continue Conversation
                  </Link>
                  <Link
                    href={hub.readiness.canAskMyChart ? hub.ai.historyHref : "/dashboard/kundli/new"}
                    className={buttonStyles({ size: "sm", tone: "ghost" })}
                  >
                    {hub.readiness.canAskMyChart ? "Ask NAVAGRAHA AI" : "Generate Kundli"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
