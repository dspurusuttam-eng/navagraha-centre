"use client";

// Claude C10A — Consultation catalogue Admin forms (client). Founder/editor only; the service
// re-checks write access server-side. Publication is NOT part of these forms — it is a
// separate explicit action, so saving an edit never publishes.
import { useActionState } from "react";
import {
  CATALOGUE_AVAILABILITY_OPTIONS,
  CATALOGUE_AVAILABILITY_LABELS,
  CATALOGUE_PRICE_TYPE_OPTIONS,
  CATALOGUE_PRICE_TYPE_LABELS,
} from "@/modules/admin/consultation-catalogue/catalogue-form";
import type { CatalogueFormState } from "@/modules/admin/consultation-catalogue/catalogue-actions";

type Action = (prev: CatalogueFormState, formData: FormData) => Promise<CatalogueFormState>;
const INITIAL: CatalogueFormState = { error: null };

export type TierFormValues = {
  id?: string;
  slug: string;
  name: string;
  shortDescription: string;
  detailedScope: string;
  bestFor: string;
  isActive: boolean;
  availabilityStatus: string;
  sortOrder: number;
};

export type UtilityFormValues = {
  id?: string;
  slug: string;
  tierSlug: string;
  name: string;
  shortDescription: string;
  detailedScope: string;
  bestFor: string;
  includedItems: string;
  excludedItems: string;
  responseDescription: string;
  priceType: string;
  launchPrice: string;
  regularPrice: string;
  priceLabel: string;
  requiresScopeReview: boolean;
  travelExcluded: boolean;
  isPriority: boolean;
  isActive: boolean;
  availabilityStatus: string;
  sortOrder: number;
};

export type ModeFormValues = {
  id?: string;
  slug: string;
  name: string;
  shortDescription: string;
  priceType: string;
  launchPrice: string;
  regularPrice: string;
  priceLabel: string;
  travelExcluded: boolean;
  isActive: boolean;
  sortOrder: number;
};

// --- Shared primitives -------------------------------------------------------
function FieldError({ id, message }: Readonly<{ id: string; message?: string }>) {
  return message ? (
    <p id={id} className="text-sm text-red-600">
      {message}
    </p>
  ) : null;
}

function Banner({ state }: Readonly<{ state: CatalogueFormState }>) {
  if (state.ok) {
    return (
      <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        Saved.
      </p>
    );
  }
  return state.error ? (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {state.error}
    </div>
  ) : null;
}

const inputClass = "min-h-11 w-full rounded-md border px-3 py-2 disabled:bg-neutral-100";
const areaClass = "w-full rounded-md border px-3 py-2 disabled:bg-neutral-100";

function AvailabilitySelect({ name, defaultValue }: Readonly<{ name: string; defaultValue: string }>) {
  return (
    <select id={name} name={name} defaultValue={defaultValue} className={inputClass}>
      {CATALOGUE_AVAILABILITY_OPTIONS.map((value) => (
        <option key={value} value={value}>
          {CATALOGUE_AVAILABILITY_LABELS[value] ?? value}
        </option>
      ))}
    </select>
  );
}

function PriceTypeSelect({ defaultValue }: Readonly<{ defaultValue: string }>) {
  return (
    <select id="priceType" name="priceType" defaultValue={defaultValue} className={inputClass}>
      {CATALOGUE_PRICE_TYPE_OPTIONS.map((value) => (
        <option key={value} value={value}>
          {CATALOGUE_PRICE_TYPE_LABELS[value] ?? value}
        </option>
      ))}
    </select>
  );
}

