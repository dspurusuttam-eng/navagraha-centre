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

function normalizeHostToOrigin(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return normalizeOrigin(trimmed);
  }

  return normalizeOrigin(`https://${trimmed}`);
}

function parseConfiguredOrigins(value: string) {
  return value
    .split(/[\s,;]+/g)
    .map((entry) => normalizeOrigin(entry))
    .filter((origin): origin is string => Boolean(origin));
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
  const vercelOrigins = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ]
    .map((value) => normalizeHostToOrigin(value ?? ""))
    .filter((origin): origin is string => Boolean(origin));

  for (const origin of parseConfiguredOrigins(configuredOrigins)) {
    trustedOrigins.add(origin);
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

    for (const vercelOrigin of vercelOrigins) {
      trustedOrigins.add(vercelOrigin);
    }
  }

  return Array.from(trustedOrigins);
}

type PasswordResetEmailInput = {
  user: {
    email: string;
    name?: string | null;
  };
  url: string;
};

function getPasswordResetSenderAddress() {
  return process.env.AUTH_RESET_FROM_EMAIL?.trim() ?? "";
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}

function getPasswordResetSubject() {
  const siteName = siteConfig.name?.trim() || "NAVAGRAHA CENTRE";

  return `${siteName}: Reset your password`;
}

function buildPasswordResetEmailHtml(url: string) {
  return [
    "<p>A password reset request was received for your account.</p>",
    "<p>Use the secure link below to choose a new password:</p>",
    `<p><a href="${url}">${url}</a></p>`,
    "<p>If you did not request this, you can safely ignore this message.</p>",
  ].join("");
}

function buildPasswordResetEmailText(url: string) {
  return [
    "A password reset request was received for your account.",
    "Use this secure link to choose a new password:",
    url,
    "If you did not request this, you can ignore this message.",
  ].join("\n\n");
}

async function sendPasswordResetWithResend(input: PasswordResetEmailInput) {
  const apiKey = getResendApiKey();
  const from = getPasswordResetSenderAddress();

  if (!apiKey || !from) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.user.email],
      subject: getPasswordResetSubject(),
      html: buildPasswordResetEmailHtml(input.url),
      text: buildPasswordResetEmailText(input.url),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Password reset email send failed with status ${response.status}.`
    );
  }

  return true;
}

async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const sentWithResend = await sendPasswordResetWithResend(input);

  if (sentWithResend) {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] password reset link (development)", {
      email: input.user.email,
      url: input.url,
    });
    return;
  }

  throw new Error(
    "Password reset is not configured. Set RESEND_API_KEY and AUTH_RESET_FROM_EMAIL."
  );
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
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail({
          user: {
            email: user.email,
            name: user.name,
          },
          url,
        });
      },
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
