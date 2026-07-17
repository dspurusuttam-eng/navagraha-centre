// Claude C8D — public projection of Admin-managed Consultation + Brand settings (pure).
//
// This is the privacy boundary. The Admin config documents carry fields the public must
// never see (the `isEnabled` master switch, `updatedById`, and the raw `settingsJson`
// envelope itself). Everything public is built by EXPLICIT field selection here — never by
// spreading an Admin object — so a new Admin field cannot leak by default.
//
// Pure: no DB, no `server-only`, so every rule below is directly testable.
import {
  CONSULTATION_AVAILABILITY,
  type ConsultationAvailability,
  type ConsultationConfig,
  type BrandSettingsInput,
  type BrandSocialLink,
} from "@/modules/admin/domain";

/** Locales the public consultation surface serves. */
export const PUBLIC_SETTINGS_LOCALES = ["en", "as", "hi"] as const;
export type PublicSettingsLocale = (typeof PUBLIC_SETTINGS_LOCALES)[number];

export function isPublicSettingsLocale(value: string | null | undefined): value is PublicSettingsLocale {
  return typeof value === "string" && (PUBLIC_SETTINGS_LOCALES as readonly string[]).includes(value);
}

// --- Public shapes (allow-listed) -------------------------------------------
export type PublicConsultation = {
  availability: ConsultationAvailability;
  availabilityLabel: string;
  /** Ready-to-use wa.me link, or null when no usable number is configured. */
  whatsappUrl: string | null;
  officeHours: string | null;
  languages: PublicSettingsLocale[];
  topics: string[];
  preparationInstructions: string | null;
  shortDescription: string | null;
  disclaimer: string | null;
  /** True when this came from Admin settings rather than the static fallback. */
  fromSettings: boolean;
};

export type PublicBrand = {
  acharyaName: string;
  professionalTitle: string | null;
  profileImageUrl: string | null;
  biography: string | null;
  supportEmail: string | null;
  officeHours: string | null;
  whatsappUrl: string | null;
  socialLinks: BrandSocialLink[];
  footer: { addressLine: string | null; copyright: string | null; note: string | null };
  disclaimer: string | null;
  fromSettings: boolean;
};

// --- Controlled static fallback ---------------------------------------------
// Used ONLY when Admin settings are absent, not yet published, or unreadable. Mirrors the
// existing public copy so the surface is unchanged until an editor publishes real settings.
export const STATIC_CONSULTATION_FALLBACK: PublicConsultation = {
  availability: "UNAVAILABLE",
  availabilityLabel: "By request",
  whatsappUrl: null,
  officeHours: null,
  languages: ["en"],
  topics: [],
  preparationInstructions: null,
  shortDescription: null,
  disclaimer: null,
  fromSettings: false,
};

export const STATIC_BRAND_FALLBACK: PublicBrand = {
  acharyaName: "Joy Prakash Sarmah",
  professionalTitle: "Vedic Astrologer and Spiritual Guide",
  profileImageUrl: null,
  biography: null,
  supportEmail: null,
  officeHours: null,
  whatsappUrl: null,
  socialLinks: [],
  footer: { addressLine: null, copyright: null, note: null },
  disclaimer: null,
  fromSettings: false,
};

// --- Helpers ----------------------------------------------------------------
/** Human availability label (never exposes the raw enum to copy by accident). */
export function availabilityLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Accepting consultations";
    case "LIMITED":
      return "Limited availability";
    case "UNAVAILABLE":
      return "By request";
    default:
      return STATIC_CONSULTATION_FALLBACK.availabilityLabel;
  }
}

/** Badge tone for each availability state (values from the existing design system). */
export type AvailabilityBadgeStatus = "LIVE" | "COMING_SOON" | "NEUTRAL";
export function availabilityBadgeStatus(status: string): AvailabilityBadgeStatus {
  switch (status) {
    case "AVAILABLE":
      return "LIVE";
    case "LIMITED":
      return "COMING_SOON";
    default:
      return "NEUTRAL";
  }
}

/** Controlled supporting copy for each availability state. */
export function availabilityNote(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Consultation requests are open.";
    case "LIMITED":
      return "Limited slots. A reply may take longer than usual.";
    default:
      return "Consultation requests are closed at present.";
  }
}

