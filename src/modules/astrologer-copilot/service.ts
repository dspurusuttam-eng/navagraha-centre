import "server-only";

import { getPrisma } from "@/lib/prisma";
import { getAiGroundedTextService } from "@/modules/ai/server";
import { resolvePromptVersionByTemplateKey } from "@/modules/ai/prompt-versioning";
import { getChartOverview } from "@/modules/onboarding/service";
import { getRemedyRecommendationService } from "@/modules/remedies/service";
import { getContentAdapter } from "@/modules/content/server";
import type {
  AstrologerCopilotBrief,
  AstrologerCopilotConsultationOption,
  AstrologerCopilotPageData,
  CopilotClientSnapshot,
  CopilotPriorityTheme,
  CopilotRecommendedDiscussionTopic,
  CopilotRiskCautionFlag,
} from "@/modules/astrologer-copilot/types";

const astrologerCopilotPromptKey = "astrologer-copilot-brief";

type LabeledDraftFields = {
  headline: string;
  focusFirst: string;
  questions: string;
  avoidOverstating: string;
  followUpDraft: string;
  recapDraft: string;
  astrologerNotesDraft: string;
};

function createInputHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16);
}

function formatEnumLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function parseLabeledDraftText(rawText: string): LabeledDraftFields | null {
  const pattern =
    /(HEADLINE|FOCUS_FIRST|QUESTIONS|AVOID_OVERSTATING|FOLLOW_UP_DRAFT|RECAP_DRAFT|ASTROLOGER_NOTES_DRAFT):\s*([\s\S]*?)(?=\n(?:HEADLINE|FOCUS_FIRST|QUESTIONS|AVOID_OVERSTATING|FOLLOW_UP_DRAFT|RECAP_DRAFT|ASTROLOGER_NOTES_DRAFT):|\s*$)/g;
  const parts = new Map<string, string>();

  for (const match of rawText.matchAll(pattern)) {
    const key = match[1];
    const value = match[2]?.trim().replace(/\n{3,}/g, "\n\n") ?? "";
    parts.set(key, value);
  }

  const requiredKeys = [
    "HEADLINE",
    "FOCUS_FIRST",
    "QUESTIONS",
    "AVOID_OVERSTATING",
    "FOLLOW_UP_DRAFT",
    "RECAP_DRAFT",
    "ASTROLOGER_NOTES_DRAFT",
  ] as const;

  if (requiredKeys.some((key) => !parts.get(key))) {
    return null;
  }

  return {
    headline: parts.get("HEADLINE") ?? "",
    focusFirst: parts.get("FOCUS_FIRST") ?? "",
    questions: parts.get("QUESTIONS") ?? "",
    avoidOverstating: parts.get("AVOID_OVERSTATING") ?? "",
    followUpDraft: parts.get("FOLLOW_UP_DRAFT") ?? "",
    recapDraft: parts.get("RECAP_DRAFT") ?? "",
    astrologerNotesDraft: parts.get("ASTROLOGER_NOTES_DRAFT") ?? "",
  };
}

function buildFallbackDrafts(input: {
  clientName: string;
  chartNarrative: string;
  topThemeTitle: string;
  topRemedyTitle: string | null;
  topicFocus: string | null;
}): LabeledDraftFields {
  return {
    headline: `${input.clientName}: structured consultation brief anchored to chart context and approved remedy intelligence.`,
    focusFirst: `${input.topThemeTitle} Start with the client's own experience before interpretation, then connect that experience back to the deterministic chart narrative: ${input.chartNarrative}`,
    questions: [
      "What has felt most active for you recently in this area?",
      `Where do you notice this most in daily life${input.topicFocus ? `, especially around "${input.topicFocus}"` : ""}?`,
      "What kind of support feels sustainable for you right now?",
    ].join(" "),
    avoidOverstating:
      "Avoid deterministic promises and avoid framing remedies as guarantees. Keep guidance reflective, optional, and explicitly grounded in approved records only.",
    followUpDraft: input.topRemedyTitle
      ? `For follow-up, reinforce that ${input.topRemedyTitle} is optional spiritual support and not a guaranteed result. Invite practical reflection and adjust pace according to the client's lived response.`
      : "For follow-up, prioritize reflection notes and steady routine support before adding stronger remedy actions.",
    recapDraft:
      "This session reviewed the strongest chart themes with care, clarified what can and cannot be inferred, and outlined optional next supports for continued reflection.",
    astrologerNotesDraft:
      "Private notes: capture the client's language, stress points, and readiness level. Mark any sensitive topics for slower pacing in the next consultation.",
  };
}

