// Claude C8D — server-only public adapters for Admin-managed Consultation + Brand settings.
//
// Reads the same singletons the Admin console writes, projects them through the pure
// privacy allow-list, and degrades to the controlled static fallback whenever settings are
// absent, unpublished or unreadable — so a public page never 500s and never leaks a
// database detail. Read-only: no booking, payment, CRM or WhatsApp API.
//
// Perf: the projected results are served from `unstable_cache` so a navigation does not pay
// a database round trip; Admin saves invalidate the tags. The cache wraps only the
// throwing read path — a transient database failure falls back for that request without the
// fallback ever being cached as if it were real content.
import "server-only";

import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { brandSettingsSchema, consultationConfigSchema } from "@/modules/admin/domain";
import {
  PUBLIC_CONTENT_REVALIDATE_SECONDS,
  PUBLIC_CONTENT_TAGS,
} from "@/lib/public-content-cache";
import {
  STATIC_BRAND_FALLBACK,
  STATIC_CONSULTATION_FALLBACK,
  safeSettingsRead,
  toPublicBrand,
  toPublicConsultation,
  type PublicBrand,
  type PublicConsultation,
} from "@/modules/site-settings/public-settings-core";

const SINGLETON_KEY = "default";

const readPublicConsultationSettings = unstable_cache(
  async (): Promise<PublicConsultation> => {
    const row = await getPrisma().consultationSettings.findUnique({
      where: { singletonKey: SINGLETON_KEY },
      select: { settingsJson: true },
    });
    if (!row || row.settingsJson == null) return STATIC_CONSULTATION_FALLBACK;
    const parsed = consultationConfigSchema.safeParse(row.settingsJson);
    // An unreadable document is treated as absent rather than partially published.
    if (!parsed.success) return STATIC_CONSULTATION_FALLBACK;
    return toPublicConsultation(parsed.data);
  },
  ["public-consultation-settings"],
  {
    tags: [PUBLIC_CONTENT_TAGS.consultationSettings],
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
  },
);

const readPublicBrandSettings = unstable_cache(
  async (): Promise<PublicBrand> => {
    const db = getPrisma();
    const row = await db.brandSettings.findUnique({
      where: { singletonKey: SINGLETON_KEY },
      select: { settingsJson: true },
    });
    if (!row || row.settingsJson == null) return STATIC_BRAND_FALLBACK;
    const parsed = brandSettingsSchema.safeParse(row.settingsJson);
    if (!parsed.success) return STATIC_BRAND_FALLBACK;

    // Resolve the profile image REFERENCE to a URL; the asset id is never published, and a
    // missing/deleted asset simply yields no image rather than a broken reference.
    let profileImageUrl: string | null = null;
    const assetId = parsed.data.profileImageAssetId;
    if (assetId) {
      const asset = await db.mediaAsset.findUnique({ where: { id: assetId }, select: { url: true } });
      profileImageUrl = asset?.url ?? null;
    }
    return toPublicBrand(parsed.data, profileImageUrl);
  },
  ["public-brand-settings"],
  {
    tags: [PUBLIC_CONTENT_TAGS.brandSettings],
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
  },
);

/** Public consultation settings, or the controlled static fallback. */
export async function getPublicConsultationSettings(): Promise<PublicConsultation> {
  return safeSettingsRead(() => readPublicConsultationSettings(), STATIC_CONSULTATION_FALLBACK);
}

/** Public brand/profile settings, or the controlled static fallback. */
export async function getPublicBrandSettings(): Promise<PublicBrand> {
  return safeSettingsRead(() => readPublicBrandSettings(), STATIC_BRAND_FALLBACK);
}
