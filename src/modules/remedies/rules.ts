import type {
  AstrologicalAspect,
  NatalChartResponse,
  PlanetPosition,
  PlanetaryBody,
  SignalStrength,
} from "@/modules/astrology";
import type {
  RemedyRuleMatch,
  ReportChartSignal,
} from "@/modules/remedies/types";

const hardAspectTypes = new Set(["SQUARE", "OPPOSITION"]);
const signalWeights: Record<SignalStrength, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const ruleCatalog = [
  {
    signalKey: "solar-clarity",
    remedySlug: "adi-gayatri-mantra",
    rationale:
      "A brief sunrise mantra can support steadiness and intentionality when solar themes are prominent.",
    basePriority: 90,
  },
  {
    signalKey: "solar-clarity",
    remedySlug: "surya-yantra-contemplation",
    rationale:
      "A visual contemplative focus can help strong solar signatures settle into an ordered daily posture.",
    basePriority: 84,
  },
  {
    signalKey: "solar-clarity",
    remedySlug: "sunrise-discipline-window",
    rationale:
      "A consistent morning discipline often serves solar emphasis better than occasional intensity.",
    basePriority: 82,
  },
  {
    signalKey: "lunar-settling",
    remedySlug: "sandalwood-japa-mala",
    rationale:
      "A slower counting practice can support rhythm and containment when lunar sensitivity is emphasized.",
    basePriority: 88,
  },
  {
    signalKey: "lunar-settling",
    remedySlug: "monday-fasting-reflection",
    rationale:
      "A gentle Monday observance can offer structure around reflective lunar themes when it is personally appropriate.",
    basePriority: 80,
  },
  {
    signalKey: "lunar-settling",
    remedySlug: "evening-quiet-window",
    rationale:
      "A calmer evening rhythm can support lunar sensitivity without turning the response into a dramatic ritual demand.",
    basePriority: 78,
  },
  {
    signalKey: "saturn-discipline",
    remedySlug: "sesame-donation-saturday",
    rationale:
      "A modest act of service can ground heavier Saturn signatures in humility and practical care.",
    basePriority: 92,
  },
  {
    signalKey: "saturn-discipline",
    remedySlug: "sunrise-discipline-window",
    rationale:
      "Strong Saturn signatures are often served by a restrained daily discipline rather than dramatic effort.",
    basePriority: 86,
  },
  {
    signalKey: "jupiter-guidance",
    remedySlug: "yellow-sapphire-review",
    rationale:
      "Where Jupiter carries clear weight, gemstone discussion may be appropriate only as a careful consultation topic.",
    basePriority: 76,
  },
  {
    signalKey: "jupiter-guidance",
    remedySlug: "navagraha-puja-observance",
    rationale:
      "A broader devotional observance can sometimes be the more measured option when Jupiter themes call for perspective.",
    basePriority: 82,
  },
  {
    signalKey: "nodal-grounding",
    remedySlug: "five-mukhi-rudraksha",
    rationale:
      "Grounding supports are often preferred when nodal themes feel amplified or diffuse.",
    basePriority: 90,
  },
  {
    signalKey: "nodal-grounding",
    remedySlug: "navagraha-puja-observance",
    rationale:
      "A wider balancing ritual can be considered for stronger nodal signatures under trusted guidance.",
    basePriority: 78,
  },
  {
    signalKey: "nodal-grounding",
    remedySlug: "evening-quiet-window",
    rationale:
      "Reducing overstimulation is often the gentlest first response when nodal themes feel diffuse or overly activated.",
    basePriority: 80,
  },
  {
    signalKey: "devotional-foundation",
    remedySlug: "adi-gayatri-mantra",
    rationale:
      "When no single pressure dominates, a measured devotional foundation is a safe starting point.",
    basePriority: 70,
  },
  {
    signalKey: "devotional-foundation",
    remedySlug: "sunrise-discipline-window",
    rationale:
      "A short, repeatable discipline keeps the remedy posture calm, practical, and sustainable.",
    basePriority: 68,
  },
] as const;

function buildConfidenceScore(priority: number, signalLevel: SignalStrength) {
  const levelBonus = signalWeights[signalLevel] * 0.05;
  const normalizedPriority = Math.min(priority, 120) / 120;

  return Number(Math.min(0.96, 0.32 + normalizedPriority * 0.52 + levelBonus).toFixed(2));
}

function getPlanet(
  chart: NatalChartResponse,
  body: PlanetaryBody
): PlanetPosition | undefined {
  return chart.planets.find((planet) => planet.body === body);
}

function touchesBody(aspect: AstrologicalAspect, body: PlanetaryBody) {
  return aspect.source === body || aspect.target === body;
}

function hasHardAspect(chart: NatalChartResponse, body: PlanetaryBody) {
  return chart.aspects.some(
    (aspect) => hardAspectTypes.has(aspect.type) && touchesBody(aspect, body)
  );
}

