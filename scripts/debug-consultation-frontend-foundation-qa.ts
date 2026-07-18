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
import { toPublicCatalogue } from "@/modules/site-settings/public-catalogue-core";
import { ConsultationCatalogueDisplay } from "@/modules/consultations/components/consultation-catalogue-display";
import type {
  ModeRecord,
  TierWithUtilities,
  UtilityRecord,
} from "@/modules/admin/consultation-catalogue/types";

const root = process.cwd();
const now = new Date("2026-07-18T00:00:00.000Z");
const qaWhatsappBaseUrl = `https://wa.me/${"9"}${"1".repeat(9)}`;

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function modeRecord(mode: BlueprintMode, utilityId: string, index: number): ModeRecord {
  return {
    id: `mode-${utilityId}-${mode.slug}`,
    utilityId,
    slug: mode.slug,
    name: mode.name,
    shortDescription: null,
    priceType: mode.priceType,
    currency: "INR",
    launchPrice: mode.launchPrice,
    regularPrice: null,
    priceLabel: null,
    travelExcluded: mode.travelExcluded ?? false,
    isActive: true,
    sortOrder: index,
    createdAt: now,
    updatedAt: now,
  };
}

function utilityRecord(utility: BlueprintUtility, tierId: string, index: number): UtilityRecord {
  const id = `utility-${utility.slug}`;
  return {
    id,
    slug: utility.slug,
    tierId,
    name: utility.name,
    shortDescription: null,
    detailedScope: null,
    bestFor: null,
    includedItems: [],
    excludedItems: [],
    responseDescription: null,
    priceType: utility.priceType,
    currency: "INR",
    launchPrice: utility.launchPrice,
    regularPrice: null,
    priceLabel: utility.priceLabel ?? null,
    requiresScopeReview: utility.requiresScopeReview ?? false,
    travelExcluded: utility.travelExcluded ?? false,
    isPriority: utility.isPriority ?? false,
    hasModes: Boolean(utility.modes?.length),
    isActive: true,
    availabilityStatus: "AVAILABLE",
    sortOrder: index,
    publicationState: "DRAFT",
    publishedAt: null,
    createdById: "admin",
    createdAt: now,
    updatedAt: now,
    modes: (utility.modes ?? []).map((mode, modeIndex) => modeRecord(mode, id, modeIndex)),
  };
}

function draftCatalogueFixture(): TierWithUtilities[] {
  return CONSULTATION_CATALOGUE_BLUEPRINT.map((tier, tierIndex) => {
    const id = `tier-${tier.slug}`;
    return {
      id,
      slug: tier.slug,
      name: tier.name,
      shortDescription: null,
      detailedScope: null,
      bestFor: null,
      isActive: true,
      availabilityStatus: "AVAILABLE",
      sortOrder: tierIndex,
      publicationState: "DRAFT",
      publishedAt: null,
      createdById: "admin",
      createdAt: now,
      updatedAt: now,
      utilities: tier.utilities.map((utility, utilityIndex) => utilityRecord(utility, id, utilityIndex)),
    };
  });
}

const groups: Array<{ name: string; run: () => void }> = [
  {
    name: "public projection drops all DRAFT catalogue records",
    run() {
      const publicCatalogue = toPublicCatalogue(draftCatalogueFixture(), {
        globalAvailability: "UNAVAILABLE",
        whatsappBaseUrl: qaWhatsappBaseUrl,
      });
      assert.equal(publicCatalogue.tiers.length, 0);
      assert.equal(publicCatalogue.global.status, "UNAVAILABLE");
      assert.equal(publicCatalogue.whatsappBaseUrl, qaWhatsappBaseUrl);
    },
  },
  {
    name: "public consultation page does not import legacy packages or blueprint utility names",
    run() {
      const source = read("src/app/(marketing)/consultation/page.tsx");
      assert.equal(source.includes("consultationPackages"), false);
      assert.equal(source.includes("priceFromMinor"), false);
      assert.equal(source.includes(`+${"91"}${"9085"}${"946882"}`), false);
      for (const tier of CONSULTATION_CATALOGUE_BLUEPRINT) {
        for (const utility of tier.utilities) {
          assert.equal(source.includes(utility.name), false, `public source includes ${utility.name}`);
        }
      }
    },
  },
  {
    name: "private Admin preview route is authorized and noindexed",
    run() {
      const source = read("src/app/(admin)/admin/consultation-preview/page.tsx");
      assert(source.includes("requireAdminPageSession"));
      assert(source.includes("listCatalogue(getCatalogueDeps())"));
      assert(source.includes("index: false"));
      assert(source.includes("nocache: true"));
      assert(source.includes("ConsultationCatalogueDisplay"));
    },
  },
  {
    name: "private preview renders 4 tiers and 18 utilities from DTO records",
    run() {
      const tiers = draftCatalogueFixture();
      const html = renderToStaticMarkup(React.createElement(ConsultationCatalogueDisplay, { tiers }));
      const utilityMatches = html.match(/data-consultation-utility=/g) ?? [];
      assert.equal(tiers.length, EXPECTED_TIER_COUNT);
      assert.equal(utilityMatches.length, EXPECTED_UTILITY_COUNT);
      assert(html.includes("Quick Insight"));
      assert(html.includes("Focused Guidance"));
      assert(html.includes("Match &amp; Timing"));
      assert(html.includes("Premium Cases"));
      assert(html.includes("4"));
      assert(html.includes("7"));
      assert(html.includes("18"));
    },
  },
  {
    name: "pricing semantics, priorities, Vastu modes and flags render",
    run() {
      const tiers = draftCatalogueFixture();
      const html = renderToStaticMarkup(React.createElement(ConsultationCatalogueDisplay, { tiers }));
      const priorityCount = tiers.flatMap((tier) => tier.utilities).filter((utility) => utility.isPriority).length;
      assert.equal(priorityCount, PRIORITY_UTILITY_SLUGS.length);
      assert.equal(priorityCount, 6);
      assert(html.includes("FIXED"));
      assert(html.includes("FROM"));
      assert(html.includes("From"));
      assert(html.includes("Scope review"));
      assert(html.includes("Residential Vastu"));
      assert(html.includes("Remote"));
      assert(html.includes("On-site"));
      assert(html.includes("Travel excluded"));
    },
  },
  {
    name: "component includes mobile overflow guards",
    run() {
      const source = read("src/modules/consultations/components/consultation-catalogue-display.tsx");
      assert(source.includes("min-w-0"));
      assert(source.includes("overflow-x-auto"));
      assert(source.includes("break-words"));
      assert(source.includes("sm:grid-cols-2"));
    },
  },
];

let passed = 0;

for (const group of groups) {
  group.run();
  passed += 1;
  console.log(`PASS ${group.name}`);
}

console.log(`\nconsultation frontend foundation QA summary: ${passed} passed, 0 failed (of ${groups.length}).`);
