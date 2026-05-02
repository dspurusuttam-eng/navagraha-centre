import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ServiceGraphicProps = {
  className?: string;
};

type ConsultationGraphicProps = ServiceGraphicProps & {
  monogram?: string;
  label?: string;
  ariaLabel?: string;
};

function GraphicFrame({
  className,
  children,
}: Readonly<{
  className?: string;
  children: ReactNode;
}>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.24)] bg-[linear-gradient(145deg,rgba(255,253,248,0.96)_0%,rgba(246,229,198,0.8)_100%)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(185,139,70,0.14),transparent_34%),radial-gradient(circle_at_82%_86%,rgba(185,139,70,0.12),transparent_34%)]" />
      {children}
    </div>
  );
}

export function PremiumReportsGraphic({
  className,
}: Readonly<ServiceGraphicProps>) {
  return (
    <GraphicFrame className={cn("h-28", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 320 120"
        className="absolute inset-0 h-full w-full text-[rgba(138,91,25,0.74)]"
        fill="none"
      >
        <path d="M52 24 H188 L220 56 V94 H52 Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M188 24 V56 H220" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
        <path d="M76 48 H170 M76 62 H196 M76 76 H162" stroke="currentColor" strokeWidth="1.3" opacity="0.66" />
        <rect x="228" y="36" width="56" height="56" rx="11" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="256" cy="64" r="16" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
        <path d="M248 64 H264 M256 56 V72" stroke="currentColor" strokeWidth="1.2" opacity="0.78" />
        <path d="M40 94 H208" stroke="currentColor" strokeWidth="1.1" opacity="0.38" />
      </svg>
    </GraphicFrame>
  );
}

export function ConsultationGraphic({
  className,
  monogram = "JPS",
  label = "Astrologer profile portrait placeholder",
  ariaLabel = "Astrologer profile portrait placeholder",
}: Readonly<ConsultationGraphicProps>) {
  return (
    <GraphicFrame className={cn("h-32", className)}>
      <div className="relative z-10 flex h-full items-center gap-4 px-4 sm:px-5">
        <div
          aria-label={ariaLabel}
          className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.4)] bg-[radial-gradient(circle_at_center,#fffef8_0%,#f2dcaf_100%)] font-[family-name:var(--font-display)] text-[0.98rem] tracking-[0.16em] text-[var(--color-trust-text)] shadow-[0_12px_28px_rgba(108,74,31,0.2)]"
        >
          <span className="absolute inset-2 rounded-full border border-[rgba(184,137,67,0.2)]" />
          <span className="absolute inset-4 rotate-45 border border-[rgba(184,137,67,0.18)]" />
          <span className="relative">{monogram}</span>
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.13em] text-[var(--color-trust-text)]">
            Consultation Authority
          </p>
          <p className="mobile-safe-text text-[length:var(--font-size-body-xs)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {label}
          </p>
        </div>
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 320 120"
        className="absolute inset-0 h-full w-full text-[rgba(138,91,25,0.46)]"
        fill="none"
      >
        <path d="M166 30 H280 M166 48 H292 M166 66 H268" stroke="currentColor" strokeWidth="1.35" />
      </svg>
    </GraphicFrame>
  );
}

export function EditorialDeskGraphic({
  className,
}: Readonly<ServiceGraphicProps>) {
  return (
    <GraphicFrame className={cn("h-28", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 320 120"
        className="absolute inset-0 h-full w-full text-[rgba(138,91,25,0.72)]"
        fill="none"
      >
        <path d="M54 84 L76 34 H210 L188 84 Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M88 52 H176 M82 64 H168 M92 76 H158" stroke="currentColor" strokeWidth="1.3" opacity="0.68" />
        <path d="M226 32 L262 58 L216 92 L202 96 L208 80 Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M236 44 L248 52 M230 74 L242 82" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      </svg>
    </GraphicFrame>
  );
}

export function SpiritualShopGraphic({
  className,
}: Readonly<ServiceGraphicProps>) {
  return (
    <GraphicFrame className={cn("h-28", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 320 120"
        className="absolute inset-0 h-full w-full text-[rgba(138,91,25,0.72)]"
        fill="none"
      >
        <circle cx="82" cy="62" r="22" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="82" cy="62" r="9" stroke="currentColor" strokeWidth="1.3" opacity="0.72" />
        <path d="M128 40 H220 L238 62 L220 84 H128 L110 62 Z" stroke="currentColor" strokeWidth="1.65" />
        <path d="M146 50 H202 M138 62 H210 M146 74 H202" stroke="currentColor" strokeWidth="1.2" opacity="0.62" />
        <path d="M262 82 h20" stroke="currentColor" strokeWidth="1.2" opacity="0.62" />
        <path d="M272 70 c-4-2-8-8-8-13 0-4 3-7 8-9 5 2 8 5 8 9 0 5-4 11-8 13z" stroke="currentColor" strokeWidth="1.2" opacity="0.86" />
      </svg>
    </GraphicFrame>
  );
}
