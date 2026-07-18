import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CONSULTATION_CATALOGUE_BLUEPRINT,
  EXPECTED_TIER_COUNT,
  EXPECTED_UTILITY_COUNT,
  PRIORITY_UTILITY_SLUGS,
  type BlueprintMode,
  type BlueprintUtility,
} from "@/modules/admin/consultation-catalogue/catalogue-blueprint";
import { ConsultationSelectionJourney } from "@/modules/consultations/components/consultation-selection-journey";
import type {
  ConsultationJourneyMode,
  ConsultationJourneyTier,
} from "@/modules/consultations/components/consultation-selection-journey";

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function modeFixture(mode: BlueprintMode, utilityId: string): ConsultationJourneyMode {
  return {
    id: `mode-${utilityId}-${mode.slug}`,
    slug: mode.slug,
    name: mode.name,
    priceType: mode.priceType,
    currency: "INR",
    launchPrice: mode.launchPrice,
    regularPrice: null,
    priceLabel: null,
    travelExcluded: mode.travelExcluded ?? false,
  };
}

function utilityFixture(utility: BlueprintUtility, tierId: string, index: number) {
  const id = `utility-${utility.slug}`;
  return {
    id,
    slug: utility.slug,
    name: utility.name,
    priceType: utility.priceType,
    currency: "INR",
    launchPrice: utility.launchPrice,
    regularPrice: null,
    priceLabel: utility.priceLabel ?? null,
    requiresScopeReview: utility.requiresScopeReview ?? false,
    travelExcluded: utility.travelExcluded ?? false,
    isPriority: utility.isPriority ?? false,
    availabilityStatus: index === 0 && tierId === "tier-quick-insight" ? "UNAVAILABLE" as const : "AVAILABLE" as const,
    publicationState: "DRAFT" as const,
    modes: (utility.modes ?? []).map((mode) => modeFixture(mode, id)),
  };
}

function journeyFixture(): ConsultationJourneyTier[] {
  return CONSULTATION_CATALOGUE_BLUEPRINT.map((tier, tierIndex) => {
    const id = `tier-${tier.slug}`;
    return {
      id,
      slug: tier.slug,
      name: tier.name,
      availabilityStatus: "AVAILABLE",
      publicationState: "DRAFT",
      utilities: tier.utilities.map((utility, utilityIndex) =>
        utilityFixture(utility, id, tierIndex * 10 + utilityIndex),
      ),
    };
  });
}

const groups: Array<{ name: string; run: () => void }> = [
  {
    name: "journey source keeps state in React memory only",
    run() {
      const source = read("src/modules/consultations/components/consultation-selection-journey.tsx");
      assert(source.includes("useState"));
      for (const forbidden of ["localStorage", "sessionStorage", "document.cookie", "fetch(", "navigator.sendBeacon", "console."]) {
        assert.equal(source.includes(forbidden), false, `source includes ${forbidden}`);
      }
    },
  },
  {
    name: "tier selection is accessible and keyboard-operable",
    run() {
      const html = renderToStaticMarkup(React.createElement(ConsultationSelectionJourney, { tiers: journeyFixture() }));
      const tierMatches = html.match(/data-journey-tier=/g) ?? [];
      assert.equal(tierMatches.length, EXPECTED_TIER_COUNT);
      assert(html.includes("aria-pressed"));
      assert(html.includes("View Services"));
      assert(html.includes("Reset"));
    },
  },
  {
    name: "utility, scope-review and unavailable semantics are implemented",
    run() {
      const source = read("src/modules/consultations/components/consultation-selection-journey.tsx");
      assert(source.includes("Select This Consultation"));
      assert(source.includes("Request Scope Review"));
      assert(source.includes("disabled={isUnavailable}"));
      assert(source.includes("utility.availabilityStatus !== \"AVAILABLE\""));
      const utilities = journeyFixture().flatMap((tier) => tier.utilities);
      assert(utilities.some((utility) => utility.priceType === "FIXED"));
      assert(utilities.some((utility) => utility.priceType === "FROM"));
    },
  },
  {
    name: "catalogue counts, priority count and Residential Vastu mode data come from DTO shape",
    run() {
      const tiers = journeyFixture();
      const utilities = tiers.flatMap((tier) => tier.utilities);
      const tierCounts = tiers.map((tier) => tier.utilities.length).join("/");
      const vastu = utilities.find((utility) => utility.slug === "residential-vastu");
      assert.equal(tiers.length, EXPECTED_TIER_COUNT);
      assert.equal(utilities.length, EXPECTED_UTILITY_COUNT);
      assert.equal(tierCounts, "4/7/4/3");
      assert.equal(utilities.filter((utility) => utility.isPriority).length, PRIORITY_UTILITY_SLUGS.length);
      assert(vastu);
      assert.deepEqual(vastu.modes.map((mode) => mode.name), ["Remote", "On-site"]);
      assert.equal(vastu.modes.find((mode) => mode.slug === "on-site")?.travelExcluded, true);
    },
  },
  {
    name: "case intake and review are limited to the approved C11B fields",
    run() {
      const source = read("src/modules/consultations/components/consultation-selection-journey.tsx");
      assert(source.includes("Start Case Intake"));
      assert(source.includes("Preferred Language: ENGLISH"));
      assert(source.includes("Main Concern"));
      assert(source.includes("Main Concern is required."));
      assert(source.includes("Review Scope & Price"));
      assert(source.includes("One selected concern is reviewed for one case fee."));
      for (const forbidden of ["Phone", "Email", "Birth details", "Payment", "WhatsApp", "wa.me"]) {
        assert.equal(source.includes(forbidden), false, `source includes ${forbidden}`);
      }
    },
  },
  {
    name: "private preview wires the reusable journey through the catalogue display",
    run() {
      const displaySource = read("src/modules/consultations/components/consultation-catalogue-display.tsx");
      const pageSource = read("src/app/(admin)/admin/consultation-preview/page.tsx");
      assert(displaySource.includes("ConsultationSelectionJourney"));
      assert(displaySource.includes("toJourneyTiers"));
      assert(pageSource.includes("requireAdminPageSession"));
      assert(pageSource.includes("listCatalogue(getCatalogueDeps())"));
    },
  },
];

let passed = 0;

for (const group of groups) {
  group.run();
  passed += 1;
  console.log(`PASS ${group.name}`);
}

console.log(`\nconsultation selection journey QA summary: ${passed} passed, 0 failed (of ${groups.length}).`);
