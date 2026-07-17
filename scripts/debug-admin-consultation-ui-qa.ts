/**
 * Claude Admin Console C5A — Consultation settings admin UI QA.
 * Pure form mapping (config ↔ form values ↔ PATCH payload), service-level validation and
 * authorization over an in-memory singleton repo, and static UI/page/action wiring checks.
 */
import { readFileSync } from "node:fs";
import {
  CONSULTATION_FORM_FIELDS,
  consultationToFormValues,
  formDataToConsultationPatch,
  parseTopics,
  formatTopics,
} from "@/modules/admin/consultation/consultation-form-config";
import {
  getConsultationSettings,
  updateConsultationSettings,
  type ConsultationActor,
  type ConsultationServiceDeps,
} from "@/modules/admin/consultation/service-core";
import { defaultConsultationConfig, type ConsultationConfig } from "@/modules/admin/domain";
import type { ConsultationSettingsRepository } from "@/modules/admin/consultation/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

function makeRepo(seed?: ConsultationConfig): ConsultationSettingsRepository & { current: ConsultationConfig | null } {
  const store: { current: ConsultationConfig | null } = { current: seed ?? null };
  return {
    get current() { return store.current; },
    async get() { return store.current; },
    async save(config) { store.current = config; return config; },
  };
}
const founder: ConsultationActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: ConsultationActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: ConsultationActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

function makeDeps(seed?: ConsultationConfig) {
  const audits: Array<{ action: string; metadata?: unknown }> = [];
  const repo = makeRepo(seed);
  const deps: ConsultationServiceDeps = {
    repo,
    audit: async (input) => { audits.push({ action: input.action, metadata: input.metadata }); return { ok: true, id: "a1" }; },
  };
  return { deps, audits, repo };
}

/** A complete, valid patch as the form would submit it. */
const validPatch = (over: Record<string, unknown> = {}) => ({
  availabilityStatus: "AVAILABLE",
  whatsappNumber: "+919876543210",
  prefilledMessage: "Namaste, I would like a consultation.",
  officeHours: "Mon–Sat, 10:00–18:00 IST",
  languages: ["en"], // C10A language lock — English-only
  topics: ["Career", "Marriage"],
  preparationInstructions: "Share your birth details.",
  shortDescription: "One-to-one guidance over WhatsApp.",
  disclaimer: "Guidance is advisory only.",
  ...over,
});