/**
 * Whether the WhatsApp call-to-action may be shown.
 * UNAVAILABLE is the public operational off-state, so the CTA is withheld there even when a
 * number is configured — turning consultations off must not leave a live contact button.
 */
export function showsWhatsappCta(status: string, whatsappUrl: string | null): boolean {
  return Boolean(whatsappUrl) && status !== "UNAVAILABLE";
}

function toAvailability(value: string): ConsultationAvailability {
  return (CONSULTATION_AVAILABILITY as readonly string[]).includes(value)
    ? (value as ConsultationAvailability)
    : "UNAVAILABLE";
}

/**
 * Build a `wa.me` deep link from an Admin-managed number + prefilled message.
 * Returns null unless the number is usable, so a bad value can never render a broken link.
 * This is a plain link only — no WhatsApp API, no booking, no CRM.
 */
export function buildWhatsappUrl(number: string | null | undefined, message?: string | null): string | null {
  const raw = (number ?? "").trim();
  if (!raw) return null;
  // E.164-ish: optional +, leading digit 1-9, 8-15 digits total.
  if (!/^\+?[1-9]\d{7,14}$/.test(raw)) return null;
  const digits = raw.replace(/^\+/, "");
  const text = (message ?? "").trim();
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

// --- Projections (explicit allow-list) --------------------------------------
/**
 * Project the Admin consultation config onto the public shape.
 * `isEnabled` is the Admin-only master switch: while it is false the settings are treated
 * as unpublished and the caller receives the controlled static fallback instead — so a
 * cutover changes nothing publicly until an editor deliberately turns it on. The flag
 * itself is never part of the returned shape.
 */
export function toPublicConsultation(config: ConsultationConfig | null | undefined): PublicConsultation {
  if (!config || config.isEnabled !== true) return STATIC_CONSULTATION_FALLBACK;
  const availability = toAvailability(config.availabilityStatus);
  return {
    availability,
    availabilityLabel: availabilityLabel(availability),
    whatsappUrl: buildWhatsappUrl(config.whatsappNumber, config.prefilledMessage),
    officeHours: config.officeHours?.trim() || null,
    languages: (config.languages ?? []).filter(isPublicSettingsLocale),
    topics: [...(config.topics ?? [])],
    preparationInstructions: config.preparationInstructions?.trim() || null,
    shortDescription: config.shortDescription?.trim() || null,
    disclaimer: config.disclaimer?.trim() || null,
    fromSettings: true,
  };
}

/**
 * Project the Admin brand config onto the public shape.
 * `profileImageUrl` is resolved by the caller from the MediaAsset reference — the raw
 * asset id is an internal reference and is never published.
 */
export function toPublicBrand(
  config: BrandSettingsInput | null | undefined,
  profileImageUrl?: string | null,
): PublicBrand {
  // Unpublished (or absent) settings render the controlled static surface, exactly like
  // consultation — nothing configured can leak before an editor's first save.
  if (!config || config.isEnabled !== true) return STATIC_BRAND_FALLBACK;
  return {
    acharyaName: config.acharyaName?.trim() || STATIC_BRAND_FALLBACK.acharyaName,
    professionalTitle: config.professionalTitle?.trim() || STATIC_BRAND_FALLBACK.professionalTitle,
    profileImageUrl: profileImageUrl?.trim() || null,
    biography: config.biography?.trim() || null,
    supportEmail: config.supportEmail?.trim() || null,
    officeHours: config.officeHours?.trim() || null,
    whatsappUrl: buildWhatsappUrl(config.whatsappNumber),
    socialLinks: (config.socialLinks ?? []).filter((link) => /^https:\/\//i.test(link.url)),
    footer: {
      addressLine: config.footer?.addressLine?.trim() || null,
      copyright: config.footer?.copyright?.trim() || null,
      note: config.footer?.note?.trim() || null,
    },
    disclaimer: config.disclaimer?.trim() || null,
    fromSettings: true,
  };
}

/** Run a public settings read, degrading to the controlled fallback on ANY failure. */
export async function safeSettingsRead<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch {
    // Swallowed deliberately: a settings outage must render the static surface, never a
    // 500 and never a database/connection detail on a public page.
    return fallback;
  }
}