function upsertSignal(
  signalMap: Map<string, ReportChartSignal>,
  signal: ReportChartSignal
) {
  const existing = signalMap.get(signal.key);

  if (
    !existing ||
    signalWeights[signal.level] > signalWeights[existing.level]
  ) {
    signalMap.set(signal.key, signal);
  }
}

export function deriveReportChartSignals(
  chart: NatalChartResponse
): ReportChartSignal[] {
  const signalMap = new Map<string, ReportChartSignal>();

  for (const signal of chart.remedySignals) {
    upsertSignal(signalMap, {
      key: signal.key,
      title: signal.title,
      level: signal.level,
      rationale: signal.rationale,
      relatedBodies: signal.relatedBodies,
    });
  }

  const dominantBodies = new Set(chart.summary.dominantBodies);
  const sun = getPlanet(chart, "SUN");
  const moon = getPlanet(chart, "MOON");
  const saturn = getPlanet(chart, "SATURN");
  const jupiter = getPlanet(chart, "JUPITER");
  const rahu = getPlanet(chart, "RAHU");
  const ketu = getPlanet(chart, "KETU");

  if (
    sun &&
    (dominantBodies.has("SUN") || sun.house === 1 || sun.house === 10)
  ) {
    upsertSignal(signalMap, {
      key: "solar-clarity",
      title: "Solar clarity deserves a composed channel.",
      level: dominantBodies.has("SUN") ? "HIGH" : "MEDIUM",
      rationale:
        "The Sun is either dominant or highly visible in an angular house, so steadier daily alignment is worth emphasizing.",
      relatedBodies: ["SUN"],
    });
  }

  if (moon && (dominantBodies.has("MOON") || hasHardAspect(chart, "MOON"))) {
    upsertSignal(signalMap, {
      key: "lunar-settling",
      title: "The emotional field benefits from gentler rhythm.",
      level:
        dominantBodies.has("MOON") && hasHardAspect(chart, "MOON")
          ? "HIGH"
          : "MEDIUM",
      rationale:
        "Moon emphasis or pressure around the Moon often responds best to slower pacing and reflective structure.",
      relatedBodies: ["MOON"],
    });
  }

  if (
    saturn &&
    (dominantBodies.has("SATURN") ||
      saturn.retrograde ||
      hasHardAspect(chart, "SATURN"))
  ) {
    upsertSignal(signalMap, {
      key: "saturn-discipline",
      title: "Saturn asks for steadiness over intensity.",
      level:
        dominantBodies.has("SATURN") || saturn.retrograde ? "HIGH" : "MEDIUM",
      rationale:
        "Saturn is carrying enough weight to favor modest service, cleaner rhythm, and grounded discipline.",
      relatedBodies: ["SATURN"],
    });
  }

  if (
    jupiter &&
    (dominantBodies.has("JUPITER") ||
      jupiter.house === 1 ||
      jupiter.house === 9)
  ) {
    upsertSignal(signalMap, {
      key: "jupiter-guidance",
      title: "Jupiter themes should stay devotional, not inflated.",
      level: dominantBodies.has("JUPITER") ? "HIGH" : "MEDIUM",
      rationale:
        "Jupiter is prominent enough that guidance, perspective, and traditional reverence become useful anchors.",
      relatedBodies: ["JUPITER"],
    });
  }

  if (
    (rahu && [1, 7, 8, 12].includes(rahu.house)) ||
    (ketu && [1, 7, 8, 12].includes(ketu.house))
  ) {
    upsertSignal(signalMap, {
      key: "nodal-grounding",
      title: "Nodal emphasis benefits from grounding and containment.",
      level: "MEDIUM",
      rationale:
        "Angular or more introspective nodal placements often call for steadier devotional boundaries and less overstimulation.",
      relatedBodies: ["RAHU", "KETU"],
    });
  }

  if (!signalMap.size) {
    upsertSignal(signalMap, {
      key: "devotional-foundation",
      title: "A simple spiritual foundation is the most balanced start.",
      level: "LOW",
      rationale:
        "When no single pressure dominates, calm consistency is a safer first recommendation than specialized measures.",
      relatedBodies: chart.summary.dominantBodies.slice(0, 1),
    });
  }

  return Array.from(signalMap.values()).sort((left, right) => {
    return signalWeights[right.level] - signalWeights[left.level];
  });
}

export function mapSignalsToRemedyMatches(
  signals: ReportChartSignal[]
): RemedyRuleMatch[] {
  const matches: RemedyRuleMatch[] = [];

  for (const signal of signals) {
    const signalWeight = signalWeights[signal.level];
    const applicableRules = ruleCatalog.filter(
      (rule) => rule.signalKey === signal.key
    );

    for (const rule of applicableRules) {
      const priority = rule.basePriority + signalWeight * 10;

      matches.push({
        remedySlug: rule.remedySlug,
        signalKey: signal.key,
        rationale: rule.rationale,
        priority,
        confidenceScore: buildConfidenceScore(priority, signal.level),
        matchedSignalLevel: signal.level,
      });
    }
  }

  return matches.sort((left, right) => {
    return right.priority - left.priority;
  });
}
