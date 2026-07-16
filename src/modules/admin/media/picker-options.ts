// Claude Admin Console C6B — server helper feeding the MediaAsset picker.
import "server-only";

import { getMediaDeps } from "@/modules/admin/media/service";
import { listMedia } from "@/modules/admin/media/service-core";
import { toPickerOptions, type MediaPickerOption } from "@/modules/admin/media/media-picker-core";

/** How many image assets the picker offers (newest page of the library). */
export const MEDIA_PICKER_LIMIT = 100;

/**
 * Pickable image assets, or `null` when the library could not be read.
 * `null` is deliberate: an empty array would make every existing reference look deleted,
 * so callers must be able to tell an outage from an empty library.
 */
export async function getMediaPickerOptions(): Promise<MediaPickerOption[] | null> {
  const result = await listMedia(getMediaDeps(), { kind: "IMAGE", page: 1, pageSize: MEDIA_PICKER_LIMIT });
  return result.ok ? toPickerOptions(result.data.items) : null;
}
