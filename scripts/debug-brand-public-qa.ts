/**
 * Claude C8E — Brand / Acharya / footer public UI QA.
 * Drives the REAL brand service against an in-memory repo (activation), the pure public
 * projection (privacy, fallback, link safety), and static checks on the profile page and
 * footer (empty states, mobile, accessibility). No database, no migration, no import.
 */
import { readFileSync } from "node:fs";
import {
  getBrandSettings,
  updateBrandSettings,
  type BrandActor,
  type BrandServiceDeps,
} from "@/modules/admin/brand/service-core";
import { toPublicBrand, STATIC_BRAND_FALLBACK } from "@/modules/site-settings/public-settings-core";
import { defaultBrandSettings, type BrandSettingsInput } from "@/modules/admin/domain";
import type { BrandSettingsRepository } from "@/modules/admin/brand/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");
const PROFILE = () => read("src/app/(marketing)/joy-prakash-sarmah/page.tsx");
const FOOTER = () => read("src/components/site/footer.tsx");

const founder: BrandActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: BrandActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: BrandActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

function makeDeps(seed?: BrandSettingsInput) {
  const store: { current: BrandSettingsInput | null } = { current: seed ?? null };
  const repo: BrandSettingsRepository = {
    async get() { return store.current; },
    async save(config) { store.current = config; return config; },
  };
  const deps: BrandServiceDeps = { repo, audit: async () => ({ ok: true, id: "a" }) };
  // Accessor: `asserts` narrowing would otherwise pin store.current to null after the
  // first "nothing stored yet" assertion.
  const stored = (): BrandSettingsInput | null => store.current;
  return { deps, stored };
}

/** A valid patch exactly as the Admin form submits it (never carries isEnabled). */
const formPatch = (over: Record<string, unknown> = {}) => ({
  acharyaName: "Acharya Purusuttam",
  professionalTitle: "Vedic Astrologer",
  profileImageAssetId: "media_abc",
  biography: "Two decades of practice.",
  supportEmail: "support@navagraha.example",
  officeHours: "Mon-Sat 10-6",
  whatsappNumber: "+919876543210",
  socialLinks: [{ platform: "YouTube", url: "https://youtube.com/@n" }],
  footer: { addressLine: "Guwahati", copyright: "(c) NC 2026", note: "Guidance only." },
  disclaimer: "Advisory only.",
  ...over,
});

