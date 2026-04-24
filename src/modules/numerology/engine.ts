type NumerologyFailureCode =
  | "MISSING_DATE_OF_BIRTH"
  | "INVALID_DATE_OF_BIRTH"
  | "FUTURE_DATE_OF_BIRTH"
  | "INVALID_NAME_INPUT";

export type NumerologyInput = {
  dateOfBirth: string;
  fullName?: string | null;
};

type NumerologyProfile = {
  number: number;
  label: string;
  aliases: readonly string[];
  primaryTraits: readonly string[];
  strengths: readonly string[];
  cautionAreas: readonly string[];
  relationshipTendencies: readonly string[];
  careerTendencies: readonly string[];
  financialTendencies: readonly string[];
  harmonyNotes: readonly string[];
  growthNotes: readonly string[];
};

export type NumerologyNumberInsight = {
  number: number;
  label: string;
  aliases: readonly string[];
  primaryTraits: string[];
  strengths: string[];
  cautionAreas: string[];
  relationshipTendencies: string[];
  careerTendencies: string[];
  financialTendencies: string[];
  isMasterNumber: boolean;
};

export type NumerologyCompoundNumbers = {
  birth: number;
  destiny: number;
  name: number | null;
  values: number[];
};

export type NumerologyInterpretation = {
  coreIdentity: string[];
  strengths: string[];
  cautionAreas: string[];
  relationshipTendencies: string[];
  careerTendencies: string[];
  financialTendencies: string[];
};

export type NumerologyPremiumSummary = {
  dominantNumber: NumerologyNumberInsight;
  harmonyNotes: string[];
  growthNotes: string[];
};

type LegacySummary = {
  primaryTraits: string[];
  strengths: string[];
  cautionAreas: string[];
};

export type NumerologyContextOutput = {
  dateOfBirth: string;
  normalizedName: string | null;
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  nameNumber: NumerologyNumberInsight | null;
  coreNumbers: number[];
  compoundNumbers: NumerologyCompoundNumbers;
  interpretation: NumerologyInterpretation;
  premiumSummary: NumerologyPremiumSummary;
  // Retained for backward compatibility with any existing consumer paths.
  summary: LegacySummary;
};

export type NumerologyContextFailure = {
  success: false;
  error: {
    code: NumerologyFailureCode;
    message: string;
  };
};

export type NumerologyContextSuccess = {
  success: true;
  data: NumerologyContextOutput;
};

export type NumerologyContextResult =
  | NumerologyContextFailure
  | NumerologyContextSuccess;

const masterNumbers = new Set([11, 22, 33]);

