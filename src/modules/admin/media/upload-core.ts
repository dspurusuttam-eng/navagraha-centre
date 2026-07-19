// Desk cover-image upload validation (pure; no network, no server-only).
//
// Everything a malicious or accidental upload could exploit is decided here and unit-tested:
// which MIME types are allowed, the size ceiling, whether the bytes really are the image they
// claim to be (magic-byte sniff — a renamed .exe or an SVG payload never reaches storage), and
// the collision-safe object key. The route is a thin shell around these rules.

/** Uploadable image types. SVG is deliberately excluded: it can carry script. */
export const UPLOADABLE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type UploadableImageMimeType = (typeof UPLOADABLE_IMAGE_MIME_TYPES)[number];

/** Accept attribute for the native picker (Android gallery / PWA / desktop). */
export const UPLOAD_ACCEPT_ATTRIBUTE = UPLOADABLE_IMAGE_MIME_TYPES.join(",");

/** Maximum accepted original file size. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const EXTENSION_BY_MIME: Readonly<Record<UploadableImageMimeType, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isUploadableImageMimeType(value: string | null | undefined): value is UploadableImageMimeType {
  return (
    typeof value === "string" &&
    (UPLOADABLE_IMAGE_MIME_TYPES as readonly string[]).includes(value.toLowerCase())
  );
}

/**
 * Identify the real image type from the leading bytes.
 * Returns null when the content is not one of the three accepted formats — which is what
 * rejects renamed executables, SVG/XML, and truncated or malformed files.
 */
export function sniffImageMimeType(bytes: Uint8Array): UploadableImageMimeType | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, index) => bytes[index] === byte)) return "image/png";

  // WebP: "RIFF" .... "WEBP"
  const riff = [0x52, 0x49, 0x46, 0x46];
  const webp = [0x57, 0x45, 0x42, 0x50];
  if (
    riff.every((byte, index) => bytes[index] === byte) &&
    webp.every((byte, index) => bytes[8 + index] === byte)
  ) {
    return "image/webp";
  }

  return null;
}

export type UploadValidationInput = {
  declaredMimeType: string | null;
  byteSize: number;
  bytes: Uint8Array;
  filename: string | null;
};

export type UploadValidationResult =
  | { ok: true; mimeType: UploadableImageMimeType; extension: string }
  | { ok: false; code: string; message: string };

/** Full server-side gate: size, declared type, and real content type must all agree. */
export function validateUpload(input: UploadValidationInput): UploadValidationResult {
  if (input.byteSize <= 0) {
    return { ok: false, code: "EMPTY_FILE", message: "The selected file is empty." };
  }
  if (input.byteSize > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: "Image is larger than 8 MB. Choose a smaller image.",
    };
  }
  if (!isUploadableImageMimeType(input.declaredMimeType)) {
    return {
      ok: false,
      code: "UNSUPPORTED_TYPE",
      message: "Only JPEG, PNG or WebP images can be uploaded.",
    };
  }

  const sniffed = sniffImageMimeType(input.bytes);
  if (!sniffed) {
    return {
      ok: false,
      code: "MALFORMED_IMAGE",
      message: "That file is not a readable JPEG, PNG or WebP image.",
    };
  }
  // A JPEG declared as PNG is a mismatch we reject rather than silently "fix": the stored
  // MIME type must describe the stored bytes.
  if (sniffed !== input.declaredMimeType!.toLowerCase()) {
    return {
      ok: false,
      code: "TYPE_MISMATCH",
      message: "The file contents do not match its image type.",
    };
  }

  return { ok: true, mimeType: sniffed, extension: EXTENSION_BY_MIME[sniffed] };
}

/**
 * Filename shown in the Media library. Never used to build the storage key, so path
 * traversal cannot escape the prefix; this only keeps the library readable.
 */
export function toSafeDisplayFilename(filename: string | null, extension: string): string {
  const base = (filename ?? "")
    .split(/[\\/]/) // drop any directory portion of the client-supplied name
    .pop()!
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 80);
  return `${base || "cover-image"}.${extension}`;
}

/**
 * Collision-safe object key. The random suffix (plus Blob's own `addRandomSuffix`) means a
 * second upload of the same filename never overwrites the first, and the fixed prefix keeps
 * every Desk cover inside one namespace. Nothing from the client reaches the path.
 */
export function buildUploadObjectKey(extension: string, randomId: string): string {
  const safeRandom = randomId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32) || "asset";
  return `desk/covers/${safeRandom}.${extension}`;
}
