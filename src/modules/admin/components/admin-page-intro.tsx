import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type AdminPageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function AdminPageIntro({
  eyebrow,
  title,
  description,
  actions,
}: Readonly<AdminPageIntroProps>) {
  return (
    <div className="flex flex-col gap-5 border-b border-[color:var(--color-border)] pb-6">
      <div className="space-y-4">
        <Badge tone="accent">{eyebrow}</Badge>
        <div className="space-y-3">
          <h1
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
            style={{
              letterSpacing: "var(--tracking-display)",
              lineHeight: "var(--line-height-tight)",
            }}
          >
            {title}
          </h1>
          <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {description}
          </p>
        </div>
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
