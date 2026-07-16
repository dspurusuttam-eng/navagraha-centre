// Claude Admin Console C6A — Media form config + helpers (pure).
// URL-reference metadata only — there is no binary upload anywhere in this flow.
import { MEDIA_ASSET_KINDS, IMAGE_MIME_TYPES } from "@/modules/admin/domain";
import type { MediaRecord } from "@/modules/admin/media/types";

export const MEDIA_FORM_FIELDS = [
  "filename",
  "url",
  "kind",
  "mimeType",
  "byteSize",
  "width",
  "height",
  "altText",
  "caption",
] as const;
export type MediaFormField = (typeof MEDIA_FORM_FIELDS)[number];

export const MEDIA_KIND_FORM_OPTIONS = MEDIA_ASSET_KINDS;
export const MEDIA_MIME_OPTIONS = IMAGE_MIME_TYPES;

/** Flat string values used to seed the form. */
export type MediaFormValues = Record<MediaFormField, string>;

export function emptyMediaFormValues(): MediaFormValues {
  return {
    filename: "", url: "", kind: "IMAGE", mimeType: "", byteSize: "",
    width: "", height: "", altText: "", caption: "",
  };
}

export function mediaToFormValues(asset: MediaRecord): MediaFormValues {
  return {
    filename: asset.filename ?? "",
    url: asset.url,
    kind: asset.kind,
    mimeType: asset.mimeType ?? "",
    byteSize: asset.byteSize == null ? "" : String(asset.byteSize),
    width: asset.width == null ? "" : String(asset.width),
    height: asset.height == null ? "" : String(asset.height),
    altText: asset.altText ?? "",
    caption: asset.caption ?? "",
  };
}

/** True when a string is a syntactically usable https URL (preview gating only). */
export function isHttpsUrl(value: string): boolean {
  if (!/^https:\/\//i.test(value.trim())) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const cleaned = (form: FormData, key: string): string | undefined => {
  const value = form.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? undefined : text;
};

const optionalNumber = (form: FormData, key: string): number | null | undefined => {
  const text = cleaned(form, key);
  if (text === undefined) return null; // explicitly cleared → null
  const n = Number(text);
  return Number.isFinite(n) ? n : Number.NaN; // NaN → schema reports the field
};

/** Build a raw payload for createMediaAssetSchema/updateMediaAssetSchema (server validates). */
export function formDataToMediaInput(form: FormData): Record<string, unknown> {
  return {
    kind: cleaned(form, "kind") ?? "IMAGE",
    url: cleaned(form, "url") ?? "",
    filename: cleaned(form, "filename") ?? null,
    mimeType: cleaned(form, "mimeType") ?? null,
    byteSize: optionalNumber(form, "byteSize"),
    width: optionalNumber(form, "width"),
    height: optionalNumber(form, "height"),
    altText: cleaned(form, "altText") ?? "",
    caption: cleaned(form, "caption") ?? null,
  };
}
