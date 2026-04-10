import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getRequiredServerEnvironmentValue } from "@/config/env";
import { siteConfig } from "@/config/site";
import { getPrisma } from "@/lib/prisma";

function getAuthSecret() {
  return getRequiredServerEnvironmentValue("BETTER_AUTH_SECRET");
}

function normalizeOrigin(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function isVercelProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getCanonicalSiteOrigin() {
  return normalizeOrigin(siteConfig.url) ?? "http://localhost:3000";
}

function getBaseUrl() {
  const configuredBaseUrl = normalizeOrigin(process.env.BETTER_AUTH_URL ?? "");

  if (isVercelProduction()) {
    return getCanonicalSiteOrigin();
  }

  return configuredBaseUrl ?? getCanonicalSiteOrigin();
}

function getProductionOriginVariants() {
  const canonical = new URL(getCanonicalSiteOrigin());
  const hostname = canonical.hostname.toLowerCase();
  const variants = new Set<string>();

  if (hostname === "www.navagrahacentre.com") {
    variants.add("https://www.navagrahacentre.com");
    variants.add("https://navagrahacentre.com");
  } else if (hostname === "navagrahacentre.com") {
    variants.add("https://navagrahacentre.com");
    variants.add("https://www.navagrahacentre.com");
  }

  return variants;
}

function getTrustedOrigins() {
  const trustedOrigins = new Set<string>();
  const configuredOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "";
  const configuredBaseUrl = normalizeOrigin(process.env.BETTER_AUTH_URL ?? "");
  const configuredPublicSiteUrl = normalizeOrigin(
    process.env.NEXT_PUBLIC_SITE_URL ?? ""
  );

  for (const value of configuredOrigins.split(",")) {
    const origin = normalizeOrigin(value);

    if (origin) {
      trustedOrigins.add(origin);
    }
  }

  if (configuredBaseUrl) {
    trustedOrigins.add(configuredBaseUrl);
  }

  if (configuredPublicSiteUrl) {
    trustedOrigins.add(configuredPublicSiteUrl);
  }

  trustedOrigins.add(getBaseUrl());

  if (isVercelProduction()) {
    for (const productionOrigin of getProductionOriginVariants()) {
      trustedOrigins.add(productionOrigin);
    }
  }

  return Array.from(trustedOrigins);
}

function createAuth() {
  return betterAuth({
    appName: siteConfig.name,
    secret: getAuthSecret(),
    baseURL: getBaseUrl(),
    trustedOrigins: getTrustedOrigins(),
    database: prismaAdapter(getPrisma(), {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [nextCookies()],
  });
}

type NavagrahaAuth = ReturnType<typeof createAuth>;

let authInstance: NavagrahaAuth | null = null;

export function getAuth(): NavagrahaAuth {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
}
