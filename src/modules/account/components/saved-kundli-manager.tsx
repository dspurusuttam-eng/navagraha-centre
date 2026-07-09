"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/http";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createEmptySavedKundliCatalog,
  listSavedKundlis,
  toSavedKundliSummary,
  type SavedKundliCatalog,
  type SavedKundliInput,
  type SavedKundliRecord,
} from "@/modules/account/saved-kundli";
import { kundliPreviewItems, kundliTrustNote } from "@/modules/kundli/kundli-foundation";

type FormState = SavedKundliInput;

type SavedKundliApiRecord = {
  id: string;
  label: string;
  gender: string | null;
  dateOfBirth: string;
  timeOfBirth: string | null;
  birthPlace: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  ascendantSign: string | null;
  moonSign: string | null;
  chartSummary: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type SavedKundliLimits = {
  used: number;
  max: number;
  planType: string;
};

type SavedKundliApiCatalog = {
  records: SavedKundliApiRecord[];
  activeRecordId: string | null;
  limits: SavedKundliLimits;
};

type SavedKundliStateCatalog = SavedKundliCatalog & {
  activeRecordId: string | null;
  limits: SavedKundliLimits | null;
};

type LoadStatus = "loading" | "ready" | "unauthenticated" | "error";

const savedKundliEndpoint = "/api/kundli/saved";
const signInHref = "/sign-in?next=%2Fdashboard%2Fkundli";

function emptyFormState(): FormState {
  return {
    label: "",
    gender: null,
    dateOfBirth: "",
    timeOfBirth: "",
    birthPlace: "",
    latitude: null,
    longitude: null,
    timezone: null,
  };
}

function isValidDateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() >= 1800 &&
    parsed.getTime() <= Date.now()
  );
}

function isValidTimeValue(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function parseCoordinateValue(value: string | null) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return { valid: true, value: null };
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed)
    ? { valid: true, value: parsed }
    : { valid: false, value: null };
}

function toDisplayCoordinate(value: number | null) {
  return value === null ? null : String(value);
}

