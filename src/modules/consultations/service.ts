import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";
import {
  ConsultationStatus,
  type ConsultationSlotStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { ensureUserProfile } from "@/modules/account/service";
import {
  commonBookingTimezones,
  consultationHost,
  consultationPackages,
  getConsultationPackageBySlug,
  type ConsultationPackageDefinition,
} from "@/modules/consultations/catalog";
import {
  formatDateTimeInTimeZone,
  formatSlotWindow,
  isValidTimeZone,
} from "@/modules/consultations/time";
import type {
  ConsultationBookingData,
  ConsultationPackageCard,
} from "@/modules/consultations/view";

type ConsultationTransaction = Prisma.TransactionClient | PrismaClient;

export type ConsultationBookingInput = {
  userId: string;
  packageSlug: string;
  slotId: string;
  birthDataId: string | null;
  clientTimezone: string;
  preferredLanguage: string;
  contactPhone: string | null;
  topicFocus: string;
  intakeSummary: string;
};

export type ConsultationListItem = {
  id: string;
  confirmationCode: string;
  status: ConsultationStatus;
  serviceLabel: string;
  packageSlug: string | null;
  scheduledForUtc: string | null;
  scheduledEndUtc: string | null;
  clientTimezone: string | null;
  preferredLanguage: string | null;
  astrologerName: string;
  topicFocus: string | null;
  intakeSummary: string | null;
  birthProfileLabel: string | null;
  createdAtUtc: string;
};

export type ConsultationDetail = ConsultationListItem & {
  packageDescription: string | null;
  durationMinutes: number | null;
  slotTimezone: string | null;
};

export type ConsultationAdminBoard = {
  metrics: {
    openSlots: number;
    confirmedBookings: number;
    requestedBookings: number;
    completedBookings: number;
  };
  upcomingBookings: ConsultationDetail[];
  openSlots: {
    id: string;
    startsAtUtc: string;
    endsAtUtc: string;
    timezone: string;
    status: ConsultationSlotStatus;
    note: string | null;
  }[];
};

function formatCurrencyFromMinor(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function buildPackageCard(
  item: ConsultationPackageDefinition
): ConsultationPackageCard {
  return {
    ...item,
    durationLabel: `${item.durationMinutes} min`,
    priceLabel: `From ${formatCurrencyFromMinor(item.priceFromMinor)}`,
  };
}

function getDefaultPackageSlug(initialPackageSlug?: string | null) {
  if (initialPackageSlug && getConsultationPackageBySlug(initialPackageSlug)) {
    return initialPackageSlug;
  }

  return consultationPackages[0]?.slug ?? "";
}

function buildBirthProfileSummary(profile: {
  birthDate: string;
  birthTime: string | null;
  city: string;
  region: string | null;
  country: string;
}) {
  return [
    profile.birthDate,
    profile.birthTime ?? "Time pending",
    profile.city,
    profile.region,
    profile.country,
  ]
    .filter(Boolean)
    .join(" | ");
}

function normalizeOptionalText(
  value: string | null | undefined,
  maxLength: number
) {
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

function normalizeRequiredText(
  value: string,
  label: string,
  maxLength: number
) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${label} must stay within ${maxLength} characters.`);
  }

  return normalized;
}

function buildConfirmationCode() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();

  return `NC-${stamp}-${suffix}`;
}

async function upsertConsultationPackage(
  tx: ConsultationTransaction,
  packageDefinition: ConsultationPackageDefinition
) {
  return tx.consultationPackage.upsert({
    where: { slug: packageDefinition.slug },
    update: {
      type: packageDefinition.type,
      title: packageDefinition.title,
      summary: packageDefinition.summary,
      description: packageDefinition.description,
      durationMinutes: packageDefinition.durationMinutes,
      priceFromMinor: packageDefinition.priceFromMinor,
      isFeatured: packageDefinition.isFeatured,
      isActive: true,
      sortOrder: packageDefinition.sortOrder,
    },
    create: {
      slug: packageDefinition.slug,
      type: packageDefinition.type,
      title: packageDefinition.title,
      summary: packageDefinition.summary,
      description: packageDefinition.description,
      durationMinutes: packageDefinition.durationMinutes,
      priceFromMinor: packageDefinition.priceFromMinor,
      currencyCode: "INR",
      isFeatured: packageDefinition.isFeatured,
      isActive: true,
      sortOrder: packageDefinition.sortOrder,
    },
  });
}

function mapConsultationRecordToDetail(record: {
  id: string;
  confirmationCode: string;
  status: ConsultationStatus;
  serviceLabel: string;
  scheduledFor: Date | null;
  scheduledEnd: Date | null;
  clientTimezone: string | null;
  preferredLanguage: string | null;
  astrologerName: string;
  topicFocus: string | null;
  intakeSummary: string | null;
  createdAt: Date;
  birthData: { label: string } | null;
  package: {
    slug: string;
    description: string | null;
    durationMinutes: number;
  } | null;
  slot: { timezone: string } | null;
}): ConsultationDetail {
  return {
    id: record.id,
    confirmationCode: record.confirmationCode,
    status: record.status,
    serviceLabel: record.serviceLabel,
    packageSlug: record.package?.slug ?? null,
    scheduledForUtc: record.scheduledFor?.toISOString() ?? null,
    scheduledEndUtc: record.scheduledEnd?.toISOString() ?? null,
    clientTimezone: record.clientTimezone,
    preferredLanguage: record.preferredLanguage,
    astrologerName: record.astrologerName,
    topicFocus: record.topicFocus,
    intakeSummary: record.intakeSummary,
    birthProfileLabel: record.birthData?.label ?? null,
    createdAtUtc: record.createdAt.toISOString(),
    packageDescription: record.package?.description ?? null,
    durationMinutes: record.package?.durationMinutes ?? null,
    slotTimezone: record.slot?.timezone ?? null,
  };
}

export function getConsultationPackages() {
  return consultationPackages
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(buildPackageCard);
}

export async function getConsultationBookingData(
  userId: string,
  initialPackageSlug?: string | null
): Promise<ConsultationBookingData> {
  const prisma = getPrisma();
  const profile = await ensureUserProfile(userId);
  const [user, birthProfiles, slots] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    }),
    prisma.birthData.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        label: true,
        birthDate: true,
        birthTime: true,
        city: true,
        region: true,
        country: true,
      },
    }),
    prisma.consultationSlot.findMany({
      where: {
        status: "OPEN",
        startsAt: {
          gt: new Date(),
        },
      },
      orderBy: [{ startsAt: "asc" }],
      take: 12,
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        timezone: true,
        note: true,
      },
    }),
  ]);

  const defaultTimezone =
    profile.timezone && isValidTimeZone(profile.timezone)
      ? profile.timezone
      : consultationHost.timezone;

  return {
    user,
    defaults: {
      timezone: defaultTimezone,
      phone: profile.phone ?? "",
      preferredLanguage: profile.preferredLanguage ?? "en",
      selectedPackageSlug: getDefaultPackageSlug(initialPackageSlug),
      selectedBirthDataId: birthProfiles[0]?.id ?? "",
    },
    packages: getConsultationPackages(),
    timezones: Array.from(
      new Set([
        defaultTimezone,
        ...commonBookingTimezones,
        consultationHost.timezone,
      ])
    ),
    birthProfiles: birthProfiles.map((profileItem) => ({
      id: profileItem.id,
      label: profileItem.label,
      summary: buildBirthProfileSummary(profileItem),
    })),
    slots: slots.map((slot) => ({
      id: slot.id,
      startsAtUtc: slot.startsAt.toISOString(),
      endsAtUtc: slot.endsAt.toISOString(),
      timezone: slot.timezone,
      note: slot.note,
    })),
  };
}

export async function createConsultationBooking(
  input: ConsultationBookingInput
) {
  const packageDefinition = getConsultationPackageBySlug(input.packageSlug);

  if (!packageDefinition) {
    throw new Error("Please choose a valid consultation package.");
  }

  const clientTimezone = normalizeRequiredText(
    input.clientTimezone,
    "Timezone",
    120
  );

  if (!isValidTimeZone(clientTimezone)) {
    throw new Error("Please choose a valid IANA timezone.");
  }

  const preferredLanguage = normalizeRequiredText(
    input.preferredLanguage,
    "Preferred language",
    24
  );
  const topicFocus = normalizeRequiredText(
    input.topicFocus,
    "Topic focus",
    160
  );
  const intakeSummary = normalizeRequiredText(
    input.intakeSummary,
    "Intake summary",
    1200
  );
  const contactPhone = normalizeOptionalText(input.contactPhone, 40);
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const slot = await tx.consultationSlot.findUnique({
      where: { id: input.slotId },
      select: {
        id: true,
        status: true,
        startsAt: true,
        endsAt: true,
        timezone: true,
      },
    });

    if (!slot || slot.status !== "OPEN") {
      throw new Error(
        "That time slot is no longer available. Please choose another slot."
      );
    }

    if (slot.startsAt <= new Date()) {
      throw new Error(
        "That time slot has already passed. Please choose a future slot."
      );
    }

    const packageRecord = await upsertConsultationPackage(
      tx,
      packageDefinition
    );

    let birthDataId: string | null = null;

    if (input.birthDataId) {
      const birthProfile = await tx.birthData.findFirst({
        where: {
          id: input.birthDataId,
          userId: input.userId,
        },
        select: { id: true },
      });

      if (!birthProfile) {
        throw new Error("The selected birth profile could not be found.");
      }

      birthDataId = birthProfile.id;
    }

    const reservedSlot = await tx.consultationSlot.updateMany({
      where: {
        id: slot.id,
        status: "OPEN",
      },
      data: {
        status: "BOOKED",
      },
    });

    if (reservedSlot.count !== 1) {
      throw new Error(
        "That time slot was just taken. Please choose another slot."
      );
    }

    await tx.profile.upsert({
      where: { userId: input.userId },
      update: {
        phone: contactPhone,
        timezone: clientTimezone,
        preferredLanguage,
      },
      create: {
        userId: input.userId,
        phone: contactPhone,
        timezone: clientTimezone,
        preferredLanguage,
      },
    });

    const confirmationCode = buildConfirmationCode();
    const consultation = await tx.consultation.create({
      data: {
        userId: input.userId,
        birthDataId,
        packageId: packageRecord.id,
        slotId: slot.id,
        type: packageRecord.type,
        status: "CONFIRMED",
        confirmationCode,
        astrologerName: consultationHost.astrologerName,
        serviceLabel: packageRecord.title,
        scheduledFor: slot.startsAt,
        scheduledEnd: slot.endsAt,
        durationMinutes: packageRecord.durationMinutes,
        clientTimezone,
        preferredLanguage,
        contactPhone,
        topicFocus,
        intakeSummary,
      },
      select: {
        id: true,
        confirmationCode: true,
      },
    });

    return consultation;
  });
}

export async function getUserConsultations(userId: string) {
  const consultations = await getPrisma().consultation.findMany({
    where: { userId },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      confirmationCode: true,
      status: true,
      serviceLabel: true,
      scheduledFor: true,
      scheduledEnd: true,
      clientTimezone: true,
      preferredLanguage: true,
      astrologerName: true,
      topicFocus: true,
      intakeSummary: true,
      createdAt: true,
      birthData: {
        select: { label: true },
      },
      package: {
        select: {
          slug: true,
          description: true,
          durationMinutes: true,
        },
      },
      slot: {
        select: {
          timezone: true,
        },
      },
    },
  });

  return consultations.map(mapConsultationRecordToDetail);
}

export async function getConsultationDetail(
  userId: string,
  consultationId: string
) {
  const consultation = await getPrisma().consultation.findFirst({
    where: {
      id: consultationId,
      userId,
    },
    select: {
      id: true,
      confirmationCode: true,
      status: true,
      serviceLabel: true,
      scheduledFor: true,
      scheduledEnd: true,
      clientTimezone: true,
      preferredLanguage: true,
      astrologerName: true,
      topicFocus: true,
      intakeSummary: true,
      createdAt: true,
      birthData: {
        select: { label: true },
      },
      package: {
        select: {
          slug: true,
          description: true,
          durationMinutes: true,
        },
      },
      slot: {
        select: {
          timezone: true,
        },
      },
    },
  });

  return consultation ? mapConsultationRecordToDetail(consultation) : null;
}

export async function getConsultationAdminBoard(): Promise<ConsultationAdminBoard> {
  const prisma = getPrisma();
  const now = new Date();
  const [openSlots, confirmedBookings, requestedBookings, completedBookings] =
    await Promise.all([
      prisma.consultationSlot.count({
        where: {
          status: "OPEN",
          startsAt: { gt: now },
        },
      }),
      prisma.consultation.count({
        where: {
          status: ConsultationStatus.CONFIRMED,
          scheduledFor: { gt: now },
        },
      }),
      prisma.consultation.count({
        where: {
          status: ConsultationStatus.REQUESTED,
        },
      }),
      prisma.consultation.count({
        where: {
          status: ConsultationStatus.COMPLETED,
        },
      }),
    ]);

  const [upcomingBookings, availableSlots] = await Promise.all([
    prisma.consultation.findMany({
      where: {
        status: {
          in: [ConsultationStatus.REQUESTED, ConsultationStatus.CONFIRMED],
        },
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        confirmationCode: true,
        status: true,
        serviceLabel: true,
        scheduledFor: true,
        scheduledEnd: true,
        clientTimezone: true,
        preferredLanguage: true,
        astrologerName: true,
        topicFocus: true,
        intakeSummary: true,
        createdAt: true,
        birthData: {
          select: { label: true },
        },
        package: {
          select: {
            slug: true,
            description: true,
            durationMinutes: true,
          },
        },
        slot: {
          select: {
            timezone: true,
          },
        },
      },
    }),
    prisma.consultationSlot.findMany({
      where: {
        status: "OPEN",
        startsAt: { gt: now },
      },
      orderBy: [{ startsAt: "asc" }],
      take: 8,
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        timezone: true,
        status: true,
        note: true,
      },
    }),
  ]);

  return {
    metrics: {
      openSlots,
      confirmedBookings,
      requestedBookings,
      completedBookings,
    },
    upcomingBookings: upcomingBookings.map(mapConsultationRecordToDetail),
    openSlots: availableSlots.map((slot) => ({
      id: slot.id,
      startsAtUtc: slot.startsAt.toISOString(),
      endsAtUtc: slot.endsAt.toISOString(),
      timezone: slot.timezone,
      status: slot.status,
      note: slot.note,
    })),
  };
}

export function formatConsultationScheduleLine(
  startsAtUtc: string | null,
  endsAtUtc: string | null,
  clientTimezone: string | null
) {
  if (!startsAtUtc || !endsAtUtc) {
    return "Schedule pending";
  }

  const timeZone =
    clientTimezone && isValidTimeZone(clientTimezone)
      ? clientTimezone
      : consultationHost.timezone;

  return formatSlotWindow(startsAtUtc, endsAtUtc, timeZone);
}

export function formatConsultationCreatedLine(createdAtUtc: string) {
  return formatDateTimeInTimeZone(createdAtUtc, consultationHost.timezone);
}
