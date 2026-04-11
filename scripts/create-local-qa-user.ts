import { config as loadDotenv } from "dotenv";
import {
  ConsultationStatus,
  InquiryLifecycleStage,
  Prisma,
} from "@prisma/client";
import { getPrisma } from "../src/lib/prisma";
import { getAuth } from "../src/lib/auth";
import { createAstrologyService } from "../src/modules/astrology/service";
import { saveOnboardingAndGenerateChart } from "../src/modules/onboarding/service";
import {
  consultationHost,
  consultationPackages,
} from "../src/modules/consultations/catalog";

const envFiles = [
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.development",
];

for (const envFile of envFiles) {
  loadDotenv({ path: envFile, override: false });
}

const localHosts = new Set(["localhost", "127.0.0.1"]);
const defaultQaEmail = "qa-member@navagraha.local";
const defaultQaPassword = "NavagrahaQA123!";

type QaSeedConfig = {
  email: string;
  password: string;
  name: string;
};

function isLocalUrl(value: string | undefined) {
  if (!value?.trim()) {
    return true;
  }

  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return localHosts.has(hostname) || hostname.endsWith(".local");
  } catch {
    return false;
  }
}

function assertLocalOnlyExecution() {
  if (process.env.VERCEL_ENV === "production") {
    throw new Error(
      "This QA seed script is local-only and will not run against a production Vercel environment."
    );
  }

  const authUrl = process.env.BETTER_AUTH_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!isLocalUrl(authUrl) || !isLocalUrl(siteUrl)) {
    throw new Error(
      "Refusing to seed a QA user because BETTER_AUTH_URL or NEXT_PUBLIC_SITE_URL does not look local. Point the app at localhost before running this workflow."
    );
  }
}

function readFlag(flag: string) {
  return process.argv.includes(flag);
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function getQaSeedConfig(): QaSeedConfig {
  return {
    email:
      readArg("--email") ?? process.env.QA_TEST_USER_EMAIL ?? defaultQaEmail,
    password:
      readArg("--password") ??
      process.env.QA_TEST_USER_PASSWORD ??
      defaultQaPassword,
    name:
      readArg("--name") ??
      process.env.QA_TEST_USER_NAME ??
      "NAVAGRAHA QA Member",
  };
}

async function deleteExistingQaUser(userId: string) {
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    await clearExistingQaContext(tx, userId);

    await tx.adminRoleAssignment.deleteMany({
      where: { userId },
    });

    await tx.profile.deleteMany({
      where: { userId },
    });

    await tx.session.deleteMany({
      where: { userId },
    });

    await tx.account.deleteMany({
      where: { userId },
    });

    await tx.user.delete({
      where: { id: userId },
    });
  });
}

async function clearExistingQaContext(
  tx: Prisma.TransactionClient,
  userId: string
) {
  await tx.inquiryLead.deleteMany({
    where: { userId },
  });

  await tx.order.deleteMany({
    where: { userId },
  });

  await tx.consultation.deleteMany({
    where: { userId },
  });

  await tx.chart.deleteMany({
    where: { userId },
  });

  await tx.birthData.deleteMany({
    where: { userId },
  });

  await tx.aiConversationSession.deleteMany({
    where: { userId },
  });

  await tx.aiTaskRun.deleteMany({
    where: { userId },
  });
}

