/**
 * Claude C8B2 — structured sidecar editor-protection QA.
 *
 * Simulates the real Admin write path (load -> edit -> reattach) with the SAME functions the
 * server action uses, and asserts the sidecar is never shown, never lost and never
 * overwritten when damaged. No database, no migration, no import execution.
 */
import { readFileSync } from "node:fs";
import { curatedContentEntries } from "@/modules/content/catalog";
import {
  inspectDeskBody,
  joinBodyAndSidecar,
  encodeDeskMeta,
  stableStringify,
  type DeskMeta,
} from "@/modules/desk-sidecar/sidecar";
import { articleToFormValues } from "@/modules/admin/desk/article-form-config";
import { buildImportBody } from "@/modules/content/desk-import-core";
import { mapArticleToContentEntry, type DeskArticleSource } from "@/modules/content/desk-article-core";
import type { ArticleRecord } from "@/modules/admin/articles/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");
const eq = (a: unknown, b: unknown) => stableStringify(a) === stableStringify(b);

const RASHIFAL = curatedContentEntries.find((e) => e.slug === "daily-rashifal-26-april-2026")!;
const FAQ = curatedContentEntries.find((e) => e.slug === "guidance-and-remedies-frequently-asked-questions")!;

/** A stored Article whose body carries the sidecar, as the import would write it. */
function storedArticle(body: string, over: Partial<ArticleRecord> = {}): ArticleRecord {
  return {
    id: "a1", slug: "daily-rashifal-26-april-2026", title: "Daily Rashifal", excerpt: "e",
    summary: "s", body, language: "en", category: "astrology", coverImageAssetId: null,
    status: "PUBLISHED", seoTitle: null, seoDescription: null, readingTimeMinutes: 4,
    isFeatured: false, displayOrder: 0, publishedAt: new Date("2026-04-26"), unpublishedAt: null,
    archivedAt: null, authorId: null, createdAt: new Date("2026-04-26"), updatedAt: new Date("2026-04-26"),
    ...over,
  } as ArticleRecord;
}

function asSource(article: ArticleRecord): DeskArticleSource {
  return {
    id: article.id, slug: article.slug, title: article.title, excerpt: article.excerpt,
    summary: article.summary, body: article.body, language: article.language,
    category: article.category, status: article.status, seoTitle: article.seoTitle,
    seoDescription: article.seoDescription, readingTimeMinutes: article.readingTimeMinutes,
    isFeatured: article.isFeatured, displayOrder: article.displayOrder,
    publishedAt: article.publishedAt, updatedAt: article.updatedAt, coverImage: null, authorName: null,
  };
}

/**
 * The exact merge the server action performs: load stored body, take the editor's visible
 * body, reattach the stored sidecar. Returns null when the action would block.
 */
function simulateSave(storedBody: string, editorBody: string): string | null {
  const parts = inspectDeskBody(storedBody);
  if (parts.state === "malformed") return null; // action returns SIDECAR_MALFORMED_MESSAGE
  return joinBodyAndSidecar(editorBody, parts.sidecar);
}

