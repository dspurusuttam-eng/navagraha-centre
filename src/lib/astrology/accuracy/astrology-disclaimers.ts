import type { PredictionConfidenceLevel } from "@/lib/astrology/accuracy/confidence-score";

type LocalizedCopy = {
  disclaimer: string;
  missingBirthDetails: string;
  incompleteData: string;
  confidenceSuffix: string;
};

const localizedDisclaimers: Record<string, LocalizedCopy> = {
  en: {
    disclaimer:
      "Predictions are based on Vedic astrology principles and the birth details provided. They are intended for guidance and reflection, not as a substitute for professional medical, legal, or financial advice.",
    missingBirthDetails:
      "For accurate personalized analysis, please provide date, time, and place of birth.",
    incompleteData:
      "Some required astrology inputs are incomplete, so only validated sections are shown.",
    confidenceSuffix: "based on available birth details.",
  },
  as: {
    disclaimer:
      "এই বিশ্লেষণ বৈদিক জ্যোতিষৰ নীতি আৰু দিয়া জন্মতথ্যৰ ভিত্তিত প্ৰস্তুত কৰা হৈছে। ই পথনির্দেশ আৰু চিন্তনৰ বাবে, চিকিৎসা, আইন বা আৰ্থিক পেশাগত পৰামৰ্শৰ বিকল্প নহয়।",
    missingBirthDetails:
      "ব্যক্তিগত জন্মকুণ্ডলীভিত্তিক সঠিক বিশ্লেষণৰ বাবে জন্ম তাৰিখ, জন্ম সময় আৰু জন্মস্থান প্ৰয়োজন।",
    incompleteData:
      "কিছুমান প্ৰয়োজনীয় জ্যোতিষ তথ্য অসম্পূৰ্ণ, সেয়েহে কেৱল যাচাইকৃত অংশ দেখুওৱা হৈছে।",
    confidenceSuffix: "উপলব্ধ জন্মতথ্যৰ ভিত্তিত।",
  },
  hi: {
    disclaimer:
      "यह विश्लेषण वैदिक ज्योतिष सिद्धांतों और दिए गए जन्म विवरणों के आधार पर तैयार किया गया है। यह मार्गदर्शन और चिंतन के लिए है, चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं है।",
    missingBirthDetails:
      "सटीक व्यक्तिगत विश्लेषण के लिए कृपया जन्म तिथि, समय और जन्म स्थान प्रदान करें।",
    incompleteData:
      "कुछ आवश्यक ज्योतिषीय जानकारी अपूर्ण है, इसलिए केवल सत्यापित भाग दिखाए जा रहे हैं।",
    confidenceSuffix: "उपलब्ध जन्म विवरण के आधार पर।",
  },
};

function resolveLocalizedCopy(locale?: string | null): LocalizedCopy {
  const normalized = locale?.toLowerCase();

  if (normalized && normalized in localizedDisclaimers) {
    return localizedDisclaimers[normalized]!;
  }

  return localizedDisclaimers.en;
}

export function getAstrologyDisclaimer(locale?: string | null) {
  return resolveLocalizedCopy(locale).disclaimer;
}

export function getMissingBirthDetailsFallback(locale?: string | null) {
  return resolveLocalizedCopy(locale).missingBirthDetails;
}

export function getIncompleteDataFallback(locale?: string | null) {
  return resolveLocalizedCopy(locale).incompleteData;
}

export function formatConfidenceLine(input: {
  locale?: string | null;
  level: PredictionConfidenceLevel;
}): string {
  const copy = resolveLocalizedCopy(input.locale);
  const levelLabel =
    input.locale?.toLowerCase() === "as"
      ? input.level === "HIGH"
        ? "উচ্চ"
        : input.level === "MEDIUM"
          ? "মধ্যম"
          : input.level === "LOW"
            ? "নিম্ন"
            : "অসম্পূৰ্ণ"
      : input.locale?.toLowerCase() === "hi"
        ? input.level === "HIGH"
          ? "उच्च"
          : input.level === "MEDIUM"
            ? "मध्यम"
            : input.level === "LOW"
              ? "निम्न"
              : "अपूर्ण"
        : input.level;

  if (input.locale?.toLowerCase() === "as") {
    return `ভৱিষ্যদ্বাণীৰ বিশ্বাসযোগ্যতা: ${levelLabel} — ${copy.confidenceSuffix}`;
  }

  if (input.locale?.toLowerCase() === "hi") {
    return `भविष्यवाणी विश्वसनीयता: ${levelLabel} — ${copy.confidenceSuffix}`;
  }

  return `Prediction Confidence: ${levelLabel} — ${copy.confidenceSuffix}`;
}
