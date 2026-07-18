"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PremiumStatusBadge } from "@/components/ui/premium";
import { cn } from "@/lib/cn";
import type {
  CatalogueAvailability,
  ConsultationPriceType,
  ConsultationPublicationState,
} from "@/modules/admin/consultation-catalogue/domain";
import {
  buildGeneralEnquiryMessage,
  buildSelectedConsultationMessage,
  buildWhatsappHandoffUrl,
} from "@/modules/consultations/whatsapp-handoff";

export type ConsultationJourneyMode = {
  id: string;
  slug: string;
  name: string;
  priceType: ConsultationPriceType;
  currency: string;
  launchPrice: number | null;
  regularPrice: number | null;
  priceLabel: string | null;
  travelExcluded: boolean;
};

export type ConsultationJourneyUtility = {
  id: string;
  slug: string;
  name: string;
  priceType: ConsultationPriceType;
  currency: string;
  launchPrice: number | null;
  regularPrice: number | null;
  priceLabel: string | null;
  requiresScopeReview: boolean;
  travelExcluded: boolean;
  isPriority: boolean;
  availabilityStatus: CatalogueAvailability;
  publicationState: ConsultationPublicationState;
  modes: ConsultationJourneyMode[];
};

export type ConsultationJourneyTier = {
  id: string;
  slug: string;
  name: string;
  availabilityStatus: CatalogueAvailability;
  publicationState: ConsultationPublicationState;
  utilities: ConsultationJourneyUtility[];
};

type JourneyStage = "tier" | "utility" | "mode" | "intake" | "review";
type EnquiryMode = "selected" | "general";

type ConsultationSelectionJourneyProps = {
  tiers: readonly ConsultationJourneyTier[];
  whatsappBaseUrl: string | null;
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
  item: Pick<
    ConsultationJourneyUtility | ConsultationJourneyMode,
    "currency" | "launchPrice" | "priceLabel" | "priceType"
  >,
) {
  if (item.priceLabel) {
    return item.priceLabel;
  }

  if (item.launchPrice == null) {
    return item.priceType === "FROM" ? "Scope review" : "Not set";
  }

  return `${item.priceType === "FROM" ? "From " : ""}${formatRupees(item.launchPrice, item.currency)}`;
}

function priceDetails(
  item: Pick<
    ConsultationJourneyUtility | ConsultationJourneyMode,
    "currency" | "launchPrice" | "priceLabel" | "priceType" | "regularPrice"
  >,
) {
  return [
    ["Price label", priceSummary(item)],
    ["Launch", formatRupees(item.launchPrice, item.currency)],
    ["Regular", formatRupees(item.regularPrice, item.currency)],
    ["Price type", item.priceType],
  ] as const;
}

function selectableClass(selected: boolean) {
  return cn(
    "w-full min-w-0 rounded-[var(--ui-radius-xl)] border bg-white p-4 text-left shadow-[var(--ui-shadow-sm)] transition [transition-duration:var(--ui-motion-base)] [transition-timing-function:var(--ui-ease-emphasized)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    selected
      ? "border-[color:var(--ui-color-border-gold)] shadow-[var(--ui-shadow-md)]"
      : "border-[color:var(--ui-color-border-subtle)] hover:-translate-y-0.5 hover:border-[color:var(--ui-color-border-gold)]",
  );
}

function StateFlags({ utility }: Readonly<{ utility: ConsultationJourneyUtility }>) {
  return (
    <span className="flex min-w-0 flex-wrap gap-2">
      {utility.isPriority ? <PremiumStatusBadge status="LIVE">Priority</PremiumStatusBadge> : null}
      {utility.requiresScopeReview ? (
        <PremiumStatusBadge status="COMING_SOON">Scope review</PremiumStatusBadge>
      ) : null}
      {utility.travelExcluded ? (
        <PremiumStatusBadge status="NEUTRAL">Travel excluded</PremiumStatusBadge>
      ) : null}
      <PremiumStatusBadge status="NEUTRAL">{utility.availabilityStatus}</PremiumStatusBadge>
      <PremiumStatusBadge status="NEUTRAL">{utility.publicationState}</PremiumStatusBadge>
    </span>
  );
}