const RASHIFAL_BODY = buildImportBody(RASHIFAL);
const FAQ_BODY = buildImportBody(FAQ);
const PLAIN_BODY = "## Heading\n\nSome prose.";

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "E1 editor isolation: the loaded form body contains no sidecar or raw JSON",
    run: () => {
      const values = articleToFormValues(storedArticle(RASHIFAL_BODY));
      assert(!values.body.includes("navagraha:desk-meta"), "no sidecar marker in the editor body");
      assert(!values.body.includes("zodiacSections") && !values.body.includes('"v":1'), "no raw JSON in the editor body");
      assert(!values.body.includes(RASHIFAL.dailyRashifal!.brandFooter), "no structured payload text in the editor body");
      assert(values.body === inspectDeskBody(RASHIFAL_BODY).visibleBody, "editor sees exactly the visible prose");
      assert(values.body.startsWith("## "), "prose is intact");
      // FAQ article too.
      const faqValues = articleToFormValues(storedArticle(FAQ_BODY, { slug: FAQ.slug }));
      assert(!faqValues.body.includes("faqItems") && !faqValues.body.includes(FAQ.faqItems![0]!.answer), "no FAQ JSON in the editor body");
      // A sidecar-free article is unaffected.
      assert(articleToFormValues(storedArticle(PLAIN_BODY)).body === PLAIN_BODY, "plain body passes through unchanged");
    },
  },
  {
    name: "E2 normal body edit: prose replaced, sidecar reattached byte-identically",
    run: () => {
      const stored = RASHIFAL_BODY;
      const editorBody = articleToFormValues(storedArticle(stored)).body;
      const edited = `${editorBody}\n\n## A new section\n\nAdded by the editor.`;
      const saved = simulateSave(stored, edited)!;
      const parts = inspectDeskBody(saved);
      assert(parts.state === "valid", "sidecar still valid after the edit");
      assert(parts.sidecar === inspectDeskBody(stored).sidecar, "sidecar reattached BYTE-IDENTICALLY");
      assert(parts.visibleBody === edited, "editor prose stored verbatim");
      // Fidelity intact through the public adapter.
      const entry = mapArticleToContentEntry(asSource(storedArticle(saved)));
      assert(eq(entry.dailyRashifal, RASHIFAL.dailyRashifal), "Rashifal payload still exact");
      assert(entry.category === "Daily Rashifal", "display category still exact");
      assert(entry.sections.some((s) => s.title === "A new section"), "the editor's new section renders");
    },
  },
  {
    name: "E3 body CLEARED: sidecar survives; structured content is preserved",
    run: () => {
      const saved = simulateSave(RASHIFAL_BODY, "")!;
      const parts = inspectDeskBody(saved);
      assert(parts.visibleBody === "", "visible body is empty as the editor intended");
      assert(parts.state === "valid" && parts.sidecar === inspectDeskBody(RASHIFAL_BODY).sidecar, "sidecar preserved verbatim");
      const entry = mapArticleToContentEntry(asSource(storedArticle(saved)));
      assert(entry.sections.length === 0, "no prose sections remain");
      assert(eq(entry.dailyRashifal, RASHIFAL.dailyRashifal), "Rashifal payload SURVIVES a full body clear");
      assert(entry.category === "Daily Rashifal", "display category survives a full body clear");
      // Same for FAQ.
      const faqSaved = simulateSave(FAQ_BODY, "   ")!;
      const faqEntry = mapArticleToContentEntry(asSource(storedArticle(faqSaved, { slug: FAQ.slug })));
      assert(eq(faqEntry.faqItems, FAQ.faqItems), "FAQ items survive a cleared body");
    },
  },
  {
    name: "E4 autosave + repeated saves are stable and idempotent (no drift, no duplication)",
    run: () => {
      // Autosave submits the same visible body repeatedly; the result must not drift.
      let body = RASHIFAL_BODY;
      const editorBody = articleToFormValues(storedArticle(body)).body;
      for (let i = 0; i < 5; i += 1) {
        const next = simulateSave(body, editorBody)!;
        assert(next === body, `autosave pass ${i + 1} is byte-stable (no drift)`);
        body = next;
      }
      assert((body.match(/navagraha:desk-meta/g) ?? []).length === 1, "sidecar never duplicated by repeated saves");
      // A round trip through load->save leaves the stored body identical.
      const reloaded = articleToFormValues(storedArticle(body)).body;
      assert(simulateSave(body, reloaded) === RASHIFAL_BODY, "load -> save is a fixed point");
    },
  },
  {
    name: "E5 lifecycle transitions never touch the body (and the flush-save preserves it)",
    run: () => {
      // Publish/unpublish/archive go through transitionArticle, which writes only status +
      // timestamps — the body (and its sidecar) is never part of that payload.
      const svc = read("src/modules/admin/articles/service-core.ts");
      const transition = svc.slice(svc.indexOf("export async function transitionArticle"), svc.indexOf("export async function deleteArticle"));
      assert(!transition.includes("body"), "transitionArticle never writes the body");
      assert(transition.includes("status: resolved.to"), "transition writes status only (+ timestamps)");
      // The flush-before-transition autosave goes through the protected update path.
      const actions = read("src/modules/admin/desk/article-actions.ts");
      assert(actions.includes("joinBodyAndSidecar"), "the update path reattaches the sidecar");
      const controls = read("src/modules/admin/desk/article-lifecycle-controls.tsx");
      assert(controls.includes("await flush()"), "flush-before-transition routes through the protected update");
      // Simulating the flush save preserves the sidecar.
      const flushed = simulateSave(RASHIFAL_BODY, articleToFormValues(storedArticle(RASHIFAL_BODY)).body)!;
      assert(inspectDeskBody(flushed).sidecar === inspectDeskBody(RASHIFAL_BODY).sidecar, "sidecar intact across a publish flush");
    },
  },
  {
    name: "E6 missing sidecar: plain articles edit normally and gain nothing",
    run: () => {
      const parts = inspectDeskBody(PLAIN_BODY);
      assert(parts.state === "none" && parts.sidecar === null, "no sidecar detected");
      const saved = simulateSave(PLAIN_BODY, "## New\n\nBody.")!;
      assert(saved === "## New\n\nBody.", "plain save is untouched — no sidecar invented");
      assert(!saved.includes("navagraha:desk-meta"), "no marker added");
      assert(simulateSave("", "")! === "", "empty stays empty");
      // An article with an EMPTY sidecar encodes to nothing.
      assert(encodeDeskMeta({ v: 1 } as DeskMeta) === "", "empty meta encodes to nothing");
    },
  },
  {
    name: "E7 malformed sidecar: mutation blocked, never silently overwritten",
    run: () => {
      const damaged = `${inspectDeskBody(RASHIFAL_BODY).visibleBody}\n\n<!--navagraha:desk-meta:v1\n{ broken json\n-->`;
      const parts = inspectDeskBody(damaged);
      assert(parts.state === "malformed", "damage detected");
      assert(parts.meta === null, "no meta parsed");
      assert(parts.sidecar !== null, "raw block still captured (not discarded)");
      // The save is BLOCKED — nothing is written.
      assert(simulateSave(damaged, "editor tried to save") === null, "mutation BLOCKED on a malformed sidecar");
      // The editor still never sees the damaged JSON.
      const values = articleToFormValues(storedArticle(damaged));
      assert(!values.body.includes("broken json") && !values.body.includes("desk-meta"), "damaged JSON hidden from the editor");
      // The public page degrades to prose-only rather than leaking the damage.
      const entry = mapArticleToContentEntry(asSource(storedArticle(damaged)));
      assert(entry.dailyRashifal === undefined, "extras absent while damaged");
      assert(!JSON.stringify(entry.sections).includes("broken json"), "damaged JSON never renders");
      // An unknown version is treated as damaged rather than trusted or overwritten.
      const future = `prose\n\n<!--navagraha:desk-meta:v1\n{"v":99}\n-->`;
      assert(inspectDeskBody(future).state === "malformed", "unknown version treated as damaged");
      assert(simulateSave(future, "x") === null, "unknown version also blocks mutation");
    },
  },
  {
    name: "E8 no raw JSON leakage: form, preview, warning message and errors are clean",
    run: () => {
      // The warning message carries no raw block. It lives in a pure module because a
      // "use server" file may only export async functions.
      const actions = read("src/modules/admin/desk/article-actions.ts");
      const notice = read("src/modules/admin/desk/sidecar-notice.ts");
      // Check for the DIRECTIVE (start of a line), not the token — the file's own comment
      // legitimately mentions "use server" in prose.
      assert(!/^\s*"use server"\s*;/m.test(notice), "the notice module is not a server-action file");
      const message = /SIDECAR_MALFORMED_MESSAGE\s*=\s*\n?\s*"([^"]+)"/.exec(notice)?.[1] ?? "";
      assert(message.length > 0, "a controlled message exists");
      assert(!message.includes("navagraha:desk-meta") && !message.includes("{") && !message.includes("json"), "message exposes no raw sidecar/JSON");
      assert(!/\$\{/.test(message), "message interpolates no stored content");
      // The action never returns the body in an error.
      assert(!/error:\s*`[^`]*\$\{[^}]*body/.test(actions), "no body content interpolated into an error");
      // The editor form is seeded from the stripped body only.
      const config = read("src/modules/admin/desk/article-form-config.ts");
      assert(config.includes("inspectDeskBody(article.body).visibleBody"), "form seeded with the visible body only");
      // The Admin preview strips the sidecar.
      const preview = read("src/app/(admin)/admin/desk/[id]/preview/page.tsx");
      assert(preview.includes("inspectDeskBody(article.body)") && preview.includes("visibleBody"), "preview strips the sidecar");
      assert(!preview.includes("{article.body}"), "preview never renders the raw stored body");
      // The edit page passes only the message to the client, never the block.
      const page = read("src/app/(admin)/admin/desk/[id]/page.tsx");
      assert(page.includes("SIDECAR_MALFORMED_MESSAGE") && page.includes('state === "malformed"'), "page detects damage server-side");
      assert(!page.includes("sidecar={") && !page.includes("parts.sidecar"), "the raw block never crosses to the client");
      // The form blocks saving/autosave while damaged.
      const form = read("src/modules/admin/desk/article-form.tsx");
      assert(form.includes("if (sidecarWarning) return false"), "autosave blocked while damaged");
      assert(form.includes("disabled={pending || Boolean(sidecarWarning)}"), "save button blocked while damaged");
      assert(form.includes("enableAutosave && !sidecarWarning"), "no autosave scheduling while damaged");
    },
  },
  {
    name: "E9 architecture: the codec is neutral — Admin never imports the public content module",
    run: () => {
      // The sidecar contract lives in its own module so neither side depends on the other.
      for (const file of [
        "src/modules/admin/desk/article-form-config.ts",
        "src/modules/admin/desk/article-actions.ts",
        "src/app/(admin)/admin/desk/[id]/page.tsx",
        "src/app/(admin)/admin/desk/[id]/preview/page.tsx",
      ]) {
        const src = read(file);
        assert(!/@\/modules\/content\b/.test(src), `${file} does not import the public content module`);
      }
      const codec = read("src/modules/desk-sidecar/sidecar.ts");
      assert(!codec.includes("getPrisma") && !codec.includes('"server-only"'), "codec is pure and testable");
      assert(!/@\/modules\/admin\b/.test(codec), "codec does not depend on Admin");
    },
  },
];

function main() {
  console.log("Claude C8B2 — structured sidecar editor-protection QA:");
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
  console.log(`\nsidecar protection QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
