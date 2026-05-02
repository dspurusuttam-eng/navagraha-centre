import { cn } from "@/lib/cn";

type PatternProps = {
  className?: string;
};

type DividerProps = {
  className?: string;
  tone?: "light" | "dark";
};

type CornerFlourishProps = {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export function SacredGeometryPattern({
  className,
}: Readonly<PatternProps>) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <svg
        className="h-full w-full text-[rgba(184,137,67,0.62)]"
        viewBox="0 0 1200 520"
        fill="none"
      >
        <circle cx="190" cy="96" r="128" stroke="currentColor" strokeWidth="1.2" opacity="0.26" />
        <circle cx="190" cy="96" r="86" stroke="currentColor" strokeWidth="1" opacity="0.34" />
        <circle cx="1032" cy="412" r="146" stroke="currentColor" strokeWidth="1.2" opacity="0.24" />
        <circle cx="1032" cy="412" r="96" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path
          d="M584 68 L620 172 L726 172 L640 234 L672 338 L584 276 L496 338 L528 234 L442 172 L548 172 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.22"
        />
        <path d="M584 70 V338 M442 172 H726" stroke="currentColor" strokeWidth="1" opacity="0.18" />
      </svg>
    </div>
  );
}

export function OmMandalaWatermark({
  className,
}: Readonly<PatternProps>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-56 w-56 rounded-full border border-[rgba(184,137,67,0.16)]",
        className,
      )}
    >
      <div className="absolute inset-3 rounded-full border border-[rgba(184,137,67,0.16)]" />
      <div className="absolute inset-8 rounded-full border border-dashed border-[rgba(184,137,67,0.14)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-[family-name:var(--font-display)] text-[2.75rem] text-[rgba(184,137,67,0.22)]">
          {"\u0950"}
        </span>
      </div>
    </div>
  );
}

export function GoldSectionDivider({
  className,
  tone = "light",
}: Readonly<DividerProps>) {
  const lineColor =
    tone === "dark"
      ? "from-transparent via-[rgba(244,213,143,0.48)] to-transparent"
      : "from-transparent via-[rgba(184,137,67,0.42)] to-transparent";
  const accentColor =
    tone === "dark"
      ? "border-[rgba(244,213,143,0.54)] bg-[rgba(244,213,143,0.16)] text-[#f8e4a8]"
      : "border-[rgba(184,137,67,0.42)] bg-[rgba(255,249,236,0.86)] text-[var(--color-trust-text)]";

  return (
    <div aria-hidden="true" className={cn("pointer-events-none py-4", className)}>
      <div className={cn("mx-auto h-px w-full max-w-5xl bg-gradient-to-r", lineColor)} />
      <div className="-mt-2 flex justify-center">
        <span
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[0.62rem] shadow-[0_6px_14px_rgba(86,64,35,0.14)]",
            accentColor,
          )}
        >
          *
        </span>
      </div>
    </div>
  );
}

export function CornerFlourish({
  className,
  position = "top-right",
}: Readonly<CornerFlourishProps>) {
  const positionClass =
    position === "top-left"
      ? "left-4 top-4"
      : position === "bottom-left"
        ? "bottom-4 left-4"
        : position === "bottom-right"
          ? "bottom-4 right-4"
          : "right-4 top-4";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      className={cn(
        "pointer-events-none absolute h-16 w-16 text-[rgba(184,137,67,0.34)]",
        positionClass,
        className,
      )}
      fill="none"
    >
      <path d="M14 82 C14 44 44 14 82 14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M26 82 C26 50 50 26 82 26" stroke="currentColor" strokeWidth="1.1" opacity="0.74" />
      <circle cx="82" cy="14" r="3.2" fill="currentColor" />
    </svg>
  );
}

export function SoftIvoryGlow({
  className,
}: Readonly<PatternProps>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,248,230,0.7),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(232,198,135,0.28),transparent_30%),radial-gradient(circle_at_50%_96%,rgba(185,139,70,0.16),transparent_42%)]",
        className,
      )}
    />
  );
}

export function ParchmentTextureLayer({
  className,
}: Readonly<PatternProps>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(248,236,213,0.1) 100%), repeating-linear-gradient(0deg, rgba(185,139,70,0.05) 0px, rgba(185,139,70,0.05) 1px, transparent 1px, transparent 5px)",
      }}
    />
  );
}
