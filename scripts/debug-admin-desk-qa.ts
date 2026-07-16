/**
 * Claude Admin Console C4A — Desk list/editor QA (pure + static source checks).
 * Covers list-query normalization, pagination URLs, slug derivation, unsaved-change
 * detection, form payload mapping, and UI/accessibility invariants. No DB/route.
 */
import { readFileSync } from "node:fs";
import { buildDeskListQuery, buildDeskUrl } from "@/modules/admin/desk/desk-list";
import {
  ARTICLE_FORM_FIELDS,
  deriveSlugFromTitle,
  hasUnsavedChanges,
  formDataToArticleInput,
  emptyArticleFormValues,
} from "@/modules/admin/desk/article-form-config";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "L1 buildDeskListQuery: normalize + clamp filters",
    run: () => {
      const q = buildDeskListQuery({ status: "PUBLISHED", language: "hi", search: "  test  ", page: "2", pageSize: "5" });
      assert(q.status === "PUBLISHED" && q.language === "hi" && q.search === "test" && q.page === 2 && q.pageSize === 5, "valid params");
      const bad = buildDeskListQuery({ status: "BOGUS", language: "fr", page: "0", pageSize: "999" });
      assert(bad.status === null && bad.language === null && bad.page === 1 && bad.pageSize === 50, "invalid → null + clamp");
      const empty = buildDeskListQuery({});
      assert(empty.page === 1 && empty.pageSize === 20 && empty.status === null && empty.search === null, "defaults");
    },
  },
  {
    name: "L2 buildDeskUrl: preserve filters + page param",
    run: () => {
      assert(buildDeskUrl({ status: "DRAFT", language: null, search: null, page: 1, pageSize: 20 }, 1) === "/admin/desk?status=DRAFT", "page1 omits page");
      const url = buildDeskUrl({ status: "DRAFT", language: "hi", search: "x", page: 1, pageSize: 20 }, 3);
      assert(url.includes("status=DRAFT") && url.includes("language=hi") && url.includes("search=x") && url.includes("page=3"), "preserves + page");
      assert(buildDeskUrl({ status: null, language: null, search: null, page: 1, pageSize: 20 }, 1) === "/admin/desk", "no filters");
    },
  },
  {
    name: "F1 deriveSlugFromTitle",
    run: () => {
      assert(deriveSlugFromTitle("Sade Sati Explained!") === "sade-sati-explained", "basic");
      assert(deriveSlugFromTitle("  Hello,  World  ") === "hello-world", "trim + collapse");
      assert(deriveSlugFromTitle("--Weird__Chars--") === "weird-chars", "edge trim");
      assert(deriveSlugFromTitle("A") === "a", "single");
    },
  },
  {
    name: "F2 hasUnsavedChanges + field config",
    run: () => {
      const base = emptyArticleFormValues();
      assert(!hasUnsavedChanges(base, { ...base }), "identical → clean");
      assert(hasUnsavedChanges(base, { ...base, title: "X" }), "changed → dirty");
      for (const field of ["title", "slug", "summary", "body", "language", "category", "coverImageAssetId", "isFeatured", "displayOrder", "seoTitle", "seoDescription", "readingTimeMinutes"]) {
        assert((ARTICLE_FORM_FIELDS as readonly string[]).includes(field), `field ${field}`);
      }
      assert(ARTICLE_FORM_FIELDS.length === 12, "12 fields");
    },
  },
  {
    name: "F3 formDataToArticleInput mapping",
    run: () => {
      const fd = new FormData();
      fd.set("title", "My Title"); fd.set("slug", "my-title"); fd.set("summary", "  s  ");
      fd.set("language", "hi"); fd.set("category", "astrology"); fd.set("coverImageAssetId", "");
      fd.set("isFeatured", "on"); fd.set("displayOrder", "5"); fd.set("readingTimeMinutes", "3");
      const out = formDataToArticleInput(fd);
      assert(out.title === "My Title" && out.slug === "my-title" && out.summary === "s", "text trimmed");
      assert(out.language === "hi" && out.category === "astrology", "selects");
      assert(out.coverImageAssetId === null && out.body === undefined, "empty → null/undefined");
      assert(out.isFeatured === true && out.displayOrder === 5 && out.readingTimeMinutes === 3, "coercions");
      const min = new FormData(); min.set("title", "T"); min.set("slug", "t");
      const out2 = formDataToArticleInput(min);
      assert(out2.isFeatured === false && out2.displayOrder === 0 && out2.readingTimeMinutes === undefined && out2.language === "en", "defaults");
    },
  },
  {
    name: "A1 article form: labelled fields, error/status roles, unsaved-change, Save Draft, touch targets",
    run: () => {
      const src = read("src/modules/admin/desk/article-form.tsx");
      for (const id of ["title", "slug", "summary", "body", "language", "category", "seoTitle", "seoDescription", "displayOrder", "readingTimeMinutes"]) {
        assert(src.includes(`htmlFor="${id}"`) && src.includes(`id="${id}"`), `label+input for ${id}`);
      }
      // C6B: the cover image is a MediaPicker (hidden input under the same field name),
      // no longer a free-text asset id.
      assert(src.includes("<MediaPicker") && src.includes('name="coverImageAssetId"'), "cover image uses the media picker");
      assert(!src.includes('id="coverImageAssetId"'), "no free-text cover id input remains");
      assert(src.includes('role="alert"'), "error alert role");
      assert(src.includes("Unsaved changes") && src.includes("beforeunload"), "unsaved-change handling");
      assert(src.includes("aria-invalid") && src.includes("aria-describedby"), "field error a11y");
      assert(src.includes("Save Draft") && src.includes("disabled={pending}"), "save draft + pending");
      assert(src.includes("min-h-11"), "touch targets");
    },
  },
  {
    name: "A2 list: search form, filters, pagination, empty + unavailable states",
    run: () => {
      const src = read("src/modules/admin/desk/desk-article-list.tsx");
      assert(src.includes('role="search"') && src.includes('method="get"'), "native search form");
      assert(src.includes('name="status"') && src.includes('name="language"') && src.includes('name="search"'), "filter inputs");
      assert(src.includes('aria-label="Pagination"') && src.includes("Previous") && src.includes("Next"), "pagination");
      assert(src.includes("No articles match") && src.includes("temporarily unavailable"), "empty + unavailable");
      assert(src.includes('href="/admin/desk/new"'), "new article link");
    },
  },
  {
    name: "A3 pages exist, noindex, wired to services/actions",
    run: () => {
      const list = read("src/app/(admin)/admin/desk/page.tsx");
      assert(list.includes("listArticles") && list.includes("buildDeskListQuery") && list.includes("index: false"), "list wired + noindex");
      const create = read("src/app/(admin)/admin/desk/new/page.tsx");
      assert(create.includes("createArticleAction") && create.includes('mode="create"') && create.includes("index: false"), "new wired");
      const edit = read("src/app/(admin)/admin/desk/[id]/page.tsx");
      assert(edit.includes("getArticle") && edit.includes("updateArticleAction") && edit.includes("Article not found") && edit.includes("index: false"), "edit wired + not-found");
    },
  },
];

function main() {
  console.log("Admin Console C4A — Desk list/editor QA (pure + static):");
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
  console.log(`\nadmin desk QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
