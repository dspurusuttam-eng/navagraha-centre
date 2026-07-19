"use client";

// Claude Admin Console C6B — reusable MediaAsset picker (client).
// Replaces free-text asset-id inputs. Submits through a hidden input under the SAME field
// name, so every existing form mapping / action / service stays untouched. Founder/editor
// select-replace-clear; support sees the selection read-only. Handles a deleted reference
// and a library outage without ever silently dropping the stored value.
import { useState } from "react";
import { MediaUploadButton } from "@/modules/admin/media/media-upload-button";
import {
  resolvePickerSelection,
  pickerStatusLabel,
  type MediaPickerOption,
} from "@/modules/admin/media/media-picker-core";

type Props = {
  /** Form field name — must match the existing payload key (e.g. coverImageAssetId). */
  name: string;
  label: string;
  initialAssetId: string;
  /** Pickable image assets, or null when the media library could not be read. */
  options: readonly MediaPickerOption[] | null;
  canWrite: boolean;
  /** Field-level error from the owning form's action state. */
  error?: string;
  /** Notifies the owning form of a change (dirty tracking / autosave). */
  onChange?: () => void;
};

export function MediaPicker({ name, label, initialAssetId, options, canWrite, error, onChange }: Readonly<Props>) {
  const [selectedId, setSelectedId] = useState(initialAssetId ?? "");
  const [open, setOpen] = useState(false);
  // Assets uploaded in this session, so the preview and the library list update immediately
  // without a page reload (the server list refreshes on the next load).
  const [uploaded, setUploaded] = useState<MediaPickerOption[]>([]);
  const mergedOptions = options === null ? (uploaded.length ? uploaded : null) : [...uploaded, ...options];
  const selection = resolvePickerSelection(selectedId, mergedOptions);
  const statusId = `${name}-status`;
  const errorId = `${name}-error`;

  const commit = (id: string) => {
    setSelectedId(id);
    setOpen(false);
    onChange?.();
  };

  const handleUploaded = (option: MediaPickerOption) => {
    setUploaded((current) => [option, ...current.filter((entry) => entry.id !== option.id)]);
    commit(option.id);
  };

  const canChoose = canWrite && mergedOptions !== null;
  const hasOptions = mergedOptions !== null && mergedOptions.length > 0;

  return (
    <div role="group" aria-label={label} className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>

      {/* The picker's real value: same field name the form already submits. */}
      <input type="hidden" name={name} value={selectedId} />

      {selection.state === "selected" ? (
        <div className="flex items-center gap-3 rounded-md border p-2">
          {/* Decorative here — the filename and alt text are shown as text beside it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selection.option.url} alt="" className="h-16 w-16 shrink-0 rounded border bg-neutral-50 object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{selection.option.filename}</span>
            <span className="block truncate text-xs text-neutral-500">
              {selection.option.altText === "" ? "No alt text" : selection.option.altText}
            </span>
          </span>
        </div>
      ) : null}

      {selection.state === "missing" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Missing asset reference: <code className="font-mono text-xs">{selection.id}</code>
        </p>
      ) : null}

      {selection.state === "unavailable" && selection.id !== "" ? (
        <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          Current reference: <code className="font-mono text-xs">{selection.id}</code>
        </p>
      ) : null}

      <p id={statusId} className="text-xs text-neutral-500">{pickerStatusLabel(selection)}</p>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">{error}</p>
      ) : null}

      {canWrite ? (
        <div className="space-y-2">
          {/* Primary path: upload straight from the device (Android gallery / PWA / desktop). */}
          <MediaUploadButton
            label={selection.state === "selected" ? "Upload new cover image" : "Upload cover image"}
            onUploaded={handleUploaded}
            altText={selection.state === "selected" ? selection.option.altText : undefined}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              disabled={!canChoose}
              aria-expanded={open}
              aria-describedby={error ? errorId : statusId}
              className="flex min-h-11 items-center rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selection.state === "selected" ? "Choose from library" : "Select from library"}
            </button>
            {selectedId !== "" ? (
              <button
                type="button"
                onClick={() => commit("")}
                className="flex min-h-11 items-center rounded-md border px-4 py-2 text-sm"
              >
                Remove image
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {open && canChoose ? (
        hasOptions ? (
          <ul aria-label={`${label} options`} className="max-h-72 divide-y overflow-y-auto rounded-md border">
            {mergedOptions!.map((option) => {
              const isSelected = option.id === selectedId;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => commit(option.id)}
                    aria-pressed={isSelected}
                    className={`flex min-h-11 w-full items-center gap-3 p-2 text-left ${isSelected ? "bg-neutral-100" : "bg-white"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={option.url} alt="" className="h-12 w-12 shrink-0 rounded border bg-neutral-50 object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{option.filename}</span>
                      <span className="block truncate text-xs text-neutral-500">
                        {option.altText === "" ? "No alt text" : option.altText}
                      </span>
                    </span>
                    {isSelected ? <span className="shrink-0 text-xs font-medium text-neutral-600">Selected</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed p-4 text-sm text-neutral-500">
            No image assets available. Register one in the Media library first.
          </p>
        )
      ) : null}
    </div>
  );
}
