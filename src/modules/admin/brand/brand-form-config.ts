// Claude Admin Console C5B — Brand/profile settings form config + helpers (pure).
// Maps the canonical BrandSettings config (C2B2 domain) to/from flat form values and a
// PATCH payload for the existing brand admin service. No DB, no server-only, no upload.
import type { BrandSettingsInput, BrandSocialLink } from "@/modules/admin/domain";

export const BRAND_FORM_FIELDS = [
  "acharyaName",
  "professionalTitle",
  "profileImageAssetId",
  "biography",
  "supportEmail",
  "officeHours",
  "whatsappNumber",
  "socialLinks",
  "footerAddressLine",
  "footerCopyright",
  "footerNote",
  "disclaimer",
] as const;
export type BrandFormField = (typeof BRAND_FORM_FIELDS)[number];

/** Flat values used to seed the form (composite fields are newline-separated text). */
export type BrandFormValues = Record<BrandFormField, string>;

/** Separator between a social link's platform and its URL, one link per line. */
export const SOCIAL_LINK_SEPARATOR = "|";

/**
 * One social link per line as `platform | url`.
 * A line without a separator yields an empty platform so the schema reports the issue
 * rather than the parser silently guessing.
 */
export function parseSocialLinks(text: string): BrandSocialLink[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const index = line.indexOf(SOCIAL_LINK_SEPARATOR);
      if (index === -1) return { platform: "", url: line };
      return { platform: line.slice(0, index).trim(), url: line.slice(index + 1).trim() };
    });
}

/** Social links → `platform | url` per line (form seed). */
export function formatSocialLinks(links: readonly BrandSocialLink[]): string {
  return links.map((link) => `${link.platform} ${SOCIAL_LINK_SEPARATOR} ${link.url}`).join("\n");
}

export function brandToFormValues(config: BrandSettingsInput): BrandFormValues {
  return {
    acharyaName: config.acharyaName ?? "",
    professionalTitle: config.professionalTitle ?? "",
    profileImageAssetId: config.profileImageAssetId ?? "",
    biography: config.biography ?? "",
    supportEmail: config.supportEmail ?? "",
    officeHours: config.officeHours ?? "",
    whatsappNumber: config.whatsappNumber ?? "",
    socialLinks: formatSocialLinks(config.socialLinks ?? []),
    footerAddressLine: config.footer?.addressLine ?? "",
    footerCopyright: config.footer?.copyright ?? "",
    footerNote: config.footer?.note ?? "",
    disclaimer: config.disclaimer ?? "",
  };
}

const cleaned = (form: FormData, key: string): string | null => {
  const value = form.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
};
const raw = (form: FormData, key: string): string => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

/**
 * Build a PATCH payload for `updateBrandSettings`.
 * Optional text fields clear to `null`; `socialLinks` and `footer` are always sent whole
 * so removals persist (the service merges the patch onto the current config field-wise).
 */
export function formDataToBrandPatch(form: FormData): Record<string, unknown> {
  return {
    acharyaName: cleaned(form, "acharyaName"),
    professionalTitle: cleaned(form, "professionalTitle"),
    profileImageAssetId: cleaned(form, "profileImageAssetId"),
    biography: cleaned(form, "biography"),
    supportEmail: cleaned(form, "supportEmail"),
    officeHours: cleaned(form, "officeHours"),
    whatsappNumber: cleaned(form, "whatsappNumber"),
    socialLinks: parseSocialLinks(raw(form, "socialLinks")),
    footer: {
      addressLine: cleaned(form, "footerAddressLine"),
      copyright: cleaned(form, "footerCopyright"),
      note: cleaned(form, "footerNote"),
    },
    disclaimer: cleaned(form, "disclaimer"),
  };
}
