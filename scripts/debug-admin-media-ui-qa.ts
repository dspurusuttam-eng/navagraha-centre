/**
 * Claude Admin Console C6A — Media library admin UI QA.
 * Pure list-query/URL/format helpers, form mapping, reference summaries; service-level
 * validation, role enforcement and reference-aware delete over an in-memory repo; and
 * static UI/page/action wiring checks (including the no-upload guarantee).
 */
import { readFileSync } from "node:fs";
import {
  buildMediaListQuery,
  buildMediaUrl,
  formatByteSize,
  formatDimensions,
  isReferenced,
  referenceSummary,
} from "@/modules/admin/media/media-list";
import {
  MEDIA_FORM_FIELDS,
  emptyMediaFormValues,
  mediaToFormValues,
  formDataToMediaInput,
  isHttpsUrl,
} from "@/modules/admin/media/media-form-config";
import {
  listMedia,
  getMedia,
  getMediaReferences,
  createMedia,
  updateMedia,
  deleteMedia,
  type MediaServiceDeps,
} from "@/modules/admin/media/service-core";
import type { MediaRecord, MediaActor, MediaReferenceCount } from "@/modules/admin/media/types";
import type { MediaRepository } from "@/modules/admin/media/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

// --- in-memory harness -----------------------------------------------------
function makeRepo(): MediaRepository & { rows: MediaRecord[] } {
  const rows: MediaRecord[] = [];
  let seq = 0;
  const clone = (r: MediaRecord): MediaRecord => ({ ...r });
  return {
    rows,
    async list(f) {
      const s = f.search?.toLowerCase();
      const items = rows.filter(
        (r) =>
          (!f.kind || r.kind === f.kind) &&
          (!s || (r.filename ?? "").toLowerCase().includes(s) || (r.altText ?? "").toLowerCase().includes(s)),
      );
      return { items: items.slice(f.skip, f.skip + f.take).map(clone), total: items.length };
    },
    async findById(id) { const r = rows.find((x) => x.id === id); return r ? clone(r) : null; },
    async create(data) {
      seq += 1;
      const at = new Date(Date.UTC(2025, 0, 1, 0, 0, seq));
      const rec: MediaRecord = { id: `m${seq}`, createdAt: at, updatedAt: at, ...data };
      rows.push(rec);
      return clone(rec);
    },
    async update(id, data) {
      const r = rows.find((x) => x.id === id);
      if (!r) throw new Error("not found");
      Object.assign(r, data, { updatedAt: new Date(Date.UTC(2025, 5, 1)) });
      return clone(r);
    },
    async remove(id) { const i = rows.findIndex((x) => x.id === id); if (i >= 0) rows.splice(i, 1); },
  };
}
const founder: MediaActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: MediaActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: MediaActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

function makeDeps(refCounts: Record<string, MediaReferenceCount> = {}) {
  const audits: string[] = [];
  const deps: MediaServiceDeps = {
    repo: makeRepo(),
    refs: async (id) => refCounts[id] ?? { articles: 0, brand: 0, total: 0 },
    audit: async (input) => { audits.push(input.action); return { ok: true, id: "a" }; },
  };
  return { deps, audits };
}

const validMedia = (over: Record<string, unknown> = {}) => ({
  kind: "IMAGE",
  url: "https://cdn.example.com/photo.webp",
  filename: "photo.webp",
  mimeType: "image/webp",
  byteSize: 34_500,
  width: 1200,
  height: 800,
  altText: "Acharya at the centre",
  caption: "Morning session",
  ...over,
});

