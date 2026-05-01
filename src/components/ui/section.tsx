import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

type SectionTone = "default" | "muted" | "transparent" | "light" | "contrast";
type SectionAlign = "left" | "center";
type SectionCategory = "utilities" | "ai" | "services" | "content";

const toneStyles: Record<SectionTone, string> = {
  default:
    "py-[var(--space-section-y-mobile)] sm:py-[var(--space-section-y-mobile)] lg:py-[var(--space-section-y-desktop)]",
  muted:
    "py-[var(--space-section-y-mobile)] sm:py-[var(--space-section-y-mobile)] lg:py-[var(--space-section-y-desktop)] bg-[linear-gradient(180deg,rgba(252,246,237,0.9)_0%,rgba(246,237,222,0.86)_100%)]",
  transparent: "py-[var(--space-section-y-mobile)] sm:py-[var(--space-section-y-mobile)] lg:py-[var(--space-section-y-desktop)]",
  light:
    "py-[var(--space-section-y-mobile)] sm:py-[var(--space-section-y-mobile)] lg:py-[var(--space-section-y-desktop)] bg-[linear-gradient(180deg,var(--color-section-light)_0%,var(--color-section-light-muted)_54%,#f9efdc_100%)]",
  contrast:
    "py-[var(--space-section-y-mobile)] sm:py-[var(--space-section-y-mobile)] lg:py-[var(--space-section-y-desktop)] bg-[linear-gradient(180deg,var(--color-section-contrast-elevated)_0%,var(--color-section-contrast)_100%)]",
};

const categoryStyles: Record<SectionCategory, string> = {
  utilities: "section-category-utilities",
  ai: "section-category-ai",
  services: "section-category-services",
  content: "section-category-content",
};

export type SectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: SectionAlign;
  tone?: SectionTone;
  category?: SectionCategory;
  contentClassName?: string;
  children: ReactNode;
};

export function Section({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  category,
  className,
  contentClassName,
  children,
  ...props
}: Readonly<SectionProps>) {
  const usesInkPalette = tone === "light" || tone === "default" || tone === "muted" || tone === "transparent" || tone === "contrast";

  return (
    <section
      className={cn(
        toneStyles[tone],
        category ? categoryStyles[category] : null,
        "premium-soft-fade supports-[content-visibility:auto]:[content-visibility:auto] supports-[content-visibility:auto]:[contain-intrinsic-size:1px_900px]",
        className
      )}
      {...props}
    >
      <Container className={contentClassName}>
        {eyebrow || title || description ? (
          <div
            className={cn(
              "mb-8 flex min-w-0 max-w-3xl flex-col gap-4 sm:mb-10",
              align === "center" && "mx-auto items-center text-center"
            )}
          >
            {eyebrow ? <Badge tone="outline">{eyebrow}</Badge> : null}
            {title ? (
                <h2
                className={cn(
                  "card-heading mobile-safe-text text-[length:var(--font-size-title-lg)]",
                  usesInkPalette
                    ? "text-[var(--color-text-primary)]"
                    : "text-[color:var(--color-foreground)]"
                )}
                style={{
                  lineHeight: "var(--line-height-heading)",
                }}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
                <p
                className={cn(
                  "mobile-safe-text max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)]",
                  usesInkPalette
                    ? "text-[var(--color-text-secondary)]"
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
