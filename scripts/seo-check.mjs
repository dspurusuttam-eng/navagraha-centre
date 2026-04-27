import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const requiredLocalizedCoreRoutes = [
  "/",
  "/kundli",
  "/compatibility",
  "/rashifal",
  "/panchang",
  "/numerology",
  "/navagraha-ai",
  "/reports",
  "/consultation",
  "/shop",
  "/from-the-desk",
];

function readFile(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  return fs.readFileSync(absolutePath, "utf8");
}

function assert(condition, message, issues) {
  if (!condition) {
    issues.push(message);
  }
}

function collectStaticRoutes(source) {
  const matches = source.match(/path:\s*"([^"]+)"/g) || [];
  return matches
    .map((item) => item.match(/path:\s*"([^"]+)"/))
    .filter(Boolean)
    .map((item) => item[1]);
}

function main() {
  const issues = [];

  const seoConfigSource = readFile("src/lib/seo/seo-config.ts");
  const localizationSource = readFile("src/modules/localization/config.ts");
  const sitemapSource = readFile("src/app/sitemap.ts");
  const robotsSource = readFile("src/app/robots.ts");

  assert(
    seoConfigSource.includes("https://navagrahacentre.com"),
    "seo-config should contain production fallback site URL.",
    issues
  );
  assert(
    localizationSource.includes('export const defaultLocale: SupportedLocale = "en";'),
    "default locale should be en.",
    issues
  );
  assert(
    localizationSource.includes('code: "as"') &&
      localizationSource.includes('code: "hi"') &&
      localizationSource.includes('availability: "live"'),
    "as and hi should remain configured in live locale metadata.",
    issues
  );

  const staticRoutes = collectStaticRoutes(sitemapSource);

  for (const requiredRoute of requiredLocalizedCoreRoutes) {
    assert(
      staticRoutes.includes(requiredRoute),
      `Missing static sitemap route definition: ${requiredRoute}`,
      issues
    );
  }

  const duplicateRouteSet = new Set();
  const duplicateRoutes = new Set();

  for (const route of staticRoutes) {
    if (duplicateRouteSet.has(route)) {
      duplicateRoutes.add(route);
      continue;
    }

    duplicateRouteSet.add(route);
  }

  assert(
    duplicateRoutes.size === 0,
    `Duplicate static sitemap route definitions found: ${Array.from(duplicateRoutes).join(", ")}`,
    issues
  );

  assert(
    robotsSource.includes('"/api/"') &&
      robotsSource.includes('"/admin/"') &&
      robotsSource.includes('"/dashboard/"'),
    "robots should disallow api/admin/dashboard routes.",
    issues
  );
  assert(
    robotsSource.includes('new URL("/sitemap.xml"'),
    "robots should expose sitemap.xml URL.",
    issues
  );

  if (issues.length) {
    console.error("SEO check failed:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("SEO check passed.");
  console.log(`Validated static route definitions: ${staticRoutes.length}`);
}

main();
