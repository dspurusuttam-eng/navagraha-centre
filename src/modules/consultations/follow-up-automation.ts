import "server-only";

import {
  ConsultationStatus,
  InquiryLifecycleStage,
  type InquiryType,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { markInquiryFollowUpEligible } from "@/modules/consultations/inquiry-lifecycle";
import { getPostConsultationRetentionSnapshot } from "@/modules/consultations/retention";

export type FollowUpReminderCadence =
  | "FIRST_REMINDER_DUE"
  | "SECOND_REMINDER_DUE";

export type FollowUpAutomationSkippedReason =
  | "MISSING_USER"
  | "RETENTION_CONTEXT_UNAVAILABLE"
  | "RETENTION_NOT_READY"
  | "RETENTION_NOT_DUE"
  | "ELIGIBILITY_WINDOW_PENDING"
  | "ACTIVE_FOLLOW_UP_ALREADY_BOOKED"
  | "REMINDER_WINDOW_PENDING";

export type FollowUpAutomationConfiguration = {
  followUpEligibilityDaysAfterCompletion: number;
  firstReminderDaysAfterEligible: number;
  secondReminderDaysAfterEligible: number;
};

export type FollowUpAutomationTransitionedLead = {
  leadId: string;
  userId: string;
  fromStage: InquiryLifecycleStage;
  toStage: InquiryLifecycleStage;
  transitionedAtUtc: string;
  completedConsultationAtUtc: string;
  daysSinceCompletedConsultation: number;
};

export type FollowUpReminderCandidate = {
  leadId: string;
  userId: string;
  inquiryType: InquiryType;
  lifecycleStage: InquiryLifecycleStage;
  cadence: FollowUpReminderCadence;
  dueAtUtc: string;
  generatedAtUtc: string;
  actionHref: string;
  note: string;
};

export type FollowUpAutomationSkippedEntry = {
  leadId: string;
  userId: string | null;
  lifecycleStage: InquiryLifecycleStage;
  reason: FollowUpAutomationSkippedReason;
  detail: string;
};

export type FollowUpAutomationRunResult = {
  runAtUtc: string;
  dryRun: boolean;
  configuration: FollowUpAutomationConfiguration;
  evaluated: {
    postSessionLeadCount: number;
    followUpEligibleLeadCount: number;
    totalLeadCount: number;
  };
  transitionedLeads: FollowUpAutomationTransitionedLead[];
  reminderCandidates: FollowUpReminderCandidate[];
  skipped: {
    total: number;
    byReason: Record<FollowUpAutomationSkippedReason, number>;
    entries: FollowUpAutomationSkippedEntry[];
  };
};

export type RunFollowUpAutomationInput = {
  dryRun?: boolean;
  now?: Date;
  limit?: number;
  userId?: string;
  logSummary?: boolean;
  recordAudit?: boolean;
  actorUserId?: string | null;
  actorRoleKey?: string | null;
};

const defaultConfiguration: FollowUpAutomationConfiguration = {
  followUpEligibilityDaysAfterCompletion: 21,
  firstReminderDaysAfterEligible: 3,
  secondReminderDaysAfterEligible: 10,
};

const defaultSkippedReasonCounts: Record<FollowUpAutomationSkippedReason, number> =
  {
    MISSING_USER: 0,
    RETENTION_CONTEXT_UNAVAILABLE: 0,
    RETENTION_NOT_READY: 0,
    RETENTION_NOT_DUE: 0,
    ELIGIBILITY_WINDOW_PENDING: 0,
    ACTIVE_FOLLOW_UP_ALREADY_BOOKED: 0,
    REMINDER_WINDOW_PENDING: 0,
  };

function daysSince(date: Date, now: Date) {
  return (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
}

function addDays(baseDate: Date, days: number) {
  return new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
}

function createSkippedEntry(input: {
  leadId: string;
  userId: string | null;
  lifecycleStage: InquiryLifecycleStage;
  reason: FollowUpAutomationSkippedReason;
  detail: string;
}): FollowUpAutomationSkippedEntry {
  return {
    leadId: input.leadId,
    userId: input.userId,
    lifecycleStage: input.lifecycleStage,
    reason: input.reason,
    detail: input.detail,
  };
}

function incrementSkippedReason(
  counters: Record<FollowUpAutomationSkippedReason, number>,
  reason: FollowUpAutomationSkippedReason
) {
  counters[reason] += 1;
}

async function hasActiveFollowUpConsultation(userId: string, now: Date) {
  const activeFollowUp = await getPrisma().consultation.findFirst({
    where: {
      userId,
      status: {
        in: [ConsultationStatus.REQUESTED, ConsultationStatus.CONFIRMED],
      },
      AND: [
        {
          OR: [
            { type: "FOLLOW_UP" },
            {
              package: {
                is: {
                  slug: "follow-up-clarity-session",
                },
              },
            },
          ],
        },
        {
          OR: [
            {
              scheduledFor: null,
            },
            {
              scheduledFor: {
                gte: now,
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(activeFollowUp);
}

function buildLeadWhere(
  lifecycleStage: InquiryLifecycleStage,
  userId: string | undefined
) {
  return {
    lifecycleStage,
    ...(userId ? { userId } : {}),
  };
}

function buildFollowUpAutomationAuditSummary(
  result: FollowUpAutomationRunResult
) {
  const mode = result.dryRun ? "Dry run" : "Live run";

  return `${mode}: ${result.transitionedLeads.length} transition opportunity(ies), ${result.reminderCandidates.length} reminder candidate(s).`;
}

async function recordFollowUpAutomationAudit(
  result: FollowUpAutomationRunResult,
  input: RunFollowUpAutomationInput
) {
  await getPrisma().auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      actorRoleKey: input.actorRoleKey ?? "system",
      entityType: "INQUIRY_LEAD",
      entityId: "follow-up-automation",
      action: result.dryRun
        ? "FOLLOW_UP_AUTOMATION_DRY_RUN"
        : "FOLLOW_UP_AUTOMATION_RUN",
      summary: buildFollowUpAutomationAuditSummary(result),
      metadata: {
        routeKey: "consultations:follow-up-automation",
        runAtUtc: result.runAtUtc,
        dryRun: result.dryRun,
        evaluated: result.evaluated,
        transitionedCount: result.transitionedLeads.length,
        reminderCandidateCount: result.reminderCandidates.length,
        skippedByReason: result.skipped.byReason,
      },
    },
  });
}

export async function runFollowUpAutomation(
  input: RunFollowUpAutomationInput = {}
): Promise<FollowUpAutomationRunResult> {
  const now = input.now ?? new Date();
  const dryRun = input.dryRun ?? false;
  const limit = input.limit ?? 200;
  const logSummary = input.logSummary ?? true;
  const prisma = getPrisma();
  const runAtUtc = now.toISOString();
  const skippedByReason = { ...defaultSkippedReasonCounts };
  const skippedEntries: FollowUpAutomationSkippedEntry[] = [];
  const transitionedLeads: FollowUpAutomationTransitionedLead[] = [];
  const reminderCandidates: FollowUpReminderCandidate[] = [];

  const [postSessionLeads, followUpEligibleLeads] = await Promise.all([
    prisma.inquiryLead.findMany({
      where: buildLeadWhere(InquiryLifecycleStage.POST_SESSION, input.userId),
      orderBy: [{ updatedAt: "asc" }],
      take: limit,
      select: {
        id: true,
        userId: true,
        inquiryType: true,
        lifecycleStage: true,
        lastLifecycleAt: true,
      },
    }),
    prisma.inquiryLead.findMany({
      where: buildLeadWhere(
        InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
        input.userId
      ),
      orderBy: [{ updatedAt: "asc" }],
      take: limit,
      select: {
        id: true,
        userId: true,
        inquiryType: true,
        lifecycleStage: true,
        lastLifecycleAt: true,
      },
    }),
  ]);

  for (const lead of postSessionLeads) {
    if (!lead.userId) {
      incrementSkippedReason(skippedByReason, "MISSING_USER");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "MISSING_USER",
          detail:
            "Lead is not linked to a member account, so post-session automation cannot evaluate follow-up eligibility.",
        })
      );
      continue;
    }

    let retentionSnapshot: Awaited<
      ReturnType<typeof getPostConsultationRetentionSnapshot>
    >;

    try {
      retentionSnapshot = await getPostConsultationRetentionSnapshot(lead.userId);
    } catch (error) {
      incrementSkippedReason(skippedByReason, "RETENTION_CONTEXT_UNAVAILABLE");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "RETENTION_CONTEXT_UNAVAILABLE",
          detail:
            error instanceof Error
              ? `Retention snapshot unavailable: ${error.message}`
              : "Retention snapshot unavailable.",
        })
      );
      continue;
    }

    if (retentionSnapshot.status !== "ready" || !retentionSnapshot.consultation) {
      incrementSkippedReason(skippedByReason, "RETENTION_NOT_READY");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "RETENTION_NOT_READY",
          detail:
            "Retention snapshot is not in a ready state, so follow-up automation will wait.",
        })
      );
      continue;
    }

    if (
      retentionSnapshot.nextRecommendedAction.key !==
      "BOOK_FOLLOW_UP_CONSULTATION"
    ) {
      incrementSkippedReason(skippedByReason, "RETENTION_NOT_DUE");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "RETENTION_NOT_DUE",
          detail:
            "Current retention recommendation does not indicate follow-up booking yet.",
        })
      );
      continue;
    }

    const completedAt = new Date(retentionSnapshot.consultation.completedAtUtc);
    const daysSinceCompletion = daysSince(completedAt, now);

    if (
      daysSinceCompletion <
      defaultConfiguration.followUpEligibilityDaysAfterCompletion
    ) {
      incrementSkippedReason(skippedByReason, "ELIGIBILITY_WINDOW_PENDING");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "ELIGIBILITY_WINDOW_PENDING",
          detail: `Only ${daysSinceCompletion.toFixed(
            1
          )} days since completed consultation. Minimum is ${
            defaultConfiguration.followUpEligibilityDaysAfterCompletion
          } days.`,
        })
      );
      continue;
    }

    if (await hasActiveFollowUpConsultation(lead.userId, now)) {
      incrementSkippedReason(skippedByReason, "ACTIVE_FOLLOW_UP_ALREADY_BOOKED");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "ACTIVE_FOLLOW_UP_ALREADY_BOOKED",
          detail:
            "Member already has an active follow-up booking/request, so transition is skipped.",
        })
      );
      continue;
    }

    if (!dryRun) {
      await markInquiryFollowUpEligible(
        lead.id,
        null,
        "Automated transition: retention indicates follow-up booking opportunity."
      );
    }

    transitionedLeads.push({
      leadId: lead.id,
      userId: lead.userId,
      fromStage: InquiryLifecycleStage.POST_SESSION,
      toStage: InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
      transitionedAtUtc: runAtUtc,
      completedConsultationAtUtc: retentionSnapshot.consultation.completedAtUtc,
      daysSinceCompletedConsultation: Number(daysSinceCompletion.toFixed(2)),
    });
  }

  const refreshedFollowUpEligibleLeads = dryRun
    ? [
        ...followUpEligibleLeads,
        ...transitionedLeads.map((transitionedLead) => ({
          id: transitionedLead.leadId,
          userId: transitionedLead.userId,
          inquiryType: "RETURNING_FOLLOW_UP" as InquiryType,
          lifecycleStage: InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
          lastLifecycleAt: now,
        })),
      ]
    : await prisma.inquiryLead.findMany({
        where: buildLeadWhere(
          InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
          input.userId
        ),
        orderBy: [{ updatedAt: "asc" }],
        take: limit,
        select: {
          id: true,
          userId: true,
          inquiryType: true,
          lifecycleStage: true,
          lastLifecycleAt: true,
        },
      });

  for (const lead of refreshedFollowUpEligibleLeads) {
    if (!lead.userId) {
      incrementSkippedReason(skippedByReason, "MISSING_USER");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "MISSING_USER",
          detail:
            "Follow-up eligible lead is not linked to a member account and cannot receive reminder candidates.",
        })
      );
      continue;
    }

    if (await hasActiveFollowUpConsultation(lead.userId, now)) {
      incrementSkippedReason(skippedByReason, "ACTIVE_FOLLOW_UP_ALREADY_BOOKED");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "ACTIVE_FOLLOW_UP_ALREADY_BOOKED",
          detail:
            "Active follow-up booking exists, so reminder candidates are not generated.",
        })
      );
      continue;
    }

    const daysInEligibleStage = daysSince(lead.lastLifecycleAt, now);
    let cadence: FollowUpReminderCadence | null = null;

    if (
      daysInEligibleStage >= defaultConfiguration.secondReminderDaysAfterEligible
    ) {
      cadence = "SECOND_REMINDER_DUE";
    } else if (
      daysInEligibleStage >= defaultConfiguration.firstReminderDaysAfterEligible
    ) {
      cadence = "FIRST_REMINDER_DUE";
    }

    if (!cadence) {
      incrementSkippedReason(skippedByReason, "REMINDER_WINDOW_PENDING");
      skippedEntries.push(
        createSkippedEntry({
          leadId: lead.id,
          userId: lead.userId,
          lifecycleStage: lead.lifecycleStage,
          reason: "REMINDER_WINDOW_PENDING",
          detail: `Lead has been in FOLLOW_UP_ELIGIBLE for ${daysInEligibleStage.toFixed(
            1
          )} days. Reminder windows begin at ${
            defaultConfiguration.firstReminderDaysAfterEligible
          } days.`,
        })
      );
      continue;
    }

    const dueAt =
      cadence === "FIRST_REMINDER_DUE"
        ? addDays(
            lead.lastLifecycleAt,
            defaultConfiguration.firstReminderDaysAfterEligible
          )
        : addDays(
            lead.lastLifecycleAt,
            defaultConfiguration.secondReminderDaysAfterEligible
          );

    reminderCandidates.push({
      leadId: lead.id,
      userId: lead.userId,
      inquiryType: lead.inquiryType,
      lifecycleStage: lead.lifecycleStage,
      cadence,
      dueAtUtc: dueAt.toISOString(),
      generatedAtUtc: runAtUtc,
      actionHref: "/dashboard/consultations/book?package=follow-up-clarity-session",
      note:
        cadence === "FIRST_REMINDER_DUE"
          ? "First calm follow-up reminder window is now open."
          : "Second follow-up reminder window is now open. Escalation should remain non-pushy and optional.",
    });
  }

  const result: FollowUpAutomationRunResult = {
    runAtUtc,
    dryRun,
    configuration: defaultConfiguration,
    evaluated: {
      postSessionLeadCount: postSessionLeads.length,
      followUpEligibleLeadCount: refreshedFollowUpEligibleLeads.length,
      totalLeadCount:
        postSessionLeads.length + refreshedFollowUpEligibleLeads.length,
    },
    transitionedLeads,
    reminderCandidates,
    skipped: {
      total: skippedEntries.length,
      byReason: skippedByReason,
      entries: skippedEntries,
    },
  };

  if (logSummary) {
    console.info("[consultations][follow-up-automation] run summary", {
      routeKey: "consultations:follow-up-automation",
      runAtUtc: result.runAtUtc,
      dryRun: result.dryRun,
      evaluated: result.evaluated,
      transitionedCount: result.transitionedLeads.length,
      reminderCandidateCount: result.reminderCandidates.length,
      skippedByReason: result.skipped.byReason,
    });
  }

  if (input.recordAudit) {
    await recordFollowUpAutomationAudit(result, input);
  }

  return result;
}

