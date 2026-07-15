/**
 * Claude Admin Console C2B2 — Brand/profile settings service/API QA (pure).
 * Covers authorization, validation, singleton get/merge, audit, and schema
 * normalization (single canonical config column). No DB/route.
 */
import { readFileSync } from "node:fs";
import {
  getBrandSettings,
  updateBrandSettings,
  type BrandActor,
  type BrandServiceDeps,
} from "@/modules/admin/brand/service-core";
import type { BrandSettingsRepository } from "@/modules/admin/brand/repository";
import type { BrandSettingsInput } from "@/modules/admin/domain";
import type { AuditEntryInput } from "@/modules/admin/audit-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function makeDeps() {
  let value: BrandSettingsInput | null = null;
  const audits: AuditEntryInput[] = [];
  const repo: BrandSettingsRepository = {
    async get() { return value; },
    async save(config) { value = config; return config; },
  };
  const deps: BrandServiceDeps = { repo, audit: async (input) => { audits.push(input); return { ok: true, id: `a${audits.length}` }; } };
  return { deps, audits, peek: () => value };
}

const founder: BrandActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: BrandActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: BrandActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

const validPatch = {
  acharyaName: "Acharya J P Sarmah",
  professionalTitle: "Vedic Astrologer",
  profileImageAssetId: "clabc123",
  biography: "Decades of classical Vedic practice.",
  supportEmail: "help@navagrahacentre.com",
  officeHours: "Mon–Sat, 10:00–18:00 IST",
  whatsappNumber: "+919876543210",
  socialLinks: [{ platform: "youtube", url: "https://youtube.com/@navagraha" }],
  footer: { addressLine: "Guwahati, Assam", copyright: "© Navagraha Centre", note: "All timings IST" },
  disclaimer: "Guidance only; not a substitute for professional advice.",
};

type Group = { name: string; run: () => Promise<void> | void };
const groups: Group[] = [
  {
    name: "AUTH: support read-only; founder/editor write",
    run: async () => {
      const { deps } = makeDeps();
      assert((await updateBrandSettings(deps, support, validPatch)).status === 403, "support update → 403");
      assert((await getBrandSettings(deps)).ok, "any admin read ok");
      assert((await updateBrandSettings(deps, editor, validPatch)).ok, "editor update ok");
      assert((await updateBrandSettings(deps, founder, { professionalTitle: "Jyotish Acharya" })).ok, "founder update ok");
    },
  },
  {
    name: "SINGLETON: defaults when unset; persist; partial merge preserves fields",
    run: async () => {
      const { deps, peek } = makeDeps();
      const initial = await getBrandSettings(deps);
      assert(initial.ok && Array.isArray(initial.data.socialLinks) && initial.data.socialLinks.length === 0, "default socialLinks []");
      const full = await updateBrandSettings(deps, founder, validPatch);
      assert(full.ok && full.data.acharyaName === "Acharya J P Sarmah", "persisted");
      assert(peek() !== null, "singleton stored");
      const partial = await updateBrandSettings(deps, founder, { professionalTitle: "Jyotish Acharya" });
      assert(partial.ok && partial.data.professionalTitle === "Jyotish Acharya", "title updated");
      assert(partial.ok && partial.data.whatsappNumber === "+919876543210" && partial.data.socialLinks.length === 1, "prior fields preserved");
    },
  },
  {
    name: "VALIDATION: email, urls, whatsapp, bounded text",
    run: async () => {
      const { deps } = makeDeps();
      assert((await updateBrandSettings(deps, founder, { supportEmail: "nope" })).status === 422, "bad email");
      assert((await updateBrandSettings(deps, founder, { whatsappNumber: "abc123" })).status === 422, "bad whatsapp");
      assert((await updateBrandSettings(deps, founder, { socialLinks: [{ platform: "x", url: "not-a-url" }] })).status === 422, "bad social url");
      assert((await updateBrandSettings(deps, founder, { biography: "x".repeat(5001) })).status === 422, "bio over limit");
      assert((await updateBrandSettings(deps, founder, { disclaimer: "x".repeat(2001) })).status === 422, "disclaimer over limit");
      assert((await updateBrandSettings(deps, founder, { socialLinks: Array.from({ length: 21 }, () => ({ platform: "p", url: "https://x.com" })) })).status === 422, "too many social links");
      assert((await updateBrandSettings(deps, founder, { supportEmail: "help@navagraha.com", whatsappNumber: "919876543210" })).ok, "valid variants ok");
    },
  },
  {
    name: "AUDIT: update audited with actor + safe metadata (no raw email/whatsapp)",
    run: async () => {
      const { deps, audits } = makeDeps();
      await updateBrandSettings(deps, founder, validPatch);
      assert(audits.length === 1, "one audit");
      const entry = audits[0]!;
      assert(entry.action === "brand.settings.update" && entry.actorUserId === "u-f" && entry.entityType === "brand_settings", "action/actor/target");
      const meta = entry.metadata as Record<string, unknown>;
      assert(meta.hasWhatsapp === true && meta.hasSupportEmail === true && meta.socialLinkCount === 1, "safe metadata");
      const blob = JSON.stringify(entry);
      assert(!blob.includes("+919876543210") && !blob.includes("help@navagrahacentre.com"), "no raw email/whatsapp in audit");
    },
  },
  {
    name: "NORMALIZATION: BrandSettings model has a single canonical config column",
    run: () => {
      const schema = readFileSync("prisma/schema.prisma", "utf8");
      const start = schema.indexOf("model BrandSettings {");
      assert(start >= 0, "model present");
      const block = schema.slice(start, schema.indexOf("}", start) + 1);
      assert(/\bsettingsJson\s+Json\?/.test(block), "settingsJson present");
      assert((block.match(/\bJson\?/g) ?? []).length === 1, "exactly one Json column");
      for (const col of ["brandName", "tagline", "logoAssetId", "contactEmail", "contactPhone", "defaultLocale", "socialLinksJson"]) {
        assert(!new RegExp(`\\b${col}\\b`).test(block), `placeholder column '${col}' removed`);
      }
    },
  },
];

async function main() {
  console.log("Admin Console C2B2 — Brand/profile settings QA (pure):");
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
  console.log(`\nadmin brand settings QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