const numerologyProfiles = new Map<number, NumerologyProfile>([
  [
    1,
    {
      number: 1,
      label: "Initiator",
      aliases: ["Birth Number 1", "Psychic Number 1"],
      primaryTraits: ["Independent", "Direct", "Self-driven"],
      strengths: ["Leadership", "Momentum", "Decisiveness"],
      cautionAreas: ["Impatience", "Over-control", "Isolation"],
      relationshipTendencies: [
        "Prefers honest communication over emotional ambiguity.",
        "Needs mutual respect for autonomy in partnerships.",
      ],
      careerTendencies: [
        "Thrives in ownership roles and pioneering work.",
        "Performs best with clear targets and decision authority.",
      ],
      financialTendencies: [
        "Comfortable taking calculated risks for growth.",
        "Benefits from disciplined review before large commitments.",
      ],
      harmonyNotes: [
        "A strong number 1 profile works best with clear goals and stable routines.",
      ],
      growthNotes: [
        "Balance speed with listening to avoid unnecessary friction.",
      ],
    },
  ],
  [
    2,
    {
      number: 2,
      label: "Harmonizer",
      aliases: ["Birth Number 2", "Psychic Number 2"],
      primaryTraits: ["Sensitive", "Diplomatic", "Relational"],
      strengths: ["Cooperation", "Empathy", "Partnership stability"],
      cautionAreas: ["Overthinking", "Indecision", "Emotional reactivity"],
      relationshipTendencies: [
        "Responds well to emotional consistency and patience.",
        "Seeks balance and thoughtful partnership dialogue.",
      ],
      careerTendencies: [
        "Excels in collaborative environments and mediation roles.",
        "Strong in support, planning, and execution alignment.",
      ],
      financialTendencies: [
        "Prefers conservative and stability-oriented decisions.",
        "Should avoid decisions made purely from emotional pressure.",
      ],
      harmonyNotes: [
        "Number 2 energy brings cohesion when communication remains calm and explicit.",
      ],
      growthNotes: [
        "Set decision deadlines to reduce over-analysis loops.",
      ],
    },
  ],
  [
    3,
    {
      number: 3,
      label: "Expression",
      aliases: ["Birth Number 3", "Psychic Number 3"],
      primaryTraits: ["Creative", "Expressive", "Social"],
      strengths: ["Communication", "Inspiration", "Visibility"],
      cautionAreas: ["Scattered focus", "Overpromising", "Inconsistent follow-through"],
      relationshipTendencies: [
        "Builds connection through positive communication and shared expression.",
        "Needs emotional grounding to prevent mixed signals.",
      ],
      careerTendencies: [
        "Strong in creative strategy, teaching, content, and presentation.",
        "Performs best with structured execution milestones.",
      ],
      financialTendencies: [
        "Can attract opportunities through networking and visibility.",
        "Needs spending discipline during high-energy phases.",
      ],
      harmonyNotes: [
        "Number 3 gains momentum when creativity is anchored to a consistent plan.",
      ],
      growthNotes: [
        "Prioritize completion alongside inspiration.",
      ],
    },
  ],
  [
    4,
    {
      number: 4,
      label: "Builder",
      aliases: ["Birth Number 4", "Psychic Number 4"],
      primaryTraits: ["Practical", "Structured", "Reliable"],
      strengths: ["Discipline", "Execution", "Long-term foundations"],
      cautionAreas: ["Rigidity", "Excess caution", "Resistance to change"],
      relationshipTendencies: [
        "Shows care through reliability and practical support.",
        "Needs flexibility in emotionally dynamic conversations.",
      ],
      careerTendencies: [
        "Excellent for operations, systems, and process-heavy work.",
        "Excels where consistency and accountability are valued.",
      ],
      financialTendencies: [
        "Naturally budgeting-oriented and stability focused.",
        "Can miss upside when caution is excessive.",
      ],
      harmonyNotes: [
        "Number 4 creates stability when discipline is balanced with adaptability.",
      ],
      growthNotes: [
        "Leave room for iteration while preserving structure.",
      ],
    },
  ],
  [
    5,
    {
      number: 5,
      label: "Explorer",
      aliases: ["Birth Number 5", "Psychic Number 5"],
      primaryTraits: ["Adaptable", "Curious", "Dynamic"],
      strengths: ["Versatility", "Opportunity sensing", "Resilience"],
      cautionAreas: ["Restlessness", "Inconsistency", "Impulse decisions"],
      relationshipTendencies: [
        "Values flexibility and engaging communication in relationships.",
        "Needs clarity around boundaries and commitments.",
      ],
      careerTendencies: [
        "Strong in environments with change, variety, and fast learning.",
        "Benefits from clear priorities to avoid scattered output.",
      ],
      financialTendencies: [
        "Comfortable with opportunity-led decisions when informed.",
        "Should avoid impulsive financial moves under excitement.",
      ],
      harmonyNotes: [
        "Number 5 thrives when freedom is paired with accountability.",
      ],
      growthNotes: [
        "Convert flexibility into consistent routines for better outcomes.",
      ],
    },
  ],
  [
    6,
    {
      number: 6,
      label: "Nurturer",
      aliases: ["Birth Number 6", "Psychic Number 6"],
      primaryTraits: ["Supportive", "Responsible", "Balanced"],
      strengths: ["Caregiving", "Commitment", "Community leadership"],
      cautionAreas: ["Over-responsibility", "Perfectionism", "Boundary fatigue"],
      relationshipTendencies: [
        "Prioritizes loyalty and long-term emotional security.",
        "Needs reciprocal effort to avoid over-functioning.",
      ],
      careerTendencies: [
        "Performs well in service, management, wellness, and advisory roles.",
        "Strong in trust-driven teams and responsibility-heavy scopes.",
      ],
      financialTendencies: [
        "Makes practical decisions with long-term family security in mind.",
        "Should monitor over-giving in shared financial situations.",
      ],
      harmonyNotes: [
        "Number 6 profiles are strongest when care is balanced with boundaries.",
      ],
      growthNotes: [
        "Protect personal capacity while supporting others.",
      ],
    },
  ],
  [
    7,
    {
      number: 7,
      label: "Seeker",
      aliases: ["Birth Number 7", "Psychic Number 7"],
      primaryTraits: ["Reflective", "Analytical", "Intuitive"],
      strengths: ["Insight", "Research depth", "Spiritual focus"],
      cautionAreas: ["Withdrawal", "Skepticism loops", "Over-analysis"],
      relationshipTendencies: [
        "Prefers depth, trust, and meaningful one-to-one dialogue.",
        "Needs emotional openness to avoid distance.",
      ],
      careerTendencies: [
        "Thrives in analysis, research, strategy, and knowledge work.",
        "Performs best with uninterrupted focus windows.",
      ],
      financialTendencies: [
        "Usually deliberate and low-impulse with money decisions.",
        "Should avoid delaying useful action through excessive analysis.",
      ],
      harmonyNotes: [
        "Number 7 finds clarity when reflection is paired with practical action.",
      ],
      growthNotes: [
        "Move from insight to implementation with small committed steps.",
      ],
    },
  ],
  [
    8,
    {
      number: 8,
      label: "Strategist",
      aliases: ["Birth Number 8", "Psychic Number 8"],
      primaryTraits: ["Ambitious", "Organized", "Result-oriented"],
      strengths: ["Management", "Resource direction", "Authority"],
      cautionAreas: ["Work imbalance", "Control pressure", "Material overfocus"],
      relationshipTendencies: [
        "Values reliability, loyalty, and practical partnership progress.",
        "Needs emotional softness alongside goal orientation.",
      ],
      careerTendencies: [
        "Strong in leadership, finance, operations, and scale execution.",
        "Excels where strategy and accountability converge.",
      ],
      financialTendencies: [
        "High potential for long-term wealth discipline and planning.",
        "Should avoid overexposure to high-pressure risk cycles.",
      ],
      harmonyNotes: [
        "Number 8 gains sustained success when power is balanced with perspective.",
      ],
      growthNotes: [
        "Maintain recovery cycles to protect long-term performance.",
      ],
    },
  ],
  [
    9,
    {
      number: 9,
      label: "Humanitarian",
      aliases: ["Birth Number 9", "Psychic Number 9"],
      primaryTraits: ["Compassionate", "Visionary", "Ideal-driven"],
      strengths: ["Service mindset", "Broad perspective", "Emotional intelligence"],
      cautionAreas: ["Emotional drain", "Attachment to outcomes", "Difficulty releasing cycles"],
      relationshipTendencies: [
        "Deeply caring and protective in emotional bonds.",
        "Needs healthy boundaries to avoid emotional overload.",
      ],
      careerTendencies: [
        "Strong in guidance, public impact, teaching, and service-led roles.",
        "Performs best with purpose-aligned projects.",
      ],
      financialTendencies: [
        "Often generous and impact-led in spending behavior.",
        "Benefits from firm planning to balance giving and security.",
      ],
      harmonyNotes: [
        "Number 9 profiles thrive when compassion is grounded in structure.",
      ],
      growthNotes: [
        "Release completed cycles to preserve focus for current priorities.",
      ],
    },
  ],
  [
    11,
    {
      number: 11,
      label: "Master Intuition",
      aliases: ["Master Number 11", "Vision Channel"],
      primaryTraits: ["Inspired", "Perceptive", "Purpose-oriented"],
      strengths: ["Higher insight", "Spiritual communication", "Vision leadership"],
      cautionAreas: ["Nervous intensity", "Emotional overwhelm", "Grounding gaps"],
      relationshipTendencies: [
        "Needs emotionally aware partnerships with clear communication.",
        "Requires grounding and calm pace during high-sensitivity periods.",
      ],
      careerTendencies: [
        "Strong in guidance, creative direction, and mission-driven leadership.",
        "Performs best when intuition is paired with practical planning.",
      ],
      financialTendencies: [
        "Can create value through vision-led initiatives.",
        "Should validate intuitive financial decisions with concrete data.",
      ],
      harmonyNotes: [
        "Master 11 energy is powerful when vision and routine stay aligned.",
      ],
      growthNotes: [
        "Prioritize grounding rituals to stabilize insight under pressure.",
      ],
    },
  ],
  [
    22,
    {
      number: 22,
      label: "Master Builder",
      aliases: ["Master Number 22", "Legacy Architect"],
      primaryTraits: ["Visionary", "Systematic", "Impact-driven"],
      strengths: ["Large-scale execution", "Pragmatic vision", "Legacy building"],
      cautionAreas: ["Pressure burden", "Overwork", "Perfection stress"],
      relationshipTendencies: [
        "Values reliable partnerships that support long-term missions.",
        "Needs time boundaries to protect personal connection quality.",
      ],
      careerTendencies: [
        "Excels in building institutions, systems, and scalable ventures.",
        "Works best with delegated teams and phased execution.",
      ],
      financialTendencies: [
        "Strong capacity for long-horizon asset and system planning.",
        "Should avoid carrying every responsibility alone.",
      ],
      harmonyNotes: [
        "Master 22 thrives when big vision is broken into practical milestones.",
      ],
      growthNotes: [
        "Scale through systems, not constant personal overextension.",
      ],
    },
  ],
  [
    33,
    {
      number: 33,
      label: "Master Compassion",
      aliases: ["Master Number 33", "Service Guide"],
      primaryTraits: ["Guiding", "Protective", "Heart-centered"],
      strengths: ["Healing presence", "Mentorship", "Collective upliftment"],
      cautionAreas: ["Self-neglect", "Emotional overextension", "Idealism fatigue"],
      relationshipTendencies: [
        "Creates deep trust through guidance and emotional steadiness.",
        "Needs reciprocal emotional support to avoid burnout.",
      ],
      careerTendencies: [
        "Strong in teaching, counseling, mentoring, and mission-led leadership.",
        "Performs best where service and structure are both respected.",
      ],
      financialTendencies: [
        "Can align finances with service and long-term social impact goals.",
        "Should preserve personal reserves while supporting others.",
      ],
      harmonyNotes: [
        "Master 33 remains sustainable when compassion is paired with boundaries.",
      ],
      growthNotes: [
        "Protect restoration time to sustain high-service output.",
      ],
    },
  ],
]);

