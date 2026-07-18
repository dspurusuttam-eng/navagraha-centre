/**
 * Claude C8D1 — Consultation activation + public details UI QA.
 * Drives the REAL consultation service against an in-memory repo (activation), the pure
 * public projection (status / WhatsApp / privacy), and static checks on the extended
 * /consultation page (empty states, accessibility, no Admin-only leakage).
 * No database, no migration, no import.
 */
import { readFileSync } from "node:fs";
import {
  getConsultationSettings,
  updateConsultationSettings,
  type ConsultationActor,
  type ConsultationServiceDeps,
} from "@/modules/admin/consultation/service-core";
import {
  availabilityBadgeStatus,
  availabilityNote,
  showsWhatsappCta,
  toPublicConsultation,
  STATIC_CONSULTATION_FALLBACK,
} from "@/modules/site-settings/public-settings-core";
import { defaultConsultationConfig, type ConsultationConfig } from "@/modules/admin/domain";
import type { ConsultationSettingsRepository } from "@/modules/admin/consultation/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const founder: ConsultationActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: ConsultationActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: ConsultationActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

function makeDeps(seed?: ConsultationConfig) {
  const store: { current: ConsultationConfig | null } = { current: seed ?? null };
  const repo: ConsultationSettingsRepository = {
    async get() { return store.current; },
    async save(config) { store.current = config; return config; },
  };
  const deps: ConsultationServiceDeps = { repo, audit: async () => ({ ok: true, id: "a" }) };
  // Exposed as a function: `asserts` narrowing would otherwise pin `store.current` to null
  // for the rest of a test after the first "nothing stored yet" assertion.
  const stored = (): ConsultationConfig | null => store.current;
  return { deps, stored };
}

/** A valid patch exactly as the Admin form submits it (never carries isEnabled). */
const formPatch = (over: Record<string, unknown> = {}) => ({
  availabilityStatus: "AVAILABLE",
  whatsappNumber: "+919876543210",
  prefilledMessage: "Namaste",
  officeHours: "Mon-Sat 10-6",
  languages: ["en"], // C10A language lock — English-only
  topics: ["Career"],
  preparationInstructions: "Share birth details.",
  shortDescription: "One-to-one guidance.",
  disclaimer: "Advisory only.",
  ...over,
});

