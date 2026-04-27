import "server-only";

import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  getLocaleDefinition,
  resolveLocale,
  type SupportedLocale,
} from "@/modules/localization/config";
import {
  localeCookieName,
  localeExplicitHeaderName,
  localeHeaderName,
  resolveRequestLocaleFromSources,
} from "@/modules/localization/runtime";

export async function getRequestLocale(): Promise<SupportedLocale> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);

  return resolveRequestLocaleFromSources({
    headerLocale: headerStore.get(localeHeaderName),
    cookieLocale: cookieStore.get(localeCookieName)?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export async function getRequestLocaleDefinition() {
  const locale = await getRequestLocale();

  return getLocaleDefinition(locale);
}

export async function getRequestLocaleLabel() {
  return (await getRequestLocaleDefinition()).label;
}

export async function hasExplicitLocalePrefixInRequest() {
  const headerStore = await headers();

  return headerStore.get(localeExplicitHeaderName) === "1";
}

export function resolveLocaleFromRequest(request: Request) {
  const headerLocale = request.headers.get(localeHeaderName);

  if (headerLocale) {
    return resolveLocale(headerLocale);
  }

  const cookieHeader = request.headers.get("cookie");

  if (cookieHeader) {
    const match = cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${localeCookieName}=`));

    if (match) {
      const cookieLocale = match.split("=")[1];

      return resolveLocale(cookieLocale);
    }
  }

  const acceptLanguage = request.headers.get("accept-language");

  return resolveRequestLocaleFromSources({
    acceptLanguage,
  }) ?? defaultLocale;
}
