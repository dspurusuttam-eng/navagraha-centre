// Claude C10A — Consultation catalogue Admin view (server component).
// Renders the full catalogue (tiers → utilities → modes) with every managed field, and wires
// the create/edit forms + the explicit publish/unpublish/delete actions. Founder/editor can
// manage; support sees a read-only rendering (and the service rejects any bypassed write).
import {
  createTierAction,
  updateTierAction,
  createUtilityAction,
  updateUtilityAction,
  createModeAction,
  updateModeAction,
  transitionTierAction,
  transitionUtilityAction,
  deleteTierAction,
  deleteUtilityAction,
  deleteModeAction,
} from "@/modules/admin/consultation-catalogue/catalogue-actions";
import {
  TierForm,
  UtilityForm,
  ModeForm,
  type TierFormValues,
  type UtilityFormValues,
  type ModeFormValues,
} from "@/modules/admin/consultation-catalogue/catalogue-forms";
import type { TierWithUtilities, UtilityRecord, ModeRecord } from "@/modules/admin/consultation-catalogue/types";

const str = (v: string | null): string => v ?? "";
const price = (v: number | null): string => (v == null ? "" : String(v));

function toTierValues(tier: TierWithUtilities): TierFormValues {
  return {
    id: tier.id,
    slug: tier.slug,
    name: tier.name,
    shortDescription: str(tier.shortDescription),
    detailedScope: str(tier.detailedScope),
    bestFor: str(tier.bestFor),
    isActive: tier.isActive,
    availabilityStatus: tier.availabilityStatus,
    sortOrder: tier.sortOrder,
  };
}

function toUtilityValues(utility: UtilityRecord, tierSlug: string): UtilityFormValues {
  return {
    id: utility.id,
    slug: utility.slug,
    tierSlug,
    name: utility.name,
    shortDescription: str(utility.shortDescription),
    detailedScope: str(utility.detailedScope),
    bestFor: str(utility.bestFor),
    includedItems: utility.includedItems.join("\n"),
    excludedItems: utility.excludedItems.join("\n"),
    responseDescription: str(utility.responseDescription),
    priceType: utility.priceType,
    launchPrice: price(utility.launchPrice),
    regularPrice: price(utility.regularPrice),
    priceLabel: str(utility.priceLabel),
    requiresScopeReview: utility.requiresScopeReview,
    travelExcluded: utility.travelExcluded,
    isPriority: utility.isPriority,
    isActive: utility.isActive,
    availabilityStatus: utility.availabilityStatus,
    sortOrder: utility.sortOrder,
  };
}

function toModeValues(mode: ModeRecord): ModeFormValues {
  return {
    id: mode.id,
    slug: mode.slug,
    name: mode.name,
    shortDescription: str(mode.shortDescription),
    priceType: mode.priceType,
    launchPrice: price(mode.launchPrice),
    regularPrice: price(mode.regularPrice),
    priceLabel: str(mode.priceLabel),
    travelExcluded: mode.travelExcluded,
    isActive: mode.isActive,
    sortOrder: mode.sortOrder,
  };
}

function StateBadge({ state }: Readonly<{ state: string }>) {
  const tone =
    state === "PUBLISHED" ? "border-green-300 bg-green-50 text-green-700" : state === "ARCHIVED" ? "border-neutral-300 bg-neutral-100 text-neutral-600" : "border-amber-300 bg-amber-50 text-amber-700";
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>{state}</span>;
}

function PublishControls({
  id,
  state,
  action,
  deleteAction,
  canWrite,
  kind,
}: Readonly<{
  id: string;
  state: string;
  action: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  canWrite: boolean;
  kind: "tier" | "utility";
}>) {
  if (!canWrite) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {state !== "PUBLISHED" ? (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="action" value="PUBLISH" />
          <button type="submit" className="min-h-9 rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-700">Publish</button>
        </form>
      ) : (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="action" value="UNPUBLISH" />
          <button type="submit" className="min-h-9 rounded-md border border-amber-300 px-3 py-1 text-xs font-medium text-amber-700">Unpublish</button>
        </form>
      )}
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="action" value="ARCHIVE" />
        <button type="submit" className="min-h-9 rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-600">Archive</button>
      </form>
      <form action={deleteAction} className="flex items-center gap-1">
        <input type="hidden" name="id" value={id} />
        <label className="flex items-center gap-1 text-xs text-neutral-500">
          <input type="checkbox" name="confirm" /> confirm
        </label>
        <button type="submit" className="min-h-9 rounded-md border border-red-300 px-3 py-1 text-xs text-red-700">Delete {kind}</button>
      </form>
    </div>
  );
}