function buildPriorityThemes(input: {
  signals: Awaited<ReturnType<ReturnType<typeof getRemedyRecommendationService>["getRecommendations"]>>["signals"];
}): CopilotPriorityTheme[] {
  return input.signals.slice(0, 4).map((signal, index) => ({
    key: signal.key,
    title: signal.title,
    level: signal.level,
    rationale: signal.rationale,
    focusOrder: index + 1,
    requiresManualJudgement: signal.level === "HIGH",
  }));
}

function buildRiskFlags(input: {
  recommendations: Awaited<ReturnType<ReturnType<typeof getRemedyRecommendationService>["getRecommendations"]>>["recommendations"];
}): CopilotRiskCautionFlag[] {
  const flags: CopilotRiskCautionFlag[] = [];

  for (const recommendation of input.recommendations.slice(0, 4)) {
    for (const caution of recommendation.cautions) {
      flags.push({
        key: `${recommendation.slug}-${caution.key}`,
        label: caution.label,
        severity:
          caution.key === "REQUIRES_EXPERT_CONSULTATION"
            ? "HIGH"
            : caution.key === "TIMING_SENSITIVE"
              ? "MEDIUM"
              : "LOW",
        reason: `${recommendation.title}: ${caution.note}`,
        astrologerGuidance:
          caution.key === "REQUIRES_EXPERT_CONSULTATION"
            ? "Handle this point directly in manual consultation and confirm suitability before stronger suggestions."
            : "Frame this as optional guidance and keep language non-urgent.",
      });
    }
  }

  if (!flags.length) {
    flags.push({
      key: "general-advisory-boundary",
      label: "Advisory boundary",
      severity: "LOW",
      reason:
        "Maintain reflective guidance and avoid claims that imply guaranteed outcomes.",
      astrologerGuidance:
        "Keep authority with professional judgement and the client's context.",
    });
  }

  return flags.slice(0, 5);
}

function buildDiscussionTopics(input: {
  themes: CopilotPriorityTheme[];
  consultationTopicFocus: string | null;
}): CopilotRecommendedDiscussionTopic[] {
  const topicSeed = input.consultationTopicFocus
    ? `Client focus: ${input.consultationTopicFocus}.`
    : "Client focus was not explicitly provided; begin with broad context check-in.";

  const generated: CopilotRecommendedDiscussionTopic[] = input.themes.map(
    (theme, index) => {
      const priority: CopilotRecommendedDiscussionTopic["priority"] =
        index === 0 ? "PRIMARY" : index <= 2 ? "SUPPORTIVE" : "OPTIONAL";

      return {
        title: `Theme ${index + 1}: ${theme.title}`,
        question:
          index === 0
            ? "What part of this theme feels most immediate in your current cycle?"
            : "Where do you experience this pattern most clearly right now?",
        rationale: `${theme.rationale} ${topicSeed}`,
        priority,
      };
    }
  );

  return generated.slice(0, 4);
}

function mapConsultationOption(record: {
  id: string;
  userId: string;
  confirmationCode: string;
  serviceLabel: string;
  scheduledFor: Date | null;
  status: string;
  topicFocus: string | null;
  user: { name: string | null };
}): AstrologerCopilotConsultationOption {
  return {
    consultationId: record.id,
    userId: record.userId,
    clientName: record.user.name ?? "Client",
    confirmationCode: record.confirmationCode,
    serviceLabel: record.serviceLabel,
    scheduledForUtc: record.scheduledFor?.toISOString() ?? null,
    status: record.status,
    topicFocus: record.topicFocus,
  };
}

