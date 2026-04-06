import type { ProductCategory, ProductType } from "@prisma/client";
import type {
  CuratedShopProductRecord,
  ShopCategorySummary,
} from "@/modules/shop/types";

export const shopCategoryOrder = [
  "RUDRAKSHA",
  "MALAS",
  "GEMSTONES",
  "YANTRAS",
  "IDOLS",
  "MANTRA_REMEDIES",
] as const satisfies readonly ProductCategory[];

const shopCategoryDescriptions: Record<ProductCategory, string> = {
  RUDRAKSHA:
    "Traditional Rudraksha supports presented with careful sourcing language and no pressure-driven claims.",
  MALAS:
    "Practice tools for repetition, breath, and devotional rhythm, merchandised with calm editorial restraint.",
  GEMSTONES:
    "Gemstone records framed as consultation-led supports rather than casual prescriptions or guaranteed outcomes.",
  YANTRAS:
    "Symbolic contemplative objects for those who prefer ordered, devotional environments over cluttered mysticism.",
  IDOLS:
    "Quiet devotional objects chosen for presence, craftsmanship, and respectful placement within a spiritual space.",
  MANTRA_REMEDIES:
    "Practice companions that support mantra discipline with guidance, pacing, and careful expectations.",
};

export const shopCategoryLabels: Record<ProductCategory, string> = {
  RUDRAKSHA: "Rudraksha",
  MALAS: "Malas",
  GEMSTONES: "Gemstones",
  YANTRAS: "Yantras",
  IDOLS: "Idols",
  MANTRA_REMEDIES: "Mantra Remedies",
};

export const productTypeLabels: Record<ProductType, string> = {
  PHYSICAL: "Physical Product",
  DIGITAL: "Digital Guide",
  SERVICE: "Service",
};

export const shopCategorySummaries: readonly ShopCategorySummary[] =
  shopCategoryOrder.map((category) => ({
    key: category,
    label: shopCategoryLabels[category],
    description: shopCategoryDescriptions[category],
    anchorId: `shop-${category.toLowerCase()}`,
  }));

