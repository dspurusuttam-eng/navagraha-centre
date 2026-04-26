export type LocaleDirection = "ltr" | "rtl";
export type LocaleAvailability = "live" | "planned";

export type LocaleDefinition = {
  code: string;
  label: string;
  nativeLabel: string;
  dir: LocaleDirection;
  availability: LocaleAvailability;
};

export const localeDefinitions = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr", availability: "live" },
  { code: "as", label: "Assamese", nativeLabel: "অসমীয়া", dir: "ltr", availability: "planned" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr", availability: "planned" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", dir: "ltr", availability: "planned" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", dir: "ltr", availability: "planned" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", dir: "ltr", availability: "planned" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", dir: "ltr", availability: "planned" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", dir: "ltr", availability: "planned" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", dir: "ltr", availability: "planned" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", dir: "ltr", availability: "planned" },
  { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", dir: "ltr", availability: "planned" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", dir: "ltr", availability: "planned" },
  { code: "ne", label: "Nepali", nativeLabel: "नेपाली", dir: "ltr", availability: "planned" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl", availability: "planned" },
  { code: "es", label: "Spanish", nativeLabel: "Español", dir: "ltr", availability: "planned" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr", availability: "planned" },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr", availability: "planned" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", dir: "ltr", availability: "planned" },
  { code: "it", label: "Italian", nativeLabel: "Italiano", dir: "ltr", availability: "planned" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", dir: "ltr", availability: "planned" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl", availability: "planned" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", dir: "ltr", availability: "planned" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", dir: "ltr", availability: "planned" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", dir: "ltr", availability: "planned" },
  { code: "zh-CN", label: "Chinese (Simplified)", nativeLabel: "简体中文", dir: "ltr", availability: "planned" },
  { code: "zh-TW", label: "Chinese (Traditional)", nativeLabel: "繁體中文", dir: "ltr", availability: "planned" }
] as const satisfies readonly LocaleDefinition[];

export type SupportedLocale = (typeof localeDefinitions)[number]["code"];

export const defaultLocale: SupportedLocale = "en";
export const localePrefixStrategy = "foundation-only" as const;
export const localePrefixingEnabled = false;

const localeDefinitionMap = new Map<string, LocaleDefinition>(
  localeDefinitions.map((definition) => [definition.code, definition])
);

const localeAliases = new Map<string, SupportedLocale>(
  localeDefinitions.map((definition) => [definition.code.toLowerCase(), definition.code])
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

export function isSupportedLocale(locale?: string | null): locale is SupportedLocale {
  return normalizeLocaleCode(locale) !== null;
}

export function getLiveLocales() {
  return localeDefinitions.filter((definition) => definition.availability === "live");
}

export function getPlannedLocales() {
  return localeDefinitions.filter((definition) => definition.availability === "planned");
}
