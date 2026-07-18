/**
 * Claude Admin Console C5B — Brand/profile settings admin UI QA.
 * Pure form mapping (config ↔ form values ↔ PATCH payload, incl. social links + footer),
 * service-level validation and role enforcement over an in-memory singleton repo, and
 * static UI/page/action wiring checks (including the no-upload guarantee).
 */
import { readFileSync } from "node:fs";
import {
  BRAND_FORM_FIELDS,
  brandToFormValues,
  formDataToBrandPatch,
  parseSocialLinks,
  formatSocialLinks,
} from "@/modules/admin/brand/brand-form-config";
import {
  getBrandSettings,
  updateBrandSettings,
  type BrandActor,
  type BrandServiceDeps,
} from "@/modules/admin/brand/service-core";
import { defaultBrandSettings, type BrandSettingsInput } from "@/modules/admin/domain";
import type { BrandSettingsRepository } from "@/modules/admin/brand/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

function makeRepo(seed?: BrandSettingsInput): BrandSettingsRepository & { current: BrandSettingsInput | null } {
  const store: { current: BrandSettingsInput | null } = { current: seed ?? null };
  return {
    get current() { return store.current; },
    async get() { return store.current; },
    async save(config) { store.current = config; return config; },
  };
}
const founder: BrandActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: BrandActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: BrandActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

function makeDeps(seed?: BrandSettingsInput) {
  const audits: Array<{ action: string; metadata?: unknown }> = [];
  const repo = makeRepo(seed);
  const deps: BrandServiceDeps = {
    repo,
    audit: async (input) => { audits.push({ action: input.action, metadata: input.metadata }); return { ok: true, id: "a1" }; },
  };
  return { deps, audits, repo };
}

const validPatch = (over: Record<string, unknown> = {}) => ({
  acharyaName: "Acharya Purusuttam",
  professionalTitle: "Vedic Astrologer",
  profileImageAssetId: "media_abc123",
  biography: "Two decades of Vedic practice.",
  supportEmail: "support@navagraha.example",
  officeHours: "Mon–Sat, 10:00–18:00 IST",
  whatsappNumber: "+919876543210",
  socialLinks: [{ platform: "YouTube", url: "https://youtube.com/@navagraha" }],
  footer: { addressLine: "Guwahati, Assam", copyright: "© Navagraha Centre", note: "For guidance only." },
  disclaimer: "Advisory only.",
  ...over,
});

