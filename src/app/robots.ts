import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(siteConfig.url).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/_next/",
          "/private/",
          "/preview/",
          "/draft/",
          "/internal/",
          "/test/",
          "/dev/",
          "/account/",
          "/auth/",
          "/login",
          "/style-guide",
          "/shop/cart",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
          "/settings/",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host,
  };
}
