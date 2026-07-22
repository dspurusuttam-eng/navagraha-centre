"use client";

// Claude Admin Console C4A/C4B1 — reusable Desk article create/edit form (client).
// Save Draft + debounced autosave (edit mode) + private preview link. Tracks unsaved
// changes, surfaces validation + controlled errors, and derives a slug from the title.
import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  ARTICLE_CATEGORY_OPTIONS,
  ARTICLE_LANGUAGE_OPTIONS,
  deriveSlugFromTitle,
  type ArticleFormValues,
} from "@/modules/admin/desk/article-form-config";
import { useAutosave } from "@/modules/admin/desk/use-autosave";
import { ArticleLifecycleControls } from "@/modules/admin/desk/article-lifecycle-controls";
import { MediaPicker } from "@/modules/admin/media/media-picker";
import type { MediaPickerOption } from "@/modules/admin/media/media-picker-core";
import type { ArticleFormState } from "@/modules/admin/desk/article-actions";
import type { ArticleTransitionAction } from "@/modules/admin/domain";

const INITIAL_STATE: ArticleFormState = { error: null };

export type ArticleLifecycleWiring = {
  articleId: string;
  status: string;
  roleKeys: readonly string[];
  transition: (id: string, action: ArticleTransitionAction) => Promise<ArticleFormState>;
  remove: (id: string) => Promise<ArticleFormState>;
};

