import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  twoUtilityAuthenticationEntryPoints,
  twoUtilityDisabledCalculationApis,
  twoUtilityReservedPrivateAdminAuthApis,
  twoUtilityHiddenPublicRoutes,
  twoUtilityReservedPrivatePrefixes,
} from "@/config/product-mode";

function withTrailingSlash(path: string) {
  return path.endsWith("/") ? path : `${path}/`;
}

export default function robots(): MetadataRoute.Robots {
  const host = new URL(siteConfig.url).host;
  const disallow = [
    ...twoUtilityHiddenPublicRoutes.map(withTrailingSlash),
    ...twoUtilityAuthenticationEntryPoints.map(withTrailingSlash),
    ...twoUtilityDisabledCalculationApis.map(withTrailingSlash),
    ...twoUtilityReservedPrivateAdminAuthApis.map(withTrailingSlash),
    ...twoUtilityReservedPrivatePrefixes.map(withTrailingSlash),
    "/api/",
    "/_next/",
    "/private/",
    "/preview/",
    "/draft/",
    "/internal/",
    "/test/",
    "/dev/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: Array.from(new Set(disallow)).sort(),
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host,
  };
}
