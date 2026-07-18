// Claude Admin Console C6B — MediaAsset picker policy (pure).
// Decides which assets are pickable and how a stored reference resolves against them —
// including a deleted/unknown id and a media-library outage. Framework-agnostic.
import { isHttpsUrl } from "@/modules/admin/media/media-form-config";
import type { MediaRecord } from "@/modules/admin/media/types";

/** The minimal, serializable asset shape the picker renders. */
export type MediaPickerOption = {
  id: string;
  url: string;
  filename: string;
  altText: string;
};

/**
 * A stored reference resolved against the pickable options:
 * - `empty`       nothing selected
 * - `selected`    the reference resolves to a pickable asset
 * - `missing`     the reference points at an asset that no longer exists (deleted) or is
 *                 not pickable — the value is preserved so it is never silently dropped
 * - `unavailable` the library could not be loaded; a "missing" verdict would be a lie, so
 *                 the reference is preserved read-only instead
 */
export type PickerSelection =
  | { state: "empty" }
  | { state: "selected"; option: MediaPickerOption }
  | { state: "missing"; id: string }
  | { state: "unavailable"; id: string };

/**
 * Only valid image assets are pickable: IMAGE kind with a usable https URL.
 * (A non-https or malformed URL could never render, so it must never be offered.)
 */
export function isPickableAsset(asset: MediaRecord): boolean {
  return asset.kind === "IMAGE" && isHttpsUrl(asset.url);
}

export function toPickerOptions(assets: readonly MediaRecord[]): MediaPickerOption[] {
  return assets.filter(isPickableAsset).map((asset) => ({
    id: asset.id,
    url: asset.url,
    filename: asset.filename?.trim() ? asset.filename.trim() : asset.url,
    altText: asset.altText?.trim() ? asset.altText.trim() : "",
  }));
}

/** Resolve a stored asset id against the options (`null` options = library unavailable). */
export function resolvePickerSelection(
  selectedId: string,
  options: readonly MediaPickerOption[] | null,
): PickerSelection {
  const id = (selectedId ?? "").trim();
  if (options === null) return { state: "unavailable", id };
  if (id === "") return { state: "empty" };
  const option = options.find((candidate) => candidate.id === id);
  return option ? { state: "selected", option } : { state: "missing", id };
}

/** Plain-language status for the picker (also used by QA to pin the copy). */
export function pickerStatusLabel(selection: PickerSelection): string {
  switch (selection.state) {
    case "empty":
      return "No image selected.";
    case "selected":
      return selection.option.altText === ""
        ? "Selected. This asset has no alt text — add one in the media library."
        : "Selected.";
    case "missing":
      return "The selected image is missing or was deleted. Choose another or clear it.";
    case "unavailable":
      return id(selection) === ""
        ? "The media library is unavailable. Try again shortly."
        : "The media library is unavailable. The current selection is preserved.";
  }
}

function id(selection: Extract<PickerSelection, { id: string }>): string {
  return selection.id;
}
