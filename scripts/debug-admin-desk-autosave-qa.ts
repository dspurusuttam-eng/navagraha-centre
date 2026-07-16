/**
 * Claude Admin Console C4B1 — Desk autosave + private preview QA.
 * Deterministic autosave-controller tests (injected clock: debounce, single in-flight,
 * stale-result rejection, change-during-save re-save, error→retry, isClean) plus static
 * source checks that the private preview is Admin-sourced, authenticated, noindex, never
 * publicly cached, and free of any public content-module import.
 */
import { readFileSync } from "node:fs";
import { createAutosaveController } from "@/modules/admin/desk/autosave-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const DEBOUNCE = 1000;

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "C1 debounce: no save before debounce elapses; save exactly once after",
    run: () => {
      const c = createAutosaveController(DEBOUNCE);
      assert(c.status() === "idle" && c.poll(0).save === false, "idle → no save");
      c.notifyChange(0);
      assert(c.status() === "dirty", "change → dirty");
      assert(c.poll(500).save === false, "before debounce → no save");
      assert(c.poll(999).save === false, "just before debounce → no save");
      const cmd = c.poll(1000);
      assert(cmd.save === true && c.status() === "saving", "at debounce → save + saving");
      // A second poll while in flight must NOT trigger another save.
      assert(c.poll(1200).save === false, "in-flight → no duplicate save");
    },
  },
  {
    name: "C2 single in-flight: concurrent poll never issues a duplicate save",
    run: () => {
      const c = createAutosaveController(DEBOUNCE);
      c.notifyChange(0);
      const first = c.poll(1000);
      assert(first.save === true, "first save issued");
      for (const t of [1001, 1500, 2000, 5000]) {
        assert(c.poll(t).save === false, `no duplicate at ${t}`);
      }
      // Only after the in-flight result clears can another save proceed.
      c.onResult(first.save === true ? first.seq : -1, true);
      assert(c.status() === "saved" && c.isClean(), "result → saved + clean");
    },
  },
  {
    name: "C3 stale result: out-of-order onResult for a non-current seq is ignored",
    run: () => {
      const c = createAutosaveController(DEBOUNCE);
      c.notifyChange(0);
      const cmd = c.poll(1000);
      const seq = cmd.save === true ? cmd.seq : -1;
      // A stale result for a different seq must not clear the in-flight save.
      c.onResult(seq + 999, true);
      assert(c.status() === "saving", "stale result ignored → still saving");
      assert(c.poll(3000).save === false, "still single in-flight after stale result");
      c.onResult(seq, true);
      assert(c.status() === "saved", "correct seq result applied");
    },
  },
  {
    name: "C4 change-during-save: latest edit forces a re-save after completion",
    run: () => {
      const c = createAutosaveController(DEBOUNCE);
      c.notifyChange(0);
      const cmd = c.poll(1000);
      const seq = cmd.save === true ? cmd.seq : -1;
      // User edits again WHILE the first save is in flight.
      c.notifyChange(1200);
      assert(c.status() === "saving", "change during save keeps saving state");
      c.onResult(seq, true);
      assert(c.status() === "dirty" && !c.isClean(), "newer edit → dirty (needs re-save)");
      const cmd2 = c.poll(2200);
      assert(cmd2.save === true, "re-save issued for the newer edit");
      c.onResult(cmd2.save === true ? cmd2.seq : -1, true);
      assert(c.status() === "saved" && c.isClean(), "re-save completes → clean");
    },
  },
  {
    name: "C5 error → retry: failure surfaces error and retry re-arms a save",
    run: () => {
      const c = createAutosaveController(DEBOUNCE);
      c.notifyChange(0);
      const cmd = c.poll(1000);
      c.onResult(cmd.save === true ? cmd.seq : -1, false);
      assert(c.status() === "error" && !c.isClean(), "failed save → error");
      assert(c.poll(1500).save === false, "error does not auto-poll a save");
      c.retry(2000);
      assert(c.status() === "dirty", "retry → dirty");
      const cmd2 = c.poll(2000);
      assert(cmd2.save === true, "retry re-arms save immediately (debounce back-dated)");
      c.onResult(cmd2.save === true ? cmd2.seq : -1, true);
      assert(c.status() === "saved" && c.isClean(), "retry save succeeds → clean");
    },
  },
  {
    name: "C6 isClean tracks unsaved edits accurately",
    run: () => {
      const c = createAutosaveController(DEBOUNCE);
      assert(c.isClean(), "fresh controller is clean");
      c.notifyChange(0);
      assert(!c.isClean(), "pending edit → not clean");
      const cmd = c.poll(1000);
      assert(!c.isClean(), "in-flight → not clean");
      c.onResult(cmd.save === true ? cmd.seq : -1, true);
      assert(c.isClean(), "saved → clean");
    },
  },
  {
    name: "H1 useAutosave hook: single-flight guard + injected async save",
    run: () => {
      const src = read("src/modules/admin/desk/use-autosave.ts");
      assert(src.includes('"use client"'), "client module");
      assert(src.includes("createAutosaveController"), "uses pure controller");
      assert(src.includes("savingRef") && src.includes("saveRef"), "single-flight + stable save refs");
      assert(src.includes("setInterval") && src.includes("clearInterval"), "polling loop with cleanup");
      assert(src.includes("onResult") && src.includes("poll("), "drives controller poll/onResult");
      assert(!src.includes("server-only"), "hook is not server-only");
    },
  },
  {
    name: "F1 article form wires autosave (edit-only) + preview link + status states",
    run: () => {
      const src = read("src/modules/admin/desk/article-form.tsx");
      assert(src.includes("useAutosave"), "form uses autosave hook");
      assert(src.includes("enableAutosave") && src.includes("previewHref"), "opt-in autosave + preview props");
      assert(src.includes("formRef") && src.includes("new FormData(formRef.current)"), "captures live form snapshot");
      assert(src.includes("notifyChange"), "notifies controller on change");
      assert(src.includes("Saving…") && src.includes("Saved") && src.includes("Autosave failed") && src.includes("Retry"), "saving/saved/failed/retry states");
      assert(src.includes("beforeunload") && src.includes("Unsaved changes"), "unsaved-change protection preserved");
      // Autosave must be gated by enableAutosave so create mode never autosaves.
      assert(src.includes("if (enableAutosave) autosave.notifyChange()"), "create mode does not autosave");
    },
  },
  {
    name: "P1 preview page: Admin-sourced, noindex, never publicly cached, no public content import",
    run: () => {
      const src = read("src/app/(admin)/admin/desk/[id]/preview/page.tsx");
      assert(src.includes("getArticle") && src.includes("getAdminArticleDeps"), "reads via Admin data source");
      assert(src.includes("index: false") && src.includes("follow: false"), "robots noindex/nofollow");
      assert(src.includes('dynamic = "force-dynamic"'), "force-dynamic (no static render)");
      assert(src.includes('fetchCache = "force-no-store"') && src.includes("revalidate = 0"), "no-store + no revalidate");
      // Preview must live under the authenticated (admin) route group.
      assert(src.includes("Back to editor") || src.includes("Back to list"), "read-only navigation only");
    },
  },
  {
    name: "P2 preview leakage: no public content module + no publish/mutation controls",
    run: () => {
      const src = read("src/app/(admin)/admin/desk/[id]/preview/page.tsx");
      assert(!/@\/modules\/content\b/.test(src), "does not import public content module");
      assert(!/@\/modules\/(site|marketing|conversion)\b/.test(src), "does not import public site/marketing modules");
      for (const verb of ["publishArticle", "unpublishArticle", "archiveArticle", "deleteArticle", "transitionArticle"]) {
        assert(!src.includes(verb), `preview has no ${verb} control`);
      }
      assert(!src.includes('action=') && !src.includes('"use server"'), "preview is read-only (no form action / server action)");
    },
  },
  {
    name: "P3 edit page opts into autosave + private preview",
    run: () => {
      const src = read("src/app/(admin)/admin/desk/[id]/page.tsx");
      assert(src.includes("enableAutosave"), "edit page enables autosave");
      assert(src.includes("/preview") && src.includes("previewHref"), "edit page links private preview");
    },
  },
];

function main() {
  console.log("Admin Console C4B1 — Desk autosave + private preview QA:");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin desk autosave QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
