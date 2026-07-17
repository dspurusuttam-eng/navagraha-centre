/**
 * Claude Admin Console C2B1 — Consultation settings service/API QA (pure).
 * Covers authorization, validation, singleton get/merge, and audit. No DB/route.
 */
import {
  getConsultationSettings,
  updateConsultationSettings,
  type ConsultationActor,
  type ConsultationServiceDeps,
} from "@/modules/admin/consultation/service-core";
import type { ConsultationSettingsRepository } from "@/modules/admin/consultation/repository";
import type { ConsultationConfig } from "@/modules/admin/domain";
import type { AuditEntryInput } from "@/modules/admin/audit-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function makeDeps() {
  let value: ConsultationConfig | null = null;
  const audits: AuditEntryInput[] = [];
  const repo: ConsultationSettingsRepository = {
    async get() { return value; },
    async save(config) { value = config; return config; },
  };
  const deps: ConsultationServiceDeps = { repo, audit: async (input) => { audits.push(input); return { ok: true, id: `a${audits.length}` }; } };
  return { deps, audits, peek: () => value };
}

const founder: ConsultationActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: ConsultationActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: ConsultationActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

const validPatch = {
  availabilityStatus: "AVAILABLE",
  whatsappNumber: "+919876543210",
  prefilledMessage: "Namaste, I would like a consultation.",
  officeHours: "Mon–Sat, 10:00–18:00 IST",
  languages: ["en"], // C10A language lock — English-only
  topics: ["Career", "Marriage", "Remedies"],
  preparationInstructions: "Please share your birth details.",
  shortDescription: "Personal Vedic consultation.",
  disclaimer: "Guidance only; not a substitute for professional advice.",
};

type Group = { name: string; run: () => Promise<void> };
const groups: Group[] = [
  {
    name: "AUTH: support read-only; founder/editor write",
    run: async () => {
      const { deps } = makeDeps();
      const denied = await updateConsultationSettings(deps, support, validPatch);
      assert(!denied.ok && denied.status === 403, "support update → 403");
      const read = await getConsultationSettings(deps);
      assert(read.ok, "support/any admin read ok");
      const byEditor = await updateConsultationSettings(deps, editor, validPatch);
      assert(byEditor.ok, "editor update ok");
      const byFounder = await updateConsultationSettings(deps, founder, { availabilityStatus: "LIMITED" });
      assert(byFounder.ok, "founder update ok");
    },
  },
  {
    name: "SINGLETON: defaults when unset; persist; partial merge",
    run: async () => {
      const { deps, peek } = makeDeps();
      const initial = await getConsultationSettings(deps);
      assert(initial.ok && initial.data.availabilityStatus === "UNAVAILABLE" && initial.data.isEnabled === false, "defaults");
      assert(initial.ok && initial.data.languages.length === 1 && initial.data.languages[0] === "en", "default language en");
      const full = await updateConsultationSettings(deps, founder, validPatch);
      assert(full.ok && full.data.whatsappNumber === "+919876543210", "persisted whatsapp");
      assert(full.ok && full.data.isEnabled === false, "C10A: saving never publishes (isEnabled stays false)");
      assert(peek() !== null, "singleton stored");
      // partial patch keeps prior fields
      const partial = await updateConsultationSettings(deps, founder, { availabilityStatus: "LIMITED" });
      assert(partial.ok && partial.data.availabilityStatus === "LIMITED", "status updated");
      assert(partial.ok && partial.data.whatsappNumber === "+919876543210" && partial.data.topics.length === 3, "prior fields preserved");
      const reread = await getConsultationSettings(deps);
      assert(reread.ok && reread.data.availabilityStatus === "LIMITED", "reread persisted");
    },
  },
  {
    name: "VALIDATION: whatsapp, status, languages, bounded text",
    run: async () => {
      const { deps } = makeDeps();
      assert((await updateConsultationSettings(deps, founder, { whatsappNumber: "abc123" })).status === 422, "bad whatsapp");
      assert((await updateConsultationSettings(deps, founder, { whatsappNumber: "+91 98765" })).status === 422, "spaces rejected");
      assert((await updateConsultationSettings(deps, founder, { availabilityStatus: "MAYBE" })).status === 422, "bad status");
      assert((await updateConsultationSettings(deps, founder, { languages: ["fr"] })).status === 422, "unsupported language");
      assert((await updateConsultationSettings(deps, founder, { languages: ["as"] })).status === 422, "Assamese rejected (English-only lock)");
      assert((await updateConsultationSettings(deps, founder, { languages: ["hi"] })).status === 422, "Hindi rejected (English-only lock)");
      assert((await updateConsultationSettings(deps, founder, { languages: ["en", "en"] })).status === 422, "duplicate language");
      assert((await updateConsultationSettings(deps, founder, { languages: [] })).status === 422, "empty languages");
      assert((await updateConsultationSettings(deps, founder, { shortDescription: "x".repeat(501) })).status === 422, "short desc over limit");
      assert((await updateConsultationSettings(deps, founder, { disclaimer: "x".repeat(2001) })).status === 422, "disclaimer over limit");
      assert((await updateConsultationSettings(deps, founder, { topics: Array.from({ length: 31 }, (_, i) => `t${i}`) })).status === 422, "too many topics");
      // valid boundaries pass
      assert((await updateConsultationSettings(deps, founder, { whatsappNumber: "919876543210", availabilityStatus: "UNAVAILABLE", languages: ["en"] })).ok, "valid variants ok");
    },
  },
  {
    name: "AUDIT: update audited with actor + safe metadata (no raw whatsapp)",
    run: async () => {
      const { deps, audits } = makeDeps();
      await updateConsultationSettings(deps, founder, validPatch);
      assert(audits.length === 1, "one audit");
      const entry = audits[0]!;
      assert(entry.action === "consultation.settings.update" && entry.actorUserId === "u-f", "action + actor");
      assert(entry.entityType === "consultation_settings" && entry.entityId === "default", "target");
      const meta = entry.metadata as Record<string, unknown>;
      assert(meta.hasWhatsapp === true && meta.availabilityStatus === "AVAILABLE", "safe metadata");
      const blob = JSON.stringify(entry);
      assert(!blob.includes("+919876543210"), "raw WhatsApp number not in audit");
    },
  },
];

async function main() {
  console.log("Admin Console C2B1 — Consultation settings QA (pure):");
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
  console.log(`\nadmin consultation QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
