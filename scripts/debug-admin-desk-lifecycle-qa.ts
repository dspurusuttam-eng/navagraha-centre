/**
 * Claude Admin Console C4B2 — Article lifecycle controls QA.
 * Pure policy (which actions are enabled per status + role), confirmation metadata, the
 * autosave flush command, and static wiring checks — plus service-level authorization,
 * stale-state, publish-gate and delete-confirmation over an in-memory repository.
 */
import { readFileSync } from "node:fs";
import {
  resolveLifecycleActions,
  availableLifecycleActions,
  canManageLifecycle,
  LIFECYCLE_ACTIONS,
} from "@/modules/admin/desk/lifecycle-controls";
import { createAutosaveController } from "@/modules/admin/desk/autosave-core";
import {
  createArticle,
  updateArticle,
  transitionArticle,
  deleteArticle,
  getArticle,
  type ArticleServiceDeps,
} from "@/modules/admin/articles/service-core";
import type { ArticleRecord, ArticleActor } from "@/modules/admin/articles/types";
import type { ArticleRepository } from "@/modules/admin/articles/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");
const keysAvailable = (status: string, roles: { key: string }[]) =>
  availableLifecycleActions(status, roles).map((a) => a.key).sort();

const FOUNDER = [{ key: "founder" }];
const EDITOR = [{ key: "editor" }];
const SUPPORT = [{ key: "support" }];

