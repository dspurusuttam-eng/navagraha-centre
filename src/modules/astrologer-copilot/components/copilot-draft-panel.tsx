"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CopilotDraftPanelProps = {
  snapshotId: string;
  title: string;
  description: string;
  defaultValue: string;
  exportFileName: string;
};

async function trackEvent(snapshotId: string, event: "copy" | "export") {
  await fetch(`/api/admin/astrologer-copilot/snapshots/${snapshotId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event }),
  });
}

export function CopilotDraftPanel({
  snapshotId,
  title,
  description,
  defaultValue,
  exportFileName,
}: Readonly<CopilotDraftPanelProps>) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCopy() {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(value);
        await trackEvent(snapshotId, "copy");
        setStatus("Copied");
      } catch {
        setStatus("Copy failed");
      }
    });
  }

  function handleExport() {
    startTransition(async () => {
      try {
        const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = exportFileName;
        anchor.click();
        URL.revokeObjectURL(url);
        await trackEvent(snapshotId, "export");
        setStatus("Exported");
      } catch {
        setStatus("Export failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {title}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            {description}
          </p>
        </div>
        {status ? <Badge tone="outline">{status}</Badge> : null}
      </div>

      <Textarea
        rows={7}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <div className="flex flex-wrap gap-3">
        <Button size="sm" type="button" onClick={handleCopy} disabled={isPending}>
          Copy
        </Button>
        <Button
          tone="secondary"
          size="sm"
          type="button"
          onClick={handleExport}
          disabled={isPending}
        >
          Export
        </Button>
      </div>
    </div>
  );
}
