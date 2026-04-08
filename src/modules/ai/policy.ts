import type {
  ChartInterpretationRequest,
  ChartInterpretationResult,
} from "@/modules/ai/types";

export const aiPolicyRuleKeys = [
  "NO_AI_CHART_MATH",
  "NO_UNSUPPORTED_REMEDY_INVENTION",
  "NO_MEDICAL_LEGAL_FINANCIAL_CLAIMS",
  "NO_FEAR_BASED_OUTPUT",
] as const;

export type AiPolicyRuleKey = (typeof aiPolicyRuleKeys)[number];

export type AiPolicyViolation = {
  rule: AiPolicyRuleKey;
  message: string;
  match: string;
};

export type AiPolicyAssessment = {
  passed: boolean;
  violations: AiPolicyViolation[];
};

const chartMathPatterns = [
  /\bi calculated\b/i,
  /\bwe calculated\b/i,
  /\bcalculated your (chart|placements|houses)\b/i,
  /\bcomputed your (chart|placements|aspects)\b/i,
  /\bderived from ephemeris\b/i,
];

const unsupportedRemedyPatterns = [
  /\byou must (wear|buy|purchase|order)\b/i,
  /\bcheckout\b/i,
  /\badd to cart\b/i,
  /\bguaranteed remedy\b/i,
];

const claimsPatterns = [
  /\bthis is medical advice\b/i,
  /\bthis is legal advice\b/i,
  /\bthis is financial advice\b/i,
  /\bguaranteed outcome\b/i,
  /\bwill definitely happen\b/i,
];

const fearPatterns = [
  /\bcurse\b/i,
  /\bdoom(ed)?\b/i,
  /\bcatastroph(e|ic)\b/i,
  /\bdisaster\b/i,
  /\bruin\b/i,
  /\bsevere danger\b/i,
];

function collectPatternViolations(
  text: string,
  patterns: readonly RegExp[],
  rule: AiPolicyRuleKey,
  message: string
) {
  const violations: AiPolicyViolation[] = [];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[0]) {
      violations.push({
        rule,
        message,
        match: match[0],
      });
    }
  }

  return violations;
}

export function assessAiTextPolicy(text: string): AiPolicyAssessment {
  const normalizedText = text.trim();

  return {
    passed: !normalizedText
      ? false
      : [
            ...collectPatternViolations(
              normalizedText,
              chartMathPatterns,
              "NO_AI_CHART_MATH",
              "AI output appears to claim direct chart calculations."
            ),
            ...collectPatternViolations(
              normalizedText,
              unsupportedRemedyPatterns,
              "NO_UNSUPPORTED_REMEDY_INVENTION",
              "AI output appears to prescribe unsupported remedy or commerce actions."
            ),
            ...collectPatternViolations(
              normalizedText,
              claimsPatterns,
              "NO_MEDICAL_LEGAL_FINANCIAL_CLAIMS",
              "AI output includes disallowed medical, legal, or financial certainty claims."
            ),
            ...collectPatternViolations(
              normalizedText,
              fearPatterns,
              "NO_FEAR_BASED_OUTPUT",
              "AI output appears to use fear-based language."
            ),
          ].length === 0,
    violations: !normalizedText
      ? [
          {
            rule: "NO_FEAR_BASED_OUTPUT",
            message: "AI output was empty and could not be validated safely.",
            match: "empty-response",
          },
        ]
      : [
          ...collectPatternViolations(
            normalizedText,
            chartMathPatterns,
            "NO_AI_CHART_MATH",
            "AI output appears to claim direct chart calculations."
          ),
          ...collectPatternViolations(
            normalizedText,
            unsupportedRemedyPatterns,
            "NO_UNSUPPORTED_REMEDY_INVENTION",
            "AI output appears to prescribe unsupported remedy or commerce actions."
          ),
          ...collectPatternViolations(
            normalizedText,
            claimsPatterns,
            "NO_MEDICAL_LEGAL_FINANCIAL_CLAIMS",
            "AI output includes disallowed medical, legal, or financial certainty claims."
          ),
          ...collectPatternViolations(
            normalizedText,
            fearPatterns,
            "NO_FEAR_BASED_OUTPUT",
            "AI output appears to use fear-based language."
          ),
        ],
  };
}

function getPolicyText(result: ChartInterpretationResult) {
  return [
    result.summary,
    ...result.sections.map((section) => section.body),
    result.caution,
  ]
    .join("\n")
    .trim();
}

export function assessChartInterpretationPolicy(
  request: ChartInterpretationRequest,
  result: ChartInterpretationResult
): AiPolicyAssessment {
  const text = getPolicyText(result);
  const baseAssessment = assessAiTextPolicy(text);
  const violations: AiPolicyViolation[] = [...baseAssessment.violations];

  if (!request.chart.metadata.deterministic) {
    violations.push({
      rule: "NO_AI_CHART_MATH",
      message: "Chart input must originate from deterministic provider metadata.",
      match: "deterministic=false",
    });
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
