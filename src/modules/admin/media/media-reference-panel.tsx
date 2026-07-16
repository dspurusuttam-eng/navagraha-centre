"use client";

// Claude Admin Console C6A — Media reference status + guarded delete (client).
// Reference status is shown to every admin (support included). Deletion is founder/editor
// only, is BLOCKED while any Article or BrandSettings still points at the asset, and
// requires explicit confirmation when the asset is unused. The service re-checks both.
import { useState, useTransition } from "react";
import { isReferenced, referenceSummary } from "@/modules/admin/media/media-list";
import type { MediaFormState } from "@/modules/admin/media/media-actions";
import type { MediaReferenceCount } from "@/modules/admin/media/types";

type Props = {
  assetId: string;
  refs: MediaReferenceCount;
  canWrite: boolean;
  remove: (id: string) => Promise<MediaFormState>;
};

export function MediaReferencePanel({ assetId, refs, canWrite, remove }: Readonly<Props>) {
  const [confirming, setConfirming] = useState(false);
  const [state, setState] = useState<MediaFormState>({ error: null });
  const [pending, startTransition] = useTransition();

  const referenced = isReferenced(refs);
  const canDelete = canWrite && !referenced;

  const execute = () => {
    setConfirming(false);
    setState({ error: null });
    startTransition(async () => {
      // On success the server redirects to the library and nothing returns here.
      const result = await remove(assetId);
      if (result) setState(result);
    });
  };

  return (
    <section aria-label="Reference status" className="mx-auto max-w-2xl space-y-3 rounded-md border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-700">References</h2>
        <span className="text-xs uppercase tracking-wide text-neutral-500">
          {referenced ? `${refs.total} in use` : "Unused"}
        </span>
      </div>

      <p className="text-sm text-neutral-700">{referenceSummary(refs)}</p>
      <ul className="text-xs text-neutral-500">
        <li>Articles: {refs.articles}</li>
        <li>Brand settings: {refs.brand > 0 ? "yes" : "no"}</li>
      </ul>

      {state.error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {canWrite ? (
        <>
          {referenced ? (
            <p role="note" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              This asset is in use and cannot be deleted. Remove the references first.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!canDelete || pending}
            aria-label="Delete permanently"
            className="flex min-h-11 items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete permanently
          </button>

          {confirming ? (
            <div role="alertdialog" aria-label="Permanently delete media" className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3">
              <p className="text-sm text-amber-900">
                This permanently deletes the media reference and cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button" onClick={execute} disabled={pending}
                  className="flex min-h-11 items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700"
                >
                  {pending ? "Working…" : "Permanently delete"}
                </button>
                <button
                  type="button" onClick={() => setConfirming(false)} disabled={pending}
                  className="flex min-h-11 items-center rounded-md border bg-white px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