function mapStoredBriefToResponse(
  snapshotId: string,
  payload: unknown
): AstrologerCopilotBrief | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as AstrologerCopilotBrief;

  return {
    ...candidate,
    id: snapshotId,
  };
}

export async function listAstrologerCopilotConsultationOptions() {
  const consultations = await getPrisma().consultation.findMany({
    where: {
      status: {
        in: ["REQUESTED", "CONFIRMED", "COMPLETED"],
      },
    },
    take: 20,
    orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      userId: true,
      confirmationCode: true,
      serviceLabel: true,
      scheduledFor: true,
      status: true,
      topicFocus: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return consultations.map(mapConsultationOption);
}

export async function trackAstrologerCopilotSnapshotEvent(input: {
  snapshotId: string;
  event: "copy" | "export";
}) {
  if (input.event === "copy") {
    await getPrisma().astrologerCopilotSnapshot.update({
      where: {
        id: input.snapshotId,
      },
      data: {
        copyCount: {
          increment: 1,
        },
        lastCopiedAt: new Date(),
      },
    });
    return;
  }

  await getPrisma().astrologerCopilotSnapshot.update({
    where: {
      id: input.snapshotId,
    },
    data: {
      exportCount: {
        increment: 1,
      },
      lastExportedAt: new Date(),
    },
  });
}

export async function generateAstrologerCopilotBrief(input: {
  consultationId: string;
  astrologerUserId: string;
}): Promise<{ snapshotId: string; brief: AstrologerCopilotBrief }> {
  const consultation = await getPrisma().consultation.findUnique({
    where: {
      id: input.consultationId,
    },
    select: {
      id: true,
      confirmationCode: true,
      userId: true,
      serviceLabel: true,
      scheduledFor: true,
      clientTimezone: true,
      preferredLanguage: true,
      topicFocus: true,
      intakeSummary: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!consultation) {
    throw new Error("Consultation could not be found for copilot generation.");
  }

  const [consultationHistory, chartOverview] = await Promise.all([
    getPrisma().consultation.findMany({
      where: {
        userId: consultation.userId,
      },
      orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        confirmationCode: true,
        status: true,
        serviceLabel: true,
        scheduledFor: true,
        topicFocus: true,
        intakeSummary: true,
      },
    }),
    getChartOverview(consultation.userId),
  ]);

  if (!chartOverview.chart || !chartOverview.chartRecord) {
    throw new Error(
      "A stored chart is required before generating the astrologer copilot brief."
    );
  }

  const [remedyOutput, insights] = await Promise.all([
    getRemedyRecommendationService().getRecommendations({
      chart: chartOverview.chart,
      logContext: {
        userId: consultation.userId,
        chartRecordId: chartOverview.chartRecord.id,
        surfaceKey: "astrologer-copilot",
      },
    }),
    getContentAdapter().listPublishedEntries(),
  ]);

  const clientSnapshot: CopilotClientSnapshot = {
    userId: consultation.userId,
    name: consultation.user.name ?? "Client",
    email: consultation.user.email,
    consultationId: consultation.id,
    confirmationCode: consultation.confirmationCode,
    serviceLabel: consultation.serviceLabel,
    scheduledForUtc: consultation.scheduledFor?.toISOString() ?? null,
    clientTimezone: consultation.clientTimezone,
    preferredLanguage: consultation.preferredLanguage,
    topicFocus: consultation.topicFocus,
    intakeSummary: consultation.intakeSummary,
    consultationHistoryCount: consultationHistory.length,
  };

  const chartSummaryPacket = {
    chartId: chartOverview.chartRecord.id,
    ascendantSign: formatEnumLabel(chartOverview.chart.ascendantSign),
    dominantBodies: chartOverview.chart.summary.dominantBodies.map(formatEnumLabel),
    narrative: chartOverview.chart.summary.narrative,
    notablePlacements: chartOverview.chart.planets.slice(0, 5).map((planet) => ({
      body: formatEnumLabel(planet.body),
      sign: formatEnumLabel(planet.sign),
      house: planet.house,
      retrograde: planet.retrograde,
    })),
    notableAspects: chartOverview.chart.aspects.slice(0, 4).map((aspect) => ({
      source: formatEnumLabel(aspect.source),
      type: formatEnumLabel(aspect.type),
      target: formatEnumLabel(aspect.target),
      orb: aspect.orb,
      exact: aspect.exact,
    })),
  };

  const priorityThemes = buildPriorityThemes({
    signals: remedyOutput.signals,
  });
  const riskCautionFlags = buildRiskFlags({
    recommendations: remedyOutput.recommendations,
  });
  const discussionTopics = buildDiscussionTopics({
    themes: priorityThemes,
    consultationTopicFocus: consultation.topicFocus,
  });

  const remedySummary = {
    generatedAtUtc: remedyOutput.summary.generatedAtUtc,
    topRecommendations: remedyOutput.recommendations.slice(0, 3).map((item) => ({
      slug: item.slug,
      title: item.title,
      priorityTier: item.priorityTier,
      confidenceLabel: item.confidenceLabel,
      whyThisRemedy: item.whyThisRemedy.summary,
      cautionLabels: item.cautions.map((caution) => caution.label),
    })),
    consultationPreparationSummary: remedyOutput.consultationPreparation.summary,
  };

  const promptVersion = await resolvePromptVersionByTemplateKey(
    astrologerCopilotPromptKey
  );
  const fallbackDrafts = buildFallbackDrafts({
    clientName: clientSnapshot.name,
    chartNarrative: chartSummaryPacket.narrative,
    topThemeTitle: priorityThemes[0]?.title ?? "Chart orientation",
    topRemedyTitle: remedySummary.topRecommendations[0]?.title ?? null,
    topicFocus: consultation.topicFocus,
  });

  const groundedInput = {
    clientSnapshot,
    chartSummaryPacket,
    priorityThemes,
    remedySummary,
    riskCautionFlags,
    discussionTopics,
    consultationHistory: consultationHistory.map((entry) => ({
      confirmationCode: entry.confirmationCode,
      status: entry.status,
      serviceLabel: entry.serviceLabel,
      scheduledForUtc: entry.scheduledFor?.toISOString() ?? null,
      topicFocus: entry.topicFocus,
      intakeSummary: entry.intakeSummary,
    })),
    relatedInsights: insights.slice(0, 3).map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      excerpt: entry.excerpt,
      type: entry.type,
    })),
  };

  const groundedResponse = await getAiGroundedTextService().generateReply({
    taskKind: "CONSULTATION_BRIEF_GENERATION",
    promptTemplateKey: promptVersion.templateKey,
    promptVersionLabel: promptVersion.label,
    instructions: promptVersion.systemPrompt,
    input: [promptVersion.userPrompt, JSON.stringify(groundedInput, null, 2)].join(
      "\n\n"
    ),
    fallbackText: [
      `HEADLINE: ${fallbackDrafts.headline}`,
      `FOCUS_FIRST: ${fallbackDrafts.focusFirst}`,
      `QUESTIONS: ${fallbackDrafts.questions}`,
      `AVOID_OVERSTATING: ${fallbackDrafts.avoidOverstating}`,
      `FOLLOW_UP_DRAFT: ${fallbackDrafts.followUpDraft}`,
      `RECAP_DRAFT: ${fallbackDrafts.recapDraft}`,
      `ASTROLOGER_NOTES_DRAFT: ${fallbackDrafts.astrologerNotesDraft}`,
    ].join("\n\n"),
  });

  const parsedDrafts = parseLabeledDraftText(groundedResponse.text) ?? fallbackDrafts;

  const brief: AstrologerCopilotBrief = {
    id: "",
    generatedAtUtc: new Date().toISOString(),
    providerKey: groundedResponse.providerKey,
    model: groundedResponse.model,
    promptTemplateKey: groundedResponse.promptTemplateKey,
    promptVersionLabel: groundedResponse.promptVersionLabel,
    clientSnapshot,
    chartSummaryPacket,
    priorityThemes,
    riskCautionFlags,
    remedySummary,
    discussionTopics,
    sections: {
      focusFirst: parsedDrafts.focusFirst,
      questions: parsedDrafts.questions,
      avoidOverstating: parsedDrafts.avoidOverstating,
    },
    drafts: {
      headline: parsedDrafts.headline,
      followUpDraft: parsedDrafts.followUpDraft,
      recapDraft: parsedDrafts.recapDraft,
      astrologerNotesDraft: parsedDrafts.astrologerNotesDraft,
    },
  };

  const inputHash = createInputHash(JSON.stringify(groundedInput));
  const [snapshot, taskRun] = await Promise.all([
    getPrisma().astrologerCopilotSnapshot.create({
      data: {
        consultationId: consultation.id,
        astrologerUserId: input.astrologerUserId,
        providerKey: brief.providerKey,
        model: brief.model,
        promptTemplateKey: brief.promptTemplateKey,
        promptVersionLabel: brief.promptVersionLabel,
        inputHash,
        snapshotPayload: brief,
        briefText: brief.sections.focusFirst,
        followUpDraft: brief.drafts.followUpDraft,
        recapDraft: brief.drafts.recapDraft,
        astrologerNotesDraft: brief.drafts.astrologerNotesDraft,
      },
      select: {
        id: true,
      },
    }),
    getPrisma().aiTaskRun.create({
      data: {
        userId: input.astrologerUserId,
        taskKind: "CONSULTATION_BRIEF_GENERATION",
        status: "SUCCEEDED",
        providerKey: brief.providerKey,
        model: brief.model,
        promptTemplateKey: brief.promptTemplateKey,
        promptVersionLabel: brief.promptVersionLabel,
        inputHash,
        inputPayload: groundedInput,
        outputPayload: {
          headline: brief.drafts.headline,
          focusFirst: brief.sections.focusFirst,
          followUpDraft: brief.drafts.followUpDraft,
          recapDraft: brief.drafts.recapDraft,
        },
        normalizedOutput: brief,
        completedAt: new Date(),
      },
      select: {
        id: true,
      },
    }),
  ]);

  const savedBrief = {
    ...brief,
    id: snapshot.id,
  };

  await getPrisma().astrologerCopilotSnapshot.update({
    where: {
      id: snapshot.id,
    },
    data: {
      snapshotPayload: {
        ...savedBrief,
        taskRunId: taskRun.id,
      },
    },
  });

  return {
    snapshotId: snapshot.id,
    brief: savedBrief,
  };
}

export async function getAstrologerCopilotPageData(input: {
  selectedConsultationId?: string | null;
  snapshotId?: string | null;
}): Promise<AstrologerCopilotPageData> {
  const consultationOptions = await listAstrologerCopilotConsultationOptions();
  const selectedConsultationId =
    input.selectedConsultationId ??
    consultationOptions[0]?.consultationId ??
    null;

  if (!input.snapshotId) {
    return {
      consultationOptions,
      selectedConsultationId,
      brief: null,
      lastGeneratedSnapshotId: null,
    };
  }

  const snapshot = await getPrisma().astrologerCopilotSnapshot.findUnique({
    where: {
      id: input.snapshotId,
    },
    select: {
      id: true,
      snapshotPayload: true,
    },
  });

  if (!snapshot) {
    return {
      consultationOptions,
      selectedConsultationId,
      brief: null,
      lastGeneratedSnapshotId: null,
    };
  }

  const brief = mapStoredBriefToResponse(snapshot.id, snapshot.snapshotPayload);

  return {
    consultationOptions,
    selectedConsultationId,
    brief,
    lastGeneratedSnapshotId: snapshot.id,
  };
}
