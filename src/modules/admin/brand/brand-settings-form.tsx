"use client";

// Claude Admin Console C5B — Brand/profile settings form (client).
// Founder/editor edit; support gets a read-only rendering (and the service rejects any
// bypassed write). Surfaces save / saving / success / validation / failure + retry.
// Single-column layout stays usable at 360/390/430 with min-h-11 touch targets.
// Profile image is a MediaAsset *reference* only — no upload.
import { useActionState } from "react";
import { SOCIAL_LINK_SEPARATOR, type BrandFormValues } from "@/modules/admin/brand/brand-form-config";
import { MediaPicker } from "@/modules/admin/media/media-picker";
import type { MediaPickerOption } from "@/modules/admin/media/media-picker-core";
import type { BrandFormState } from "@/modules/admin/brand/brand-actions";

const INITIAL_STATE: BrandFormState = { error: null };

type Props = {
  initial: BrandFormValues;
  canWrite: boolean;
  action: (prev: BrandFormState, formData: FormData) => Promise<BrandFormState>;
  /** Pickable profile images, or null when the media library could not be read (C6B). */
  mediaOptions?: readonly MediaPickerOption[] | null;
};

export function BrandSettingsForm({ initial, canWrite, action, mediaOptions = null }: Readonly<Props>) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  const err = (field: string) => state.fieldErrors?.[field];
  const invalid = (field: string) => (err(field) ? true : undefined);
  const describedBy = (field: string) => (err(field) ? `${field}-error` : undefined);
  const fieldError = (field: string) =>
    err(field) ? (
      <p id={`${field}-error`} className="text-sm text-red-600">
        {err(field)}
      </p>
    ) : null;

  // A failure with no per-field issues (e.g. 403 / storage failure) is retryable.
  const retryable = Boolean(state.error) && !state.fieldErrors;

  const inputClass = "min-h-11 w-full rounded-md border px-3 py-2 disabled:bg-neutral-100";
  const areaClass = "w-full rounded-md border px-3 py-2 disabled:bg-neutral-100";

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5" noValidate>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Brand &amp; profile settings</h1>
        <p className="text-sm text-neutral-600">
          The Acharya profile, contact details and footer used across the console.
        </p>
      </div>

      {!canWrite ? (
        <p role="note" className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          You have read-only access to brand settings.
        </p>
      ) : null}

      {state.error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{state.error}</p>
        </div>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Brand settings saved.
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="acharyaName" className="block text-sm font-medium">Acharya name</label>
        <input
          id="acharyaName" name="acharyaName" type="text" defaultValue={initial.acharyaName} disabled={!canWrite}
          aria-invalid={invalid("acharyaName")} aria-describedby={describedBy("acharyaName")} className={inputClass}
        />
        {fieldError("acharyaName")}
      </div>

      <div className="space-y-1">
        <label htmlFor="professionalTitle" className="block text-sm font-medium">Professional title</label>
        <input
          id="professionalTitle" name="professionalTitle" type="text" defaultValue={initial.professionalTitle} disabled={!canWrite}
          aria-invalid={invalid("professionalTitle")} aria-describedby={describedBy("professionalTitle")} className={inputClass}
        />
        {fieldError("professionalTitle")}
      </div>

      <MediaPicker
        name="profileImageAssetId"
        label="Profile image"
        initialAssetId={initial.profileImageAssetId}
        options={mediaOptions}
        canWrite={canWrite}
        error={err("profileImageAssetId")}
      />

      <div className="space-y-1">
        <label htmlFor="biography" className="block text-sm font-medium">Short biography</label>
        <textarea
          id="biography" name="biography" rows={5} defaultValue={initial.biography} disabled={!canWrite}
          aria-invalid={invalid("biography")} aria-describedby={describedBy("biography")} className={areaClass}
        />
        {fieldError("biography")}
      </div>

      <div className="space-y-1">
        <label htmlFor="supportEmail" className="block text-sm font-medium">Support email</label>
        <input
          id="supportEmail" name="supportEmail" type="email" inputMode="email" autoComplete="off"
          defaultValue={initial.supportEmail} disabled={!canWrite}
          aria-invalid={invalid("supportEmail")} aria-describedby={describedBy("supportEmail")} className={inputClass}
        />
        {fieldError("supportEmail")}
      </div>

      <div className="space-y-1">
        <label htmlFor="officeHours" className="block text-sm font-medium">Office hours</label>
        <textarea
          id="officeHours" name="officeHours" rows={2} defaultValue={initial.officeHours} disabled={!canWrite}
          aria-invalid={invalid("officeHours")} aria-describedby={describedBy("officeHours")} className={areaClass}
        />
        {fieldError("officeHours")}
      </div>

      <div className="space-y-1">
        <label htmlFor="whatsappNumber" className="block text-sm font-medium">WhatsApp number</label>
        <input
          id="whatsappNumber" name="whatsappNumber" type="tel" inputMode="tel" autoComplete="off"
          defaultValue={initial.whatsappNumber} disabled={!canWrite} placeholder="+919876543210"
          aria-invalid={invalid("whatsappNumber")}
          aria-describedby={describedBy("whatsappNumber") ?? "whatsappNumber-hint"}
          className={inputClass}
        />
        {err("whatsappNumber") ? fieldError("whatsappNumber") : (
          <p id="whatsappNumber-hint" className="text-xs text-neutral-500">8–15 digits, E.164 style. Leave empty to remove.</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="socialLinks" className="block text-sm font-medium">Social links</label>
        <textarea
          id="socialLinks" name="socialLinks" rows={5} defaultValue={initial.socialLinks} disabled={!canWrite}
          aria-invalid={invalid("socialLinks")}
          aria-describedby={describedBy("socialLinks") ?? "socialLinks-hint"}
          className={areaClass}
        />
        {err("socialLinks") ? fieldError("socialLinks") : (
          <p id="socialLinks-hint" className="text-xs text-neutral-500">
            One per line as {`platform ${SOCIAL_LINK_SEPARATOR} https://url`} (up to 20).
          </p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium">Footer details</legend>
        <div className="space-y-1">
          <label htmlFor="footerAddressLine" className="block text-sm font-medium">Address line</label>
          <textarea
            id="footerAddressLine" name="footerAddressLine" rows={2} defaultValue={initial.footerAddressLine} disabled={!canWrite}
            aria-invalid={invalid("footerAddressLine")} aria-describedby={describedBy("footerAddressLine")} className={areaClass}
          />
          {fieldError("footerAddressLine")}
        </div>
        <div className="space-y-1">
          <label htmlFor="footerCopyright" className="block text-sm font-medium">Copyright</label>
          <input
            id="footerCopyright" name="footerCopyright" type="text" defaultValue={initial.footerCopyright} disabled={!canWrite}
            aria-invalid={invalid("footerCopyright")} aria-describedby={describedBy("footerCopyright")} className={inputClass}
          />
          {fieldError("footerCopyright")}
        </div>
        <div className="space-y-1">
          <label htmlFor="footerNote" className="block text-sm font-medium">Footer note</label>
          <textarea
            id="footerNote" name="footerNote" rows={2} defaultValue={initial.footerNote} disabled={!canWrite}
            aria-invalid={invalid("footerNote")} aria-describedby={describedBy("footerNote")} className={areaClass}
          />
          {fieldError("footerNote")}
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="disclaimer" className="block text-sm font-medium">Disclaimer text</label>
        <textarea
          id="disclaimer" name="disclaimer" rows={4} defaultValue={initial.disclaimer} disabled={!canWrite}
          aria-invalid={invalid("disclaimer")} aria-describedby={describedBy("disclaimer")} className={areaClass}
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
