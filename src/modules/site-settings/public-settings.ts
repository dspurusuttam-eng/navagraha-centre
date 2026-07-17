// Claude C8D — server-only public adapters for Admin-managed Consultation + Brand settings.
//
// Reads the same singletons the Admin console writes, projects them through the pure
// privacy allow-list, and degrades to the controlled static fallback whenever settings are
// absent, unpublished or unreadable — so a public page never 500s and never leaks a
// database detail. Read-only: no booking, payment, CRM or WhatsApp API.
import "server-only";

import { getPrisma } from "@/lib/prisma";
import { brandSettingsSchema, consultationConfigSchema } from "@/modules/admin/domain";
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

/** Public consultation settings, or the controlled static fallback. */
export async function getPublicConsultationSettings(): Promise<PublicConsultation> {
  return safeSettingsRead(async () => {
    const row = await getPrisma().consultationSettings.findUnique({
      where: { singletonKey: SINGLETON_KEY },
      select: { settingsJson: true },
    });
    if (!row || row.settingsJson == null) return STATIC_CONSULTATION_FALLBACK;
    const parsed = consultationConfigSchema.safeParse(row.settingsJson);
    // An unreadable document is treated as absent rather than partially published.
    if (!parsed.success) return STATIC_CONSULTATION_FALLBACK;
    return toPublicConsultation(parsed.data);
  }, STATIC_CONSULTATION_FALLBACK);
}

/** Public brand/profile settings, or the controlled static fallback. */
export async function getPublicBrandSettings(): Promise<PublicBrand> {
  return safeSettingsRead(async () => {
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
  }, STATIC_BRAND_FALLBACK);
}
