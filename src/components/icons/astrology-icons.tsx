import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/cn";

type AstrologyIconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

function IconFrame({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-trust-border)] bg-[var(--color-trust-bg)] text-[var(--color-trust-text)] shadow-[var(--shadow-xs)]",
        className
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function BaseIcon(props: Readonly<AstrologyIconProps>) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function KundliIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <IconFrame className={className}>
      <BaseIcon>
        <rect x="4" y="4" width="16" height="16" rx="2.4" />
        <path d="M4 12h16M12 4v16M4 4l16 16M20 4L4 20" />
      </BaseIcon>
    </IconFrame>
  );
}

export function NavagrahaAiIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <IconFrame className={className}>
      <BaseIcon>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </BaseIcon>
    </IconFrame>
  );
}

export function RashifalIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <IconFrame className={className}>
      <BaseIcon>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 4.5v15M4.5 12h15M7 7l10 10M17 7L7 17" />
      </BaseIcon>
    </IconFrame>
  );
}

export function ConsultationIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <IconFrame className={className}>
      <BaseIcon>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 19.5c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6" />
      </BaseIcon>
    </IconFrame>
  );
}

export function ReportIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <IconFrame className={className}>
      <BaseIcon>
        <path d="M7 3.8h8l3 3V20.2H7z" />
        <path d="M15 3.8v3h3M9.5 11h6M9.5 14.5h6M9.5 18h4.5" />
      </BaseIcon>
    </IconFrame>
  );
}