type ArticleFormProps = {
  mode: "create" | "edit";
  action: (prev: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  initial: ArticleFormValues;
  enableAutosave?: boolean;
  previewHref?: string;
  lifecycle?: ArticleLifecycleWiring;
  /** Pickable cover images, or null when the media library could not be read (C6B). */
  mediaOptions?: readonly MediaPickerOption[] | null;
  /** Founder/editor may change the cover image; support is read-only (C6B). */
  canWrite?: boolean;
  /**
   * C8B2 — set when this article's protected structured content is stored damaged. The
   * editor is put into a read-only, save-blocked state rather than risk overwriting it.
   * Carries a human message only; the raw sidecar is never sent to the client.
   */
  sidecarWarning?: string | null;
};

function fieldError(state: ArticleFormState, field: string): string | undefined {
  return state.fieldErrors?.[field];
}

export function ArticleForm({
  mode,
  action,
  initial,
  enableAutosave = false,
  previewHref,
  lifecycle,
  mediaOptions = null,
  canWrite = true,
  sidecarWarning = null,
}: Readonly<ArticleFormProps>) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    // Never autosave over damaged structured content.
    if (sidecarWarning) return false;
    if (!enableAutosave || !formRef.current) return false;
    const result = await action({ error: null }, new FormData(formRef.current));
    return result.ok === true;
  }, [action, enableAutosave, sidecarWarning]);

  const autosave = useAutosave(saveDraft);

  const unsaved = enableAutosave
    ? autosave.status === "dirty" || autosave.status === "saving" || autosave.status === "error"
    : dirty;

  useEffect(() => {
    if (!unsaved || pending) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsaved, pending]);

  const onFormChange = () => {
    setDirty(true);
    if (enableAutosave && !sidecarWarning) autosave.notifyChange();
  };

  const err = (field: string) => fieldError(state, field);
  const describedBy = (field: string) => (err(field) ? `${field}-error` : undefined);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
    <form ref={formRef} action={formAction} onChange={onFormChange} className="space-y-5" noValidate>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "New article" : "Edit article"}
        </h1>
        <span aria-live="polite" className="text-xs text-neutral-600">
          {enableAutosave
            ? autosave.status === "saving"
              ? "Saving…"
              : autosave.status === "saved"
                ? "Saved"
                : autosave.status === "error"
                  ? (
                      <>
                        <span className="text-red-600">Autosave failed.</span>{" "}
                        <button type="button" onClick={autosave.retry} className="underline">Retry</button>
                      </>
                    )
                  : autosave.status === "dirty"
                    ? "Unsaved changes"
                    : ""
            : dirty
              ? <span className="text-amber-600">Unsaved changes</span>
              : ""}
        </span>
      </div>

      {sidecarWarning ? (
        <p role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {sidecarWarning}
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Draft saved.
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input
          id="title" name="title" type="text" required value={title}
          onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(deriveSlugFromTitle(e.target.value)); }}
          aria-invalid={err("title") ? true : undefined} aria-describedby={describedBy("title")}
          className="w-full rounded-md border px-3 py-2"
        />
        {err("title") ? <p id="title-error" className="text-sm text-red-600">{err("title")}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="slug" className="block text-sm font-medium">Slug</label>
        <div className="flex gap-2">
          <input
            id="slug" name="slug" type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
            aria-invalid={err("slug") ? true : undefined} aria-describedby={describedBy("slug")}
            className="w-full rounded-md border px-3 py-2"
          />
          <button type="button" onClick={() => setSlug(deriveSlugFromTitle(title))} className="shrink-0 rounded-md border px-3 text-sm">
            From title
          </button>
        </div>
        {err("slug") ? <p id="slug-error" className="text-sm text-red-600">{err("slug")}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="summary" className="block text-sm font-medium">Summary</label>
        <textarea id="summary" name="summary" rows={2} defaultValue={initial.summary} className="w-full rounded-md border px-3 py-2" />
      </div>

      <div className="space-y-1">
        <label htmlFor="body" className="block text-sm font-medium">Body</label>
        <textarea id="body" name="body" rows={8} defaultValue={initial.body} className="w-full rounded-md border px-3 py-2" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="language" className="block text-sm font-medium">Language</label>
          <select id="language" name="language" defaultValue={initial.language} className="w-full rounded-md border px-3 py-2">
            {ARTICLE_LANGUAGE_OPTIONS.map((code) => (<option key={code} value={code}>{code}</option>))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="category" className="block text-sm font-medium">Category</label>
          <select id="category" name="category" defaultValue={initial.category} className="w-full rounded-md border px-3 py-2">
            <option value="">— None —</option>
            {ARTICLE_CATEGORY_OPTIONS.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>
      </div>

      <MediaPicker
        name="coverImageAssetId"
        label="Cover image"
        initialAssetId={initial.coverImageAssetId}
        options={mediaOptions}
        canWrite={canWrite}
        error={err("coverImageAssetId")}
        onChange={onFormChange}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={initial.isFeatured === "on"} /> Featured
        </label>
        <div className="space-y-1">
          <label htmlFor="displayOrder" className="block text-sm font-medium">Display order</label>
          <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={initial.displayOrder} className="w-full rounded-md border px-3 py-2" />
        </div>
        <div className="space-y-1">
          <label htmlFor="readingTimeMinutes" className="block text-sm font-medium">Reading time (min)</label>
          <input id="readingTimeMinutes" name="readingTimeMinutes" type="number" min={1} defaultValue={initial.readingTimeMinutes} className="w-full rounded-md border px-3 py-2" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="seoTitle" className="block text-sm font-medium">SEO title</label>
        <input id="seoTitle" name="seoTitle" type="text" defaultValue={initial.seoTitle} className="w-full rounded-md border px-3 py-2" />
      </div>
      <div className="space-y-1">
        <label htmlFor="seoDescription" className="block text-sm font-medium">SEO description</label>
        <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={initial.seoDescription} className="w-full rounded-md border px-3 py-2" />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" disabled={pending || Boolean(sidecarWarning)} className="flex min-h-11 items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {/* On a live article this button saves the edit and leaves it
              published (verified on device); calling it "Save Draft" made it
              read as though it would pull the article down. */}
          {pending
            ? "Saving…"
            : lifecycle?.status?.toUpperCase() === "PUBLISHED"
              ? "Save changes"
              : "Save Draft"}
        </button>
        {previewHref ? (
          <Link href={previewHref} className="flex min-h-11 items-center rounded-md border px-4 py-2 text-sm" target="_blank" rel="noopener noreferrer">
            Preview
          </Link>
        ) : null}
        <Link href="/admin/desk" className="flex min-h-11 items-center rounded-md border px-4 py-2 text-sm">Back to list</Link>
      </div>
    </form>

    {lifecycle ? (
      <ArticleLifecycleControls
        articleId={lifecycle.articleId}
        status={lifecycle.status}
        roleKeys={lifecycle.roleKeys}
        transition={lifecycle.transition}
        remove={lifecycle.remove}
        flush={enableAutosave ? autosave.flush : undefined}
      />
    ) : null}
    </div>
  );
}
