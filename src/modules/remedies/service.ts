import "server-only";

import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { curatedRemedyCatalog } from "@/modules/remedies/catalog";
import { getRelatedProductsForRemedySlugs } from "@/modules/shop";
import {
  deriveReportChartSignals,
  mapSignalsToRemedyMatches,
} from "@/modules/remedies/rules";
import type {
  RemedyRecommendation,
  RemedyRecommendationInput,
  RemedyRecommendationResult,
} from "@/modules/remedies/types";

type PersistedRemedyRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  type: RemedyRecommendation["type"];
  cautionNote: string | null;
};

function serializeRemedySource(record: PersistedRemedyRecord) {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    description: record.description,
    type: record.type,
    cautionNote: record.cautionNote,
  };
}

async function getApprovedRemedyRecords(slugs: string[]) {
  if (!slugs.length) {
    return new Map<string, PersistedRemedyRecord>();
  }

  const prisma = getPrisma();
  const storedRecords = await prisma.remedy.findMany({
    where: {
      slug: { in: slugs },
      publishedAt: { not: null },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      type: true,
      cautionNote: true,
    },
  });

  const recordMap = new Map<string, PersistedRemedyRecord>(
    storedRecords.map((record) => [record.slug, serializeRemedySource(record)])
  );

  for (const catalogRecord of curatedRemedyCatalog) {
    if (
      !slugs.includes(catalogRecord.slug) ||
      recordMap.has(catalogRecord.slug)
    ) {
      continue;
    }

    recordMap.set(catalogRecord.slug, {
      id: catalogRecord.slug,
      slug: catalogRecord.slug,
      title: catalogRecord.title,
      summary: catalogRecord.summary,
      description: catalogRecord.description,
      type: catalogRecord.type,
      cautionNote: catalogRecord.cautionNote,
    });
  }

  return recordMap;
}

const getCachedRecommendations = unstable_cache(
  async (serializedInput: string): Promise<RemedyRecommendationResult> => {
    const input = JSON.parse(serializedInput) as RemedyRecommendationInput;
    const signals = deriveReportChartSignals(input.chart);
    const matches = mapSignalsToRemedyMatches(signals);
    const remedyMap = await getApprovedRemedyRecords(
      matches.map((match) => match.remedySlug)
    );
    const relatedProductMap = getRelatedProductsForRemedySlugs(
      matches.map((match) => match.remedySlug)
    );

    const recommendations: RemedyRecommendation[] = matches
      .map((match) => {
        const record = remedyMap.get(match.remedySlug);

        if (!record) {
          return null;
        }

        return {
          id: record.id,
          slug: record.slug,
          title: record.title,
          summary: record.summary,
          description: record.description,
          type: record.type,
          cautionNote: record.cautionNote,
          rationale: match.rationale,
          signalKey: match.signalKey,
          priority: match.priority,
          relatedProducts: relatedProductMap.get(record.slug) ?? [],
        };
      })
      .filter((value): value is RemedyRecommendation => value !== null)
      .slice(0, 6);

    return {
      signals,
      recommendations,
    };
  },
  ["report", "remedies"],
  { tags: ["report", "remedies"] }
);

export function getRemedyRecommendationService() {
  return {
    async getRecommendations(
      input: RemedyRecommendationInput
    ): Promise<RemedyRecommendationResult> {
      return getCachedRecommendations(JSON.stringify(input));
    },
  };
}
