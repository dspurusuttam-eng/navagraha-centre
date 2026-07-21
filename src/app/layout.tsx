import type { Metadata, Viewport } from "next";
import {
  Manrope,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Serif_Bengali,
  Noto_Serif_Devanagari,
  Source_Serif_4,
} from "next/font/google";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { AdSenseScript } from "@/components/monetization/AdSenseScript";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { buildLocalizedRootMetadata } from "@/lib/metadata";
import { getCoreSeoCopy, seoConfig } from "@/lib/seo/seo-config";
import {
  createLocalBusinessSchema,
  createOrganizationSchema,
  createWebsiteSchema,
} from "@/lib/seo/schema";
import { getLocaleDirection, systemUiLocale } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import "./globals.css";

const editorialFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const uiFont = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const assameseSansFont = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-assamese-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const assameseSerifFont = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-assamese-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const hindiSansFont = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-hindi-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const hindiSerifFont = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-hindi-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("home", locale);
  const localizedMetadata = buildLocalizedRootMetadata({
    locale,
    title: localized.title,
    description: localized.description,
    path: "/",
    explicitLocalePrefix: hasExplicitLocalePrefix,
  });

  return {
    metadataBase: new URL(seoConfig.siteUrl),
    applicationName: seoConfig.siteName,
    ...localizedMetadata,
    title: {
      default: localized.title,
      template: seoConfig.titleTemplate,
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-16.png", type: "image/png", sizes: "16x16" },
        { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
        { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
        { url: "/icon-64.png", type: "image/png", sizes: "64x64" },
        { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
        { url: "/icon-128.png", type: "image/png", sizes: "128x128" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-256.png", type: "image/png", sizes: "256x256" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: ["/favicon.ico"],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const globalSchemas = [
    createOrganizationSchema(),
    createWebsiteSchema({ locale, path: "/" }),
    createLocalBusinessSchema(),
  ];

  return (
    <html
      // The DOCUMENT language is the interface language, which is English by
      // product decision. Published article text keeps its own language and is
      // marked up at the content level, so assistive tech still announces
      // Assamese/Hindi passages correctly.
      lang={systemUiLocale}
      dir={getLocaleDirection(systemUiLocale)}
      className={[
        uiFont.variable,
        editorialFont.variable,
        assameseSansFont.variable,
        assameseSerifFont.variable,
        hindiSansFont.variable,
        hindiSerifFont.variable,
      ].join(" ")}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <JsonLd id="global-seo-schema" data={globalSchemas} />
        <Header />
        <main className="content-fade-in flex-1">{children}</main>
        <Footer />
        <AdSenseScript />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
