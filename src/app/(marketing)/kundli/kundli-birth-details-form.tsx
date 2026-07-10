"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  KundliCanonicalLocation,
  KundliChartStyle,
  KundliGender,
  KundliLanguage,
  KundliRequestPayload,
} from "@/lib/kundli/pending-kundli-draft";

type LocationSearchResult = {
  id: string;
  displayName: string;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string | null;
  provider: string;
};

type CanonicalLocationDateTime = KundliCanonicalLocation;

export type KundliBirthDetailsFormValue = KundliRequestPayload;

type KundliBirthDetailsFormProps = {
  initialValue?: KundliBirthDetailsFormValue | null;
  onValueChange?: (value: KundliBirthDetailsFormValue | null) => void;
};

type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
  error?: {
    code?: string;
    message?: string;
  };
};

type LocationStatus =
  | "idle"
  | "permission-requested"
  | "detecting"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "resolving-place"
  | "resolving-timezone"
  | "searching"
  | "no-results"
  | "provider-unavailable"
  | "manual"
  | "confirmed"
  | "error";

const fieldShell =
  "min-w-0 rounded-[1rem] border border-[rgba(184,137,67,0.24)] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-5px_12px_rgba(184,137,67,0.035),0_10px_18px_rgba(17,17,17,0.075)]";
const inputClass =
  "mt-2 min-h-10 w-full rounded-[0.75rem] border border-black/10 bg-white px-3 py-2 text-[0.78rem] font-semibold text-[#111111] outline-none shadow-[inset_0_2px_5px_rgba(17,17,17,0.045)] transition placeholder:text-[#737373] focus:border-[rgba(184,137,67,0.6)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]";
const actionClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.26)] bg-white px-4 py-2 text-[0.72rem] font-extrabold text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_7px_13px_rgba(17,17,17,0.055)] transition hover:border-[rgba(184,137,67,0.48)]";
const primaryActionClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--radius-pill)] border border-[rgba(76,187,23,0.36)] bg-white px-4 py-2 text-[0.72rem] font-extrabold text-[#2f7e16] shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_14px_rgba(76,187,23,0.12)] transition hover:border-[rgba(76,187,23,0.55)]";

function FieldLabel({ children }: Readonly<{ children: string }>) {
  return (
    <label className="text-[0.72rem] font-extrabold leading-tight text-[#111111] sm:text-[0.86rem]">
      {children}
    </label>
  );
}

function IconBubble({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.26)] bg-white text-[color:var(--color-accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_6px_12px_rgba(17,17,17,0.06)]">
      {children}
    </span>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M7 4v3M17 4v3M5 9h14M6.5 6h11A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9A2.5 2.5 0 0 1 6.5 6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M12 7v5l3 2M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M12 21s6-5.1 6-10a6 6 0 0 0-12 0c0 4.9 6 10 6 10Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <circle cx="12" cy="11" r="2" fill="currentColor" />
    </svg>
  );
}

function formatOffset(minutes: number) {
  const sign = minutes >= 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60).toString().padStart(2, "0");
  const mins = (absolute % 60).toString().padStart(2, "0");

  return `UTC${sign}${hours}:${mins}`;
}

function getErrorMessage(payload: unknown, fallback: string) {
  const candidate = payload as ApiErrorPayload | null;

  return (
    candidate?.message ||
    candidate?.error?.message ||
    fallback
  );
}

function optionClass(active: boolean, tone: "gold" | "green" = "gold") {
  if (active && tone === "green") {
    return "border-[rgba(76,187,23,0.55)] bg-[rgba(76,187,23,0.045)] text-[#2f7e16]";
  }

  if (active) {
    return "border-[rgba(184,137,67,0.46)] bg-[rgba(184,137,67,0.04)] text-[color:var(--color-accent-strong)]";
  }

  return "border-black/10 bg-white text-[#111111]";
}

