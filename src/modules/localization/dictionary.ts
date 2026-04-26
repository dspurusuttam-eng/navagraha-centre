import enMessages from "@/messages/en.json";
import {
  defaultLocale,
  localePrefixingEnabled,
  normalizeLocaleCode,
  resolveLocale,
  type SupportedLocale,
} from "@/modules/localization/config";

export type LocaleDictionary = typeof enMessages;

export type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends Record<string, unknown>
      ? PartialDeep<T[K]>
      : T[K];
};

type DictionaryLoader = () => Promise<PartialDeep<LocaleDictionary>>;

const defaultDictionary = enMessages as LocaleDictionary;

const dictionaryLoaders: Partial<Record<SupportedLocale, DictionaryLoader>> = {
  en: async () => defaultDictionary,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeDictionaries<T extends Record<string, unknown>>(
  base: T,
  override?: PartialDeep<T>
): T {
  if (!override) {
    return base;
  }

  const merged = { ...base } as Record<string, unknown>;

  for (const [key, overrideValue] of Object.entries(override)) {
    if (overrideValue === undefined) {
      continue;
    }

    const baseValue = merged[key];

    if (isRecord(baseValue) && isRecord(overrideValue)) {
      merged[key] = mergeDictionaries(
        baseValue as Record<string, unknown>,
        overrideValue as PartialDeep<Record<string, unknown>>
      );
      continue;
    }

    merged[key] = overrideValue;
  }

  return merged as T;
}

function readPathValue(source: unknown, segments: readonly string[]) {
  let current = source;

  for (const segment of segments) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

export function getDefaultDictionary(): LocaleDictionary {
  return defaultDictionary;
}

export function getDictionaryValue(
  dictionary: LocaleDictionary,
  path: string,
  fallbackValue?: string
) {
  const segments = path.split(".").filter(Boolean);
  const localizedValue = readPathValue(dictionary, segments);

  if (typeof localizedValue === "string") {
    return localizedValue;
  }

  const defaultValue = readPathValue(defaultDictionary, segments);

  if (typeof defaultValue === "string") {
    return defaultValue;
  }

  return fallbackValue ?? path;
}

export async function loadLocaleDictionary(locale?: string | null) {
  const normalizedLocale = normalizeLocaleCode(locale);
  const requestedLocale = normalizedLocale ?? defaultLocale;
  const loader = dictionaryLoaders[requestedLocale];

  if (!loader) {
    return {
      requestedLocale,
      resolvedLocale: defaultLocale,
      dictionary: defaultDictionary,
      isFallback: true,
    };
  }

  const loadedDictionary = await loader();

  return {
    requestedLocale,
    resolvedLocale: requestedLocale,
    dictionary:
      requestedLocale === defaultLocale
        ? defaultDictionary
        : mergeDictionaries(defaultDictionary, loadedDictionary),
    isFallback: normalizedLocale === null,
  };
}

export function getLocalizedPath(locale: string | null | undefined, pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!localePrefixingEnabled) {
    return normalizedPath;
  }

  const resolvedLocale = resolveLocale(locale);

  if (resolvedLocale === defaultLocale) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? `/${resolvedLocale}` : `/${resolvedLocale}${normalizedPath}`;
}

export function stripLocalePrefix(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalizedPath.split("/");
  const firstSegment = segments[1];
  const rest = segments.slice(2);

  if (firstSegment && resolveLocale(firstSegment) === firstSegment) {
    const remainder = rest.join("/");
    return remainder ? `/${remainder}` : "/";
  }

  return normalizedPath;
}
