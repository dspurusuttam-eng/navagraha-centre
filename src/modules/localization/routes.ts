import {
  defaultLocale,
  getLocaleDefinition,
  getLiveLocales,
  getLocalizedPath,
  isLocaleSelectable,
  resolveLocale,
  type SupportedLocale,
} from "@/modules/localization/config";

export type LocaleRouteAvailability = "live" | "planned";

export type LocaleRouteDescriptor = {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
  availability: LocaleRouteAvailability;
  selectable: boolean;
  fallbackLocale: SupportedLocale;
};

export function getLocaleRouteDescriptor(locale?: string | null): LocaleRouteDescriptor {
  const definition = getLocaleDefinition(locale);

  return {
    code: definition.code as SupportedLocale,
    label: definition.label,
    nativeLabel: definition.nativeLabel,
    dir: definition.dir,
    availability: definition.availability,
    selectable: isLocaleSelectable(definition.code),
    fallbackLocale: definition.fallback,
  };
}

export function getLocaleRouteAvailability(locale?: string | null) {
  return getLocaleRouteDescriptor(locale).availability;
}

export function getLocaleRouteLabel(locale?: string | null) {
  return getLocaleRouteDescriptor(locale).label;
}

export function getLocaleRouteNativeLabel(locale?: string | null) {
  return getLocaleRouteDescriptor(locale).nativeLabel;
}

export function getLocalizedRoutePath(
  locale: string | null | undefined,
  pathname: string,
  options?: {
    forcePrefix?: boolean;
  }
) {
  const resolvedLocale = resolveLocale(locale);

  return getLocalizedPath(resolvedLocale, pathname, {
    forcePrefix: options?.forcePrefix ?? false,
  });
}

export function getLocalizedRedirectPath(
  locale: string | null | undefined,
  pathname: string,
  options?: {
    explicitLocalePrefix?: boolean;
  }
) {
  const resolvedLocale = resolveLocale(locale);
  const forcePrefix =
    options?.explicitLocalePrefix ?? (resolvedLocale !== defaultLocale ? true : false);

  return getLocalizedPath(resolvedLocale, pathname, {
    forcePrefix,
  });
}

export function getPrimaryRouteLocales() {
  const preferredOrder: SupportedLocale[] = ["en", "as", "hi"];
  const liveLocales = getLiveLocales();
  const liveCodes = new Set(liveLocales.map((locale) => locale.code as SupportedLocale));

  return preferredOrder
    .map((code) => getLocaleDefinition(code))
    .filter((definition) => liveCodes.has(definition.code as SupportedLocale))
    .map((definition) => ({
      code: definition.code as SupportedLocale,
      label: definition.label,
      nativeLabel: definition.nativeLabel,
      dir: definition.dir,
      availability: definition.availability,
      selectable: isLocaleSelectable(definition.code),
      fallbackLocale: definition.fallback,
    }));
}
