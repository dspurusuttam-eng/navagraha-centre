import { NextResponse, type NextRequest } from "next/server";
import {
  classifyTwoUtilityPath,
  isPrivateAdminAuthApi,
  isPrivateAdminAuthRequestAllowed,
} from "@/config/product-mode";
import {
  createFeatureDisabledApiResponse,
  createFeatureDisabledPageResponse,
} from "@/lib/product-mode/responses";
import {
  defaultLocale,
  detectLocaleFromPathname,
  isLocaleSelectable,
  stripLocaleFromPathname,
} from "@/modules/localization/config";
import {
  localeCookieName,
  localeExplicitHeaderName,
  localeHeaderName,
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

function enforceProductMode(request: NextRequest) {
  const disposition = classifyTwoUtilityPath(request.nextUrl.pathname);

  if (disposition === "RESERVED_PRIVATE_ADMIN") {
    if (
      isPrivateAdminAuthApi(request.nextUrl.pathname) &&
      !isPrivateAdminAuthRequestAllowed(request.nextUrl.pathname, request.method)
    ) {
      return createFeatureDisabledApiResponse(request.nextUrl.pathname);
    }

    const response = NextResponse.next();
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    response.headers.set("x-navagraha-product-mode", disposition);
    return response;
  }

  if (
    disposition === "PUBLIC_ALLOWLIST" ||
    disposition === "STATIC_METADATA" ||
    disposition === "PUBLIC_CONTENT_API"
  ) {
    return null;
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return createFeatureDisabledApiResponse(request.nextUrl.pathname);
  }

  return createFeatureDisabledPageResponse(disposition);
}

function withLocaleHeaders(
  request: NextRequest,
  locale: string,
  explicit: boolean
) {
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

  const productModeResponse = enforceProductMode(request);

  if (productModeResponse) {
    return productModeResponse;
  }

  const pathnameLocale = detectLocaleFromPathname(pathname);
  const cookieLocale = request.cookies.get(localeCookieName)?.value ?? null;

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

  // A previously stored locale cookie used to redirect un-prefixed routes to
  // /as or /hi, which silently put the whole app into a content locale: one
  // visit to an Assamese article left every later visit on /as, with the drawer
  // language selector showing AS. The interface is English-only, so a stored
  // cookie must never move the reader off an un-prefixed URL. Assamese and
  // Hindi are reached only by an explicit /as or /hi link.

  // Neither the device language nor a stored cookie may pick the locale: an
  // un-prefixed URL is always the English interface.
  const localeForRequest = defaultLocale;

  const response = NextResponse.next({
    request: {
      headers: withLocaleHeaders(request, localeForRequest, false),
    },
  });

  // Clear any locale cookie left by an earlier build so returning devices
  // (which may still be pinned to /as) self-heal on their next request.
  if (cookieLocale) {
    response.cookies.delete(localeCookieName);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
