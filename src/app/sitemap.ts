import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getContentAdapter } from "@/modules/content";
import { listShopProducts } from "@/modules/shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contentEntries = await getContentAdapter().listSitemapEntries();
  const staticRoutes = [
    "/",
    "/kundli",
    "/compatibility",
    "/ai",
    "/reports",
    "/about",
    "/services",
    "/pricing",
    "/consultation",
    "/kundli-ai",
    "/marriage-compatibility",
    "/daily-horoscope",
    "/rashifal",
    "/career-report",
    "/finance-report",
    "/health-report",
    "/horoscope-hub",
    "/nakshatra-hub",
    "/graha-hub",
    "/compatibility-hub",
    "/consultation-explainer",
    "/navagraha-ai-explainer",
    "/joy-prakash-sarmah",
    "/contact",
    "/privacy",
    "/terms",
    "/shop",
    "/shop/cart",
    "/insights",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: new URL(path, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...listShopProducts().map((product) => ({
      url: new URL(product.href, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...contentEntries.map((entry) => ({
      url: new URL(entry.path, siteConfig.url).toString(),
      lastModified: new Date(entry.lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.72,
    })),
  ];
}