const PAGE = () => read("src/app/(marketing)/consultation/page.tsx");

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "A1 publication deferred: saving NEVER publishes — isEnabled stays false across saves",
    run: async () => {
      const { deps, stored } = makeDeps();
      assert(defaultConsultationConfig().isEnabled === false, "Admin default is unpublished");
      assert(stored() === null, "nothing stored yet");

      const first = await updateConsultationSettings(deps, founder, formPatch());
      assert(first.ok, "first save accepted");
      assert(first.ok && first.data.isEnabled === false, "C10A: first save does NOT publish");
      assert(stored()?.isEnabled === false, "stored config remains unpublished");

      // Later saves still never publish, and still apply their configuration change.
      const second = await updateConsultationSettings(deps, editor, formPatch({ availabilityStatus: "LIMITED" }));
      assert(second.ok && second.data.isEnabled === false, "later save still unpublished");
      assert(second.ok && second.data.availabilityStatus === "LIMITED", "later save applied its change");

      // Even a config that was somehow already enabled is hard-locked back to false on save.
      const { deps: d3, stored: s3 } = makeDeps({ ...defaultConsultationConfig(), isEnabled: true });
      const third = await updateConsultationSettings(d3, founder, formPatch());
      assert(third.ok && third.data.isEnabled === false, "save hard-locks isEnabled to false");
      assert(s3()?.isEnabled === false, "previously-enabled config is not left published");
    },
  },
  {
    name: "A2 authorization: only founder/editor may save; a rejected save stores nothing",
    run: async () => {
      // A rejected (invalid) save must not persist anything.
      const { deps, stored } = makeDeps();
      const invalid = await updateConsultationSettings(deps, founder, formPatch({ whatsappNumber: "12 34 abc" }));
      assert(!invalid.ok && invalid.status === 422, "invalid save rejected");
      assert(stored() === null, "nothing stored on a failed save");

      // Support cannot save.
      const denied = await updateConsultationSettings(deps, support, formPatch());
      assert(!denied.ok && denied.status === 403, "support save → 403");
      assert(stored() === null, "still nothing stored");

      // Founder/editor can save (but the save still never publishes).
      const ok = await updateConsultationSettings(deps, editor, formPatch());
      assert(ok.ok && stored()?.isEnabled === false, "valid save persists, unpublished");
      assert((await getConsultationSettings(deps)).ok, "read still works");
    },
  },
  {
    name: "A3 no activation path: no isEnabled toggle is exposed and the service never publishes",
    run: () => {
      // The Admin form never renders or submits the flag.
      const form = read("src/modules/admin/consultation/consultation-settings-form.tsx");
      assert(!form.includes("isEnabled"), "Admin form exposes no isEnabled toggle");
      const config = read("src/modules/admin/consultation/consultation-form-config.ts");
      assert(!/name="isEnabled"/.test(config), "no isEnabled form control");
      assert(!/isEnabled/.test(config.split("formDataToConsultationPatch")[1] ?? ""), "form patch never carries isEnabled");
      // C10A: the service hard-locks isEnabled to false and never activates.
      const svc = read("src/modules/admin/consultation/service-core.ts");
      assert(svc.includes("isEnabled: false"), "service hard-locks isEnabled to false");
      assert(!/isEnabled:\s*true/.test(svc), "service never sets isEnabled=true (no activation path)");
      // The public surface never references the flag.
      assert(!PAGE().includes("isEnabled"), "public page never references isEnabled");
    },
  },
  {
    name: "S1 status: AVAILABLE / LIMITED / UNAVAILABLE each have controlled UI",
    run: () => {
      assert(availabilityBadgeStatus("AVAILABLE") === "LIVE", "available → LIVE tone");
      assert(availabilityBadgeStatus("LIMITED") === "COMING_SOON", "limited → accent tone");
      assert(availabilityBadgeStatus("UNAVAILABLE") === "NEUTRAL", "unavailable → neutral tone");
      assert(availabilityBadgeStatus("BOGUS") === "NEUTRAL", "unknown → neutral (safe default)");
      for (const status of ["AVAILABLE", "LIMITED", "UNAVAILABLE"]) {
        const note = availabilityNote(status);
        assert(note.length > 0 && !note.includes(status), `${status} has human copy, not the raw enum`);
      }
      assert(availabilityNote("AVAILABLE") !== availabilityNote("LIMITED"), "each state reads differently");
      assert(availabilityNote("UNAVAILABLE").toLowerCase().includes("closed"), "off-state is explicit");
      // The page renders the badge + note from the helpers, never a raw enum.
      const page = PAGE();
      assert(page.includes("availabilityBadgeStatus(consultation.availability)"), "badge tone from the helper");
      assert(page.includes("availabilityNote(consultation.availability)"), "note from the helper");
      assert(page.includes("{consultation.availabilityLabel}"), "human label rendered");
      assert(!page.includes('"AVAILABLE"') && !page.includes('"UNAVAILABLE"'), "no raw enum literal in the page");
    },
  },
  {
    name: "S2 status: UNAVAILABLE is the operational off-state — no live CTA",
    run: () => {
      const url = "https://wa.me/919876543210";
      assert(showsWhatsappCta("AVAILABLE", url), "available → CTA shown");
      assert(showsWhatsappCta("LIMITED", url), "limited → CTA shown");
      assert(!showsWhatsappCta("UNAVAILABLE", url), "UNAVAILABLE hides the CTA even with a number configured");
      assert(!showsWhatsappCta("AVAILABLE", null), "no number → no CTA");
      assert(!showsWhatsappCta("UNAVAILABLE", null), "neither → no CTA");
      assert(PAGE().includes("showsWhatsappCta(consultation.availability, consultation.whatsappUrl)"), "page gates the CTA through the helper");
    },
  },
  {
    name: "W1 WhatsApp CTA: secure external link, no API/booking/payment",
    run: () => {
      const page = PAGE();
      assert(page.includes('rel="noopener noreferrer nofollow"'), "noopener + noreferrer + nofollow");
      assert(page.includes('target="_blank"'), "opens in a new tab");
      assert(page.includes("{consultation.whatsappUrl as string}"), "href comes from the settings-derived URL");
      assert(!page.includes("wa.me"), "no hardcoded WhatsApp link in the page");
      // No booking / payment / CRM / WhatsApp API anywhere on the surface.
      const code = page.split("\n").filter((l) => { const t = l.trim(); return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*") && !t.startsWith("{/*"); }).join("\n");
      assert(!/graph\.facebook|whatsapp.*api|razorpay|stripe|\bcrm\b|fetch\(/i.test(code), "no API/payment/CRM call");
      // The link is only ever an https wa.me URL built by the validated helper.
      const projected = toPublicConsultation({ ...defaultConsultationConfig(), isEnabled: true, whatsappNumber: "+919876543210", prefilledMessage: "Hi" });
      assert(projected.whatsappUrl!.startsWith("https://wa.me/"), "https wa.me only");
    },
  },
  {
    name: "E1 empty states: every optional section is hidden cleanly when unset",
    run: () => {
      const page = PAGE();
      // Each optional section is guarded by its own truthiness/length check.
      assert(page.includes("{consultation.shortDescription ? ("), "description hidden when unset");
      assert(page.includes("{consultation.languages.length ? ("), "languages hidden when empty");
      assert(page.includes("{consultation.topics.length ? ("), "topics hidden when empty");
      assert(page.includes("{consultation.preparationInstructions ? ("), "preparation hidden when unset");
      assert(page.includes("{consultation.disclaimer ? ("), "disclaimer hidden when unset");
      // A fully-empty published config renders no optional section at all.
      const bare = toPublicConsultation({ ...defaultConsultationConfig(), isEnabled: true, availabilityStatus: "AVAILABLE" });
      assert(bare.shortDescription === null && bare.preparationInstructions === null && bare.disclaimer === null, "blank → null");
      assert(bare.topics.length === 0 && bare.whatsappUrl === null, "no topics, no CTA");
      assert(!showsWhatsappCta(bare.availability, bare.whatsappUrl), "no CTA without a number");
      // Blank strings never render as empty sections.
      const blank = toPublicConsultation({ ...defaultConsultationConfig(), isEnabled: true, shortDescription: "   ", disclaimer: "" });
      assert(blank.shortDescription === null && blank.disclaimer === null, "whitespace-only → null, section hidden");
    },
  },
  {
    name: "F1 fallback: static surface before the first valid save and during DB failure",
    run: async () => {
      // Before any save: settings are absent → static fallback, no CTA, no sections.
      const fallback = toPublicConsultation(null);
      assert(fallback === STATIC_CONSULTATION_FALLBACK, "absent → static fallback");
      assert(fallback.fromSettings === false && fallback.whatsappUrl === null, "fallback exposes nothing");
      assert(!showsWhatsappCta(fallback.availability, fallback.whatsappUrl), "fallback shows no CTA");
      assert(fallback.availability === "UNAVAILABLE", "fallback is the safe off-state");
      // An unpublished config still falls back (belt and braces with activation).
      assert(toPublicConsultation({ ...defaultConsultationConfig(), isEnabled: false, topics: ["secret"] }) === STATIC_CONSULTATION_FALLBACK, "unpublished → fallback, nothing leaks");
      // DB failure is handled by the adapter (server-only): assert the wiring.
      const adapter = read("src/modules/site-settings/public-settings.ts");
      assert(adapter.includes("safeSettingsRead"), "adapter read is failure-safe");
      assert(adapter.includes("STATIC_CONSULTATION_FALLBACK"), "adapter falls back to the static surface");
    },
  },
  {
    name: "P1 privacy: no raw settings document or Admin-only field reaches the page",
    run: () => {
      const page = PAGE();
      for (const forbidden of ["settingsJson", "isEnabled", "updatedById", "singletonKey", "whatsappNumber", "prefilledMessage"]) {
        assert(!page.includes(forbidden), `page never references ${forbidden}`);
      }
      // Only the allow-listed projection is rendered.
      const projected = toPublicConsultation({ ...defaultConsultationConfig(), isEnabled: true, whatsappNumber: "+919876543210", prefilledMessage: "secret message" });
      const json = JSON.stringify(projected);
      assert(!json.includes("+919876543210"), "raw number never in the public payload");
      assert(!("isEnabled" in projected), "flag absent from the public shape");
      // The page renders fields, never the whole object.
      assert(!page.includes("JSON.stringify(consultation)"), "the settings object is never serialised onto the page");
    },
  },
  {
    name: "X1 accessibility + design system: existing route, components and semantics",
    run: () => {
      const page = PAGE();
      // Route + design system unchanged: same shell and primitives, no bespoke markup.
      assert(page.includes("PremiumPageShell") && page.includes("PremiumBentoSection") && page.includes("PremiumSectionHeading"), "existing design system reused");
      assert(page.includes("PremiumStatusBadge") && page.includes("buttonStyles("), "existing badge + button styles");
      assert(page.includes("consultationPackages"), "existing package grid preserved");
      assert(page.includes('label="Acharya"') && page.includes('label="Availability"'), "existing sections preserved");
      // Accessibility: labelled lists for the badge groups, real list semantics.
      assert(page.includes('aria-label="Consultation languages"'), "languages list is labelled");
      assert(page.includes('aria-label="Consultation topics"'), "topics list is labelled");
      assert((page.match(/<ul /g) ?? []).length >= 2 && page.includes("<li key="), "badge groups use list semantics");
      // Multi-line copy keeps its formatting rather than collapsing.
      assert(page.includes("whitespace-pre-wrap"), "preparation/disclaimer preserve line breaks");
      assert(page.includes('aria-label="Breadcrumb"'), "existing breadcrumb landmark intact");
    },
  },
];

async function main() {
  console.log("Claude C8D1 — Consultation activation + public details UI QA:");
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
  console.log(`\nconsultation activation QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
