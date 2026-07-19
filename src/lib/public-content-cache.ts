// Public-content server cache contract.
//
// Every public page is dynamically rendered (locale comes from the request), so before this
// module each navigation re-ran the same Neon queries (settings, brand, catalogue, Desk
// articles) and mobile route changes stalled for the full database round trips. Public reads
// are now served from `unstable_cache` entries keyed by the tags below; Admin writes
// invalidate the matching tag, and `PUBLIC_CONTENT_REVALIDATE_SECONDS` is the freshness
// backstop for out-of-band writes (e.g. CLI imports).
import { revalidateTag } from "next/cache";

export const PUBLIC_CONTENT_TAGS = {
  /** Public consultation settings singleton (availability, tagline, WhatsApp link). */
  consultationSettings: "public-consultation-settings",
  /** Public brand/profile settings singleton (footer, Acharya identity). */
  brandSettings: "public-brand-settings",
  /** Published consultation catalogue (tiers/utilities/modes). */
  consultationCatalogue: "public-consultation-catalogue",
  /** Published Desk articles (lists, article bodies, cover images). */
  deskContent: "public-desk-content",
} as const;

export type PublicContentTag =
  (typeof PUBLIC_CONTENT_TAGS)[keyof typeof PUBLIC_CONTENT_TAGS];

/** Freshness backstop when a write path bypasses tag invalidation. */
export const PUBLIC_CONTENT_REVALIDATE_SECONDS = 300;

/**
 * Invalidate a public-content tag after a successful Admin write.
 * Best-effort by design: invalidation is an optimisation, so it must never turn a
 * completed write into a failure (revalidateTag throws outside a request scope, e.g.
 * when the same service code runs from a CLI import script).
 */
export function invalidatePublicContent(...tags: readonly PublicContentTag[]) {
  for (const tag of tags) {
    try {
      // "max" = expire the tag immediately for all readers (classic revalidateTag semantics).
      revalidateTag(tag, "max");
    } catch {
      // Outside a Next request scope — the revalidate window covers freshness instead.
    }
  }
}
