"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/http";
import type { SavedKundliCatalogDto, SavedKundliRecordDto } from "@/modules/account/saved-kundli-service";
import type {
  DailyHoroscopeLocationInput,
  DailyHoroscopeViewModel,
} from "@/modules/astrology/horoscope/daily-horoscope-service";
import type {
  CanonicalLocationDateTime,
  LocationSearchResult,
} from "@/lib/location-timezone/types";

type HoroscopeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: DailyHoroscopeViewModel }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

type LocationState =
  | "saved"
  | "searching"
  | "results"
  | "resolving"
  | "manual"
  | "confirmed"
  | "error";

const ratingLabels: Record<string, string> = {
  strongly_supportive: "Strong support",
  supportive: "Supportive",
  mixed: "Mixed",
  cautionary: "Caution",
  strongly_cautionary: "Strong caution",
};

const confidenceLabels: Record<string, string> = {
  high: "High evidence coverage",
  moderate: "Moderate evidence coverage",
  low: "Limited evidence coverage",
  insufficient: "Insufficient evidence coverage",
};

function formatRating(value: string | null) {
  return value ? ratingLabels[value] ?? "Calculated" : "Unavailable";
}

function formatConfidence(value: string) {
  return confidenceLabels[value] ?? "Evidence coverage";
}

function formatSourceKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatQueryInstant(value: string | null, timezone: string | null) {
  if (!value || !timezone) {
    return "Unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Unavailable";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
      timeZoneName: "short",
    }).format(parsed);
  } catch {
    return parsed.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
}

function toLocalDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

function toLocationFromRecord(
  record: SavedKundliRecordDto | null
): DailyHoroscopeLocationInput | null {
  if (!record || record.latitude === null || record.longitude === null) {
    return null;
  }

  return {
    displayName: record.birthPlace,
    latitude: record.latitude,
    longitude: record.longitude,
    timezoneIana: record.timezone,
    countryName: record.country,
    region: record.region,
    city: record.city,
  };
}

function toLocationFromCanonical(
  resolved: CanonicalLocationDateTime
): DailyHoroscopeLocationInput {
  return {
    displayName: resolved.displayName,
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    timezoneIana: resolved.timezone,
    countryCode: resolved.countryCode,
    countryName: resolved.country,
    region: resolved.state,
    city: resolved.city,
  };
}

function ResultFact({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-[1rem] border border-[#E9DFC9] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F]">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  message,
}: Readonly<{
  title: string;
  message: string;
}>) {
  return (
    <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_14px_34px_rgba(17,17,17,0.05)] before:opacity-0">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F]">
        {title}
      </p>
      <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#333333]">
        {message}
      </p>
    </Card>
  );
}

