import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getContentAdapter } from "@/modules/content";
import {
  insightsCategories,
  insightsSeoLandings,
} from "@/modules/content/insights-authority";
import { rashifalSigns } from "@/modules/rashifal/content";
import { listShopProducts } from "@/modules/shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contentEntries = await getContentAdapter().listSitemapEntries();
  const staticRoutes = [
    "/",
    "/kundli",
    "/compatibility",
    "/ai",
    "/numerology",
    "/reports",
    "/about",
    "/services",
    "/pricing",
    "/consultation",
    "/kundli-ai",
    "/marriage-compatibility",
    "/daily-horoscope",
    "/rashifal",
    "/panchang",
    "/muhurta",
    "/tools",
    "/calculators",
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
    "/disclaimer",
    "/refund-cancellation",
    "/shop",
    "/shop/cart",
    "/insights",
    ...insightsCategories.map((category) => category.path),
    ...insightsSeoLandings.map((landing) => landing.path),
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: new URL(path, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...rashifalSigns.map((sign) => ({
      url: new URL(`/rashifal/${sign.slug}`, siteConfig.url).toString(),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
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