const published = (over: Partial<BrandSettingsInput> = {}): BrandSettingsInput => ({
  ...defaultBrandSettings(),
  isEnabled: true,
  acharyaName: "Acharya Purusuttam",
  professionalTitle: "Vedic Astrologer",
  profileImageAssetId: "media_abc",
  biography: "Two decades of practice.",
  supportEmail: "support@navagraha.example",
  officeHours: "Mon-Sat 10-6",
  whatsappNumber: "+919876543210",
  socialLinks: [{ platform: "YouTube", url: "https://youtube.com/@n" }],
  footer: { addressLine: "Guwahati", copyright: "(c) NC 2026", note: "Guidance only." },
  disclaimer: "Advisory only.",
  ...over,
});

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "A1 activation: first valid save publishes; later saves preserve it",
    run: async () => {
      const { deps, stored } = makeDeps();
      assert(defaultBrandSettings().isEnabled === false, "brand default is unpublished");
      assert(stored() === null, "nothing stored yet");

      const first = await updateBrandSettings(deps, founder, formPatch());
      assert(first.ok, "first save accepted");
      assert(first.ok && first.data.isEnabled === true, "first save set isEnabled=true automatically");
      assert(stored()?.isEnabled === true, "activation persisted");

      const second = await updateBrandSettings(deps, editor, formPatch({ acharyaName: "Renamed" }));
      assert(second.ok && second.data.isEnabled === true, "later save preserved activation");
      assert(second.ok && second.data.acharyaName === "Renamed", "later save applied its change");
      assert((await getBrandSettings(deps)).ok, "read still works");
    },
  },
  {
    name: "A2 activation: only a SUCCESSFUL founder/editor save activates; no toggle exposed",
    run: async () => {
      const { deps, stored } = makeDeps();
      const invalid = await updateBrandSettings(deps, founder, formPatch({ supportEmail: "not-an-email" }));
      assert(!invalid.ok && invalid.status === 422, "invalid save rejected");
      assert(stored() === null, "NOT activated by a failed save");

      const denied = await updateBrandSettings(deps, support, formPatch());
      assert(!denied.ok && denied.status === 403, "support save → 403");
      assert(stored() === null, "still not activated");

      // Seeded-but-unpublished activates on the next valid save.
      const { deps: d2, stored: s2 } = makeDeps({ ...defaultBrandSettings(), isEnabled: false });
      assert(s2()?.isEnabled === false, "seeded unpublished");
      assert((await updateBrandSettings(d2, editor, formPatch())).ok && s2()?.isEnabled === true, "next valid save activates");

      // No toggle anywhere.
      const form = read("src/modules/admin/brand/brand-settings-form.tsx");
      assert(!form.includes("isEnabled"), "Admin brand form exposes no toggle");
      const config = read("src/modules/admin/brand/brand-form-config.ts");
      assert(!/isEnabled/.test(config.split("formDataToBrandPatch")[1] ?? ""), "form patch never carries isEnabled");
      assert(!PROFILE().includes("isEnabled") && !FOOTER().includes("isEnabled"), "public surfaces never reference the flag");
      // No Prisma change was needed: the flag lives inside settingsJson.
      assert(read("src/modules/admin/domain/brand-settings.ts").includes("isEnabled: z.boolean()"), "flag is a Zod/JSON field");
      assert(!read("prisma/schema.prisma").includes("isEnabled"), "no Prisma column added");
    },
  },
  {
    name: "F1 fallback: unpublished / absent settings render the controlled static surface",
    run: () => {
      assert(toPublicBrand(null) === STATIC_BRAND_FALLBACK, "absent → static fallback");
      assert(toPublicBrand(undefined) === STATIC_BRAND_FALLBACK, "undefined → static fallback");
      // Configured-but-unpublished must leak nothing.
      const hidden = toPublicBrand(published({ isEnabled: false }), "https://cdn.example.com/p.webp");
      assert(hidden === STATIC_BRAND_FALLBACK, "unpublished → static fallback");
      assert(hidden.biography === null && hidden.supportEmail === null && hidden.socialLinks.length === 0, "nothing configured leaks while unpublished");
      assert(hidden.profileImageUrl === null && hidden.footer.copyright === null, "no image or footer detail leaks");
      // The fallback preserves the existing public copy.
      assert(STATIC_BRAND_FALLBACK.acharyaName === "Joy Prakash Sarmah", "existing name preserved");
      assert(STATIC_BRAND_FALLBACK.fromSettings === false, "marked as not-from-settings");
      assert(toPublicBrand(published()).fromSettings === true, "published → from settings");
    },
  },
  {
    name: "F2 fallback: blank values degrade field-by-field; image fallback is controlled",
    run: () => {
      const sparse = toPublicBrand(published({
        acharyaName: null, professionalTitle: "   ", biography: null, supportEmail: null,
        officeHours: "", socialLinks: [], footer: { addressLine: null, copyright: "  ", note: null }, disclaimer: "",
      }));
      assert(sparse.acharyaName === STATIC_BRAND_FALLBACK.acharyaName, "blank name → static name");
      assert(sparse.professionalTitle === STATIC_BRAND_FALLBACK.professionalTitle, "blank title → static title");
      assert(sparse.biography === null && sparse.supportEmail === null && sparse.officeHours === null, "blank → null, section hidden");
      assert(sparse.footer.copyright === null && sparse.disclaimer === null, "blank footer/disclaimer → null");
      assert(sparse.socialLinks.length === 0, "no links");
      // Controlled image fallback: an unresolved/deleted asset yields no image, never a broken ref.
      assert(toPublicBrand(published(), null).profileImageUrl === null, "unresolved asset → no image");
      assert(toPublicBrand(published(), "  ").profileImageUrl === null, "blank URL → no image");
      assert(toPublicBrand(published(), "https://cdn.example.com/p.webp").profileImageUrl === "https://cdn.example.com/p.webp", "resolved URL used");
      // The footer keeps its own year fallback so the block is never empty.
      assert(FOOTER().includes("new Date().getFullYear()"), "footer year fallback retained");
      assert(FOOTER().includes("brand.footer.copyright ? ("), "copyright falls back cleanly");
    },
  },
  {
    name: "P1 privacy: no settingsJson, asset id, singleton key, updatedById or Admin field",
    run: () => {
      const b = toPublicBrand(published(), "https://cdn.example.com/p.webp");
      const keys = Object.keys(b);
      for (const forbidden of ["isEnabled", "settingsJson", "updatedById", "singletonKey", "id", "createdAt", "updatedAt", "profileImageAssetId", "whatsappNumber"]) {
        assert(!keys.includes(forbidden), `public brand shape has no ${forbidden}`);
      }
      const json = JSON.stringify(b);
      assert(!json.includes("media_abc"), "asset id never published");
      assert(!json.includes("+919876543210"), "raw WhatsApp number never published");
      assert(b.whatsappUrl === "https://wa.me/919876543210", "only the derived link");
      // Public surfaces never reference internals.
      for (const [name, src] of [["profile", PROFILE()], ["footer", FOOTER()]] as const) {
        for (const forbidden of ["settingsJson", "profileImageAssetId", "singletonKey", "updatedById", "whatsappNumber"]) {
          assert(!src.includes(forbidden), `${name} never references ${forbidden}`);
        }
        assert(!src.includes("JSON.stringify(brand)"), `${name} never serialises the settings object`);
      }
    },
  },
  {
    name: "L1 link safety: https-only social links, safe rel/target, mailto support email",
    run: () => {
      // Non-https links are dropped in the projection, so the page can never render one.
      const mixed = toPublicBrand(published({
        socialLinks: [
          { platform: "Good", url: "https://ok.example" },
          { platform: "Insecure", url: "http://bad.example" },
        ],
      }));
      assert(mixed.socialLinks.length === 1 && mixed.socialLinks[0]!.platform === "Good", "http link dropped");
      assert(mixed.socialLinks.every((l) => l.url.startsWith("https://")), "https only");

      const profile = PROFILE();
      assert(profile.includes('rel="noopener noreferrer nofollow"'), "social links use noopener/noreferrer/nofollow");
      assert(profile.includes('target="_blank"'), "external links open in a new tab");
      assert(profile.includes("href={link.url}"), "href comes from the projection");
      assert(profile.includes("href={`mailto:${brand.supportEmail}`}"), "support email is a mailto link");
      // No hardcoded WhatsApp anywhere on the brand surfaces.
      assert(!profile.includes("wa.me") && !FOOTER().includes("wa.me"), "no WhatsApp hardcoding");
    },
  },
  {
    name: "E1 empty states: every optional section is hidden cleanly",
    run: () => {
      const profile = PROFILE();
      assert(profile.includes("{brand.profileImageUrl || brand.professionalTitle || brand.biography ? ("), "Acharya block hidden when all empty");
      assert(profile.includes("{brand.profileImageUrl ? ("), "image hidden when unresolved");
      assert(profile.includes("{brand.professionalTitle ? ("), "title hidden when unset");
      assert(profile.includes("{brand.biography ? ("), "biography hidden when unset");
      assert(profile.includes("{brand.supportEmail || brand.officeHours ? ("), "contact block hidden when both empty");
      assert(profile.includes("{brand.socialLinks.length ? ("), "social links hidden when empty");
      assert(profile.includes("{brand.disclaimer ? ("), "disclaimer hidden when unset");
      const footer = FOOTER();
      assert(footer.includes("{brand.footer.addressLine ? (") && footer.includes("{brand.footer.note ? ("), "footer details hidden when unset");
      assert(footer.includes("{brand.disclaimer ? ("), "footer disclaimer hidden when unset");
      // A published-but-empty config renders no optional section at all.
      const bare = toPublicBrand({ ...defaultBrandSettings(), isEnabled: true });
      assert(bare.biography === null && bare.supportEmail === null && bare.disclaimer === null, "blank → null");
      assert(bare.socialLinks.length === 0 && bare.profileImageUrl === null, "nothing to render");
    },
  },
  {
    name: "X1 routes, design, legal links, mobile and accessibility preserved",
    run: () => {
      const profile = PROFILE();
      // Same route + design system, existing sections intact.
      assert(profile.includes("PremiumPageShell") && profile.includes("PremiumBentoSection") && profile.includes("PremiumSectionHeading"), "existing design system reused");
      assert(profile.includes('label="Verified Profile"') && profile.includes('label="Consultation Access"'), "existing sections preserved");
      assert(profile.includes("createPersonSchema"), "existing SEO preserved");
      assert(profile.includes('aria-label="Social links"') && profile.includes("<li key={link.url}>"), "social links use labelled list semantics");
      assert(profile.includes("min-h-11"), "touch targets");
      assert(profile.includes("whitespace-pre-wrap"), "biography/disclaimer keep line breaks");
      assert(profile.includes('alt={brand.acharyaName}'), "profile image has meaningful alt text");
      assert(profile.includes("min-w-0") && profile.includes("flex-wrap"), "mobile-safe wrapping");

      const footer = FOOTER();
      // Legal links and nav are untouched.
      assert(footer.includes("footerColumns.map"), "existing footer link columns preserved");
      assert(footer.includes("NavagrahaLogo"), "brand logo untouched");
      assert(footer.includes("min-h-11") && footer.includes("mobile-safe-text"), "footer touch targets/mobile classes intact");
      assert(footer.includes("data-nosnippet"), "existing footer attributes intact");
    },
  },
  {
    name: "I1 isolation: no navigation, product-mode, sitemap, robots or PWA change",
    run: () => {
      const footer = FOOTER();
      assert(!footer.includes("product-mode") && !footer.includes("sitemap"), "footer touches no protected surface");
      // Protected Codex surfaces must not reference the new module.
      for (const p of ["src/app/sitemap.ts", "src/app/robots.ts", "src/config/product-mode.ts"]) {
        assert(!read(p).includes("site-settings"), `${p} untouched by the brand cutover`);
      }
      // The brand adapter stays server-only and failure-safe.
      const adapter = read("src/modules/site-settings/public-settings.ts");
      assert(adapter.includes('import "server-only"'), "adapter is server-only");
      assert(adapter.includes("safeSettingsRead") && adapter.includes("STATIC_BRAND_FALLBACK"), "brand read is failure-safe");
      assert(adapter.includes("mediaAsset.findUnique"), "asset id resolved server-side, never published");
    },
  },
];

async function main() {
  console.log("Claude C8E — Brand / Acharya / footer public UI QA:");
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
  console.log(`\nbrand public QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
