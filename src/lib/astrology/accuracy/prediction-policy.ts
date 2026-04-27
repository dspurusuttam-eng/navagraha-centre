export type PredictionPolicyViolation = {
  rule: string;
  message: string;
  match: string;
  severity: "high" | "medium" | "low";
};

export type PredictionPolicyAssessment = {
  passed: boolean;
  violations: PredictionPolicyViolation[];
};

const guaranteedOutcomePatterns = [
  /\b100%\b/i,
  /\bdefinitely\b/i,
  /\bwill surely\b/i,
  /\bguaranteed\b/i,
  /\babsolute certainty\b/i,
  /অৱশ্যেই হ['’]ব/i,
  /শতভাগ নিশ্চিত/i,
  /ज़रूर होगा/i,
  /शत-?प्रतिशत/i,
];

const fearPatterns = [
  /\bterrible danger\b/i,
  /\bcatastrophic\b/i,
  /\blife (is|will be) ruined\b/i,
  /\bdoom\b/i,
  /ভয়ংকৰ বিপদ/i,
  /জীৱন নষ্ট হ['’]ব/i,
  /निश्चित नुकसान/i,
  /भयावह/i,
];

const disallowedClaimsPatterns = [
  /\bdeath prediction\b/i,
  /\byou will die\b/i,
  /\bterminal disease\b/i,
  /\bcourt case (will|shall) win\b/i,
  /\blottery (win|guarantee)\b/i,
  /\bmedical cure\b/i,
  /\blegal certainty\b/i,
  /\bfinancial certainty\b/i,
];

const manipulativeRemedyPatterns = [
  /\bmust buy\b/i,
  /\bexpensive remedy\b/i,
  /\bpay immediately\b/i,
  /\bonly this ritual can save\b/i,
  /এইটো নকৰিলে ক্ষতি নিশ্চিত/i,
  /अभी खरीदना जरूरी है/i,
];

const harmfulRitualPatterns = [
  /\bblack magic\b/i,
  /\banimal sacrifice\b/i,
  /\bself harm\b/i,
  /\bdangerous fire ritual\b/i,
];

function collectViolations(
  text: string,
  patterns: readonly RegExp[],
  violation: Omit<PredictionPolicyViolation, "match">
) {
  const matches: PredictionPolicyViolation[] = [];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match?.[0]) {
      continue;
    }

    matches.push({
      ...violation,
      match: match[0],
    });
  }

  return matches;
}

export const predictionPolicyRules = {
  avoidGuarantees:
    "Avoid deterministic language. Frame outcomes as possibilities, tendencies, and guidance.",
  avoidFear:
    "Avoid fear-driven language, panic framing, and psychological pressure.",
  avoidHighRiskClaims:
    "Do not provide death, severe disease, legal, or guaranteed financial outcomes.",
  avoidManipulativeRemedies:
    "Do not pressure purchases or expensive remedies as mandatory.",
  avoidHarmfulRituals:
    "Do not suggest harmful rituals, unsafe acts, or exploitative practices.",
} as const;

export function assessPredictionPolicy(text: string): PredictionPolicyAssessment {
  const normalized = text.trim();

  if (!normalized) {
    return {
      passed: false,
      violations: [
        {
          rule: "EMPTY_OUTPUT",
          message: "Output is empty and cannot pass prediction safety validation.",
          match: "empty",
          severity: "high",
        },
      ],
    };
  }

  const violations = [
    ...collectViolations(normalized, guaranteedOutcomePatterns, {
      rule: "NO_GUARANTEED_CLAIMS",
      message: "Prediction includes deterministic or guaranteed language.",
      severity: "high",
    }),
    ...collectViolations(normalized, fearPatterns, {
      rule: "NO_FEAR_BASED_LANGUAGE",
      message: "Prediction includes fear-based wording.",
      severity: "high",
    }),
    ...collectViolations(normalized, disallowedClaimsPatterns, {
      rule: "NO_MEDICAL_LEGAL_FINANCIAL_CERTAINTY",
      message:
        "Prediction includes disallowed medical/legal/financial certainty.",
      severity: "high",
    }),
    ...collectViolations(normalized, manipulativeRemedyPatterns, {
      rule: "NO_MANIPULATIVE_REMEDY_PRESSURE",
      message: "Prediction includes manipulative remedy or purchase pressure.",
      severity: "high",
    }),
    ...collectViolations(normalized, harmfulRitualPatterns, {
      rule: "NO_HARMFUL_RITUALS",
      message: "Prediction includes unsafe ritual guidance.",
      severity: "high",
    }),
  ];

  return {
    passed: violations.length === 0,
    violations,
  };
}

export function getAllowedToneGuidance(locale: string) {
  const normalized = locale.toLowerCase();

  if (normalized === "as") {
    return [
      "ভাষা শান্ত, বাস্তৱমুখী আৰু সন্মানজনক ৰাখক।",
      "নিশ্চিত দাবীৰ সলনি সম্ভাৱনা-ভিত্তিক ভাষা ব্যৱহাৰ কৰক।",
      "উদ্বেগ সৃষ্টি কৰা শব্দ পৰিহাৰ কৰক।",
      "সহায়ক উপায়বোৰ বাধ্যতামূলক নহয় বুলি স্পষ্ট কৰক।",
    ];
  }

  if (normalized === "hi") {
    return [
      "भाषा संतुलित, स्पष्ट और गैर-डराने वाली रखें।",
      "निश्चित दावों के बजाय संभावनात्मक मार्गदर्शन दें।",
      "उपायों को वैकल्पिक और सहायक रूप में प्रस्तुत करें।",
      "अत्यधिक नकारात्मक या आक्रामक टोन से बचें।",
    ];
  }

  return [
    "Use balanced, guidance-first language.",
    "Present outcomes as tendencies or timing context, not certainty.",
    "Keep remedies optional, safe, and non-pressuring.",
    "Avoid fear-heavy or manipulative phrasing.",
  ];
}