function PriceList({
  item,
}: Readonly<{
  item: Pick<
    ConsultationJourneyUtility | ConsultationJourneyMode,
    "currency" | "launchPrice" | "priceLabel" | "priceType" | "regularPrice"
  >;
}>) {
  return (
    <dl className="grid gap-2 text-sm">
      {priceDetails(item).map(([label, value]) => (
        <div className="grid min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] gap-3" key={label}>
          <dt className="font-medium text-[color:var(--ui-color-text-muted)]">{label}</dt>
          <dd className="break-words font-semibold text-[color:var(--ui-color-text-primary)]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ConsultationSelectionJourney({
  tiers,
  whatsappBaseUrl,
}: Readonly<ConsultationSelectionJourneyProps>) {
  const concernId = useId();
  const errorId = useId();
  const handoffStatusId = useId();
  const [stage, setStage] = useState<JourneyStage>("tier");
  const [enquiryMode, setEnquiryMode] = useState<EnquiryMode>("selected");
  const [selectedTierSlug, setSelectedTierSlug] = useState<string | null>(null);
  const [selectedUtilitySlug, setSelectedUtilitySlug] = useState<string | null>(null);
  const [selectedModeSlug, setSelectedModeSlug] = useState<string | null>(null);
  const [mainConcern, setMainConcern] = useState("");
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [handoffError, setHandoffError] = useState<string | null>(null);

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.slug === selectedTierSlug) ?? null,
    [tiers, selectedTierSlug],
  );
  const selectedUtility = useMemo(
    () => selectedTier?.utilities.find((utility) => utility.slug === selectedUtilitySlug) ?? null,
    [selectedTier, selectedUtilitySlug],
  );
  const selectedMode = useMemo(
    () => selectedUtility?.modes.find((mode) => mode.slug === selectedModeSlug) ?? null,
    [selectedModeSlug, selectedUtility],
  );
  const effectivePrice = selectedMode ?? selectedUtility;
  const needsMode = Boolean(selectedUtility?.modes.length);
  const canStartIntake = Boolean(selectedUtility && (!needsMode || selectedMode));
  const hasValidConcern = Boolean(mainConcern.trim());
  const canContinueSelected =
    enquiryMode === "selected" &&
    stage === "review" &&
    Boolean(selectedTier && selectedUtility && effectivePrice) &&
    hasValidConcern;
  const canContinueGeneral = enquiryMode === "general" && stage === "review" && hasValidConcern;

  function resetJourney() {
    setStage("tier");
    setSelectedTierSlug(null);
    setSelectedUtilitySlug(null);
    setSelectedModeSlug(null);
    setMainConcern("");
    setIntakeError(null);
    setHandoffError(null);
    setEnquiryMode("selected");
  }

  function chooseTier(tier: ConsultationJourneyTier) {
    setEnquiryMode("selected");
    setSelectedTierSlug(tier.slug);
    setSelectedUtilitySlug(null);
    setSelectedModeSlug(null);
    setMainConcern("");
    setIntakeError(null);
    setHandoffError(null);
    setStage("utility");
  }

  function chooseUtility(utility: ConsultationJourneyUtility) {
    if (utility.availabilityStatus !== "AVAILABLE") {
      return;
    }
    setSelectedUtilitySlug(utility.slug);
    setSelectedModeSlug(null);
    setMainConcern("");
    setIntakeError(null);
    setHandoffError(null);
    setStage(utility.modes.length ? "mode" : "utility");
  }

  function startGeneralEnquiry() {
    setEnquiryMode("general");
    setSelectedTierSlug(null);
    setSelectedUtilitySlug(null);
    setSelectedModeSlug(null);
    setMainConcern("");
    setIntakeError(null);
    setHandoffError(null);
    setStage("intake");
  }

  function startIntake() {
    if (!selectedUtility) {
      setStage("utility");
      return;
    }
    if (needsMode && !selectedMode) {
      setStage("mode");
      return;
    }
    setEnquiryMode("selected");
    setIntakeError(null);
    setHandoffError(null);
    setStage("intake");
  }

  function reviewScopeAndPrice() {
    if (!mainConcern.trim()) {
      setIntakeError("Main Concern is required.");
      setStage("intake");
      return;
    }
    setIntakeError(null);
    setHandoffError(null);
    setStage("review");
  }

  function continueOnWhatsapp() {
    if (!mainConcern.trim()) {
      setIntakeError("Main Concern is required.");
      setStage("intake");
      return;
    }

    const message =
      enquiryMode === "general"
        ? buildGeneralEnquiryMessage({ concern: mainConcern })
        : selectedTier && selectedUtility && effectivePrice
          ? buildSelectedConsultationMessage({
              concern: mainConcern,
              modeName: selectedMode?.name ?? null,
              priceLabel: priceSummary(effectivePrice),
              tierName: selectedTier.name,
              utilityName: selectedUtility.name,
            })
          : null;

    const handoffUrl = message ? buildWhatsappHandoffUrl(whatsappBaseUrl, message) : null;
    if (!handoffUrl) {
      setHandoffError("WhatsApp handoff is unavailable for this preview.");
      return;
    }

    resetJourney();
    window.location.assign(handoffUrl);
  }

  return (
    <section
      aria-label="Consultation selection journey"
      className="grid min-w-0 gap-5"
      data-consultation-journey
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-accent-gold)]">
            Selection Journey
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-sm)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
            Tier to Scope Review
          </h2>
        </div>
        <Button onClick={resetJourney} size="sm" tone="secondary">
          Reset
        </Button>
      </div>

      <Card className="grid gap-3" tone="muted">
        <div className="grid gap-1">
          <p className="text-base font-semibold text-[color:var(--ui-color-text-primary)]">
            One Fee. Complete Solution. No Clock Running.
          </p>
          <p className="text-sm font-semibold text-[color:var(--ui-color-text-secondary)]">
            One-time case fee · No per-minute billing.
          </p>
        </div>
        <p className="text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
          Preferred Language: ENGLISH
        </p>
        <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
          The fee applies to one selected concern. There is no per-minute or call-duration billing. Outcomes are not promised and service scope stays limited to the selected concern.
        </p>
        <Button className="justify-self-start" onClick={startGeneralEnquiry} size="sm" tone="secondary">
          Ask Before Booking
        </Button>
      </Card>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => {
          const selected = tier.slug === selectedTierSlug;
          return (
            <button
              aria-pressed={selected}
              className={selectableClass(selected)}
              data-journey-tier={tier.slug}
              key={tier.id}
              onClick={() => chooseTier(tier)}
              type="button"
            >
              <span className="flex min-w-0 flex-col gap-3">
                <span className="flex min-w-0 flex-wrap gap-2">
                  <PremiumStatusBadge status={selected ? "LIVE" : "NEUTRAL"}>
                    {selected ? "Selected" : tier.publicationState}
                  </PremiumStatusBadge>
                  <PremiumStatusBadge status="NEUTRAL">
                    {tier.utilities.length} services
                  </PremiumStatusBadge>
                </span>
                <span className="break-words text-base font-semibold text-[color:var(--ui-color-text-primary)]">
                  {tier.name}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-accent-gold)]">
                  View Services
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selectedTier ? (
        <Card className="grid min-w-0 gap-4" data-journey-utilities>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[color:var(--ui-color-text-primary)]">
              {selectedTier.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-[color:var(--ui-color-text-muted)]">
              Select one consultation from this tier.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {selectedTier.utilities.map((utility) => {
              const selected = utility.slug === selectedUtilitySlug;
              const isUnavailable = utility.availabilityStatus !== "AVAILABLE";
              return (
                <article
                  className={cn(
                    "grid min-w-0 gap-4 rounded-[var(--ui-radius-xl)] border bg-white p-4 shadow-[var(--ui-shadow-sm)]",
                    selected
                      ? "border-[color:var(--ui-color-border-gold)]"
                      : "border-[color:var(--ui-color-border-subtle)]",
                    isUnavailable ? "opacity-70" : "",
                  )}
                  data-journey-utility={utility.slug}
                  key={utility.id}
                >
                  <div className="space-y-3">
                    <StateFlags utility={utility} />
                    <h4 className="break-words text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
                      {utility.name}
                    </h4>
                  </div>
                  <PriceList item={utility} />
                  <Button
                    aria-pressed={selected}
                    disabled={isUnavailable}
                    fullWidth
                    onClick={() => chooseUtility(utility)}
                    tone={utility.requiresScopeReview ? "secondary" : "accent"}
                  >
                    {utility.requiresScopeReview ? "Request Scope Review" : "Select This Consultation"}
                  </Button>
                </article>
              );
            })}
          </div>
        </Card>
      ) : null}

      {selectedUtility?.modes.length ? (
        <Card className="grid min-w-0 gap-4" data-journey-vastu-modes tone="muted">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[color:var(--ui-color-text-primary)]">
              Residential Vastu Mode
            </h3>
            <p className="mt-1 text-sm font-medium text-[color:var(--ui-color-text-muted)]">
              Remote or On-site mode is required before case intake.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {selectedUtility.modes.map((mode) => {
              const selected = mode.slug === selectedModeSlug;
              return (
                <button
                  aria-pressed={selected}
                  className={selectableClass(selected)}
                  data-journey-vastu-mode={mode.slug}
                  key={mode.id}
                  onClick={() => {
                    setSelectedModeSlug(mode.slug);
                    setIntakeError(null);
                    setHandoffError(null);
                  }}
                  type="button"
                >
                  <span className="grid min-w-0 gap-3">
                    <span className="break-words text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
                      {mode.name}
                    </span>
                    <PriceList item={mode} />
                    {mode.travelExcluded ? (
                      <PremiumStatusBadge status="NEUTRAL">Travel excluded</PremiumStatusBadge>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      ) : null}

      {selectedUtility || enquiryMode === "general" ? (
        <Card className="grid min-w-0 gap-4" data-enquiry-mode={enquiryMode}>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[color:var(--ui-color-text-primary)]">
                Case Intake
              </h3>
              <p className="mt-1 text-sm font-medium text-[color:var(--ui-color-text-muted)]">
                {enquiryMode === "general"
                  ? "General enquiry: Main Concern is required before WhatsApp handoff."
                  : "Selected consultation: Main Concern is required before scope review."}
              </p>
            </div>
            {enquiryMode === "selected" ? (
              <Button disabled={!canStartIntake} onClick={startIntake} size="sm" tone="secondary">
                Start Case Intake
              </Button>
            ) : null}
          </div>
          {stage === "intake" || stage === "review" ? (
            <div className="grid min-w-0 gap-2">
              <label
                className="text-sm font-semibold text-[color:var(--ui-color-text-primary)]"
                htmlFor={concernId}
              >
                Main Concern
              </label>
              <textarea
                aria-describedby={intakeError ? errorId : undefined}
                aria-invalid={Boolean(intakeError)}
                className="min-h-32 min-w-0 resize-y rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-subtle)] bg-white px-4 py-3 text-sm font-medium text-[color:var(--ui-color-text-primary)] shadow-[var(--ui-shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                id={concernId}
                onChange={(event) => {
                  setMainConcern(event.target.value);
                  if (event.target.value.trim()) {
                    setIntakeError(null);
                  }
                  setHandoffError(null);
                }}
                value={mainConcern}
              />
              {intakeError ? (
                <p className="text-sm font-semibold text-red-700" id={errorId} role="alert">
                  {intakeError}
                </p>
              ) : null}
              <Button onClick={reviewScopeAndPrice}>Review Scope & Price</Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      {stage === "review" && enquiryMode === "general" ? (
        <Card className="grid min-w-0 gap-4" data-journey-review tone="accent">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-accent-gold)]">
              General Enquiry Review
            </p>
            <h3 className="mt-1 text-base font-semibold text-[color:var(--ui-color-text-primary)]">
              Ask Before Booking
            </h3>
          </div>
          <div className="grid min-w-0 gap-2 text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
            <p>Preferred Language: ENGLISH</p>
            <p>One-time case fee and no per-minute billing.</p>
          </div>
          <Button disabled={!canContinueGeneral} onClick={continueOnWhatsapp}>
            Ask Before Booking
          </Button>
        </Card>
      ) : null}

      {stage === "review" && enquiryMode === "selected" && selectedTier && selectedUtility && effectivePrice ? (
        <Card className="grid min-w-0 gap-4" data-journey-review tone="accent">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-accent-gold)]">
              Scope and Price Review
            </p>
            <h3 className="mt-1 text-base font-semibold text-[color:var(--ui-color-text-primary)]">
              Review Summary
            </h3>
          </div>
          <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-2">
            {[
              ["Selected tier", selectedTier.name],
              ["Selected consultation", selectedUtility.name],
              ["Selected Vastu mode", selectedMode?.name ?? "Not applicable"],
              ["Exact backend price label", priceSummary(effectivePrice)],
              ["Preferred Language", "ENGLISH"],
            ].map(([label, value]) => (
              <div className="min-w-0" key={label}>
                <dt className="font-medium text-[color:var(--ui-color-text-muted)]">{label}</dt>
                <dd className="mt-1 break-words font-semibold text-[color:var(--ui-color-text-primary)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="grid min-w-0 gap-2 text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
            <p>One selected concern is reviewed for one case fee.</p>
            {selectedUtility.requiresScopeReview ? (
              <p>Scope review is required before final confirmation.</p>
            ) : null}
            {selectedUtility.travelExcluded || selectedMode?.travelExcluded ? (
              <p>Travel is excluded from the displayed consultation fee.</p>
            ) : null}
          </div>
          <Button disabled={!canContinueSelected} onClick={continueOnWhatsapp}>
            Continue on WhatsApp
          </Button>
        </Card>
      ) : null}

      <p
        aria-live="polite"
        className="min-h-5 text-sm font-semibold text-red-700"
        id={handoffStatusId}
        role={handoffError ? "alert" : "status"}
      >
        {handoffError}
      </p>
    </section>
  );
}
