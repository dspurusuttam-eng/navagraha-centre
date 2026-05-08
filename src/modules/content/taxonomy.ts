import { getLocaleDefinition } from "@/modules/localization/config";
import type { ContentType } from "@/modules/content/types";

export const contentCategoryOrder = [
  "Daily Rashifal",
  "Monthly Rashifal",
  "Panchang",
  "Remedies",
  "Graha",
  "Nakshatra",
  "Kundli",
  "Marriage",
  "Career",
  "Finance",
  "Health",
  "Spiritual Guidance",
  "Vedic Astrology",
  "Compatibility",
  "Gemstones",
  "Numerology",
] as const;

export const contentTagOrder = [
  "zodiac signs",
  "planets",
  "dasha",
  "transit",
  "remedies",
  "Assamese",
  "Vedic astrology",
] as const;

export const publicArticleTypes = [
  "BLOG_ARTICLE",
  "MONTHLY_FORECAST",
  "DAILY_HOROSCOPE",
  "REMEDIES_ARTICLE",
  "SERVICE_PAGE",
  "FAQ_PAGE",
] as const satisfies readonly ContentType[];

const publicArticleTypeSet = new Set<ContentType>(publicArticleTypes);

export function isPublicArticleType(
  type: ContentType
): type is (typeof publicArticleTypes)[number] {
  return publicArticleTypeSet.has(type);
}

export function getContentLanguageLabel(locale?: string | null) {
  return getLocaleDefinition(locale).label;
}

export function getContentLanguageNativeLabel(locale?: string | null) {
  return getLocaleDefinition(locale).nativeLabel;
}
