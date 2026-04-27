import {
  defaultLocale,
  getEnabledLocales,
  getLocalizedPath,
  getLocaleDefinition,
  type SupportedLocale,
} from "@/modules/localization/config";

type CoreSeoLocaleCopy = {
  title: string;
  description: string;
};

export type CoreSeoPageKey =
  | "home"
  | "kundli"
  | "compatibility"
  | "rashifal"
  | "panchang"
  | "numerology"
  | "navagrahaAi"
  | "reports"
  | "consultation"
  | "shop"
  | "fromTheDesk";

function normalizeSiteUrl(value?: string | null) {
  const raw = (value ?? "").trim();

  if (!raw) {
    return "https://navagrahacentre.com";
  }

  try {
    const parsed = new URL(raw);
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return "https://navagrahacentre.com";
  }
}

function sanitizeSocialUrl(value?: string | null) {
  const raw = (value ?? "").trim();

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).toString();
  } catch {
    return null;
  }
}

export const seoConfig = {
  siteName: "NAVAGRAHA CENTRE",
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  defaultLocale,
  supportedLocales: getEnabledLocales().map((locale) => locale.code),
  primaryLocales: ["as", "hi", "en"] as const,
  defaultTitle:
    "NAVAGRAHA CENTRE | AI Vedic Astrology, Kundli, Rashifal & Panchang",
  titleTemplate: "%s | NAVAGRAHA CENTRE",
  defaultDescription:
    "Discover AI-powered Vedic astrology with Kundli, Rashifal, Panchang, Numerology, Compatibility, Reports and expert guidance from NAVAGRAHA CENTRE.",
  defaultOpenGraphImage: "/og-default.svg",
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? "@navagrahacentre",
  brandKeywords: [
    "NAVAGRAHA CENTRE",
    "Vedic Astrology",
    "Kundli",
    "Rashifal",
    "Panchang",
    "Numerology",
    "Marriage Compatibility",
    "Astrology Consultation",
    "J P Sarmah",
  ] as const,
  organization: {
    name: "NAVAGRAHA CENTRE",
    legalName: "NAVAGRAHA CENTRE",
    founderName: "J P Sarmah",
    authorName: "J P Sarmah",
    authorTitle: "Vedic Astrologer and Spiritual Guide",
    contactPagePath: "/contact",
    logoPath: "/og-default.svg",
    serviceArea: ["Assam", "India", "Worldwide (Online)"] as const,
    serviceTypes: [
      "Kundli Analysis",
      "Daily Rashifal",
      "Panchang",
      "Marriage Compatibility",
      "Numerology",
      "Astrology Reports",
      "Astrology Consultation",
      "Gemstone Guidance",
    ] as const,
    location: {
      locality: "North Lakhimpur",
      region: "Assam",
      country: "India",
    },
    sameAs: [
      sanitizeSocialUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL),
      sanitizeSocialUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL),
      sanitizeSocialUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
      sanitizeSocialUrl(process.env.NEXT_PUBLIC_X_URL),
      sanitizeSocialUrl(process.env.NEXT_PUBLIC_WHATSAPP_URL),
    ].filter((value): value is string => Boolean(value)),
  },
} as const;

const coreSeoCopyByLocale: Record<
  SupportedLocale,
  Partial<Record<CoreSeoPageKey, CoreSeoLocaleCopy>>
