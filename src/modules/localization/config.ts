export type LocaleDirection = "ltr" | "rtl";
export type LocaleAvailability = "live" | "planned";
export type LocaleScript =
  | "Latin"
  | "Bengali-Assamese"
  | "Devanagari"
  | "Gujarati"
  | "Tamil"
  | "Telugu"
  | "Kannada"
  | "Malayalam"
  | "Odia"
  | "Gurmukhi"
  | "Arabic"
  | "Cyrillic"
  | "Han"
  | "Kana"
  | "Hangul";

export type LocaleDefinition = {
  code: string;
  label: string;
  nativeLabel: string;
  dir: LocaleDirection;
  script: LocaleScript;
  enabled: boolean;
  availability: LocaleAvailability;
  fallback: "en";
  ogLocale: string;
  hreflang: string;
};

const indianLocaleCodes = [
  "as",
  "hi",
  "bn",
  "sa",
  "ta",
  "te",
  "ml",
  "kn",
  "mr",
  "gu",
  "pa",
  "or",
  "ne",
  "ur",
] as const;

const internationalLocaleCodes = [
  "es",
  "fr",
  "de",
  "pt",
  "it",
  "ru",
  "ar",
  "id",
  "ja",
  "ko",
  "zh",
  "zh-CN",
  "zh-TW",
] as const;

const indianLocaleCodeSet = new Set<string>(indianLocaleCodes);
const internationalLocaleCodeSet = new Set<string>(internationalLocaleCodes);

export const localeDefinitions = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dir: "ltr",
    script: "Latin",
    enabled: true,
    availability: "live",
    fallback: "en",
    ogLocale: "en_US",
    hreflang: "en",
  },
  {
    code: "as",
    label: "Assamese",
    nativeLabel: "অসমীয়া",
    dir: "ltr",
    script: "Bengali-Assamese",
    enabled: true,
    availability: "live",
    fallback: "en",
    ogLocale: "as_IN",
    hreflang: "as",
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिंदी",
    dir: "ltr",
    script: "Devanagari",
    enabled: true,
    availability: "live",
    fallback: "en",
    ogLocale: "hi_IN",
    hreflang: "hi",
  },
  {
    code: "bn",
    label: "Bengali",
    nativeLabel: "বাংলা",
    dir: "ltr",
    script: "Bengali-Assamese",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "bn_IN",
    hreflang: "bn",
  },
  {
    code: "sa",
    label: "Sanskrit",
    nativeLabel: "संस्कृतम्",
    dir: "ltr",
    script: "Devanagari",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "sa_IN",
    hreflang: "sa",
  },
  {
    code: "ta",
    label: "Tamil",
    nativeLabel: "தமிழ்",
    dir: "ltr",
    script: "Tamil",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ta_IN",
    hreflang: "ta",
  },
  {
    code: "te",
    label: "Telugu",
    nativeLabel: "తెలుగు",
    dir: "ltr",
    script: "Telugu",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "te_IN",
    hreflang: "te",
  },
  {
    code: "ml",
    label: "Malayalam",
    nativeLabel: "മലയാളം",
    dir: "ltr",
    script: "Malayalam",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ml_IN",
    hreflang: "ml",
  },
  {
    code: "kn",
    label: "Kannada",
    nativeLabel: "ಕನ್ನಡ",
    dir: "ltr",
    script: "Kannada",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "kn_IN",
    hreflang: "kn",
  },
  {
    code: "mr",
    label: "Marathi",
    nativeLabel: "मराठी",
    dir: "ltr",
    script: "Devanagari",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "mr_IN",
    hreflang: "mr",
  },
  {
    code: "gu",
    label: "Gujarati",
    nativeLabel: "ગુજરાતી",
    dir: "ltr",
    script: "Gujarati",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "gu_IN",
    hreflang: "gu",
  },
  {
    code: "pa",
    label: "Punjabi",
    nativeLabel: "ਪੰਜਾਬੀ",
    dir: "ltr",
    script: "Gurmukhi",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "pa_IN",
    hreflang: "pa",
  },
  {
    code: "or",
    label: "Odia",
    nativeLabel: "ଓଡ଼ିଆ",
    dir: "ltr",
    script: "Odia",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "or_IN",
    hreflang: "or",
  },
  {
    code: "ne",
    label: "Nepali",
    nativeLabel: "नेपाली",
    dir: "ltr",
    script: "Devanagari",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ne_NP",
    hreflang: "ne",
  },
  {
    code: "ur",
    label: "Urdu",
    nativeLabel: "اردو",
    dir: "rtl",
    script: "Arabic",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ur_PK",
    hreflang: "ur",
  },
  {
    code: "es",
    label: "Spanish",
    nativeLabel: "Español",
    dir: "ltr",
    script: "Latin",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "es_ES",
    hreflang: "es",
  },
  {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    dir: "ltr",
    script: "Latin",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "fr_FR",
    hreflang: "fr",
  },
  {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    dir: "ltr",
    script: "Latin",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "de_DE",
    hreflang: "de",
  },
  {
    code: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    dir: "ltr",
    script: "Latin",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "pt_PT",
    hreflang: "pt",
  },
  {
    code: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    dir: "ltr",
    script: "Latin",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "it_IT",
    hreflang: "it",
  },
  {
    code: "ru",
    label: "Russian",
    nativeLabel: "Русский",
    dir: "ltr",
    script: "Cyrillic",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ru_RU",
    hreflang: "ru",
  },
  {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    dir: "rtl",
    script: "Arabic",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ar_AR",
    hreflang: "ar",
  },
  {
    code: "id",
    label: "Indonesian",
    nativeLabel: "Bahasa Indonesia",
    dir: "ltr",
    script: "Latin",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "id_ID",
    hreflang: "id",
  },
  {
    code: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    dir: "ltr",
    script: "Kana",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ja_JP",
    hreflang: "ja",
  },
  {
    code: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    dir: "ltr",
    script: "Hangul",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "ko_KR",
    hreflang: "ko",
  },
  {
    code: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    dir: "ltr",
    script: "Han",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "zh_CN",
    hreflang: "zh",
  },
  {
    code: "zh-CN",
    label: "Chinese (Simplified)",
    nativeLabel: "简体中文",
    dir: "ltr",
    script: "Han",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "zh_CN",
    hreflang: "zh-CN",
  },
  {
    code: "zh-TW",
    label: "Chinese (Traditional)",
    nativeLabel: "繁體中文",
    dir: "ltr",
    script: "Han",
    enabled: true,
    availability: "planned",
    fallback: "en",
    ogLocale: "zh_TW",
    hreflang: "zh-TW",
  },
] as const satisfies readonly LocaleDefinition[];

