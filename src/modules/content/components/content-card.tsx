import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { contentTypeLabels } from "@/modules/content";
import type { ContentEntry } from "@/modules/content";

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

export function ContentCard({
  entry,
}: Readonly<{
  entry: ContentEntry;
}>) {
  return (
    <Card interactive className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">{contentTypeLabels[entry.type]}</Badge>
        <Badge tone="neutral">{entry.readingTimeMinutes} min read</Badge>
      </div>

      <div className="space-y-3">
        <h3
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          {entry.title}
        </h3>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {entry.excerpt}
        </p>
      </div>

      <div className="space-y-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
        <p>Published {formatPublishedDate(entry.publishedAt)}</p>
        <p>Reviewed for tone and safety before publication</p>
      </div>

      <Link
        href={entry.path}
        className={buttonStyles({ tone: "secondary", size: "sm" })}
      >
        Read Article
      </Link>
    </Card>
  );
}
