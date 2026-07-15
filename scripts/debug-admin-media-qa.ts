/**
 * Claude Admin Console C2C — Media metadata service/API QA (pure, in-memory).
 * Covers CRUD, authorization, validation, reference detection/protection, delete
 * confirmation, and audit. No DB/route.
 */
import {
  listMedia, getMedia, getMediaReferences, createMedia, updateMedia, deleteMedia,
  type MediaServiceDeps,
} from "@/modules/admin/media/service-core";
import type { MediaRecord, MediaActor, MediaReferenceCount } from "@/modules/admin/media/types";
import type { MediaRepository } from "@/modules/admin/media/repository";
import type { AuditEntryInput } from "@/modules/admin/audit-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function makeRepo(): MediaRepository & { rows: MediaRecord[] } {
  const rows: MediaRecord[] = [];
  let seq = 0;
  const clone = (r: MediaRecord): MediaRecord => ({ ...r });
  return {
    rows,
    async list(f) {
      const s = f.search?.toLowerCase();
      let items = rows.filter(
        (r) => (!f.kind || r.kind === f.kind) && (!s || (r.filename ?? "").toLowerCase().includes(s) || (r.altText ?? "").toLowerCase().includes(s) || (r.caption ?? "").toLowerCase().includes(s)),
      );
      items = items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { items: items.slice(f.skip, f.skip + f.take).map(clone), total: items.length };
    },
    async findById(id) {
      const r = rows.find((x) => x.id === id);
      return r ? clone(r) : null;
    },
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
    async remove(id) {
      const i = rows.findIndex((x) => x.id === id);
      if (i >= 0) rows.splice(i, 1);
    },
  };
}

function makeDeps(refCounts: Record<string, MediaReferenceCount> = {}) {
  const audits: AuditEntryInput[] = [];
  const deps: MediaServiceDeps = {
    repo: makeRepo(),
    refs: async (id) => refCounts[id] ?? { articles: 0, brand: 0, total: 0 },
    audit: async (input) => { audits.push(input); return { ok: true, id: `a${audits.length}` }; },
  };
  return { deps, audits };
}

const founder: MediaActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: MediaActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: MediaActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

const validMedia = (over: Record<string, unknown> = {}) => ({
  url: "https://cdn.navagraha.com/cover.jpg",
  filename: "cover.jpg",
  mimeType: "image/jpeg",
  byteSize: 120000,
  width: 1200,
  height: 630,
  altText: "Sade Sati cover image",
  caption: "Cover art",
  ...over,
});