function mediaForm(over: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const base: Record<string, string> = {
    kind: "IMAGE", url: "https://cdn.example.com/photo.webp", filename: "photo.webp",
    mimeType: "image/webp", byteSize: "34500", width: "1200", height: "800",
    altText: "Acharya at the centre", caption: "Morning session",
  };
  for (const [k, v] of Object.entries({ ...base, ...over })) fd.set(k, v);
  return fd;
}

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "L1 buildMediaListQuery: normalize + clamp kind/search/page",
    run: () => {
      const q = buildMediaListQuery({ kind: "IMAGE", search: "  logo  ", page: "3", pageSize: "5" });
      assert(q.kind === "IMAGE" && q.search === "logo" && q.page === 3 && q.pageSize === 5, "valid params");
      const bad = buildMediaListQuery({ kind: "VIDEO", page: "0", pageSize: "999" });
      assert(bad.kind === null && bad.page === 1 && bad.pageSize === 50, "invalid kind → null; clamps");
      const empty = buildMediaListQuery({});
      assert(empty.kind === null && empty.search === null && empty.page === 1 && empty.pageSize === 20, "defaults");
    },
  },
  {
    name: "L2 buildMediaUrl: preserve filters + page param",
    run: () => {
      assert(buildMediaUrl({ kind: "IMAGE", search: null, page: 1, pageSize: 20 }, 1) === "/admin/media?kind=IMAGE", "page1 omits page");
      const url = buildMediaUrl({ kind: "IMAGE", search: "logo", page: 1, pageSize: 20 }, 2);
      assert(url.includes("kind=IMAGE") && url.includes("search=logo") && url.includes("page=2"), "preserves + page");
      assert(buildMediaUrl({ kind: null, search: null, page: 1, pageSize: 20 }, 1) === "/admin/media", "no filters");
    },
  },
  {
    name: "L3 display helpers: byte size, dimensions, reference summary",
    run: () => {
      assert(formatByteSize(512) === "512 B" && formatByteSize(2048) === "2 KB", "bytes/KB");
      assert(formatByteSize(1_572_864) === "1.5 MB", "MB");
      assert(formatByteSize(null) === "—" && formatByteSize(-1) === "—", "unknown → em dash");
      assert(formatDimensions(1200, 800) === "1200×800" && formatDimensions(null, 800) === "—", "dimensions");
      assert(!isReferenced({ articles: 0, brand: 0, total: 0 }), "unused");
      assert(isReferenced({ articles: 1, brand: 0, total: 1 }), "referenced");
      assert(referenceSummary({ articles: 0, brand: 0, total: 0 }).includes("safe to delete"), "unused summary");
      assert(referenceSummary({ articles: 1, brand: 0, total: 1 }) === "Referenced by 1 article.", "singular article");
      assert(referenceSummary({ articles: 2, brand: 1, total: 3 }) === "Referenced by 2 articles and brand settings.", "plural + brand");
    },
  },
  {
    name: "F1 form config + mediaToFormValues + isHttpsUrl",
    run: () => {
      for (const field of ["filename", "url", "kind", "mimeType", "byteSize", "width", "height", "altText", "caption"]) {
        assert((MEDIA_FORM_FIELDS as readonly string[]).includes(field), `field ${field}`);
      }
      assert(MEDIA_FORM_FIELDS.length === 9, "9 form fields");
      const empty = emptyMediaFormValues();
      assert(empty.kind === "IMAGE" && empty.url === "" && empty.altText === "", "empty defaults");
      const seeded = mediaToFormValues({
        id: "m1", kind: "IMAGE", url: "https://a.example/x.png", filename: null, mimeType: null,
        byteSize: null, width: null, height: null, altText: "Alt", caption: null,
        createdById: null, createdAt: new Date(0), updatedAt: new Date(0),
      });
      assert(seeded.filename === "" && seeded.byteSize === "" && seeded.caption === "", "nulls → empty strings");
      assert(seeded.url === "https://a.example/x.png" && seeded.altText === "Alt", "values surfaced");
      assert(isHttpsUrl("https://a.example/x.png"), "https accepted");
      assert(!isHttpsUrl("http://a.example/x.png"), "http rejected");
      assert(!isHttpsUrl("javascript:alert(1)") && !isHttpsUrl("not a url") && !isHttpsUrl(""), "unsafe/invalid rejected");
    },
  },
  {
    name: "F2 formDataToMediaInput: text, numeric coercion, empty → null",
    run: () => {
      const out = formDataToMediaInput(mediaForm());
      assert(out.url === "https://cdn.example.com/photo.webp" && out.altText === "Acharya at the centre", "required fields");
      assert(out.byteSize === 34500 && out.width === 1200 && out.height === 800, "numeric coercion");
      assert(out.mimeType === "image/webp" && out.kind === "IMAGE", "selects");
      const cleared = formDataToMediaInput(mediaForm({ filename: "", mimeType: "", byteSize: "", width: "", height: "", caption: "" }));
      assert(cleared.filename === null && cleared.mimeType === null && cleared.caption === null, "empty text → null");
      assert(cleared.byteSize === null && cleared.width === null && cleared.height === null, "empty numbers → null");
      const bad = formDataToMediaInput(mediaForm({ byteSize: "abc" }));
      assert(Number.isNaN(bad.byteSize), "non-numeric → NaN (schema reports it)");
    },
  },
  {
    name: "S1 service: create/list/search/kind filter/get via the form payload",
    run: async () => {
      const { deps } = makeDeps();
      const created = await createMedia(deps, founder, formDataToMediaInput(mediaForm()));
      assert(created.ok && created.status === 201, "created from form payload");
      if (!created.ok) return;
      assert(created.data.byteSize === 34500 && created.data.altText === "Acharya at the centre", "stored");
      await createMedia(deps, founder, validMedia({ url: "https://cdn.example.com/logo.png", filename: "logo.png", altText: "Logo" }));
      const all = await listMedia(deps, buildMediaListQuery({}));
      assert(all.ok && all.data.total === 2, "2 total");
      const search = await listMedia(deps, buildMediaListQuery({ search: "logo" }));
      assert(search.ok && search.data.total === 1 && search.data.items[0]!.filename === "logo.png", "search matches");
      const byKind = await listMedia(deps, buildMediaListQuery({ kind: "IMAGE" }));
      assert(byKind.ok && byKind.data.total === 2, "kind filter");
      const got = await getMedia(deps, created.data.id);
      assert(got.ok, "get by id");
      const missing = await getMedia(deps, "nope");
      assert(!missing.ok && missing.status === 404, "missing → 404");
    },
  },
  {
    name: "S2 service: validation — https-only URL, required alt text, mime/size bounds",
    run: async () => {
      const { deps } = makeDeps();
      const firstPath = (issues: unknown) => (issues as Array<{ path?: (string | number)[] }>)[0]?.path?.[0];

      const httpUrl = await createMedia(deps, founder, validMedia({ url: "http://cdn.example.com/x.png" }));
      assert(!httpUrl.ok && httpUrl.status === 422 && firstPath(httpUrl.issues) === "url", "http → 422 on url");

      const notUrl = await createMedia(deps, founder, validMedia({ url: "not-a-url" }));
      assert(!notUrl.ok && notUrl.status === 422, "invalid url rejected");

      const noAlt = await createMedia(deps, founder, validMedia({ altText: "" }));
      assert(!noAlt.ok && noAlt.status === 422 && firstPath(noAlt.issues) === "altText", "missing alt text → 422 on altText");

      const badMime = await createMedia(deps, founder, validMedia({ mimeType: "application/pdf" }));
      assert(!badMime.ok && badMime.status === 422 && firstPath(badMime.issues) === "mimeType", "non-image mime → 422");

      const badSize = await createMedia(deps, founder, validMedia({ byteSize: -5 }));
      assert(!badSize.ok && badSize.status === 422, "negative size rejected");

      const hugeSize = await createMedia(deps, founder, validMedia({ byteSize: 60_000_000 }));
      assert(!hugeSize.ok && hugeSize.status === 422, "over-max size rejected");

      const badDim = await createMedia(deps, founder, validMedia({ width: 25_000 }));
      assert(!badDim.ok && badDim.status === 422, "over-max width rejected");
    },
  },
  {
    name: "R1 role: founder/editor write; support → 403 on create/update/delete; support may read",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createMedia(deps, founder, validMedia());
      assert(c.ok, "founder creates"); if (!c.ok) return;
      assert((await createMedia(deps, editor, validMedia({ url: "https://cdn.example.com/b.png" }))).ok, "editor creates");
      const denied = await createMedia(deps, support, validMedia({ url: "https://cdn.example.com/c.png" }));
      assert(!denied.ok && denied.status === 403, "support create → 403");
      const deniedUpdate = await updateMedia(deps, support, c.data.id, { altText: "x" });
      assert(!deniedUpdate.ok && deniedUpdate.status === 403, "support update → 403");
      const deniedDelete = await deleteMedia(deps, support, c.data.id, true);
      assert(!deniedDelete.ok && deniedDelete.status === 403, "support delete → 403");
      assert((await listMedia(deps, buildMediaListQuery({}))).ok, "support may read the list");
      assert((await getMedia(deps, c.data.id)).ok, "support may read an asset");
    },
  },
  {
    name: "D1 delete safety: referenced blocked (409), unused needs confirmation, then deletes",
    run: async () => {
      const { deps, audits } = makeDeps({ m1: { articles: 2, brand: 1, total: 3 } });
      const c = await createMedia(deps, founder, validMedia());
      assert(c.ok && c.data.id === "m1", "seed is m1"); if (!c.ok) return;

      // Referenced → blocked even when confirmed.
      const blocked = await deleteMedia(deps, founder, "m1", true);
      assert(!blocked.ok && blocked.status === 409 && blocked.code === "REFERENCED", "referenced → 409 REFERENCED");
      assert((await getMedia(deps, "m1")).ok, "referenced asset survives");

      const refs = await getMediaReferences(deps, "m1");
      assert(refs.ok && refs.data.total === 3 && refs.data.articles === 2 && refs.data.brand === 1, "reference report");

      // Unused asset: confirmation required, then delete succeeds + audits.
      const second = await createMedia(deps, founder, validMedia({ url: "https://cdn.example.com/free.png" }));
      assert(second.ok, "second created"); if (!second.ok) return;
      const noConfirm = await deleteMedia(deps, founder, second.data.id, false);
      assert(!noConfirm.ok && noConfirm.status === 400 && noConfirm.code === "CONFIRMATION_REQUIRED", "unused without confirm → blocked");
      const del = await deleteMedia(deps, founder, second.data.id, true);
      assert(del.ok, "unused + confirmed → deleted");
      assert(!(await getMedia(deps, second.data.id)).ok, "gone after delete");
      assert(audits.includes("media.delete") && audits.includes("media.create"), "audited");
    },
  },
  {
    name: "U1 static form: 9 labelled fields, preview, states, read-only, a11y, NO upload",
    run: () => {
      const src = read("src/modules/admin/media/media-form.tsx");
      for (const id of ["url", "altText", "filename", "kind", "mimeType", "byteSize", "width", "height", "caption"]) {
        assert(src.includes(`htmlFor="${id}"`) && src.includes(`id="${id}"`), `label+control for ${id}`);
      }
      assert(src.includes("isHttpsUrl(url)") && src.includes("Preview"), "https-gated preview");
      assert(src.includes("onError") && src.includes("Preview unavailable"), "preview failure fallback");
      assert(src.includes('role="alert"') && src.includes('role="status"'), "failure + success roles");
      assert(src.includes("Saving…") && src.includes("Retry"), "saving + retry states");
      assert(src.includes("aria-invalid") && src.includes("aria-describedby"), "field error a11y");
      assert(src.includes("disabled={!canWrite}") && src.includes("read-only access"), "read-only rendering");
      assert(src.includes("min-h-11") && src.includes("max-w-2xl"), "touch targets + mobile layout");
      // Reference-only: no upload anywhere.
      assert(!src.includes('type="file"') && !src.includes("FileReader") && !src.includes("multipart") && !src.includes("FormData()"), "no upload control");
      assert(src.includes("never uploaded"), "reference-only hint");
    },
  },
  {
    name: "U2 static list: search, kind filter, pagination, empty + failure states",
    run: () => {
      const src = read("src/modules/admin/media/media-asset-list.tsx");
      assert(src.includes('role="search"') && src.includes('method="get"'), "native search form");
      assert(src.includes('name="kind"') && src.includes('name="search"'), "filter inputs");
      assert(src.includes('aria-label="Pagination"') && src.includes("Previous") && src.includes("Next"), "pagination");
      assert(src.includes("No media matches these filters") && src.includes("No media registered yet"), "empty states");
      assert(src.includes("temporarily unavailable") && src.includes('role="alert"'), "failure state");
      assert(src.includes("canWrite ?") && src.includes('href="/admin/media/new"'), "register link gated by role");
      assert(src.includes("min-h-11"), "touch targets");
    },
  },
  {
    name: "U3 static reference panel: status always, delete blocked when referenced, confirm",
    run: () => {
      const src = read("src/modules/admin/media/media-reference-panel.tsx");
      assert(src.includes("referenceSummary") && src.includes("Articles:") && src.includes("Brand settings:"), "Article/Brand reference status shown");
      assert(src.includes("const canDelete = canWrite && !referenced"), "delete blocked while referenced");
      assert(src.includes("disabled={!canDelete || pending}"), "delete button disabled accordingly");
      assert(src.includes("cannot be deleted"), "blocked explanation");
      assert(src.includes('role="alertdialog"') && src.includes("Cancel"), "confirmation dialog");
      assert(src.includes('role="alert"'), "failure surfaced");
      assert(src.includes("min-h-11") && src.includes("aria-label"), "touch targets + labels");
    },
  },
  {
    name: "U4 static pages: list/new/[id] exist, noindex, service + role wired, loading state",
    run: () => {
      const list = read("src/app/(admin)/admin/media/page.tsx");
      assert(!list.includes("AdminPlaceholder"), "placeholder replaced");
      assert(list.includes("listMedia") && list.includes("buildMediaListQuery") && list.includes("index: false"), "list wired + noindex");
      assert(list.includes("hasAdminAccess") && list.includes("canWrite"), "role gate");

      const create = read("src/app/(admin)/admin/media/new/page.tsx");
      assert(create.includes("createMediaAction") && create.includes('mode="create"') && create.includes("index: false"), "new wired");
      assert(create.includes("redirect(\"/admin/media\")") && create.includes("hasAdminAccess"), "read-only admin redirected away from create");

      const edit = read("src/app/(admin)/admin/media/[id]/page.tsx");
      assert(edit.includes("getMedia") && edit.includes("getMediaReferences") && edit.includes("updateMediaAction"), "edit wired");
      assert(edit.includes("MediaReferencePanel") && edit.includes("deleteMediaAction"), "reference panel + delete");
      assert(edit.includes("Media not found") && edit.includes("index: false"), "not-found + noindex");
      assert(edit.includes("deletion is disabled"), "reference-unavailable disables deletion");

      const loading = read("src/app/(admin)/admin/media/loading.tsx");
      assert(loading.includes("RouteSkeleton"), "loading state");
    },
  },
  {
    name: "U5 static actions: existing service, redirects, no upload/storage provider",
    run: () => {
      const src = read("src/modules/admin/media/media-actions.ts");
      assert(src.includes('"use server"'), "server action module");
      assert(src.includes("createMedia") && src.includes("updateMedia") && src.includes("deleteMedia"), "uses existing media service");
      assert(src.includes("getMediaDeps") && src.includes("getAdminPageSessionOrNull"), "deps + session actor");
      assert(src.includes("redirect(`/admin/media/${result.data.id}`)"), "create redirects to the new asset");
      assert(src.includes('redirect("/admin/media")'), "delete redirects to the library");
      assert(src.includes("deleteMedia(getMediaDeps(), actor, id, true)"), "delete passes explicit confirmation");
      assert(src.includes('revalidatePath("/admin/media")'), "library revalidated");
      // No storage provider / upload plumbing.
      assert(!/s3|cloudinary|blob|presign|upload/i.test(src), "no upload or storage provider");
    },
  },
];

async function main() {
  console.log("Admin Console C6A — Media library admin UI QA:");
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
  console.log(`\nadmin media UI QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