function TechnicalDisclosure({
  title,
  children,
}: Readonly<{
  title: string;
  children: ReactNode;
}>) {
  return (
    <details className="rounded-[1rem] border border-[#E9DFC9] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(17,17,17,0.035)]">
      <summary className="cursor-pointer rounded-[0.65rem] text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2">
        {title}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function EvidenceList({
  title,
  items,
}: Readonly<{
  title: string;
  items: DailyHoroscopeViewModel["categories"][number]["supportiveEvidence"];
}>) {
  return (
    <details className="rounded-[1rem] border border-[#E9DFC9] bg-[#FFFDF8] px-3 py-2">
      <summary className="cursor-pointer rounded-[0.6rem] text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2">
        {title} ({items.length})
      </summary>
      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.slice(0, 4).map((item) => (
            <div key={`${item.ruleId}-${item.calculationReference}-${item.tier}`} className="space-y-1">
              <p className="break-words text-[0.82rem] text-[#111111]">
                {item.ruleId} - {formatSourceKey(item.sourceSystem)}
              </p>
              <p className="break-words text-[0.76rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                {item.referenceLabel || item.frame} - {item.calculationReference}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[0.78rem] text-[#4A4A4A]">No evidence token available.</p>
      )}
    </details>
  );
}

function ContradictionList({
  flags,
}: Readonly<{
  flags: string[];
}>) {
  if (!flags.length) {
    return null;
  }

  return (
    <details className="rounded-[1rem] border border-[#E9DFC9] bg-white px-3 py-2">
      <summary className="cursor-pointer rounded-[0.6rem] text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2">
        Contradiction notices ({flags.length})
      </summary>
      <ul className="mt-3 space-y-1 text-[0.82rem] leading-[var(--line-height-copy)] text-[#333333]">
        {flags.map((flag) => (
          <li key={flag}>{flag}</li>
        ))}
      </ul>
    </details>
  );
}

export function PremiumDailyHoroscopePanel({
  catalog,
  initialDate,
}: Readonly<{
  catalog: SavedKundliCatalogDto;
  initialDate?: string;
}>) {
  const records = catalog.records;
  const [selectedId, setSelectedId] = useState(
    catalog.activeRecordId ?? records[0]?.id ?? ""
  );
  const [localDate, setLocalDate] = useState(initialDate ?? toLocalDate());
  const [state, setState] = useState<HoroscopeState>({ status: "idle" });
  const [locationState, setLocationState] = useState<LocationState>("saved");
  const [locationMessage, setLocationMessage] = useState(
    "Saved Kundli place is selected for today's calculation."
  );
  const [calculationLocation, setCalculationLocation] =
    useState<DailyHoroscopeLocationInput | null>(() =>
      toLocationFromRecord(
        records.find((record) => record.id === (catalog.activeRecordId ?? records[0]?.id)) ??
          null
      )
    );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [manual, setManual] = useState({
    displayName: "",
    latitude: "",
    longitude: "",
    timezone: "",
  });

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId]
  );

  function resetGeneratedResult() {
    setState({ status: "idle" });
  }

  useEffect(() => {
    const nextLocation = toLocationFromRecord(selectedRecord);

    setCalculationLocation(nextLocation);
    setLocationState(nextLocation ? "saved" : "error");
    setLocationMessage(
      nextLocation
        ? "Saved Kundli place is selected for today's calculation."
        : "Saved Kundli is missing location coordinates. Use manual place fallback."
    );
    setState({ status: "idle" });
  }, [selectedRecord]);

  async function postLocation(payload: Record<string, unknown>) {
    const response = await fetch("/api/platform/location-timezone", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as
      | {
          results?: LocationSearchResult[];
          resolved?: CanonicalLocationDateTime;
        }
      | null;

    if (!response.ok) {
      throw new Error(getApiErrorMessage(data, "Location could not be resolved."));
    }

    return data;
  }

  async function handleSearch() {
    if (!query.trim()) {
      setLocationState("error");
      setLocationMessage("Enter a place before searching.");
      return;
    }

    setLocationState("searching");
    setLocationMessage("Searching places.");
    setResults([]);

    try {
      const payload = await postLocation({ mode: "search", query });
      const nextResults = payload?.results ?? [];

      setResults(nextResults);
      setLocationState(nextResults.length ? "results" : "error");
      setLocationMessage(
        nextResults.length
          ? "Select one result for calculation place."
          : "No matching place was found."
      );
    } catch (error) {
      setLocationState("error");
      setLocationMessage(error instanceof Error ? error.message : "Search failed.");
    }
  }

  async function resolvePlace(place: LocationSearchResult) {
    setLocationState("resolving");
    setLocationMessage("Resolving timezone for selected place.");

    try {
      const payload = await postLocation({
        mode: "resolve",
        source: "search",
        dateLocal: localDate,
        timeLocal: "12:00",
        place,
      });

      if (!payload?.resolved) {
        throw new Error("Selected place returned no resolved location.");
      }

      setCalculationLocation(toLocationFromCanonical(payload.resolved));
      resetGeneratedResult();
      setLocationState("confirmed");
      setLocationMessage("Calculation place and timezone are confirmed.");
    } catch (error) {
      setLocationState("error");
      setLocationMessage(error instanceof Error ? error.message : "Place resolution failed.");
    }
  }

  async function handleCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationState("error");
      setLocationMessage("Browser location is unavailable. Use search or manual entry.");
      return;
    }

    setLocationState("resolving");
    setLocationMessage("Browser permission may be requested now.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = await postLocation({
            mode: "resolve",
            source: "browser",
            dateLocal: localDate,
            timeLocal: "12:00",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: Number.isFinite(position.coords.accuracy)
              ? position.coords.accuracy
              : null,
          });

          if (!payload?.resolved) {
            throw new Error("Browser location returned no resolved place.");
          }

          setCalculationLocation(toLocationFromCanonical(payload.resolved));
          resetGeneratedResult();
          setLocationState("confirmed");
          setLocationMessage("Current location is confirmed for daily calculation.");
        } catch (error) {
          setLocationState("error");
          setLocationMessage(
            error instanceof Error ? error.message : "Current location resolution failed."
          );
        }
      },
      (error) => {
        setLocationState("error");
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Search and manual entry still work."
            : error.code === error.TIMEOUT
              ? "Location detection timed out. Search and manual entry still work."
              : "Location detection is unavailable. Search and manual entry still work."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8_000,
      }
    );
  }

  async function handleManualConfirm() {
    const latitude = Number(manual.latitude);
    const longitude = Number(manual.longitude);

    setLocationState("manual");
    setLocationMessage("Validating manual place and timezone.");

    try {
      const payload = await postLocation({
        mode: "resolve",
        source: "manual",
        dateLocal: localDate,
        timeLocal: "12:00",
        displayName: manual.displayName,
        latitude,
        longitude,
        timezone: manual.timezone,
      });

      if (!payload?.resolved) {
        throw new Error("Manual entry returned no resolved location.");
      }

      setCalculationLocation(toLocationFromCanonical(payload.resolved));
      resetGeneratedResult();
      setLocationState("confirmed");
      setLocationMessage("Manual calculation place is confirmed.");
    } catch (error) {
      setLocationState("error");
      setLocationMessage(error instanceof Error ? error.message : "Manual validation failed.");
    }
  }

  async function handleGenerate() {
    if (!selectedRecord) {
      setState({
        status: "unavailable",
        message: "Select a saved Kundli before generating daily guidance.",
      });
      return;
    }

    if (!calculationLocation) {
      setState({
        status: "unavailable",
        message: "Confirm calculation location before generating daily guidance.",
      });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/astrology/daily-horoscope", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          savedKundliId: selectedRecord.id,
          localDate,
          calculationLocation,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { data?: DailyHoroscopeViewModel }
        | null;

      if (!response.ok || !payload?.data) {
        throw new Error(
          getApiErrorMessage(payload, "Daily guidance calculation is unavailable.")
        );
      }

      setState({ status: "ready", data: payload.data });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Daily guidance could not be loaded.",
      });
    }
  }

  if (!records.length) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Saved Kundli required"
          message="Personal daily guidance appears after one saved Kundli is available in your account."
        />
        <Link href="/kundli" className={buttonStyles({ tone: "accent", size: "lg" })}>
          Create Kundli
        </Link>
      </div>
    );
  }

  const readyData = state.status === "ready" ? state.data : null;

  return (
    <div className="space-y-5">
      <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_16px_42px_rgba(17,17,17,0.055)] before:opacity-0 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="accent">Daily</Badge>
              <Badge tone="outline">Real saved Kundli</Badge>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] leading-[var(--line-height-tight)] text-[#111111] sm:text-[length:var(--font-size-title-lg)]">
              Personal daily Rashifal
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              Select a saved Kundli, confirm the calculation place, and generate today&apos;s calculation-backed guidance.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                Saved Kundli
              </span>
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.currentTarget.value)}
                className="min-h-11 rounded-[1rem] border border-[#E9DFC9] bg-white px-3 text-[0.92rem] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(17,17,17,0.045)]"
              >
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                Date
              </span>
              <input
                type="date"
                value={localDate}
                onChange={(event) => {
                  setLocalDate(event.currentTarget.value);
                  resetGeneratedResult();
                }}
                className="min-h-11 rounded-[1rem] border border-[#D9BE75] bg-white px-3 text-[0.92rem] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(17,17,17,0.045)] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2"
              />
            </label>
          </div>
        </div>

        {selectedRecord ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultFact label="Birth date" value={selectedRecord.dateOfBirth} />
            <ResultFact label="Birth time" value={selectedRecord.timeOfBirth ?? "Not available"} />
            <ResultFact label="Saved place" value={selectedRecord.birthPlace || "Not available"} />
          </div>
        ) : null}
      </Card>

      <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_16px_42px_rgba(17,17,17,0.05)] before:opacity-0 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                  Calculation place
                </p>
                <h3 className="mt-1 text-[length:var(--font-size-title-sm)] text-[#111111]">
                  Confirm daily location
                </h3>
              </div>
              <Badge tone={locationState === "error" ? "neutral" : "accent"}>
                {locationState === "confirmed" || locationState === "saved" ? "Ready" : "Check"}
              </Badge>
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              {locationMessage}
            </p>
            {calculationLocation ? (
              <div className="rounded-[1rem] border border-[#E9DFC9] bg-[#FFFDF8] px-4 py-3 text-[0.82rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                <p className="font-semibold text-[#111111]">{calculationLocation.displayName}</p>
                <p>{calculationLocation.timezoneIana}</p>
                <p>
                  {calculationLocation.latitude.toFixed(5)},{" "}
                  {calculationLocation.longitude.toFixed(5)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search calculation place"
                className="min-h-11 min-w-0 flex-1 rounded-[1rem] border border-[#D9BE75] bg-white px-3 text-[0.92rem] text-[#111111] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2"
              />
              <button
                type="button"
                onClick={handleSearch}
                className={buttonStyles({ tone: "secondary", size: "sm", className: "justify-center" })}
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleCurrentLocation}
                className={buttonStyles({ tone: "ghost", size: "sm", className: "justify-center" })}
              >
                Use current
              </button>
            </div>

            {results.length ? (
              <div className="grid gap-2">
                {results.slice(0, 4).map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => resolvePlace(place)}
                    className="rounded-[1rem] border border-[#E9DFC9] bg-white px-3 py-2 text-left text-[0.82rem] leading-[var(--line-height-copy)] text-[#111111] shadow-[0_8px_20px_rgba(17,17,17,0.04)]"
                  >
                    {place.displayName}
                  </button>
                ))}
              </div>
            ) : null}

            <details className="rounded-[1rem] border border-[#E9DFC9] bg-white px-3 py-3">
              <summary className="cursor-pointer rounded-[0.6rem] text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2">
                Manual fallback
              </summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  value={manual.displayName}
                  onChange={(event) =>
                    setManual((current) => ({ ...current, displayName: event.currentTarget.value }))
                  }
                  placeholder="Place label"
                  className="min-h-10 rounded-[0.85rem] border border-[#D9BE75] px-3 text-[0.88rem] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2"
                />
                <input
                  value={manual.timezone}
                  onChange={(event) =>
                    setManual((current) => ({ ...current, timezone: event.currentTarget.value }))
                  }
                  placeholder="Timezone, e.g. Asia/Kolkata"
                  className="min-h-10 rounded-[0.85rem] border border-[#D9BE75] px-3 text-[0.88rem] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2"
                />
                <input
                  value={manual.latitude}
                  onChange={(event) =>
                    setManual((current) => ({ ...current, latitude: event.currentTarget.value }))
                  }
                  placeholder="Latitude"
                  className="min-h-10 rounded-[0.85rem] border border-[#D9BE75] px-3 text-[0.88rem] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2"
                />
                <input
                  value={manual.longitude}
                  onChange={(event) =>
                    setManual((current) => ({ ...current, longitude: event.currentTarget.value }))
                  }
                  placeholder="Longitude"
                  className="min-h-10 rounded-[0.85rem] border border-[#D9BE75] px-3 text-[0.88rem] outline-none focus-visible:ring-2 focus-visible:ring-[#B88943] focus-visible:ring-offset-2"
                />
                <button
                  type="button"
                  onClick={handleManualConfirm}
                  className={buttonStyles({ tone: "secondary", size: "sm", className: "sm:col-span-2 justify-center" })}
                >
                  Confirm manual place
                </button>
              </div>
            </details>
          </div>
        </div>
      </Card>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={state.status === "loading"}
        className={buttonStyles({
          tone: "accent",
          size: "lg",
          className:
            "w-full justify-center rounded-full shadow-[0_16px_34px_rgba(184,137,67,0.18)] disabled:cursor-not-allowed disabled:opacity-70",
        })}
      >
        {state.status === "loading" ? "Generating Daily Guidance" : "Generate Daily Guidance"}
      </button>

      {state.status === "idle" ? (
        <EmptyState
          title="Result"
          message="Daily guidance will appear here after calculation from the selected saved Kundli."
        />
      ) : null}

      {state.status === "loading" ? (
        <EmptyState
          title="Calculating"
          message="Building today's view from verified chart, Panchang, Dasha, Gochar, Ashtakavarga, and divisional readiness."
        />
      ) : null}

      {state.status === "error" || state.status === "unavailable" ? (
        <EmptyState title="Unavailable" message={state.message} />
      ) : null}

      {readyData ? (
        <div className="space-y-5">
          <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_16px_42px_rgba(17,17,17,0.05)] before:opacity-0 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                  Context header
                </p>
                <h3 className="mt-1 break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
                  {readyData.selectedKundli.label} - {readyData.localDate}
                </h3>
                <p className="mt-2 break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                  Calculation place: {readyData.calculationLocation.displayName}
                </p>
              </div>
              <Badge tone={readyData.status === "ok" ? "accent" : "neutral"}>
                {readyData.status.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ResultFact label="Query time" value={formatQueryInstant(readyData.queryInstant, readyData.timezone)} />
              <ResultFact label="Local date" value={readyData.localDate} />
              <ResultFact label="Timezone" value={readyData.timezone ?? "Unavailable"} />
            </div>
          </Card>

          <Card className="space-y-3 border-[#E9DFC9] bg-white p-4 shadow-[0_14px_34px_rgba(17,17,17,0.045)] before:opacity-0 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F]">
                  General Day Quality
                </p>
                <p className="mt-1 text-[length:var(--font-size-body-md)] text-[#111111]">
                  {formatRating(readyData.generalDayQuality?.ratingBand ?? null)}
                </p>
              </div>
              <Badge tone={readyData.generalDayQuality?.status === "available" ? "accent" : "neutral"}>
                {readyData.generalDayQuality?.status ?? "unavailable"}
              </Badge>
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#333333]">
              {formatConfidence(readyData.generalDayQuality?.confidence.level ?? readyData.confidence.level)}
              {readyData.generalDayQuality?.unavailableReason
                ? ` - ${readyData.generalDayQuality.unavailableReason}`
                : ""}
            </p>
            {readyData.generalDayQuality ? (
              <div className="grid gap-2">
                <ContradictionList flags={readyData.generalDayQuality.contradictionFlags} />
                <EvidenceList
                  title="Supportive evidence"
                  items={readyData.generalDayQuality.supportiveEvidence}
                />
                <EvidenceList
                  title="Caution evidence"
                  items={readyData.generalDayQuality.cautionEvidence}
                />
                <EvidenceList
                  title="Neutral evidence"
                  items={readyData.generalDayQuality.neutralEvidence}
                />
              </div>
            ) : null}
          </Card>

          <section className="space-y-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F]">
                Seven categories
              </p>
              <h3 className="mt-1 text-[length:var(--font-size-title-sm)] text-[#111111]">
                Computed category view
              </h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {readyData.categories.map((category) => (
                <Card
                  key={category.key}
                  className="space-y-3 border-[#E9DFC9] bg-white p-4 shadow-[0_14px_34px_rgba(17,17,17,0.045)] before:opacity-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                        {category.label}
                      </p>
                      <p className="mt-1 text-[length:var(--font-size-body-md)] text-[#111111]">
                        {formatRating(category.ratingBand)}
                      </p>
                    </div>
                    <Badge tone={category.status === "available" ? "accent" : "neutral"}>
                      {category.status}
                    </Badge>
                  </div>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                    {formatConfidence(category.confidence.level)}
                    {category.unavailableReason ? ` - ${category.unavailableReason}` : ""}
                  </p>
                  <div className="grid gap-2">
                    <ContradictionList flags={category.contradictionFlags} />
                    <EvidenceList title="Supportive evidence" items={category.supportiveEvidence} />
                    <EvidenceList title="Caution evidence" items={category.cautionEvidence} />
                    <EvidenceList title="Neutral evidence" items={category.neutralEvidence} />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_14px_34px_rgba(17,17,17,0.045)] before:opacity-0">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                Time windows
              </p>
              <div className="mt-3 grid gap-2">
                {readyData.timeWindows.length ? (
                  readyData.timeWindows.map((window) => (
                    <ResultFact
                      key={`${window.label}-${window.startUtc}`}
                      label={`${window.label} - ${window.kind}`}
                      value={`${window.startLocal} - ${window.endLocal}`}
                    />
                  ))
                ) : (
                  <p className="text-[length:var(--font-size-body-sm)] text-[#4A4A4A]">
                    Timing windows are unavailable for this calculation.
                  </p>
                )}
              </div>
            </Card>

            <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_14px_34px_rgba(17,17,17,0.045)] before:opacity-0">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                Dasha context
              </p>
              {readyData.dashaContext ? (
                <div className="mt-3 grid gap-2">
                  <ResultFact label="Mahadasha" value={readyData.dashaContext.mahadasha} />
                  <ResultFact label="Antardasha" value={readyData.dashaContext.antardasha} />
                  <ResultFact label="Pratyantardasha" value={readyData.dashaContext.pratyantardasha} />
                  <ResultFact label="Sookshma" value={readyData.dashaContext.sookshma} />
                  <ResultFact label="Prana" value={readyData.dashaContext.prana} />
                  <ResultFact label="Lineage path" value={readyData.dashaContext.lineagePath} />
                </div>
              ) : (
                <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[#4A4A4A]">
                  Dasha context is unavailable.
                </p>
              )}
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_14px_34px_rgba(17,17,17,0.045)] before:opacity-0">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                Sade Sati context
              </p>
              {readyData.sadeSati ? (
                <div className="mt-3 grid gap-2">
                  <ResultFact label="Status" value={readyData.sadeSati.active ? "Active" : "Not active"} />
                  <ResultFact label="Phase" value={readyData.sadeSati.phase ?? "Not active"} />
                  <ResultFact
                    label="Saturn house from Moon"
                    value={`${readyData.sadeSati.saturnHouseFromMoon}`}
                  />
                </div>
              ) : (
                <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[#4A4A4A]">
                  Sade Sati context is unavailable.
                </p>
              )}
            </Card>

            <TechnicalDisclosure title="Source readiness">
              <div className="grid gap-2">
                {Object.entries(readyData.sourceSystems).map(([key, value]) => (
                  <ResultFact key={key} label={formatSourceKey(key)} value={value} />
                ))}
              </div>
            </TechnicalDisclosure>
          </div>

          <TechnicalDisclosure title="Calculation details">
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultFact label="Contract" value={readyData.contractVersion} />
              <ResultFact label="Ayanamsha" value={readyData.conventions.ayanamsa} />
              <ResultFact label="House system" value={readyData.conventions.houseSystem} />
              <ResultFact label="Query time" value={formatQueryInstant(readyData.queryInstant, readyData.timezone)} />
              <ResultFact label="Raw query instant" value={readyData.queryInstant ?? "Unavailable"} />
            </div>
            {readyData.unavailableReasons.length ? (
              <div className="mt-4 rounded-[1rem] border border-[#E9DFC9] bg-[#FFFDF8] px-4 py-3">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#B88943]">
                  Unavailable layers
                </p>
                <ul className="mt-2 space-y-1 text-[0.82rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                  {readyData.unavailableReasons.map((reason) => (
                    <li key={`${reason.system}-${reason.code}`}>
                      {reason.system}: {reason.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </TechnicalDisclosure>

          <Card className="border-[#E9DFC9] bg-white p-4 shadow-[0_14px_34px_rgba(17,17,17,0.045)] before:opacity-0 sm:p-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#8A641F]">
              Disclaimer
            </p>
            <p className="mt-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              {readyData.disclaimer}
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
