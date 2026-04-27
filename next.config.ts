import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://*.googletagmanager.com https://*.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://challenges.cloudflare.com https://*.google-analytics.com https://*.googletagmanager.com https://pagead2.googlesyndication.com",
  "frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
].join("; ");

const cspEnabled = process.env.SECURITY_ENABLE_CSP !== "false";
const cspReportOnly = process.env.SECURITY_CSP_REPORT_ONLY === "true";

const envDistDir = process.env.NEXT_DIST_DIR?.trim();
const skipTypecheckDuringBuild = process.env.NEXT_SKIP_TYPECHECK === "true";
const envTsconfigPath = process.env.NEXT_TSCONFIG_PATH?.trim();

const typescriptOptions =
  skipTypecheckDuringBuild || (envTsconfigPath && envTsconfigPath.length > 0)
    ? {
        ...(skipTypecheckDuringBuild ? { ignoreBuildErrors: true } : {}),
        ...(envTsconfigPath && envTsconfigPath.length > 0
          ? { tsconfigPath: envTsconfigPath }
          : {}),
      }
    : undefined;

const nextConfig: NextConfig = {
  distDir: envDistDir && envDistDir.length > 0 ? envDistDir : ".next",
  typescript: typescriptOptions,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["swisseph"],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/swisseph/build/Release/**/*",
      "./node_modules/swisseph/lib/**/*",
      "./node_modules/swisseph/ephe/**/*",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  async headers() {
    const productionHeaders = [
      ...securityHeaders,
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      ...(cspEnabled
        ? [
            {
              key: cspReportOnly
                ? "Content-Security-Policy-Report-Only"
                : "Content-Security-Policy",
              value: contentSecurityPolicy,
            },
          ]
        : []),
    ];

    return [
      {
        source: "/(.*)",
        headers: process.env.NODE_ENV === "production" ? productionHeaders : securityHeaders,
      },
    ];
  },
};

export default nextConfig;
