/**
 * Claude Admin Console C6B — MediaAsset picker wiring QA.
 * Deterministic picker policy (pickable assets, selection resolution incl. deleted
 * references and library outages, status copy), static wiring into the Article cover and
 * Brand profile fields, payload compatibility with the untouched mappings/services, and
 * proof that reference-protected deletion still holds for picker-made selections.
 */
import { readFileSync } from "node:fs";
import {
  isPickableAsset,
  toPickerOptions,
  resolvePickerSelection,
  pickerStatusLabel,
  type MediaPickerOption,
} from "@/modules/admin/media/media-picker-core";
import { formDataToArticleInput } from "@/modules/admin/desk/article-form-config";
import { formDataToBrandPatch } from "@/modules/admin/brand/brand-form-config";
import { deleteMedia, createMedia, getMedia, type MediaServiceDeps } from "@/modules/admin/media/service-core";
import type { MediaRecord, MediaActor, MediaReferenceCount } from "@/modules/admin/media/types";
import type { MediaRepository } from "@/modules/admin/media/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const asset = (over: Partial<MediaRecord> = {}): MediaRecord => ({
  id: "m1", kind: "IMAGE", url: "https://cdn.example.com/a.webp", filename: "a.webp",
  mimeType: "image/webp", byteSize: 100, width: 10, height: 10, altText: "Alt A",
  caption: null, createdById: null, createdAt: new Date(0), updatedAt: new Date(0),
  ...over,
});

const OPTIONS: MediaPickerOption[] = [
  { id: "m1", url: "https://cdn.example.com/a.webp", filename: "a.webp", altText: "Alt A" },
  { id: "m2", url: "https://cdn.example.com/b.png", filename: "b.png", altText: "Alt B" },
];

