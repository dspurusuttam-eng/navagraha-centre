type NumerologyFailureCode =
  | "MISSING_DATE_OF_BIRTH"
  | "INVALID_DATE_OF_BIRTH"
  | "FUTURE_DATE_OF_BIRTH"
  | "INVALID_NAME_INPUT";

export type NumerologyInput = {
  dateOfBirth: string;
  fullName?: string | null;
};

export type NumerologyCoreCalculationType =
  | "life_path_number"
  | "destiny_expression_number"
  | "soul_urge_number"
  | "personality_number"
  | "birth_day_number"
  | "lucky_number_set";

export type NumerologyCoreCalculation = {
  calculationType: NumerologyCoreCalculationType;
  inputSummary: string[];
  number: number | null;
  numberLabel: string;
  basis: string[];
  strengths: string[];
  cautions: string[];
  safeSummary: string;
  missingReason: string | null;
  luckyNumbers?: number[];
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

export type NumerologyCoreContextOutput = {
  dateOfBirth: string;
  normalizedName: string;
  inputSummary: string[];
  coreCalculations: NumerologyCoreCalculation[];
  luckyNumbers: number[];
  summary: LegacySummary;
  missingReason: string | null;
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
  coreCalculations: NumerologyCoreCalculation[];
  luckyNumbers: number[];
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

export type NumerologyCoreContextFailureCode =
  | NumerologyFailureCode
  | "MISSING_FULL_NAME";

export type NumerologyCoreContextFailure = {
  success: false;
  error: {
    code: NumerologyCoreContextFailureCode;
    message: string;
  };
};

export type NumerologyCoreContextSuccess = {
  success: true;
  data: NumerologyCoreContextOutput;
};

export type NumerologyCoreContextResult =
  | NumerologyCoreContextFailure
  | NumerologyCoreContextSuccess;

export type NumerologyUtilityType =
  | "name_numerology"
  | "business_name_numerology"
  | "vehicle_number_numerology"
  | "mobile_number_numerology"
  | "name_dob_compatibility";

export type NumerologyUtilityInput = {
  utilityType: NumerologyUtilityType;
  fullName?: string | null;
  businessName?: string | null;
  vehicleNumber?: string | number | null;
  mobileNumber?: string | number | null;
  dateOfBirth?: string | null;
};

export type NumerologyUtilityOutput = {
  utilityType: NumerologyUtilityType;
  inputSummary: string[];
  primaryNumber: number | null;
  supportingNumbers: number[];
  numberLabel: string;
  basis: string[];
  strengths: string[];
  cautions: string[];
  suggestions: string[];
  safeSummary: string;
  missingReason: string | null;
};

export type NumerologyUtilityFailureCode =
  | NumerologyFailureCode
  | "MISSING_FULL_NAME"
  | "MISSING_BUSINESS_NAME"
  | "MISSING_VEHICLE_NUMBER"
  | "MISSING_MOBILE_NUMBER"
  | "MISSING_COMPATIBILITY_INPUT";

export type NumerologyUtilityFailure = {
  success: false;
  error: {
    code: NumerologyUtilityFailureCode;
    message: string;
  };
};

export type NumerologyUtilitySuccess = {
  success: true;
  data: NumerologyUtilityOutput;
};

export type NumerologyUtilityContextResult =
  | NumerologyUtilityFailure
  | NumerologyUtilitySuccess;

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

type NameLetterAnalysis = {
  letters: string[];
  asciiLetters: string[];
};

type NumericStringAnalysis = {
  digits: string;
  values: number[];
  compoundNumber: number;
  coreNumber: number;
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

function toUnicodeLetters(input: string) {
  return Array.from(input).filter((character) => /\p{L}/u.test(character));
}

function toAsciiLetters(input: string) {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function analyzeNameLetters(input: string): NameLetterAnalysis | null {
  const letters = toUnicodeLetters(input);

  if (letters.length === 0) {
    return null;
  }

  return {
    letters,
    asciiLetters: Array.from(toAsciiLetters(input)),
  };
}

function analyzeNumericString(input: string | number | null | undefined) {
  const digits = `${input ?? ""}`.trim().replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const values = Array.from(digits).map((digit) => Number(digit));
  const compoundNumber = values.reduce(
    (accumulator, value) => accumulator + value,
    0
  );

  return {
    digits,
    values,
    compoundNumber,
    coreNumber: reduceToCoreNumber(compoundNumber),
  } satisfies NumericStringAnalysis;
}

function isAsciiVowel(letter: string) {
  return /^[AEIOU]$/u.test(letter);
}

function getLetterValue(letter: string) {
  const normalized = letter
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase();
  const asciiMatch = normalized.match(/^[A-Z]$/u);

  if (asciiMatch) {
    return ((normalized.charCodeAt(0) - 65) % 9) + 1;
  }

  const codePoint = normalized.codePointAt(0) ?? 0;
  return (Math.abs(codePoint) % 9) + 1;
}

function reduceNameValueToCoreNumber(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return reduceToCoreNumber(values.reduce((accumulator, value) => accumulator + value, 0));
}

function buildCoreCalculation(input: {
  calculationType: NumerologyCoreCalculationType;
  inputSummary: string[];
  number: number | null;
  numberLabel: string;
  basis: string[];
  strengths: string[];
  cautions: string[];
  safeSummary: string;
  missingReason: string | null;
  luckyNumbers?: number[];
}): NumerologyCoreCalculation {
  return {
    calculationType: input.calculationType,
    inputSummary: [...input.inputSummary],
    number: input.number,
    numberLabel: input.numberLabel,
    basis: [...input.basis],
    strengths: [...input.strengths],
    cautions: [...input.cautions],
    safeSummary: input.safeSummary,
    missingReason: input.missingReason,
    ...(input.luckyNumbers ? { luckyNumbers: [...input.luckyNumbers] } : {}),
  };
}

function calculateNameNumber(name: string): NameNumberComputation | null {
  const analysis = analyzeNameLetters(name);

  if (!analysis) {
    return null;
  }

  const values = analysis.letters.map((letter) => getLetterValue(letter));
  const compoundNumber = values.reduce(
    (accumulator, value) => accumulator + value,
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

function buildCoreNumerologyCalculations(input: {
  dateOfBirth: string;
  normalizedName: string;
  parsedDate: Extract<ParsedDateOfBirth, { type: "valid" }>;
  analysis: NameLetterAnalysis | null;
  strictNameRequired: boolean;
}) {
  const lifePathNumber = toInsight(
    reduceToCoreNumber(input.parsedDate.digitSum)
  );
  const birthDayNumber = toInsight(reduceToCoreNumber(input.parsedDate.day));

  const expressionValues = input.analysis
    ? input.analysis.letters.map((letter) => getLetterValue(letter))
    : [];
  const expressionNumberValue = reduceNameValueToCoreNumber(expressionValues);
  const expressionNumber =
    expressionNumberValue !== null ? toInsight(expressionNumberValue) : null;

  const asciiLetters = input.analysis?.asciiLetters ?? [];
  const soulUrgeValues = asciiLetters.filter((letter) => isAsciiVowel(letter)).map(
    (letter) => getLetterValue(letter)
  );
  const consonantValues = asciiLetters.filter((letter) => !isAsciiVowel(letter)).map(
    (letter) => getLetterValue(letter)
  );

  const soulUrgeNumberValue = reduceNameValueToCoreNumber(soulUrgeValues);
  const personalityNumberValue = reduceNameValueToCoreNumber(consonantValues);

  const soulUrgeNumber =
    soulUrgeNumberValue !== null ? toInsight(soulUrgeNumberValue) : null;
  const personalityNumber =
    personalityNumberValue !== null ? toInsight(personalityNumberValue) : null;

  const coreCalculations: NumerologyCoreCalculation[] = [];

  coreCalculations.push(
    buildCoreCalculation({
      calculationType: "life_path_number",
      inputSummary: [`Date of Birth: ${input.dateOfBirth}`],
      number: lifePathNumber.number,
      numberLabel: "Life Path Number",
      basis: [
        "Derived from the full date-of-birth digit reduction.",
        `Birth digit sum reduced to ${lifePathNumber.number}.`,
      ],
      strengths: [...lifePathNumber.strengths.slice(0, 3)],
      cautions: [...lifePathNumber.cautionAreas.slice(0, 3)],
      safeSummary: `Life Path Number ${lifePathNumber.number} describes the main life-direction theme in a practical, non-deterministic way.`,
      missingReason: null,
    })
  );

  coreCalculations.push(
    buildCoreCalculation({
      calculationType: "birth_day_number",
      inputSummary: [`Date of Birth: ${input.dateOfBirth}`],
      number: birthDayNumber.number,
      numberLabel: "Birth Day Number",
      basis: [
        "Derived from the calendar day component of the date of birth.",
        `Day number reduced to ${birthDayNumber.number}.`,
      ],
      strengths: [...birthDayNumber.strengths.slice(0, 3)],
      cautions: [...birthDayNumber.cautionAreas.slice(0, 3)],
      safeSummary: `Birth Day Number ${birthDayNumber.number} describes the immediate style or personal rhythm associated with the birth day.`,
      missingReason: null,
    })
  );

  if (expressionNumber) {
    coreCalculations.push(
      buildCoreCalculation({
        calculationType: "destiny_expression_number",
        inputSummary: [`Full Name: ${input.normalizedName}`],
        number: expressionNumber.number,
        numberLabel: "Destiny / Expression Number",
        basis: [
          "Derived from the full name letter values.",
          input.analysis?.asciiLetters.length
            ? "Latin letters were used for the main mapping."
            : "Unicode-safe fallback mapping was used for the full-name calculation.",
        ],
        strengths: [...expressionNumber.strengths.slice(0, 3)],
        cautions: [...expressionNumber.cautionAreas.slice(0, 3)],
        safeSummary: `Destiny / Expression Number ${expressionNumber.number} describes the outward style, expression, and visible tendencies associated with the full name.`,
        missingReason: null,
      })
    );
  } else {
    coreCalculations.push(
      buildCoreCalculation({
        calculationType: "destiny_expression_number",
        inputSummary: [`Full Name: ${input.normalizedName}`],
        number: null,
        numberLabel: "Destiny / Expression Number",
        basis: [
          "Derived from the full name letter values.",
          "A valid name is required for this calculation.",
        ],
        strengths: [],
        cautions: [],
        safeSummary: "Destiny / Expression Number is unavailable because the name input could not be read safely.",
        missingReason: "Name input is missing or invalid for expression calculation.",
      })
    );
  }

  if (soulUrgeNumber) {
    coreCalculations.push(
      buildCoreCalculation({
        calculationType: "soul_urge_number",
        inputSummary: [`Full Name: ${input.normalizedName}`],
        number: soulUrgeNumber.number,
        numberLabel: "Soul Urge Number",
        basis: [
          "Derived from vowel letters in the full name.",
          "Uses Latin vowel mapping when available.",
        ],
        strengths: [...soulUrgeNumber.strengths.slice(0, 3)],
        cautions: [...soulUrgeNumber.cautionAreas.slice(0, 3)],
        safeSummary: `Soul Urge Number ${soulUrgeNumber.number} reflects inward motivation and personal pull in a calm, non-deterministic way.`,
        missingReason: null,
      })
    );
  } else {
    coreCalculations.push(
      buildCoreCalculation({
        calculationType: "soul_urge_number",
        inputSummary: [`Full Name: ${input.normalizedName}`],
        number: null,
        numberLabel: "Soul Urge Number",
        basis: [
          "Derived from vowel letters in the full name.",
          "Latin vowel segmentation is required for this calculation.",
        ],
        strengths: [],
        cautions: [],
        safeSummary: "Soul Urge Number is unavailable because the name script could not be split into vowels safely.",
        missingReason:
          "Latin vowel segmentation is unavailable for the supplied name script.",
      })
    );
  }

  if (personalityNumber) {
    coreCalculations.push(
      buildCoreCalculation({
        calculationType: "personality_number",
        inputSummary: [`Full Name: ${input.normalizedName}`],
        number: personalityNumber.number,
        numberLabel: "Personality Number",
        basis: [
          "Derived from consonant letters in the full name.",
          "Uses Latin consonant mapping when available.",
        ],
        strengths: [...personalityNumber.strengths.slice(0, 3)],
        cautions: [...personalityNumber.cautionAreas.slice(0, 3)],
        safeSummary: `Personality Number ${personalityNumber.number} reflects the outward style that tends to be visible to others.`,
        missingReason: null,
      })
    );
  } else {
    coreCalculations.push(
      buildCoreCalculation({
        calculationType: "personality_number",
        inputSummary: [`Full Name: ${input.normalizedName}`],
        number: null,
        numberLabel: "Personality Number",
        basis: [
          "Derived from consonant letters in the full name.",
          "Latin consonant segmentation is required for this calculation.",
        ],
        strengths: [],
        cautions: [],
        safeSummary: "Personality Number is unavailable because the name script could not be split into consonants safely.",
        missingReason:
          "Latin consonant segmentation is unavailable for the supplied name script.",
      })
    );
  }

  const luckyNumbers = Array.from(
    new Set(
      [
        lifePathNumber.number,
        birthDayNumber.number,
        expressionNumber?.number,
        soulUrgeNumber?.number,
        personalityNumber?.number,
      ].filter((value): value is number => typeof value === "number")
    )
  ).sort((left, right) => left - right);

  coreCalculations.push(
    buildCoreCalculation({
      calculationType: "lucky_number_set",
      inputSummary: [
        `Date of Birth: ${input.dateOfBirth}`,
        `Full Name: ${input.normalizedName}`,
      ],
      number: luckyNumbers[0] ?? null,
      numberLabel: "Lucky Number Set",
      basis: [
        "Derived from the available core number set.",
        "Lucky numbers are a light guidance set, not a promise of outcome.",
      ],
      strengths: [
        "Offers a practical quick-reference set for planning and reminders.",
      ],
      cautions: [
        "Lucky numbers should never be treated as certainty or decision override.",
      ],
      safeSummary:
        luckyNumbers.length > 0
          ? `Lucky Number Set: ${luckyNumbers.join(", ")}. Use it as a light reference only.`
          : "Lucky Number Set is unavailable because there were not enough core values to derive a safe set.",
      missingReason:
        luckyNumbers.length > 0 ? null : "No safe lucky number set could be derived.",
      luckyNumbers,
    })
  );

  return {
    coreCalculations,
    luckyNumbers,
    lifePathNumber,
    birthDayNumber,
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    missingReason: input.strictNameRequired && !input.analysis
      ? "Name input is missing or invalid for core numerology calculations."
      : null,
  };
}

function buildLegacyNumerologyContextOutput(input: {
  dateOfBirth: string;
  parsedDate: Extract<ParsedDateOfBirth, { type: "valid" }>;
  normalizedName: string | null;
}) {
  const nameNumberComputation = input.normalizedName
    ? calculateNameNumber(input.normalizedName)
    : null;

  if (input.normalizedName && nameNumberComputation === null) {
    return fail(
      "INVALID_NAME_INPUT",
      "Name must include alphabetic characters for name number calculation."
    );
  }

  const birthCompoundNumber = input.parsedDate.day;
  const destinyCompoundNumber = input.parsedDate.digitSum;
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
  const corePack = buildCoreNumerologyCalculations({
    dateOfBirth: input.dateOfBirth,
    normalizedName: input.normalizedName ?? "",
    parsedDate: input.parsedDate,
    analysis: input.normalizedName ? analyzeNameLetters(input.normalizedName) : null,
    strictNameRequired: false,
  });

  return {
    success: true as const,
    data: {
      dateOfBirth: input.dateOfBirth,
      normalizedName: input.normalizedName,
      birthNumber,
      destinyNumber,
      nameNumber,
      coreNumbers: insightSet.map((insight) => insight.number),
      coreCalculations: corePack.coreCalculations,
      luckyNumbers: corePack.luckyNumbers,
      compoundNumbers,
      interpretation,
      premiumSummary,
      summary: buildLegacySummary(interpretation),
    },
  };
}

function failUtility(
  code: NumerologyUtilityFailureCode,
  message: string
): NumerologyUtilityFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

function buildUtilitySummary(
  utilityType: NumerologyUtilityType,
  label: string,
  primaryNumber: number,
  supportingNumbers: number[],
  inputSummary: string[],
  basis: string[],
  strengths: string[],
  cautions: string[],
  suggestions: string[],
  safeSummary: string
): NumerologyUtilityOutput {
  return {
    utilityType,
    inputSummary: [...inputSummary],
    primaryNumber,
    supportingNumbers: [...supportingNumbers],
    numberLabel: label,
    basis: [...basis],
    strengths: [...strengths],
    cautions: [...cautions],
    suggestions: [...suggestions],
    safeSummary,
    missingReason: null,
  };
}

function buildCompatibilityScore(nameNumber: number, dobNumber: number) {
  const left = reduceToCoreNumber(nameNumber);
  const right = reduceToCoreNumber(dobNumber);
  const gap = Math.abs(left - right);

  if (gap === 0) {
    return 9;
  }

  if (gap <= 1) {
    return 8;
  }

  if (gap <= 3) {
    return 7;
  }

  if (gap <= 5) {
    return 6;
  }

  if (gap <= 7) {
    return 4;
  }

  return 3;
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
  const output = buildLegacyNumerologyContextOutput({
    dateOfBirth: parsedDate.dateOfBirth,
    parsedDate,
    normalizedName: normalizedName || null,
  });

  return output.success ? output : fail(output.error.code, output.error.message);
}

export function calculateCoreNumerologyContext(
  input: NumerologyInput
): NumerologyCoreContextResult {
  if (!input.dateOfBirth?.trim()) {
    return {
      success: false,
      error: {
        code: "MISSING_DATE_OF_BIRTH",
        message: "Date of birth is required.",
      },
    };
  }

  const parsedDate = parseDateOfBirth(input.dateOfBirth);

  if (!parsedDate) {
    return {
      success: false,
      error: {
        code: "INVALID_DATE_OF_BIRTH",
        message: "Enter a valid date of birth in YYYY-MM-DD format.",
      },
    };
  }

  if (parsedDate.type === "future") {
    return {
      success: false,
      error: {
        code: "FUTURE_DATE_OF_BIRTH",
        message: "Date of birth cannot be in the future.",
      },
    };
  }

  const normalizedName = normalizeName(input.fullName);

  if (!normalizedName) {
    return {
      success: false,
      error: {
        code: "MISSING_FULL_NAME",
        message: "Full name is required for core numerology calculations.",
      },
    };
  }

  const analysis = analyzeNameLetters(normalizedName);

  if (!analysis) {
    return {
      success: false,
      error: {
        code: "INVALID_NAME_INPUT",
        message: "Name must include alphabetic characters for numerology.",
      },
    };
  }

  const corePack = buildCoreNumerologyCalculations({
    dateOfBirth: parsedDate.dateOfBirth,
    normalizedName,
    parsedDate,
    analysis,
    strictNameRequired: true,
  });
  const summary = buildLegacySummary(
    buildInterpretation(
      corePack.coreCalculations
        .filter((item) => item.number !== null)
        .map((item) => toInsight(item.number ?? 0))
        .filter((insight) => insight.number !== 0)
    )
  );

  return {
    success: true,
    data: {
      dateOfBirth: parsedDate.dateOfBirth,
      normalizedName,
      inputSummary: [
        `Date of Birth: ${parsedDate.dateOfBirth}`,
        `Full Name: ${normalizedName}`,
      ],
      coreCalculations: corePack.coreCalculations,
      luckyNumbers: corePack.luckyNumbers,
      summary,
      missingReason: null,
    },
  };
}

function calculateNameBasedUtilityContext(input: {
  utilityType: Exclude<
    NumerologyUtilityType,
    "vehicle_number_numerology" | "mobile_number_numerology" | "name_dob_compatibility"
  >;
  value: string | null | undefined;
  label: string;
  missingCode: NumerologyUtilityFailureCode;
  missingMessage: string;
  inputLabel: string;
  basisLabel: string;
  safeSummaryLabel: string;
  suggestionNotes: string[];
}): NumerologyUtilityContextResult {
  const normalizedValue = normalizeName(input.value);

  if (!normalizedValue) {
    return failUtility(input.missingCode, input.missingMessage);
  }

  const nameNumber = calculateNameNumber(normalizedValue);

  if (!nameNumber) {
    return failUtility(
      input.missingCode,
      `${input.inputLabel} must include alphabetic characters for numerology.`
    );
  }

  const insight = toInsight(nameNumber.coreNumber);

  return {
    success: true,
    data: buildUtilitySummary(
      input.utilityType,
      input.label,
      insight.number,
      [nameNumber.compoundNumber, nameNumber.coreNumber],
      [`${input.inputLabel}: ${normalizedValue}`],
      [
        `Derived from the letter values in the ${input.basisLabel}.`,
        "This is a practical reference number, not a deterministic prediction.",
      ],
      [...insight.strengths.slice(0, 3)],
      [...insight.cautionAreas.slice(0, 3)],
      [
        ...input.suggestionNotes,
        "Use this as an optional comparison point alongside real-world factors.",
      ],
      `${input.safeSummaryLabel} ${insight.number} offers a calm, optional reference for reflection and planning.`
    ),
  };
}

function calculateNumberStringUtilityContext(input: {
  utilityType: "vehicle_number_numerology" | "mobile_number_numerology";
  value: string | number | null | undefined;
  label: string;
  missingCode: NumerologyUtilityFailureCode;
  missingMessage: string;
  inputLabel: string;
  basisLabel: string;
  safeSummaryLabel: string;
  suggestionNotes: string[];
}): NumerologyUtilityContextResult {
  const analyzed = analyzeNumericString(input.value);

  if (!analyzed) {
    return failUtility(input.missingCode, input.missingMessage);
  }

  const insight = toInsight(analyzed.coreNumber);

  return {
    success: true,
    data: buildUtilitySummary(
      input.utilityType,
      input.label,
      insight.number,
      [analyzed.compoundNumber, analyzed.coreNumber],
      [`${input.inputLabel}: ${analyzed.digits}`],
      [
        `Derived from the digit string in the ${input.basisLabel}.`,
        "This is an optional numerology reference only.",
      ],
      [...insight.strengths.slice(0, 3)],
      [...insight.cautionAreas.slice(0, 3)],
      [
        ...input.suggestionNotes,
        "Use practical constraints such as safety, budget, and convenience first.",
      ],
      `${input.safeSummaryLabel} ${insight.number} offers a light planning reference without guaranteeing outcomes.`
    ),
  };
}

function calculateNameDobCompatibilityUtilityContext(input: {
  fullName: string | null | undefined;
  dateOfBirth: string | null | undefined;
}): NumerologyUtilityContextResult {
  const normalizedName = normalizeName(input.fullName);

  if (!normalizedName) {
    return failUtility(
      "MISSING_FULL_NAME",
      "Full name is required for compatibility comparison."
    );
  }

  if (!input.dateOfBirth?.trim()) {
    return failUtility(
      "MISSING_DATE_OF_BIRTH",
      "Date of birth is required for compatibility comparison."
    );
  }

  const coreResult = calculateCoreNumerologyContext({
    dateOfBirth: input.dateOfBirth,
    fullName: normalizedName,
  });

  if (!coreResult.success) {
    return failUtility(coreResult.error.code, coreResult.error.message);
  }

  const nameCalculation = coreResult.data.coreCalculations.find(
    (item) => item.calculationType === "destiny_expression_number"
  );
  const lifePathCalculation = coreResult.data.coreCalculations.find(
    (item) => item.calculationType === "life_path_number"
  );

  if (
    !nameCalculation ||
    !lifePathCalculation ||
    nameCalculation.number === null ||
    lifePathCalculation.number === null
  ) {
    return failUtility(
      "MISSING_COMPATIBILITY_INPUT",
      "Compatibility comparison requires both a readable name and a valid date of birth."
    );
  }

  const nameNumber = nameCalculation.number;
  const lifePathNumber = lifePathCalculation.number;
  const compatibilityScore = buildCompatibilityScore(
    nameNumber,
    lifePathNumber
  );
  const compatibilityInsight = toInsight(compatibilityScore);
  const strengthNotes = mergeUnique(
    [
      ...(compatibilityScore >= 8
        ? ["The name and DOB numbers sit in a close resonance band."]
        : ["The name and DOB numbers can still work well with clear planning."]),
      ...compatibilityInsight.strengths.slice(0, 2),
      "Use this as a reflective comparison, not as a final decision rule.",
    ],
    4
  );
  const cautionNotes = mergeUnique(
    [
      ...(compatibilityScore <= 4
        ? ["Different numerology rhythms may need more explicit coordination."]
        : ["Keep practical planning in the loop for major decisions."]),
      ...compatibilityInsight.cautionAreas.slice(0, 2),
    ],
    4
  );

  return {
    success: true,
    data: buildUtilitySummary(
      "name_dob_compatibility",
      "Name / DOB Compatibility Index",
      compatibilityScore,
      [
        nameNumber,
        lifePathNumber,
      ],
      [
        `Full Name: ${normalizedName}`,
        `Date of Birth: ${coreResult.data.dateOfBirth}`,
      ],
      [
        "Compares the name-derived number with the DOB life-path number.",
        "The score is a practical harmony index, not a prediction of relationship or career outcomes.",
      ],
      strengthNotes,
      cautionNotes,
      [
        "Use this comparison only as a light alignment check.",
        "Validate major decisions with communication, timing, and real-world planning.",
      ],
      `Name / DOB Compatibility Index ${compatibilityScore} is a calm harmony reference for reflection only.`
    ),
  };
}

export function calculateNumerologyUtilityContext(
  input: NumerologyUtilityInput
): NumerologyUtilityContextResult {
  switch (input.utilityType) {
    case "name_numerology":
      return calculateNameBasedUtilityContext({
        utilityType: input.utilityType,
        value: input.fullName,
        label: "Name Number",
        missingCode: "MISSING_FULL_NAME",
        missingMessage: "Full name is required for name numerology.",
        inputLabel: "Full Name",
        basisLabel: "full name",
        safeSummaryLabel: "Name Number",
        suggestionNotes: [
          "Use the number as a soft reference when comparing naming options.",
          "Keep pronunciation, clarity, and branding practicality in the decision set.",
        ],
      });
    case "business_name_numerology":
      return calculateNameBasedUtilityContext({
        utilityType: input.utilityType,
        value: input.businessName,
        label: "Business Name Number",
        missingCode: "MISSING_BUSINESS_NAME",
        missingMessage: "Business name is required for business numerology.",
        inputLabel: "Business Name",
        basisLabel: "business name",
        safeSummaryLabel: "Business Name Number",
        suggestionNotes: [
          "Use the number as a naming reference alongside market clarity and legal availability.",
          "Do not force a brand change solely for numerology.",
        ],
      });
    case "vehicle_number_numerology":
      return calculateNumberStringUtilityContext({
        utilityType: input.utilityType,
        value: input.vehicleNumber,
        label: "Vehicle Number",
        missingCode: "MISSING_VEHICLE_NUMBER",
        missingMessage: "Vehicle number is required for vehicle numerology.",
        inputLabel: "Vehicle Number",
        basisLabel: "vehicle number",
        safeSummaryLabel: "Vehicle Number",
        suggestionNotes: [
          "Treat this as an optional reference only.",
          "Safety, registration, and budget matter more than the number itself.",
        ],
      });
    case "mobile_number_numerology":
      return calculateNumberStringUtilityContext({
        utilityType: input.utilityType,
        value: input.mobileNumber,
        label: "Mobile Number",
        missingCode: "MISSING_MOBILE_NUMBER",
        missingMessage: "Mobile number is required for mobile numerology.",
        inputLabel: "Mobile Number",
        basisLabel: "mobile number",
        safeSummaryLabel: "Mobile Number",
        suggestionNotes: [
          "Treat this as a convenience reference only.",
          "Coverage, cost, and usability should remain the primary selection factors.",
        ],
      });
    case "name_dob_compatibility":
      return calculateNameDobCompatibilityUtilityContext({
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
      });
    default:
      return failUtility(
        "MISSING_COMPATIBILITY_INPUT",
        "Unsupported numerology utility type."
      );
  }
}