export type FollowUpAutomationSnapshot = {
  generatedAtUtc: string;
  evaluated: FollowUpAutomationRunResult["evaluated"];
  transitionOpportunityCount: number;
  reminderCandidateCount: number;
  firstReminderDueCount: number;
  secondReminderDueCount: number;
  skippedByReason: FollowUpAutomationRunResult["skipped"]["byReason"];
};

export type FollowUpReminderQueueEntry = {
  leadId: string;
  userId: string;
  fullName: string;
  email: string;
  timezone: string | null;
  inquiryType: InquiryType;
  lifecycleStage: InquiryLifecycleStage;
  cadence: FollowUpReminderCadence;
  dueAtUtc: string;
  actionHref: string;
  note: string;
};

export async function getFollowUpAutomationSnapshot(input?: {
  limit?: number;
  userId?: string;
}): Promise<FollowUpAutomationSnapshot> {
  const dryRunResult = await runFollowUpAutomation({
    dryRun: true,
    limit: input?.limit ?? 80,
    userId: input?.userId,
    logSummary: false,
  });

  return {
    generatedAtUtc: dryRunResult.runAtUtc,
    evaluated: dryRunResult.evaluated,
    transitionOpportunityCount: dryRunResult.transitionedLeads.length,
    reminderCandidateCount: dryRunResult.reminderCandidates.length,
    firstReminderDueCount: dryRunResult.reminderCandidates.filter(
      (candidate) => candidate.cadence === "FIRST_REMINDER_DUE"
    ).length,
    secondReminderDueCount: dryRunResult.reminderCandidates.filter(
      (candidate) => candidate.cadence === "SECOND_REMINDER_DUE"
    ).length,
    skippedByReason: dryRunResult.skipped.byReason,
  };
}

