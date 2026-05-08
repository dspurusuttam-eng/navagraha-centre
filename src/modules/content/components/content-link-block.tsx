import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import type { ContentLinkGroup } from "@/modules/content/linking";

type ContentLinkBlockProps = {
  groups: readonly ContentLinkGroup[];
};

export function ContentLinkBlock({ groups }: Readonly<ContentLinkBlockProps>) {
  if (!groups.length) {
    return null;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {groups.map((group) => (
        <Card key={group.title} className="space-y-4">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {group.title}
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {group.description}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.links.map((link) => (
              <Link
                key={`${group.title}-${link.href}`}
                href={link.href}
                className={buttonStyles({
                  tone: "secondary",
                  size: "sm",
                  className:
                    "min-h-11 w-full justify-start whitespace-normal text-left",
                })}
              >
                <span className="block">
                  <span className="block font-medium text-[var(--color-ink-strong)]">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-[0.72rem] normal-case tracking-normal text-[var(--color-muted)]">
                    {link.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

