import { Card } from "@/components/ui/card";
import {
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumStatusBadge,
} from "@/components/ui/premium";
import type {
  ModeRecord,
  UtilityRecord,
} from "@/modules/admin/consultation-catalogue/types";
import {
  ConsultationSelectionJourney,
  type ConsultationJourneyTier,
} from "@/modules/consultations/components/consultation-selection-journey";
import { ConsultationUtilitySelectButton } from "@/modules/consultations/components/consultation-utility-select-button";

// Internal merchandising fields (priceType / regularPrice / isPriority) are OPTIONAL: the
// Admin preview passes them, the public surface never receives them, so they cannot appear in
// public HTML or the RSC payload.
export type ConsultationDisplayMode = Pick<
  ModeRecord,
  "id" | "slug" | "name" | "shortDescription" | "currency" | "launchPrice" | "priceLabel" | "travelExcluded"
> &
  Partial<Pick<ModeRecord, "priceType" | "regularPrice">>;

export type ConsultationDisplayUtility = Pick<
  UtilityRecord,
  | "id"
  | "slug"
  | "name"
  | "currency"
  | "launchPrice"
  | "priceLabel"
  | "requiresScopeReview"
  | "travelExcluded"
  | "availabilityStatus"
> &
  Partial<Pick<UtilityRecord, "priceType" | "regularPrice" | "isPriority" | "publicationState">> & {
    modes: ConsultationDisplayMode[];
  };

export type ConsultationDisplayTier = {
  id: string;
  slug: string;
  name: string;
  availabilityStatus: UtilityRecord["availabilityStatus"];
  publicationState?: UtilityRecord["publicationState"];
  utilities: ConsultationDisplayUtility[];
};

type ConsultationCatalogueDisplayProps = {
  tiers: readonly ConsultationDisplayTier[];
  heading?: string;
  whatsappBaseUrl?: string | null;
  whatsappHandoffEndpoint?: string | null;
  audience?: "admin" | "public";
};

