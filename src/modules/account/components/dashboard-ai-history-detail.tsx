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

export function DashboardAIHistoryDetail({
  hub,
  conversationId,
}: Readonly<{
  hub: DashboardHubData;
  conversationId: string;
}>) {
  const conversation = hub.ai.historyItems.find((item) => item.id === conversationId) ?? null;
  const relatedKundliLabel = conversation?.relatedKundliLabel ?? (conversation?.relatedKundliId ? "Linked to your Kundli" : "Unavailable");

  return (
    <div className="space-y-6">
      <Card tone="accent" className="space-y-3">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
          AI Conversation
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
          Safe conversation summary and continuation
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          This view shows only safe metadata and short snippets. Raw prompts, system instructions, and internal AI context remain hidden.
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge tone={conversation ? "accent" : "neutral"}>{conversation?.moduleLabel ?? "Unknown module"}</Badge>
            <h2 className="text-[1.15rem] text-[#111111]">{conversation?.title ?? "Conversation not available"}</h2>
          </div>
          <div className="space-y-1 text-right text-[0.82rem] text-[#4A4A4A]">
            <p>Conversation ID: {conversationId}</p>
            <p>Created: {formatDateTime(conversation?.createdAtUtc ?? null)}</p>
          </div>
        </div>

        {conversation ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">First question</p>
              <p className="mt-1 text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">
                {conversation.firstQuestion}
              </p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Safe snippet</p>
              <p className="mt-1 text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">
                {conversation.lastMessageSnippet}
              </p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Related Kundli</p>
              <p className="mt-1 text-[0.92rem] text-[#111111]">{relatedKundliLabel}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Updated</p>
              <p className="mt-1 text-[0.92rem] text-[#111111]">{formatDateTime(conversation.updatedAtUtc)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            This conversation is not available in the current safe dashboard summary.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Raw context safety</p>
            <p className="mt-2 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              Prompts, system instructions, and raw chart context stay hidden from the dashboard layer.
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Chart continuity</p>
            <p className="mt-2 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              Continue from the same user-owned thread without exposing another user&apos;s history.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={hub.ai.historyHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
            Back to AI History
          </Link>
          <Link href={conversation?.continueHref ?? hub.ai.historyHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
            Continue Conversation
          </Link>
          <Link href={hub.readiness.canAskMyChart ? hub.ai.historyHref : "/dashboard/kundli/new"} className={buttonStyles({ size: "sm", tone: "ghost" })}>
            {hub.readiness.canAskMyChart ? "Ask NAVAGRAHA AI" : "Generate Kundli"}
          </Link>
        </div>
      </Card>
    </div>
  );
}
