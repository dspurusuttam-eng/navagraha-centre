/**
 * Claude C8D — public Consultation + Brand settings cutover QA.
 * Deterministic policy tests over the pure projection (WhatsApp URL, availability,
 * fallback, privacy, DB-failure) plus static wiring checks on the server-only adapters,
 * the two public surfaces and the untouched Codex files. No database, no import.
 */
import { readFileSync } from "node:fs";
import {
  PUBLIC_SETTINGS_LOCALES,
  STATIC_BRAND_FALLBACK,
  STATIC_CONSULTATION_FALLBACK,
  availabilityLabel,
  buildWhatsappUrl,
  isPublicSettingsLocale,
  safeSettingsRead,
  toPublicBrand,
  toPublicConsultation,
} from "@/modules/site-settings/public-settings-core";
import { buildSettingsImportPlan } from "./debug-settings-import-plan";
import { defaultConsultationConfig, defaultBrandSettings, type ConsultationConfig, type BrandSettingsInput } from "@/modules/admin/domain";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const consultation = (over: Partial<ConsultationConfig> = {}): ConsultationConfig => ({
  ...defaultConsultationConfig(),
  isEnabled: true,
  availabilityStatus: "AVAILABLE",
  whatsappNumber: "+919876543210",
  prefilledMessage: "Namaste, I would like a consultation.",
  officeHours: "Mon-Sat, 10:00-18:00 IST",
  languages: ["en", "as"],
  topics: ["Career", "Marriage"],
  preparationInstructions: "Share your birth details.",
  shortDescription: "One-to-one guidance.",
  disclaimer: "Advisory only.",
  ...over,
});

