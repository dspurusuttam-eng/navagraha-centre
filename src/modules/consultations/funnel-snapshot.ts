import "server-only";

import {
  ConsultationStatus,
  InquiryLifecycleStage,
  type PrismaClient,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type ConsultationConversionRates = {
  leadToBookedPercent: number;
  bookedToCompletedPercent: number;
  completedToFollowUpEligiblePercent: number;
};

export type ConsultationConversionFunnelSnapshot = {
  generatedAtUtc: string;
  inquiryStageCounts: Record<InquiryLifecycleStage, number>;
  totals: {
    allLeads: number;
    consultationIntentLeads: number;
    bookedJourneyLeads: number;
    completedConsultations: number;
    followUpEligibleLeads: number;
  };
  rates: ConsultationConversionRates;
};

const defaultInquiryStageCounts: Record<InquiryLifecycleStage, number> = {
  NEW_INQUIRY: 0,
  CONSULTATION_INTEREST: 0,
  AWAITING_RESPONSE: 0,
  BOOKED: 0,
  POST_SESSION: 0,
  FOLLOW_UP_ELIGIBLE: 0,
};

function toPercent(numerator: number, denominator: number) {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
}

async function getInquiryStageCounts(prisma: PrismaClient) {
  const grouped = await prisma.inquiryLead.groupBy({
    by: ["lifecycleStage"],
    _count: {
      _all: true,
    },
  });

  const counts = { ...defaultInquiryStageCounts };

  for (const item of grouped) {
    counts[item.lifecycleStage] = item._count._all;
  }

  return counts;
}

export async function getConsultationConversionFunnelSnapshot(): Promise<ConsultationConversionFunnelSnapshot> {
  const prisma = getPrisma();
  const [stageCounts, completedConsultations] = await Promise.all([
    getInquiryStageCounts(prisma),
    prisma.consultation.count({
      where: {
        status: ConsultationStatus.COMPLETED,
      },
    }),
  ]);

  const allLeads = Object.values(stageCounts).reduce((sum, value) => sum + value, 0);
  const consultationIntentLeads =
    stageCounts.CONSULTATION_INTEREST +
    stageCounts.AWAITING_RESPONSE +
    stageCounts.BOOKED +
    stageCounts.POST_SESSION +
    stageCounts.FOLLOW_UP_ELIGIBLE;
  const bookedJourneyLeads =
    stageCounts.BOOKED +
    stageCounts.POST_SESSION +
    stageCounts.FOLLOW_UP_ELIGIBLE;
  const followUpEligibleLeads = stageCounts.FOLLOW_UP_ELIGIBLE;

  const rates: ConsultationConversionRates = {
    leadToBookedPercent: toPercent(bookedJourneyLeads, allLeads),
    bookedToCompletedPercent: toPercent(completedConsultations, bookedJourneyLeads),
    completedToFollowUpEligiblePercent: toPercent(
      followUpEligibleLeads,
      completedConsultations
    ),
  };

  return {
    generatedAtUtc: new Date().toISOString(),
    inquiryStageCounts: stageCounts,
    totals: {
      allLeads,
      consultationIntentLeads,
      bookedJourneyLeads,
      completedConsultations,
      followUpEligibleLeads,
    },
    rates,
  };
}
