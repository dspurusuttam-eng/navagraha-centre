"use client";

// Claude Admin Console C4B2 — editor lifecycle controls (client).
// Renders Publish / Republish / Unpublish / Archive / Restore / Delete, disabling actions
// invalid for the current status or role, confirming destructive ones, flushing pending
// autosave before a transition, surfacing INCOMPLETE_DRAFT issues, and redirecting away
// after a permanent delete (handled by the server action).
import { useState, useTransition } from "react";
import {
  resolveLifecycleActions,
  canManageLifecycle,
  type LifecycleActionKey,
  type ResolvedLifecycleAction,
} from "@/modules/admin/desk/lifecycle-controls";
import type { ArticleFormState } from "@/modules/admin/desk/article-actions";
import type { ArticleTransitionAction } from "@/modules/admin/domain";

type Props = {
  articleId: string;
  status: string;
  roleKeys: readonly string[];
  transition: (id: string, action: ArticleTransitionAction) => Promise<ArticleFormState>;
  remove: (id: string) => Promise<ArticleFormState>;
  flush?: () => Promise<boolean>;
};

const intentClass: Record<ResolvedLifecycleAction["intent"], string> = {
  primary: "bg-neutral-900 text-white",
  neutral: "border bg-white text-neutral-800",
  danger: "border border-red-300 bg-white text-red-700",
};

export function ArticleLifecycleControls({ articleId, status, roleKeys, transition, remove, flush }: Readonly<Props>) {
  const roles = roleKeys.map((key) => ({ key }));
  const canWrite = canManageLifecycle(roles);
  const actions = resolveLifecycleActions(status, roles);
  const [confirmingKey, setConfirmingKey] = useState<LifecycleActionKey | null>(null);
  const [state, setState] = useState<ArticleFormState>({ error: null });
  const [pending, startTransition] = useTransition();

  const confirmingSpec = actions.find((a) => a.key === confirmingKey) ?? null;

  const execute = (spec: ResolvedLifecycleAction) => {
    setConfirmingKey(null);
    setState({ error: null });
    startTransition(async () => {
      // Persist any pending edit before a transition so it never acts on stale content.
      if (spec.kind === "transition" && flush) {
        await flush();
      }
      const result =
        spec.kind === "delete" ? await remove(articleId) : await transition(articleId, spec.key as ArticleTransitionAction);
      // On a successful delete the server redirects and nothing returns here.
      if (result) setState(result);
    });
  };

  const onActivate = (spec: ResolvedLifecycleAction) => {
    if (!spec.available || pending) return;
    if (spec.requiresConfirm) {
      setConfirmingKey(spec.key);
      return;
    }
    execute(spec);
  };

  if (!canWrite) {
    return (
      <section aria-label="Article lifecycle" className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
        You have read-only access to this article.
      </section>
    );
  }

  const fieldIssues = state.fieldErrors ? Object.entries(state.fieldErrors) : [];

  return (
    <section aria-label="Article lifecycle" className="space-y-3 rounded-md border border-neutral-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-700">Lifecycle</h2>
        <span className="text-xs uppercase tracking-wide text-neutral-500">{status}</span>
      </div>

      {state.error ? (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{state.error}</p>
          {fieldIssues.length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {fieldIssues.map(([field, message]) => (
                <li key={field}>
                  <span className="font-medium capitalize">{field}</span>: {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Lifecycle updated.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {actions.map((spec) => (
          <button
            key={spec.key}
            type="button"
            onClick={() => onActivate(spec)}
            disabled={!spec.available || pending}
            aria-label={spec.label}
            className={`flex min-h-11 items-center rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${intentClass[spec.intent]}`}
          >
            {spec.label}
          </button>
        ))}
      </div>

      {confirmingSpec ? (
        <div role="alertdialog" aria-label={confirmingSpec.confirmLabel ?? confirmingSpec.label} className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">{confirmingSpec.confirmMessage ?? "Are you sure?"}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => execute(confirmingSpec)}
              disabled={pending}
              className={`flex min-h-11 items-center rounded-md px-4 py-2 text-sm font-medium ${intentClass[confirmingSpec.intent]}`}
            >
              {pending ? "Working…" : (confirmingSpec.confirmLabel ?? "Confirm")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingKey(null)}
              disabled={pending}
              className="flex min-h-11 items-center rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
