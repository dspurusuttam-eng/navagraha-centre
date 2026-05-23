import { NavagrahaAiIcon } from "@/components/icons/astrology-icons";
import { cn } from "@/lib/cn";

type NavagrahaAiGraphicProps = {
  className?: string;
  mode?: "banner" | "hero";
};

const predictiveFlow = [
  "Birth Chart",
  "Dasha",
  "Transit",
  "Yoga Rules",
  "NAVAGRAHA Intelligence Guidance",
] as const;

const networkNodes = [
  { x: 60, y: 72 },
  { x: 132, y: 40 },
  { x: 204, y: 76 },
  { x: 86, y: 142 },
  { x: 178, y: 140 },
  { x: 128, y: 196 },
] as const;

const networkLines = [
  "M60 72 L132 40 L204 76",
  "M60 72 L86 142 L128 196",
  "M204 76 L178 140 L128 196",
  "M86 142 L178 140",
  "M132 40 L128 196",
] as const;

export function NavagrahaAiGraphic({
  className,
  mode = "banner",
}: Readonly<NavagrahaAiGraphicProps>) {
  const isHero = mode === "hero";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mx-auto w-full max-w-[30rem] overflow-hidden rounded-[var(--radius-card)] border border-[rgba(212,175,55,0.28)] bg-[linear-gradient(145deg,#0f1224_0%,#141233_45%,#241438_100%)] shadow-[0_30px_78px_rgba(8,10,24,0.5)]",
        isHero ? "min-h-[22rem] p-4 sm:min-h-[24rem] sm:p-6" : "min-h-[19rem] p-4 sm:min-h-[22rem] sm:p-5",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(138,92,246,0.24),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(212,175,55,0.2),transparent_34%),radial-gradient(circle_at_50%_96%,rgba(212,175,55,0.14),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(244,213,143,0.1),transparent_52%)]" />

      <svg
        className="absolute inset-0 h-full w-full text-[rgba(244,213,143,0.68)]"
        viewBox="0 0 260 260"
        fill="none"
      >
        <circle cx="130" cy="98" r="84" stroke="currentColor" strokeWidth="1.25" opacity="0.5" />
        <circle cx="130" cy="98" r="58" stroke="currentColor" strokeWidth="1" opacity="0.44" />
        <path
          d="M130 22 L150 78 L210 78 L160 112 L178 170 L130 136 L82 170 L100 112 L50 78 L110 78 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.42"
        />
        <path
          d="M130 24 V172 M46 98 H214 M72 40 L188 156 M188 40 L72 156"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity="0.3"
        />
        <path d="M88 56 H172 V140 H88 Z" stroke="currentColor" strokeWidth="1" opacity="0.32" />
        <path d="M88 98 H172 M130 56 V140 M88 56 L172 140 M172 56 L88 140" stroke="currentColor" strokeWidth="0.9" opacity="0.26" />
      </svg>

      <svg
        className="absolute left-1/2 top-[40%] h-[13.5rem] w-[13.5rem] -translate-x-1/2 -translate-y-1/2 text-[rgba(244,213,143,0.78)] sm:h-[15.5rem] sm:w-[15.5rem]"
        viewBox="0 0 260 260"
        fill="none"
      >
        {networkLines.map((path) => (
          <path
            key={path}
            d={path}
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.58"
          />
        ))}
        {networkNodes.map((node) => (
          <circle
            key={`${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r="4"
            fill="currentColor"
            opacity="0.9"
          />
        ))}
      </svg>

      <div className="relative z-10 mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(244,213,143,0.42)] bg-[radial-gradient(circle_at_center,rgba(255,245,208,0.2)_0%,rgba(138,92,246,0.14)_54%,rgba(255,255,255,0.03)_100%)] shadow-[0_0_56px_rgba(212,175,55,0.28)] sm:h-32 sm:w-32">
        <span className="absolute h-20 w-20 rounded-full border border-dashed border-[rgba(244,213,143,0.42)] sm:h-24 sm:w-24" />
        <span className="absolute h-14 w-14 rotate-45 border border-[rgba(244,213,143,0.3)] sm:h-16 sm:w-16" />
        <NavagrahaAiIcon className="relative h-12 w-12 text-[rgba(255,244,202,0.96)] sm:h-14 sm:w-14" />
      </div>

      <div className="relative z-10 grid gap-2 sm:grid-cols-2">
        {predictiveFlow.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-2.5 rounded-[var(--radius-xl)] border border-[rgba(244,213,143,0.2)] bg-[rgba(255,255,255,0.08)] px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.2)] backdrop-blur"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(244,213,143,0.36)] bg-[rgba(212,175,55,0.14)] text-[0.66rem] text-[#f8e4a8]">
              {index + 1}
            </span>
            <span className="mobile-safe-text text-[0.66rem] uppercase tracking-[0.14em] text-[#f9efd3]">
              {step}
            </span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(9,8,17,0.46)_100%)]" />
      <div className="pointer-events-none absolute left-[14%] top-[18%] h-1.5 w-1.5 rounded-full bg-[rgba(244,213,143,0.78)] shadow-[0_0_0_6px_rgba(244,213,143,0.1)]" />
      <div className="pointer-events-none absolute left-[83%] top-[24%] h-1.5 w-1.5 rounded-full bg-[rgba(244,213,143,0.78)] shadow-[0_0_0_6px_rgba(244,213,143,0.1)]" />
      <div className="pointer-events-none absolute left-[20%] top-[82%] h-1 w-1 rounded-full bg-[rgba(244,213,143,0.72)] shadow-[0_0_0_5px_rgba(244,213,143,0.08)]" />
      <div className="pointer-events-none absolute left-[75%] top-[80%] h-1 w-1 rounded-full bg-[rgba(244,213,143,0.72)] shadow-[0_0_0_5px_rgba(244,213,143,0.08)]" />
    </div>
  );
}