type ParsedDateOfBirth =
  | {
      type: "future";
    }
  | {
      type: "valid";
      dateOfBirth: string;
      day: number;
      digitSum: number;
    };

type NameNumberComputation = {
  coreNumber: number;
  compoundNumber: number;
};

function fail(
  code: NumerologyFailureCode,
  message: string
): NumerologyContextFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

function sumDigits(value: number) {
  return value
    .toString()
    .split("")
    .reduce((accumulator, digit) => accumulator + Number(digit), 0);
}

function reduceToCoreNumber(value: number): number {
  let current = Math.abs(Math.trunc(value));

  if (current === 0) {
    return 0;
  }

  while (current > 9 && !masterNumbers.has(current)) {
    current = sumDigits(current);
  }

  return current;
}

function parseDateOfBirth(value: string): ParsedDateOfBirth | null {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  const todayUtcMidnight = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );

  if (parsed.getTime() > todayUtcMidnight) {
    return {
      type: "future",
    };
  }

  return {
    type: "valid",
    dateOfBirth: normalized,
    day,
    digitSum: normalized
      .replaceAll("-", "")
      .split("")
      .reduce((accumulator, digit) => accumulator + Number(digit), 0),
  };
}

function normalizeName(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function toAsciiLetters(input: string) {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function calculateNameNumber(name: string): NameNumberComputation | null {
  const lettersOnly = toAsciiLetters(name);

  if (!lettersOnly) {
    return null;
  }

  const compoundNumber = lettersOnly
    .split("")
    .reduce(
      (accumulator, letter) =>
        accumulator + (((letter.charCodeAt(0) - 65) % 9) + 1),
      0
    );

  return {
    compoundNumber,
    coreNumber: reduceToCoreNumber(compoundNumber),
  };
}

function toInsight(number: number): NumerologyNumberInsight {
  const profile =
    numerologyProfiles.get(number) ??
    ({
      number,
      label: "Core Number",
      aliases: ["Core Number"],
      primaryTraits: ["Structured"],
      strengths: ["Consistency"],
      cautionAreas: ["Over-generalization"],
      relationshipTendencies: ["Needs clear communication and calm pacing."],
      careerTendencies: ["Performs best with explicit priorities and routines."],
      financialTendencies: ["Benefits from practical, reviewed financial decisions."],
      harmonyNotes: ["Consistency and measured pacing support this number profile."],
      growthNotes: ["Focus on disciplined execution over reaction."],
    } satisfies NumerologyProfile);

  return {
    number: profile.number,
    label: profile.label,
    aliases: [...profile.aliases],
    primaryTraits: [...profile.primaryTraits],
    strengths: [...profile.strengths],
    cautionAreas: [...profile.cautionAreas],
    relationshipTendencies: [...profile.relationshipTendencies],
    careerTendencies: [...profile.careerTendencies],
    financialTendencies: [...profile.financialTendencies],
    isMasterNumber: masterNumbers.has(number),
  };
}

function mergeUnique(values: readonly string[], limit: number) {
  return Array.from(new Set(values)).slice(0, limit);
}

function buildInterpretation(
  insights: readonly NumerologyNumberInsight[]
): NumerologyInterpretation {
  return {
    coreIdentity: mergeUnique(
      insights.flatMap((insight) => insight.primaryTraits),
      8
    ),
    strengths: mergeUnique(
      insights.flatMap((insight) => insight.strengths),
      8
    ),
    cautionAreas: mergeUnique(
      insights.flatMap((insight) => insight.cautionAreas),
      8
    ),
    relationshipTendencies: mergeUnique(
      insights.flatMap((insight) => insight.relationshipTendencies),
      6
    ),
    careerTendencies: mergeUnique(
      insights.flatMap((insight) => insight.careerTendencies),
      6
    ),
    financialTendencies: mergeUnique(
      insights.flatMap((insight) => insight.financialTendencies),
      6
    ),
  };
}

function getDominantNumber(
  birthNumber: NumerologyNumberInsight,
  destinyNumber: NumerologyNumberInsight,
  nameNumber: NumerologyNumberInsight | null
) {
  const weightedInputs = [
    { number: birthNumber.number, weight: 3, sourceOrder: 1 },
    { number: destinyNumber.number, weight: 2, sourceOrder: 2 },
    ...(nameNumber ? [{ number: nameNumber.number, weight: 1, sourceOrder: 3 }] : []),
  ] as const;

  const scoreMap = new Map<number, { score: number; sourceOrder: number }>();

  for (const input of weightedInputs) {
    const existing = scoreMap.get(input.number);
    if (!existing) {
      scoreMap.set(input.number, {
        score: input.weight,
        sourceOrder: input.sourceOrder,
      });
      continue;
    }

    scoreMap.set(input.number, {
      score: existing.score + input.weight,
      sourceOrder: Math.min(existing.sourceOrder, input.sourceOrder),
    });
  }

  const ranked = Array.from(scoreMap.entries()).sort((left, right) => {
    const leftDetails = left[1];
    const rightDetails = right[1];

    if (leftDetails.score !== rightDetails.score) {
      return rightDetails.score - leftDetails.score;
    }

    return leftDetails.sourceOrder - rightDetails.sourceOrder;
  });

  return toInsight(ranked[0]?.[0] ?? birthNumber.number);
}

function buildPremiumSummary(input: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  nameNumber: NumerologyNumberInsight | null;
  interpretation: NumerologyInterpretation;
}): NumerologyPremiumSummary {
  const dominantNumber = getDominantNumber(
    input.birthNumber,
    input.destinyNumber,
    input.nameNumber
  );
  const dominantProfile = numerologyProfiles.get(dominantNumber.number);

  const harmonyNotes = mergeUnique(
    [
      ...(dominantProfile?.harmonyNotes ?? []),
      ...(input.birthNumber.number === input.destinyNumber.number
        ? [
            `Birth and Destiny both resolve to ${input.birthNumber.number}, which amplifies a focused life direction.`,
          ]
        : []),
      ...(input.nameNumber && input.nameNumber.number === dominantNumber.number
        ? [
            `Your Name Number aligns with dominant number ${dominantNumber.number}, reinforcing this expression style.`,
          ]
        : []),
      ...(input.nameNumber && input.nameNumber.number !== dominantNumber.number
        ? [
            "Name Number adds a secondary influence that can improve flexibility across contexts.",
          ]
        : []),
      ...(dominantNumber.isMasterNumber
        ? [
            "Master-number influence indicates higher intensity; consistency and grounding are important.",
          ]
        : []),
    ],
    5
  );

  const growthNotes = mergeUnique(
    [
      ...(dominantProfile?.growthNotes ?? []),
      ...input.interpretation.cautionAreas
        .slice(0, 2)
        .map((item) => `Manage ${item.toLowerCase()} through disciplined daily choices.`),
      "Use numerology as guidance context, then validate major decisions with practical planning.",
    ],
    5
  );

  return {
    dominantNumber,
    harmonyNotes,
    growthNotes,
  };
}

function buildLegacySummary(
  interpretation: NumerologyInterpretation
): LegacySummary {
  return {
    primaryTraits: interpretation.coreIdentity,
    strengths: interpretation.strengths,
    cautionAreas: interpretation.cautionAreas,
  };
}

export function calculateNumerologyContext(
  input: NumerologyInput
): NumerologyContextResult {
  if (!input.dateOfBirth?.trim()) {
    return fail("MISSING_DATE_OF_BIRTH", "Date of birth is required.");
  }

  const parsedDate = parseDateOfBirth(input.dateOfBirth);

  if (!parsedDate) {
    return fail(
      "INVALID_DATE_OF_BIRTH",
      "Enter a valid date of birth in YYYY-MM-DD format."
    );
  }

  if (parsedDate.type === "future") {
    return fail(
      "FUTURE_DATE_OF_BIRTH",
      "Date of birth cannot be in the future."
    );
  }

  const normalizedName = normalizeName(input.fullName);
  const nameNumberComputation = normalizedName
    ? calculateNameNumber(normalizedName)
    : null;

  if (normalizedName && nameNumberComputation === null) {
    return fail(
      "INVALID_NAME_INPUT",
      "Name must include alphabetic characters for name number calculation."
    );
  }

  const birthCompoundNumber = parsedDate.day;
  const destinyCompoundNumber = parsedDate.digitSum;
  const birthNumber = toInsight(reduceToCoreNumber(birthCompoundNumber));
  const destinyNumber = toInsight(reduceToCoreNumber(destinyCompoundNumber));
  const nameNumber = nameNumberComputation
    ? toInsight(nameNumberComputation.coreNumber)
    : null;

  const insightSet = [birthNumber, destinyNumber, nameNumber].filter(
    (insight): insight is NumerologyNumberInsight => insight !== null
  );
  const interpretation = buildInterpretation(insightSet);
  const premiumSummary = buildPremiumSummary({
    birthNumber,
    destinyNumber,
    nameNumber,
    interpretation,
  });
  const compoundNumbers: NumerologyCompoundNumbers = {
    birth: birthCompoundNumber,
    destiny: destinyCompoundNumber,
    name: nameNumberComputation?.compoundNumber ?? null,
    values: [
      birthCompoundNumber,
      destinyCompoundNumber,
      ...(nameNumberComputation ? [nameNumberComputation.compoundNumber] : []),
    ],
  };

  return {
    success: true,
    data: {
      dateOfBirth: parsedDate.dateOfBirth,
      normalizedName: normalizedName || null,
      birthNumber,
      destinyNumber,
      nameNumber,
      coreNumbers: insightSet.map((insight) => insight.number),
      compoundNumbers,
      interpretation,
      premiumSummary,
      summary: buildLegacySummary(interpretation),
    },
  };
}
