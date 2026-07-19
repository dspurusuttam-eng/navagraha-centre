// POST /api/admin/media/upload — Founder/editor cover-image upload.
//
// Uploads the binary to Vercel Blob (durable object storage; never the repo, the ephemeral
// serverless filesystem, or a database column) and registers the resulting https URL through
// the SAME `createMedia` service the URL-registration flow uses — so one Media Library record
// shape, one audit trail, one cache invalidation path.
//
// Security posture: the admin guard runs first (401 unauthenticated / 403 wrong role), then
// every byte is validated by the pure `upload-core` rules (size ceiling, allow-list MIME,
// magic-byte sniff so a renamed executable or an SVG payload is rejected, declared-vs-real
// type match). The storage key is server-generated, so nothing client-supplied can traverse
// paths or overwrite an existing object.
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/modules/admin/api-guard";
import {
  getMediaDeps,
  mediaActorFromContext,
  mediaServiceResponse,
} from "@/modules/admin/media/service";
import { createMedia } from "@/modules/admin/media/service-core";
import {
  MAX_UPLOAD_BYTES,
  buildUploadObjectKey,
  toSafeDisplayFilename,
  validateUpload,
} from "@/modules/admin/media/upload-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function uploadError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  // 401 when unauthenticated, 403 when the admin lacks write access — same guard the rest of
  // the Admin API uses, so upload can never be looser than article editing itself.
  const guard = await requireAdminApi({ allowedRoles: ["founder", "editor"] as const });
  if (!guard.ok) return guard.response;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return uploadError(
      503,
      "STORAGE_UNAVAILABLE",
      "Image storage is not configured. Contact the site administrator.",
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return uploadError(400, "INVALID_REQUEST", "Upload payload could not be read.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return uploadError(400, "NO_FILE", "No image file was received.");
  }
  // Cheap ceiling check before buffering, so an oversized file is refused without reading it.
  if (file.size > MAX_UPLOAD_BYTES) {
    return uploadError(413, "FILE_TOO_LARGE", "Image is larger than 8 MB. Choose a smaller image.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateUpload({
    declaredMimeType: file.type || null,
    byteSize: bytes.byteLength,
    bytes,
    filename: file.name || null,
  });
  if (!validation.ok) {
    const status = validation.code === "FILE_TOO_LARGE" ? 413 : 415;
    return uploadError(status, validation.code, validation.message);
  }

  const altTextRaw = form.get("altText");
  const altText = typeof altTextRaw === "string" ? altTextRaw.trim() : "";
  const filename = toSafeDisplayFilename(file.name || null, validation.extension);

  let uploadedUrl: string;
  try {
    const blob = await put(buildUploadObjectKey(validation.extension, randomUUID()), Buffer.from(bytes), {
      access: "public",
      contentType: validation.mimeType,
      // Belt and braces on top of the random key: Blob appends its own suffix, so an
      // upload can never overwrite an existing object.
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    uploadedUrl = blob.url;
  } catch {
    // Never surface storage/provider detail to the client.
    return uploadError(502, "UPLOAD_FAILED", "The image could not be stored. Please try again.");
  }

  // Register through the existing service: validation, audit log and public-cache
  // invalidation all stay in one place.
  const result = await createMedia(getMediaDeps(), mediaActorFromContext(guard.context), {
    kind: "IMAGE",
    url: uploadedUrl,
    filename,
    mimeType: validation.mimeType,
    byteSize: bytes.byteLength,
    // Alt text is required by the media schema; the editor can refine it right after upload.
    altText: altText || filename,
  });

  return mediaServiceResponse(result);
}