// --- Tier form ---------------------------------------------------------------
export function TierForm({ action, initial, mode }: Readonly<{ action: Action; initial?: TierFormValues; mode: "create" | "edit" }>) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const err = (f: string) => state.fieldErrors?.[f];
  return (
    <form action={formAction} className="space-y-3" noValidate>
      <Banner state={state} />
      {mode === "edit" && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {mode === "create" ? (
        <div className="space-y-1">
          <label htmlFor="slug" className="block text-sm font-medium">Slug (stable id)</label>
          <input id="slug" name="slug" defaultValue={initial?.slug ?? ""} className={inputClass} aria-describedby={err("slug") ? "tier-slug-error" : undefined} />
          <FieldError id="tier-slug-error" message={err("slug")} />
        </div>
      ) : (
        <input type="hidden" name="slug" value={initial?.slug ?? ""} />
      )}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">Name (English)</label>
        <input id="name" name="name" defaultValue={initial?.name ?? ""} className={inputClass} aria-describedby={err("name") ? "tier-name-error" : undefined} />
        <FieldError id="tier-name-error" message={err("name")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="shortDescription" className="block text-sm font-medium">Short description</label>
        <textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={initial?.shortDescription ?? ""} className={areaClass} />
      </div>
      <div className="space-y-1">
        <label htmlFor="detailedScope" className="block text-sm font-medium">Detailed scope</label>
        <textarea id="detailedScope" name="detailedScope" rows={3} defaultValue={initial?.detailedScope ?? ""} className={areaClass} />
      </div>
      <div className="space-y-1">
        <label htmlFor="bestFor" className="block text-sm font-medium">Best for</label>
        <textarea id="bestFor" name="bestFor" rows={2} defaultValue={initial?.bestFor ?? ""} className={areaClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="availabilityStatus" className="block text-sm font-medium">Availability</label>
          <AvailabilitySelect name="availabilityStatus" defaultValue={initial?.availabilityStatus ?? "AVAILABLE"} />
        </div>
        <div className="space-y-1">
          <label htmlFor="sortOrder" className="block text-sm font-medium">Sort order</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={initial?.sortOrder ?? 0} className={inputClass} />
        </div>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} /> Active
      </label>
      <button type="submit" disabled={pending} className="min-h-11 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Saving…" : mode === "create" ? "Create tier" : "Save tier"}
      </button>
    </form>
  );
}

