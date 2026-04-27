import {
  defaultLocale,
  detectLocaleFromPathname,
  normalizeLocaleCode,
  primaryRegionalLocales,
  resolveLocale,
  type SupportedLocale,
} from "@/modules/localization/config";

export const localeCookieName = "navagraha-locale";
export const localeHeaderName = "x-navagraha-locale";
export const localeExplicitHeaderName = "x-navagraha-locale-explicit";

function readWeightedLanguageValues(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [tag, qualityToken] = entry.split(";").map((part) => part.trim());
      const qualityMatch = qualityToken?.match(/^q=(\d(?:\.\d+)?)$/i);
      const quality = qualityMatch ? Number(qualityMatch[1]) : 1;

      return {
        tag,
        quality: Number.isFinite(quality) ? quality : 1,
      };
    })
    .sort((left, right) => right.quality - left.quality);
}

export function readLocaleFromAcceptLanguage(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const weighted = readWeightedLanguageValues(value);

  for (const candidate of weighted) {
    const exact = normalizeLocaleCode(candidate.tag);

    if (exact) {
      return exact;
    }

    const base = candidate.tag.split("-")[0];
    const normalizedBase = normalizeLocaleCode(base);

    if (normalizedBase) {
      return normalizedBase;
    }
  }

  return null;
}

export function readPreferredRegionalLocale(
  input: string | null | undefined
): SupportedLocale | null {
  const normalized = normalizeLocaleCode(input);

  if (normalized) {
    return normalized;
  }

  const acceptLocale = readLocaleFromAcceptLanguage(input);

  if (acceptLocale) {
    return acceptLocale;
  }

  for (const locale of primaryRegionalLocales) {
    if (locale !== "en") {
      return locale;
    }
  }

  return null;
}

export function resolveRequestLocaleFromSources(input: {
  pathname?: string | null;
  headerLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}) {
  const fromPath = input.pathname ? detectLocaleFromPathname(input.pathname) : null;
  const fromHeader = normalizeLocaleCode(input.headerLocale);
  const fromCookie = normalizeLocaleCode(input.cookieLocale);
  const fromAcceptLanguage = readLocaleFromAcceptLanguage(input.acceptLanguage);

  return (
    fromPath ??
    fromHeader ??
    fromCookie ??
    fromAcceptLanguage ??
    defaultLocale
  );
}

export function isExplicitLocalePath(pathname: string) {
  return detectLocaleFromPathname(pathname) !== null;
}

export function resolveRequestLocale(rawLocale: string | null | undefined) {
  return resolveLocale(rawLocale);
}