export function KundliBirthDetailsForm({
  initialValue,
  onValueChange,
}: Readonly<KundliBirthDetailsFormProps>) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [dateLocal, setDateLocal] = useState(initialValue?.dateLocal ?? "");
  const [timeLocal, setTimeLocal] = useState(initialValue?.timeLocal ?? "");
  const [gender, setGender] = useState<KundliGender>(
    initialValue?.gender ?? "Male"
  );
  const [chartStyle, setChartStyle] = useState<KundliChartStyle>(
    initialValue?.chartStyle ?? "North"
  );
  const [language, setLanguage] = useState<KundliLanguage>(
    initialValue?.language ?? "EN"
  );
  const [query, setQuery] = useState(initialValue?.location.displayName ?? "");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<LocationSearchResult | null>(
    null
  );
  const [resolved, setResolved] = useState<CanonicalLocationDateTime | null>(
    initialValue?.location ?? null
  );
  const [status, setStatus] = useState<LocationStatus>(
    initialValue ? "confirmed" : "idle"
  );
  const [message, setMessage] = useState(
    initialValue
      ? "Restored place, timezone, and birth moment are confirmed."
      : "Manual place search is the primary fallback."
  );
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({
    displayName: "",
    city: "",
    district: "",
    state: "",
    country: "",
    countryCode: "",
    latitude: "",
    longitude: "",
    timezone: "",
  });
  const [disambiguation, setDisambiguation] = useState<"earlier" | "later" | "">("");

  const canResolveTime = Boolean(dateLocal && timeLocal);

  useEffect(() => {
    if (!resolved) {
      onValueChange?.(null);
      return;
    }

    onValueChange?.({
      name,
      dateLocal,
      timeLocal,
      gender,
      chartStyle,
      language,
      location: resolved,
    });
  }, [
    chartStyle,
    dateLocal,
    gender,
    language,
    name,
    onValueChange,
    resolved,
    timeLocal,
  ]);
  const statusLabel = useMemo(() => {
    switch (status) {
      case "permission-requested":
        return "Permission requested";
      case "detecting":
        return "Detecting location";
      case "permission-denied":
        return "Permission denied";
      case "unavailable":
        return "Location unavailable";
      case "timeout":
        return "Detection timeout";
      case "resolving-place":
        return "Resolving place";
      case "resolving-timezone":
        return "Resolving timezone";
      case "searching":
        return "Search results";
      case "no-results":
        return "No search results";
      case "provider-unavailable":
        return "Provider temporarily unavailable";
      case "manual":
        return "Manual-entry mode";
      case "confirmed":
        return "Location successfully confirmed";
      case "error":
        return "Location needs attention";
      default:
        return "Location ready to resolve";
    }
  }, [status]);

  function resetResolved() {
    setResolved(null);
    setSelectedPlace(null);
  }

  async function postLocation(payload: Record<string, unknown>) {
    const response = await fetch("/api/platform/location-timezone", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new Error(
        getErrorMessage(data, "Location and timezone resolution failed.")
      );
    }

    return data as {
      results?: LocationSearchResult[];
      resolved?: CanonicalLocationDateTime;
    };
  }

  async function resolveSelectedPlace(place: LocationSearchResult) {
    if (!canResolveTime) {
      setStatus("error");
      setMessage("Select date of birth and birth time before confirming place.");
      return;
    }

    setStatus("resolving-timezone");
    setMessage("Resolving timezone and historical UTC offset for selected birth time.");

    try {
      const payload = await postLocation({
        mode: "resolve",
        source: "search",
        dateLocal,
        timeLocal,
        place,
        disambiguation: disambiguation || undefined,
      });

      if (!payload.resolved) {
        throw new Error("Location resolution returned no canonical result.");
      }

      setSelectedPlace(place);
      setResolved(payload.resolved);
      setStatus("confirmed");
      setMessage("Place, timezone, UTC offset, and UTC birth moment are confirmed.");
    } catch (error) {
      setStatus(
        error instanceof Error && error.message.includes("temporarily")
          ? "provider-unavailable"
          : "error"
      );
      setMessage(error instanceof Error ? error.message : "Resolution failed.");
    }
  }

  async function handleSearch() {
    if (!query.trim()) {
      setStatus("error");
      setMessage("Enter a city, state, and country before searching.");
      return;
    }

    setStatus("searching");
    setMessage("Searching for matching places.");
    setResults([]);
    setResolved(null);

    try {
      const payload = await postLocation({ mode: "search", query });
      const nextResults = payload.results ?? [];
      setResults(nextResults);

      if (!nextResults.length) {
        setStatus("no-results");
        setMessage("No search results. Try adding state and country.");
        return;
      }

      setStatus("searching");
      setMessage("Select the correct place from the search results.");
    } catch (error) {
      setStatus("provider-unavailable");
      setMessage(error instanceof Error ? error.message : "Place search failed.");
    }
  }

  async function handleUseCurrentLocation() {
    if (!canResolveTime) {
      setStatus("error");
      setMessage("Select birth date and birth time first. Current device time is never used for Kundli birth time.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      setMessage("This browser does not expose location detection. Use search or manual entry.");
      return;
    }

    try {
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });

        if (permission.state === "denied") {
          setStatus("permission-denied");
          setMessage("Browser location permission is denied. Use search or manual entry.");
          return;
        }

        setStatus(permission.state === "prompt" ? "permission-requested" : "detecting");
      } else {
        setStatus("permission-requested");
      }
    } catch {
      setStatus("permission-requested");
    }

    setMessage("The browser may ask for one-time location permission.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("resolving-place");
        setMessage("Coordinates received. Resolving readable place and timezone.");

        try {
          const payload = await postLocation({
            mode: "resolve",
            source: "browser",
            dateLocal,
            timeLocal,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: Number.isFinite(position.coords.accuracy)
              ? position.coords.accuracy
              : null,
            disambiguation: disambiguation || undefined,
          });

          if (!payload.resolved) {
            throw new Error("Browser location returned no canonical result.");
          }

          setResolved(payload.resolved);
          setSelectedPlace(null);
          setStatus("confirmed");
          setMessage("Detected location is confirmed for this birth date and time.");
        } catch (error) {
          setStatus("provider-unavailable");
          setMessage(
            error instanceof Error
              ? error.message
              : "Browser coordinates could not be resolved."
          );
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("permission-denied");
          setMessage("Browser location permission was denied. Search and manual entry still work.");
          return;
        }

        if (error.code === error.TIMEOUT) {
          setStatus("timeout");
          setMessage("Location detection timed out. Search and manual entry still work.");
          return;
        }

        setStatus("unavailable");
        setMessage("Location detection is unavailable. Search and manual entry still work.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8_000,
      }
    );
  }

  async function handleManualConfirm() {
    if (!canResolveTime) {
      setStatus("error");
      setMessage("Select date of birth and birth time before confirming manual location.");
      return;
    }

    setStatus("manual");
    setMessage("Validating manual coordinates, timezone, and historical UTC offset.");

    try {
      const payload = await postLocation({
        mode: "resolve",
        source: "manual",
        dateLocal,
        timeLocal,
        ...manual,
        disambiguation: disambiguation || undefined,
      });

      if (!payload.resolved) {
        throw new Error("Manual entry returned no canonical result.");
      }

      setResolved(payload.resolved);
      setSelectedPlace(null);
      setStatus("confirmed");
      setMessage("Manual location and timezone are confirmed.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Manual validation failed.");
    }
  }

  return (
    <div className="grid min-w-0 gap-2">
      <div className={fieldShell}>
        <div className="flex min-w-0 items-center gap-2">
          <IconBubble>
            <span className="text-[0.68rem] font-black uppercase">N</span>
          </IconBubble>
          <FieldLabel>Name</FieldLabel>
        </div>
        <input
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          className={inputClass}
          placeholder="Enter full name"
          autoComplete="name"
        />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2">
        <div className={fieldShell}>
          <div className="flex min-w-0 items-center gap-2">
            <IconBubble>
              <CalendarIcon />
            </IconBubble>
            <FieldLabel>Date of Birth</FieldLabel>
          </div>
          <input
            type="date"
            value={dateLocal}
            onChange={(event) => {
              setDateLocal(event.currentTarget.value);
              setResolved(null);
            }}
            className={inputClass}
          />
        </div>
        <div className={fieldShell}>
          <div className="flex min-w-0 items-center gap-2">
            <IconBubble>
              <ClockIcon />
            </IconBubble>
            <FieldLabel>Time of Birth</FieldLabel>
          </div>
          <input
            type="time"
            value={timeLocal}
            onChange={(event) => {
              setTimeLocal(event.currentTarget.value);
              setResolved(null);
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
        <div className={`${fieldShell} space-y-3`}>
          <div className="flex min-w-0 items-center gap-2">
            <IconBubble>
              <LocationIcon />
            </IconBubble>
            <FieldLabel>Location</FieldLabel>
          </div>
          <div className="rounded-[0.85rem] border border-[rgba(76,187,23,0.18)] bg-white px-3 py-2 text-[0.72rem] font-semibold leading-5 text-[#4A4A4A]">
            Location is requested only after you choose it. It is used once to
            resolve place, IANA timezone, and the historical UTC offset for the
            selected birth time.
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.currentTarget.value);
                resetResolved();
              }}
              className={`${inputClass} mt-0 sm:flex-1`}
              placeholder="Search birth place"
            />
            <button type="button" className={primaryActionClass} onClick={handleSearch}>
              Search place
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={actionClass} onClick={handleUseCurrentLocation}>
              Use current location
            </button>
            <button
              type="button"
              className={actionClass}
              onClick={() => {
                setManualOpen((current) => !current);
                setStatus("manual");
                setMessage("Manual entry lets you control latitude, longitude, and timezone.");
              }}
            >
              Manual entry
            </button>
          </div>

          {results.length ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  type="button"
                  key={result.id}
                  onClick={() => void resolveSelectedPlace(result)}
                  className="block w-full rounded-[0.85rem] border border-black/10 bg-white px-3 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_6px_12px_rgba(17,17,17,0.045)]"
                >
                  <span className="block text-[0.78rem] font-extrabold text-[#111111]">
                    {result.displayName}
                  </span>
                  <span className="mt-1 block text-[0.66rem] font-semibold text-[#4A4A4A]">
                    {result.timezone ?? "Timezone by coordinates"} -{" "}
                    {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {manualOpen ? (
            <div className="space-y-2 rounded-[0.95rem] border border-[rgba(184,137,67,0.2)] bg-white p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Display place"
                  value={manual.displayName}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    setManual((current) => ({
                      ...current,
                      displayName: value,
                    }));
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Country"
                  value={manual.country}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    setManual((current) => ({
                      ...current,
                      country: value,
                    }));
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Latitude"
                  value={manual.latitude}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    setManual((current) => ({
                      ...current,
                      latitude: value,
                    }));
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Longitude"
                  value={manual.longitude}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    setManual((current) => ({
                      ...current,
                      longitude: value,
                    }));
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="IANA timezone, e.g. Asia/Kolkata"
                  value={manual.timezone}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    setManual((current) => ({
                      ...current,
                      timezone: value,
                    }));
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Country code, e.g. IN"
                  value={manual.countryCode}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    setManual((current) => ({
                      ...current,
                      countryCode: value,
                    }));
                  }}
                />
              </div>
              <button type="button" className={primaryActionClass} onClick={handleManualConfirm}>
                Confirm manual location
              </button>
            </div>
          ) : null}

          <div className="rounded-[0.85rem] border border-black/10 bg-white px-3 py-2">
            <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
              {statusLabel}
            </p>
            <p className="mt-1 text-[0.72rem] font-semibold leading-5 text-[#4A4A4A]">
              {message}
            </p>
          </div>

          {resolved ? (
            <div className="space-y-2 rounded-[0.95rem] border border-[rgba(76,187,23,0.24)] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_8px_14px_rgba(76,187,23,0.08)]">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[#2f7e16]">
                Confirmed place
              </p>
              <p className="break-words text-[0.86rem] font-extrabold text-[#111111]">
                {resolved.displayName}
              </p>
              <div className="grid gap-2 text-[0.72rem] font-semibold text-[#4A4A4A] sm:grid-cols-2">
                <p>Source: {resolved.locationSource}</p>
                <p>Timezone: {resolved.timezone}</p>
                <p>Offset: {formatOffset(resolved.utcOffsetMinutes)}</p>
                <p>UTC: {resolved.utcDateTime}</p>
                <p>
                  Coordinates: {resolved.latitude.toFixed(5)},{" "}
                  {resolved.longitude.toFixed(5)}
                </p>
                <p>Timezone by: {resolved.timezoneResolution}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2">
          <div className={fieldShell}>
            <div className="flex min-w-0 items-center gap-2">
              <IconBubble>
                <span className="text-[0.68rem] font-black uppercase">G</span>
              </IconBubble>
              <FieldLabel>Gender</FieldLabel>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {["Male", "Female"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setGender(option as KundliGender)}
                  className={`min-w-0 rounded-[0.6rem] border px-1 py-2 text-center text-[0.58rem] font-extrabold leading-none ${optionClass(
                    gender === option
                  )}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={fieldShell}>
            <div className="flex min-w-0 items-center gap-2">
              <IconBubble>
                <span className="text-[0.68rem] font-black uppercase">C</span>
              </IconBubble>
              <FieldLabel>Chart Style</FieldLabel>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {["North", "South", "East"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setChartStyle(option as KundliChartStyle)}
                  className={`min-w-0 rounded-[0.6rem] border px-1 py-2 text-center text-[0.58rem] font-extrabold leading-none ${optionClass(
                    chartStyle === option
                  )}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={fieldShell}>
            <div className="flex min-w-0 items-center gap-2">
              <IconBubble>
                <span className="text-[0.68rem] font-black uppercase">L</span>
              </IconBubble>
              <FieldLabel>Language</FieldLabel>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {["EN", "HI", "AS"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setLanguage(option as KundliLanguage)}
                  className={`min-w-0 rounded-[0.6rem] border px-1 py-2 text-center text-[0.58rem] font-extrabold leading-none ${optionClass(
                    language === option,
                    "green"
                  )}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[0.95rem] border border-[rgba(184,137,67,0.2)] bg-white p-3 text-[0.72rem] font-semibold leading-5 text-[#4A4A4A]">
            {selectedPlace
              ? `Selected: ${selectedPlace.displayName}`
              : "Search, current location, or manual entry can confirm the place without blocking sign-in."}
          </div>
        </div>
      </div>

      <div className="rounded-[0.95rem] border border-[rgba(184,137,67,0.18)] bg-white p-3">
        <label className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          DST choice
        </label>
        <select
          className={`${inputClass} max-w-full sm:max-w-xs`}
          value={disambiguation}
          onChange={(event) =>
            setDisambiguation(event.currentTarget.value as "earlier" | "later" | "")
          }
        >
          <option value="">Ask if ambiguous</option>
          <option value="earlier">Earlier occurrence</option>
          <option value="later">Later occurrence</option>
        </select>
      </div>
    </div>
  );
}
