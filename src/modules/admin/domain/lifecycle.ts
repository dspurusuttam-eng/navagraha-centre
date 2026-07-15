// Claude Admin Console C1A — Article lifecycle state machine (pure).
// Contract (Task 6): DRAFT → PUBLISHED → UNPUBLISHED → ARCHIVED, plus the sensible
// reverse transitions REPUBLISH (UNPUBLISHED→PUBLISHED) and RESTORE (ARCHIVED→DRAFT).
import type { AdminArticleState } from "@/modules/admin/domain/types";

/** Allowed direct state → state transitions. */
export const ARTICLE_LIFECYCLE_TRANSITIONS: Readonly<Record<AdminArticleState, readonly AdminArticleState[]>> = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["UNPUBLISHED", "ARCHIVED"],
  UNPUBLISHED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export type ArticleTransitionAction = "PUBLISH" | "UNPUBLISH" | "REPUBLISH" | "ARCHIVE" | "RESTORE";

/** Named transition actions with their legal source states and resulting state. */
export const ARTICLE_TRANSITION_ACTIONS: Readonly<
  Record<ArticleTransitionAction, { from: readonly AdminArticleState[]; to: AdminArticleState }>
> = {
  PUBLISH: { from: ["DRAFT"], to: "PUBLISHED" },
  UNPUBLISH: { from: ["PUBLISHED"], to: "UNPUBLISHED" },
  REPUBLISH: { from: ["UNPUBLISHED"], to: "PUBLISHED" },
  ARCHIVE: { from: ["DRAFT", "PUBLISHED", "UNPUBLISHED"], to: "ARCHIVED" },
  RESTORE: { from: ["ARCHIVED"], to: "DRAFT" },
};

/** Whether a direct state → state transition is permitted. */
export function canTransition(from: AdminArticleState, to: AdminArticleState): boolean {
  return ARTICLE_LIFECYCLE_TRANSITIONS[from].includes(to);
}

export type TransitionResolution =
  | { ok: true; to: AdminArticleState }
  | { ok: false; reason: string };

/** Resolve a named action against the current state (deterministic; no side effects). */
export function resolveTransition(action: ArticleTransitionAction, from: AdminArticleState): TransitionResolution {
  const def = ARTICLE_TRANSITION_ACTIONS[action];
  if (!def.from.includes(from)) {
    return { ok: false, reason: `Cannot ${action} an article in state ${from}.` };
  }
  return { ok: true, to: def.to };
}

/** Which lifecycle timestamp column a transition target stamps (null for DRAFT restore). */
export function transitionTimestampField(
  to: AdminArticleState,
): "publishedAt" | "unpublishedAt" | "archivedAt" | null {
  switch (to) {
    case "PUBLISHED":
      return "publishedAt";
    case "UNPUBLISHED":
      return "unpublishedAt";
    case "ARCHIVED":
      return "archivedAt";
    default:
      return null;
  }
}

/** Only PUBLISHED articles are eligible for the public Desk (public-integration, C3). */
export function isPubliclyVisibleState(state: AdminArticleState): boolean {
  return state === "PUBLISHED";
}