export function CatalogueAdminView({ catalogue, canWrite }: Readonly<{ catalogue: TierWithUtilities[]; canWrite: boolean }>) {
  const tierOptions = catalogue.map((tier) => ({ slug: tier.slug, name: tier.name }));

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Consultation catalogue</h1>
        <p className="text-sm text-neutral-600">
          Tiers, utilities and priced modes. Content is English-only. Editing never publishes — use the explicit Publish
          action once an entry is complete.
        </p>
      </div>

      {!canWrite ? (
        <p role="note" className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          You have read-only access to the consultation catalogue.
        </p>
      ) : null}

      {canWrite ? (
        <div className="grid gap-6 md:grid-cols-2">
          <details className="rounded-lg border border-neutral-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold">New tier</summary>
            <div className="pt-3">
              <TierForm action={createTierAction} mode="create" />
            </div>
          </details>
          <details className="rounded-lg border border-neutral-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold">New utility</summary>
            <div className="pt-3">
              <UtilityForm action={createUtilityAction} mode="create" tierOptions={tierOptions} />
            </div>
          </details>
        </div>
      ) : null}

      {catalogue.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
          No tiers yet. Create the four tiers, then add utilities.
        </p>
      ) : null}

      <ul className="space-y-6">
        {catalogue.map((tier) => (
          <li key={tier.id} className="rounded-lg border border-neutral-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{tier.name}</h2>
                  <StateBadge state={tier.publicationState} />
                  {!tier.isActive ? <span className="text-xs text-neutral-400">inactive</span> : null}
                </div>
                <p className="text-xs text-neutral-500">{tier.slug} · {tier.utilities.length} utilities · availability {tier.availabilityStatus}</p>
              </div>
              <PublishControls id={tier.id} state={tier.publicationState} action={transitionTierAction} deleteAction={deleteTierAction} canWrite={canWrite} kind="tier" />
            </div>

            {canWrite ? (
              <details className="mt-3 rounded-md border border-neutral-100 bg-neutral-50 p-3">
                <summary className="cursor-pointer text-sm font-medium">Edit tier</summary>
                <div className="pt-3">
                  <TierForm action={updateTierAction} mode="edit" initial={toTierValues(tier)} />
                </div>
              </details>
            ) : null}

            <ul className="mt-4 space-y-4">
              {tier.utilities.map((utility) => (
                <li key={utility.id} className="rounded-md border border-neutral-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{utility.name}</h3>
                        <StateBadge state={utility.publicationState} />
                        {utility.isPriority ? <span className="rounded-full border border-indigo-300 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">priority</span> : null}
                        {utility.requiresScopeReview ? <span className="rounded-full border border-purple-300 bg-purple-50 px-2 py-0.5 text-xs text-purple-700">scope review</span> : null}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {utility.slug} · {utility.priceType}
                        {utility.launchPrice != null ? ` · ₹${utility.launchPrice}` : ""}
                        {utility.priceLabel ? ` · ${utility.priceLabel}` : ""}
                        {utility.hasModes ? ` · ${utility.modes.length} modes` : ""}
                      </p>
                    </div>
                    <PublishControls id={utility.id} state={utility.publicationState} action={transitionUtilityAction} deleteAction={deleteUtilityAction} canWrite={canWrite} kind="utility" />
                  </div>

                  {utility.modes.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-xs text-neutral-600">
                      {utility.modes.map((mode) => (
                        <li key={mode.id} className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{mode.name}</span>
                          <span>({mode.slug})</span>
                          {mode.launchPrice != null ? <span>₹{mode.launchPrice}</span> : null}
                          {mode.travelExcluded ? <span className="text-neutral-400">travel excluded</span> : null}
                          {!mode.isActive ? <span className="text-neutral-400">inactive</span> : null}
                          {canWrite ? (
                            <form action={deleteModeAction} className="flex items-center gap-1">
                              <input type="hidden" name="id" value={mode.id} />
                              <input type="hidden" name="confirm" value="on" />
                              <button type="submit" className="text-red-600 underline">remove</button>
                            </form>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {canWrite ? (
                    <div className="mt-3 flex flex-wrap gap-4">
                      <details className="min-w-[16rem] flex-1 rounded-md border border-neutral-100 bg-neutral-50 p-3">
                        <summary className="cursor-pointer text-sm font-medium">Edit utility</summary>
                        <div className="pt-3">
                          <UtilityForm action={updateUtilityAction} mode="edit" initial={toUtilityValues(utility, tier.slug)} tierOptions={tierOptions} />
                        </div>
                      </details>
                      <details className="min-w-[16rem] flex-1 rounded-md border border-neutral-100 bg-neutral-50 p-3">
                        <summary className="cursor-pointer text-sm font-medium">Add / edit modes</summary>
                        <div className="space-y-4 pt-3">
                          <ModeForm action={createModeAction} mode="create" utilityId={utility.id} />
                          {utility.modes.map((mode) => (
                            <details key={mode.id} className="rounded-md border border-neutral-200 p-2">
                              <summary className="cursor-pointer text-xs font-medium">Edit “{mode.name}”</summary>
                              <div className="pt-2">
                                <ModeForm action={updateModeAction} mode="edit" initial={toModeValues(mode)} />
                              </div>
                            </details>
                          ))}
                        </div>
                      </details>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
