// Claude Admin Console C2A — Article service operations (pure; DI: repo + audit + clock).
// Enforces role capability, C1A validation + lifecycle, slug uniqueness, and delete
// confirmation. Every mutation is audited through the injected writer. No DB, no route.
import {
  createArticleSchema,
  updateArticleSchema,
  draftAutosaveSchema,
  publishableIssues,
  estimateReadingTimeMinutes,
  resolveTransition,
  transitionTimestampField,
  ADMIN_ARTICLE_STATES,
  type AdminArticleState,
  type ArticleTransitionAction,
} from "@/modules/admin/domain";
import { hasAdminAccess } from "@/modules/admin/permissions";
import { inspectDeskBody, joinBodyAndSidecar } from "@/modules/desk-sidecar/sidecar";
import type { AuditEntryInput, AuditWriteResult } from "@/modules/admin/audit-core";
import type { ArticleActor, ArticleListFilters, ArticleListResult, ArticleRecord, ServiceResult } from "@/modules/admin/articles/types";
import type { ArticleRepository } from "@/modules/admin/articles/repository";

export type ArticleServiceDeps = {
  repo: ArticleRepository;
  audit: (input: AuditEntryInput) => Promise<AuditWriteResult>;
  now: () => Date;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// --- C8B3: service-level structured-sidecar protection -----------------------
// Some Articles carry a structured sidecar in `body` (Daily Rashifal payload / FAQ items /
// original display category) that no column exists for. This service is the ONE place every
// body write passes through — the Desk editor action, autosave, and the direct
// `PATCH /api/admin/articles/[id]` route alike — so the guarantee is enforced here rather
// than in any single caller:
//
//   * an ordinary write may change the VISIBLE body only; the stored sidecar is reattached
//     verbatim, so it cannot be replaced, removed or duplicated no matter what is submitted;
//   * only a trusted writer (the legacy import) may create or rewrite a sidecar;
//   * a stored sidecar that cannot be read blocks the body write entirely, so damaged
//     structured content is never silently overwritten.
export type ArticleWriteOptions = {
  /** Legacy-import only: permits writing a body that contains a sidecar verbatim. */
  trustedSidecarWriter?: boolean;
};

/** Controlled, non-leaking message for a stored sidecar that cannot be parsed. */
export const SIDECAR_MALFORMED_ERROR =
  "This article's structured content is stored in a damaged state. The body cannot be updated until it is repaired.";

/**
 * Resolve the body an ordinary (untrusted) write may store: the submitted VISIBLE body plus
 * the stored sidecar reattached verbatim. Any sidecar in the submitted body is discarded —
 * that is what makes replace/remove/duplicate impossible through this path.
 */
function resolveGuardedBody(submitted: string, storedBody: string | null | undefined): string {
  const stored = inspectDeskBody(storedBody);
  const incoming = inspectDeskBody(submitted);
  return joinBodyAndSidecar(incoming.visibleBody, stored.sidecar);
}

function canWriteArticles(actor: ArticleActor): boolean {
  return hasAdminAccess(actor.roleKeys.map((key) => ({ key })), ["founder", "editor"]);
}

function toAdminState(status: string): AdminArticleState | null {
  return (ADMIN_ARTICLE_STATES as readonly string[]).includes(status) ? (status as AdminArticleState) : null;
}

function err<T>(status: number, code: string, message: string, issues?: unknown): ServiceResult<T> {
  return { ok: false, status, code, message, ...(issues === undefined ? {} : { issues }) };
}

function clampPage(value: number | null | undefined, fallback: number, min: number, max: number): number {
  const n = Math.trunc(Number(value ?? fallback));
  if (!Number.isFinite(n) || n < min) return min;
  return Math.min(n, max);
}

// --- Read operations (any admin) -------------------------------------------
export async function listArticles(deps: ArticleServiceDeps, filters: ArticleListFilters): Promise<ServiceResult<ArticleListResult>> {
  const page = clampPage(filters.page, 1, 1, 1_000_000);
  const pageSize = clampPage(filters.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const status = filters.status && (ADMIN_ARTICLE_STATES as readonly string[]).includes(filters.status) ? filters.status : undefined;
  const search = filters.search?.trim() ? filters.search.trim().slice(0, 200) : undefined;
  const language = filters.language?.trim() ? filters.language.trim().slice(0, 8) : undefined;
  const { items, total } = await deps.repo.list({ status, language, search, skip: (page - 1) * pageSize, take: pageSize });
  return { ok: true, status: 200, data: { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getArticle(deps: ArticleServiceDeps, id: string): Promise<ServiceResult<ArticleRecord>> {
  const record = await deps.repo.findById(id);
  if (!record) return err(404, "NOT_FOUND", "Article not found.");
  return { ok: true, status: 200, data: record };
}

export async function getRecentArticles(deps: ArticleServiceDeps, limit: number): Promise<ServiceResult<ArticleRecord[]>> {
  const n = Math.min(Math.max(1, Math.trunc(Number(limit) || 5)), 20);
  const items = await deps.repo.listRecentByUpdated(n);
  return { ok: true, status: 200, data: items };
}

// --- Write operations (founder/editor) -------------------------------------
export async function createArticle(deps: ArticleServiceDeps, actor: ArticleActor, input: unknown, options?: ArticleWriteOptions): Promise<ServiceResult<ArticleRecord>> {
  if (!canWriteArticles(actor)) return err(403, "FORBIDDEN", "You do not have write access to articles.");
  const parsed = createArticleSchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid article payload.", parsed.error.issues);
  const data = parsed.data;

  const existing = await deps.repo.findBySlug(data.slug);
  if (existing) return err(409, "SLUG_TAKEN", "An article with this slug already exists.");

  // C8B3 — only the trusted legacy import may create an Article whose body carries a
  // sidecar; an ordinary create stores the visible body only.
  const createdBody =
    data.body === undefined || data.body === null
      ? null
      : options?.trustedSidecarWriter
        ? data.body
        : inspectDeskBody(data.body).visibleBody;
  const readingTimeMinutes = data.readingTimeMinutes ?? estimateReadingTimeMinutes(inspectDeskBody(createdBody).visibleBody);
  const created = await deps.repo.create({
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt ?? data.summary ?? data.title,
    summary: data.summary ?? null,
    body: createdBody,
    language: data.language,
    category: data.category ?? null,
    coverImageAssetId: data.coverImageAssetId ?? null,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    readingTimeMinutes: readingTimeMinutes ?? null,
    isFeatured: data.isFeatured,
    displayOrder: data.displayOrder,
    status: "DRAFT",
    authorId: actor.userId,
  });
  await deps.audit({ actorUserId: actor.userId, actorRoleKey: actor.primaryRoleKey, entityType: "article", entityId: created.id, action: "article.create", summary: `Created article ${created.slug}`, metadata: { slug: created.slug, language: created.language } });
  return { ok: true, status: 201, data: created };
}

export async function updateArticle(deps: ArticleServiceDeps, actor: ArticleActor, id: string, input: unknown, options?: ArticleWriteOptions): Promise<ServiceResult<ArticleRecord>> {
  if (!canWriteArticles(actor)) return err(403, "FORBIDDEN", "You do not have write access to articles.");
  const current = await deps.repo.findById(id);
  if (!current) return err(404, "NOT_FOUND", "Article not found.");
  // C4B1A: DRAFTs use the relaxed autosave validator (incomplete edits allowed); any
  // already-live state (PUBLISHED/UNPUBLISHED/ARCHIVED) keeps the strict validator so a
  // published article can never be blanked below its completeness floor.
  const isDraft = current.status === "DRAFT";
  const parsed = (isDraft ? draftAutosaveSchema : updateArticleSchema).safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid article payload.", parsed.error.issues);
  const data = parsed.data;

  if (data.slug && data.slug !== current.slug) {
    const clash = await deps.repo.findBySlug(data.slug);
    if (clash && clash.id !== id) return err(409, "SLUG_TAKEN", "An article with this slug already exists.");
  }

  // C8B3 — sidecar protection on the single shared body-write path.
  let resolvedBody: string | null | undefined;
  if (data.body !== undefined) {
    const stored = inspectDeskBody(current.body);
    if (stored.state === "malformed") {
      // Retain the stored data untouched rather than overwrite unreadable structured content.
      return err(409, "SIDECAR_MALFORMED", SIDECAR_MALFORMED_ERROR);
    }
    resolvedBody = options?.trustedSidecarWriter
      ? (data.body ?? null)
      : resolveGuardedBody(String(data.body ?? ""), current.body);
  }

  // Reading time is estimated from the human-readable body only, so a sidecar never inflates it.
  const nextBody = resolvedBody !== undefined ? resolvedBody : current.body;
  const readingTimeMinutes =
    data.readingTimeMinutes !== undefined
      ? data.readingTimeMinutes
      : estimateReadingTimeMinutes(inspectDeskBody(nextBody).visibleBody);
  const updated = await deps.repo.update(id, {
    ...(data.slug !== undefined ? { slug: data.slug } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.summary !== undefined ? { summary: data.summary ?? null } : {}),
    ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
    ...(resolvedBody !== undefined ? { body: resolvedBody } : {}),
    ...(data.language !== undefined ? { language: data.language } : {}),
    ...(data.category !== undefined ? { category: data.category ?? null } : {}),
    ...(data.coverImageAssetId !== undefined ? { coverImageAssetId: data.coverImageAssetId ?? null } : {}),
    ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle ?? null } : {}),
    ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription ?? null } : {}),
    ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
    ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
    readingTimeMinutes: readingTimeMinutes ?? null,
  });
  await deps.audit({ actorUserId: actor.userId, actorRoleKey: actor.primaryRoleKey, entityType: "article", entityId: id, action: "article.update", summary: `Updated article ${updated.slug}`, metadata: { slug: updated.slug } });
  return { ok: true, status: 200, data: updated };
}

export async function transitionArticle(deps: ArticleServiceDeps, actor: ArticleActor, id: string, action: ArticleTransitionAction): Promise<ServiceResult<ArticleRecord>> {
  if (!canWriteArticles(actor)) return err(403, "FORBIDDEN", "You do not have write access to articles.");
  const current = await deps.repo.findById(id);
  if (!current) return err(404, "NOT_FOUND", "Article not found.");
  const state = toAdminState(current.status);
  if (!state) return err(409, "UNSUPPORTED_STATE", `Article is in a legacy state (${current.status}) that this console cannot transition.`);
  const resolved = resolveTransition(action, state);
  if (!resolved.ok) return err(409, "ILLEGAL_TRANSITION", resolved.reason);

  // C4B1A: strict completeness gate — an incomplete (relaxed) draft can never go live.
  if (resolved.to === "PUBLISHED") {
    const issues = publishableIssues(current);
    if (issues.length > 0) {
      return err(422, "INCOMPLETE_DRAFT", "This draft is missing required fields and cannot be published.", issues);
    }
  }

  const stampField = transitionTimestampField(resolved.to);
  const updated = await deps.repo.update(id, {
    status: resolved.to,
    ...(stampField ? { [stampField]: deps.now() } : {}),
  });
  await deps.audit({ actorUserId: actor.userId, actorRoleKey: actor.primaryRoleKey, entityType: "article", entityId: id, action: `article.${action.toLowerCase()}`, summary: `Article ${updated.slug} → ${resolved.to}`, metadata: { from: state, to: resolved.to } });
  return { ok: true, status: 200, data: updated };
}

export async function deleteArticle(deps: ArticleServiceDeps, actor: ArticleActor, id: string, confirmed: boolean): Promise<ServiceResult<{ id: string }>> {
  if (!canWriteArticles(actor)) return err(403, "FORBIDDEN", "You do not have write access to articles.");
  if (!confirmed) return err(400, "CONFIRMATION_REQUIRED", "Permanent deletion requires explicit confirmation.");
  const current = await deps.repo.findById(id);
  if (!current) return err(404, "NOT_FOUND", "Article not found.");
  await deps.repo.remove(id);
  await deps.audit({ actorUserId: actor.userId, actorRoleKey: actor.primaryRoleKey, entityType: "article", entityId: id, action: "article.delete", summary: `Deleted article ${current.slug}`, metadata: { slug: current.slug, status: current.status } });
  return { ok: true, status: 200, data: { id } };
}