// --- Utility form ------------------------------------------------------------
export function UtilityForm({
  action,
  initial,
  mode,
  tierOptions,
}: Readonly<{ action: Action; initial?: UtilityFormValues; mode: "create" | "edit"; tierOptions: Array<{ slug: string; name: string }> }>) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const err = (f: string) => state.fieldErrors?.[f];
  return (
    <form action={formAction} className="space-y-3" noValidate>
      <Banner state={state} />
      {mode === "edit" && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {mode === "create" ? (
        <div className="space-y-1">
          <label htmlFor="slug" className="block text-sm font-medium">Slug (stable id)</label>
          <input id="slug" name="slug" defaultValue={initial?.slug ?? ""} className={inputClass} aria-describedby={err("slug") ? "u-slug-error" : undefined} />
          <FieldError id="u-slug-error" message={err("slug")} />
        </div>
      ) : (
        <input type="hidden" name="slug" value={initial?.slug ?? ""} />
      )}
      <div className="space-y-1">
        <label htmlFor="tierSlug" className="block text-sm font-medium">Tier</label>
        <select id="tierSlug" name="tierSlug" defaultValue={initial?.tierSlug ?? tierOptions[0]?.slug ?? ""} className={inputClass}>
          {tierOptions.map((tier) => (
            <option key={tier.slug} value={tier.slug}>{tier.name} ({tier.slug})</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">Name (English)</label>
        <input id="name" name="name" defaultValue={initial?.name ?? ""} className={inputClass} aria-describedby={err("name") ? "u-name-error" : undefined} />
        <FieldError id="u-name-error" message={err("name")} />
      </div>
      <div className="space-y-1">
        <label htmlFor="shortDescription" className="block text-sm font-medium">Short description</label>
        <textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={initial?.shortDescription ?? ""} className={areaClass} />
      </div>
      <div className="space-y-1">
        <label htmlFor="detailedScope" className="block text-sm font-medium">Detailed scope</label>
        <textarea id="detailedScope" name="detailedScope" rows={3} defaultValue={initial?.detailedScope ?? ""} className={areaClass} />
      </div>
      <div className="space-y-1">
        <label htmlFor="bestFor" className="block text-sm font-medium">Best for</label>
        <textarea id="bestFor" name="bestFor" rows={2} defaultValue={initial?.bestFor ?? ""} className={areaClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="includedItems" className="block text-sm font-medium">Included items (one per line)</label>
          <textarea id="includedItems" name="includedItems" rows={4} defaultValue={initial?.includedItems ?? ""} className={areaClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="excludedItems" className="block text-sm font-medium">Excluded items (one per line)</label>
          <textarea id="excludedItems" name="excludedItems" rows={4} defaultValue={initial?.excludedItems ?? ""} className={areaClass} />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="responseDescription" className="block text-sm font-medium">Expected response / delivery</label>
        <textarea id="responseDescription" name="responseDescription" rows={2} defaultValue={initial?.responseDescription ?? ""} className={areaClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="priceType" className="block text-sm font-medium">Price type</label>
          <PriceTypeSelect defaultValue={initial?.priceType ?? "FIXED"} />
        </div>
        <div className="space-y-1">
          <label htmlFor="priceLabel" className="block text-sm font-medium">Price label</label>
          <input id="priceLabel" name="priceLabel" defaultValue={initial?.priceLabel ?? ""} className={inputClass} placeholder="From ₹4,999" />
        </div>
        <div className="space-y-1">
          <label htmlFor="launchPrice" className="block text-sm font-medium">Launch price (₹)</label>
          <input id="launchPrice" name="launchPrice" type="number" min={0} defaultValue={initial?.launchPrice ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="regularPrice" className="block text-sm font-medium">Regular price (₹, optional)</label>
          <input id="regularPrice" name="regularPrice" type="number" min={0} defaultValue={initial?.regularPrice ?? ""} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="availabilityStatus" className="block text-sm font-medium">Availability</label>
          <AvailabilitySelect name="availabilityStatus" defaultValue={initial?.availabilityStatus ?? "AVAILABLE"} />
        </div>
        <div className="space-y-1">
          <label htmlFor="sortOrder" className="block text-sm font-medium">Sort order</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={initial?.sortOrder ?? 0} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="isPriority" defaultChecked={initial?.isPriority ?? false} /> Priority</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="requiresScopeReview" defaultChecked={initial?.requiresScopeReview ?? false} /> Requires scope review</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="travelExcluded" defaultChecked={initial?.travelExcluded ?? false} /> Travel excluded</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} /> Active</label>
      </div>
      <button type="submit" disabled={pending} className="min-h-11 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Saving…" : mode === "create" ? "Create utility" : "Save utility"}
      </button>
    </form>
  );
}

// --- Mode form ---------------------------------------------------------------
export function ModeForm({ action, utilityId, initial, mode }: Readonly<{ action: Action; utilityId?: string; initial?: ModeFormValues; mode: "create" | "edit" }>) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const err = (f: string) => state.fieldErrors?.[f];
  return (
    <form action={formAction} className="space-y-3" noValidate>
      <Banner state={state} />
      {mode === "create" && utilityId ? <input type="hidden" name="utilityId" value={utilityId} /> : null}
      {mode === "edit" && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {mode === "create" ? (
        <div className="space-y-1">
          <label htmlFor="slug" className="block text-sm font-medium">Mode slug</label>
          <input id="slug" name="slug" defaultValue={initial?.slug ?? ""} className={inputClass} placeholder="remote / on-site" aria-describedby={err("slug") ? "m-slug-error" : undefined} />
          <FieldError id="m-slug-error" message={err("slug")} />
        </div>
      ) : (
        <input type="hidden" name="slug" value={initial?.slug ?? ""} />
      )}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">Name (English)</label>
        <input id="name" name="name" defaultValue={initial?.name ?? ""} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="priceType" className="block text-sm font-medium">Price type</label>
          <PriceTypeSelect defaultValue={initial?.priceType ?? "FIXED"} />
        </div>
        <div className="space-y-1">
          <label htmlFor="launchPrice" className="block text-sm font-medium">Launch price (₹)</label>
          <input id="launchPrice" name="launchPrice" type="number" min={0} defaultValue={initial?.launchPrice ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="travelExcluded" defaultChecked={initial?.travelExcluded ?? false} /> Travel excluded</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} /> Active</label>
      </div>
      <button type="submit" disabled={pending} className="min-h-11 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Saving…" : mode === "create" ? "Add mode" : "Save mode"}
      </button>
    </form>
  );
}
