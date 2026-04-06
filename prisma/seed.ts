import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  consultationHost,
  consultationPackages,
} from "../src/modules/consultations/catalog";
import { defaultChartInterpretationPromptTemplate } from "../src/modules/ai/prompts";
import { curatedRemedyCatalog } from "../src/modules/remedies/catalog";
import { curatedShopCatalog } from "../src/modules/shop/catalog";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not configured. Add it before running the Prisma seed."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

const indiaOffsetMinutes = 330;

function buildKolkataSlot(
  dayOffset: number,
  hour: number,
  minute: number,
  durationMinutes: number,
  note?: string
) {
  const now = new Date();
  const hostNow = new Date(now.getTime() + indiaOffsetMinutes * 60_000);
  const year = hostNow.getUTCFullYear();
  const month = hostNow.getUTCMonth();
  const day = hostNow.getUTCDate() + dayOffset;
  const startsAt = new Date(
    Date.UTC(year, month, day, hour, minute) - indiaOffsetMinutes * 60_000
  );
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

  return {
    startsAt,
    endsAt,
    timezone: consultationHost.timezone,
    note: note ?? null,
  };
}

const consultationSlotSeeds = [
  buildKolkataSlot(2, 11, 0, 75, "Morning consultation window"),
  buildKolkataSlot(3, 15, 30, 75, "Afternoon reading window"),
  buildKolkataSlot(5, 12, 0, 90, "Extended compatibility session window"),
  buildKolkataSlot(6, 17, 0, 60, "Business astrology brief window"),
  buildKolkataSlot(8, 11, 30, 50, "Remedy guidance session window"),
  buildKolkataSlot(10, 16, 0, 45, "Follow-up clarity window"),
];

