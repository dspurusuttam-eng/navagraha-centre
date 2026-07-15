// Claude Admin Console C2C — MediaAsset validation (URL/reference metadata only).
// No binary upload: media is registered by an https URL + required alt text + bounded
// metadata. Canonical fields: filename, url, kind, mimeType, byteSize, width, height,
// altText, caption.
import { z } from "zod";

export const MEDIA_ASSET_KINDS = ["IMAGE"] as const;
export type MediaAssetKind = (typeof MEDIA_ASSET_KINDS)[number];
export const mediaAssetKindSchema = z.enum(MEDIA_ASSET_KINDS);

/** Allowed image MIME types (validated when provided). */
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
] as const;
export const imageMimeTypeSchema = z.enum(IMAGE_MIME_TYPES);

const httpsUrlSchema = z
  .url()
  .max(2048)
  .refine((value) => /^https:\/\//i.test(value), "media URL must use https");

export const createMediaAssetSchema = z.object({
  kind: mediaAssetKindSchema.default("IMAGE"),
  url: httpsUrlSchema,
  filename: z.string().trim().min(1).max(300).nullish(),
  mimeType: imageMimeTypeSchema.nullish(),
  byteSize: z.number().int().positive().max(50_000_000).nullish(),
  width: z.number().int().positive().max(20_000).nullish(),
  height: z.number().int().positive().max(20_000).nullish(),
  altText: z.string().trim().min(1).max(300), // required for accessibility
  caption: z.string().trim().max(600).nullish(),
});
export type CreateMediaAssetInput = z.infer<typeof createMediaAssetSchema>;

export const updateMediaAssetSchema = createMediaAssetSchema.partial();
export type UpdateMediaAssetInput = z.infer<typeof updateMediaAssetSchema>;
