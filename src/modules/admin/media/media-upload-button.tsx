"use client";

// Cover-image upload control (client).
//
// Opens the device's native picker — Android gallery, installed PWA, or desktop file dialog —
// via a hidden `accept`-filtered file input, uploads to /api/admin/media/upload, and hands the
// created Media Library asset back to the picker so the preview appears immediately.
//
// States are explicit (idle / uploading / error) because a phone upload on a slow connection is
// the normal case: the button reports progress, disables itself while in flight so repeated
// taps cannot create duplicate assets, and offers a retry after a failure.
import { useRef, useState } from "react";
import {
  MAX_UPLOAD_BYTES,
  UPLOAD_ACCEPT_ATTRIBUTE,
  isUploadableImageMimeType,
} from "@/modules/admin/media/upload-core";
import type { MediaPickerOption } from "@/modules/admin/media/media-picker-core";

type Props = {
  /** Called with the newly created asset once the upload succeeds. */
  onUploaded: (option: MediaPickerOption) => void;
  /** Alt text to seed the new asset with (the editor can refine it afterwards). */
  altText?: string;
  disabled?: boolean;
  label: string;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; percent: number }
  | { status: "error"; message: string };

export function MediaUploadButton({ onUploaded, altText, disabled, label }: Readonly<Props>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const isUploading = state.status === "uploading";

  const upload = (file: File) => {
    // Client-side pre-checks mirror the server rules so an obvious problem is reported
    // instantly instead of after a slow mobile upload. The server re-validates regardless.
    if (!isUploadableImageMimeType(file.type)) {
      setState({ status: "error", message: "Choose a JPEG, PNG or WebP image." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setState({ status: "error", message: "Image is larger than 8 MB. Choose a smaller image." });
      return;
    }

    const body = new FormData();
    body.append("file", file);
    if (altText?.trim()) body.append("altText", altText.trim());

    // XMLHttpRequest (not fetch) because it reports real upload progress, which matters on a
    // phone connection where an 8 MB image is not instant.
    const request = new XMLHttpRequest();
    setState({ status: "uploading", percent: 0 });

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      setState({ status: "uploading", percent: Math.round((event.loaded / event.total) * 100) });
    });

    request.addEventListener("load", () => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        payload = null;
      }

      if (request.status >= 200 && request.status < 300 && payload && typeof payload === "object") {
        const asset = payload as { id?: string; url?: string; filename?: string | null; altText?: string | null };
        if (asset.id && asset.url) {
          setState({ status: "idle" });
          onUploaded({
            id: asset.id,
            url: asset.url,
            filename: asset.filename?.trim() ? asset.filename.trim() : asset.url,
            altText: asset.altText?.trim() ? asset.altText.trim() : "",
          });
          return;
        }
      }

      const message =
        payload && typeof payload === "object" && "error" in payload
          ? ((payload as { error?: { message?: string } }).error?.message ?? "Upload failed.")
          : request.status === 401
            ? "Your session expired. Sign in again to upload."
            : request.status === 403
              ? "You do not have permission to upload images."
              : "Upload failed. Please try again.";
      setState({ status: "error", message });
    });

    request.addEventListener("error", () => {
      setState({ status: "error", message: "Network error during upload. Please try again." });
    });
    request.addEventListener("abort", () => setState({ status: "idle" }));

    request.open("POST", "/api/admin/media/upload");
    request.send(body);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT_ATTRIBUTE}
        className="sr-only"
        // Not `capture`: that would force the camera and hide the gallery on Android.
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset immediately so re-selecting the same file still fires a change event.
          event.target.value = "";
          if (file) upload(file);
        }}
        disabled={disabled || isUploading}
        tabIndex={-1}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        aria-busy={isUploading}
        className="flex min-h-11 items-center rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? `Uploading… ${state.percent}%` : label}
      </button>

      {isUploading ? (
        <div
          role="progressbar"
          aria-label="Upload progress"
          aria-valuenow={state.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
        >
          <div
            className="h-full rounded-full bg-neutral-900 transition-[width] duration-200"
            style={{ width: `${state.percent}%` }}
          />
        </div>
      ) : null}

      {state.status === "error" ? (
        <div role="alert" className="space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-700">{state.message}</p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "idle" });
              inputRef.current?.click();
            }}
            className="text-sm font-medium text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      <p className="text-xs text-neutral-500">JPEG, PNG or WebP. Up to 8 MB.</p>
    </div>
  );
}
