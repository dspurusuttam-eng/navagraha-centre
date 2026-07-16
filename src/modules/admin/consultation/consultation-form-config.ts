// Claude Admin Console C5A — Consultation settings form config + helpers (pure).
// Maps the canonical ConsultationConfig (C2B1 domain) to/from flat form values and a
// PATCH payload for the existing consultation admin service. No DB, no server-only.
import {
  CONSULTATION_AVAILABILITY,
  CONSULTATION_LOCALES,
  type ConsultationConfig,
} from "@/modules/admin/domain";

export const CONSULTATION_FORM_FIELDS = [
  "availabilityStatus",
  "whatsappNumber",
  "prefilledMessage",
  "officeHours",
  "languages",
  "topics",
  "preparationInstructions",
  "shortDescription",
  "disclaimer",
] as const;
export type ConsultationFormField = (typeof CONSULTATION_FORM_FIELDS)[number];

export const CONSULTATION_AVAILABILITY_OPTIONS = CONSULTATION_AVAILABILITY;
export const CONSULTATION_LANGUAGE_OPTIONS = CONSULTATION_LOCALES;

/** Human labels for the availability select. */
export const CONSULTATION_AVAILABILITY_LABELS: Readonly<Record<string, string>> = {
  AVAILABLE: "Available",
  LIMITED: "Limited",
  UNAVAILABLE: "Unavailable",
};

/** Human labels for the EN/AS/HI language checkboxes. */
export const CONSULTATION_LANGUAGE_LABELS: Readonly<Record<string, string>> = {
  en: "English",
  as: "Assamese",
  hi: "Hindi",
};

/** Flat values used to seed the form (textareas hold newline-separated topics). */
export type ConsultationFormValues = {
  availabilityStatus: string;
  whatsappNumber: string;
  prefilledMessage: string;
  officeHours: string;
  languages: string[];
  topics: string;
  preparationInstructions: string;
  shortDescription: string;
  disclaimer: string;
};

/** One topic per line → trimmed, empty lines dropped (order preserved). */
export function parseTopics(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Topics array → one per line (form seed). */
export function formatTopics(topics: readonly string[]): string {
  return topics.join("\n");
}

export function consultationToFormValues(config: ConsultationConfig): ConsultationFormValues {
  return {
    availabilityStatus: config.availabilityStatus,
    whatsappNumber: config.whatsappNumber ?? "",
    prefilledMessage: config.prefilledMessage ?? "",
    officeHours: config.officeHours ?? "",
    languages: [...config.languages],
    topics: formatTopics(config.topics),
    preparationInstructions: config.preparationInstructions ?? "",
    shortDescription: config.shortDescription ?? "",
    disclaimer: config.disclaimer ?? "",
  };
}

const cleaned = (form: FormData, key: string): string | null => {
  const value = form.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
};

/**
 * Build a PATCH payload for `updateConsultationSettings`.
 * Optional text fields clear to `null`; `languages`/`topics` are always sent as arrays so
 * removals persist. `isEnabled` is deliberately NOT sent — it is not part of this form,
 * and the service merges the patch onto the current config, so it is preserved untouched.
 */
export function formDataToConsultationPatch(form: FormData): Record<string, unknown> {
  return {
    availabilityStatus: form.get("availabilityStatus") ?? "UNAVAILABLE",
    whatsappNumber: cleaned(form, "whatsappNumber"),
    prefilledMessage: cleaned(form, "prefilledMessage"),
    officeHours: cleaned(form, "officeHours"),
    languages: form.getAll("languages").filter((value): value is string => typeof value === "string"),
    topics: parseTopics(typeof form.get("topics") === "string" ? String(form.get("topics")) : ""),
    preparationInstructions: cleaned(form, "preparationInstructions"),
    shortDescription: cleaned(form, "shortDescription"),
    disclaimer: cleaned(form, "disclaimer"),
  };
}
