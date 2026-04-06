import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getRequiredServerEnvironmentValue } from "@/config/env";
import { siteConfig } from "@/config/site";
import { getPrisma } from "@/lib/prisma";

function getAuthSecret() {
  return getRequiredServerEnvironmentValue("BETTER_AUTH_SECRET");
}

function getBaseUrl() {
  return process.env.BETTER_AUTH_URL ?? siteConfig.url;
}

function getTrustedOrigins() {
  const configuredOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : [getBaseUrl()];
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