function toLocalRecord(record: SavedKundliApiRecord): SavedKundliRecord {
  return {
    id: record.id,
    ownerId: "authenticated-user",
    label: record.label,
    gender: record.gender,
    dateOfBirth: record.dateOfBirth,
    timeOfBirth: record.timeOfBirth ?? "",
    birthPlace: record.birthPlace,
    latitude: toDisplayCoordinate(record.latitude),
    longitude: toDisplayCoordinate(record.longitude),
    timezone: record.timezone,
    ascendantSign: record.ascendantSign,
    moonSign: record.moonSign,
    chartSummary: record.chartSummary,
    isDefault: record.isDefault,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toStateCatalog(catalog: SavedKundliApiCatalog): SavedKundliStateCatalog {
  return {
    ...createEmptySavedKundliCatalog("authenticated-user"),
    records: catalog.records.map((record) => toLocalRecord(record)),
    activeRecordId: catalog.activeRecordId,
    limits: catalog.limits,
  };
}

function toFormState(record: SavedKundliRecord): FormState {
  return {
    label: record.label,
    gender: record.gender,
    dateOfBirth: record.dateOfBirth,
    timeOfBirth: record.timeOfBirth,
    birthPlace: record.birthPlace,
    latitude: record.latitude,
    longitude: record.longitude,
    timezone: record.timezone,
  };
}

function toApiPayload(form: FormState): Record<string, unknown> {
  return {
    label: form.label.trim(),
    gender: form.gender || null,
    dateOfBirth: form.dateOfBirth.trim(),
    timeOfBirth: form.timeOfBirth.trim() || null,
    birthPlace: form.birthPlace.trim(),
    latitude: parseCoordinateValue(form.latitude).value,
    longitude: parseCoordinateValue(form.longitude).value,
    timezone: form.timezone?.trim() || null,
  };
}

function buildUpdatePayload(form: FormState, record: SavedKundliRecord) {
  const nextPayload = toApiPayload(form);
  const currentPayload = toApiPayload(toFormState(record));
  const changedEntries = Object.entries(nextPayload).filter(
    ([key, value]) => currentPayload[key] !== value
  );

  return Object.fromEntries(changedEntries);
}

function validateForm(form: FormState) {
  if (!form.label.trim() || !form.dateOfBirth.trim() || !form.birthPlace.trim()) {
    return "Fill label, date of birth, and birth place.";
  }

  if (!isValidDateValue(form.dateOfBirth)) {
    return "Enter a valid past date of birth from 1800 onward.";
  }

  if (form.timeOfBirth.trim() && !isValidTimeValue(form.timeOfBirth)) {
    return "Enter time of birth in HH:MM format, or leave it blank.";
  }

  if (!parseCoordinateValue(form.latitude).valid || !parseCoordinateValue(form.longitude).valid) {
    return "Latitude and longitude must be valid numbers when provided.";
  }

  return null;
}

function formatUpdatedAt(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

async function readResponseJson(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

function SafeField({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="space-y-1.5 rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
      <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[color:var(--color-accent-strong)]">
        {label}
      </p>
      <p className="break-words text-[0.92rem] text-[color:var(--color-ink-strong)]">{value}</p>
    </div>
  );
}

function FieldLabel({
  label,
  tone = "Required",
}: Readonly<{
  label: string;
  tone?: "Required" | "Optional";
}>) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-[0.68rem] uppercase tracking-[0.08em] text-[#111111]">
        {label}
      </span>
      <Badge tone={tone === "Required" ? "accent" : "outline"} className="border border-black/8 bg-white">
        {tone}
      </Badge>
    </span>
  );
}

function PreviewItemCard({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <Card tone="default" className="space-y-3 border-black/8 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-gold)]" />
        <p className="text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
          {title}
        </p>
      </div>
      <p className="text-[0.82rem] leading-6 text-[color:var(--color-ink-body)]">{description}</p>
    </Card>
  );
}

function StatusCard({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}>) {
  return (
    <Card className="space-y-4 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0">
      <Badge tone="outline" className="w-fit border border-black/8 bg-white">
        {eyebrow}
      </Badge>
      <div className="space-y-2">
        <h2 className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
          {title}
        </h2>
        <p className="max-w-2xl text-[0.92rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {description}
        </p>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </Card>
  );
}

export function SavedKundliManager({
  focusId = null,
}: Readonly<{
  focusId?: string | null;
}>) {
  const [catalog, setCatalog] = useState<SavedKundliStateCatalog | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [form, setForm] = useState<FormState>(emptyFormState());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didApplyFocus, setDidApplyFocus] = useState(false);

  const loadCatalog = useCallback(async (signal?: AbortSignal, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setStatus("loading");
    }

    setError(null);

    try {
      const response = await fetch(savedKundliEndpoint, {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });
      const payload = await readResponseJson(response);

      if (response.status === 401) {
        setCatalog(null);
        setStatus("unauthenticated");
        return;
      }

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Saved Kundli records could not be loaded."));
      }

      const nextCatalog = (payload as { savedKundli?: SavedKundliApiCatalog } | null)?.savedKundli;

      if (!nextCatalog) {
        throw new Error("Saved Kundli response was not in the expected format.");
      }

      setCatalog(toStateCatalog(nextCatalog));
      setStatus("ready");
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") {
        return;
      }

      setCatalog(null);
      setStatus("error");
      setError(loadError instanceof Error ? loadError.message : "Saved Kundli records could not be loaded.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadCatalog(controller.signal);

    return () => controller.abort();
  }, [loadCatalog]);

  const records = useMemo(() => (catalog ? listSavedKundlis(catalog) : []), [catalog]);
  const active = useMemo(() => records.find((record) => record.isDefault) ?? records[0] ?? null, [records]);
  const summaries = useMemo(() => records.map((record) => toSavedKundliSummary(record)), [records]);
  const activeSummary = active ? toSavedKundliSummary(active) : null;

  useEffect(() => {
    if (status !== "ready" || !focusId || didApplyFocus) {
      return;
    }

    const selected = records.find((record) => record.id === focusId);

    if (selected) {
      setEditingId(selected.id);
      setForm(toFormState(selected));
    } else {
      setError("Selected saved Kundli could not be found.");
    }

    setDidApplyFocus(true);
  }, [didApplyFocus, focusId, records, status]);

  function resetForm(next?: Partial<FormState>) {
    setForm({ ...emptyFormState(), ...next });
  }

  async function refreshAfterMutation(successMessage: string) {
    await loadCatalog(undefined, { silent: true });
    setNotice(successMessage);
  }

  async function handleCreate() {
    const validationError = validateForm(form);

    setError(null);
    setNotice(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(savedKundliEndpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toApiPayload(form)),
      });
      const payload = await readResponseJson(response);

      if (response.status === 401) {
        setStatus("unauthenticated");
        return;
      }

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Saved Kundli record could not be created."));
      }

      setEditingId(null);
      resetForm();
      await refreshAfterMutation("Saved Kundli record created.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Saved Kundli record could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(recordId: string) {
    const selected = records.find((record) => record.id === recordId);
    const validationError = validateForm(form);

    setError(null);
    setNotice(null);

    if (!selected) {
      setError("Selected saved Kundli could not be found.");
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    const updatePayload = buildUpdatePayload(form, selected);

    if (Object.keys(updatePayload).length === 0) {
      setNotice("No changes to save.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${savedKundliEndpoint}/${encodeURIComponent(recordId)}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });
      const payload = await readResponseJson(response);

      if (response.status === 401) {
        setStatus("unauthenticated");
        return;
      }

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Saved Kundli record could not be updated."));
      }

      setEditingId(null);
      resetForm();
      await refreshAfterMutation("Saved Kundli record updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Saved Kundli record could not be updated.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(recordId: string) {
    setError(null);
    setNotice(null);

    if (!window.confirm("Delete this saved Kundli?")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${savedKundliEndpoint}/${encodeURIComponent(recordId)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = await readResponseJson(response);

      if (response.status === 401) {
        setStatus("unauthenticated");
        return;
      }

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "Saved Kundli record could not be deleted."));
      }

      if (editingId === recordId) {
        setEditingId(null);
        resetForm();
      }

      await refreshAfterMutation("Saved Kundli record deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Saved Kundli record could not be deleted.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBeginEdit(recordId: string) {
    const selected = records.find((record) => record.id === recordId);

    if (!selected) {
      setError("Selected saved Kundli could not be found.");
      return;
    }

    setEditingId(recordId);
    setError(null);
    setNotice(null);
    setForm(toFormState(selected));
  }

  return (
    <div className="space-y-8">
      <Card
        tone="default"
        className="space-y-4 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="trust" className="border border-black/8 bg-white">
            Saved Kundli
          </Badge>
          <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
            API Connected
          </Badge>
          {catalog?.limits ? (
            <Badge tone="neutral" className="border border-black/8 bg-white">
              {catalog.limits.used}/{catalog.limits.max} saved
            </Badge>
          ) : null}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]">
          Manage your saved birth charts safely.
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          Your saved Kundli records load from the protected account API. The list shows safe chart summaries while full birth details stay in the authenticated edit flow.
        </p>
      </Card>

      {status === "loading" ? (
        <StatusCard
          eyebrow="Loading"
          title="Loading saved Kundli records"
          description="Your protected saved Kundli list is being loaded from the account API."
        />
      ) : null}

      {status === "unauthenticated" ? (
        <StatusCard
          eyebrow="Sign in required"
          title="Sign in to view saved Kundlis"
          description="Saved Kundli records are protected account data. Sign in to create, view, edit, or delete your saved charts."
        >
          <Link href={signInHref} className={buttonStyles({ size: "sm", tone: "accent" })}>
            Sign in
          </Link>
          <Link href="/kundli" className={buttonStyles({ size: "sm", tone: "ghost" })}>
            Kundli home
          </Link>
        </StatusCard>
      ) : null}

      {status === "error" ? (
        <StatusCard
          eyebrow="Could not load"
          title="Saved Kundli records are temporarily unavailable"
          description={error ?? "Please retry in a moment. No raw chart data is shown in this state."}
        >
          <button
            type="button"
            onClick={() => void loadCatalog()}
            className={buttonStyles({ size: "sm", tone: "accent" })}
          >
            Retry
          </button>
          <Link href="/dashboard" className={buttonStyles({ size: "sm", tone: "ghost" })}>
            Return to dashboard
          </Link>
        </StatusCard>
      ) : null}

      {status === "ready" ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <Card className="space-y-5 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                    Saved Charts
                  </p>
                  <h2 className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                    {records.length > 0
                      ? `${records.length} chart${records.length === 1 ? "" : "s"} saved`
                      : "No saved Kundli yet"}
                  </h2>
                </div>
                {activeSummary ? (
                  <Badge tone="accent">Active / Default</Badge>
                ) : (
                  <Badge tone="neutral">No active Kundli</Badge>
                )}
              </div>

              {records.length === 0 ? (
                <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                    Empty state
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Add your first saved Kundli to enable protected chart selection across the dashboard.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        resetForm();
                      }}
                      className={buttonStyles({ size: "sm", tone: "accent" })}
                    >
                      Add Kundli
                    </button>
                    <Link href="/dashboard" className={buttonStyles({ size: "sm", tone: "ghost" })}>
                      Return to dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {summaries.map((summary) => (
                    <article
                      key={summary.id}
                      className="rounded-[1.1rem] border border-black/8 bg-white p-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-[1.02rem] font-medium text-[color:var(--color-ink-strong)]">
                              {summary.label}
                            </h3>
                            {summary.isDefault ? <Badge tone="accent">Active / Default</Badge> : <Badge tone="neutral">Saved</Badge>}
                          </div>
                          <p className="break-words text-[0.92rem] text-[color:var(--color-ink-body)]">
                            {summary.birthPlace}
                          </p>
                        </div>
                        <div className="text-left text-[0.8rem] text-[color:var(--color-ink-body)] sm:text-right">
                          <p>{summary.birthDateLabel}</p>
                          <p>Updated {formatUpdatedAt(summary.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <SafeField label="Lagna" value={summary.ascendantSign ?? "Unavailable"} />
                        <SafeField label="Moon sign" value={summary.moonSign ?? "Unavailable"} />
                        <SafeField label="Chart summary" value={summary.chartSummary} />
                        <SafeField
                          label="Status"
                          value={summary.isDefault ? "Current active Kundli" : "Saved account record"}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleBeginEdit(summary.id)}
                          className={buttonStyles({ size: "sm", tone: "secondary" })}
                          disabled={isSubmitting}
                        >
                          View / Edit
                        </button>
                        {summary.isDefault ? (
                          <button
                            type="button"
                            className={buttonStyles({ size: "sm", tone: "ghost" })}
                            disabled
                          >
                            Primary record
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleDelete(summary.id)}
                            className={buttonStyles({ size: "sm", tone: "ghost" })}
                            disabled={isSubmitting}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-4 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0">
              <div className="space-y-1">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                  Create or edit
                </p>
                <h2 className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  {editingId ? "Update selected Kundli" : "Add a new Kundli"}
                </h2>
              </div>

              <div aria-live="polite" className="space-y-2">
                {error ? (
                  <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 text-[0.92rem] text-[color:var(--color-ink-body)] shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                    {error}
                  </div>
                ) : null}
                {notice ? (
                  <div className="rounded-[1.1rem] border border-[rgba(27,94,32,0.22)] bg-white px-4 py-3 text-[0.92rem] text-[color:var(--color-ink-body)] shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                    {notice}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.25rem] border border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Birth details
                    </p>
                    <p className="text-[0.82rem] text-[color:var(--color-ink-body)]">
                      Required fields are marked for safe Kundli generation.
                    </p>
                  </div>
                  <Badge tone="trust" className="border border-black/8 bg-white">
                    Privacy-Safe
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3">
                  <label className="space-y-1.5 text-sm text-[#111111]">
                    <FieldLabel label="Label" />
                    <input
                      className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                      value={form.label}
                      onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                      placeholder="Family chart, Jan 1992, or Work profile"
                    />
                  </label>

                  <label className="space-y-1.5 text-sm text-[#111111]">
                    <FieldLabel label="Gender" tone="Optional" />
                    <select
                      className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                      value={form.gender ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value || null }))}
                    >
                      <option value="">Not specified</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm text-[#111111]">
                      <FieldLabel label="Date of Birth" />
                      <input
                        type="date"
                        className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                        value={form.dateOfBirth}
                        onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                      />
                    </label>

                    <label className="space-y-1.5 text-sm text-[#111111]">
                      <FieldLabel label="Time of Birth" tone="Optional" />
                      <input
                        type="time"
                        className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                        value={form.timeOfBirth}
                        onChange={(event) => setForm((current) => ({ ...current, timeOfBirth: event.target.value }))}
                      />
                    </label>
                  </div>

                  <label className="space-y-1.5 text-sm text-[#111111]">
                    <FieldLabel label="Birth Place" />
                    <input
                      className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                      value={form.birthPlace}
                      onChange={(event) => setForm((current) => ({ ...current, birthPlace: event.target.value }))}
                      placeholder="City, State, Country"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm text-[#111111]">
                      <FieldLabel label="Latitude" tone="Optional" />
                      <input
                        inputMode="decimal"
                        className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                        value={form.latitude ?? ""}
                        onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value || null }))}
                        placeholder="Optional"
                      />
                    </label>

                    <label className="space-y-1.5 text-sm text-[#111111]">
                      <FieldLabel label="Longitude" tone="Optional" />
                      <input
                        inputMode="decimal"
                        className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                        value={form.longitude ?? ""}
                        onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value || null }))}
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  <label className="space-y-1.5 text-sm text-[#111111]">
                    <FieldLabel label="Timezone" tone="Optional" />
                    <input
                      className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                      value={form.timezone ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value || null }))}
                      placeholder="Asia/Kolkata"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  className={buttonStyles({ size: "sm", tone: "accent" })}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving" : "Save Kundli"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => void handleUpdate(editingId)}
                    className={buttonStyles({ size: "sm", tone: "ghost" })}
                    disabled={isSubmitting}
                  >
                    Update selected
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setError(null);
                    setNotice(null);
                    resetForm();
                  }}
                  className={buttonStyles({ size: "sm", tone: "ghost" })}
                  disabled={isSubmitting}
                >
                  Clear form
                </button>
              </div>

              <Card className="space-y-4 border-black/8 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Kundli Intelligence Preview
                    </p>
                    <h3 className="text-[length:var(--font-size-body-lg)] text-[color:var(--color-ink-strong)]">
                      What the saved chart can power next
                    </h3>
                  </div>
                  <Badge tone="trust" className="border border-black/8 bg-white">
                    Preview Only
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {kundliPreviewItems.map((item) => (
                    <PreviewItemCard key={item.title} {...item} />
                  ))}
                </div>
              </Card>

              <Card className="space-y-3 border-black/8 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                  Trust Note
                </p>
                <p className="text-[0.92rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {kundliTrustNote}
                </p>
              </Card>
            </Card>
          </div>

          {activeSummary ? (
            <Card className="space-y-4 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Active Kundli</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SafeField label="Label" value={activeSummary.label} />
                <SafeField label="Birth place" value={activeSummary.birthPlace} />
                <SafeField label="Lagna" value={activeSummary.ascendantSign ?? "Unavailable"} />
                <SafeField label="Moon sign" value={activeSummary.moonSign ?? "Unavailable"} />
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