async function ensureConsultationPackages() {
  const prisma = getPrisma();

  for (const item of consultationPackages) {
    await prisma.consultationPackage.upsert({
      where: { slug: item.slug },
      update: {
        type: item.type,
        title: item.title,
        summary: item.summary,
        description: item.description,
        durationMinutes: item.durationMinutes,
        priceFromMinor: item.priceFromMinor,
        currencyCode: "INR",
        isFeatured: item.isFeatured,
        isActive: true,
        sortOrder: item.sortOrder,
      },
      create: {
        slug: item.slug,
        type: item.type,
        title: item.title,
        summary: item.summary,
        description: item.description,
        durationMinutes: item.durationMinutes,
        priceFromMinor: item.priceFromMinor,
        currencyCode: "INR",
        isFeatured: item.isFeatured,
        isActive: true,
        sortOrder: item.sortOrder,
      },
    });
  }
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function seedQaConsultationContext(
  userId: string,
  birthDataId: string,
  qaEmail: string
) {
  const prisma = getPrisma();

  const [privateReadingPackage, followUpPackage] = await Promise.all([
    prisma.consultationPackage.findUniqueOrThrow({
      where: { slug: "private-reading" },
      select: {
        id: true,
        type: true,
        title: true,
        durationMinutes: true,
      },
    }),
    prisma.consultationPackage.findUniqueOrThrow({
      where: { slug: "follow-up-clarity-session" },
      select: {
        id: true,
        type: true,
        title: true,
        durationMinutes: true,
      },
    }),
  ]);

  const completedStart = addDays(new Date(), -30);
  const completedEnd = new Date(
    completedStart.getTime() + privateReadingPackage.durationMinutes * 60_000
  );
  const upcomingStart = addDays(new Date(), 5);
  const upcomingEnd = new Date(
    upcomingStart.getTime() + followUpPackage.durationMinutes * 60_000
  );

  const [completedSlot, upcomingSlot] = await Promise.all([
    prisma.consultationSlot.create({
      data: {
        startsAt: completedStart,
        endsAt: completedEnd,
        timezone: consultationHost.timezone,
        status: "BOOKED",
        note: "Local QA seeded completed consultation slot",
      },
      select: { id: true },
    }),
    prisma.consultationSlot.create({
      data: {
        startsAt: upcomingStart,
        endsAt: upcomingEnd,
        timezone: consultationHost.timezone,
        status: "BOOKED",
        note: "Local QA seeded upcoming consultation slot",
      },
      select: { id: true },
    }),
  ]);

  const [completedConsultation, upcomingConsultation] = await Promise.all([
    prisma.consultation.create({
      data: {
        userId,
        birthDataId,
        packageId: privateReadingPackage.id,
        slotId: completedSlot.id,
        type: privateReadingPackage.type,
        status: ConsultationStatus.COMPLETED,
        confirmationCode: `NC-QA-COMP-${Date.now().toString().slice(-6)}`,
        astrologerName: consultationHost.astrologerName,
        serviceLabel: privateReadingPackage.title,
        scheduledFor: completedStart,
        scheduledEnd: completedEnd,
        durationMinutes: privateReadingPackage.durationMinutes,
        clientTimezone: consultationHost.timezone,
        preferredLanguage: "en",
        contactPhone: "+91 90000 00000",
        topicFocus: "Current cycle clarity and remedy follow-up",
        intakeSummary:
          "Returning member QA profile seeded for dashboard, report, and retention verification.",
      },
      select: {
        id: true,
        confirmationCode: true,
      },
    }),
    prisma.consultation.create({
      data: {
        userId,
        birthDataId,
        packageId: followUpPackage.id,
        slotId: upcomingSlot.id,
        type: followUpPackage.type,
        status: ConsultationStatus.CONFIRMED,
        confirmationCode: `NC-QA-UP-${Date.now().toString().slice(-6)}`,
        astrologerName: consultationHost.astrologerName,
        serviceLabel: followUpPackage.title,
        scheduledFor: upcomingStart,
        scheduledEnd: upcomingEnd,
        durationMinutes: followUpPackage.durationMinutes,
        clientTimezone: consultationHost.timezone,
        preferredLanguage: "en",
        contactPhone: "+91 90000 00000",
        topicFocus: "Follow-up timing questions",
        intakeSummary:
          "Upcoming QA follow-up consultation to keep the member dashboard populated with a live booking state.",
      },
      select: {
        id: true,
        confirmationCode: true,
      },
    }),
  ]);

  await prisma.inquiryLead.create({
    data: {
      userId,
      fullName: "NAVAGRAHA QA Member",
      email: qaEmail,
      phone: "+91 90000 00000",
      timezone: consultationHost.timezone,
      inquiryType: "COMPATIBILITY_FOCUSED",
      urgencyLevel: "STANDARD",
      desiredServiceSlug: "compatibility-session",
      message:
        "I would like compatibility guidance for relationship timing and long-term partnership clarity.",
      sourcePath: "/contact",
      lifecycleStage: InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
      lifecycleEvents: {
        create: {
          toStage: InquiryLifecycleStage.FOLLOW_UP_ELIGIBLE,
          note: "Local QA seeded compatibility inquiry context.",
        },
      },
    },
  });

  return {
    completedConsultation,
    upcomingConsultation,
  };
}

async function main() {
  assertLocalOnlyExecution();

  const prisma = getPrisma();
  const auth = getAuth();
  const seedConfig = getQaSeedConfig();
  const shouldReset = !readFlag("--keep-existing");

  const existingUser = await prisma.user.findUnique({
    where: { email: seedConfig.email },
    select: { id: true },
  });

  if (existingUser && shouldReset) {
    await deleteExistingQaUser(existingUser.id);
  }

  if (existingUser && !shouldReset) {
    await prisma.$transaction(async (tx) => {
      await clearExistingQaContext(tx, existingUser.id);
    });
  }

  const userAfterReset = shouldReset ? null : existingUser;

  if (!userAfterReset) {
    await auth.api.signUpEmail({
      body: {
        email: seedConfig.email,
        password: seedConfig.password,
        name: seedConfig.name,
      },
    });
  }

  const qaUser = await prisma.user.findUniqueOrThrow({
    where: { email: seedConfig.email },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.user.update({
    where: { id: qaUser.id },
    data: {
      name: seedConfig.name,
      emailVerified: true,
    },
  });

  await ensureConsultationPackages();

  await saveOnboardingAndGenerateChart({
    userId: qaUser.id,
    name: seedConfig.name,
    preferredLanguage: "en",
    astrologyServiceOverride: createAstrologyService("mock-deterministic", {
      disableNatalCache: true,
    }),
    birthDetails: {
      dateLocal: "1992-08-14",
      timeLocal: "06:24",
      timezone: "Asia/Kolkata",
      place: {
        city: "Guwahati",
        region: "Assam",
        country: "India",
        latitude: 26.1445,
        longitude: 91.7362,
      },
    },
  });

  const primaryBirthData = await prisma.birthData.findFirstOrThrow({
    where: {
      userId: qaUser.id,
      isPrimary: true,
    },
    select: { id: true },
  });

  const consultationContext = await seedQaConsultationContext(
    qaUser.id,
    primaryBirthData.id,
    seedConfig.email
  );

  console.log("");
  console.log("Local QA user is ready.");
  console.log(`Email: ${seedConfig.email}`);
  console.log(`Password: ${seedConfig.password}`);
  console.log("");
  console.log("Suggested local QA routes:");
  console.log("  http://localhost:3000/sign-in");
  console.log("  http://localhost:3000/dashboard");
  console.log("  http://localhost:3000/dashboard/report");
  console.log(
    `  http://localhost:3000/dashboard/consultations/${consultationContext.completedConsultation.id}`
  );
  console.log("");
  console.log("Canonical production route for live checks:");
  console.log("  https://www.navagrahacentre.com/dashboard/onboarding");
  console.log("");
  console.log("Seeded member context:");
  console.log(
    `  Completed consultation: ${consultationContext.completedConsultation.confirmationCode}`
  );
  console.log(
    `  Upcoming consultation: ${consultationContext.upcomingConsultation.confirmationCode}`
  );
  console.log("  Chart + onboarding context: ready");
  console.log("  Compatibility inquiry context: ready");
  console.log("");
  console.log(
    "Use --keep-existing if you want to preserve the existing QA user instead of recreating it."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
