// Claude Admin Console C2B1 — Consultation settings config (pure Zod).
// The canonical WhatsApp-based consultation configuration document, stored on the
// ConsultationSettings singleton's settingsJson column. (This supersedes the C1A
// package-oriented `consultationSettingsSchema` placeholder.)
import { z } from "zod";

export const CONSULTATION_AVAILABILITY = ["AVAILABLE", "LIMITED", "UNAVAILABLE"] as const;
export type ConsultationAvailability = (typeof CONSULTATION_AVAILABILITY)[number];

// C10A LANGUAGE LOCK — Consultation V1 is English-only.
// The public supported Consultation locale is exactly `en`. Assamese/Hindi are intentionally
// NOT offered for Consultation content or Admin fields in this phase; localization is a later
// additive phase. (Desk language support is unrelated and unchanged — see ADMIN_ARTICLE_LOCALES.)
export const CONSULTATION_LOCALES = ["en"] as const;
export type ConsultationLocale = (typeof CONSULTATION_LOCALES)[number];

// WhatsApp number: optional leading +, country code + subscriber, 8–15 digits, no spaces.
const whatsappNumberSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "WhatsApp number must be 8–15 digits (E.164 style), optional leading +");

const uniqueLocales = z
  .array(z.enum(CONSULTATION_LOCALES))
  .min(1)
  .max(CONSULTATION_LOCALES.length)
  .refine((values) => new Set(values).size === values.length, "languages must be unique");

// Base shape WITHOUT defaults — so the PATCH schema does not re-apply defaults
// (which would wipe unspecified fields on merge).
const baseConsultationConfigSchema = z.object({
  isEnabled: z.boolean(),
  availabilityStatus: z.enum(CONSULTATION_AVAILABILITY),
  whatsappNumber: whatsappNumberSchema.nullish(),
  prefilledMessage: z.string().trim().max(1000).nullish(),
  officeHours: z.string().trim().max(500).nullish(),
  languages: uniqueLocales,
  topics: z.array(z.string().trim().min(1).max(100)).max(30),
  preparationInstructions: z.string().trim().max(4000).nullish(),
  shortDescription: z.string().trim().max(500).nullish(),
  disclaimer: z.string().trim().max(2000).nullish(),
  // C10A — approved English WhatsApp message templates. Two supported templates:
  //  * generalEnquiryTemplate       — a general enquiry ("I'd like to know more…")
  //  * selectedConsultationTemplate — a specific consultation, may carry a {utility} token
  // English-only. Left null until the approved copy is entered by an editor; never invented.
  generalEnquiryTemplate: z.string().trim().max(1000).nullish(),
  selectedConsultationTemplate: z.string().trim().max(1000).nullish(),
});

/** Full canonical config (defaults applied for the required fields). */
export const consultationConfigSchema = baseConsultationConfigSchema.extend({
  isEnabled: z.boolean().default(false),
  availabilityStatus: z.enum(CONSULTATION_AVAILABILITY).default("UNAVAILABLE"),
  languages: uniqueLocales.default(["en"]),
  topics: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
});
export type ConsultationConfig = z.infer<typeof consultationConfigSchema>;

/** Partial patch for PATCH /api/admin/consultation (merged onto the current config; no defaults). */
export const consultationConfigPatchSchema = baseConsultationConfigSchema.partial();
export type ConsultationConfigPatch = z.infer<typeof consultationConfigPatchSchema>;

/** Canonical defaults (used when the singleton is unset). */
export function defaultConsultationConfig(): ConsultationConfig {
  return consultationConfigSchema.parse({});
}
