import "server-only";

import { loadChartAnalysisContext } from "@/lib/ai/chart-analysis";
import type { RemedyCategory, RemedySuggestion } from "@/lib/ai/types";
import type { PlanetaryBody } from "@/modules/astrology/types";

type RemedyBlueprint = {
  category: RemedyCategory;
  title: string;
  reason: string;
  note: string;
  purchaseNote: string;
};

const defaultRemedyBlueprints: RemedyBlueprint[] = [
  {
    category: "spiritual discipline",
    title: "Steady morning spiritual discipline",
    reason:
      "A simple daily spiritual rhythm supports consistency before more specialized remedies are considered.",
    note:
      "Keep the practice brief, regular, and reflective rather than dramatic or fear-driven.",
    purchaseNote: "No purchase is required for this support.",
  },
  {
    category: "lifestyle support",
    title: "Grounded weekly reflection ritual",
    reason:
      "A light reflection practice helps you notice repeated patterns without over-interpreting them.",
    note:
      "Use journaling, quiet prayer, or intentional review time to support clarity around the chart themes already stored.",
    purchaseNote: "No purchase is required for this support.",
  },
];

const remedyBlueprintsByBody: Partial<Record<PlanetaryBody, RemedyBlueprint[]>> = {
  MOON: [
    {
      category: "mantra",
      title: "Moon-centering mantra practice",
      reason:
        "The chart shows a lunar emphasis, so a soothing mantra practice is a natural first support.",
      note:
        "Keep the practice calm and regular. It is intended as reflective spiritual support, not a guaranteed outcome.",
      purchaseNote: "No purchase is required for this support.",
    },
    {
      category: "mala",
      title: "Japa mala for steady recitation",
      reason:
        "A mala can support consistency when mantra practice is already meaningful in your routine.",
      note:
        "The mala is supportive, not essential. The spiritual discipline matters more than the object itself.",
      purchaseNote:
        "A supportive product can be considered later, but disciplined practice remains primary.",
    },
  ],
  JUPITER: [
    {
      category: "spiritual discipline",
      title: "Teacher-guided study and prayer discipline",
      reason:
        "Jupiter themes respond well to study, prayer, and meaning-making done with sincerity.",
      note:
        "Keep this practice grounded in learning and reverence rather than quick promises.",
      purchaseNote: "No purchase is required for this support.",
    },
    {
      category: "donation",
      title: "Measured charitable donation practice",
      reason:
        "A thoughtful giving rhythm can align well with Jupiter-led themes of wisdom and generosity.",
      note:
        "Any giving should remain voluntary, proportionate, and personally sustainable.",
      purchaseNote: "No purchase is required for this support.",
    },
  ],
  VENUS: [
    {
      category: "lifestyle support",
      title: "Refinement and harmony practice",
      reason:
        "Venus emphasis often responds well to beauty, order, and gentler relational habits.",
      note:
        "Favor balanced environments and thoughtful aesthetics over indulgence or excess.",
      purchaseNote: "No purchase is required for this support.",
    },
    {
      category: "mala",
      title: "Refined devotional mala support",
      reason:
        "A mala can support a more graceful devotional rhythm when Venus-led practices feel natural.",
      note:
        "Use this as supportive ritual structure only, not as a promise of results.",
      purchaseNote:
        "A product is optional and secondary to the devotional practice itself.",
    },
  ],
  SATURN: [
    {
      category: "donation",
      title: "Saturn-balancing donation practice",
      reason:
        "Saturn-led periods often benefit from humility, duty, and measured service-oriented giving.",
      note:
        "Keep the gesture quiet, sustainable, and free from pressure or superstition.",
      purchaseNote: "No purchase is required for this support.",
    },
    {
      category: "fasting",
      title: "Simple timing-aware fasting discipline",
      reason:
        "A light, appropriate fasting discipline can support restraint and steadiness in Saturn-heavy cycles.",
      note:
        "This should be approached carefully and only where appropriate for your health and routine.",
      purchaseNote: "No purchase is required for this support.",
    },
  ],
  RAHU: [
    {
      category: "spiritual discipline",
      title: "Discernment-focused grounding practice",
      reason:
        "Rahu-heavy patterns benefit from slower reflection before pursuing every new impulse.",
      note:
        "Use this support to create space and clarity, not to intensify anxiety or urgency.",
      purchaseNote: "No purchase is required for this support.",
    },
  ],
  KETU: [
    {
      category: "mantra",
      title: "Quiet inward mantra support",
      reason:
        "Ketu-led patterns can benefit from a quieter mantra rhythm that supports detachment with clarity.",
      note:
        "Keep the practice simple and steady rather than severe or isolating.",
      purchaseNote: "No purchase is required for this support.",
    },
  ],
};

function createRemedyId(userId: string, category: RemedyCategory, index: number) {
  return `${userId}-${category.replace(/\s+/g, "-")}-${index + 1}`;
}

export async function suggestRemedies(
  userId: string
): Promise<RemedySuggestion[]> {
  const context = await loadChartAnalysisContext(userId);
  const chart = context.overview.chart;

  if (!chart) {
    return defaultRemedyBlueprints.map((blueprint, index) => ({
      id: createRemedyId(userId, blueprint.category, index),
      ...blueprint,
    }));
  }

  const selectedBlueprints = chart.summary.dominantBodies
    .flatMap((body) => remedyBlueprintsByBody[body] ?? [])
    .slice(0, 4);
  const uniqueBlueprints = selectedBlueprints.length
    ? selectedBlueprints
    : defaultRemedyBlueprints;

  return uniqueBlueprints.map((blueprint, index) => ({
    id: createRemedyId(userId, blueprint.category, index),
    ...blueprint,
  }));
}
