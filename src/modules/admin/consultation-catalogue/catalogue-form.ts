// Claude C10A — Consultation catalogue Admin form helpers (pure; no DB, no server-only).
// Maps flat FormData to create/update payloads for the catalogue service. Kept pure so the
// mapping rules are directly testable.
import { CATALOGUE_AVAILABILITY, CONSULTATION_PRICE_TYPES } from "@/modules/admin/consultation-catalogue/domain";

export const CATALOGUE_AVAILABILITY_OPTIONS = CATALOGUE_AVAILABILITY;
export const CATALOGUE_PRICE_TYPE_OPTIONS = CONSULTATION_PRICE_TYPES;

export const CATALOGUE_AVAILABILITY_LABELS: Readonly<Record<string, string>> = {
  AVAILABLE: "Available",
  LIMITED: "Limited",
  UNAVAILABLE: "Unavailable",
};

export const CATALOGUE_PRICE_TYPE_LABELS: Readonly<Record<string, string>> = {
  FIXED: "Fixed",
  FROM: "From (starting price)",
};

const text = (form: FormData, key: string): string => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};

/** Optional text: empty string → null so the field clears rather than storing "". */
const optionalText = (form: FormData, key: string): string | null => {
  const t = text(form, key);
  return t === "" ? null : t;
};

/** HTML checkbox → boolean (present with any truthy value = checked). */
const checkbox = (form: FormData, key: string): boolean => {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
};

/** Optional integer price: empty → null; non-numeric → null (schema then flags if needed). */
const optionalInt = (form: FormData, key: string): number | null => {
  const t = text(form, key);
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const intOr = (form: FormData, key: string, fallback: number): number => {
  const t = text(form, key);
  if (t === "") return fallback;
  const n = Number(t);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

/** One item per line → trimmed, empty lines dropped (order preserved). */
export function parseLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function formatLines(items: readonly string[]): string {
  return items.join("\n");
}

export function formToTierInput(form: FormData): Record<string, unknown> {
  return {
    slug: text(form, "slug"),
    name: text(form, "name"),
    shortDescription: optionalText(form, "shortDescription"),
    detailedScope: optionalText(form, "detailedScope"),
    bestFor: optionalText(form, "bestFor"),
    isActive: checkbox(form, "isActive"),
    availabilityStatus: text(form, "availabilityStatus") || "AVAILABLE",
    sortOrder: intOr(form, "sortOrder", 0),
  };
}

/** For updates, slug is not editable, so it is omitted. */
export function formToTierUpdate(form: FormData): Record<string, unknown> {
  const { slug: _slug, ...rest } = formToTierInput(form);
  void _slug;
  return rest;
}

export function formToUtilityInput(form: FormData): Record<string, unknown> {
  return {
    slug: text(form, "slug"),
    tierSlug: text(form, "tierSlug"),
    name: text(form, "name"),
    shortDescription: optionalText(form, "shortDescription"),
    detailedScope: optionalText(form, "detailedScope"),
    bestFor: optionalText(form, "bestFor"),
    includedItems: parseLines(text(form, "includedItems")),
    excludedItems: parseLines(text(form, "excludedItems")),
    responseDescription: optionalText(form, "responseDescription"),
    priceType: text(form, "priceType") || "FIXED",
    currency: "INR",
    launchPrice: optionalInt(form, "launchPrice"),
    regularPrice: optionalInt(form, "regularPrice"),
    priceLabel: optionalText(form, "priceLabel"),
    requiresScopeReview: checkbox(form, "requiresScopeReview"),
    travelExcluded: checkbox(form, "travelExcluded"),
    isPriority: checkbox(form, "isPriority"),
    isActive: checkbox(form, "isActive"),
    availabilityStatus: text(form, "availabilityStatus") || "AVAILABLE",
    sortOrder: intOr(form, "sortOrder", 0),
  };
}

export function formToUtilityUpdate(form: FormData): Record<string, unknown> {
  const { slug: _slug, ...rest } = formToUtilityInput(form);
  void _slug;
  return rest;
}

export function formToModeInput(form: FormData): Record<string, unknown> {
  return {
    slug: text(form, "slug"),
    name: text(form, "name"),
    shortDescription: optionalText(form, "shortDescription"),
    priceType: text(form, "priceType") || "FIXED",
    currency: "INR",
    launchPrice: optionalInt(form, "launchPrice"),
    regularPrice: optionalInt(form, "regularPrice"),
    priceLabel: optionalText(form, "priceLabel"),
    travelExcluded: checkbox(form, "travelExcluded"),
    isActive: checkbox(form, "isActive"),
    sortOrder: intOr(form, "sortOrder", 0),
  };
}

export function formToModeUpdate(form: FormData): Record<string, unknown> {
  const { slug: _slug, ...rest } = formToModeInput(form);
  void _slug;
  return rest;
}
