import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
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
import { defaultLocale, getLocaleDirection } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const sansFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
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
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-64.png", type: "image/png", sizes: "64x64" },
        { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
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
  themeColor: "#fffdf8",
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
      lang={locale ?? defaultLocale}
      dir={getLocaleDirection(locale ?? defaultLocale)}
      className={`${displayFont.variable} ${sansFont.variable}`}
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
