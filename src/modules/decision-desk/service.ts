import "server-only";

import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  validateDecisionRecordListQuery,
  validateDecisionRecordWriteInput,
  type DecisionDeskErrorCode,
  type DecisionDeskValidationResult,
  type DecisionRecordListQuery,
  type DecisionRecordStatusInput,
  type DecisionRecordWriteInput,
} from "@/modules/decision-desk/validation";

export {
  decisionDeskErrorStatus,
  type DecisionDeskErrorCode,
} from "@/modules/decision-desk/validation";

export type DecisionDeskServiceFailure = {
  success: false;
  error: { code: DecisionDeskErrorCode; message: string; details?: unknown };
};

export type DecisionDeskServiceResult<T> =
  | { success: true; data: T }
  | DecisionDeskServiceFailure;

export type DecisionDeskRecordDto = {
  id: string;
  title: string;
  decisionCategory: string;
  status: DecisionRecordStatusInput;
  decisionRating: string | null;
  date: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  panchangSnapshot: unknown;
  goodTimeBlocks: unknown;
  avoidTimeBlocks: unknown;
  horaAvailable: boolean;
  userNote: string | null;
  outcomeNote: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DecisionDeskListDto = {
  records: DecisionDeskRecordDto[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

type PrismaStatus = "PLANNED" | "DONE" | "SKIPPED";

function toPrismaStatus(status: DecisionRecordStatusInput): PrismaStatus {
  return status.toUpperCase() as PrismaStatus;
}

function fromPrismaStatus(status: string): DecisionRecordStatusInput {
  return status.toLowerCase() as DecisionRecordStatusInput;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type DecisionDeskRow = {
  id: string;
  title: string;
  decisionCategory: string;
  status: string;
  decisionRating: string | null;
  date: string;
  timezone: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  locationLabel: string | null;
  panchangSnapshot: Prisma.JsonValue;
  goodTimeBlocks: Prisma.JsonValue;
  avoidTimeBlocks: Prisma.JsonValue;
  horaAvailable: boolean;
  userNote: string | null;
  outcomeNote: string | null;
  followUpDate: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toDto(row: DecisionDeskRow): DecisionDeskRecordDto {
  return {
    id: row.id,
    title: row.title,
    decisionCategory: row.decisionCategory,
    status: fromPrismaStatus(row.status),
    decisionRating: row.decisionRating,
    date: row.date,
    timezone: row.timezone,
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    locationLabel: row.locationLabel,
    panchangSnapshot: row.panchangSnapshot ?? null,
    goodTimeBlocks: row.goodTimeBlocks ?? null,
    avoidTimeBlocks: row.avoidTimeBlocks ?? null,
    horaAvailable: row.horaAvailable,
    userNote: row.userNote,
    outcomeNote: row.outcomeNote,
    followUpDate: row.followUpDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function fail(
  code: DecisionDeskErrorCode,
  message: string,
  details?: unknown
): DecisionDeskServiceFailure {
  return {
    success: false,
    error: { code, message, ...(details === undefined ? {} : { details }) },
  };
}

function toJsonWrite(
  value: unknown
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue);
}

function buildWriteData(
  input: DecisionRecordWriteInput
): Prisma.DecisionDeskRecordUncheckedUpdateInput {
  const data: Prisma.DecisionDeskRecordUncheckedUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.decisionCategory !== undefined) data.decisionCategory = input.decisionCategory;
  if (input.status !== undefined) data.status = toPrismaStatus(input.status);
  if (input.decisionRating !== undefined) data.decisionRating = input.decisionRating;
  if (input.date !== undefined) data.date = input.date;
  if (input.timezone !== undefined) data.timezone = input.timezone;
  if (input.latitude !== undefined) data.latitude = input.latitude;
  if (input.longitude !== undefined) data.longitude = input.longitude;
  if (input.locationLabel !== undefined) data.locationLabel = input.locationLabel;
  if (input.panchangSnapshot !== undefined) data.panchangSnapshot = toJsonWrite(input.panchangSnapshot);
  if (input.goodTimeBlocks !== undefined) data.goodTimeBlocks = toJsonWrite(input.goodTimeBlocks);
  if (input.avoidTimeBlocks !== undefined) data.avoidTimeBlocks = toJsonWrite(input.avoidTimeBlocks);
  if (input.horaAvailable !== undefined) data.horaAvailable = input.horaAvailable;
  if (input.userNote !== undefined) data.userNote = input.userNote;
  if (input.outcomeNote !== undefined) data.outcomeNote = input.outcomeNote;
  if (input.followUpDate !== undefined) data.followUpDate = input.followUpDate;
  return data;
}

export async function createDecisionRecord(
  userId: string,
  payload: Record<string, unknown>
): Promise<DecisionDeskServiceResult<DecisionDeskRecordDto>> {
  const validated: DecisionDeskValidationResult<DecisionRecordWriteInput> =
    validateDecisionRecordWriteInput(payload, "create");

  if (!validated.ok) {
    return fail(validated.error.code, validated.error.message, validated.error.details);
  }

  // Required fields are guaranteed present by "create"-mode validation.
  const createData = {
    userId,
    ...buildWriteData(validated.data),
  } as Prisma.DecisionDeskRecordUncheckedCreateInput;

  const created = await getPrisma().decisionDeskRecord.create({ data: createData });

  return { success: true, data: toDto(created as unknown as DecisionDeskRow) };
}

export async function listDecisionRecords(
  userId: string,
  params: URLSearchParams
): Promise<DecisionDeskServiceResult<DecisionDeskListDto>> {
  const validated: DecisionDeskValidationResult<DecisionRecordListQuery> =
    validateDecisionRecordListQuery(params);

  if (!validated.ok) {
    return fail(validated.error.code, validated.error.message, validated.error.details);
  }

  const { page, pageSize, status, decisionCategory } = validated.data;
  const where: Prisma.DecisionDeskRecordWhereInput = {
    userId,
    ...(status ? { status: toPrismaStatus(status) } : {}),
    ...(decisionCategory ? { decisionCategory } : {}),
  };
  const prisma = getPrisma();
  const [total, rows] = await Promise.all([
    prisma.decisionDeskRecord.count({ where }),
    prisma.decisionDeskRecord.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    success: true,
    data: {
      records: rows.map((row) => toDto(row as unknown as DecisionDeskRow)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
  };
}

export async function getDecisionRecord(
  userId: string,
  recordId: string
): Promise<DecisionDeskServiceResult<DecisionDeskRecordDto>> {
  const row = await getPrisma().decisionDeskRecord.findFirst({
    where: { id: recordId, userId },
  });

  if (!row) {
    return fail("NOT_FOUND", "Decision desk record could not be found.");
  }

  return { success: true, data: toDto(row as unknown as DecisionDeskRow) };
}

export async function updateDecisionRecord(
  userId: string,
  recordId: string,
  payload: Record<string, unknown>
): Promise<DecisionDeskServiceResult<DecisionDeskRecordDto>> {
  const validated: DecisionDeskValidationResult<DecisionRecordWriteInput> =
    validateDecisionRecordWriteInput(payload, "update");

  if (!validated.ok) {
    return fail(validated.error.code, validated.error.message, validated.error.details);
  }

  const data = buildWriteData(validated.data);

  if (Object.keys(data).length === 0) {
    return fail("EMPTY_UPDATE", "At least one field must be provided for update.");
  }

  const prisma = getPrisma();
  const existing = await prisma.decisionDeskRecord.findFirst({
    where: { id: recordId, userId },
    select: { id: true },
  });

  if (!existing) {
    return fail("NOT_FOUND", "Decision desk record could not be found.");
  }

  const updated = await prisma.decisionDeskRecord.update({
    where: { id: existing.id },
    data,
  });

  return { success: true, data: toDto(updated as unknown as DecisionDeskRow) };
}

export async function deleteDecisionRecord(
  userId: string,
  recordId: string
): Promise<DecisionDeskServiceResult<{ id: string }>> {
  const prisma = getPrisma();
  const existing = await prisma.decisionDeskRecord.findFirst({
    where: { id: recordId, userId },
    select: { id: true },
  });

  if (!existing) {
    return fail("NOT_FOUND", "Decision desk record could not be found.");
  }

  await prisma.decisionDeskRecord.delete({ where: { id: existing.id } });

  return { success: true, data: { id: existing.id } };
}
