import enMessages from "@/messages/en.json";
import asMessages from "@/messages/as.json";
import bnMessages from "@/messages/bn.json";
import deMessages from "@/messages/de.json";
import esMessages from "@/messages/es.json";
import frMessages from "@/messages/fr.json";
import guMessages from "@/messages/gu.json";
import hiMessages from "@/messages/hi.json";
import idMessages from "@/messages/id.json";
import itMessages from "@/messages/it.json";
import jaMessages from "@/messages/ja.json";
import knMessages from "@/messages/kn.json";
import koMessages from "@/messages/ko.json";
import mlMessages from "@/messages/ml.json";
import mrMessages from "@/messages/mr.json";
import neMessages from "@/messages/ne.json";
import orMessages from "@/messages/or.json";
import paMessages from "@/messages/pa.json";
import ptMessages from "@/messages/pt.json";
import ruMessages from "@/messages/ru.json";
import saMessages from "@/messages/sa.json";
import taMessages from "@/messages/ta.json";
import teMessages from "@/messages/te.json";
import urMessages from "@/messages/ur.json";
import zhMessages from "@/messages/zh.json";
import zhCnMessages from "@/messages/zh-CN.json";
import zhTwMessages from "@/messages/zh-TW.json";
import arMessages from "@/messages/ar.json";
import {
  defaultLocale,
  fallbackLocale,
  getLocalizedPath as getLocalizedPathFromConfig,
  normalizeLocaleCode,
  stripLocaleFromPathname,
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
  as: async () => asMessages,
  hi: async () => hiMessages,
  bn: async () => bnMessages,
  gu: async () => guMessages,
  mr: async () => mrMessages,
  ta: async () => taMessages,
  te: async () => teMessages,
  kn: async () => knMessages,
  ml: async () => mlMessages,
  or: async () => orMessages,
  pa: async () => paMessages,
  ne: async () => neMessages,
  ur: async () => urMessages,
  sa: async () => saMessages,
  es: async () => esMessages,
  fr: async () => frMessages,
  de: async () => deMessages,
  pt: async () => ptMessages,
  it: async () => itMessages,
  ru: async () => ruMessages,
  ar: async () => arMessages,
  id: async () => idMessages,
  ja: async () => jaMessages,
  ko: async () => koMessages,
  zh: async () => zhMessages,
  "zh-CN": async () => zhCnMessages,
  "zh-TW": async () => zhTwMessages,
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
  const requestedLocale = normalizedLocale ?? fallbackLocale;
  const loader = dictionaryLoaders[requestedLocale];

  if (!loader) {
    return {
      requestedLocale,
      resolvedLocale: fallbackLocale,
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
  return getLocalizedPathFromConfig(locale, pathname);
}

export function stripLocalePrefix(pathname: string) {
  return stripLocaleFromPathname(pathname);
}
