import { resolvePredictionLocale } from "@/lib/astrology/accuracy";

type SafeLocalizedMessage = {
  en: string;
  as: string;
  hi: string;
};

const aiUnavailableMessage: SafeLocalizedMessage = {
  en: "AI guidance is temporarily unavailable. Please try again later.",
  as: "AI জ্যোতিষীয় পথনির্দেশ এই মুহূৰ্তত উপলব্ধ নহয়। অনুগ্ৰহ কৰি পিছত আকৌ চেষ্টা কৰক।",
  hi: "AI ज्योतिषीय मार्गदर्शन अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।",
};

const genericUnexpectedMessage: SafeLocalizedMessage = {
  en: "Something went wrong. Please try again.",
  as: "এটা অপ্রত্যাশিত ত্ৰুটি ঘটিছে। অনুগ্ৰহ কৰি আকৌ চেষ্টা কৰক।",
  hi: "एक अप्रत्याशित त्रुटि हुई है। कृपया पुनः प्रयास करें।",
};

const invalidInputMessage: SafeLocalizedMessage = {
  en: "The submitted input is invalid.",
  as: "দাখল কৰা তথ্য বৈধ নহয়।",
  hi: "दिया गया इनपुट मान्य नहीं है।",
};

function pickMessage(localeInput: string | null | undefined, dictionary: SafeLocalizedMessage) {
  const locale = resolvePredictionLocale(localeInput);

  if (locale === "as") {
    return dictionary.as;
  }

  if (locale === "hi") {
    return dictionary.hi;
  }

  return dictionary.en;
}

export function getAiTemporarilyUnavailableMessage(localeInput?: string | null) {
  return pickMessage(localeInput, aiUnavailableMessage);
}

export function getGenericSafeErrorMessage(localeInput?: string | null) {
  return pickMessage(localeInput, genericUnexpectedMessage);
}

export function getInvalidInputSafeMessage(localeInput?: string | null) {
  return pickMessage(localeInput, invalidInputMessage);
}
