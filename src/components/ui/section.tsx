import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

type SectionTone = "default" | "muted" | "transparent" | "light" | "contrast";
type SectionAlign = "left" | "center";

const toneStyles: Record<SectionTone, string> = {
  default: "py-[var(--space-10)] sm:py-[var(--space-12)] lg:py-[var(--space-14)]",
  muted:
    "py-[var(--space-10)] sm:py-[var(--space-12)] lg:py-[var(--space-14)] bg-[linear-gradient(180deg,rgba(250,244,235,0.88)_0%,rgba(245,236,222,0.84)_100%)]",
  transparent: "py-[var(--space-10)] sm:py-[var(--space-12)] lg:py-[var(--space-14)]",
  light:
    "py-[var(--space-10)] sm:py-[var(--space-12)] lg:py-[var(--space-14)] bg-[linear-gradient(180deg,var(--color-section-light)_0%,var(--color-section-light-muted)_100%)]",
  contrast:
    "py-[var(--space-10)] sm:py-[var(--space-12)] lg:py-[var(--space-14)] bg-[linear-gradient(180deg,var(--color-section-contrast-elevated)_0%,var(--color-section-contrast)_100%)]",
};

export type SectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: SectionAlign;
  tone?: SectionTone;
  contentClassName?: string;
  children: ReactNode;
};

export function Section({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  className,
  contentClassName,
  children,
  ...props
}: Readonly<SectionProps>) {
  const usesInkPalette = tone === "light" || tone === "default" || tone === "muted" || tone === "transparent" || tone === "contrast";

  return (
    <section className={cn(toneStyles[tone], className)} {...props}>
      <Container className={contentClassName}>
        {eyebrow || title || description ? (
          <div
            className={cn(
              "mb-8 flex max-w-3xl flex-col gap-4 sm:mb-10",
              align === "center" && "mx-auto items-center text-center"
            )}
          >
            {eyebrow ? <Badge tone="accent">{eyebrow}</Badge> : null}
            {title ? (
                <h2
                className={cn(
                  "font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)]",
                  usesInkPalette
                    ? "text-[var(--color-ink-strong)]"
                    : "text-[color:var(--color-foreground)]"
                )}
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-heading)",
                }}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
                <p
                className={cn(
                  "max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)]",
                  usesInkPalette
                    ? "text-[var(--color-ink-muted)]"
                    : "text-[color:var(--color-muted)]"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