export type SupportedLocale = (typeof localeDefinitions)[number]["code"];

export const defaultLocale: SupportedLocale = "en";
export const fallbackLocale: SupportedLocale = "en";
export const localePrefixStrategy = "prefix-and-default-root" as const;
export const localePrefixingEnabled = true;

export const primaryRegionalLocales = ["as", "hi", "en"] as const;

const localeDefinitionMap = new Map<string, LocaleDefinition>(
  localeDefinitions.map((definition) => [definition.code, definition])
);

const localeAliases = new Map<string, SupportedLocale>(
  localeDefinitions.flatMap((definition) => {
    const aliases: string[] = [definition.code.toLowerCase()];

    if (definition.code === "zh-CN") {
      aliases.push("zh-cn", "zh_hans");
    }

    if (definition.code === "zh-TW") {
      aliases.push("zh-tw", "zh_hant");
    }

    if (definition.code === "zh") {
      aliases.push("zh-hk", "zh-sg");
    }

    return aliases.map((alias) => [alias, definition.code]);
  })
);

const localePathSegmentSet = new Set<string>(
  localeDefinitions.map((definition) => definition.code.toLowerCase())
);

export function normalizeLocaleCode(input?: string | null): SupportedLocale | null {
  if (!input) {
    return null;
  }

  return localeAliases.get(input.trim().toLowerCase()) ?? null;
}

export function resolveLocale(input?: string | null): SupportedLocale {
  return normalizeLocaleCode(input) ?? defaultLocale;
}

export function getLocaleDefinition(locale?: string | null): LocaleDefinition {
  return localeDefinitionMap.get(resolveLocale(locale)) ?? localeDefinitionMap.get(defaultLocale)!;
}

export function getLocaleDirection(locale?: string | null): LocaleDirection {
  return getLocaleDefinition(locale).dir;
}

export function getLocaleOgCode(locale?: string | null) {
  return getLocaleDefinition(locale).ogLocale;
}

export function getLocaleHreflang(locale?: string | null) {
  return getLocaleDefinition(locale).hreflang;
}

export function isSupportedLocale(locale?: string | null): locale is SupportedLocale {
  return normalizeLocaleCode(locale) !== null;
}

export function isLocaleEnabled(locale?: string | null) {
  return getLocaleDefinition(locale).enabled;
}

export function isLocaleSelectable(locale?: string | null) {
  const definition = getLocaleDefinition(locale);

  if (!definition.enabled) {
    return false;
  }

  if (definition.availability !== "live") {
    return false;
  }

  if (!localePrefixingEnabled) {
    return definition.code === defaultLocale;
  }

  return true;
}

export function getLiveLocales() {
  return localeDefinitions.filter((definition) => definition.availability === "live");
}

export function getPlannedLocales() {
  return localeDefinitions.filter((definition) => definition.availability === "planned");
}

export function getIndianLocales() {
  return localeDefinitions.filter((definition) => indianLocaleCodeSet.has(definition.code));
}

export function getInternationalLocales() {
  return localeDefinitions.filter((definition) => internationalLocaleCodeSet.has(definition.code));
}

export function getEnabledLocales() {
  return localeDefinitions.filter((definition) => definition.enabled);
}

export function getSelectableLocales() {
  return localeDefinitions.filter((definition) => isLocaleSelectable(definition.code));
}

export function getNonSelectableLocales() {
  return localeDefinitions.filter((definition) => !isLocaleSelectable(definition.code));
}

export function detectLocaleFromPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();

  if (!first || !localePathSegmentSet.has(first)) {
    return null;
  }

  return normalizeLocaleCode(first);
}

export function stripLocaleFromPathname(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalizedPath.split("/").filter(Boolean);

  if (!segments.length) {
    return "/";
  }

  const first = segments[0].toLowerCase();

  if (!localePathSegmentSet.has(first)) {
    return normalizedPath;
  }

  const remainder = segments.slice(1);

  if (!remainder.length) {
    return "/";
  }

  return `/${remainder.join("/")}`;
}

export function getLocalizedPath(
  locale: string | null | undefined,
  pathname: string,
  options?: {
    forcePrefix?: boolean;
  }
) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const resolvedLocale = resolveLocale(locale);
  const forcePrefix = options?.forcePrefix ?? false;

  if (!localePrefixingEnabled) {
    return normalizedPath;
  }

  if (!forcePrefix && resolvedLocale === defaultLocale) {
    return normalizedPath;
  }

  return normalizedPath === "/"
    ? `/${resolvedLocale}`
    : `/${resolvedLocale}${normalizedPath}`;
}