function formatRupees(value: number | null, currency: string) {
  if (value == null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-IN", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function priceSummary(
  item: Pick<ConsultationDisplayUtility | ConsultationDisplayMode, "currency" | "launchPrice" | "priceLabel"> &
    Partial<Pick<UtilityRecord, "priceType">>,
) {
  if (item.priceLabel) {
    return item.priceLabel;
  }

  if (item.launchPrice == null) {
    return item.priceType === "FROM" ? "Scope review" : "Not set";
  }

  return `${item.priceType === "FROM" ? "From " : ""}${formatRupees(item.launchPrice, item.currency)}`;
}

/**
 * The single visitor-facing price. Approved `priceLabel` wins (e.g. "From ₹4,999"); otherwise
 * the launch price is shown plainly (₹299). Returns null when the utility is priced by its
 * modes or has no approved price, so the card renders nothing rather than "Not set".
 */
function publicPrice(
  item: Pick<ConsultationDisplayUtility | ConsultationDisplayMode, "currency" | "launchPrice" | "priceLabel">,
): string | null {
  if (item.priceLabel?.trim()) return item.priceLabel.trim();
  if (item.launchPrice == null) return null;
  return formatRupees(item.launchPrice, item.currency);
}

function FlagList({
  showInternalState,
  utility,
}: Readonly<{ showInternalState: boolean; utility: ConsultationDisplayUtility }>) {
  return (
    <ul aria-label={`${utility.name} states`} className="flex min-w-0 flex-wrap gap-2">
      {showInternalState && utility.isPriority ? (
        <li>
          <PremiumStatusBadge status="LIVE">Priority</PremiumStatusBadge>
        </li>
      ) : null}
      {utility.requiresScopeReview ? (
        <li>
          <PremiumStatusBadge status="COMING_SOON">Scope review</PremiumStatusBadge>
        </li>
      ) : null}
      {utility.travelExcluded ? (
        <li>
          <PremiumStatusBadge status="NEUTRAL">Travel excluded</PremiumStatusBadge>
        </li>
      ) : null}
      <li>
        <PremiumStatusBadge status="NEUTRAL">{utility.availabilityStatus}</PremiumStatusBadge>
      </li>
      {showInternalState && utility.publicationState ? (
        <li>
          <PremiumStatusBadge status="NEUTRAL">{utility.publicationState}</PremiumStatusBadge>
        </li>
      ) : null}
    </ul>
  );
}

/** Admin-only internal pricing breakdown. Never rendered on the public surface. */
function PriceRows({ utility }: Readonly<{ utility: ConsultationDisplayUtility }>) {
  return (
    <dl className="grid gap-3 text-sm">
      <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
        <dt className="font-medium text-[color:var(--ui-color-text-muted)]">Price label</dt>
        <dd className="break-words font-semibold text-[color:var(--ui-color-text-primary)]">
          {priceSummary(utility)}
        </dd>
      </div>
      <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
        <dt className="font-medium text-[color:var(--ui-color-text-muted)]">Launch</dt>
        <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
          {formatRupees(utility.launchPrice, utility.currency)}
        </dd>
      </div>
      <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
        <dt className="font-medium text-[color:var(--ui-color-text-muted)]">Regular</dt>
        <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
          {formatRupees(utility.regularPrice ?? null, utility.currency)}
        </dd>
      </div>
      <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
        <dt className="font-medium text-[color:var(--ui-color-text-muted)]">Price type</dt>
        <dd className="font-semibold text-[color:var(--ui-color-text-primary)]">
          {utility.priceType}
        </dd>
      </div>
    </dl>
  );
}

function ModeList({ utility }: Readonly<{ utility: ConsultationDisplayUtility }>) {
  if (!utility.modes.length) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-muted)] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
        Modes
      </p>
      <ul className="grid gap-2">
        {utility.modes.map((mode) => (
          <li
            className="grid gap-2 rounded-[var(--ui-radius-md)] border border-[color:var(--ui-color-border-muted)] px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto]"
            key={mode.id}
          >
            <div className="min-w-0">
              <p className="break-words font-semibold text-[color:var(--ui-color-text-primary)]">
                {mode.name}
              </p>
              <p className="mt-1 text-xs font-medium text-[color:var(--ui-color-text-muted)]">
                {publicPrice(mode) ?? priceSummary(mode)}
              </p>
            </div>
            {mode.travelExcluded ? (
              <PremiumStatusBadge status="NEUTRAL">Travel excluded</PremiumStatusBadge>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function UtilityCard({
  audience,
  tierSlug,
  utility,
}: Readonly<{ audience: "admin" | "public"; tierSlug: string; utility: ConsultationDisplayUtility }>) {
  const isAvailable = utility.availabilityStatus === "AVAILABLE";
  const showInternalState = audience === "admin";
  const visitorPrice = publicPrice(utility);

  return (
    <Card
      className="flex min-h-full min-w-0 flex-col gap-4"
      data-consultation-utility={utility.slug}
      // Public cards are uniformly muted: the accent tone is derived from the internal
      // priority flag and must not signal internal merchandising to visitors.
      tone={showInternalState && utility.isPriority ? "accent" : "muted"}
    >
      <div className="space-y-3">
        <FlagList showInternalState={showInternalState} utility={utility} />
        <h3 className="break-words text-base font-semibold leading-tight text-[color:var(--ui-color-text-primary)]">
          {utility.name}
        </h3>
        {showInternalState ? (
          <p className="text-xs font-medium uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
            {utility.slug}
          </p>
        ) : null}
      </div>
      {showInternalState ? (
        <PriceRows utility={utility} />
      ) : visitorPrice ? (
        <p className="text-lg font-semibold text-[color:var(--ui-color-text-primary)]">{visitorPrice}</p>
      ) : null}
      <ModeList utility={utility} />
      {isAvailable ? (
        <div className="mt-auto">
          <ConsultationUtilitySelectButton
            label={utility.requiresScopeReview ? "Request Scope Review" : "Select This Consultation"}
            tierSlug={tierSlug}
            utilitySlug={utility.slug}
          />
        </div>
      ) : null}
    </Card>
  );
}

/**
 * Map display tiers onto the client journey's props.
 *
 * Internal fields are spread in ONLY when present. Writing them unconditionally would put
 * `"priceType":"$undefined"` style keys into the RSC flight payload — i.e. the internal field
 * names would still ship inside public HTML even though nothing renders them.
 */
function toJourneyTiers(tiers: readonly ConsultationDisplayTier[]): ConsultationJourneyTier[] {
  return tiers.map((tier) => ({
    id: tier.id,
    slug: tier.slug,
    name: tier.name,
    availabilityStatus: tier.availabilityStatus,
    ...(tier.publicationState === undefined ? {} : { publicationState: tier.publicationState }),
    utilities: tier.utilities.map((utility) => ({
      id: utility.id,
      slug: utility.slug,
      name: utility.name,
      currency: utility.currency,
      launchPrice: utility.launchPrice,
      priceLabel: utility.priceLabel,
      requiresScopeReview: utility.requiresScopeReview,
      travelExcluded: utility.travelExcluded,
      availabilityStatus: utility.availabilityStatus,
      ...(utility.priceType === undefined ? {} : { priceType: utility.priceType }),
      ...(utility.regularPrice === undefined ? {} : { regularPrice: utility.regularPrice }),
      ...(utility.isPriority === undefined ? {} : { isPriority: utility.isPriority }),
      ...(utility.publicationState === undefined ? {} : { publicationState: utility.publicationState }),
      modes: utility.modes.map((mode) => ({
        id: mode.id,
        slug: mode.slug,
        name: mode.name,
        currency: mode.currency,
        launchPrice: mode.launchPrice,
        priceLabel: mode.priceLabel,
        travelExcluded: mode.travelExcluded,
        ...(mode.priceType === undefined ? {} : { priceType: mode.priceType }),
        ...(mode.regularPrice === undefined ? {} : { regularPrice: mode.regularPrice }),
      })),
    })),
  }));
}

export function ConsultationCatalogueDisplay({
  audience = "admin",
  tiers,
  heading = "Consultation Preview",
  whatsappBaseUrl = null,
  whatsappHandoffEndpoint = null,
}: Readonly<ConsultationCatalogueDisplayProps>) {
  const totalUtilities = tiers.reduce((sum, tier) => sum + tier.utilities.length, 0);
  const journeyTiers = toJourneyTiers(tiers);
  const isPublic = audience === "public";

  return (
    <section
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      data-consultation-catalogue
      data-consultation-preview={isPublic ? undefined : ""}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-accent-gold)]">
          {isPublic ? "Consultation" : "Private Admin"}
        </p>
        <h1 className="font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
          {heading}
        </h1>
        <p className="max-w-2xl text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
          {isPublic
            ? "Select one consultation, review the scope and continue with the approved WhatsApp handoff."
            : "Draft catalogue preview for approved administrators. These records are not part of the public Consultation surface."}
        </p>
      </div>

      <nav aria-label="Consultation tiers" className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {tiers.map((tier) => (
          <a
            className="shrink-0 rounded-full border border-[color:var(--ui-color-border-gold)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--ui-color-text-primary)]"
            href={`#tier-${tier.slug}`}
            key={tier.id}
          >
            {tier.name}
          </a>
        ))}
      </nav>

      <Card className="grid gap-3 sm:grid-cols-3" tone="muted">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
            Tiers
          </p>
          <p className="mt-1 text-xl font-semibold text-[color:var(--ui-color-text-primary)]">
            {tiers.length}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
            Utilities
          </p>
          <p className="mt-1 text-xl font-semibold text-[color:var(--ui-color-text-primary)]">
            {totalUtilities}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
            {isPublic ? "Status" : "Publication"}
          </p>
          <p className="mt-1 text-xl font-semibold text-[color:var(--ui-color-text-primary)]">
            {isPublic ? "Live" : "Draft"}
          </p>
        </div>
      </Card>

      <ConsultationSelectionJourney
        showPublicationState={!isPublic}
        tiers={journeyTiers}
        whatsappBaseUrl={whatsappBaseUrl}
        whatsappHandoffEndpoint={whatsappHandoffEndpoint}
      />

      {tiers.map((tier) => (
        <PremiumBentoSection
          className="pt-0"
          id={`tier-${tier.slug}`}
          key={tier.id}
          label={`${tier.name} - ${tier.utilities.length}`}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isPublic ? null : <PremiumStatusBadge status="NEUTRAL">{tier.publicationState}</PremiumStatusBadge>}
            <PremiumStatusBadge status="NEUTRAL">{tier.availabilityStatus}</PremiumStatusBadge>
          </div>
          <PremiumBentoGrid className="sm:grid-cols-2 xl:grid-cols-3">
            {tier.utilities.map((utility) => (
              <UtilityCard audience={audience} key={utility.id} tierSlug={tier.slug} utility={utility} />
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>
      ))}
    </section>
  );
}