> = {
  en: {
    home: {
      title:
        "NAVAGRAHA CENTRE | AI Vedic Astrology, Kundli, Rashifal & Panchang",
      description:
        "Discover AI-powered Vedic astrology with Kundli, Rashifal, Panchang, Numerology, Compatibility, Reports and expert guidance from NAVAGRAHA CENTRE.",
    },
    kundli: {
      title: "Free Kundli & AI Birth Chart Analysis | NAVAGRAHA CENTRE",
      description:
        "Generate your Kundli with Vedic astrology insights, planetary positions, Lagna, Rashi, Navamsa guidance and AI-powered interpretation.",
    },
    compatibility: {
      title: "Marriage Compatibility & Guna Milan | NAVAGRAHA CENTRE",
      description:
        "Check Vedic marriage compatibility with Guna Milan, birth chart matching and relationship guidance.",
    },
    rashifal: {
      title: "Daily Rashifal & Horoscope | NAVAGRAHA CENTRE",
      description:
        "Read daily Rashifal with Vedic astrology guidance for all zodiac signs, including love, career, business, lucky color and remedies.",
    },
    panchang: {
      title: "Daily Panchang | Tithi, Nakshatra, Yoga & Muhurat | NAVAGRAHA CENTRE",
      description:
        "Check daily Panchang with Tithi, Nakshatra, Yoga, Karana, sunrise, sunset and auspicious guidance.",
    },
    numerology: {
      title: "Numerology Analysis | Name & Birth Date Reading | NAVAGRAHA CENTRE",
      description:
        "Explore numerology insights based on your name and date of birth with clear guidance for life, career and relationships.",
    },
    navagrahaAi: {
      title: "NAVAGRAHA AI | AI Astrology Guidance",
      description:
        "Experience NAVAGRAHA AI for astrology guidance, Kundli interpretation, remedies, Rashifal and spiritual insights.",
    },
    reports: {
      title: "Astrology Reports | Kundli, Career, Marriage & Life Guidance",
      description:
        "Get detailed astrology reports for Kundli, career, marriage, finance, health guidance and Vedic remedies.",
    },
    consultation: {
      title: "Astrology Consultation with J P Sarmah | NAVAGRAHA CENTRE",
      description:
        "Book astrology consultation with J P Sarmah for Kundli analysis, remedies, marriage, career and spiritual guidance.",
    },
    shop: {
      title: "Astrology Shop | Gemstones, Rudraksha & Spiritual Products",
      description:
        "Explore gemstones, Rudraksha and spiritual products with astrology-based guidance from NAVAGRAHA CENTRE.",
    },
    fromTheDesk: {
      title:
        "From the Desk of J P Sarmah | Astrology Articles & Daily Rashifal",
      description:
        "Read Daily Rashifal, Panchang guidance, Vedic astrology insights, remedies and spiritual articles from J P Sarmah.",
    },
  },
  as: {
    home: {
      title:
        "NAVAGRAHA CENTRE | বৈদিক জ্যোতিষ, জন্মকুণ্ডলী, ৰাশিফল আৰু পঞ্চাংগ",
      description:
        "NAVAGRAHA CENTRE-ত AI-সহায়ক বৈদিক জ্যোতিষ অভিজ্ঞতা লাভ কৰক। জন্মকুণ্ডলী, ৰাশিফল, পঞ্চাংগ, সংখ্যাতত্ত্ব, মিলন বিশ্লেষণ, প্ৰতিবেদন আৰু বিশেষজ্ঞ পথনির্দেশ একে ঠাইতে।",
    },
    kundli: {
      title: "বিনামূলীয়া জন্মকুণ্ডলী আৰু AI জন্মচক্ৰ বিশ্লেষণ | NAVAGRAHA CENTRE",
      description:
        "বৈদিক জ্যোতিষভিত্তিক জন্মকুণ্ডলী সৃষ্টি কৰক। গ্ৰহস্থিতি, লগ্ন, ৰাশি আৰু AI-সহায়ক ব্যাখ্যা স্পষ্টভাৱে চাওক।",
    },
    compatibility: {
      title: "বিবাহ মিলন বিশ্লেষণ আৰু গুণ মিলান | NAVAGRAHA CENTRE",
      description:
        "বৈদিক পদ্ধতিত গুণ মিলান, জন্মচক্ৰ মিল আৰু সম্পৰ্কভিত্তিক পথনির্দেশৰ সহায়ত সামঞ্জস্য পৰীক্ষা কৰক।",
    },
    rashifal: {
      title: "দৈনিক ৰাশিফল আৰু হৰ’স্কোপ | NAVAGRAHA CENTRE",
      description:
        "সকলো ৰাশিৰ বাবে দৈনিক ৰাশিফল পঢ়ক। প্ৰেম, কৰ্মজীৱন, ব্যৱসায়, শুভ ৰং, শুভ সংখ্যা আৰু সহায়ক উপায় একেলগে পাওক।",
    },
    panchang: {
      title: "দৈনিক পঞ্চাংগ | তিথি, নক্ষত্ৰ, যোগ আৰু মুহূর্ত | NAVAGRAHA CENTRE",
      description:
        "দৈনিক পঞ্চাংগত তিথি, নক্ষত্ৰ, যোগ, কৰণ, সূৰ্যোদয়, সূৰ্যাস্ত আৰু দিনটোৰ উপযোগী দিশ চাওক।",
    },
    numerology: {
      title: "সংখ্যাতত্ত্ব বিশ্লেষণ | নাম আৰু জন্মতাৰিখ পঠন | NAVAGRAHA CENTRE",
      description:
        "নাম আৰু জন্মতাৰিখৰ ভিত্তিত সংখ্যাতত্ত্বৰ অন্তৰ্দৃষ্টি লাভ কৰক। জীৱন, কৰ্মজীৱন আৰু সম্পৰ্কৰ বাবে সহজ পথনির্দেশ পাওক।",
    },
    navagrahaAi: {
      title: "NAVAGRAHA AI | AI জ্যোতিষ পথনির্দেশ",
      description:
        "NAVAGRAHA AI-ৰ সহায়ত জ্যোতিষ পথনির্দেশ, জন্মকুণ্ডলী ব্যাখ্যা, উপায়, ৰাশিফল আৰু আধ্যাত্মিক অন্তৰ্দৃষ্টি লাভ কৰক।",
    },
    reports: {
      title: "জ্যোতিষ প্ৰতিবেদন | জন্মকুণ্ডলী, কৰ্মজীৱন, বিবাহ আৰু জীৱন দিশ | NAVAGRAHA CENTRE",
      description:
        "জন্মকুণ্ডলী, কৰ্মজীৱন, বিবাহ, আৰ্থিক আৰু স্বাস্থ্যভিত্তিক বৈদিক প্ৰতিবেদন স্পষ্টভাবে পাওক।",
    },
    consultation: {
      title: "J P Sarmah-ৰ সৈতে জ্যোতিষ পৰামৰ্শ | NAVAGRAHA CENTRE",
      description:
        "J P Sarmah-ৰ সৈতে জন্মকুণ্ডলী, উপায়, বিবাহ, কৰ্মজীৱন আৰু আধ্যাত্মিক দিশে জ্যোতিষ পৰামৰ্শ বুক কৰক।",
    },
    shop: {
      title: "জ্যোতিষ দোকান | ৰত্ন, ৰুদ্ৰাক্ষ আৰু আধ্যাত্মিক সামগ্ৰী",
      description:
        "NAVAGRAHA CENTRE-ৰ জ্যোতিষ পথনির্দেশ সহ ৰত্ন, ৰুদ্ৰাক্ষ আৰু আধ্যাত্মিক সামগ্ৰীৰ সংগ্ৰহ অন্বেষণ কৰক।",
    },
    fromTheDesk: {
      title: "জে পি শৰ্মাৰ ডেস্কৰ পৰা | জ্যোতিষ প্ৰবন্ধ আৰু দৈনিক ৰাশিফল",
      description:
        "জে পি শৰ্মাৰ পৰা দৈনিক ৰাশিফল, পঞ্চাংগ পথনির্দেশ, বৈদিক জ্যোতিষ অন্তৰ্দৃষ্টি, উপায় আৰু আধ্যাত্মিক প্ৰবন্ধ পঢ়ক।",
    },
  },
  hi: {
    home: {
      title:
        "NAVAGRAHA CENTRE | वैदिक ज्योतिष, कुंडली, राशिफल और पंचांग",
      description:
        "NAVAGRAHA CENTRE पर AI-संचालित वैदिक ज्योतिष अनुभव प्राप्त करें। कुंडली, राशिफल, पंचांग, न्यूमरोलॉजी, मैचिंग, रिपोर्ट और विशेषज्ञ मार्गदर्शन एक ही जगह।",
    },
    kundli: {
      title: "फ्री कुंडली और AI जन्म कुंडली विश्लेषण | NAVAGRAHA CENTRE",
      description:
        "वैदिक ज्योतिष के साथ अपनी कुंडली बनाएं। ग्रह स्थिति, लग्न, राशि और AI-सहायता प्राप्त व्याख्या स्पष्ट रूप में देखें।",
    },
    compatibility: {
      title: "विवाह अनुकूलता और गुण मिलान | NAVAGRAHA CENTRE",
      description:
        "वैदिक गुण मिलान, जन्म कुंडली मैचिंग और संबंध मार्गदर्शन के साथ विवाह अनुकूलता जांचें।",
    },
    rashifal: {
      title: "दैनिक राशिफल और होरोस्कोप | NAVAGRAHA CENTRE",
      description:
        "सभी राशियों के लिए दैनिक राशिफल पढ़ें, जिसमें प्रेम, करियर, व्यवसाय, शुभ रंग, शुभ अंक और उपाय शामिल हैं।",
    },
    panchang: {
      title: "दैनिक पंचांग | तिथि, नक्षत्र, योग और मुहूर्त | NAVAGRAHA CENTRE",
      description:
        "दैनिक पंचांग में तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त और दिन की उपयोगी मार्गदर्शना देखें।",
    },
    numerology: {
      title: "न्यूमरोलॉजी विश्लेषण | नाम और जन्म तिथि रीडिंग | NAVAGRAHA CENTRE",
      description:
        "नाम और जन्म तिथि आधारित न्यूमरोलॉजी इनसाइट्स प्राप्त करें। जीवन, करियर और संबंधों के लिए स्पष्ट मार्गदर्शन पाएं।",
    },
    navagrahaAi: {
      title: "NAVAGRAHA AI | AI ज्योतिष मार्गदर्शन",
      description:
        "NAVAGRAHA AI के साथ ज्योतिष मार्गदर्शन, कुंडली व्याख्या, उपाय, राशिफल और आध्यात्मिक इनसाइट्स प्राप्त करें।",
    },
    reports: {
      title: "ज्योतिष रिपोर्ट्स | कुंडली, करियर, विवाह और जीवन मार्गदर्शन",
      description:
        "कुंडली, करियर, विवाह, वित्त और स्वास्थ्य के लिए विस्तृत वैदिक ज्योतिष रिपोर्ट्स प्राप्त करें।",
    },
    consultation: {
      title: "J P Sarmah के साथ ज्योतिष परामर्श | NAVAGRAHA CENTRE",
      description:
        "कुंडली विश्लेषण, उपाय, विवाह, करियर और आध्यात्मिक मार्गदर्शन हेतु J P Sarmah के साथ परामर्श बुक करें।",
    },
    shop: {
      title: "ज्योतिष शॉप | रत्न, रुद्राक्ष और आध्यात्मिक उत्पाद",
      description:
        "NAVAGRAHA CENTRE के ज्योतिष मार्गदर्शन के साथ रत्न, रुद्राक्ष और आध्यात्मिक उत्पादों का चयन देखें।",
    },
    fromTheDesk: {
      title: "J P Sarmah के डेस्क से | ज्योतिष लेख और दैनिक राशिफल",
      description:
        "J P Sarmah के लेखों में दैनिक राशिफल, पंचांग मार्गदर्शन, वैदिक ज्योतिष इनसाइट्स, उपाय और आध्यात्मिक सामग्री पढ़ें।",
    },
  },
  bn: {},
  sa: {},
  ta: {},
  te: {},
  ml: {},
  kn: {},
  mr: {},
  gu: {},
  pa: {},
  or: {},
  ne: {},
  ur: {},
  es: {},
  fr: {},
  de: {},
  pt: {},
  it: {},
  ru: {},
  ar: {},
  id: {},
  ja: {},
  ko: {},
  zh: {},
  "zh-CN": {},
  "zh-TW": {},
};

export function getCoreSeoCopy(
  page: CoreSeoPageKey,
  locale?: string | null
): CoreSeoLocaleCopy {
  const resolvedLocale = getLocaleDefinition(locale).code as SupportedLocale;
  const localized = coreSeoCopyByLocale[resolvedLocale]?.[page];

  if (localized) {
    return localized;
  }

  return coreSeoCopyByLocale.en[page]!;
}

export function buildSeoUrl(pathname: string) {
  return new URL(pathname, seoConfig.siteUrl).toString();
}

export function buildLocalizedSeoPath(input: {
  locale: string;
  pathname: string;
  forcePrefix?: boolean;
}) {
  return getLocalizedPath(input.locale, input.pathname, {
    forcePrefix: input.forcePrefix ?? false,
  });
}
