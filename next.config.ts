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
      "camera=(), microphone=(), geolocation=(self), browsing-topics=(), payment=()",
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
  experimental: {
    // Public pages render dynamically because locale resolution reads request
    // headers/cookies, so Next marks every response `no-store` and the CDN never
    // caches it — each navigation cost a full origin round trip (measured
    // 560-750 ms per RSC fetch). These stale times let the client Router Cache
    // reuse an already-fetched payload, so repeat navigation between Home, Desk
    // and Consultation is served from memory with no origin request at all.
    // Deliberately short: Admin edits still surface on the next fetch, and
    // server-side `unstable_cache` tag invalidation is untouched.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
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
    // 75 = the Next default, used for every card/thumbnail (light delivery).
    // 90 = reserved for the ARTICLE HERO only. Measured on a real Desk cover
    // (1672x941 master): the platform encoder at q=75 delivered 107 KB at
    // 35.6 dB PSNR against the master — visibly softer than the source. Next 16
    // rejects any quality not listed here (HTTP 400), so the hero value must be
    // declared explicitly rather than passed ad hoc.
    qualities: [75, 90],
    // Desk cover images live in Vercel Blob public storage; the optimizer needs the host
    // allow-listed. Scoped to blob storage only — not a wildcard over the whole internet.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async redirects() {
    // Legacy policy routes consolidate into the final locked set. Permanent (308) so search
    // engines transfer any existing link equity instead of indexing duplicate policy pages.
    return [
      // Disclaimer protection now lives inside Terms.
      { source: "/disclaimer", destination: "/terms", permanent: true },
      { source: "/copyright", destination: "/terms", permanent: true },
      // Public footer label is "Method"; /methodology remains the canonical page.
      { source: "/method", destination: "/methodology", permanent: true },
    ];
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
