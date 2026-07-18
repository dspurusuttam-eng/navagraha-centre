import { Card } from "@/components/ui/card";
import {
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumStatusBadge,
} from "@/components/ui/premium";
import type {
  ModeRecord,
  TierWithUtilities,
  UtilityRecord,
} from "@/modules/admin/consultation-catalogue/types";
import {
  ConsultationSelectionJourney,
  type ConsultationJourneyTier,
} from "@/modules/consultations/components/consultation-selection-journey";

type ConsultationCatalogueDisplayProps = {
  tiers: readonly TierWithUtilities[];
  heading?: string;
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

function priceSummary(item: Pick<UtilityRecord | ModeRecord, "currency" | "launchPrice" | "priceLabel" | "priceType">) {
  if (item.priceLabel) {
    return item.priceLabel;
  }

  if (item.launchPrice == null) {
    return item.priceType === "FROM" ? "Scope review" : "Not set";
  }

  return `${item.priceType === "FROM" ? "From " : ""}${formatRupees(item.launchPrice, item.currency)}`;
}

function FlagList({ utility }: Readonly<{ utility: UtilityRecord }>) {
  return (
    <ul aria-label={`${utility.name} states`} className="flex min-w-0 flex-wrap gap-2">
      {utility.isPriority ? (
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
      <li>
        <PremiumStatusBadge status="NEUTRAL">{utility.publicationState}</PremiumStatusBadge>
      </li>
    </ul>
  );
}

function PriceRows({ utility }: Readonly<{ utility: UtilityRecord }>) {
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
          {formatRupees(utility.regularPrice, utility.currency)}
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

function ModeList({ utility }: Readonly<{ utility: UtilityRecord }>) {
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
                {mode.priceType} - {priceSummary(mode)}
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

function UtilityCard({ utility }: Readonly<{ utility: UtilityRecord }>) {
  return (
    <Card
      className="flex min-h-full min-w-0 flex-col gap-4"
      data-consultation-utility={utility.slug}
      tone={utility.isPriority ? "accent" : "muted"}
    >
      <div className="space-y-3">
        <FlagList utility={utility} />
        <h3 className="break-words text-base font-semibold leading-tight text-[color:var(--ui-color-text-primary)]">
          {utility.name}
        </h3>
        <p className="text-xs font-medium uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]">
          {utility.slug}
        </p>
      </div>
      <PriceRows utility={utility} />
      <ModeList utility={utility} />
    </Card>
  );
}

function toJourneyTiers(tiers: readonly TierWithUtilities[]): ConsultationJourneyTier[] {
  return tiers.map((tier) => ({
    id: tier.id,
    slug: tier.slug,
    name: tier.name,
    availabilityStatus: tier.availabilityStatus,
    publicationState: tier.publicationState,
    utilities: tier.utilities.map((utility) => ({
      id: utility.id,
      slug: utility.slug,
      name: utility.name,
      priceType: utility.priceType,
      currency: utility.currency,
      launchPrice: utility.launchPrice,
      regularPrice: utility.regularPrice,
      priceLabel: utility.priceLabel,
      requiresScopeReview: utility.requiresScopeReview,
      travelExcluded: utility.travelExcluded,
      isPriority: utility.isPriority,
      availabilityStatus: utility.availabilityStatus,
      publicationState: utility.publicationState,
      modes: utility.modes.map((mode) => ({
        id: mode.id,
        slug: mode.slug,
        name: mode.name,
        priceType: mode.priceType,
        currency: mode.currency,
        launchPrice: mode.launchPrice,
        regularPrice: mode.regularPrice,
        priceLabel: mode.priceLabel,
        travelExcluded: mode.travelExcluded,
      })),
    })),
  }));
}

export function ConsultationCatalogueDisplay({
  tiers,
  heading = "Consultation Preview",
}: Readonly<ConsultationCatalogueDisplayProps>) {
  const totalUtilities = tiers.reduce((sum, tier) => sum + tier.utilities.length, 0);
  const journeyTiers = toJourneyTiers(tiers);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-consultation-preview>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-accent-gold)]">
          Private Admin
        </p>
        <h1 className="font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
          {heading}
        </h1>
        <p className="max-w-2xl text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
          Draft catalogue preview for approved administrators. These records are not part of the public Consultation surface.
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
            Publication
          </p>
          <p className="mt-1 text-xl font-semibold text-[color:var(--ui-color-text-primary)]">
            Draft
          </p>
        </div>
      </Card>

      <ConsultationSelectionJourney tiers={journeyTiers} />

      {tiers.map((tier) => (
        <PremiumBentoSection
          className="pt-0"
          id={`tier-${tier.slug}`}
          key={tier.id}
          label={`${tier.name} - ${tier.utilities.length}`}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <PremiumStatusBadge status="NEUTRAL">{tier.publicationState}</PremiumStatusBadge>
            <PremiumStatusBadge status="NEUTRAL">{tier.availabilityStatus}</PremiumStatusBadge>
          </div>
          <PremiumBentoGrid className="sm:grid-cols-2 xl:grid-cols-3">
            {tier.utilities.map((utility) => (
              <UtilityCard key={utility.id} utility={utility} />
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>
      ))}
    </section>
  );
}
