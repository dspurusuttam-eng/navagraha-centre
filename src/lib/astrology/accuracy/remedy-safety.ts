export type RemedySafetyViolation = {
  rule: string;
  message: string;
  match: string;
  severity: "high" | "medium";
};

export type RemedySafetyAssessment = {
  passed: boolean;
  violations: RemedySafetyViolation[];
};

const unsafeRemedyPatterns = [
  {
    rule: "NO_DANGEROUS_RITUAL",
    message: "Unsafe or harmful ritual guidance is not allowed.",
    severity: "high" as const,
    patterns: [
      /\bblack magic\b/i,
      /\banimal harm\b/i,
      /\banimal sacrifice\b/i,
      /\bunsafe fire\b/i,
      /\bself[- ]harm\b/i,
    ],
  },
  {
    rule: "NO_MEDICAL_REPLACEMENT",
    message: "Remedies cannot replace medical care.",
    severity: "high" as const,
    patterns: [
      /\bstop medicine\b/i,
      /\bavoid doctor\b/i,
      /\bmedical treatment is unnecessary\b/i,
      /\bthis will cure all disease\b/i,
    ],
  },
  {
    rule: "NO_FORCED_EXPENSIVE_REMEDY",
    message: "Costly remedies must never be framed as mandatory.",
    severity: "high" as const,
    patterns: [
      /\bmust buy\b/i,
      /\bmandatory gemstone\b/i,
      /\bexpensive ritual is required\b/i,
      /\bpay now for remedy\b/i,
    ],
  },
  {
    rule: "FASTING_CAUTION_REQUIRED",
    message:
      "Fasting suggestions must remain optional with caution for vulnerable groups.",
    severity: "medium" as const,
    patterns: [/\bstrict fasting for all\b/i, /\bno food regardless of health\b/i],
  },
];

export const remedySafetyGuidelines = [
  "Prefer simple remedies: mantra, prayer, meditation, charity, diya lighting, and disciplined routine.",
  "Keep gemstones optional and consultative.",
  "Never pressure purchases; shop links are optional support only.",
  "Avoid extreme ritual claims, fear messaging, or guaranteed cure wording.",
] as const;

export const gemstoneSafetyNote =
  "Gemstone should be selected only after proper chart analysis.";

export function assessRemedySafety(text: string): RemedySafetyAssessment {
  const normalized = text.trim();

  if (!normalized) {
    return {
      passed: true,
      violations: [],
    };
  }

  const violations: RemedySafetyViolation[] = [];

  for (const group of unsafeRemedyPatterns) {
    for (const pattern of group.patterns) {
      const match = normalized.match(pattern);

      if (!match?.[0]) {
        continue;
      }

      violations.push({
        rule: group.rule,
        message: group.message,
        severity: group.severity,
        match: match[0],
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

export function buildSafeRemedyFallback(locale: string) {
  const normalized = locale.toLowerCase();

  if (normalized === "as") {
    return "উপায়সমূহ সহায়ক অনুশীলন। ব্যক্তিগত অৱস্থাৰ বাবে স্বাস্থ্য বা বিশেষজ্ঞ পৰামৰ্শৰ লগত মিলাই লওক।";
  }

  if (normalized === "hi") {
    return "उपाय सहायक अभ्यास हैं। व्यक्तिगत स्थिति के अनुसार स्वास्थ्य/विशेषज्ञ सलाह के साथ ही अपनाएँ।";
  }

  return "Remedies are supportive practices. Align them with personal health conditions and expert advice when needed.";
}
