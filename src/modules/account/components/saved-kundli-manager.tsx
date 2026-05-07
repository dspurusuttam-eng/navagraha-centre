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
    <div className="space-y-1">
      <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">{label}</p>
      <p className="text-[0.92rem] text-[#111111]">{value}</p>
    </div>
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
    <div className="space-y-6">
      <Card tone="accent" className="space-y-3">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
          Saved Kundli Management
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
          Manage your own charts safely.
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          Create, view, edit, set active, and delete saved Kundlis in your personal hub. Full birth details stay in the protected edit flow, while list cards show only safe summaries.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                Saved Charts
              </p>
              <h2 className="text-[length:var(--font-size-title-sm)] text-[#111111]">
                {records.length > 0 ? `${records.length} chart${records.length === 1 ? "" : "s"} saved` : "No saved Kundli yet"}
              </h2>
            </div>
            {activeSummary ? <Badge tone="accent">Active / Default</Badge> : <Badge tone="neutral">No active Kundli</Badge>}
          </div>

          {records.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-5">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Empty state</p>
              <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
                Add your first Kundli to enable dashboard guidance, report readiness, Ask NAVAGRAHA AI, and active chart selection.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard/kundli/new" className={buttonStyles({ size: "sm", tone: "secondary" })}>
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
                  className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white p-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[1.02rem] font-medium text-[#111111]">{summary.label}</h3>
                        {summary.isDefault ? <Badge tone="accent">Active / Default</Badge> : <Badge tone="neutral">Saved</Badge>}
                      </div>
                      <p className="text-[0.92rem] text-[#4A4A4A]">{summary.birthPlace}</p>
                    </div>
                    <div className="text-right text-[0.8rem] text-[#4A4A4A]">
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
                    <button type="button" onClick={() => handleSetActive(summary.id)} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                      Set Active
                    </button>
                    <button type="button" onClick={() => handleDelete(summary.id)} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="space-y-1">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Create or edit
            </p>
            <h2 className="text-[length:var(--font-size-title-sm)] text-[#111111]">
              {editingId ? "Update selected Kundli" : "Add a new Kundli"}
            </h2>
          </div>

          {error ? (
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3 text-[0.92rem] text-[#4A4A4A]">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3">
            <label className="space-y-1 text-sm text-[#111111]">
              <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Label</span>
              <input
                className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                placeholder="Family chart, Jan 1992, or Work profile"
              />
            </label>
            <label className="space-y-1 text-sm text-[#111111]">
              <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Gender</span>
              <input
                className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                value={form.gender ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value || null }))}
                placeholder="Optional"
              />
            </label>
            <label className="space-y-1 text-sm text-[#111111]">
              <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Date of Birth</span>
              <input
                type="date"
                className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                value={form.dateOfBirth}
                onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
              />
            </label>
            <label className="space-y-1 text-sm text-[#111111]">
              <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Time of Birth</span>
              <input
                type="time"
                className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                value={form.timeOfBirth}
                onChange={(event) => setForm((current) => ({ ...current, timeOfBirth: event.target.value }))}
              />
            </label>
            <label className="space-y-1 text-sm text-[#111111]">
              <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Birth Place</span>
              <input
                className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                value={form.birthPlace}
                onChange={(event) => setForm((current) => ({ ...current, birthPlace: event.target.value }))}
                placeholder="City, State, Country"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-[#111111]">
                <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Latitude</span>
                <input
                  className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                  value={form.latitude ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value || null }))}
                  placeholder="Optional"
                />
              </label>
              <label className="space-y-1 text-sm text-[#111111]">
                <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Longitude</span>
                <input
                  className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                  value={form.longitude ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value || null }))}
                  placeholder="Optional"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-[#111111]">
              <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Timezone</span>
              <input
                className="w-full rounded-full border border-[#EAEAEA] bg-white px-4 py-3 text-[#111111] outline-none"
                value={form.timezone ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value || null }))}
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={handleCreate} className={buttonStyles({ size: "sm", tone: "secondary" })}>
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

          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              AI / report readiness
            </p>
            <p className="mt-2 text-[0.92rem] text-[#4A4A4A]">
              Saved Kundlis can later power Ask NAVAGRAHA AI, premium reports, daily guidance, and dashboard Dasha summaries without exposing raw chart JSON.
            </p>
          </div>
        </Card>
      </div>

      {activeSummary ? (
        <Card className="space-y-4">
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