// --- in-memory media harness (for the delete-guard re-proof) ----------------
function makeRepo(): MediaRepository & { rows: MediaRecord[] } {
  const rows: MediaRecord[] = [];
  let seq = 0;
  const clone = (r: MediaRecord): MediaRecord => ({ ...r });
  return {
    rows,
    async list(f) { return { items: rows.slice(f.skip, f.skip + f.take).map(clone), total: rows.length }; },
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
      Object.assign(r, data);
      return clone(r);
    },
    async remove(id) { const i = rows.findIndex((x) => x.id === id); if (i >= 0) rows.splice(i, 1); },
  };
}
const founder: MediaActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
function makeDeps(refCounts: Record<string, MediaReferenceCount> = {}) {
  const deps: MediaServiceDeps = {
    repo: makeRepo(),
    refs: async (id) => refCounts[id] ?? { articles: 0, brand: 0, total: 0 },
    audit: async () => ({ ok: true, id: "a" }),
  };
  return { deps };
}
const validMedia = (over: Record<string, unknown> = {}) => ({
  kind: "IMAGE", url: "https://cdn.example.com/photo.webp", filename: "photo.webp",
  mimeType: "image/webp", byteSize: 100, width: 10, height: 10, altText: "Alt", caption: null,
  ...over,
});

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "P1 pickable assets: only IMAGE kind with a usable https URL",
    run: () => {
      assert(isPickableAsset(asset()), "https image → pickable");
      assert(!isPickableAsset(asset({ url: "http://cdn.example.com/a.webp" })), "http → not pickable");
      assert(!isPickableAsset(asset({ url: "javascript:alert(1)" })), "javascript: → not pickable");
      assert(!isPickableAsset(asset({ url: "not a url" })), "malformed → not pickable");
      assert(!isPickableAsset(asset({ kind: "VIDEO" })), "non-image kind → not pickable");
    },
  },
  {
    name: "P2 toPickerOptions: filters invalid, exposes id/url/filename/altText, sane fallbacks",
    run: () => {
      const options = toPickerOptions([
        asset({ id: "ok" }),
        asset({ id: "bad-url", url: "http://x.example/a.png" }),
        asset({ id: "bad-kind", kind: "VIDEO" }),
      ]);
      assert(options.length === 1 && options[0]!.id === "ok", "only valid image assets listed");
      assert(options[0]!.filename === "a.webp" && options[0]!.altText === "Alt A", "filename + alt text exposed");
      // Missing filename falls back to the URL so a row is never blank.
      const noName = toPickerOptions([asset({ filename: null })]);
      assert(noName[0]!.filename === "https://cdn.example.com/a.webp", "blank filename → url fallback");
      const blankName = toPickerOptions([asset({ filename: "   " })]);
      assert(blankName[0]!.filename === "https://cdn.example.com/a.webp", "whitespace filename → url fallback");
      // Legacy null alt text stays selectable but is reported as empty (UI labels it).
      const noAlt = toPickerOptions([asset({ altText: null })]);
      assert(noAlt.length === 1 && noAlt[0]!.altText === "", "null alt text → empty string");
    },
  },
  {
    name: "P3 resolvePickerSelection: empty / selected / missing (deleted) / unavailable",
    run: () => {
      assert(resolvePickerSelection("", OPTIONS).state === "empty", "no id → empty");
      assert(resolvePickerSelection("   ", OPTIONS).state === "empty", "blank id → empty");
      const selected = resolvePickerSelection("m2", OPTIONS);
      assert(selected.state === "selected" && selected.option.filename === "b.png", "known id → selected");
      // A deleted / unknown reference must be reported, not silently dropped.
      const missing = resolvePickerSelection("gone", OPTIONS);
      assert(missing.state === "missing" && missing.id === "gone", "unknown id → missing (value preserved)");
      // A library outage must NOT masquerade as a deleted asset.
      const outage = resolvePickerSelection("m1", null);
      assert(outage.state === "unavailable" && outage.id === "m1", "options null → unavailable, id preserved");
      const outageEmpty = resolvePickerSelection("", null);
      assert(outageEmpty.state === "unavailable" && outageEmpty.id === "", "outage with no selection → unavailable");
      // An empty library is NOT an outage: a stored id is genuinely missing.
      assert(resolvePickerSelection("m1", []).state === "missing", "empty library → missing");
    },
  },
  {
    name: "P4 pickerStatusLabel: distinct copy per state incl. no-alt-text nudge",
    run: () => {
      assert(pickerStatusLabel({ state: "empty" }) === "No image selected.", "empty copy");
      assert(pickerStatusLabel({ state: "selected", option: OPTIONS[0]! }) === "Selected.", "selected copy");
      const noAlt = pickerStatusLabel({ state: "selected", option: { ...OPTIONS[0]!, altText: "" } });
      assert(noAlt.includes("no alt text"), "missing alt text nudges the editor");
      assert(pickerStatusLabel({ state: "missing", id: "x" }).includes("missing or was deleted"), "missing copy");
      assert(pickerStatusLabel({ state: "unavailable", id: "x" }).includes("selection is preserved"), "outage keeps selection");
      assert(pickerStatusLabel({ state: "unavailable", id: "" }).includes("unavailable"), "outage without selection");
    },
  },
  {
    name: "W1 payload compatibility: picker submits the SAME field names (mappings untouched)",
    run: () => {
      // Article cover: the picker's hidden input feeds the existing mapping unchanged.
      const articleForm = new FormData();
      articleForm.set("title", "T"); articleForm.set("slug", "t");
      articleForm.set("coverImageAssetId", "m2");
      assert(formDataToArticleInput(articleForm).coverImageAssetId === "m2", "selected cover flows through");
      const clearedArticle = new FormData();
      clearedArticle.set("title", "T"); clearedArticle.set("slug", "t");
      clearedArticle.set("coverImageAssetId", "");
      assert(formDataToArticleInput(clearedArticle).coverImageAssetId === null, "cleared cover → null");

      // Brand profile image: same story.
      const brandForm = new FormData();
      brandForm.set("profileImageAssetId", "m1"); brandForm.set("socialLinks", "");
      assert(formDataToBrandPatch(brandForm).profileImageAssetId === "m1", "selected profile image flows through");
      const clearedBrand = new FormData();
      clearedBrand.set("profileImageAssetId", ""); clearedBrand.set("socialLinks", "");
      assert(formDataToBrandPatch(clearedBrand).profileImageAssetId === null, "cleared profile image → null");
    },
  },
  {
    name: "W2 static: Article cover uses the picker (no free-text id), wired + role-gated",
    run: () => {
      const form = read("src/modules/admin/desk/article-form.tsx");
      assert(form.includes("<MediaPicker") && form.includes('name="coverImageAssetId"'), "cover uses the picker");
      assert(!form.includes('id="coverImageAssetId"'), "free-text cover input removed");
      assert(form.includes("options={mediaOptions}") && form.includes("canWrite={canWrite}"), "options + role passed");
      // Selecting must mark the form dirty so autosave still fires (hidden inputs do not bubble).
      assert(form.includes("onChange={onFormChange}"), "picker notifies the form (autosave/dirty)");
      assert(form.includes('error={err("coverImageAssetId")}'), "field error surfaced on the picker");

      const edit = read("src/app/(admin)/admin/desk/[id]/page.tsx");
      assert(edit.includes("getMediaPickerOptions") && edit.includes("mediaOptions={mediaOptions}"), "edit page supplies options");
      assert(edit.includes("hasAdminAccess") && edit.includes("canWrite={canWrite}"), "edit page supplies write access");
      const create = read("src/app/(admin)/admin/desk/new/page.tsx");
      assert(create.includes("getMediaPickerOptions") && create.includes("mediaOptions={mediaOptions}"), "create page supplies options");
      assert(create.includes("canWrite={canWrite}"), "create page supplies write access");
    },
  },
  {
    name: "W3 static: Brand profile image uses the picker (no free-text id), wired",
    run: () => {
      const form = read("src/modules/admin/brand/brand-settings-form.tsx");
      assert(form.includes("<MediaPicker") && form.includes('name="profileImageAssetId"'), "profile image uses the picker");
      assert(!form.includes('id="profileImageAssetId"'), "free-text profile input removed");
      assert(form.includes("options={mediaOptions}") && form.includes("canWrite={canWrite}"), "options + role passed");
      assert(form.includes('error={err("profileImageAssetId")}'), "field error surfaced on the picker");

      const page = read("src/app/(admin)/admin/settings/page.tsx");
      assert(page.includes("getMediaPickerOptions") && page.includes("mediaOptions={mediaOptions}"), "settings page supplies options");
    },
  },
  {
    name: "U1 static picker: hidden input, thumbnail/filename/alt, selected state, select/replace/clear",
    run: () => {
      const src = read("src/modules/admin/media/media-picker.tsx");
      assert(src.includes('type="hidden"') && src.includes("name={name}") && src.includes("value={selectedId}"), "submits via hidden input under the field name");
      assert(src.includes("<img") && src.includes("option.url"), "thumbnails");
      assert(src.includes("option.filename") && src.includes("option.altText"), "filename + alt text shown");
      assert(src.includes("aria-pressed={isSelected}") && src.includes("Selected"), "selected state exposed");
      // Upload-first vocabulary: device upload is primary, the library is the secondary path,
      // and the clear control is now "Remove image".
      assert(
        src.includes("Upload cover image") &&
          src.includes("Select from library") &&
          src.includes("Choose from library") &&
          src.includes("Remove image"),
        "upload / library select / remove",
      );
      assert(src.includes('commit("")'), "clear resets the reference");
      assert(src.includes("Missing asset reference"), "deleted reference surfaced");
      assert(src.includes("No image assets available"), "empty library state");
      assert(src.includes("min-h-11") && src.includes('role="group"') && src.includes("aria-label={label}"), "touch targets + labelled group");
      assert(src.includes("aria-expanded={open}"), "disclosure state exposed");
      // Read-only + no upload.
      assert(src.includes("canWrite ?"), "support sees no select/replace/clear controls");
      assert(!src.includes('type="file"') && !src.includes("FileReader"), "no upload provider");
    },
  },
  {
    name: "U2 static options helper: image-only query, null on outage (never a false 'deleted')",
    run: () => {
      const src = read("src/modules/admin/media/picker-options.ts");
      assert(src.includes('"server-only"'), "server-only helper");
      assert(src.includes("listMedia") && src.includes('kind: "IMAGE"'), "lists image assets via the existing service");
      assert(src.includes("toPickerOptions"), "maps through the pure policy");
      assert(src.includes("result.ok ? toPickerOptions(result.data.items) : null"), "outage → null, not an empty list");
    },
  },
  {
    name: "D1 reference-protected deletion still holds for a picker-selected asset",
    run: async () => {
      // An asset chosen via the picker is referenced through the very fields the checker
      // counts (Article.coverImageAssetId / BrandSettings.profileImageAssetId).
      const { deps } = makeDeps({ m1: { articles: 1, brand: 1, total: 2 } });
      const created = await createMedia(deps, founder, validMedia());
      assert(created.ok && created.data.id === "m1", "seed is m1"); if (!created.ok) return;
      const blocked = await deleteMedia(deps, founder, "m1", true);
      assert(!blocked.ok && blocked.status === 409 && blocked.code === "REFERENCED", "picker-referenced asset → 409 REFERENCED");
      assert((await getMedia(deps, "m1")).ok, "referenced asset survives");

      // Clearing the picker removes the reference → deletion proceeds (confirmed).
      const { deps: freeDeps } = makeDeps();
      const free = await createMedia(freeDeps, founder, validMedia());
      assert(free.ok, "unreferenced asset created"); if (!free.ok) return;
      const del = await deleteMedia(freeDeps, founder, free.data.id, true);
      assert(del.ok, "unreferenced asset deletes");

      // The checker contract the picker depends on is unchanged.
      const service = read("src/modules/admin/media/service.ts");
      assert(service.includes("coverImageAssetId: assetId") && service.includes("profileImageAssetId === assetId"), "checker still counts both picker-written fields");
    },
  },
];

async function main() {
  console.log("Admin Console C6B — MediaAsset picker wiring QA:");
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
  console.log(`\nadmin media picker QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