/** Build a FormData exactly as the rendered form would. */
function settingsForm(over: Record<string, string | string[]> = {}): FormData {
  const fd = new FormData();
  const base: Record<string, string | string[]> = {
    availabilityStatus: "AVAILABLE",
    whatsappNumber: "+919876543210",
    prefilledMessage: "Namaste",
    officeHours: "Mon–Sat 10–6",
    languages: ["en"],
    topics: "Career\nMarriage\n",
    preparationInstructions: "Bring birth details.",
    shortDescription: "WhatsApp guidance.",
    disclaimer: "Advisory only.",
  };
  for (const [key, value] of Object.entries({ ...base, ...over })) {
    if (Array.isArray(value)) for (const v of value) fd.append(key, v);
    else fd.set(key, value);
  }
  return fd;
}

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "F1 field config + consultationToFormValues (nulls → \"\", topics → lines)",
    run: () => {
      for (const field of ["availabilityStatus", "whatsappNumber", "prefilledMessage", "officeHours", "languages", "topics", "preparationInstructions", "shortDescription", "disclaimer", "generalEnquiryTemplate", "selectedConsultationTemplate"]) {
        assert((CONSULTATION_FORM_FIELDS as readonly string[]).includes(field), `field ${field}`);
      }
      assert(CONSULTATION_FORM_FIELDS.length === 11, "11 form fields (incl. two English message templates)");
      const values = consultationToFormValues(defaultConsultationConfig());
      assert(values.whatsappNumber === "" && values.prefilledMessage === "" && values.disclaimer === "", "nulls → empty strings");
      assert(values.availabilityStatus === "UNAVAILABLE" && values.languages.join() === "en", "defaults surfaced");
      assert(values.topics === "", "empty topics → empty textarea");
      const seeded = consultationToFormValues({ ...defaultConsultationConfig(), topics: ["A", "B"], languages: ["en"], whatsappNumber: "+911234567890" });
      assert(seeded.topics === "A\nB", "topics → newline separated");
      assert(seeded.languages.join(",") === "en", "languages preserved");
      assert(seeded.whatsappNumber === "+911234567890", "number surfaced");
    },
  },
  {
    name: "F2 parseTopics / formatTopics: trim, drop blanks, CRLF, round-trip",
    run: () => {
      assert(JSON.stringify(parseTopics("  Career \n\n Marriage \n")) === JSON.stringify(["Career", "Marriage"]), "trim + drop blanks");
      assert(JSON.stringify(parseTopics("A\r\nB")) === JSON.stringify(["A", "B"]), "CRLF handled");
      assert(parseTopics("").length === 0 && parseTopics("   \n  ").length === 0, "blank → empty list");
      assert(formatTopics(["A", "B"]) === "A\nB", "format joins lines");
      assert(JSON.stringify(parseTopics(formatTopics(["X", "Y"]))) === JSON.stringify(["X", "Y"]), "round-trip");
    },
  },
  {
    name: "F3 formDataToConsultationPatch: all fields, empty → null, arrays, no isEnabled",
    run: () => {
      const patch = formDataToConsultationPatch(settingsForm());
      assert(patch.availabilityStatus === "AVAILABLE", "availability");
      assert(patch.whatsappNumber === "+919876543210", "whatsapp");
      assert(JSON.stringify(patch.languages) === JSON.stringify(["en"]), "languages from getAll");
      assert(JSON.stringify(patch.topics) === JSON.stringify(["Career", "Marriage"]), "topics parsed");
      assert(patch.preparationInstructions === "Bring birth details." && patch.disclaimer === "Advisory only.", "text fields");
      // Empty optional text clears to null.
      const cleared = formDataToConsultationPatch(settingsForm({ whatsappNumber: "", prefilledMessage: "  ", officeHours: "", disclaimer: "" }));
      assert(cleared.whatsappNumber === null && cleared.prefilledMessage === null && cleared.officeHours === null && cleared.disclaimer === null, "empty → null");
      // Unchecking every language yields an empty array (validated server-side).
      const noLangs = formDataToConsultationPatch(settingsForm({ languages: [] }));
      assert(Array.isArray(noLangs.languages) && (noLangs.languages as string[]).length === 0, "no languages → []");
      // isEnabled is never sent by this form (preserved by the service merge).
      assert(!("isEnabled" in patch), "patch omits isEnabled");
    },
  },
  {
    name: "V1 service: valid save persists; isEnabled hard-locked false (C10A: saving never publishes)",
    run: async () => {
      // Even a seeded-enabled config is locked back to false on save — publication is deferred.
      const seeded: ConsultationConfig = { ...defaultConsultationConfig(), isEnabled: true };
      const { deps, repo, audits } = makeDeps(seeded);
      const result = await updateConsultationSettings(deps, founder, validPatch());
      assert(result.ok, "valid patch saved");
      if (!result.ok) return;
      assert(result.data.availabilityStatus === "AVAILABLE" && result.data.whatsappNumber === "+919876543210", "values stored");
      assert(JSON.stringify(result.data.topics) === JSON.stringify(["Career", "Marriage"]), "topics stored");
      assert(result.data.isEnabled === false, "C10A: saving never publishes — isEnabled hard-locked to false");
      assert(repo.current?.disclaimer === "Guidance is advisory only.", "persisted to repo");
      assert(audits.some((a) => a.action === "consultation.settings.update"), "audited");
      const readBack = await getConsultationSettings(deps);
      assert(readBack.ok && readBack.data.shortDescription === "One-to-one guidance over WhatsApp.", "read back");
    },
  },
  {
    name: "V2 service: validation errors carry field paths (whatsapp, languages, topics, lengths)",
    run: async () => {
      const { deps } = makeDeps();
      const firstPath = (issues: unknown) => (issues as Array<{ path?: (string | number)[] }>)[0]?.path?.[0];

      const badNumber = await updateConsultationSettings(deps, founder, validPatch({ whatsappNumber: "12-34 abc" }));
      assert(!badNumber.ok && badNumber.status === 422 && firstPath(badNumber.issues) === "whatsappNumber", "bad whatsapp → 422 on whatsappNumber");

      const noLangs = await updateConsultationSettings(deps, founder, validPatch({ languages: [] }));
      assert(!noLangs.ok && noLangs.status === 422 && firstPath(noLangs.issues) === "languages", "no languages → 422 on languages");

      const dupLangs = await updateConsultationSettings(deps, founder, validPatch({ languages: ["en", "en"] }));
      assert(!dupLangs.ok && dupLangs.status === 422, "duplicate languages rejected");

      const badLocale = await updateConsultationSettings(deps, founder, validPatch({ languages: ["fr"] }));
      assert(!badLocale.ok && badLocale.status === 422, "unsupported locale rejected");

      const tooManyTopics = await updateConsultationSettings(deps, founder, validPatch({ topics: Array.from({ length: 31 }, (_, i) => `T${i}`) }));
      assert(!tooManyTopics.ok && tooManyTopics.status === 422 && firstPath(tooManyTopics.issues) === "topics", "31 topics → 422 on topics");

      const longDisclaimer = await updateConsultationSettings(deps, founder, validPatch({ disclaimer: "x".repeat(2001) }));
      assert(!longDisclaimer.ok && longDisclaimer.status === 422, "over-max disclaimer rejected");

      const longShort = await updateConsultationSettings(deps, founder, validPatch({ shortDescription: "x".repeat(501) }));
      assert(!longShort.ok && longShort.status === 422, "over-max short description rejected");

      const badStatus = await updateConsultationSettings(deps, founder, validPatch({ availabilityStatus: "MAYBE" }));
      assert(!badStatus.ok && badStatus.status === 422, "unknown availability rejected");
    },
  },
  {
    name: "A1 authorization: founder/editor write; support → 403; support may read",
    run: async () => {
      const { deps } = makeDeps();
      assert((await updateConsultationSettings(deps, founder, validPatch())).ok, "founder writes");
      assert((await updateConsultationSettings(deps, editor, validPatch({ availabilityStatus: "LIMITED" }))).ok, "editor writes");
      const denied = await updateConsultationSettings(deps, support, validPatch());
      assert(!denied.ok && denied.status === 403 && denied.code === "FORBIDDEN", "support write → 403");
      const read = await getConsultationSettings(deps);
      assert(read.ok, "support-visible read still works");
    },
  },
  {
    name: "U1 static form: 9 labelled fields, states, read-only, a11y, touch targets",
    run: () => {
      const src = read("src/modules/admin/consultation/consultation-settings-form.tsx");
      for (const id of ["availabilityStatus", "whatsappNumber", "prefilledMessage", "officeHours", "topics", "preparationInstructions", "shortDescription", "disclaimer"]) {
        assert(src.includes(`htmlFor="${id}"`) && src.includes(`id="${id}"`), `label+control for ${id}`);
      }
      assert(src.includes("<fieldset") && src.includes("<legend") && src.includes('name="languages"'), "languages fieldset/legend group");
      assert(src.includes('role="alert"') && src.includes('role="status"'), "failure + success roles");
      assert(src.includes("Saving…") && src.includes("Save settings") && src.includes("Retry"), "save/saving/retry states");
      assert(src.includes("aria-invalid") && src.includes("aria-describedby"), "field error a11y");
      assert(src.includes("disabled={!canWrite}") && src.includes("read-only access"), "read-only rendering");
      assert(src.includes("min-h-11"), "touch targets");
      assert(src.includes("max-w-2xl") && !src.includes("overflow-x"), "single-column mobile layout");
    },
  },
  {
    name: "U2 static page: placeholder replaced, noindex, service + role wired",
    run: () => {
      const src = read("src/app/(admin)/admin/consultation/page.tsx");
      assert(!src.includes("AdminPlaceholder"), "placeholder removed");
      assert(src.includes("index: false") && src.includes('dynamic = "force-dynamic"'), "noindex + dynamic");
      assert(src.includes("getConsultationSettings") && src.includes("getConsultationDeps"), "reads via existing service");
      assert(src.includes("hasAdminAccess") && src.includes("canWrite"), "role gate wired");
      assert(src.includes("ConsultationSettingsForm") && src.includes("updateConsultationAction"), "form + action wired");
      assert(src.includes("temporarily unavailable"), "unavailable fallback");
      // No public consultation integration from the admin page.
      assert(!/@\/modules\/(content|site|marketing|conversion)\b/.test(src), "no public module import");
    },
  },
  {
    name: "U3 static action: existing service, session actor, revalidate, field errors",
    run: () => {
      const src = read("src/modules/admin/consultation/consultation-actions.ts");
      assert(src.includes('"use server"'), "server action module");
      assert(src.includes("updateConsultationSettings") && src.includes("getConsultationDeps"), "uses existing consultation service");
      assert(src.includes("getAdminPageSessionOrNull") && src.includes("adminRoles"), "session actor with roles");
      assert(src.includes("formDataToConsultationPatch"), "maps form → patch");
      assert(src.includes("VALIDATION_ERROR") && src.includes("fieldErrors"), "validation issues → field errors");
      assert(src.includes('revalidatePath("/admin/consultation")'), "revalidates the page");
    },
  },
];

async function main() {
  console.log("Admin Console C5A — Consultation settings admin UI QA:");
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
  console.log(`\nadmin consultation UI QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
