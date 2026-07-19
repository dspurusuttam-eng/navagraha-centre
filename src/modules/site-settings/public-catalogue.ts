// Claude C10A — server-only public reader for the Consultation catalogue.
//
// Reads the published catalogue the Admin console writes, plus the global availability +
// WhatsApp base link from the (published) Consultation settings singleton, and projects both
// through the pure allow-list. Degrades to the controlled EMPTY catalogue whenever the
// catalogue or settings are absent, unpublished or unreadable — so a public page never 500s
// and never leaks a draft or the raw WhatsApp number. Read-only: no booking, payment, CRM,
// WhatsApp API, and no intake.
import "server-only";

import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { consultationConfigSchema } from "@/modules/admin/domain";
import { createPrismaCatalogueRepository } from "@/modules/admin/consultation-catalogue/service";
import {
  PUBLIC_CONTENT_REVALIDATE_SECONDS,
  PUBLIC_CONTENT_TAGS,
} from "@/lib/public-content-cache";
import { safeSettingsRead } from "@/modules/site-settings/public-settings-core";
import {
  EMPTY_PUBLIC_CATALOGUE,
  toPublicCatalogue,
  type PublicConsultationCatalogue,
  type PublicCatalogueContext,
} from "@/modules/site-settings/public-catalogue-core";

const SINGLETON_KEY = "default";

/**
 * Global availability + WhatsApp base link, taken from the Consultation settings singleton
 * ONLY when it is published (`isEnabled`). While Consultation is not activated this returns
 * the safe off-state and no link — nothing about the number is exposed.
 */
async function readCatalogueContext(): Promise<PublicCatalogueContext> {
  const row = await getPrisma().consultationSettings.findUnique({
    where: { singletonKey: SINGLETON_KEY },
    select: { settingsJson: true },
  });
  if (!row || row.settingsJson == null) return { globalAvailability: "UNAVAILABLE", whatsappBaseUrl: null };
  const parsed = consultationConfigSchema.safeParse(row.settingsJson);
  if (!parsed.success || parsed.data.isEnabled !== true) {
    return { globalAvailability: "UNAVAILABLE", whatsappBaseUrl: null };
  }
  return {
    globalAvailability: parsed.data.availabilityStatus,
    // Base link only — no prefilled message, and the raw number is never returned as a field.
    whatsappBaseUrl: null,
  };
}

// Perf: the projected catalogue is cached (tagged with the catalogue AND the settings tag,
// since global availability comes from the settings singleton); Admin writes invalidate it.
// A transient database failure falls back per-request without caching the empty catalogue.
const readPublicConsultationCatalogue = unstable_cache(
  async (): Promise<PublicConsultationCatalogue> => {
    const repo = createPrismaCatalogueRepository(getPrisma());
    const [tiers, context] = await Promise.all([repo.listPublishedCatalogue(), readCatalogueContext()]);
    return toPublicCatalogue(tiers, context);
  },
  ["public-consultation-catalogue"],
  {
    tags: [
      PUBLIC_CONTENT_TAGS.consultationCatalogue,
      PUBLIC_CONTENT_TAGS.consultationSettings,
    ],
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
  },
);

/** The public Consultation catalogue, or the controlled empty catalogue. */
export async function getPublicConsultationCatalogue(): Promise<PublicConsultationCatalogue> {
  return safeSettingsRead(() => readPublicConsultationCatalogue(), EMPTY_PUBLIC_CATALOGUE);
}
