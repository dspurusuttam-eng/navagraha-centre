export type AIHistoryModuleLabel =
  | "Core Jyotish"
  | "Career"
  | "Marriage"
  | "Finance"
  | "Health"
  | "Education"
  | "Business"
  | "Daily Prediction"
  | "Remedies"
  | "General";

export type AIHistoryInput = {
  title: string;
  firstQuestion: string;
  moduleLabel: AIHistoryModuleLabel;
  relatedKundliId: string | null;
  relatedKundliLabel: string | null;
  lastMessageSnippet: string | null;
};

export type AIHistoryRecord = AIHistoryInput & {
  id: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type AIHistoryCatalog = {
  ownerId: string | null;
  records: AIHistoryRecord[];
};

export type AIHistorySummaryItem = {
  id: string;
  title: string;
  firstQuestion: string;
  moduleLabel: AIHistoryModuleLabel;
  relatedKundliId: string | null;
  relatedKundliLabel: string | null;
  createdAtUtc: string | null;
  updatedAtUtc: string | null;
  lastMessageSnippet: string;
  continueHref: string;
};

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `ai_${crypto.randomUUID()}`;
  }

  return `ai_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value: string | null | undefined, fallback: string) {
  const trimmed = (value ?? "").replace(/\s+/g, " ").trim();

  if (!trimmed) {
    return fallback;
  }

  if (trimmed.length <= 140) {
    return trimmed;
  }

  return `${trimmed.slice(0, 137).trimEnd()}...`;
}

export function createEmptyAIHistoryCatalog(ownerId: string | null = null): AIHistoryCatalog {
  return {
    ownerId,
    records: [],
  };
}

export function isAIHistoryOwnedByUser(recordOwnerId: string | null | undefined, sessionUserId: string | null | undefined) {
  if (!recordOwnerId || !sessionUserId) {
    return false;
  }

  return recordOwnerId === sessionUserId;
}

export function toAIHistorySummary(record: AIHistoryRecord): AIHistorySummaryItem {
  return {
    id: record.id,
    title: normalizeText(record.title, "Conversation"),
    firstQuestion: normalizeText(record.firstQuestion, "Question unavailable"),
    moduleLabel: record.moduleLabel,
    relatedKundliId: record.relatedKundliId,
    relatedKundliLabel: record.relatedKundliLabel,
    createdAtUtc: record.createdAt,
    updatedAtUtc: record.updatedAt,
    lastMessageSnippet: normalizeText(record.lastMessageSnippet, "Summary unavailable"),
    continueHref: `/dashboard/ai-history/${record.id}`,
  };
}

export function listAIHistorySessions(catalog: AIHistoryCatalog) {
  return [...catalog.records].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getLatestAIHistorySession(catalog: AIHistoryCatalog) {
  return listAIHistorySessions(catalog)[0] ?? null;
}

export function createAIHistorySession(catalog: AIHistoryCatalog, ownerId: string, input: AIHistoryInput) {
  const now = new Date().toISOString();
  const record: AIHistoryRecord = {
    id: createId(),
    ownerId,
    title: normalizeText(input.title, "Conversation"),
    firstQuestion: normalizeText(input.firstQuestion, "Question unavailable"),
    moduleLabel: input.moduleLabel,
    relatedKundliId: input.relatedKundliId,
    relatedKundliLabel: input.relatedKundliLabel,
    lastMessageSnippet: normalizeText(input.lastMessageSnippet, "Summary unavailable"),
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...catalog,
    ownerId,
    records: [record, ...catalog.records],
  };
}

export function updateAIHistorySession(
  catalog: AIHistoryCatalog,
  ownerId: string,
  recordId: string,
  input: Partial<AIHistoryInput>
) {
  return {
    ...catalog,
    records: catalog.records.map((record) => {
      if (!isAIHistoryOwnedByUser(record.ownerId, ownerId) || record.id !== recordId) {
        return record;
      }

      return {
        ...record,
        title: input.title ? normalizeText(input.title, record.title) : record.title,
        firstQuestion: input.firstQuestion ? normalizeText(input.firstQuestion, record.firstQuestion) : record.firstQuestion,
        moduleLabel: input.moduleLabel ?? record.moduleLabel,
        relatedKundliId: input.relatedKundliId ?? record.relatedKundliId,
        relatedKundliLabel:
          input.relatedKundliLabel === undefined
            ? record.relatedKundliLabel
            : input.relatedKundliLabel,
        lastMessageSnippet: input.lastMessageSnippet
          ? normalizeText(
              input.lastMessageSnippet,
              record.lastMessageSnippet ?? "Summary unavailable"
            )
          : record.lastMessageSnippet ?? "Summary unavailable",
        updatedAt: new Date().toISOString(),
      };
    }),
  };
}

export function deleteAIHistorySession(catalog: AIHistoryCatalog, ownerId: string, recordId: string) {
  const matchedRecord = catalog.records.find(
    (record) => isAIHistoryOwnedByUser(record.ownerId, ownerId) && record.id === recordId
  );

  if (!matchedRecord) {
    return catalog;
  }

  return {
    ...catalog,
    records: catalog.records.filter((record) => !isAIHistoryOwnedByUser(record.ownerId, ownerId) || record.id !== recordId),
  };
}
