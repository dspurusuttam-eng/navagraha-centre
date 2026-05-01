import { NavagrahaAiIcon } from "@/components/icons/astrology-icons";
import { Card } from "@/components/ui/card";

type GraphicClassNameProps = {
  className?: string;
};

type PortraitPlaceholderProps = {
  monogram: string;
  label: string;
  ariaLabel: string;
};

type ServiceVisualVariant = "report" | "consultation" | "editorial" | "shop";

const orbitDots = [
  "left-[50%] top-[6%]",
  "right-[17%] top-[16%]",
  "right-[7%] top-[50%]",
  "right-[18%] bottom-[16%]",
  "left-[50%] bottom-[6%]",
  "left-[17%] bottom-[16%]",
  "left-[7%] top-[50%]",
  "left-[18%] top-[16%]",
] as const;

const intelligenceSteps = [
  "Birth Chart",
  "Dasha",
  "Transit",
  "Yoga / Rules",
  "AI Guidance",
] as const;

export function SacredGeometryPattern({
  className = "",
}: Readonly<GraphicClassNameProps>) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`.trim()}
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[rgba(184,137,67,0.14)]" />
      <div className="absolute -right-8 top-10 h-28 w-28 rotate-45 border border-[rgba(184,137,67,0.13)]" />
      <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full border border-[rgba(184,137,67,0.1)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(185,139,70,0.08),transparent_28%),radial-gradient(circle_at_82%_80%,rgba(200,132,62,0.08),transparent_32%)]" />
    </div>
  );
}

export function GoldZodiacWheel({
  className = "",
}: Readonly<GraphicClassNameProps>) {
  return (
    <svg
      aria-hidden="true"
      className={`text-[rgba(142,94,28,0.76)] ${className}`.trim()}
      viewBox="0 0 240 240"
      fill="none"
    >
      <circle cx="120" cy="120" r="104" stroke="currentColor" strokeWidth="1" opacity="0.42" />
      <circle cx="120" cy="120" r="94" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="120" cy="120" r="64" stroke="currentColor" strokeWidth="1" opacity="0.56" />
      <circle cx="120" cy="120" r="36" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
      <path
        d="M120 27 L142 98 L216 98 L156 140 L180 212 L120 168 L60 212 L84 140 L24 98 L98 98 Z"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.58"
      />
      <path
        d="M120 54 C154 54 186 86 186 120 C186 154 154 186 120 186 C86 186 54 154 54 120 C54 86 86 54 120 54 Z"
        stroke="currentColor"
        strokeDasharray="4 7"
        strokeWidth="1"
        opacity="0.54"
      />
      <path
        d="M120 27 V213 M27 120 H213 M55 55 L185 185 M185 55 L55 185"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.3"
      />
      <path
        d="M82 82 C104 68 136 68 158 82 M82 158 C104 172 136 172 158 158"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.42"
      />
    </svg>
  );
}

export function VedicHeroIllustration() {
  return (
    <Card className="home-reveal home-reveal-delay-2 border-[rgba(184,137,67,0.3)] bg-[linear-gradient(160deg,rgba(255,255,255,0.97)_0%,rgba(252,244,232,0.95)_56%,rgba(245,229,199,0.94)_100%)] shadow-[0_26px_60px_rgba(95,67,28,0.14)]">
      <div className="relative mx-auto min-h-[22rem] max-w-[30rem] overflow-hidden rounded-[calc(var(--radius-card)-0.25rem)] sm:min-h-[24rem]">
        <SacredGeometryPattern />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.9)_0%,rgba(248,236,213,0.7)_44%,rgba(229,196,132,0.28)_78%,transparent_100%)]" />
        <div className="absolute left-1/2 top-[42%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(184,137,67,0.2)] sm:h-72 sm:w-72" />
        <div className="absolute left-1/2 top-[42%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(184,137,67,0.32)] sm:h-60 sm:w-60" />
        <div className="absolute left-1/2 top-[42%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[rgba(184,137,67,0.28)] sm:h-48 sm:w-48" />
        <div className="absolute left-1/2 top-[42%] h-px w-72 -translate-x-1/2 bg-[rgba(184,137,67,0.14)]" />
        <div className="absolute left-1/2 top-[42%] h-72 w-px -translate-y-1/2 bg-[rgba(184,137,67,0.14)]" />

        {orbitDots.map((position) => (
          <span
            key={position}
            className={`absolute h-2.5 w-2.5 rounded-full bg-[rgba(184,137,67,0.62)] shadow-[0_0_0_7px_rgba(184,137,67,0.08)] ${position}`}
          />
        ))}

        <GoldZodiacWheel className="absolute left-1/2 top-[42%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 sm:h-64 sm:w-64" />

        <div className="absolute left-1/2 top-[42%] flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(184,137,67,0.42)] bg-[radial-gradient(circle_at_center,#fffdf7_0%,#f5e2ba_100%)] shadow-[0_18px_42px_rgba(113,81,33,0.18)] sm:h-36 sm:w-36">
          <div className="flex h-20 w-20 rotate-45 items-center justify-center border border-[rgba(184,137,67,0.34)] bg-[rgba(255,255,255,0.42)]">
            <span className="-rotate-45 font-[family-name:var(--font-display)] text-[1.55rem] tracking-[0.12em] text-[var(--color-trust-text)]">
              NC
            </span>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 grid w-[min(88%,23rem)] -translate-x-1/2 grid-cols-2 gap-3">
          {[0, 1].map((page) => (
            <div
              key={page}
              className="relative h-16 rounded-[1.1rem] border border-[rgba(184,137,67,0.24)] bg-[rgba(255,253,248,0.84)] shadow-[var(--shadow-sm)]"
            >
              <span className="absolute left-1/2 top-3 h-px w-[82%] -translate-x-1/2 bg-[rgba(184,137,67,0.32)]" />
              <span className="absolute left-1/2 top-7 h-px w-[68%] -translate-x-1/2 bg-[rgba(184,137,67,0.22)]" />
              <span className="absolute left-1/2 top-11 h-px w-[76%] -translate-x-1/2 bg-[rgba(184,137,67,0.18)]" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-[5.6rem] left-1/2 h-10 w-10 -translate-x-1/2">
          <span className="absolute bottom-0 left-1/2 h-4 w-7 -translate-x-1/2 rounded-b-full border border-[rgba(184,137,67,0.35)] bg-[rgba(255,248,232,0.9)]" />
          <span className="absolute bottom-3 left-1/2 h-6 w-3 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,235,176,0.96)_0%,rgba(200,132,62,0.48)_100%)] shadow-[0_0_22px_rgba(200,132,62,0.34)]" />
        </div>
      </div>
    </Card>
  );
}

export function ConsultationPlaceholderGraphic({
  monogram,
  label,
  ariaLabel,
}: Readonly<PortraitPlaceholderProps>) {
  return (
    <div className="text-center">
      <div
        aria-label={ariaLabel}
        className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(184,137,67,0.42)] bg-[radial-gradient(circle_at_center,#fffdf7_0%,#f4dfb4_100%)] font-[family-name:var(--font-display)] text-[1.05rem] tracking-[0.16em] text-[var(--color-trust-text)] shadow-[0_14px_30px_rgba(113,81,33,0.14)]"
      >
        <span className="absolute inset-2 rounded-full border border-[rgba(184,137,67,0.22)]" />
        <span className="absolute inset-4 rotate-45 border border-[rgba(184,137,67,0.18)]" />
        <span className="relative">{monogram}</span>
      </div>
      <p className="mt-2 max-w-32 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        {label}
      </p>
    </div>
  );
}

export function AiMandalaGraphic() {
  return (
    <div className="relative mx-auto min-h-[20rem] w-full max-w-[24rem] overflow-hidden rounded-[var(--radius-card)] border border-[rgba(184,137,67,0.24)] bg-[rgba(255,253,248,0.62)] p-5 shadow-[var(--shadow-sm)]">
      <SacredGeometryPattern />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(185,139,70,0.16),transparent_35%)]" />
      <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(184,137,67,0.4)] bg-[rgba(255,255,255,0.72)]">
        <span className="absolute h-20 w-20 rounded-full border border-dashed border-[rgba(184,137,67,0.36)]" />
        <span className="absolute h-14 w-14 rotate-45 border border-[rgba(184,137,67,0.28)]" />
        <span className="absolute h-px w-40 bg-[rgba(184,137,67,0.14)]" />
        <span className="absolute h-40 w-px bg-[rgba(184,137,67,0.14)]" />
        <NavagrahaAiIcon className="relative h-12 w-12" />
      </div>
      <div className="relative grid gap-2">
        {intelligenceSteps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.76)] px-3 py-2 shadow-[var(--shadow-xs)]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.32)] bg-[rgba(246,229,196,0.74)] text-[0.66rem] text-[var(--color-trust-text)]">
              {index + 1}
            </span>
            <span className="mobile-safe-text text-[0.68rem] uppercase tracking-[0.12em] text-[var(--color-trust-text)]">
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServiceVisualGraphic({
  variant,
}: Readonly<{ variant: ServiceVisualVariant }>) {
  return (
    <div className="relative h-24 overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.22)] bg-[linear-gradient(135deg,rgba(255,253,248,0.92)_0%,rgba(246,230,199,0.72)_100%)]">
      <SacredGeometryPattern className="opacity-70" />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-[rgba(142,94,28,0.64)]"
        viewBox="0 0 240 96"
        fill="none"
      >
        {variant === "consultation" ? (
          <>
            <circle cx="74" cy="37" r="16" stroke="currentColor" strokeWidth="1.6" />
            <path d="M42 78 C48 58 62 50 74 50 C88 50 102 58 108 78" stroke="currentColor" strokeWidth="1.6" />
            <path d="M138 27 H198 M138 46 H210 M138 65 H186" stroke="currentColor" strokeWidth="1.4" opacity="0.62" />
          </>
        ) : null}

        {variant === "editorial" ? (
          <>
            <path d="M58 68 L76 28 L166 28 L148 68 Z" stroke="currentColor" strokeWidth="1.6" />
            <path d="M88 42 H146 M82 54 H136" stroke="currentColor" strokeWidth="1.3" opacity="0.62" />
            <path d="M172 24 L194 46 L158 76 L146 80 L150 66 Z" stroke="currentColor" strokeWidth="1.5" />
          </>
        ) : null}

        {variant === "shop" ? (
          <>
            <circle cx="72" cy="48" r="20" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="72" cy="48" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
            <path d="M122 28 H188 L202 48 L188 68 H122 L108 48 Z" stroke="currentColor" strokeWidth="1.6" />
            <path d="M142 38 H176 M134 48 H184 M142 58 H176" stroke="currentColor" strokeWidth="1.1" opacity="0.58" />
          </>
        ) : null}

        {variant === "report" ? (
          <>
            <path d="M62 22 H162 L184 44 V78 H62 Z" stroke="currentColor" strokeWidth="1.6" />
            <path d="M162 22 V44 H184 M84 42 H142 M84 55 H164 M84 68 H136" stroke="currentColor" strokeWidth="1.3" opacity="0.62" />
            <circle cx="58" cy="24" r="12" stroke="currentColor" strokeWidth="1.1" opacity="0.48" />
          </>
        ) : null}
      </svg>
    </div>
  );
}

export function FinalCtaOrnament() {
  return (
    <>
      <SacredGeometryPattern className="opacity-80" />
      <span className="pointer-events-none absolute right-6 top-6 h-20 w-20 rounded-full border border-[rgba(184,137,67,0.18)]" />
      <span className="pointer-events-none absolute right-12 top-12 h-8 w-8 rotate-45 border border-[rgba(184,137,67,0.2)]" />
      <span className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 rounded-full border border-[rgba(184,137,67,0.14)]" />
      <span className="pointer-events-none absolute bottom-8 left-12 h-6 w-3 rounded-full bg-[linear-gradient(180deg,rgba(255,235,176,0.72)_0%,rgba(200,132,62,0.28)_100%)] shadow-[0_0_22px_rgba(200,132,62,0.22)]" />
    </>
  );
}
