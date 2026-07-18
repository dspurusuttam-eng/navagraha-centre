"use client";

// Claude Admin Console C6A — Media metadata form (client).
// URL-reference metadata only — no binary upload, no storage provider. Founder/editor
// edit; support gets a read-only rendering (the service rejects any bypassed write).
// Single-column layout stays usable at 360/390/430 with min-h-11 touch targets.
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  MEDIA_KIND_FORM_OPTIONS,
  MEDIA_MIME_OPTIONS,
  isHttpsUrl,
  type MediaFormValues,
} from "@/modules/admin/media/media-form-config";
import type { MediaFormState } from "@/modules/admin/media/media-actions";

const INITIAL_STATE: MediaFormState = { error: null };

type Props = {
  mode: "create" | "edit";
  canWrite: boolean;
  initial: MediaFormValues;
  action: (prev: MediaFormState, formData: FormData) => Promise<MediaFormState>;
};

export function MediaForm({ mode, canWrite, initial, action }: Readonly<Props>) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [url, setUrl] = useState(initial.url);
  const [altText, setAltText] = useState(initial.altText);
  const [previewFailed, setPreviewFailed] = useState(false);

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
  const showPreview = isHttpsUrl(url) && !previewFailed;

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5" noValidate>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "Register media" : "Edit media"}
        </h1>
        <Link href="/admin/media" className="flex min-h-11 items-center rounded-md border px-4 py-2 text-sm">
          Back to library
        </Link>
      </div>

      {!canWrite ? (
        <p role="note" className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          You have read-only access to media.
        </p>
      ) : null}

      {state.error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{state.error}</p>
        </div>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Media saved.
        </p>
      ) : null}

      <div className="space-y-1">
        <span className="block text-sm font-medium">Preview</span>
        {showPreview ? (
          // Arbitrary external https URLs (reference-only library) — next/image would
          // require a remote-pattern allowlist, which this card does not introduce.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={altText.trim() === "" ? "Media preview" : altText}
            onError={() => setPreviewFailed(true)}
            className="max-h-64 w-full rounded-md border bg-neutral-50 object-contain"
          />
        ) : (
          <p className="rounded-md border border-dashed p-4 text-sm text-neutral-500">
            {url.trim() === ""
              ? "Add an https URL to see a preview."
              : previewFailed
                ? "Preview unavailable — the image could not be loaded from this URL."
                : "Enter a valid https URL to preview."}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="url" className="block text-sm font-medium">Media URL</label>
        <input
          id="url" name="url" type="url" inputMode="url" required value={url}
          onChange={(event) => { setUrl(event.target.value); setPreviewFailed(false); }}
          disabled={!canWrite} placeholder="https://cdn.example.com/image.webp"
          aria-invalid={invalid("url")} aria-describedby={describedBy("url") ?? "url-hint"} className={inputClass}
        />
        {err("url") ? fieldError("url") : (
          <p id="url-hint" className="text-xs text-neutral-500">Must be an https URL. The file is referenced, never uploaded here.</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="altText" className="block text-sm font-medium">Alt text</label>
        <input
          id="altText" name="altText" type="text" required value={altText}
          onChange={(event) => setAltText(event.target.value)} disabled={!canWrite}
          aria-invalid={invalid("altText")} aria-describedby={describedBy("altText") ?? "altText-hint"} className={inputClass}
        />
        {err("altText") ? fieldError("altText") : (
          <p id="altText-hint" className="text-xs text-neutral-500">Required — describes the image for screen readers.</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="filename" className="block text-sm font-medium">Filename</label>
        <input
          id="filename" name="filename" type="text" defaultValue={initial.filename} disabled={!canWrite}
          aria-invalid={invalid("filename")} aria-describedby={describedBy("filename")} className={inputClass}
        />
        {fieldError("filename")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="kind" className="block text-sm font-medium">Kind</label>
          <select
            id="kind" name="kind" defaultValue={initial.kind} disabled={!canWrite}
            aria-invalid={invalid("kind")} aria-describedby={describedBy("kind")} className={inputClass}
          >
            {MEDIA_KIND_FORM_OPTIONS.map((kind) => (<option key={kind} value={kind}>{kind}</option>))}
          </select>
          {fieldError("kind")}
        </div>
        <div className="space-y-1">
          <label htmlFor="mimeType" className="block text-sm font-medium">MIME type</label>
          <select
            id="mimeType" name="mimeType" defaultValue={initial.mimeType} disabled={!canWrite}
            aria-invalid={invalid("mimeType")} aria-describedby={describedBy("mimeType")} className={inputClass}
          >
            <option value="">— Unknown —</option>
            {MEDIA_MIME_OPTIONS.map((mime) => (<option key={mime} value={mime}>{mime}</option>))}
          </select>
          {fieldError("mimeType")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="byteSize" className="block text-sm font-medium">Size (bytes)</label>
          <input
            id="byteSize" name="byteSize" type="number" min={1} inputMode="numeric" defaultValue={initial.byteSize}
            disabled={!canWrite} aria-invalid={invalid("byteSize")} aria-describedby={describedBy("byteSize")} className={inputClass}
          />
          {fieldError("byteSize")}
        </div>
        <div className="space-y-1">
          <label htmlFor="width" className="block text-sm font-medium">Width (px)</label>
          <input
            id="width" name="width" type="number" min={1} inputMode="numeric" defaultValue={initial.width}
            disabled={!canWrite} aria-invalid={invalid("width")} aria-describedby={describedBy("width")} className={inputClass}
          />
          {fieldError("width")}
        </div>
        <div className="space-y-1">
          <label htmlFor="height" className="block text-sm font-medium">Height (px)</label>
          <input
            id="height" name="height" type="number" min={1} inputMode="numeric" defaultValue={initial.height}
            disabled={!canWrite} aria-invalid={invalid("height")} aria-describedby={describedBy("height")} className={inputClass}
          />
          {fieldError("height")}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="caption" className="block text-sm font-medium">Caption</label>
        <textarea
          id="caption" name="caption" rows={3} defaultValue={initial.caption} disabled={!canWrite}
          aria-invalid={invalid("caption")} aria-describedby={describedBy("caption")} className={areaClass}
        />
        {fieldError("caption")}
      </div>

      {canWrite ? (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit" disabled={pending}
            className="flex min-h-11 items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : mode === "create" ? "Register media" : "Save media"}
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