async function main() {
  const [founderRole, editorRole, supportRole] = await Promise.all([
    prisma.adminRole.upsert({
      where: { key: "founder" },
      update: {
        name: "Founder",
        description:
          "Platform-wide stewardship and elevated operations access.",
      },
      create: {
        key: "founder",
        name: "Founder",
        description:
          "Platform-wide stewardship and elevated operations access.",
      },
    }),
    prisma.adminRole.upsert({
      where: { key: "editor" },
      update: {
        name: "Editor",
        description: "Editorial publishing and content curation permissions.",
      },
      create: {
        key: "editor",
        name: "Editor",
        description: "Editorial publishing and content curation permissions.",
      },
    }),
    prisma.adminRole.upsert({
      where: { key: "support" },
      update: {
        name: "Support",
        description:
          "Consultation coordination and client support permissions.",
      },
      create: {
        key: "support",
        name: "Support",
        description:
          "Consultation coordination and client support permissions.",
      },
    }),
  ]);

  const seededProducts = await Promise.all(
    curatedShopCatalog.map((product) =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          sku: product.sku,
          name: product.name,
          summary: product.summary,
          description: product.description,
          category: product.category,
          type: product.type,
          status: "ACTIVE",
          priceInMinor: product.priceInMinor,
          currencyCode: product.currencyCode,
          badge: product.badge,
          materialLabel: product.materialLabel,
          ritualFocus: product.ritualFocus,
          inventoryCount: product.inventoryCount,
          isFeatured: product.isFeatured,
          sortOrder: product.sortOrder,
          metadata: {
            highlights: product.highlights,
            notes: product.notes,
            imageTone: product.imageTone,
            relationshipNote: product.relationshipNote,
          },
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
        },
        create: {
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          summary: product.summary,
          description: product.description,
          category: product.category,
          type: product.type,
          status: "ACTIVE",
          priceInMinor: product.priceInMinor,
          currencyCode: product.currencyCode,
          badge: product.badge,
          materialLabel: product.materialLabel,
          ritualFocus: product.ritualFocus,
          inventoryCount: product.inventoryCount,
          isFeatured: product.isFeatured,
          sortOrder: product.sortOrder,
          metadata: {
            highlights: product.highlights,
            notes: product.notes,
            imageTone: product.imageTone,
            relationshipNote: product.relationshipNote,
          },
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
        },
        select: {
          id: true,
          slug: true,
        },
      })
    )
  );

  const productBySlug = new Map(
    seededProducts.map((product) => [product.slug, product])
  );

  await Promise.all(
    consultationPackages.map((item) =>
      prisma.consultationPackage.upsert({
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
      })
    )
  );

  await Promise.all(
    consultationSlotSeeds.map(async (slot) => {
      const existing = await prisma.consultationSlot.findFirst({
        where: {
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          timezone: slot.timezone,
        },
        select: { id: true },
      });

      if (existing) {
        return prisma.consultationSlot.update({
          where: { id: existing.id },
          data: {
            status: "OPEN",
            note: slot.note,
          },
        });
      }

      return prisma.consultationSlot.create({
        data: {
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          timezone: slot.timezone,
          status: "OPEN",
          note: slot.note,
        },
      });
    })
  );

  const seededRemedies = await Promise.all(
    curatedRemedyCatalog.map((remedy) =>
      prisma.remedy.upsert({
        where: { slug: remedy.slug },
        update: {
          title: remedy.title,
          summary: remedy.summary,
          description: remedy.description,
          type: remedy.type,
          cautionNote: remedy.cautionNote,
          isFeatured: remedy.isFeatured,
          publishedAt: new Date(remedy.publishedAt),
        },
        create: {
          slug: remedy.slug,
          title: remedy.title,
          summary: remedy.summary,
          description: remedy.description,
          type: remedy.type,
          cautionNote: remedy.cautionNote,
          isFeatured: remedy.isFeatured,
          publishedAt: new Date(remedy.publishedAt),
        },
        select: {
          id: true,
          slug: true,
        },
      })
    )
  );

  const remedyBySlug = new Map(
    seededRemedies.map((remedy) => [remedy.slug, remedy])
  );

  await Promise.all(
    curatedShopCatalog.flatMap((product) =>
      product.relatedRemedySlugs.map((remedySlug, index) => {
        const linkedProduct = productBySlug.get(product.slug);
        const linkedRemedy = remedyBySlug.get(remedySlug);

        if (!linkedProduct || !linkedRemedy) {
          return Promise.resolve(null);
        }

        return prisma.remedyProductLink.upsert({
          where: {
            remedyId_productId: {
              remedyId: linkedRemedy.id,
              productId: linkedProduct.id,
            },
          },
          update: {
            relationshipNote: product.relationshipNote,
            sortOrder: index,
          },
          create: {
            remedyId: linkedRemedy.id,
            productId: linkedProduct.id,
            relationshipNote: product.relationshipNote,
            sortOrder: index,
          },
        });
      })
    )
  );

  await prisma.article.upsert({
    where: { slug: "understanding-premium-consultation-journeys" },
    update: {
      title: "Understanding Premium Consultation Journeys",
      excerpt:
        "A seed article placeholder for the editorial layer and public knowledge surfaces.",
      body: "This placeholder article exists to validate the article schema, publishing state, and future CMS adapter boundaries.",
      status: "PUBLISHED",
      seoTitle: "Premium Consultation Journeys | NAVAGRAHA CENTRE",
      seoDescription:
        "Seed-ready article content for future editorial and SEO workflows.",
      publishedAt: new Date("2026-02-01T00:00:00.000Z"),
    },
    create: {
      slug: "understanding-premium-consultation-journeys",
      title: "Understanding Premium Consultation Journeys",
      excerpt:
        "A seed article placeholder for the editorial layer and public knowledge surfaces.",
      body: "This placeholder article exists to validate the article schema, publishing state, and future CMS adapter boundaries.",
      status: "PUBLISHED",
      seoTitle: "Premium Consultation Journeys | NAVAGRAHA CENTRE",
      seoDescription:
        "Seed-ready article content for future editorial and SEO workflows.",
      publishedAt: new Date("2026-02-01T00:00:00.000Z"),
    },
  });

  const promptTemplate = await prisma.aiPromptTemplate.upsert({
    where: { key: defaultChartInterpretationPromptTemplate.key },
    update: {
      title: defaultChartInterpretationPromptTemplate.title,
      description: defaultChartInterpretationPromptTemplate.description,
      area: "REPORT_INTERPRETATION",
    },
    create: {
      key: defaultChartInterpretationPromptTemplate.key,
      title: defaultChartInterpretationPromptTemplate.title,
      description: defaultChartInterpretationPromptTemplate.description,
      area: "REPORT_INTERPRETATION",
    },
  });

  const promptVersion = await prisma.aiPromptVersion.upsert({
    where: {
      templateId_version: {
        templateId: promptTemplate.id,
        version: 1,
      },
    },
    update: {
      label: "v1",
      model: "curated-template",
      systemPrompt: defaultChartInterpretationPromptTemplate.systemPrompt,
      userPrompt: defaultChartInterpretationPromptTemplate.userPrompt,
      status: "ACTIVE",
      releaseNotes: defaultChartInterpretationPromptTemplate.releaseNotes,
      activatedAt: new Date(),
    },
    create: {
      templateId: promptTemplate.id,
      version: 1,
      label: "v1",
      model: "curated-template",
      systemPrompt: defaultChartInterpretationPromptTemplate.systemPrompt,
      userPrompt: defaultChartInterpretationPromptTemplate.userPrompt,
      status: "ACTIVE",
      releaseNotes: defaultChartInterpretationPromptTemplate.releaseNotes,
      activatedAt: new Date(),
    },
  });

  await prisma.aiPromptTemplate.update({
    where: { id: promptTemplate.id },
    data: {
      activeVersionId: promptVersion.id,
    },
  });

  console.log(
    `Seeded ${[founderRole, editorRole, supportRole].length} admin roles, ${consultationPackages.length} consultation packages, ${consultationSlotSeeds.length} consultation slots, ${curatedShopCatalog.length} shop products, ${curatedRemedyCatalog.length} approved remedies, starter content, and the default AI prompt template.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
