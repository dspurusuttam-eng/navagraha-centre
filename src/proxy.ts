import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  detectLocaleFromPathname,
  getLocalizedPath,
  isLocaleSelectable,
  localePrefixingEnabled,
  stripLocaleFromPathname,
} from "@/modules/localization/config";
import {
  localeCookieName,
  localeExplicitHeaderName,
  localeHeaderName,
  readLocaleFromAcceptLanguage,
  resolveRequestLocaleFromSources,
} from "@/modules/localization/runtime";

function isStaticAsset(pathname: string) {
  return /\.[a-z0-9]+$/i.test(pathname);
}

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/ads.txt") ||
    isStaticAsset(pathname)
  );
}

function withLocaleHeaders(request: NextRequest, locale: string, explicit: boolean) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, locale);
  requestHeaders.set(localeExplicitHeaderName, explicit ? "1" : "0");

  return requestHeaders;
}

function persistLocaleCookie(response: NextResponse, locale: string) {
  if (!isLocaleSelectable(locale) && locale !== defaultLocale) {
    response.cookies.delete(localeCookieName);
    return;
  }

  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const pathnameLocale = detectLocaleFromPathname(pathname);
  const cookieLocale = request.cookies.get(localeCookieName)?.value ?? null;
  const acceptLanguage = request.headers.get("accept-language");
  const resolvedLocale = resolveRequestLocaleFromSources({
    pathname,
    cookieLocale,
    acceptLanguage,
  });

  if (pathnameLocale) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = stripLocaleFromPathname(pathname);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: withLocaleHeaders(request, pathnameLocale, true),
      },
    });

    persistLocaleCookie(response, pathnameLocale);

    return response;
  }

  if (
    localePrefixingEnabled &&
    !pathname.startsWith("/api") &&
    cookieLocale &&
    isLocaleSelectable(resolvedLocale) &&
    resolvedLocale !== defaultLocale
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getLocalizedPath(resolvedLocale, pathname, {
      forcePrefix: true,
    });

    const redirectResponse = NextResponse.redirect(redirectUrl);
    persistLocaleCookie(redirectResponse, resolvedLocale);

    return redirectResponse;
  }

  const headerLocale = request.headers.get(localeHeaderName);
  const candidateLocaleForRequest =
    pathnameLocale ??
    (headerLocale || cookieLocale
      ? resolveRequestLocaleFromSources({
          headerLocale,
          cookieLocale,
          acceptLanguage,
        })
      : readLocaleFromAcceptLanguage(acceptLanguage) ?? defaultLocale);
  const shouldUseCandidateLocale =
    Boolean(pathnameLocale) || isLocaleSelectable(candidateLocaleForRequest);
  const localeForRequest = shouldUseCandidateLocale
    ? candidateLocaleForRequest
    : defaultLocale;

  const response = NextResponse.next({
    request: {
      headers: withLocaleHeaders(request, localeForRequest, false),
    },
  });

  if (cookieLocale !== localeForRequest) {
    persistLocaleCookie(response, localeForRequest);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
