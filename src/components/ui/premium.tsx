import Image from "next/image";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import {
  navagrahaIconRegistry,
  type NavagrahaIconRegistryKey,
} from "@/components/icons/navagraha-icon-registry";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  FeatureAccess,
  FeatureIconKey,
  FeatureVisibility,
} from "@/config/feature-status-registry";
import { cn } from "@/lib/cn";

type PremiumTone = "plain" | "soft" | "embossed";
type PremiumStateTone = "empty" | "loading" | "error";
type PremiumStatusTone = FeatureVisibility | "NEUTRAL";

const shellToneStyles: Record<PremiumTone, string> = {
  plain: "bg-[color:var(--ui-color-white)]",
  soft: "bg-[linear-gradient(180deg,#ffffff_0%,#fffdf8_100%)]",
  embossed:
    "bg-[linear-gradient(180deg,#ffffff_0%,rgba(246,237,219,0.42)_100%)]",
};

const statusToneStyles: Record<PremiumStatusTone, BadgeTone> = {
  LIVE: "trust",
  COMING_SOON: "accent",
  HIDDEN: "neutral",
  INTERNAL_ONLY: "outline",
  NEUTRAL: "neutral",
};

function resolveIcon(iconKey?: FeatureIconKey) {
  if (!iconKey || iconKey === "text-fallback") {
    return null;
  }

  return navagrahaIconRegistry.find(
    (icon) =>
      icon.featureName === iconKey &&
      icon.availabilityStatus === "available" &&
      icon.repositoryPath
  );
}

function SymbolMark({
  iconKey,
  label,
  className,
}: Readonly<{
  iconKey?: FeatureIconKey;
  label: string;
  className?: string;
}>) {
  const icon = resolveIcon(iconKey);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-gold)] bg-white text-sm font-semibold uppercase text-[color:var(--ui-color-black)] shadow-[var(--ui-shadow-sm)]",
        className
      )}
    >
      {icon?.repositoryPath ? (
        <Image
          alt=""
          className="size-8 object-contain"
          height={32}
          src={icon.repositoryPath}
          width={32}
        />
      ) : (
        label.slice(0, 1)
      )}
    </span>
  );
}

export type PremiumPageShellProps = HTMLAttributes<HTMLElement> & {
  tone?: PremiumTone;
};

