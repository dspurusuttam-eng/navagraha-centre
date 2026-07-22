// Claude Admin Console C4B2 — pure policy for the editor lifecycle controls.
// Decides which of Publish / Republish / Unpublish / Archive / Restore / Delete are
// available for a given article status + admin role, and how each should be presented
// (intent, confirmation). Framework-agnostic and deterministic → fully testable.
import {
  ARTICLE_TRANSITION_ACTIONS,
  ADMIN_ARTICLE_STATES,
  type ArticleTransitionAction,
} from "@/modules/admin/domain";
import { hasAdminAccess, type AdminRoleSummary } from "@/modules/admin/permissions";

export type LifecycleActionKey = ArticleTransitionAction | "DELETE";
export type LifecycleIntent = "primary" | "neutral" | "danger";

export type LifecycleActionSpec = {
  key: LifecycleActionKey;
  label: string;
  kind: "transition" | "delete";
  intent: LifecycleIntent;
  requiresConfirm: boolean;
  confirmLabel?: string;
  confirmMessage?: string;
};

export const LIFECYCLE_ACTIONS: readonly LifecycleActionSpec[] = [
  // Publishing is the one action here that makes something visible to the
  // public, and on a phone it sat one stray tap away from doing so: the Founder
  // certification found Publish firing immediately while Delete -- which only
  // affects private state -- correctly asked first. Going public deserves at
  // least the same deliberation as taking something down.
  {
    key: "PUBLISH",
    label: "Publish",
    kind: "transition",
    intent: "primary",
    requiresConfirm: true,
    confirmLabel: "Publish now",
    confirmMessage:
      "This makes the article public immediately — on the Desk, the home rail, Search and the sitemap.",
  },
  {
    key: "REPUBLISH",
    label: "Republish",
    kind: "transition",
    intent: "primary",
    requiresConfirm: true,
    confirmLabel: "Republish now",
    confirmMessage:
      "This makes the article public again immediately — on the Desk, the home rail, Search and the sitemap.",
  },
  { key: "UNPUBLISH", label: "Unpublish", kind: "transition", intent: "neutral", requiresConfirm: false },
  {
    key: "ARCHIVE",
    label: "Archive",
    kind: "transition",
    intent: "neutral",
    requiresConfirm: true,
    confirmLabel: "Archive this article",
    confirmMessage: "Archiving removes it from active editorial lists. You can restore it later.",
  },
  { key: "RESTORE", label: "Restore", kind: "transition", intent: "neutral", requiresConfirm: false },
  {
    key: "DELETE",
    label: "Delete permanently",
    kind: "delete",
    intent: "danger",
    requiresConfirm: true,
    confirmLabel: "Permanently delete",
    confirmMessage: "This permanently deletes the article and cannot be undone.",
  },
];

/** Roles allowed to run lifecycle transitions/deletes (mirrors the article service). */
export const LIFECYCLE_WRITE_ROLES = ["founder", "editor"] as const;

export function canManageLifecycle(adminRoles: readonly Pick<AdminRoleSummary, "key">[]): boolean {
  return hasAdminAccess(adminRoles, LIFECYCLE_WRITE_ROLES);
}

export type ResolvedLifecycleAction = LifecycleActionSpec & { available: boolean };

/**
 * Every lifecycle action with an `available` flag for the given status + roles.
 * - A non-writer (e.g. support) gets everything disabled.
 * - A transition is available only when the current status is one of its valid `from`
 *   states (reusing the domain state machine).
 * - Delete is available in any known state (the service still requires confirmation).
 * - An unknown/legacy status disables every action (safe default).
 */
export function resolveLifecycleActions(
  status: string,
  adminRoles: readonly Pick<AdminRoleSummary, "key">[],
): ResolvedLifecycleAction[] {
  const canWrite = canManageLifecycle(adminRoles);
  const knownState = (ADMIN_ARTICLE_STATES as readonly string[]).includes(status);
  return LIFECYCLE_ACTIONS.map((spec) => {
    let available = canWrite && knownState;
    if (available && spec.kind === "transition") {
      const transition = ARTICLE_TRANSITION_ACTIONS[spec.key as ArticleTransitionAction];
      available = (transition.from as readonly string[]).includes(status);
    }
    return { ...spec, available };
  });
}

/** Just the currently-actionable lifecycle actions (available === true). */
export function availableLifecycleActions(
  status: string,
  adminRoles: readonly Pick<AdminRoleSummary, "key">[],
): ResolvedLifecycleAction[] {
  return resolveLifecycleActions(status, adminRoles).filter((action) => action.available);
}
