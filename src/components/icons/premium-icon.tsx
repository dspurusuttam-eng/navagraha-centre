import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PremiumIconSize = "sm" | "md" | "lg" | "xl";
export type PremiumIconTone = "gold" | "green" | "neutral";

const sizeStyles: Record<PremiumIconSize, string> = {
  sm: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
  md: "h-11 w-11 [&_svg]:h-[1.35rem] [&_svg]:w-[1.35rem]",
  lg: "h-14 w-14 [&_svg]:h-7 [&_svg]:w-7",
  xl: "h-16 w-16 [&_svg]:h-8 [&_svg]:w-8",
};

const toneStyles: Record<PremiumIconTone, string> = {
  gold:
    "text-[#8A641A] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_14px_rgba(185,139,70,0.035),0_10px_20px_rgba(17,17,17,0.07)]",
  green:
    "text-[#2f7e16] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_14px_rgba(76,187,23,0.035),0_10px_20px_rgba(17,17,17,0.07)]",
  neutral:
    "text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-8px_14px_rgba(17,17,17,0.025),0_10px_20px_rgba(17,17,17,0.06)]",
};

type PremiumIconBaseProps = {
  icon: ReactNode;
  size?: PremiumIconSize;
  tone?: PremiumIconTone;
  active?: boolean;
  ariaLabel?: string;
  className?: string;
};

export function PremiumIconBase({
  icon,
  size = "md",
  tone = "gold",
  active = false,
  ariaLabel,
  className,
}: Readonly<PremiumIconBaseProps>) {
  return (
    <span
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white before:pointer-events-none before:absolute before:inset-[1px] before:rounded-full before:bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,255,255,0)_62%)] [&_svg]:relative [&_svg]:z-10 [&_svg]:fill-none [&_svg]:stroke-current",
        sizeStyles[size],
        toneStyles[tone],
        active && "ring-2 ring-[rgba(76,187,23,0.28)]",
        className
      )}
    >
      {icon}
    </span>
  );
}

type PremiumIconTileProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  href?: string;
  size?: PremiumIconSize;
  tone?: PremiumIconTone;
  active?: boolean;
  className?: string;
};

const tileClassName =
  "flex min-w-0 items-center gap-3 rounded-[1.25rem] bg-white p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-10px_20px_rgba(185,139,70,0.03),0_12px_24px_rgba(17,17,17,0.06)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]";

function PremiumIconTileContent({
  icon,
  label,
  description,
  size,
  tone,
  active,
}: Readonly<
  Pick<
    PremiumIconTileProps,
    "icon" | "label" | "description" | "size" | "tone" | "active"
  >
>) {
  return (
    <>
      <PremiumIconBase icon={icon} size={size} tone={tone} active={active} />
      <span className="min-w-0">
        <span className="block text-[0.92rem] font-extrabold leading-tight text-[#111111]">
          {label}
        </span>
        {description ? (
          <span className="mt-1 block text-[0.72rem] font-semibold leading-4 text-[#111111]/68">
            {description}
          </span>
        ) : null}
      </span>
    </>
  );
}

export function PremiumIconTile({
  icon,
  label,
  description,
  href,
  size = "md",
  tone = "gold",
  active = false,
  className,
}: Readonly<PremiumIconTileProps>) {
  const content = (
    <PremiumIconTileContent
      icon={icon}
      label={label}
      description={description}
      size={size}
      tone={tone}
      active={active}
    />
  );

  if (href) {
    return (
      <Link href={href} className={cn(tileClassName, className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn(tileClassName, className)}>{content}</div>;
}