export function PremiumPageShell({
  children,
  className,
  tone = "plain",
  ...props
}: Readonly<PremiumPageShellProps>) {
  return (
    <div
      className={cn(
        "min-h-dvh overflow-x-clip text-[color:var(--ui-color-text-primary)]",
        shellToneStyles[tone],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type PremiumSectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
};

export function PremiumSectionHeading({
  className,
  label,
  ...props
}: Readonly<PremiumSectionHeadingProps>) {
  return (
    <div className={cn("mb-5 min-w-0", className)} {...props}>
      <h2 className="font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-sm)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
        {label}
      </h2>
    </div>
  );
}

export type PremiumBentoSectionProps = HTMLAttributes<HTMLElement> & {
  label?: string;
};

export function PremiumBentoSection({
  children,
  className,
  label,
  ...props
}: Readonly<PremiumBentoSectionProps>) {
  return (
    <section
      className={cn(
        "w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-[var(--container-max)]">
        {label ? <PremiumSectionHeading label={label} /> : null}
        {children}
      </div>
    </section>
  );
}

export type PremiumBentoGridProps = HTMLAttributes<HTMLDivElement>;

export function PremiumBentoGrid({
  children,
  className,
  ...props
}: Readonly<PremiumBentoGridProps>) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type PremiumStatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status?: PremiumStatusTone;
};

export function PremiumStatusBadge({
  children,
  className,
  status = "NEUTRAL",
  ...props
}: Readonly<PremiumStatusBadgeProps>) {
  return (
    <Badge
      className={cn("shrink-0 text-[0.62rem]", className)}
      tone={statusToneStyles[status]}
      {...props}
    >
      {children ?? status.replace("_", " ")}
    </Badge>
  );
}

export type PremiumRouteTileProps = {
  access?: FeatureAccess;
  className?: string;
  href: string;
  iconKey?: FeatureIconKey;
  label: string;
  showMeta?: boolean;
  status?: PremiumStatusTone;
};

export function PremiumRouteTile({
  access = "PUBLIC",
  className,
  href,
  iconKey,
  label,
  showMeta = true,
  status = "LIVE",
}: Readonly<PremiumRouteTileProps>) {
  const content = (
    <>
      <SymbolMark iconKey={iconKey} label={label} />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="line-clamp-2 break-words text-sm font-semibold leading-snug text-[color:var(--ui-color-text-primary)]">
          {label}
        </span>
        {showMeta ? (
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <PremiumStatusBadge status={status}>{access}</PremiumStatusBadge>
            <span className="break-all text-[0.68rem] font-medium text-[color:var(--ui-color-text-muted)]">
              {href}
            </span>
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <Link
      className={cn(
        "flex min-h-24 min-w-0 items-center gap-3 rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-subtle)] bg-white p-4 shadow-[var(--ui-shadow-sm)] transition [transition-duration:var(--ui-motion-base)] [transition-timing-function:var(--ui-ease-emphasized)] hover:-translate-y-0.5 hover:border-[color:var(--ui-color-border-gold)] hover:shadow-[var(--ui-shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className
      )}
      href={href}
    >
      {content}
    </Link>
  );
}

export type PremiumArticleCardProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  category?: string;
  date?: string;
  href: string;
  iconKey?: FeatureIconKey;
  title: string;
  /** Optional Desk cover image; falls back to the icon mark when absent. */
  coverImage?: { src: string; alt: string } | null;
};

export function PremiumArticleCard({
  category,
  className,
  coverImage,
  date,
  href,
  iconKey,
  title,
  ...props
}: Readonly<PremiumArticleCardProps>) {
  return (
    <Link
      className={cn(
        "group flex min-h-32 min-w-0 flex-col justify-between rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-subtle)] bg-white p-4 shadow-[var(--ui-shadow-sm)] transition [transition-duration:var(--ui-motion-base)] [transition-timing-function:var(--ui-ease-emphasized)] hover:-translate-y-0.5 hover:border-[color:var(--ui-color-border-gold)] hover:shadow-[var(--ui-shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className
      )}
      href={href}
      {...props}
    >
      {coverImage ? (
        // Fixed 16:9 box reserves the space before the image loads, so a cover can never
        // shift the card (CLS). `sizes` keeps mobile from downloading a desktop-width file.
        <span className="relative mb-3 block aspect-[16/9] w-full overflow-hidden rounded-[var(--ui-radius-lg)] bg-[color:var(--ui-color-surface-muted,#f5f2ec)]">
          <Image
            alt={coverImage.alt}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={coverImage.src}
          />
        </span>
      ) : (
        <SymbolMark className="size-10" iconKey={iconKey} label={title} />
      )}
      <span className="min-w-0">
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-[color:var(--ui-color-text-primary)]">
          {title}
        </span>
        {category || date ? (
          <span className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-[0.68rem] font-medium text-[color:var(--ui-color-text-muted)]">
            {category ? <span className="break-words">{category}</span> : null}
            {category && date ? <span aria-hidden="true">/</span> : null}
            {date ? <span className="break-words">{date}</span> : null}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export type PremiumConsultationCardProps =
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    iconKey?: FeatureIconKey;
    label: string;
    status?: PremiumStatusTone;
  };

export function PremiumConsultationCard({
  className,
  href,
  iconKey = "Consult",
  label,
  status = "LIVE",
  ...props
}: Readonly<PremiumConsultationCardProps>) {
  return (
    <Link
      className={cn(
        "flex min-h-28 min-w-0 items-center justify-between gap-4 rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-gold)] bg-white p-4 shadow-[var(--ui-shadow-sm)] transition [transition-duration:var(--ui-motion-base)] [transition-timing-function:var(--ui-ease-emphasized)] hover:-translate-y-0.5 hover:shadow-[var(--ui-shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className
      )}
      href={href}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-3">
        <SymbolMark iconKey={iconKey} label={label} />
        <span className="line-clamp-2 break-words text-sm font-semibold leading-snug text-[color:var(--ui-color-text-primary)]">
          {label}
        </span>
      </span>
      <PremiumStatusBadge status={status} />
    </Link>
  );
}

export type PremiumStatePanelProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  state: PremiumStateTone;
  title: string;
};

export function PremiumStatePanel({
  action,
  className,
  state,
  title,
  ...props
}: Readonly<PremiumStatePanelProps>) {
  return (
    <Card
      aria-live={state === "loading" ? "polite" : undefined}
      className={cn("flex min-w-0 items-center justify-between gap-4", className)}
      tone={state === "error" ? "accent" : "muted"}
      {...props}
    >
      <span className="min-w-0 text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
        {title}
      </span>
      {action ? <span className="shrink-0">{action}</span> : null}
    </Card>
  );
}

export type PremiumIconButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    "aria-label": string;
  };

export function PremiumIconButton({
  children,
  className,
  type = "button",
  ...props
}: Readonly<PremiumIconButtonProps>) {
  return (
    <button
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--ui-radius-pill)] border border-[color:var(--ui-color-border-subtle)] bg-white text-[color:var(--ui-color-text-primary)] shadow-[var(--ui-shadow-sm)] transition [transition-duration:var(--ui-motion-base)] [transition-timing-function:var(--ui-ease-emphasized)] hover:-translate-y-0.5 hover:border-[color:var(--ui-color-border-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export type { NavagrahaIconRegistryKey };
