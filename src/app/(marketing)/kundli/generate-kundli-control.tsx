"use client";

import { buttonStyles } from "@/components/ui/button";

type KundliPlanet = {
  name: string;
  longitude: number;
  sign: string;
  degree_in_sign: number;
  nakshatra: string;
  pada: number;
  house: number;
};

export type KundliChartPayload = {
  chart: {
    birth_context?: {
      date_local?: string;
      time_local?: string;
      place?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
      birth_utc?: string;
    };
    settings?: { ayanamsha?: string };
    lagna?: { sign?: string; degree_in_sign?: number };
    houses: Array<{ house: number; sign: string }>;
    planets: KundliPlanet[];
    verification?: {
      verification_status?: "VERIFIED" | "WARNINGS" | "FAILED";
      warnings?: unknown[];
      errors?: unknown[];
    };
  };
};

export type KundliGenerateState =
  | { status: "idle"; message: string }
  | { status: "validating"; message: string }
  | { status: "saving"; message: string }
  | { status: "generating"; message: string }
  | { status: "error"; message: string }
  | { status: "success"; message: string; payload: KundliChartPayload };

type KundliGenerateControlProps = {
  state: KundliGenerateState;
  onGenerate: () => void;
  onCancelPending?: () => void;
  hasPendingDraft: boolean;
};

const kundliIncludes = [
  { label: "Lagna", icon: "lagna" },
  { label: "Rashi", icon: "rashi" },
  { label: "Navamsa", icon: "navamsa" },
  { label: "Graha", icon: "graha" },
  { label: "Dasha", icon: "dasha" },
  { label: "Gochar", icon: "gochar" },
] as const;

const resultSections = [
  "Birth Profile",
  "Chart",
  "Planetary Positions",
  "Basic Interpretation",
  "Next Step",
] as const;

type KundliIncludeIconName = (typeof kundliIncludes)[number]["icon"];

function KundliIncludeIcon({
  name,
}: Readonly<{ name: KundliIncludeIconName }>) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.9,
  };

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[color:var(--color-accent-strong)]"
      viewBox="0 0 24 24"
    >
      {name === "lagna" ? (
        <>
          <path {...commonProps} d="M4 17h16" />
          <path {...commonProps} d="M7 17a5 5 0 0 1 10 0" />
          <path {...commonProps} d="M12 4v3" />
          <path {...commonProps} d="M5.5 8.5l2 2" />
          <path {...commonProps} d="M18.5 8.5l-2 2" />
        </>
      ) : null}
      {name === "rashi" ? (
        <>
          <path
            {...commonProps}
            d="M17.5 16.5A7 7 0 0 1 7.5 6.5 7.2 7.2 0 0 0 16 15a7 7 0 0 0 1.5 1.5Z"
          />
          <path {...commonProps} d="M18 5.5h.01" />
          <path {...commonProps} d="M20 9h.01" />
        </>
      ) : null}
      {name === "navamsa" ? (
        <>
          <rect {...commonProps} x="5" y="5" width="14" height="14" rx="2.5" />
          <path {...commonProps} d="M9.7 5v14" />
          <path {...commonProps} d="M14.3 5v14" />
          <path {...commonProps} d="M5 9.7h14" />
          <path {...commonProps} d="M5 14.3h14" />
        </>
      ) : null}
      {name === "graha" ? (
        <>
          <circle {...commonProps} cx="12" cy="12" r="2.2" />
          <path
            {...commonProps}
            d="M4.8 12a7.2 3.9 0 1 0 14.4 0 7.2 3.9 0 1 0-14.4 0"
          />
          <path {...commonProps} d="M7 7a9.2 9.2 0 0 0 10 10" />
          <circle cx="18.5" cy="8" r="1.2" fill="currentColor" />
        </>
      ) : null}
      {name === "dasha" ? (
        <>
          <path {...commonProps} d="M7 4h10" />
          <path {...commonProps} d="M7 20h10" />
          <path {...commonProps} d="M9 4v4.5L12 12l3-3.5V4" />
          <path {...commonProps} d="M9 20v-4.5L12 12l3 3.5V20" />
        </>
      ) : null}
      {name === "gochar" ? (
        <>
          <circle {...commonProps} cx="12" cy="12" r="7" />
          <path {...commonProps} d="M5 12h14" />
          <path {...commonProps} d="M12 5a12 12 0 0 1 0 14" />
          <path {...commonProps} d="M12 5a12 12 0 0 0 0 14" />
        </>
      ) : null}
    </svg>
  );
}

