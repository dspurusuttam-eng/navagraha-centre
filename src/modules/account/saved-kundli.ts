export type SavedKundliInput = {
  label: string;
  gender: string | null;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  latitude: string | null;
  longitude: string | null;
  timezone: string | null;
};

export type SavedKundliRecord = SavedKundliInput & {
  id: string;
  ownerId: string;
  ascendantSign: string | null;
  moonSign: string | null;
  chartSummary: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SavedKundliCatalog = {
  ownerId: string | null;
  records: SavedKundliRecord[];
};

export type SavedKundliSummary = {
  id: string;
  label: string;
  birthPlace: string;
  birthDateLabel: string;
  chartSummary: string;
  ascendantSign: string | null;
  moonSign: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `kundli_${crypto.randomUUID()}`;
  }

  return `kundli_${Math.random().toString(36).slice(2, 10)}`;
}

function toDateLabel(value: string) {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export function createEmptySavedKundliCatalog(ownerId: string | null = null): SavedKundliCatalog {
  return {
    ownerId,
    records: [],
  };
}

export function isSavedKundliOwnedByUser(recordOwnerId: string | null | undefined, sessionUserId: string | null | undefined) {
  if (!recordOwnerId || !sessionUserId) {
    return false;
  }

  return recordOwnerId === sessionUserId;
}

export function toSavedKundliSummary(record: SavedKundliRecord): SavedKundliSummary {
  return {
    id: record.id,
    label: record.label,
    birthPlace: record.birthPlace,
    birthDateLabel: toDateLabel(record.dateOfBirth),
    chartSummary: record.chartSummary ?? "Chart summary unavailable yet",
    ascendantSign: record.ascendantSign,
    moonSign: record.moonSign,
    isDefault: record.isDefault,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function listSavedKundlis(catalog: SavedKundliCatalog) {
  return [...catalog.records].sort((left, right) => {
    if (left.isDefault && !right.isDefault) {
      return -1;
    }

    if (!left.isDefault && right.isDefault) {
      return 1;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function getActiveSavedKundli(catalog: SavedKundliCatalog) {
  return catalog.records.find((record) => record.isDefault) ?? catalog.records[0] ?? null;
}

export function createSavedKundli(
  catalog: SavedKundliCatalog,
  ownerId: string,
  input: SavedKundliInput
) {
  const now = new Date().toISOString();
  const nextRecord: SavedKundliRecord = {
    id: createId(),
    ownerId,
    ...input,
    ascendantSign: null,
    moonSign: null,
    chartSummary: null,
    isDefault: catalog.records.length === 0,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...catalog,
    ownerId,
    records: [nextRecord, ...catalog.records],
  };
}

export function updateSavedKundli(
  catalog: SavedKundliCatalog,
  ownerId: string,
  recordId: string,
  input: Partial<SavedKundliInput>
) {
  return {
    ...catalog,
    records: catalog.records.map((record) => {
      if (!isSavedKundliOwnedByUser(record.ownerId, ownerId) || record.id !== recordId) {
        return record;
      }

      return {
        ...record,
        ...input,
        updatedAt: new Date().toISOString(),
      };
    }),
  };
}

export function deleteSavedKundli(catalog: SavedKundliCatalog, ownerId: string, recordId: string) {
  const matchedRecord = catalog.records.find(
    (record) => isSavedKundliOwnedByUser(record.ownerId, ownerId) && record.id === recordId
  );

  if (!matchedRecord) {
    return catalog;
  }

  const nextRecords = catalog.records.filter(
    (record) => !isSavedKundliOwnedByUser(record.ownerId, ownerId) || record.id !== recordId
  );

  const stillHasDefault = nextRecords.some((record) => record.isDefault);
  const normalizedRecords = stillHasDefault
    ? nextRecords
    : nextRecords.map((record, index) => ({ ...record, isDefault: index === 0 }));

  return {
    ...catalog,
    records: normalizedRecords,
  };
}

export function setActiveSavedKundli(catalog: SavedKundliCatalog, ownerId: string, recordId: string) {
  const matchedRecord = catalog.records.find(
    (record) => isSavedKundliOwnedByUser(record.ownerId, ownerId) && record.id === recordId
  );

  if (!matchedRecord) {
    return catalog;
  }

  return {
    ...catalog,
    records: catalog.records.map((record) => ({
      ...record,
      isDefault: isSavedKundliOwnedByUser(record.ownerId, ownerId) && record.id === recordId,
    })),
  };
}
