"use client";

// Claude Admin Console C5A — Consultation settings form (client).
// Founder/editor edit; support gets a read-only rendering (and the service rejects any
// bypassed write). Surfaces save / saving / success / validation / failure + retry.
// Single-column layout stays usable at 360/390/430 with min-h-11 touch targets.
import { useActionState } from "react";
import {
  CONSULTATION_AVAILABILITY_OPTIONS,
  CONSULTATION_AVAILABILITY_LABELS,
  CONSULTATION_LANGUAGE_OPTIONS,
  CONSULTATION_LANGUAGE_LABELS,
  type ConsultationFormValues,
} from "@/modules/admin/consultation/consultation-form-config";
import type { ConsultationFormState } from "@/modules/admin/consultation/consultation-actions";

const INITIAL_STATE: ConsultationFormState = { error: null };

type Props = {
  initial: ConsultationFormValues;
  canWrite: boolean;
  action: (prev: ConsultationFormState, formData: FormData) => Promise<ConsultationFormState>;
};

export function ConsultationSettingsForm({ initial, canWrite, action }: Readonly<Props>) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  const err = (field: string) => state.fieldErrors?.[field];
  const describedBy = (field: string) => (err(field) ? `${field}-error` : undefined);
  const invalid = (field: string) => (err(field) ? true : undefined);
  const fieldError = (field: string) =>
    err(field) ? (
      <p id={`${field}-error`} className="text-sm text-red-600">
        {err(field)}
      </p>
    ) : null;

  // A failure with no per-field issues (e.g. 403 / storage failure) is retryable.
  const retryable = Boolean(state.error) && !state.fieldErrors;

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5" noValidate>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Consultation settings</h1>
        <p className="text-sm text-neutral-600">
          How visitors reach you for a consultation. These settings are stored for the console only.
        </p>
      </div>

      {!canWrite ? (
        <p role="note" className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          You have read-only access to consultation settings.
        </p>
      ) : null}

      {state.error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{state.error}</p>
        </div>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Consultation settings saved.
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="availabilityStatus" className="block text-sm font-medium">Availability status</label>
        <select
          id="availabilityStatus" name="availabilityStatus" defaultValue={initial.availabilityStatus}
          disabled={!canWrite} aria-invalid={invalid("availabilityStatus")} aria-describedby={describedBy("availabilityStatus")}
          className="min-h-11 w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        >
          {CONSULTATION_AVAILABILITY_OPTIONS.map((value) => (
            <option key={value} value={value}>{CONSULTATION_AVAILABILITY_LABELS[value] ?? value}</option>
          ))}
        </select>
        {fieldError("availabilityStatus")}
      </div>

      <div className="space-y-1">
        <label htmlFor="whatsappNumber" className="block text-sm font-medium">WhatsApp number</label>
        <input
          id="whatsappNumber" name="whatsappNumber" type="tel" inputMode="tel" autoComplete="off"
          defaultValue={initial.whatsappNumber} disabled={!canWrite} placeholder="+919876543210"
          aria-invalid={invalid("whatsappNumber")} aria-describedby={describedBy("whatsappNumber") ?? "whatsappNumber-hint"}
          className="min-h-11 w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        />
        {err("whatsappNumber") ? fieldError("whatsappNumber") : (
          <p id="whatsappNumber-hint" className="text-xs text-neutral-500">8–15 digits, E.164 style. Leave empty to remove.</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="prefilledMessage" className="block text-sm font-medium">Prefilled message</label>
        <textarea
          id="prefilledMessage" name="prefilledMessage" rows={3} defaultValue={initial.prefilledMessage}
          disabled={!canWrite} aria-invalid={invalid("prefilledMessage")} aria-describedby={describedBy("prefilledMessage")}
          className="w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        />
        {fieldError("prefilledMessage")}
      </div>

      <div className="space-y-1">
        <label htmlFor="officeHours" className="block text-sm font-medium">Office hours</label>
        <textarea
          id="officeHours" name="officeHours" rows={2} defaultValue={initial.officeHours}
          disabled={!canWrite} aria-invalid={invalid("officeHours")} aria-describedby={describedBy("officeHours")}
          className="w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        />
        {fieldError("officeHours")}
      </div>

      <fieldset className="space-y-1" aria-invalid={invalid("languages")} aria-describedby={describedBy("languages")}>
        <legend className="block text-sm font-medium">Languages</legend>
        <div className="flex flex-wrap gap-3">
          {CONSULTATION_LANGUAGE_OPTIONS.map((code) => (
            <label key={code} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox" name="languages" value={code}
                defaultChecked={initial.languages.includes(code)} disabled={!canWrite}
              />
              {CONSULTATION_LANGUAGE_LABELS[code] ?? code}
            </label>
          ))}
        </div>
        {err("languages") ? fieldError("languages") : (
          <p className="text-xs text-neutral-500">Select at least one language.</p>
        )}
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="topics" className="block text-sm font-medium">Consultation topics</label>
        <textarea
          id="topics" name="topics" rows={5} defaultValue={initial.topics} disabled={!canWrite}
          aria-invalid={invalid("topics")} aria-describedby={describedBy("topics") ?? "topics-hint"}
          className="w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        />
        {err("topics") ? fieldError("topics") : (
          <p id="topics-hint" className="text-xs text-neutral-500">One topic per line (up to 30).</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="preparationInstructions" className="block text-sm font-medium">Preparation instructions</label>
        <textarea
          id="preparationInstructions" name="preparationInstructions" rows={5} defaultValue={initial.preparationInstructions}
          disabled={!canWrite} aria-invalid={invalid("preparationInstructions")} aria-describedby={describedBy("preparationInstructions")}
          className="w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        />
        {fieldError("preparationInstructions")}
      </div>

      <div className="space-y-1">
        <label htmlFor="shortDescription" className="block text-sm font-medium">Short description</label>
        <textarea
          id="shortDescription" name="shortDescription" rows={3} defaultValue={initial.shortDescription}
          disabled={!canWrite} aria-invalid={invalid("shortDescription")} aria-describedby={describedBy("shortDescription")}
          className="w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        />
        {fieldError("shortDescription")}
      </div>

      <div className="space-y-1">
        <label htmlFor="disclaimer" className="block text-sm font-medium">Disclaimer</label>
        <textarea
          id="disclaimer" name="disclaimer" rows={4} defaultValue={initial.disclaimer}
          disabled={!canWrite} aria-invalid={invalid("disclaimer")} aria-describedby={describedBy("disclaimer")}
          className="w-full rounded-md border px-3 py-2 disabled:bg-neutral-100"
        />
        {fieldError("disclaimer")}
      </div>

      {canWrite ? (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit" disabled={pending}
            className="flex min-h-11 items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save settings"}
          </button>
          {retryable && !pending ? (
            <button type="submit" className="flex min-h-11 items-center rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
