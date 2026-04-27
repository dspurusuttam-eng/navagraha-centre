import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
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
        <WebVitalsReporter />
      </body>
    </html>
  );
}
