/**
 * Claude C8D — DRY-RUN import plan for the legacy static Consultation + Brand settings.
 *
 * Prints the exact Admin settings documents the current static public copy WOULD become.
 * Deterministic; performs NO database access and NO writes. Nothing is imported here and no
 * static source is modified — execution belongs to a later card.
 *
 * Run:  npx tsx scripts/debug-settings-import-plan.ts          (human summary)
 *       npx tsx scripts/debug-settings-import-plan.ts --json   (machine-readable plan)
 */
import { consultationHost } from "@/modules/consultations/catalog";
import { STATIC_BRAND_FALLBACK, STATIC_CONSULTATION_FALLBACK } from "@/modules/site-settings/public-settings-core";
import { consultationConfigSchema, brandSettingsSchema } from "@/modules/admin/domain";

export type SettingsImportPlan = {
  consultation: { document: Record<string, unknown>; notes: string[] };
  brand: { document: Record<string, unknown>; notes: string[] };
};

/**
 * Build the deterministic plan from the static public copy that exists today.
 * Values the legacy site never had are left at their Admin defaults rather than invented.
 */
export function buildSettingsImportPlan(): SettingsImportPlan {
  const consultationNotes: string[] = [];
  const brandNotes: string[] = [];

  // The legacy consultation surface carries no WhatsApp number, message, topics,
  // preparation copy or disclaimer — there is nothing to migrate for those fields.
  const consultation = {
    // isEnabled stays FALSE: the public surface must not switch to Admin settings until an
    // editor deliberately publishes them.
    isEnabled: false,
    availabilityStatus: STATIC_CONSULTATION_FALLBACK.availability,
    whatsappNumber: null,
    prefilledMessage: null,
    officeHours: null,
    languages: ["en"],
    topics: [],
    preparationInstructions: null,
    shortDescription: null,
    disclaimer: null,
  };
  consultationNotes.push("isEnabled stays false — an editor must publish before the public surface switches over");
  consultationNotes.push("legacy site has no WhatsApp number/message — must be entered by an editor");
  consultationNotes.push("legacy site has no topics / preparation instructions / disclaimer — nothing to migrate");
  consultationNotes.push(`availability seeded from the static fallback (${STATIC_CONSULTATION_FALLBACK.availability})`);
  consultationNotes.push("languages seeded to [en]; AS/HI must be enabled by an editor");

  const brand = {
    acharyaName: consultationHost.astrologerName,
    professionalTitle: STATIC_BRAND_FALLBACK.professionalTitle,
    profileImageAssetId: null,
    biography: null,
    supportEmail: null,
    officeHours: null,
    whatsappNumber: null,
    socialLinks: [],
    footer: { addressLine: null, copyright: null, note: null },
    disclaimer: null,
  };
  brandNotes.push(`acharyaName migrated from the static consultationHost ("${consultationHost.astrologerName}")`);
  brandNotes.push(`professionalTitle seeded from the existing public copy ("${STATIC_BRAND_FALLBACK.professionalTitle}")`);
  brandNotes.push(`timezone "${consultationHost.timezoneLabel}" has no Admin field — it stays in the static catalog`);
  brandNotes.push("profile image must be registered in the Media library first, then picked");
  brandNotes.push("biography / supportEmail / socialLinks / footer / disclaimer have no legacy source — editor-entered");

  return { consultation: { document: consultation, notes: consultationNotes }, brand: { document: brand, notes: brandNotes } };
}

function main() {
  const plan = buildSettingsImportPlan();

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  console.log("Claude C8D - legacy settings -> Admin settings DRY-RUN import plan");
  console.log("(no database access, no writes, no static content removed)\n");

  for (const [label, section] of [["ConsultationSettings", plan.consultation], ["BrandSettings", plan.brand]] as const) {
    console.log(`${label}:`);
    for (const [key, value] of Object.entries(section.document)) {
      console.log(`    ${key.padEnd(22)}: ${JSON.stringify(value)}`);
    }
    for (const note of section.notes) console.log(`    note                  : ${note}`);
    console.log("");
  }

  // The planned documents must satisfy the Admin schemas before anyone tries to write them.
  const c = consultationConfigSchema.safeParse(plan.consultation.document);
  const b = brandSettingsSchema.safeParse(plan.brand.document);
  console.log("Plan summary:");
  console.log(`  consultation document valid : ${c.success ? "YES" : "NO"}`);
  console.log(`  brand document valid        : ${b.success ? "YES" : "NO"}`);
  console.log(`  fields needing an editor    : WhatsApp number/message, topics, preparation, biography, support email, social links, footer, profile image`);
  console.log("\nDRY RUN ONLY - nothing was written. Execution belongs to a later card.");
}

if (process.argv[1] && process.argv[1].includes("debug-settings-import-plan")) {
  main();
}
