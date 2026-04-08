import "server-only";

import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { curatedRemedyCatalog } from "@/modules/remedies/catalog";
import {
  buildRemedyConsultationPreparation,
  buildRemedyRecommendation,
} from "@/modules/remedies/intelligence";
import { getRelatedProductsForRemedySlugs } from "@/modules/shop";
import {
  deriveReportChartSignals,
  mapSignalsToRemedyMatches,
} from "@/modules/remedies/rules";
import type {
  ApprovedRemedyRecord,
  RemedyRecommendationInput,
  RemedyRecommendation,
  RemedyRecommendationResult,
} from "@/modules/remedies/types";

function serializeRemedySource(record: ApprovedRemedyRecord) {
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
    return new Map<string, ApprovedRemedyRecord>();
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

  const recordMap = new Map<string, ApprovedRemedyRecord>(
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

function createInputHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16);
}

async function logRecommendationRun(
  serializedChart: string,
  result: RemedyRecommendationResult,
  logContext: NonNullable<RemedyRecommendationInput["logContext"]>
) {
  try {
    const record = await getPrisma().remedyRecommendationRun.create({
      data: {
        userId: logContext.userId ?? null,
        chartRecordId: logContext.chartRecordId ?? null,
        surfaceKey: logContext.surfaceKey,
        inputHash: createInputHash(serializedChart),
        signalKeys: result.signals.map((signal) => signal.key),
        topRecommendationSlugs: result.summary.topRecommendationSlugs,
        recommendationSnapshot: {
          generatedAtUtc: result.summary.generatedAtUtc,
          consultationPreparation: result.consultationPreparation,
          recommendations: result.recommendations.map((recommendation) => ({
            slug: recommendation.slug,
            title: recommendation.title,
            type: recommendation.type,
            priority: recommendation.priority,
            priorityTier: recommendation.priorityTier,
            confidenceLabel: recommendation.confidenceLabel,
            confidenceScore: recommendation.confidenceScore,
            whyThisRemedy: recommendation.whyThisRemedy,
            cautions: recommendation.cautions,
            productMapping: {
              note: recommendation.productMapping.note,
              purchaseRequired: recommendation.productMapping.purchaseRequired,
              productSlugs: recommendation.productMapping.products.map((product) => product.slug),
            },
          })),
        },
      },
      select: {
        id: true,
      },
    });

    return record.id;
  } catch {
    return null;
  }
}

const getCachedRecommendations = unstable_cache(
  async (serializedChart: string): Promise<Omit<RemedyRecommendationResult, "loggedRunId">> => {
    const input = JSON.parse(serializedChart) as Pick<RemedyRecommendationInput, "chart">;
    const signals = deriveReportChartSignals(input.chart);
    const matches = mapSignalsToRemedyMatches(signals);
    const remedyMap = await getApprovedRemedyRecords(
      matches.map((match) => match.remedySlug)
    );
    const relatedProductMap = getRelatedProductsForRemedySlugs(
      matches.map((match) => match.remedySlug)
    );

    const matchesByRemedy = new Map<string, typeof matches>();

    for (const match of matches) {
      const existing = matchesByRemedy.get(match.remedySlug) ?? [];
      existing.push(match);
      matchesByRemedy.set(match.remedySlug, existing);
    }

    const recommendations = Array.from(matchesByRemedy.entries())
      .map(([remedySlug, remedyMatches]) => {
        const record = remedyMap.get(remedySlug);

        if (!record) {
          return null;
        }

        return buildRemedyRecommendation({
          record,
          signals,
          matches: remedyMatches,
          relatedProducts: relatedProductMap.get(record.slug) ?? [],
        });
      })
      .filter((value): value is RemedyRecommendation => value !== null)
      .sort((left, right) => right.priority - left.priority)
      .slice(0, 6);

    return {
      signals,
      recommendations,
      summary: {
        generatedAtUtc: new Date().toISOString(),
        primaryCount: recommendations.filter(
          (recommendation) => recommendation.priorityTier === "PRIMARY"
        ).length,
        supportiveCount: recommendations.filter(
          (recommendation) => recommendation.priorityTier === "SUPPORTIVE"
        ).length,
        optionalCount: recommendations.filter(
          (recommendation) => recommendation.priorityTier === "OPTIONAL"
        ).length,
        topRecommendationSlugs: recommendations
          .slice(0, 3)
          .map((recommendation) => recommendation.slug),
      },
      consultationPreparation: buildRemedyConsultationPreparation(recommendations),
    };
  },
  ["report", "remedies", "intelligence"],
  { tags: ["report", "remedies", "intelligence"] }
);

export function getRemedyRecommendationService() {
  return {
    async getRecommendations(
      input: RemedyRecommendationInput
    ): Promise<RemedyRecommendationResult> {
      const serializedChart = JSON.stringify({ chart: input.chart });
      const result = await getCachedRecommendations(serializedChart);
      const loggedRunId = input.logContext
        ? await logRecommendationRun(serializedChart, { ...result, loggedRunId: null }, input.logContext)
        : null;

      return {
        ...result,
        loggedRunId,
      };
    },
  };
}