export async function getFollowUpReminderQueue(input?: {
  limit?: number;
  userId?: string;
}): Promise<FollowUpReminderQueueEntry[]> {
  const dryRunResult = await runFollowUpAutomation({
    dryRun: true,
    limit: input?.limit ?? 80,
    userId: input?.userId,
    logSummary: false,
  });

  if (!dryRunResult.reminderCandidates.length) {
    return [];
  }

  const reminderByLeadId = new Map(
    dryRunResult.reminderCandidates.map((candidate) => [candidate.leadId, candidate])
  );

  const leads = await getPrisma().inquiryLead.findMany({
    where: {
      id: {
        in: dryRunResult.reminderCandidates.map((candidate) => candidate.leadId),
      },
    },
    select: {
      id: true,
      userId: true,
      fullName: true,
      email: true,
      timezone: true,
      inquiryType: true,
      lifecycleStage: true,
    },
  });

  return leads
    .map((lead) => {
      const reminder = reminderByLeadId.get(lead.id);

      if (!reminder || !lead.userId) {
        return null;
      }

      return {
        leadId: lead.id,
        userId: lead.userId,
        fullName: lead.fullName,
        email: lead.email,
        timezone: lead.timezone,
        inquiryType: lead.inquiryType,
        lifecycleStage: lead.lifecycleStage,
        cadence: reminder.cadence,
        dueAtUtc: reminder.dueAtUtc,
        actionHref: reminder.actionHref,
        note: reminder.note,
      } satisfies FollowUpReminderQueueEntry;
    })
    .filter((entry): entry is FollowUpReminderQueueEntry => entry !== null);
}
