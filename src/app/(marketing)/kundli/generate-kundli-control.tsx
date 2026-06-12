"use client";

import { useState } from "react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonStyles } from "@/components/ui/button";

type KundliAccessStatus =
  | "unauthenticated"
  | "profile-incomplete"
  | "ready"
  | "unknown";

type KundliGenerateControlProps = {
  accessStatus: KundliAccessStatus;
  ctaMode: "sign-in" | "paused" | "prepared";
  signInHref: string;
  feature: string;
  note: string;
};

type GenerateState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "success"; payload: KundliChartPayload }
  | { status: "partial"; message: string; payload?: unknown }
  | { status: "error"; message: string };

const kundliIncludes = [
  { label: "Lagna", icon: "lagna" },
  { label: "Rashi", icon: "rashi" },
  { label: "Navamsa", icon: "navamsa" },
  { label: "Graha", icon: "graha" },
  { label: "Dasha", icon: "dasha" },
  { label: "Basic", icon: "basic" },
] as const;

type KundliIncludeIconName = (typeof kundliIncludes)[number]["icon"];

type KundliPlanet = {
  name: string;
  longitude: number;
  sign: string;
  degree_in_sign: number;
  nakshatra: string;
  pada: number;
  is_retrograde: boolean;
  is_combust: boolean;
  house: number;
  speed?: number | null;
  dignity?: string | null;
};

type KundliChartPayload = {
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
    settings?: {
      zodiac?: string;
      ayanamsha?: string;
      house_system?: string;
    };
    lagna?: {
      longitude?: number;
      sign?: string;
      degree_in_sign?: number;
    };
    houses: Array<{
      house: number;
      sign: string;
    }>;
    planets: KundliPlanet[];
    verification?: {
      is_verified_for_chart_logic?: boolean;
      verification_status?: "VERIFIED" | "WARNINGS" | "FAILED";
      warnings?: unknown[];
      errors?: unknown[];
    };
    divisionalReadiness?: Array<{
      code: string;
      title: string;
      status: string;
      note?: string;
    }>;
  };
};

function isSupportedChartPayload(payload: unknown): payload is KundliChartPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as {
    chart?: {
      houses?: unknown;
      planets?: unknown;
    };
  };

  return (
    Boolean(candidate.chart) &&
    Array.isArray(candidate.chart?.houses) &&
    Array.isArray(candidate.chart?.planets)
  );
}

function getSafeApiMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    error?: {
      code?: unknown;
      message?: unknown;
    };
    code?: unknown;
    message?: unknown;
  };
  const code =
    typeof candidate.error?.code === "string"
      ? candidate.error.code
      : typeof candidate.code === "string"
        ? candidate.code
        : "";

  if (
    code === "MISSING_BIRTH_PROFILE" ||
    code === "MISSING_COORDINATES" ||
    code === "INVALID_COORDINATES" ||
    code === "INVALID_BIRTH_INPUT" ||
    code === "INVALID_BIRTH_CONTEXT" ||
    code === "INCOMPLETE_CHART_DATA"
  ) {
    return "Verified birth profile details are required before Kundli generation can complete.";
  }

  if (code === "UNAUTHORIZED") {
    return "Please sign in again before generating your Kundli.";
  }

  if (code === "RATE_LIMITED") {
    return "Too many Kundli generation attempts. Please wait and try again.";
  }

  return null;
}

function readResultMessage(state: GenerateState, fallback: string) {
  switch (state.status) {
    case "generating":
      return "Generating Kundli...";
    case "success":
      return "Kundli generated successfully. Result details are ready below.";
    case "partial":
      return state.message;
    case "error":
      return state.message;
    default:
      return fallback;
  }
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
  if (!Number.isFinite(value ?? Number.NaN)) {
    return "Unavailable";
  }

  return Number(value).toFixed(digits);
}

function getMoonSign(planets: KundliPlanet[]) {
  return planets.find((planet) => planet.name.toLowerCase() === "moon")?.sign;
}

function getModuleStatuses(payload: KundliChartPayload) {
  const chart = payload.chart;
  const d9Readiness = chart.divisionalReadiness?.find(
    (entry) => entry.code === "D9"
  );

  return [
    {
      label: "Basic Details",
      status: chart.birth_context ? "Available" : "Unavailable",
    },
    {
      label: "Lagna Chart",
      status: chart.lagna && chart.houses.length ? "Available" : "Unavailable",
    },
    {
      label: "Rashi Chart",
      status: chart.houses.length && chart.planets.length ? "Available" : "Unavailable",
    },
    {
      label: "Navamsa",
      status:
        d9Readiness?.status === "available"
          ? "Available"
          : "Not included in this response",
    },
    {
      label: "Graha Position",
      status: chart.planets.length ? "Available" : "Unavailable",
    },
    {
      label: "Dasha",
      status: "Not included in this response",
    },
    {
      label: "Basic Interpretation",
      status: "Not included in this response",
    },
    {
      label: "Nakshatra",
      status: chart.planets.some((planet) => planet.nakshatra)
        ? "Available per graha"
        : "Unavailable",
    },
    {
      label: "Dosha / Yoga / Remedy",
      status: "Not included in this response",
    },
  ];
}

