import "server-only";

import type { Prisma } from "@prisma/client";
import {
  InquiryLifecycleStage,
  InquiryType,
  InquiryUrgencyLevel,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getConsultationPackageBySlug } from "@/modules/consultations/catalog";

type InquiryTransaction = Prisma.TransactionClient;

export type InquiryLeadRecord = {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  timezone: string | null;
  inquiryType: InquiryType;
  urgencyLevel: InquiryUrgencyLevel;
  desiredServiceSlug: string | null;
  message: string;
  sourcePath: string | null;
  lifecycleStage: InquiryLifecycleStage;
  lastLifecycleAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateInquiryLeadInput = {
  userId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  timezone?: string | null;
  inquiryType: InquiryType;
  desiredServiceSlug?: string | null;
  message: string;
  sourcePath?: string | null;
};

export type TransitionInquiryStageInput = {
  leadId: string;
  toStage: InquiryLifecycleStage;
  actorUserId?: string | null;
  note?: string | null;
};

const lifecycleTransitionMap: Record<
  InquiryLifecycleStage,
  readonly InquiryLifecycleStage[]
> = {
  NEW_INQUIRY: ["AWAITING_RESPONSE", "CONSULTATION_INTEREST"],
  CONSULTATION_INTEREST: ["AWAITING_RESPONSE", "BOOKED"],
  AWAITING_RESPONSE: [
    "CONSULTATION_INTEREST",
    "BOOKED",
    "POST_SESSION",
    "FOLLOW_UP_ELIGIBLE",
  ],
  BOOKED: ["POST_SESSION", "FOLLOW_UP_ELIGIBLE"],
  POST_SESSION: ["FOLLOW_UP_ELIGIBLE"],
  FOLLOW_UP_ELIGIBLE: ["BOOKED", "AWAITING_RESPONSE"],
};

const inquiryTypeByIntent: Record<string, InquiryType> = {
  "general-inquiry": InquiryType.GENERAL_INQUIRY,
  "consultation-ready": InquiryType.CONSULTATION_READY,
  "compatibility-focused": InquiryType.COMPATIBILITY_FOCUSED,
  "remedy-focused": InquiryType.REMEDY_FOCUSED,
  "returning-member-follow-up": InquiryType.RETURNING_FOLLOW_UP,
};

const defaultServiceByInquiryType: Partial<Record<InquiryType, string>> = {
  CONSULTATION_READY: "private-reading",
  COMPATIBILITY_FOCUSED: "compatibility-session",
  REMEDY_FOCUSED: "remedy-guidance-session",
  RETURNING_FOLLOW_UP: "follow-up-clarity-session",
};

function normalizeRequiredText(value: string, label: string, maxLength: number) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${label} must stay within ${maxLength} characters.`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number) {
  const normalized = value?.trim() ?? "";

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error(
      `Please shorten entries to ${maxLength} characters or less.`
    );
  }

  return normalized;
}

function normalizeEmail(email: string) {
  const normalized = normalizeRequiredText(email, "Email", 160).toLowerCase();

  if (!normalized.includes("@")) {
    throw new Error("Please provide a valid email address.");
  }

  return normalized;
}

export function parseInquiryType(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase() ?? "";

  if (!normalized) {
    return InquiryType.GENERAL_INQUIRY;
  }

  if (normalized in InquiryType) {
    return InquiryType[normalized as keyof typeof InquiryType];
  }

  throw new Error("Please select a valid inquiry type.");
}

export function mapIntentToInquiryType(intent: string | null | undefined) {
  const normalizedIntent = intent?.trim().toLowerCase() ?? "";

  return inquiryTypeByIntent[normalizedIntent] ?? InquiryType.GENERAL_INQUIRY;
}

export function getDefaultDesiredServiceForInquiryType(inquiryType: InquiryType) {
  return defaultServiceByInquiryType[inquiryType] ?? null;
}

export function getInitialInquiryLifecycleStage(inquiryType: InquiryType) {
  if (inquiryType === InquiryType.GENERAL_INQUIRY) {
    return InquiryLifecycleStage.NEW_INQUIRY;
  }

  return InquiryLifecycleStage.CONSULTATION_INTEREST;
}

export function classifyInquiryUrgency({
  message,
  inquiryType,
}: {
  message: string;
  inquiryType: InquiryType;
}) {
  const normalizedMessage = message.toLowerCase();

  if (
    ["urgent", "asap", "immediately", "critical", "emergency", "today"].some(
      (keyword) => normalizedMessage.includes(keyword)
    )
  ) {
    return InquiryUrgencyLevel.ELEVATED;
  }

  if (inquiryType === InquiryType.RETURNING_FOLLOW_UP) {
    return InquiryUrgencyLevel.STANDARD;
  }

  if (
    ["exploring", "no rush", "understand first", "just checking"].some(
      (keyword) => normalizedMessage.includes(keyword)
    )
  ) {
    return InquiryUrgencyLevel.LOW;
  }

  return InquiryUrgencyLevel.STANDARD;
}

function mapInquiryLeadRecord(record: {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  timezone: string | null;
  inquiryType: InquiryType;
  urgencyLevel: InquiryUrgencyLevel;
  desiredServiceSlug: string | null;
  message: string;
  sourcePath: string | null;
  lifecycleStage: InquiryLifecycleStage;
  lastLifecycleAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): InquiryLeadRecord {
  return {
    ...record,
    lastLifecycleAt: record.lastLifecycleAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function assertLifecycleTransition(
  fromStage: InquiryLifecycleStage,
  toStage: InquiryLifecycleStage
) {
  if (fromStage === toStage) {
    return;
  }

  const allowedTransitions = lifecycleTransitionMap[fromStage];

  if (!allowedTransitions.includes(toStage)) {
    throw new Error(
      `Cannot move inquiry from ${fromStage} to ${toStage}. Review the inquiry lifecycle flow first.`
    );
  }
}

async function createLifecycleEvent(
  tx: InquiryTransaction,
  input: {
    leadId: string;
    fromStage: InquiryLifecycleStage | null;
    toStage: InquiryLifecycleStage;
    actorUserId?: string | null;
    note?: string | null;
  }
) {
  return tx.inquiryLifecycleEvent.create({
    data: {
      leadId: input.leadId,
      fromStage: input.fromStage,
      toStage: input.toStage,
      actorUserId: input.actorUserId ?? null,
      note: input.note ?? null,
    },
  });
}

export async function createInquiryLead(
  input: CreateInquiryLeadInput
): Promise<InquiryLeadRecord> {
  const fullName = normalizeRequiredText(input.fullName, "Full name", 120);
  const email = normalizeEmail(input.email);
  const message = normalizeRequiredText(input.message, "Inquiry message", 2000);
  const phone = normalizeOptionalText(input.phone, 40);
  const timezone = normalizeOptionalText(input.timezone, 120);
  const sourcePath = normalizeOptionalText(input.sourcePath, 240);
  const desiredServiceSlug = normalizeOptionalText(input.desiredServiceSlug, 120);

  if (desiredServiceSlug && !getConsultationPackageBySlug(desiredServiceSlug)) {
    throw new Error("Please select a valid desired service package.");
  }

  const inquiryType = input.inquiryType;
  const urgencyLevel = classifyInquiryUrgency({
    message,
    inquiryType,
  });
  const lifecycleStage = getInitialInquiryLifecycleStage(inquiryType);
  const prisma = getPrisma();

  const record = await prisma.$transaction(async (tx) => {
    const lead = await tx.inquiryLead.create({
      data: {
        userId: input.userId ?? null,
        fullName,
        email,
        phone,
        timezone,
        inquiryType,
        urgencyLevel,
        desiredServiceSlug,
        message,
        sourcePath,
        lifecycleStage,
        lastLifecycleAt: new Date(),
      },
    });

    await createLifecycleEvent(tx, {
      leadId: lead.id,
      fromStage: null,
      toStage: lifecycleStage,
      actorUserId: input.userId ?? null,
      note: "Inquiry created from public lead capture.",
    });

    return lead;
  });

  return mapInquiryLeadRecord(record);
}

export async function transitionInquiryLifecycleStage(
  input: TransitionInquiryStageInput
): Promise<InquiryLeadRecord> {
  const note = normalizeOptionalText(input.note, 400);
  const prisma = getPrisma();

  const record = await prisma.$transaction(async (tx) => {
    const existingLead = await tx.inquiryLead.findUnique({
      where: { id: input.leadId },
      select: {
        id: true,
        lifecycleStage: true,
      },
    });

    if (!existingLead) {
      throw new Error("Inquiry lead could not be found.");
    }

    assertLifecycleTransition(existingLead.lifecycleStage, input.toStage);

    if (existingLead.lifecycleStage === input.toStage) {
      const unchangedLead = await tx.inquiryLead.findUniqueOrThrow({
        where: { id: input.leadId },
      });

      return unchangedLead;
    }

    const updatedLead = await tx.inquiryLead.update({
      where: { id: input.leadId },
      data: {
        lifecycleStage: input.toStage,
        lastLifecycleAt: new Date(),
      },
    });

    await createLifecycleEvent(tx, {
      leadId: updatedLead.id,
      fromStage: existingLead.lifecycleStage,
      toStage: input.toStage,
      actorUserId: input.actorUserId ?? null,
      note,
    });

    return updatedLead;
  });

  return mapInquiryLeadRecord(record);
}

export async function markInquiryAwaitingResponse(
  leadId: string,
  actorUserId?: string | null,
  note?: string | null
) {
  return transitionInquiryLifecycleStage({
    leadId,
    toStage: InquiryLifecycleStage.AWAITING_RESPONSE,
    actorUserId,
    note,
  });
}

export async function markInquiryConsultationInterest(
  leadId: string,
  actorUserId?: string | null,
  note?: string | null
) {
  return transitionInquiryLifecycleStage({
    leadId,
    toStage: InquiryLifecycleStage.CONSULTATION_INTEREST,
    actorUserId,
    note,
  });
}

export async function markInquiryBooked(
  leadId: string,
  actorUserId?: string | null,
  note?: string | null
) {
  return transitionInquiryLifecycleStage({
    leadId,
    toStage: InquiryLifecycleStage.BOOKED,
    actorUserId,
    note,
  });
}

export async function markInquiryPostSession(
  leadId: string,
  actorUserId?: string | null,
  note?: string | null
) {
  return transitionInquiryLifecycleStage({
    leadId,
    toStage: InquiryLifecycleStage.POST_SESSION,
    actorUserId,
    note,
  });
}

export async function markInquiryFollowUpEligible(
  leadId: string,
  actorUserId?: string | null,
  note?: string | null
) {
  return transitionInquiryLifecycleStage({
    leadId,
    toStage: InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
    actorUserId,
    note,
  });
}

export async function markLatestInquiryLeadBookedForUser(userId: string) {
  const prisma = getPrisma();
  const lead = await prisma.inquiryLead.findFirst({
    where: {
      userId,
      lifecycleStage: {
        in: [
          InquiryLifecycleStage.CONSULTATION_INTEREST,
          InquiryLifecycleStage.AWAITING_RESPONSE,
          InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
        ],
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
    },
  });

  if (!lead) {
    return null;
  }

  return markInquiryBooked(
    lead.id,
    userId,
    "Consultation booking confirmed in protected flow."
  );
}

export async function markLatestInquiryLeadPostSessionForUser(
  userId: string,
  actorUserId?: string | null
) {
  const prisma = getPrisma();
  const lead = await prisma.inquiryLead.findFirst({
    where: {
      userId,
      lifecycleStage: {
        in: [
          InquiryLifecycleStage.BOOKED,
          InquiryLifecycleStage.AWAITING_RESPONSE,
          InquiryLifecycleStage.CONSULTATION_INTEREST,
        ],
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
    },
  });

  if (!lead) {
    return null;
  }

  return markInquiryPostSession(
    lead.id,
    actorUserId ?? userId,
    "Consultation marked completed; lead moved to post-session lifecycle."
  );
}