/** Build a FormData exactly as the rendered form would. */
function brandForm(over: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const base: Record<string, string> = {
    acharyaName: "Acharya Purusuttam",
    professionalTitle: "Vedic Astrologer",
    profileImageAssetId: "media_abc123",
    biography: "Two decades of practice.",
    supportEmail: "support@navagraha.example",
    officeHours: "Mon–Sat 10–6",
    whatsappNumber: "+919876543210",
    socialLinks: "YouTube | https://youtube.com/@navagraha\nInstagram | https://instagram.com/navagraha\n",
    footerAddressLine: "Guwahati, Assam",
    footerCopyright: "© Navagraha Centre",
    footerNote: "For guidance only.",
    disclaimer: "Advisory only.",
  };
  for (const [key, value] of Object.entries({ ...base, ...over })) fd.set(key, value);
  return fd;
}

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "F1 field config + brandToFormValues (nulls → \"\", footer flattened, links formatted)",
    run: () => {
      for (const field of ["acharyaName", "professionalTitle", "profileImageAssetId", "biography", "supportEmail", "officeHours", "whatsappNumber", "socialLinks", "footerAddressLine", "footerCopyright", "footerNote", "disclaimer"]) {
        assert((BRAND_FORM_FIELDS as readonly string[]).includes(field), `field ${field}`);
      }
      assert(BRAND_FORM_FIELDS.length === 12, "12 form controls (10 settings; footer expands to 3)");
      const empty = brandToFormValues(defaultBrandSettings());
      assert(empty.acharyaName === "" && empty.supportEmail === "" && empty.disclaimer === "", "nulls → empty strings");
      assert(empty.socialLinks === "" && empty.footerAddressLine === "" && empty.footerNote === "", "empty links/footer → empty");
      const seeded = brandToFormValues({
        ...defaultBrandSettings(),
        acharyaName: "A", profileImageAssetId: "m1",
        socialLinks: [{ platform: "X", url: "https://x.com/a" }],
        footer: { addressLine: "Line", copyright: "©", note: "N" },
      });
      assert(seeded.socialLinks === "X | https://x.com/a", "links formatted per line");
      assert(seeded.footerAddressLine === "Line" && seeded.footerCopyright === "©" && seeded.footerNote === "N", "footer flattened");
      assert(seeded.profileImageAssetId === "m1", "profile image reference surfaced");
    },
  },
  {
    name: "F2 parseSocialLinks / formatSocialLinks: split on first |, trim, blanks, round-trip",
    run: () => {
      const parsed = parseSocialLinks(" YouTube | https://youtube.com/@n \n\n Instagram|https://instagram.com/n \n");
      assert(parsed.length === 2, "two links");
      assert(parsed[0]!.platform === "YouTube" && parsed[0]!.url === "https://youtube.com/@n", "trimmed platform/url");
      assert(parsed[1]!.platform === "Instagram" && parsed[1]!.url === "https://instagram.com/n", "no-space separator");
      // A URL containing "|" is impossible, but a query with = or ? must survive: split on FIRST |.
      const q = parseSocialLinks("Site | https://a.example/x?a=1&b=2");
      assert(q[0]!.url === "https://a.example/x?a=1&b=2", "url preserved after first separator");
      // A line without a separator → empty platform (schema reports it, parser does not guess).
      const noSep = parseSocialLinks("https://lonely.example");
      assert(noSep[0]!.platform === "" && noSep[0]!.url === "https://lonely.example", "missing separator → empty platform");
      assert(parseSocialLinks("").length === 0 && parseSocialLinks("  \n ").length === 0, "blank → empty list");
      const round = parseSocialLinks(formatSocialLinks([{ platform: "P", url: "https://p.example" }]));
      assert(round[0]!.platform === "P" && round[0]!.url === "https://p.example", "round-trip");
    },
  },
  {
    name: "F3 formDataToBrandPatch: all fields, empty → null, links parsed, footer nested",
    run: () => {
      const patch = formDataToBrandPatch(brandForm());
      assert(patch.acharyaName === "Acharya Purusuttam" && patch.professionalTitle === "Vedic Astrologer", "identity");
      assert(patch.profileImageAssetId === "media_abc123", "profile image reference");
      assert(patch.supportEmail === "support@navagraha.example" && patch.whatsappNumber === "+919876543210", "contacts");
      const links = patch.socialLinks as Array<{ platform: string; url: string }>;
      assert(links.length === 2 && links[0]!.platform === "YouTube", "links parsed");
      const footer = patch.footer as Record<string, unknown>;
      assert(footer.addressLine === "Guwahati, Assam" && footer.copyright === "© Navagraha Centre" && footer.note === "For guidance only.", "footer nested");
      // Empty optional text clears to null.
      const cleared = formDataToBrandPatch(brandForm({ acharyaName: "", supportEmail: "  ", whatsappNumber: "", profileImageAssetId: "", footerCopyright: "" }));
      assert(cleared.acharyaName === null && cleared.supportEmail === null && cleared.whatsappNumber === null && cleared.profileImageAssetId === null, "empty → null");
      assert((cleared.footer as Record<string, unknown>).copyright === null, "empty footer field → null");
      // Clearing every link persists an empty array (removal sticks).
      const noLinks = formDataToBrandPatch(brandForm({ socialLinks: "" }));
      assert(Array.isArray(noLinks.socialLinks) && (noLinks.socialLinks as unknown[]).length === 0, "no links → []");
    },
  },
  {
    name: "V1 service: valid save persists all fields + audits presence flags only",
    run: async () => {
      const { deps, repo, audits } = makeDeps();
      const result = await updateBrandSettings(deps, founder, validPatch());
      assert(result.ok, "valid patch saved");
      if (!result.ok) return;
      assert(result.data.acharyaName === "Acharya Purusuttam" && result.data.supportEmail === "support@navagraha.example", "values stored");
      assert(result.data.socialLinks.length === 1 && result.data.footer?.addressLine === "Guwahati, Assam", "links + footer stored");
      assert(repo.current?.disclaimer === "Advisory only.", "persisted to repo");
      const audit = audits.find((a) => a.action === "brand.settings.update");
      assert(audit, "audited");
      const meta = audit!.metadata as Record<string, unknown>;
      assert(meta.hasSupportEmail === true && meta.hasWhatsapp === true && meta.socialLinkCount === 1, "presence flags recorded");
      // The audit must never carry the raw email / number / biography.
      const metaJson = JSON.stringify(meta);
      assert(!metaJson.includes("support@navagraha.example") && !metaJson.includes("+919876543210"), "no raw contact details in audit");
      const readBack = await getBrandSettings(deps);
      assert(readBack.ok && readBack.data.professionalTitle === "Vedic Astrologer", "read back");
    },
  },
  {
    name: "V2 service: validation errors carry field paths (email, whatsapp, url, lengths, links cap)",
    run: async () => {
      const { deps } = makeDeps();
      const firstPath = (issues: unknown) => (issues as Array<{ path?: (string | number)[] }>)[0]?.path?.[0];

      const badEmail = await updateBrandSettings(deps, founder, validPatch({ supportEmail: "not-an-email" }));
      assert(!badEmail.ok && badEmail.status === 422 && firstPath(badEmail.issues) === "supportEmail", "bad email → 422 on supportEmail");

      const badPhone = await updateBrandSettings(deps, founder, validPatch({ whatsappNumber: "12 34 abc" }));
      assert(!badPhone.ok && badPhone.status === 422 && firstPath(badPhone.issues) === "whatsappNumber", "bad whatsapp → 422 on whatsappNumber");

      const badUrl = await updateBrandSettings(deps, founder, validPatch({ socialLinks: [{ platform: "X", url: "not a url" }] }));
      assert(!badUrl.ok && badUrl.status === 422 && firstPath(badUrl.issues) === "socialLinks", "bad url → 422 on socialLinks");

      const noPlatform = await updateBrandSettings(deps, founder, validPatch({ socialLinks: [{ platform: "", url: "https://a.example" }] }));
      assert(!noPlatform.ok && noPlatform.status === 422, "missing platform rejected");

      const tooManyLinks = await updateBrandSettings(deps, founder, validPatch({ socialLinks: Array.from({ length: 21 }, (_, i) => ({ platform: `P${i}`, url: "https://a.example" })) }));
      assert(!tooManyLinks.ok && tooManyLinks.status === 422 && firstPath(tooManyLinks.issues) === "socialLinks", "21 links → 422 on socialLinks");

      const longBio = await updateBrandSettings(deps, founder, validPatch({ biography: "x".repeat(5001) }));
      assert(!longBio.ok && longBio.status === 422, "over-max biography rejected");

      const longDisclaimer = await updateBrandSettings(deps, founder, validPatch({ disclaimer: "x".repeat(2001) }));
      assert(!longDisclaimer.ok && longDisclaimer.status === 422, "over-max disclaimer rejected");

      const badAsset = await updateBrandSettings(deps, founder, validPatch({ profileImageAssetId: "x".repeat(65) }));
      assert(!badAsset.ok && badAsset.status === 422, "over-long media reference rejected");

      const longFooter = await updateBrandSettings(deps, founder, validPatch({ footer: { addressLine: "x".repeat(301), copyright: null, note: null } }));
      assert(!longFooter.ok && longFooter.status === 422 && firstPath(longFooter.issues) === "footer", "over-max footer → 422 on footer");
    },
  },
  {
    name: "R1 role: founder/editor write; support → 403; support may read",
    run: async () => {
      const { deps } = makeDeps();
      assert((await updateBrandSettings(deps, founder, validPatch())).ok, "founder writes");
      assert((await updateBrandSettings(deps, editor, validPatch({ professionalTitle: "Jyotishi" }))).ok, "editor writes");
      const denied = await updateBrandSettings(deps, support, validPatch());
      assert(!denied.ok && denied.status === 403 && denied.code === "FORBIDDEN", "support write → 403");
      const readable = await getBrandSettings(deps);
      assert(readable.ok, "support-visible read still works");
    },
  },
  {
    name: "U1 static form: 12 labelled controls, states, read-only, a11y, no upload",
    run: () => {
      const src = read("src/modules/admin/brand/brand-settings-form.tsx");
      for (const id of ["acharyaName", "professionalTitle", "biography", "supportEmail", "officeHours", "whatsappNumber", "socialLinks", "footerAddressLine", "footerCopyright", "footerNote", "disclaimer"]) {
        assert(src.includes(`htmlFor="${id}"`) && src.includes(`id="${id}"`), `label+control for ${id}`);
      }
      // C6B: the profile image is a MediaPicker (hidden input under the same field name),
      // no longer a free-text asset id.
      assert(src.includes("<MediaPicker") && src.includes('name="profileImageAssetId"'), "profile image uses the media picker");
      assert(!src.includes('id="profileImageAssetId"'), "no free-text profile id input remains");
      assert(src.includes("<fieldset") && src.includes("<legend"), "footer grouped in fieldset/legend");
      assert(src.includes('role="alert"') && src.includes('role="status"'), "failure + success roles");
      assert(src.includes("Saving…") && src.includes("Save settings") && src.includes("Retry"), "save/saving/retry states");
      assert(src.includes("aria-invalid") && src.includes("aria-describedby"), "field error a11y");
      assert(src.includes("disabled={!canWrite}") && src.includes("read-only access"), "read-only rendering");
      assert(src.includes("min-h-11") && src.includes("max-w-2xl"), "touch targets + single-column mobile layout");
      // No media upload anywhere in this form.
      assert(!src.includes('type="file"') && !src.includes("FileReader") && !src.includes("multipart"), "no upload control");
      assert(src.includes("no upload"), "reference-only hint");
    },
  },
  {
    name: "U2 static page: placeholder replaced, noindex, service + role wired, no public import",
    run: () => {
      const src = read("src/app/(admin)/admin/settings/page.tsx");
      assert(!src.includes("AdminPlaceholder"), "placeholder removed");
      assert(src.includes("index: false") && src.includes('dynamic = "force-dynamic"'), "noindex + dynamic");
      assert(src.includes("getBrandSettings") && src.includes("getBrandDeps"), "reads via existing brand service");
      assert(src.includes("hasAdminAccess") && src.includes("canWrite"), "role gate wired");
      assert(src.includes("BrandSettingsForm") && src.includes("updateBrandAction"), "form + action wired");
      assert(src.includes("temporarily unavailable"), "unavailable fallback");
      assert(!/@\/modules\/(content|site|marketing|conversion)\b/.test(src), "no public module import");
    },
  },
  {
    name: "U3 static action: existing service, session actor, revalidate, nested field mapping",
    run: () => {
      const src = read("src/modules/admin/brand/brand-actions.ts");
      assert(src.includes('"use server"'), "server action module");
      assert(src.includes("updateBrandSettings") && src.includes("getBrandDeps"), "uses existing brand service");
      assert(src.includes("getAdminPageSessionOrNull") && src.includes("adminRoles"), "session actor with roles");
      assert(src.includes("formDataToBrandPatch"), "maps form → patch");
      assert(src.includes("VALIDATION_ERROR") && src.includes("fieldErrors"), "validation issues → field errors");
      assert(src.includes("footerAddressLine") && src.includes("fieldNameForPath"), "nested footer issues map to their control");
      assert(src.includes('revalidatePath("/admin/settings")'), "revalidates the page");
    },
  },
];

async function main() {
  console.log("Admin Console C5B — Brand/profile settings admin UI QA:");
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
  console.log(`\nadmin brand UI QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
