import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { contentTypeLabels } from "@/modules/content";
import type { ContentEntry } from "@/modules/content";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";

function formatPublishedDate(value: string, locale?: string) {
  return new Date(value).toLocaleDateString(locale ?? "en-IN", {
    dateStyle: "medium",
  });
}

export function ContentCard({
  entry,
  locale,
}: Readonly<{
  entry: ContentEntry;
  locale?: string;
}>) {
  const localizedPath = getLocalizedPath(locale, entry.path, {
    forcePrefix: locale !== undefined && locale !== defaultLocale,
  });

  return (
    <Card interactive className="content-card flex h-full flex-col space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">{contentTypeLabels[entry.type]}</Badge>
        <Badge tone="neutral">{entry.category}</Badge>
        <Badge tone="neutral">{entry.readingTimeMinutes} min read</Badge>
      </div>

      <div className="flex-1 space-y-3">
        <h3
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          {entry.title}
        </h3>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
          {entry.excerpt}
        </p>
      </div>

      <div className="space-y-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
        <p>Published {formatPublishedDate(entry.publishedAt, locale)}</p>
        <p>From the Desk of J P Sarmah</p>
      </div>

      <Link
        href={localizedPath}
        className={buttonStyles({
          tone: "secondary",
          size: "sm",
          className: "w-full justify-center sm:w-auto",
        })}
      >
        Read Article
      </Link>
    </Card>
  );
}
