import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(siteConfig.url).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/services",
          "/consultation",
          "/contact",
          "/joy-prakash-sarmah",
          "/shop",
          "/insights",
        ],
        disallow: ["/dashboard", "/admin", "/settings", "/style-guide"],
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host,
  };
}