type Group = { name: string; run: () => Promise<void> };
const groups: Group[] = [
  {
    name: "AUTH: support read-only; founder/editor write",
    run: async () => {
      const { deps } = makeDeps();
      assert((await createMedia(deps, support, validMedia())).status === 403, "support create → 403");
      const created = await createMedia(deps, editor, validMedia());
      assert(created.ok && created.status === 201, "editor create → 201");
      assert((await getMedia(deps, created.ok ? created.data.id : "")).ok, "read ok");
      assert((await deleteMedia(deps, support, "m1", true)).status === 403, "support delete → 403");
    },
  },
  {
    name: "CRUD: create + createdById; get; update; list; filters",
    run: async () => {
      const { deps } = makeDeps();
      const c = await createMedia(deps, founder, validMedia({ filename: "alpha.png", mimeType: "image/png" }));
      assert(c.ok && c.data.createdById === "u-f" && c.data.kind === "IMAGE", "created with owner + kind");
      await createMedia(deps, founder, validMedia({ filename: "beta.webp", mimeType: "image/webp" }));
      const upd = await updateMedia(deps, founder, c.ok ? c.data.id : "", { caption: "Updated caption" });
      assert(upd.ok && upd.data.caption === "Updated caption", "updated");
      const all = await listMedia(deps, {});
      assert(all.ok && all.data.total === 2, "2 total");
      const search = await listMedia(deps, { search: "beta" });
      assert(search.ok && search.data.total === 1, "search beta");
      const paged = await listMedia(deps, { page: 1, pageSize: 1 });
      assert(paged.ok && paged.data.items.length === 1 && paged.data.pageCount === 2, "pagination");
      assert((await getMedia(deps, "missing")).status === 404, "missing → 404");
    },
  },
  {
    name: "VALIDATION: https, image mime, alt text, bounded metadata",
    run: async () => {
      const { deps } = makeDeps();
      assert((await createMedia(deps, founder, validMedia({ url: "http://cdn.navagraha.com/a.jpg" })).then((r) => r.status)) === 422, "http rejected");
      assert((await createMedia(deps, founder, validMedia({ mimeType: "application/pdf" })).then((r) => r.status)) === 422, "non-image mime rejected");
      assert((await createMedia(deps, founder, { url: "https://cdn.navagraha.com/a.jpg" }).then((r) => r.status)) === 422, "missing altText rejected");
      assert((await createMedia(deps, founder, validMedia({ width: -5 })).then((r) => r.status)) === 422, "negative width rejected");
      assert((await createMedia(deps, founder, validMedia({ caption: "x".repeat(601) })).then((r) => r.status)) === 422, "caption over limit");
      assert((await createMedia(deps, founder, validMedia({ filename: "" })).then((r) => r.status)) === 422, "empty filename rejected");
      assert((await createMedia(deps, founder, { url: "https://cdn.navagraha.com/a.svg", altText: "vector" }).then((r) => r.ok)) === true, "minimal valid ok");
    },
  },
  {
    name: "REFERENCE PROTECTION: block delete while referenced; allow when free",
    run: async () => {
      // referenced by 2 articles (first created asset has id m1)
      const referenced = makeDeps({ m1: { articles: 2, brand: 0, total: 2 } });
      await createMedia(referenced.deps, founder, validMedia());
      const blocked = await deleteMedia(referenced.deps, founder, "m1", true);
      assert(!blocked.ok && blocked.status === 409 && blocked.code === "REFERENCED", "delete blocked (article ref)");
      assert((blocked as { issues?: MediaReferenceCount }).issues?.articles === 2, "reference counts surfaced");
      const refs = await getMediaReferences(referenced.deps, "m1");
      assert(refs.ok && refs.data.total === 2, "reference report");
      // brand reference blocks too
      const brandRef = makeDeps({ m1: { articles: 0, brand: 1, total: 1 } });
      await createMedia(brandRef.deps, founder, validMedia());
      assert((await deleteMedia(brandRef.deps, founder, "m1", true)).status === 409, "delete blocked (brand ref)");
      // free asset deletes
      const free = makeDeps();
      await createMedia(free.deps, founder, validMedia());
      assert((await deleteMedia(free.deps, founder, "m1", true)).ok, "free delete ok");
      assert((await getMedia(free.deps, "m1")).status === 404, "gone after delete");
    },
  },
  {
    name: "DELETE requires explicit confirmation (before reference check)",
    run: async () => {
      const referenced = makeDeps({ m1: { articles: 5, brand: 0, total: 5 } });
      await createMedia(referenced.deps, founder, validMedia());
      const noConfirm = await deleteMedia(referenced.deps, founder, "m1", false);
      assert(!noConfirm.ok && noConfirm.status === 400 && noConfirm.code === "CONFIRMATION_REQUIRED", "no confirm → 400");
    },
  },
  {
    name: "AUDIT: create/update/delete audited with actor + action",
    run: async () => {
      const { deps, audits } = makeDeps();
      const c = await createMedia(deps, founder, validMedia());
      assert(c.ok, "created");
      if (!c.ok) return;
      await updateMedia(deps, founder, c.data.id, { caption: "x" });
      await deleteMedia(deps, founder, c.data.id, true);
      const actions = audits.map((a) => a.action);
      assert(actions.includes("media.create") && actions.includes("media.update") && actions.includes("media.delete"), "all mutations audited");
      assert(audits.every((a) => a.actorUserId === "u-f" && a.entityType === "media_asset"), "actor + entity");
    },
  },
];

async function main() {
  console.log("Admin Console C2C — Media metadata service/API QA (pure):");
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
  console.log(`\nadmin media QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