const brand = (over: Partial<BrandSettingsInput> = {}): BrandSettingsInput => ({
  ...defaultBrandSettings(),
  // C8E: brand settings now publish on an editor's first save; an unpublished config
  // correctly projects to the static fallback, so these fixtures are published.
  isEnabled: true,
  acharyaName: "Acharya Purusuttam",
  professionalTitle: "Vedic Astrologer",
  profileImageAssetId: "media_abc",
  biography: "Two decades of practice.",
  supportEmail: "support@navagraha.example",
  officeHours: "Mon-Sat 10-6",
  whatsappNumber: "+919876543210",
  socialLinks: [{ platform: "YouTube", url: "https://youtube.com/@n" }],
  footer: { addressLine: "Guwahati", copyright: "(c) NC", note: "Guidance only." },
  disclaimer: "Advisory only.",
  ...over,
});

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "W1 WhatsApp URL: valid numbers build a wa.me link with an encoded message",
    run: () => {
      assert(buildWhatsappUrl("+919876543210") === "https://wa.me/919876543210", "plus stripped, no message");
      assert(buildWhatsappUrl("919876543210") === "https://wa.me/919876543210", "bare number");
      const withText = buildWhatsappUrl("+919876543210", "Namaste, I would like a consultation.");
      assert(withText === "https://wa.me/919876543210?text=Namaste%2C%20I%20would%20like%20a%20consultation.", `encoded message, got ${withText}`);
      // Message text is URL-encoded, so it cannot break out of the link.
      const injected = buildWhatsappUrl("+919876543210", 'x"&y=<script>');
      assert(injected!.includes("%3Cscript%3E") && !injected!.includes("<script>"), "message is encoded, not injected");
      assert(!injected!.includes('"'), "quotes encoded");
    },
  },
  {
    name: "W2 WhatsApp URL: unusable numbers yield null (never a broken link)",
    run: () => {
      for (const bad of ["", "   ", null, undefined, "12 34 abc", "+0123456789", "123", "+".padEnd(20, "9"), "abcdefghij"]) {
        assert(buildWhatsappUrl(bad as string) === null, `${JSON.stringify(bad)} -> null`);
      }
      // A config with a bad number still renders the surface, just without a link.
      const projected = toPublicConsultation(consultation({ whatsappNumber: "nonsense" }));
      assert(projected.whatsappUrl === null, "bad number -> no link");
      assert(projected.fromSettings === true, "the rest of the settings still apply");
      // Trimming
      assert(buildWhatsappUrl("  +919876543210  ") === "https://wa.me/919876543210", "trimmed");
    },
  },
  {
    name: "A1 availability: enum projected to a human label; unknown falls back safely",
    run: () => {
      assert(availabilityLabel("AVAILABLE") === "Accepting consultations", "available label");
      assert(availabilityLabel("LIMITED") === "Limited availability", "limited label");
      assert(availabilityLabel("UNAVAILABLE") === "By request", "unavailable label");
      assert(availabilityLabel("BOGUS") === STATIC_CONSULTATION_FALLBACK.availabilityLabel, "unknown -> fallback label");
      for (const status of ["AVAILABLE", "LIMITED", "UNAVAILABLE"] as const) {
        const p = toPublicConsultation(consultation({ availabilityStatus: status }));
        assert(p.availability === status && p.availabilityLabel === availabilityLabel(status), `${status} projected`);
      }
      // An unrecognised stored value degrades to UNAVAILABLE rather than leaking the raw value.
      const odd = toPublicConsultation(consultation({ availabilityStatus: "MAYBE" as never }));
      assert(odd.availability === "UNAVAILABLE", "unknown status -> UNAVAILABLE");
    },
  },
  {
    name: "P1 privacy: Admin-only fields and raw settings JSON are NEVER exposed",
    run: () => {
      const projected = toPublicConsultation(consultation());
      const keys = Object.keys(projected);
      // The master switch is Admin-only.
      assert(!keys.includes("isEnabled"), "isEnabled is NOT in the public shape");
      assert(!("isEnabled" in projected), "isEnabled absent");
      // No raw envelope / internal reference fields.
      for (const forbidden of ["settingsJson", "updatedById", "singletonKey", "id", "createdAt", "updatedAt", "whatsappNumber", "prefilledMessage"]) {
        assert(!keys.includes(forbidden), `consultation public shape has no ${forbidden}`);
      }
      // The raw number is not published — only the derived link.
      const json = JSON.stringify(projected);
      assert(!json.includes("+919876543210"), "raw WhatsApp number not published verbatim");
      assert(projected.whatsappUrl === "https://wa.me/919876543210?text=Namaste%2C%20I%20would%20like%20a%20consultation.", "only the derived link");

      const b = toPublicBrand(brand(), "https://cdn.example.com/p.webp");
      const bKeys = Object.keys(b);
      for (const forbidden of ["profileImageAssetId", "settingsJson", "updatedById", "singletonKey", "whatsappNumber"]) {
        assert(!bKeys.includes(forbidden), `brand public shape has no ${forbidden}`);
      }
      // The media REFERENCE id is internal; only the resolved URL is published.
      assert(!JSON.stringify(b).includes("media_abc"), "profile asset id not published");
      assert(b.profileImageUrl === "https://cdn.example.com/p.webp", "resolved URL published");
      // Only https social links survive.
      const insecure = toPublicBrand(brand({ socialLinks: [{ platform: "X", url: "http://x.example" }] }));
      assert(insecure.socialLinks.length === 0, "non-https social link dropped");
    },
  },
  {
    name: "P2 privacy: only public locales are exposed",
    run: () => {
      assert(JSON.stringify(PUBLIC_SETTINGS_LOCALES) === JSON.stringify(["en", "as", "hi"]), "en/as/hi");
      assert(isPublicSettingsLocale("as") && !isPublicSettingsLocale("bn") && !isPublicSettingsLocale("fr"), "locale gate");
      const p = toPublicConsultation(consultation({ languages: ["en", "as", "hi"] }));
      assert(JSON.stringify(p.languages) === JSON.stringify(["en", "as", "hi"]), "all three public locales pass");
      // A non-public locale stored by Admin is filtered out of the public projection.
      const filtered = toPublicConsultation(consultation({ languages: ["en", "bn" as never] }));
      assert(JSON.stringify(filtered.languages) === JSON.stringify(["en"]), "bn filtered from the public list");
    },
  },
  {
    name: "F1 fallback: absent / unpublished settings yield the controlled static surface",
    run: () => {
      // Absent settings.
      assert(toPublicConsultation(null) === STATIC_CONSULTATION_FALLBACK, "null consultation -> static fallback");
      assert(toPublicConsultation(undefined) === STATIC_CONSULTATION_FALLBACK, "undefined -> static fallback");
      assert(toPublicBrand(null) === STATIC_BRAND_FALLBACK, "null brand -> static fallback");
      // Unpublished (isEnabled false) is the Admin default — the cutover changes nothing
      // publicly until an editor deliberately enables it.
      assert(defaultConsultationConfig().isEnabled === false, "Admin default is disabled");
      const disabled = toPublicConsultation(consultation({ isEnabled: false }));
      assert(disabled === STATIC_CONSULTATION_FALLBACK, "disabled settings -> static fallback");
      assert(disabled.fromSettings === false, "fallback is marked as not-from-settings");
      assert(disabled.whatsappUrl === null && disabled.topics.length === 0, "no configured data leaks while disabled");
      // Enabled settings are used.
      assert(toPublicConsultation(consultation()).fromSettings === true, "enabled -> from settings");
      // The fallback mirrors the existing public copy.
      assert(STATIC_BRAND_FALLBACK.acharyaName === "Joy Prakash Sarmah", "brand fallback preserves the existing name");
      assert(STATIC_CONSULTATION_FALLBACK.availabilityLabel === "By request", "consultation fallback is conservative");
    },
  },
  {
    name: "F2 fallback: partial/blank Admin values degrade field-by-field",
    run: () => {
      const sparse = toPublicConsultation(consultation({
        officeHours: "   ", shortDescription: null, disclaimer: "", preparationInstructions: null, topics: [],
      }));
      assert(sparse.officeHours === null && sparse.shortDescription === null && sparse.disclaimer === null, "blank -> null (not empty strings)");
      assert(sparse.topics.length === 0 && sparse.fromSettings === true, "still from settings");
      const sparseBrand = toPublicBrand(brand({ acharyaName: null, professionalTitle: "  ", biography: null }));
      assert(sparseBrand.acharyaName === STATIC_BRAND_FALLBACK.acharyaName, "blank name falls back to the static name");
      assert(sparseBrand.professionalTitle === STATIC_BRAND_FALLBACK.professionalTitle, "blank title falls back");
      assert(sparseBrand.biography === null, "absent biography -> null");
      // A missing/deleted profile image yields no image rather than a broken reference.
      assert(toPublicBrand(brand(), null).profileImageUrl === null, "unresolved asset -> no image");
    },
  },
  {
    name: "D1 DB failure: a failed read degrades to the static surface, never an error",
    run: async () => {
      let leaked: unknown = null;
      const c = await safeSettingsRead(async () => { throw new Error("connect ECONNREFUSED password=secret"); }, STATIC_CONSULTATION_FALLBACK);
      assert(c === STATIC_CONSULTATION_FALLBACK, "consultation degrades to the static fallback");
      const b = await safeSettingsRead(async () => { throw new Error("db down"); }, STATIC_BRAND_FALLBACK);
      assert(b === STATIC_BRAND_FALLBACK, "brand degrades to the static fallback");
      try { await safeSettingsRead(async () => { throw new Error("boom"); }, STATIC_BRAND_FALLBACK); } catch (e) { leaked = e; }
      assert(leaked === null, "no error propagates to the public page");
      assert((await safeSettingsRead(async () => "ok", "fb")) === "ok", "success passes through");
    },
  },
  {
    name: "S1 static adapters: server-only, singleton-scoped, schema-validated, failure-safe",
    run: () => {
      const src = read("src/modules/site-settings/public-settings.ts");
      assert(src.includes('import "server-only"'), "adapters are server-only");
      assert(src.includes("consultationSettings.findUnique") && src.includes("brandSettings.findUnique"), "reads the Admin singletons");
      assert(src.includes("select: { settingsJson: true }"), "selects only the settings document");
      assert(src.includes("consultationConfigSchema.safeParse") && src.includes("brandSettingsSchema.safeParse"), "validates before publishing");
      assert((src.match(/safeSettingsRead\(/g) ?? []).length === 2, "both reads are failure-safe");
      assert(src.includes("toPublicConsultation") && src.includes("toPublicBrand"), "projects through the privacy allow-list");
      assert(src.includes("mediaAsset.findUnique"), "resolves the profile image reference to a URL");
      // No booking / payment / CRM / WhatsApp API. Checked against executable code only —
      // the file's own header comment legitimately names them in prose.
      const code = src
        .split("\n")
        .filter((line) => {
          const t = line.trim();
          return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
        })
        .join("\n");
      assert(!/booking|payment|razorpay|stripe|\bcrm\b|graph\.facebook|whatsapp.*api|fetch\(/i.test(code), "no booking/payment/CRM/WhatsApp API call");
      const core = read("src/modules/site-settings/public-settings-core.ts");
      assert(!core.includes('import "server-only"') && !core.includes("getPrisma"), "core is pure and testable");
    },
  },
  {
    name: "S2 static surfaces: existing routes/design preserved, wired to Admin settings",
    run: () => {
      const consult = read("src/app/(marketing)/consultation/page.tsx");
      assert(consult.includes("getPublicConsultationSettings") && consult.includes("getPublicBrandSettings"), "consultation page reads Admin settings");
      assert(consult.includes("{brand.acharyaName}"), "Acharya name from settings");
      assert(consult.includes("{consultation.availabilityLabel}"), "availability from settings");
      assert(consult.includes("consultationPackages"), "existing package catalog preserved");
      // Design/route preserved: no new sections, same shell/components.
      assert(consult.includes('PremiumBentoSection label="Acharya"') && consult.includes('label="Availability"'), "existing sections reused, not added");
      assert(!consult.includes("wa.me"), "no hardcoded link; the URL comes from settings");

      const profile = read("src/app/(marketing)/joy-prakash-sarmah/page.tsx");
      assert(profile.includes("getPublicBrandSettings") && profile.includes("{brand.acharyaName}"), "profile page reads the Admin name");
      assert(profile.includes("createPersonSchema"), "existing SEO preserved");

      // Raw settings JSON is never rendered.
      for (const src of [consult, profile]) {
        assert(!src.includes("settingsJson") && !src.includes("isEnabled"), "no Admin-only field referenced by a public page");
      }
    },
  },
  {
    name: "S3 isolation + import plan: Codex files untouched; plan is dry-run only",
    run: () => {
      // Codex-owned surfaces are not part of this cutover.
      const sitemap = read("src/app/sitemap.ts");
      assert(!sitemap.includes("site-settings"), "sitemap untouched by the settings cutover");
      const productMode = read("src/config/product-mode.ts");
      assert(!productMode.includes("site-settings"), "product-mode untouched");

      // The plan is deterministic and writes nothing.
      const plan = buildSettingsImportPlan();
      assert(JSON.stringify(buildSettingsImportPlan()) === JSON.stringify(plan), "plan is deterministic");
      assert(plan.consultation.document.isEnabled === false, "plan keeps consultation unpublished until an editor acts");
      assert(plan.brand.document.acharyaName === "Joy Prakash Sarmah", "brand name migrated from the static source");
      assert(plan.consultation.notes.length > 0 && plan.brand.notes.length > 0, "plan carries fidelity notes");
      const planSrc = read("scripts/debug-settings-import-plan.ts");
      assert(!/getPrisma|prisma\.|createMany|INSERT/i.test(planSrc), "plan performs no database access or writes");
      // Static source is untouched by this card.
      assert(read("src/modules/consultations/catalog.ts").includes("consultationHost"), "static catalog preserved");
    },
  },
];

async function main() {
  console.log("Claude C8D — public Consultation + Brand settings QA:");
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
  console.log(`\npublic settings QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
