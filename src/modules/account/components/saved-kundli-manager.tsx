"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createSavedKundli,
  deleteSavedKundli,
  listSavedKundlis,
  setActiveSavedKundli,
  toSavedKundliSummary,
  updateSavedKundli,
  type SavedKundliCatalog,
  type SavedKundliInput,
} from "@/modules/account/saved-kundli";
import { kundliPreviewItems, kundliTrustNote } from "@/modules/kundli/kundli-foundation";

type FormState = SavedKundliInput;

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
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function isValidTimeValue(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
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
      <p className="text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
        {label}
      </p>
      <p className="text-[0.92rem] text-[color:var(--color-ink-strong)]">{value}</p>
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
      <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#111111]">
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

export function SavedKundliManager({
  sessionUserId,
  initialCatalog,
  focusId = null,
}: Readonly<{
  sessionUserId: string;
  initialCatalog: SavedKundliCatalog;
  focusId?: string | null;
}>) {
  const [catalog, setCatalog] = useState<SavedKundliCatalog>(initialCatalog);
  const [form, setForm] = useState<FormState>(emptyFormState());
  const [editingId, setEditingId] = useState<string | null>(focusId);
  const [error, setError] = useState<string | null>(null);

  const records = useMemo(() => listSavedKundlis(catalog), [catalog]);
  const active = useMemo(() => records.find((record) => record.isDefault) ?? records[0] ?? null, [records]);
  const summaries = useMemo(() => records.map((record) => toSavedKundliSummary(record)), [records]);

  function resetForm(next?: Partial<FormState>) {
    setForm({ ...emptyFormState(), ...next });
  }

  function handleCreate() {
    setError(null);
    if (!form.label.trim() || !form.dateOfBirth.trim() || !form.timeOfBirth.trim() || !form.birthPlace.trim()) {
      setError("Fill label, date of birth, time of birth, and birth place.");
      return;
    }

    if (!isValidDateValue(form.dateOfBirth) || !isValidTimeValue(form.timeOfBirth)) {
      setError("Enter a valid date and time.");
      return;
    }

    const next = createSavedKundli(catalog, sessionUserId, form);
    setCatalog(next);
    const created = next.records[0];
    if (created) {
      setEditingId(created.id);
    }
    resetForm();
  }

  function handleUpdate(recordId: string) {
    setError(null);
    if (!form.label.trim() || !form.dateOfBirth.trim() || !form.timeOfBirth.trim() || !form.birthPlace.trim()) {
      setError("Fill label, date of birth, time of birth, and birth place.");
      return;
    }

    if (!isValidDateValue(form.dateOfBirth) || !isValidTimeValue(form.timeOfBirth)) {
      setError("Enter a valid date and time.");
      return;
    }

    setCatalog(updateSavedKundli(catalog, sessionUserId, recordId, form));
    setEditingId(null);
    resetForm();
  }

  function handleDelete(recordId: string) {
    setError(null);
    if (!window.confirm("Delete this saved Kundli?")) {
      return;
    }

    setCatalog(deleteSavedKundli(catalog, sessionUserId, recordId));
    if (editingId === recordId) {
      setEditingId(null);
    }
  }

  function handleSetActive(recordId: string) {
    setError(null);
    setCatalog(setActiveSavedKundli(catalog, sessionUserId, recordId));
  }

  function handleBeginEdit(recordId: string) {
    const selected = records.find((record) => record.id === recordId);

    if (!selected) {
      return;
    }

    setEditingId(recordId);
    setForm({
      label: selected.label,
      gender: selected.gender,
      dateOfBirth: selected.dateOfBirth,
      timeOfBirth: selected.timeOfBirth,
      birthPlace: selected.birthPlace,
      latitude: selected.latitude,
      longitude: selected.longitude,
      timezone: selected.timezone,
    });
  }

  const activeSummary = active ? toSavedKundliSummary(active) : null;

  return (
    <div className="space-y-8">
      <Card
        tone="default"
        className="space-y-4 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="trust" className="border border-black/8 bg-white">
            Saved Kundli Management
          </Badge>
          <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
            Privacy-Safe
          </Badge>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]">
          Manage your own charts safely.
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          Create, view, edit, set active, and delete saved Kundlis in your personal hub. Full birth details stay in the protected edit flow, while list cards show only safe summaries.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
      <Card className="space-y-5 border-black/8 bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Saved Charts
              </p>
              <h2 className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                {records.length > 0 ? `${records.length} chart${records.length === 1 ? "" : "s"} saved` : "No saved Kundli yet"}
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
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Empty state</p>
              <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Add your first Kundli to enable dashboard guidance, report readiness, Ask NAVAGRAHA AI, and active chart selection.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard/kundli/new" className={buttonStyles({ size: "sm", tone: "accent" })}>
                  Generate Kundli
                </Link>
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
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[1.02rem] font-medium text-[color:var(--color-ink-strong)]">{summary.label}</h3>
                        {summary.isDefault ? <Badge tone="accent">Active / Default</Badge> : <Badge tone="neutral">Saved</Badge>}
                      </div>
                      <p className="text-[0.92rem] text-[color:var(--color-ink-body)]">{summary.birthPlace}</p>
                    </div>
                    <div className="text-right text-[0.8rem] text-[color:var(--color-ink-body)]">
                      <p>{summary.birthDateLabel}</p>
                      <p>Updated {new Date(summary.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <SafeField label="Lagna" value={summary.ascendantSign ?? "Unavailable"} />
                    <SafeField label="Moon sign" value={summary.moonSign ?? "Unavailable"} />
                    <SafeField label="Chart summary" value={summary.chartSummary} />
                    <SafeField
                      label="Status"
                      value={summary.isDefault ? "Current active Kundli" : "Available for selection"}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleBeginEdit(summary.id)}
                      className={buttonStyles({ size: "sm", tone: "secondary" })}
                    >
                      View / Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetActive(summary.id)}
                      className={buttonStyles({ size: "sm", tone: "ghost" })}
                    >
                      Set Active
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(summary.id)}
                      className={buttonStyles({ size: "sm", tone: "ghost" })}
                    >
                      Delete
                    </button>
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

          {error ? (
            <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 text-[0.92rem] text-[color:var(--color-ink-body)] shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
              {error}
            </div>
          ) : null}

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
                className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                placeholder="Family chart, Jan 1992, or Work profile"
              />
            </label>

            <label className="space-y-1.5 text-sm text-[#111111]">
              <FieldLabel label="Gender" tone="Optional" />
              <input
                className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                value={form.gender ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value || null }))}
                placeholder="Optional"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm text-[#111111]">
                <FieldLabel label="Date of Birth" />
                <input
                  type="date"
                  className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                  value={form.dateOfBirth}
                  onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                />
              </label>

              <label className="space-y-1.5 text-sm text-[#111111]">
                <FieldLabel label="Time of Birth" />
                <input
                  type="time"
                  className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                  value={form.timeOfBirth}
                  onChange={(event) => setForm((current) => ({ ...current, timeOfBirth: event.target.value }))}
                />
              </label>
            </div>

            <label className="space-y-1.5 text-sm text-[#111111]">
              <FieldLabel label="Birth Place" />
              <input
                className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                value={form.birthPlace}
                onChange={(event) => setForm((current) => ({ ...current, birthPlace: event.target.value }))}
                placeholder="City, State, Country"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm text-[#111111]">
                <FieldLabel label="Latitude" tone="Optional" />
                <input
                  className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                  value={form.latitude ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value || null }))}
                  placeholder="Optional"
                />
              </label>

              <label className="space-y-1.5 text-sm text-[#111111]">
                <FieldLabel label="Longitude" tone="Optional" />
                <input
                  className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                  value={form.longitude ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value || null }))}
                  placeholder="Optional"
                />
              </label>
            </div>

            <label className="space-y-1.5 text-sm text-[#111111]">
              <FieldLabel label="Timezone" tone="Optional" />
              <input
                className="w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                value={form.timezone ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value || null }))}
                placeholder="Optional"
              />
            </label>
          </div>
        </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={handleCreate} className={buttonStyles({ size: "sm", tone: "accent" })}>
              Save Kundli
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => handleUpdate(editingId)}
                className={buttonStyles({ size: "sm", tone: "ghost" })}
              >
                Update selected
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                resetForm();
              }}
              className={buttonStyles({ size: "sm", tone: "ghost" })}
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

          <div className="rounded-[1.1rem] border border-black/8 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)]">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              AI / report readiness
            </p>
            <p className="mt-2 text-[0.92rem] text-[color:var(--color-ink-body)]">
              Saved Kundlis can later power Ask NAVAGRAHA AI, premium reports, daily guidance, and dashboard Dasha summaries without exposing raw chart JSON.
            </p>
          </div>
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
    </div>
  );
}
