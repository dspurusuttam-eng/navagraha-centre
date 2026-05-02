import Image from "next/image";
import {
  GoldZodiacWheel,
  SacredGeometryPattern,
} from "@/components/graphics/premium-vedic-graphics";
import { cn } from "@/lib/cn";

type HomepageHeroArtProps = {
  className?: string;
};

const sparklePositions = [
  "left-[12%] top-[14%]",
  "left-[22%] top-[8%]",
  "left-[80%] top-[16%]",
  "left-[88%] top-[28%]",
  "left-[84%] top-[70%]",
  "left-[18%] top-[74%]",
  "left-[28%] top-[84%]",
  "left-[70%] top-[86%]",
] as const;

const rudrakshaBeadPositions = [
  "left-[16%] top-[46%]",
  "left-[20%] top-[52%]",
  "left-[24%] top-[58%]",
  "left-[78%] top-[46%]",
  "left-[74%] top-[52%]",
  "left-[70%] top-[58%]",
] as const;

export function HomepageHeroArt({
  className,
}: Readonly<HomepageHeroArtProps>) {
  return (
    <div
      className={cn(
        "home-reveal home-reveal-delay-2 relative mx-auto w-full max-w-[32rem]",
        className,
      )}
    >
      <div className="relative min-h-[20.5rem] overflow-hidden rounded-[var(--radius-card)] border border-[rgba(184,137,67,0.32)] bg-[linear-gradient(160deg,rgba(255,255,255,0.98)_0%,rgba(253,245,233,0.95)_50%,rgba(245,227,195,0.94)_100%)] shadow-[0_26px_64px_rgba(95,67,28,0.16)] sm:min-h-[23rem] lg:min-h-[25rem]">
        <SacredGeometryPattern className="opacity-75" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_52%_28%,rgba(255,255,255,0.96)_0%,rgba(250,236,206,0.72)_44%,rgba(218,174,96,0.3)_76%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(185,139,70,0.14),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(185,139,70,0.16),transparent_36%),radial-gradient(circle_at_50%_98%,rgba(185,139,70,0.14),transparent_40%)]"
        />

        <GoldZodiacWheel className="absolute left-1/2 top-[42%] h-[16.5rem] w-[16.5rem] -translate-x-1/2 -translate-y-1/2 text-[rgba(144,95,26,0.78)] sm:h-[18.25rem] sm:w-[18.25rem] lg:h-[20rem] lg:w-[20rem]" />

        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[42%] h-[14.25rem] w-[14.25rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(184,137,67,0.24)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[42%] h-[11rem] w-[11rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(184,137,67,0.34)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[42%] h-[8.5rem] w-[8.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[rgba(184,137,67,0.38)]"
        />

        <svg
          aria-hidden="true"
          className="absolute left-1/2 top-[42%] h-[12.5rem] w-[12.5rem] -translate-x-1/2 -translate-y-1/2 text-[rgba(135,90,26,0.78)] sm:h-[13.5rem] sm:w-[13.5rem]"
          viewBox="0 0 220 220"
          fill="none"
        >
          <path d="M110 26 L194 110 L110 194 L26 110 Z" stroke="currentColor" strokeWidth="2" />
          <path d="M110 64 L156 110 L110 156 L64 110 Z" stroke="currentColor" strokeWidth="1.5" opacity="0.72" />
          <path d="M110 26 V194 M26 110 H194" stroke="currentColor" strokeWidth="1.2" opacity="0.56" />
          <path d="M68 68 H152 V152 H68 Z" stroke="currentColor" strokeWidth="1.4" opacity="0.68" />
          <path d="M86 86 H134 V134 H86 Z" stroke="currentColor" strokeWidth="1.2" opacity="0.52" />
          <circle cx="110" cy="110" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.72" />
        </svg>

        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[42%] flex h-[6.6rem] w-[6.6rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(184,137,67,0.42)] bg-[radial-gradient(circle_at_center,#fffef9_0%,#f8e6c4_100%)] shadow-[0_18px_36px_rgba(110,79,33,0.2)] sm:h-[7.4rem] sm:w-[7.4rem]"
        >
          <Image
            src="/brand/navagraha-emblem.svg"
            alt="NAVAGRAHA emblem"
            width={74}
            height={74}
            priority
            className="h-[4.2rem] w-[4.2rem] sm:h-[4.6rem] sm:w-[4.6rem]"
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-[4.65rem] left-1/2 h-5 w-9 -translate-x-1/2 rounded-b-full border border-[rgba(184,137,67,0.3)] bg-[rgba(255,248,232,0.86)]"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[5.55rem] left-1/2 h-8 w-4 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,236,178,0.98)_0%,rgba(220,145,62,0.6)_100%)] shadow-[0_0_24px_rgba(220,145,62,0.36)]"
        />

        <div className="absolute bottom-4 left-1/2 grid w-[min(89%,24rem)] -translate-x-1/2 grid-cols-2 gap-3">
          {[0, 1].map((page) => (
            <div
              key={page}
              aria-hidden="true"
              className="relative h-[4.2rem] rounded-[1rem] border border-[rgba(184,137,67,0.24)] bg-[rgba(255,253,248,0.88)] shadow-[var(--shadow-sm)]"
            >
              <span className="absolute left-1/2 top-3 h-px w-[84%] -translate-x-1/2 bg-[rgba(184,137,67,0.32)]" />
              <span className="absolute left-1/2 top-7 h-px w-[70%] -translate-x-1/2 bg-[rgba(184,137,67,0.24)]" />
              <span className="absolute left-1/2 top-11 h-px w-[74%] -translate-x-1/2 bg-[rgba(184,137,67,0.2)]" />
            </div>
          ))}
        </div>

        {sparklePositions.map((position) => (
          <span
            key={position}
            aria-hidden="true"
            className={cn(
              "absolute h-2 w-2 rounded-full bg-[rgba(184,137,67,0.7)] shadow-[0_0_0_6px_rgba(184,137,67,0.09)]",
              position,
            )}
          />
        ))}

        {rudrakshaBeadPositions.map((position) => (
          <span
            key={position}
            aria-hidden="true"
            className={cn(
              "absolute h-2.5 w-2.5 rounded-full border border-[rgba(134,92,50,0.46)] bg-[radial-gradient(circle_at_30%_30%,rgba(215,156,87,0.85),rgba(129,84,41,0.88))]",
              position,
            )}
          />
        ))}
      </div>
    </div>
  );
}