export const curatedShopCatalog: readonly CuratedShopProductRecord[] = [
  {
    slug: "panchamukhi-rudraksha-mala",
    sku: "NC-RUD-001",
    name: "Panchamukhi Rudraksha Mala",
    summary:
      "A premium five-mukhi Rudraksha mala presented as a grounded devotional support for steady daily use.",
    description:
      "This record is curated for clients who prefer traditional Rudraksha craftsmanship with modern, transparent framing. It is presented as a spiritual support product, not as a promise of outcomes, and is best approached with care, pacing, and consultation-led discernment where needed.",
    category: "RUDRAKSHA",
    type: "PHYSICAL",
    priceInMinor: 7800,
    currencyCode: "INR",
    badge: "Consultation-Led",
    materialLabel: "Natural five-mukhi Rudraksha beads",
    ritualFocus: "Grounded daily wear and mantra rhythm",
    inventoryCount: 14,
    isFeatured: true,
    sortOrder: 10,
    seoTitle: "Panchamukhi Rudraksha Mala",
    seoDescription:
      "Explore a premium Panchamukhi Rudraksha mala presented with careful sourcing language and calm spiritual merchandising.",
    imageTone: "gold",
    highlights: [
      "Curated as a calm devotional support rather than an urgency-driven remedy purchase.",
      "Presented with sourcing and suitability language that keeps personal discernment intact.",
      "Designed to sit naturally beside consultation and reflective practice.",
    ],
    notes: [
      "Traditional supports should be chosen thoughtfully and worn only when they feel appropriate to the individual.",
      "The catalog language intentionally avoids certainty, superstition pressure, or fear-based claims.",
      "Consultation can help clarify whether a Rudraksha record belongs in a wider spiritual routine.",
    ],
    relatedRemedySlugs: ["five-mukhi-rudraksha"],
    relationshipNote: "Related support record",
  },
  {
    slug: "sandalwood-japa-mala",
    sku: "NC-MAL-001",
    name: "Sandalwood Japa Mala",
    summary:
      "A sandalwood mala for disciplined repetition, breath-led practice, and quieter devotional pacing.",
    description:
      "The sandalwood japa mala is merchandised as a tactile support for mantra discipline, reflection, and paced repetition. Its presentation stays intentionally calm and avoids any claim that the object itself guarantees spiritual or material change.",
    category: "MALAS",
    type: "PHYSICAL",
    priceInMinor: 4200,
    currencyCode: "INR",
    badge: "Practice Essential",
    materialLabel: "Hand-finished sandalwood beads",
    ritualFocus: "Japa, recitation, and contemplative breath work",
    inventoryCount: 20,
    isFeatured: true,
    sortOrder: 20,
    seoTitle: "Sandalwood Japa Mala",
    seoDescription:
      "Discover a premium sandalwood japa mala for mantra rhythm, devotional repetition, and calm spiritual practice.",
    imageTone: "midnight",
    highlights: [
      "Made to support repetition, not superstition.",
      "Fits naturally into a sunrise or evening discipline without visual clutter.",
      "Pairs well with restrained mantra guidance and consultation-led routines.",
    ],
    notes: [
      "A mala is best treated as a support for consistency rather than a shortcut to certainty.",
      "Choose only what you can use respectfully and sustainably over time.",
      "If you already follow a spiritual lineage, remain aligned with that guidance.",
    ],
    relatedRemedySlugs: ["sandalwood-japa-mala", "sunrise-discipline-window"],
    relationshipNote: "Supports a steady practice rhythm",
  },
  {
    slug: "yellow-sapphire-review-stone",
    sku: "NC-GEM-001",
    name: "Yellow Sapphire Review Stone",
    summary:
      "A consultation-led gemstone record for clients discussing yellow sapphire suitability with care and restraint.",
    description:
      "This product is intentionally framed as a review-led gemstone record rather than a casual self-prescription. It exists for clients who want a premium, carefully merchandised way to hold a gemstone conversation without turning the purchase into a hard claim or guaranteed recommendation.",
    category: "GEMSTONES",
    type: "PHYSICAL",
    priceInMinor: 18500,
    currencyCode: "INR",
    badge: "Requires Discernment",
    materialLabel: "Consultation-reviewed yellow sapphire record",
    ritualFocus: "Gemstone review and guided suitability discussion",
    inventoryCount: 4,
    isFeatured: false,
    sortOrder: 30,
    seoTitle: "Yellow Sapphire Review Stone",
    seoDescription:
      "A carefully framed yellow sapphire product record for consultation-led review, never casual prescription.",
    imageTone: "ember",
    highlights: [
      "Presented as a discussion record, not as a default prescription.",
      "Merchandised for careful review, documentation, and traditional context.",
      "Best approached through consultation before purchase decisions are finalized.",
    ],
    notes: [
      "Gemstones should not be treated as universal answers or impulse buys.",
      "Suitability, budget, and personal context all matter before any gemstone decision.",
      "A consultation is strongly preferred before moving forward with gemstone-focused supports.",
    ],
    relatedRemedySlugs: ["yellow-sapphire-review"],
    relationshipNote: "Consultation-first product link",
  },
  {
    slug: "copper-surya-yantra-plaque",
    sku: "NC-YAN-001",
    name: "Copper Surya Yantra Plaque",
    summary:
      "A polished copper yantra plaque for those who prefer ordered, symbolic devotional environments.",
    description:
      "This yantra record is curated for contemplative use and respectful placement. The merchandising tone stays intentionally editorial and calm, presenting the object as a symbolic aid within a wider spiritual rhythm rather than as a standalone solution.",
    category: "YANTRAS",
    type: "PHYSICAL",
    priceInMinor: 6500,
    currencyCode: "INR",
    badge: "Contemplative Object",
    materialLabel: "Copper plaque with devotional finishing",
    ritualFocus: "Morning altar structure and contemplative focus",
    inventoryCount: 10,
    isFeatured: true,
    sortOrder: 40,
    seoTitle: "Copper Surya Yantra Plaque",
    seoDescription:
      "A premium copper Surya Yantra plaque for calm altar structure, symbolic contemplation, and devotional focus.",
    imageTone: "gold",
    highlights: [
      "Designed for refined placement within a disciplined spiritual setting.",
      "Supports attention and ritual order without theatrical presentation.",
      "Presented with careful language that honors symbolism without exaggeration.",
    ],
    notes: [
      "Symbolic objects are most meaningful when used inside a stable, intentional practice rhythm.",
      "The platform does not frame yantras as guaranteed solutions or urgent purchases.",
      "A yantra can complement, but not replace, judgment, discipline, and consultation.",
    ],
    relatedRemedySlugs: ["surya-yantra-contemplation"],
    relationshipNote: "Related contemplative support",
  },
  {
    slug: "brass-ganesha-idol",
    sku: "NC-IDL-001",
    name: "Brass Ganesha Idol",
    summary:
      "A refined brass Ganesha idol for serene altar placement and devotional steadiness within the home.",
    description:
      "This idol record is curated for clients who want devotional objects framed with dignity, material clarity, and premium restraint. The product is positioned as a respectful altar presence rather than as a transactional spiritual guarantee.",
    category: "IDOLS",
    type: "PHYSICAL",
    priceInMinor: 5900,
    currencyCode: "INR",
    badge: "Altar Presence",
    materialLabel: "Brass devotional sculpture",
    ritualFocus: "Household altar placement and quiet devotional presence",
    inventoryCount: 8,
    isFeatured: false,
    sortOrder: 50,
    seoTitle: "Brass Ganesha Idol",
    seoDescription:
      "Browse a premium brass Ganesha idol framed with devotional respect, calm merchandising, and refined presentation.",
    imageTone: "midnight",
    highlights: [
      "Chosen for devotional dignity and polished presence rather than spectacle.",
      "Fits spiritual spaces that value warmth, order, and subtle material detail.",
      "Complements careful practice without turning symbolic objects into promises.",
    ],
    notes: [
      "Devotional objects should be chosen with respect for personal tradition and space.",
      "The platform keeps language measured and avoids transactional spiritual claims.",
      "Clients can pair altar objects with consultation when they want more context around practice.",
    ],
    relatedRemedySlugs: ["navagraha-puja-observance"],
    relationshipNote: "Pairs with devotional observance",
  },
  {
    slug: "gayatri-practice-companion",
    sku: "NC-MAN-001",
    name: "Gayatri Practice Companion",
    summary:
      "A premium mantra companion with a guided structure for steady recitation, reflective pacing, and disciplined daily use.",
    description:
      "The Gayatri Practice Companion is positioned as a structured support for mantra discipline, combining pacing cues, reflective notes, and a calm devotional framework. It does not calculate charts, make claims, or replace personal spiritual judgment.",
    category: "MANTRA_REMEDIES",
    type: "DIGITAL",
    priceInMinor: 2600,
    currencyCode: "INR",
    badge: "Guided Practice",
    materialLabel: "Digital companion guide",
    ritualFocus: "Daily mantra structure and reflective cadence",
    inventoryCount: null,
    isFeatured: true,
    sortOrder: 60,
    seoTitle: "Gayatri Practice Companion",
    seoDescription:
      "A premium Gayatri mantra practice companion for calm recitation structure, discipline, and reflective spiritual rhythm.",
    imageTone: "ember",
    highlights: [
      "Built for repetition, steadiness, and simple devotional structure.",
      "Keeps practice language careful, transparent, and free from outcome promises.",
      "Supports a premium, modern experience of mantra discipline.",
    ],
    notes: [
      "Practice companions are best used gently and consistently, not obsessively.",
      "Health, schedule, and personal context should always shape the final routine.",
      "The guide is a support layer only and does not replace consultation where nuance is needed.",
    ],
    relatedRemedySlugs: ["adi-gayatri-mantra", "sunrise-discipline-window"],
    relationshipNote: "Supports an approved practice pathway",
  },
] as const;