export function isSupportedKundliChartPayload(
  payload: unknown
): payload is KundliChartPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as {
    chart?: { houses?: unknown; planets?: unknown };
  };

  return (
    Boolean(candidate.chart) &&
    Array.isArray(candidate.chart?.houses) &&
    Array.isArray(candidate.chart?.planets)
  );
}

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Unavailable";
  }

  return value
    .toLowerCase()
    .split(/[_\s-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatNumber(value: number | null | undefined, digits = 2) {
  return Number.isFinite(value ?? Number.NaN)
    ? Number(value).toFixed(digits)
    : "Unavailable";
}

function ResultLine({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0 rounded-[0.9rem] border border-[rgba(184,137,67,0.16)] bg-white px-3 py-2 shadow-[0_8px_18px_rgba(17,17,17,0.035)]">
      <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.82rem] font-semibold leading-5 text-[#111111]">
        {value}
      </p>
    </div>
  );
}

function KundliResultRenderer({ payload }: Readonly<{ payload: KundliChartPayload }>) {
  const chart = payload.chart;
  const context = chart.birth_context;
  const moonSign = chart.planets.find(
    (planet) => planet.name.toLowerCase() === "moon"
  )?.sign;

  return (
    <div className="space-y-3 rounded-[0.9rem] border border-[rgba(76,187,23,0.2)] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-4px_10px_rgba(76,187,23,0.035),0_7px_13px_rgba(17,17,17,0.045)]">
      <div>
        <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#2f7e16]">
          GENERATED RESULT
        </p>
        <p className="mt-1 text-[0.8rem] font-semibold leading-5 text-[color:var(--color-ink-body)]">
          Confirmed backend chart fields are shown below.
        </p>
      </div>

      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <ResultLine label="Date" value={context?.date_local ?? "Unavailable"} />
        <ResultLine label="Time" value={context?.time_local ?? "Unavailable"} />
        <ResultLine label="Birth Place" value={context?.place ?? "Unavailable"} />
        <ResultLine label="Timezone" value={context?.timezone ?? "Unavailable"} />
        <ResultLine
          label="Coordinates"
          value={`${formatNumber(context?.latitude, 4)}, ${formatNumber(
            context?.longitude,
            4
          )}`}
        />
        <ResultLine
          label="Ayanamsa"
          value={formatLabel(chart.settings?.ayanamsha)}
        />
        <ResultLine label="Lagna" value={formatLabel(chart.lagna?.sign)} />
        <ResultLine label="Moon Sign" value={formatLabel(moonSign)} />
      </div>

      <div className="space-y-2">
        <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          Graha Position
        </p>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {chart.planets.slice(0, 9).map((planet) => (
            <div
              key={`${planet.name}-${planet.house}-${planet.longitude}`}
              className="min-w-0 rounded-[0.85rem] border border-[rgba(184,137,67,0.16)] bg-white px-3 py-2"
            >
              <p className="text-[0.76rem] font-extrabold text-[#111111]">
                {formatLabel(planet.name)}
              </p>
              <p className="mt-1 text-[0.7rem] leading-5 text-[color:var(--color-ink-body)]">
                {formatLabel(planet.sign)} - House {planet.house} -{" "}
                {formatNumber(planet.degree_in_sign)} deg
              </p>
              <p className="text-[0.7rem] leading-5 text-[color:var(--color-ink-body)]">
                {formatLabel(planet.nakshatra)} Pada {planet.pada}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[0.85rem] border border-black/10 bg-white px-3 py-2 text-[0.72rem] font-semibold leading-5 text-[#4A4A4A]">
        Verification: {formatLabel(chart.verification?.verification_status)}.
        Warnings: {chart.verification?.warnings?.length ?? 0}. Errors:{" "}
        {chart.verification?.errors?.length ?? 0}.
      </div>
    </div>
  );
}

export function GenerateKundliControl({
  state,
  onGenerate,
  onCancelPending,
  hasPendingDraft,
}: Readonly<KundliGenerateControlProps>) {
  const isBusy = ["validating", "saving", "generating"].includes(state.status);
  const signInButtonClassName = buttonStyles({
    tone: "accent",
    size: "lg",
    className:
      "w-full justify-center rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.36)] tracking-[0.02em] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),inset_0_-5px_10px_rgba(17,17,17,0.08),0_12px_20px_rgba(184,137,67,0.18)]",
  }).replace(" uppercase ", " ");

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={isBusy}
        onClick={onGenerate}
        className={signInButtonClassName}
      >
        {isBusy ? "Generating Kundli..." : "Generate Kundli"}
      </button>

      <div
        role={state.status === "error" ? "alert" : "status"}
        className={`rounded-[0.85rem] border px-3 py-2 text-[0.74rem] font-semibold leading-5 ${
          state.status === "error"
            ? "border-[rgba(216,68,62,0.28)] text-[#9f302c]"
            : "border-[rgba(184,137,67,0.18)] text-[#4A4A4A]"
        }`}
      >
        {state.message}
      </div>

      {hasPendingDraft && onCancelPending ? (
        <button
          type="button"
          onClick={onCancelPending}
          className="text-[0.7rem] font-extrabold text-[color:var(--color-accent-strong)] underline decoration-[rgba(184,137,67,0.42)] underline-offset-4"
        >
          Clear saved details
        </button>
      ) : null}

      <div className="min-w-0 space-y-3 rounded-[1.05rem] border border-[rgba(184,137,67,0.22)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_12px_22px_rgba(17,17,17,0.06)]">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          KUNDLI INCLUDES
        </p>
        <div className="grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-6">
          {kundliIncludes.map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-[0.95rem] border border-[rgba(184,137,67,0.2)] bg-white px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-5px_10px_rgba(184,137,67,0.035),0_8px_14px_rgba(17,17,17,0.055)]"
            >
              <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(184,137,67,0.23)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_5px_10px_rgba(17,17,17,0.05)]">
                <KundliIncludeIcon name={item.icon} />
              </div>
              <p className="text-[0.68rem] font-extrabold leading-tight text-[#111111]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-2 rounded-[1.05rem] border border-[rgba(184,137,67,0.22)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_18px_rgba(17,17,17,0.055)]">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          RESULT
        </p>
        <div className="space-y-3 rounded-[0.9rem] border border-[rgba(76,187,23,0.2)] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-4px_10px_rgba(76,187,23,0.035),0_7px_13px_rgba(17,17,17,0.045)]">
          {state.status === "success" ? (
            <KundliResultRenderer payload={state.payload} />
          ) : (
            <>
              <p className="text-[0.8rem] font-semibold leading-5 text-[color:var(--color-ink-body)]">
                Kundli result will appear after generation.
              </p>
              <div className="grid gap-2 sm:grid-cols-5">
                {resultSections.map((section) => (
                  <div
                    key={section}
                    className="rounded-[0.75rem] border border-[rgba(184,137,67,0.18)] bg-white px-2 py-2 text-center text-[0.62rem] font-extrabold leading-tight text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_5px_10px_rgba(17,17,17,0.035)]"
                  >
                    {section}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