// --- in-memory service harness ---------------------------------------------
function makeRepo(): ArticleRepository & { rows: ArticleRecord[] } {
  const rows: ArticleRecord[] = [];
  let seq = 0;
  const clone = (r: ArticleRecord): ArticleRecord => ({ ...r });
  return {
    rows,
    async list(f) { return { items: rows.slice(f.skip, f.skip + f.take).map(clone), total: rows.length }; },
    async findById(id) { const r = rows.find((x) => x.id === id); return r ? clone(r) : null; },
    async findBySlug(slug) { const r = rows.find((x) => x.slug === slug); return r ? clone(r) : null; },
    async create(data) {
      seq += 1;
      const at = new Date(Date.UTC(2025, 0, 1, 0, 0, seq));
      const rec: ArticleRecord = { id: `a${seq}`, publishedAt: null, unpublishedAt: null, archivedAt: null, createdAt: at, updatedAt: at, ...data };
      rows.push(rec);
      return clone(rec);
    },
    async update(id, data) {
      const r = rows.find((x) => x.id === id);
      if (!r) throw new Error("not found");
      Object.assign(r, data, { updatedAt: new Date(Date.UTC(2025, 5, 1, 12, 0, 0)) });
      return clone(r);
    },
    async remove(id) { const i = rows.findIndex((x) => x.id === id); if (i >= 0) rows.splice(i, 1); },
    async listRecentByUpdated(limit) { return [...rows].slice(0, limit).map(clone); },
  };
}
const founderActor: ArticleActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const supportActor: ArticleActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };
function makeDeps() {
  const audits: string[] = [];
  const deps: ArticleServiceDeps = {
    repo: makeRepo(),
    audit: async (input) => { audits.push(input.action); return { ok: true, id: "x" }; },
    now: () => new Date(Date.UTC(2025, 5, 1, 12, 0, 0)),
  };
  return { deps, audits };
}
const completeDraft = (over: Record<string, unknown> = {}) => ({
  title: "Sade Sati explained", slug: "sade-sati", summary: "Overview.",
  body: "word ".repeat(400), language: "en", category: "astrology", ...over,
});

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "P1 policy: available actions per status (founder)",
    run: () => {
      assert(JSON.stringify(keysAvailable("DRAFT", FOUNDER)) === JSON.stringify(["ARCHIVE", "DELETE", "PUBLISH"]), "DRAFT → publish/archive/delete");
      assert(JSON.stringify(keysAvailable("PUBLISHED", FOUNDER)) === JSON.stringify(["ARCHIVE", "DELETE", "UNPUBLISH"]), "PUBLISHED → unpublish/archive/delete");
      assert(JSON.stringify(keysAvailable("UNPUBLISHED", FOUNDER)) === JSON.stringify(["ARCHIVE", "DELETE", "REPUBLISH"]), "UNPUBLISHED → republish/archive/delete");
      assert(JSON.stringify(keysAvailable("ARCHIVED", FOUNDER)) === JSON.stringify(["DELETE", "RESTORE"]), "ARCHIVED → restore/delete only");
    },
  },
  {
    name: "P2 policy: editor == writer; support disabled; unknown status disabled",
    run: () => {
      assert(canManageLifecycle(EDITOR) && canManageLifecycle(FOUNDER), "founder/editor can manage");
      assert(!canManageLifecycle(SUPPORT), "support cannot manage");
      assert(JSON.stringify(keysAvailable("DRAFT", EDITOR)) === JSON.stringify(["ARCHIVE", "DELETE", "PUBLISH"]), "editor same as founder");
      assert(availableLifecycleActions("DRAFT", SUPPORT).length === 0, "support → nothing available");
      // support still gets the full disabled set (rendered but disabled).
      const supportResolved = resolveLifecycleActions("DRAFT", SUPPORT);
      assert(supportResolved.length === LIFECYCLE_ACTIONS.length && supportResolved.every((a) => !a.available), "support: all disabled");
      assert(availableLifecycleActions("REVIEW", FOUNDER).length === 0, "unknown/legacy status → nothing available");
    },
  },
  {
    name: "P3 policy: invalid transitions are disabled, not omitted, in the full set",
    run: () => {
      const draft = resolveLifecycleActions("DRAFT", FOUNDER);
      assert(draft.length === 6, "all six actions present");
      const byKey = Object.fromEntries(draft.map((a) => [a.key, a.available]));
      assert(byKey.PUBLISH === true && byKey.UNPUBLISH === false && byKey.REPUBLISH === false && byKey.RESTORE === false, "DRAFT enables only publish/archive/delete");
    },
  },
  {
    name: "C1 confirmation metadata: archive + delete confirm; delete is danger",
    run: () => {
      const spec = (k: string) => LIFECYCLE_ACTIONS.find((a) => a.key === k)!;
      assert(spec("ARCHIVE").requiresConfirm && spec("DELETE").requiresConfirm, "archive + delete require confirm");
      assert(!spec("PUBLISH").requiresConfirm && !spec("UNPUBLISH").requiresConfirm && !spec("REPUBLISH").requiresConfirm && !spec("RESTORE").requiresConfirm, "others do not");
      assert(spec("DELETE").kind === "delete" && spec("DELETE").intent === "danger", "delete is a danger delete");
      assert(spec("PUBLISH").intent === "primary", "publish is primary");
      assert(!!spec("DELETE").confirmMessage && !!spec("ARCHIVE").confirmMessage, "confirm messages present");
    },
  },
  {
    name: "F1 autosave flush: forces a save of pending edits, ignoring debounce; single-flight",
    run: () => {
      const c = createAutosaveController(5000);
      assert(c.flush().save === false, "clean → no flush save");
      c.notifyChange(0);
      const cmd = c.flush();
      assert(cmd.save === true && c.status() === "saving", "dirty → flush saves immediately (no debounce wait)");
      assert(c.flush().save === false, "in-flight → no duplicate flush save");
      c.onResult(cmd.save === true ? cmd.seq : -1, true);
      assert(c.status() === "saved" && c.isClean(), "flush result → clean");
    },
  },
  {
    name: "S1 service: support (read-only) cannot transition or delete → 403",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founderActor, completeDraft());
      assert(c.ok, "seed created"); if (!c.ok) return;
      const t = await transitionArticle(deps, supportActor, c.data.id, "PUBLISH");
      assert(!t.ok && t.status === 403, "support publish → 403");
      const d = await deleteArticle(deps, supportActor, c.data.id, true);
      assert(!d.ok && d.status === 403, "support delete → 403");
    },
  },
  {
    name: "S2 service: stale-state transition rejected (409); publish-gate blocks incomplete (422)",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createArticle(deps, founderActor, completeDraft());
      assert(c.ok, "seed created"); if (!c.ok) return;
      // Illegal from-state: unpublish a DRAFT.
      const stale = await transitionArticle(deps, founderActor, c.data.id, "UNPUBLISH");
      assert(!stale.ok && stale.status === 409, "unpublish DRAFT → 409 illegal transition");
      // Publish-gate: empty body cannot publish.
      await updateArticle(deps, founderActor, c.data.id, { body: "" });
      const blocked = await transitionArticle(deps, founderActor, c.data.id, "PUBLISH");
      assert(!blocked.ok && blocked.status === 422 && blocked.code === "INCOMPLETE_DRAFT", "incomplete → 422 INCOMPLETE_DRAFT");
    },
  },
  {
    name: "S3 service: full happy path + delete requires confirmation + audit preserved",
    run: async () => {
      const { deps, audits } = makeDeps();
      const c = await createArticle(deps, founderActor, completeDraft());
      assert(c.ok, "seed created"); if (!c.ok) return;
      const id = c.data.id;
      assert((await transitionArticle(deps, founderActor, id, "PUBLISH")).ok, "publish");
      assert((await transitionArticle(deps, founderActor, id, "UNPUBLISH")).ok, "unpublish");
      assert((await transitionArticle(deps, founderActor, id, "REPUBLISH")).ok, "republish");
      assert((await transitionArticle(deps, founderActor, id, "ARCHIVE")).ok, "archive");
      assert((await transitionArticle(deps, founderActor, id, "RESTORE")).ok, "restore");
      const noConfirm = await deleteArticle(deps, founderActor, id, false);
      assert(!noConfirm.ok && noConfirm.code === "CONFIRMATION_REQUIRED", "delete without confirm → blocked");
      const del = await deleteArticle(deps, founderActor, id, true);
      assert(del.ok, "confirmed delete ok");
      const gone = await getArticle(deps, id);
      assert(!gone.ok && gone.status === 404, "article gone after delete");
      for (const a of ["article.publish", "article.unpublish", "article.republish", "article.archive", "article.restore", "article.delete"]) {
        assert(audits.includes(a), `audited: ${a}`);
      }
    },
  },
  {
    name: "U1 static: controls render all actions, disable-by-availability, confirm, flush, a11y",
    run: () => {
      const src = read("src/modules/admin/desk/article-lifecycle-controls.tsx");
      assert(src.includes("resolveLifecycleActions") && src.includes("actions.map"), "renders resolved actions");
      assert(src.includes("disabled={!spec.available || pending}"), "disables invalid actions");
      assert(src.includes('role="alertdialog"') && src.includes("Cancel"), "confirmation dialog + cancel");
      assert(src.includes("await flush()"), "flushes autosave before transition");
      assert(src.includes('role="alert"') && src.includes("fieldErrors"), "surfaces INCOMPLETE_DRAFT field issues");
      assert(src.includes("read-only access"), "support read-only message");
      assert(src.includes("min-h-11") && src.includes("aria-label"), "touch targets + labels");
    },
  },
  {
    name: "U2 static: server actions use lifecycle services, redirect-after-delete, INCOMPLETE_DRAFT map",
    run: () => {
      const src = read("src/modules/admin/desk/article-actions.ts");
      assert(src.includes("runArticleTransition") && src.includes("transitionArticle("), "transition action wraps service");
      assert(src.includes("deleteArticlePermanently") && src.includes("deleteArticle(") && src.includes("true)"), "delete action confirms via service");
      assert(src.includes('redirect("/admin/desk")'), "safe redirect after deletion");
      assert(src.includes("INCOMPLETE_DRAFT"), "INCOMPLETE_DRAFT mapped to a clear message");
      assert(src.includes('revalidatePath("/admin/desk")'), "list revalidated");
    },
  },
  {
    name: "U3 static: edit page wires lifecycle with role + status",
    run: () => {
      const src = read("src/app/(admin)/admin/desk/[id]/page.tsx");
      assert(src.includes("lifecycle={{") && src.includes("runArticleTransition") && src.includes("deleteArticlePermanently"), "passes lifecycle actions");
      assert(src.includes("roleKeys") && src.includes("adminRoles"), "passes role keys");
      assert(src.includes("status: result.data.status"), "passes current status");
    },
  },
];

async function main() {
  console.log("Admin Console C4B2 — Article lifecycle controls QA:");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      await group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin desk lifecycle QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
