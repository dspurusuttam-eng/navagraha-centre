export type PredictionConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "INCOMPLETE";

export type PredictionConfidenceInput = {
  hasBirthDate: boolean;
  hasBirthTime: boolean;
  hasBirthPlace: boolean;
  hasCoordinates: boolean;
  hasTimezone: boolean;
  isBirthTimeApproximate: boolean;
  chartVerified: boolean;
  astrologyDataComplete: boolean;
};

export type PredictionConfidenceResult = {
  level: PredictionConfidenceLevel;
  score: number;
  reasons: string[];
};

export function calculatePredictionConfidence(
  input: PredictionConfidenceInput
): PredictionConfidenceResult {
  const reasons: string[] = [];
  let score = 0;

  if (!input.hasBirthDate || !input.hasBirthPlace) {
    return {
      level: "INCOMPLETE",
      score: 0,
      reasons: [
        "Birth date and place are required for personalized astrology confidence.",
      ],
    };
  }

  if (!input.hasBirthTime) {
    reasons.push("Birth time is missing, so house-level precision is limited.");
    score -= 35;
  } else {
    score += 20;
  }

  if (input.isBirthTimeApproximate) {
    reasons.push("Birth time appears approximate, reducing timing precision.");
    score -= 15;
  }

  if (input.hasCoordinates) {
    score += 10;
  } else {
    reasons.push("Coordinates are unavailable, reducing location precision.");
    score -= 10;
  }

  if (input.hasTimezone) {
    score += 10;
  } else {
    reasons.push("Timezone is missing or unresolved.");
    score -= 20;
  }

  if (input.chartVerified) {
    score += 25;
  } else {
    reasons.push("Chart verification status is below the trusted threshold.");
    score -= 25;
  }

  if (input.astrologyDataComplete) {
    score += 20;
  } else {
    reasons.push("Astrology data completeness checks found missing fields.");
    score -= 30;
  }

  const boundedScore = Math.max(0, Math.min(100, score + 50));
  let level: PredictionConfidenceLevel = "MEDIUM";

  if (boundedScore >= 75) {
    level = "HIGH";
  } else if (boundedScore >= 50) {
    level = "MEDIUM";
  } else if (boundedScore > 0) {
    level = "LOW";
  } else {
    level = "INCOMPLETE";
  }

  return {
    level,
    score: boundedScore,
    reasons,
  };
}

export function mapAssistantConfidenceToLevel(value: "high" | "medium" | "low") {
  if (value === "high") {
    return "HIGH" as const;
  }

  if (value === "medium") {
    return "MEDIUM" as const;
  }

  return "LOW" as const;
}

export function formatPredictionConfidenceLabel(input: {
  locale: string;
  level: PredictionConfidenceLevel;
}): string {
  const locale = input.locale.toLowerCase();

  if (locale === "as") {
    switch (input.level) {
      case "HIGH":
        return "ভৱিষ্যদ্বাণীৰ বিশ্বাসযোগ্যতা: উচ্চ";
      case "MEDIUM":
        return "ভৱিষ্যদ্বাণীৰ বিশ্বাসযোগ্যতা: মধ্যম";
      case "LOW":
        return "ভৱিষ্যদ্বাণীৰ বিশ্বাসযোগ্যতা: নিম্ন";
      default:
        return "ভৱিষ্যদ্বাণীৰ বিশ্বাসযোগ্যতা: অসম্পূৰ্ণ";
    }
  }

  if (locale === "hi") {
    switch (input.level) {
      case "HIGH":
        return "भविष्यवाणी विश्वसनीयता: उच्च";
      case "MEDIUM":
        return "भविष्यवाणी विश्वसनीयता: मध्यम";
      case "LOW":
        return "भविष्यवाणी विश्वसनीयता: निम्न";
      default:
        return "भविष्यवाणी विश्वसनीयता: अपूर्ण";
    }
  }

  return `Prediction Confidence: ${input.level}`;
}
