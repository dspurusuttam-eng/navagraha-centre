import Image from "next/image";
import { cn } from "@/lib/cn";

type NavagrahaLogoProps = {
  compact?: boolean;
  dark?: boolean;
  className?: string;
  subtitle?: string;
};

type NavagrahaEmblemProps = {
  size?: number;
  className?: string;
};

export function NavagrahaEmblem({
  size = 36,
  className,
}: Readonly<NavagrahaEmblemProps>) {
  return (
    <Image
      src="/brand/navagraha-emblem.svg"
      alt="NAVAGRAHA CENTRE emblem"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority
    />
  );
}

export function NavagrahaLogo({
  compact = false,
  dark = false,
  className,
  subtitle = "Vedic Astrology \u2022 AI Guidance",
}: Readonly<NavagrahaLogoProps>) {
  if (compact) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <NavagrahaEmblem size={34} />
        <span className="sr-only">NAVAGRAHA CENTRE</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <NavagrahaEmblem
        size={40}
        className={dark ? "drop-shadow-[0_0_10px_rgba(244,213,143,0.22)]" : "drop-shadow-[0_0_8px_rgba(185,139,70,0.18)]"}
      />
      <span className="min-w-0">
        <span
          className={cn(
            "block font-[family-name:var(--font-display)] text-[1.34rem] leading-none",
            dark ? "text-[#fff7e5]" : "text-[var(--color-ink-strong)]"
          )}
          style={{ letterSpacing: "0.1em" }}
        >
          NAVAGRAHA CENTRE
        </span>
        <span
          className={cn(
            "mt-1 block text-[0.58rem] uppercase tracking-[0.12em]",
            dark ? "text-[#f4d58f]" : "text-[var(--color-trust-text)]"
          )}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );
}
