// Claude Admin Console C2B2 — Brand/profile settings config (canonical Zod).
// The whole brand + Acharya profile config document, stored on the BrandSettings
// singleton's settingsJson column (single canonical representation, like consultation).
import { z } from "zod";
import { mediaReferenceIdSchema } from "@/modules/admin/domain/types";

export const brandSocialLinkSchema = z.object({
  platform: z.string().trim().min(1).max(40),
  url: z.url().max(2048),
});
export type BrandSocialLink = z.infer<typeof brandSocialLinkSchema>;

// WhatsApp number: optional leading +, country code + subscriber, 8–15 digits, no spaces.
const brandWhatsappSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "WhatsApp number must be 8–15 digits (E.164 style), optional leading +");

const brandFooterSchema = z.object({
  addressLine: z.string().trim().max(300).nullish(),
  copyright: z.string().trim().max(200).nullish(),
  note: z.string().trim().max(500).nullish(),
});

// Base shape WITHOUT defaults — so the PATCH schema does not re-apply defaults.
const baseBrandSettingsSchema = z.object({
  // C8E: publication latch. Stored inside settingsJson, so this needs NO Prisma change.
  // There is no editor toggle: the first valid founder/editor save sets it, and the public
  // surface falls back to the static copy until then.
  isEnabled: z.boolean(),
  acharyaName: z.string().trim().min(1).max(200).nullish(),
  professionalTitle: z.string().trim().max(200).nullish(),
  profileImageAssetId: mediaReferenceIdSchema.nullish(), // soft MediaAsset reference (no upload)
  biography: z.string().trim().max(5000).nullish(),
  supportEmail: z.email().max(320).nullish(),
  officeHours: z.string().trim().max(500).nullish(),
  whatsappNumber: brandWhatsappSchema.nullish(),
  socialLinks: z.array(brandSocialLinkSchema).max(20),
  footer: brandFooterSchema.nullish(),
  disclaimer: z.string().trim().max(2000).nullish(),
});

/** Full canonical brand/profile config (defaults applied). */
export const brandSettingsSchema = baseBrandSettingsSchema.extend({
  isEnabled: z.boolean().default(false),
  socialLinks: z.array(brandSocialLinkSchema).max(20).default([]),
});
export type BrandSettingsInput = z.infer<typeof brandSettingsSchema>;

/** Partial patch for PATCH /api/admin/settings/brand (merged onto current; no defaults). */
export const brandSettingsPatchSchema = baseBrandSettingsSchema.partial();
export type BrandSettingsPatch = z.infer<typeof brandSettingsPatchSchema>;

/** Canonical defaults (used when the singleton is unset). */
export function defaultBrandSettings(): BrandSettingsInput {
  return brandSettingsSchema.parse({});
}
