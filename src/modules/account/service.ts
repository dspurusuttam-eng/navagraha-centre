import "server-only";

import { getPrisma } from "@/lib/prisma";

type SaveProfileInput = {
  userId: string;
  name: string;
  image: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string | null;
  bio: string | null;
  notes: string | null;
};

export async function ensureUserProfile(userId: string) {
  return getPrisma().profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getDashboardOverview(userId: string) {
  const prisma = getPrisma();

  const [profile, birthDataCount, chartCount, consultationCount, orderCount] =
    await Promise.all([
      ensureUserProfile(userId),
      prisma.birthData.count({ where: { userId } }),
      prisma.chart.count({ where: { userId } }),
      prisma.consultation.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
    ]);

  const readinessChecklist = [
    Boolean(profile.timezone),
    Boolean(profile.city),
    Boolean(profile.country),
    birthDataCount > 0,
  ];

  return {
    profile,
    counts: {
      birthData: birthDataCount,
      charts: chartCount,
      consultations: consultationCount,
      orders: orderCount,
    },
    readinessScore: readinessChecklist.filter(Boolean).length,
  };
}

export async function getProfileSettings(userId: string) {
  return ensureUserProfile(userId);
}

export async function saveProfileSettings({
  userId,
  name,
  image,
  phone,
  city,
  region,
  country,
  timezone,
  bio,
  notes,
}: SaveProfileInput) {
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name,
        image,
      },
    }),
    prisma.profile.upsert({
      where: { userId },
      update: {
        phone,
        city,
        region,
        country,
        timezone,
        bio,
        notes,
      },
      create: {
        userId,
        phone,
        city,
        region,
        country,
        timezone,
        bio,
        notes,
      },
    }),
  ]);
}