function KundliIncludeIcon({ name }: Readonly<{ name: KundliIncludeIconName }>) {
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
      className="h-6 w-6 text-[color:var(--color-accent-strong)]"
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
          <path {...commonProps} d="M4.8 12a7.2 3.9 0 1 0 14.4 0 7.2 3.9 0 1 0-14.4 0" />
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
      {name === "basic" ? (
        <>
          <rect {...commonProps} x="6" y="4" width="12" height="16" rx="2.4" />
          <path {...commonProps} d="M9 9h6" />
          <path {...commonProps} d="M9 12h6" />
          <path {...commonProps} d="M9 15h4" />
        </>
      ) : null}
    </svg>
  );
}

function ResultLine({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="min-w-0 rounded-[0.9rem] border border-[rgba(184,137,67,0.16)] bg-white px-3 py-2 shadow-[0_8px_18px_rgba(17,17,17,0.035)]">
      <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.82rem] font-semibold leading-5 text-[#111111]">
        {value || "Unavailable"}
      </p>
    </div>
  );
}

function KundliResultRenderer({
  payload,
}: Readonly<{
  payload: KundliChartPayload;
}>) {
  const chart = payload.chart;
  const context = chart.birth_context;
  const lagna = chart.lagna;
  const visiblePlanets = chart.planets.slice(0, 9);
  const hiddenPlanetCount = Math.max(0, chart.planets.length - visiblePlanets.length);
  const moonSign = getMoonSign(chart.planets);
  const verificationStatus = chart.verification?.verification_status ?? "Unavailable";
  const moduleStatuses = getModuleStatuses(payload);

  return (
    <div className="space-y-4 rounded-[1.15rem] border border-[rgba(76,187,23,0.22)] bg-white p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_30px_rgba(17,17,17,0.05)]">
      <div className="space-y-1">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#4CBB17]">
          Real backend result
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-[1rem] text-[#111111]">
          Kundli generated from verified profile details
        </h3>
        <p className="text-[0.78rem] leading-5 text-[color:var(--color-ink-body)]">
          Only confirmed response fields are shown here. Deeper analysis remains report or
          consultation-led.
        </p>
      </div>

      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <ResultLine label="Date" value={context?.date_local ?? "Unavailable"} />
        <ResultLine label="Time" value={context?.time_local ?? "Unavailable"} />
        <ResultLine label="Birth Place" value={context?.place ?? "Unavailable"} />
        <ResultLine label="Timezone" value={context?.timezone ?? "Unavailable"} />
        <ResultLine
          label="Coordinates"
          value={
            context
              ? `${formatNumber(context.latitude, 4)}, ${formatNumber(
                  context.longitude,
                  4
                )}`
              : "Unavailable"
          }
        />
        <ResultLine
          label="Ayanamsa"
          value={formatLabel(chart.settings?.ayanamsha)}
        />
      </div>

      <div className="grid min-w-0 gap-2 sm:grid-cols-3">
        <ResultLine label="Lagna" value={formatLabel(lagna?.sign)} />
        <ResultLine
          label="Lagna Degree"
          value={formatNumber(lagna?.degree_in_sign)}
        />
        <ResultLine label="Moon Sign" value={formatLabel(moonSign)} />
      </div>

      <div className="space-y-2">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          Graha Position
        </p>
        <div className="grid min-w-0 gap-2">
          {visiblePlanets.map((planet) => (
            <div
              key={`${planet.name}-${planet.house}-${planet.longitude}`}
              className="grid min-w-0 gap-2 rounded-[0.95rem] border border-[rgba(184,137,67,0.16)] bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(17,17,17,0.035)] sm:grid-cols-[1fr_1fr_0.8fr]"
            >
              <p className="min-w-0 text-[0.78rem] font-semibold text-[#111111]">
                {formatLabel(planet.name)}
              </p>
              <p className="min-w-0 text-[0.74rem] text-[color:var(--color-ink-body)]">
                {formatLabel(planet.sign)} - House {planet.house} -{" "}
                {formatNumber(planet.degree_in_sign)} deg
              </p>
              <p className="min-w-0 text-[0.72rem] text-[color:var(--color-ink-body)]">
                {formatLabel(planet.nakshatra)} Pada {planet.pada}
              </p>
            </div>
          ))}
        </div>
        {hiddenPlanetCount > 0 ? (
          <p className="text-[0.74rem] leading-5 text-[color:var(--color-ink-body)]">
            {hiddenPlanetCount} additional graha records are available in the backend response.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          Module Status
        </p>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {moduleStatuses.map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-center justify-between gap-3 rounded-[0.9rem] border border-black/8 bg-white px-3 py-2"
            >
              <span className="text-[0.76rem] font-semibold text-[#111111]">
                {item.label}
              </span>
              <span className="text-right text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--color-ink-body)]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[0.95rem] border border-[rgba(184,137,67,0.16)] bg-white px-3 py-2.5">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          Verification
        </p>
        <p className="mt-1 text-[0.78rem] leading-5 text-[color:var(--color-ink-body)]">
          Status: {formatLabel(verificationStatus)}. Warnings:{" "}
          {chart.verification?.warnings?.length ?? 0}. Errors:{" "}
          {chart.verification?.errors?.length ?? 0}.
        </p>
      </div>
    </div>
  );
}

function KundliStructuralSections({
  state,
}: Readonly<{
  state: GenerateState;
}>) {
  return (
    <div className="space-y-4">
      <div className="flex min-w-0 items-center justify-center rounded-[1rem] border border-[rgba(76,187,23,0.2)] bg-white px-3 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#4CBB17] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_18px_rgba(17,17,17,0.035)]">
        Date <span className="mx-2 text-[color:var(--color-accent-strong)]">{"\u2022"}</span>{" "}
        Time <span className="mx-2 text-[color:var(--color-accent-strong)]">{"\u2022"}</span>{" "}
        Place
      </div>

      <div className="min-w-0 space-y-3 rounded-[1.05rem] border border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[0_12px_28px_rgba(17,17,17,0.045)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Kundli Includes
          </p>
          <span className="rounded-[var(--radius-pill)] border border-black/8 bg-white px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[#111111]">
            Display only
          </span>
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-6">
          {kundliIncludes.map((item) => (
            <div
              key={item.label}
              className="min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_18px_rgba(17,17,17,0.04)]"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-[rgba(184,137,67,0.2)] bg-white shadow-[0_7px_16px_rgba(17,17,17,0.035)]">
                <KundliIncludeIcon name={item.icon} />
              </div>
              <p className="truncate text-[0.72rem] font-bold text-[#111111]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-3 rounded-[1.05rem] border border-[rgba(184,137,67,0.22)] bg-white p-3 shadow-[0_14px_30px_rgba(17,17,17,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Result
          </p>
          <span className="rounded-[var(--radius-pill)] border border-[rgba(76,187,23,0.18)] bg-white px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[#4CBB17]">
            Preview
          </span>
        </div>
        {state.status === "success" ? (
          <KundliResultRenderer payload={state.payload} />
        ) : (
          <div className="rounded-[0.95rem] border border-[rgba(184,137,67,0.16)] bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(17,17,17,0.035)]">
            <p className="text-[0.8rem] leading-5 text-[color:var(--color-ink-body)]">
              {state.status === "generating"
                ? "Generating Kundli..."
                : state.status === "partial" || state.status === "error"
                  ? state.message
                  : "Kundli result will appear after generation."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function GenerateKundliControl({
  accessStatus,
  ctaMode,
  signInHref,
  feature,
  note,
}: Readonly<KundliGenerateControlProps>) {
  const [state, setState] = useState<GenerateState>({ status: "idle" });
  const isGenerating = state.status === "generating";
  const canGenerate = accessStatus === "ready" && ctaMode === "prepared";
  const message = readResultMessage(state, note);

  async function handleGenerate() {
    if (!canGenerate || isGenerating) {
      return;
    }

    setState({ status: "generating" });

    try {
      const response = await fetch("/api/astrology/chart", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ source: "PROFILE" }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setState({
          status: "error",
          message:
            getSafeApiMessage(payload) ??
            "Unable to generate Kundli right now. Please try again.",
        });
        return;
      }

      if (!isSupportedChartPayload(payload)) {
        setState({
          status: "partial",
          message: "Kundli response was received, but supported chart fields were unavailable.",
          payload,
        });
        return;
      }

      setState({
        status: "success",
        payload,
      });
    } catch {
      setState({
        status: "error",
        message: "Unable to generate Kundli right now. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {ctaMode === "sign-in" ? (
          <TrackedLink
            href={signInHref}
            eventName="cta_click"
            eventPayload={{ page: "/kundli", feature }}
            className={buttonStyles({
              tone: "accent",
              size: "lg",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Generate Kundli
          </TrackedLink>
        ) : (
          <button
            type="button"
            disabled={!canGenerate || isGenerating}
            onClick={handleGenerate}
            className={buttonStyles({
              tone: canGenerate ? "accent" : "secondary",
              size: "lg",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Generate Kundli
          </button>
        )}
        <p className="text-[0.76rem] leading-5 text-[color:var(--color-ink-body)]">
          {message}
        </p>
      </div>
      <KundliStructuralSections state={state} />
    </div>
  );
}
