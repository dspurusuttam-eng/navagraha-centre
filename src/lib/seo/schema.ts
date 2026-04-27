import { buildLocalizedSeoPath, buildSeoUrl, seoConfig } from "@/lib/seo/seo-config";
import { defaultLocale, resolveLocale, type SupportedLocale } from "@/modules/localization/config";

export type JsonLdRecord = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  path: string;
};

type SharedSchemaInput = {
  locale?: string | null;
  path: string;
  explicitLocalePrefix?: boolean;
};

function getSchemaUrl(input: SharedSchemaInput) {
  const locale = resolveLocale(input.locale);
  const localizedPath = buildLocalizedSeoPath({
    locale,
    pathname: input.path,
    forcePrefix: Boolean(input.explicitLocalePrefix) || locale !== defaultLocale,
  });

  return buildSeoUrl(localizedPath);
}

function toLocaleTag(locale?: string | null) {
  return resolveLocale(locale);
}

export function createOrganizationSchema(): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seoConfig.organization.name,
    legalName: seoConfig.organization.legalName,
    url: seoConfig.siteUrl,
    logo: buildSeoUrl(seoConfig.organization.logoPath),
    founder: {
      "@type": "Person",
      name: seoConfig.organization.founderName,
    },
    sameAs: seoConfig.organization.sameAs,
    areaServed: seoConfig.organization.serviceArea.map((area) => ({
      "@type": "Place",
      name: area,
    })),
    knowsAbout: [...seoConfig.organization.serviceTypes],
  };
}

export function createWebsiteSchema(input?: {
  locale?: string | null;
  path?: string;
}): JsonLdRecord {
  const locale = resolveLocale(input?.locale);
  const path = input?.path ?? "/";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.siteName,
    url: getSchemaUrl({ locale, path }),
    inLanguage: toLocaleTag(locale),
    publisher: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      url: seoConfig.siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${seoConfig.siteUrl}/from-the-desk?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function createWebPageSchema(input: {
  title: string;
  description: string;
  path: string;
  locale?: string | null;
  explicitLocalePrefix?: boolean;
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url: getSchemaUrl({
      locale: input.locale,
      path: input.path,
      explicitLocalePrefix: input.explicitLocalePrefix,
    }),
    inLanguage: toLocaleTag(input.locale),
    isPartOf: {
      "@type": "WebSite",
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
    },
  };
}

export function createPersonSchema(input?: {
  locale?: string | null;
  path?: string;
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: seoConfig.organization.authorName,
    jobTitle: seoConfig.organization.authorTitle,
    worksFor: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      url: seoConfig.siteUrl,
    },
    url: getSchemaUrl({
      locale: input?.locale,
      path: input?.path ?? "/joy-prakash-sarmah",
    }),
  };
}

export function createLocalBusinessSchema(): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: seoConfig.organization.name,
    url: seoConfig.siteUrl,
    image: buildSeoUrl(seoConfig.organization.logoPath),
    address: {
      "@type": "PostalAddress",
      addressLocality: seoConfig.organization.location.locality,
      addressRegion: seoConfig.organization.location.region,
      addressCountry: seoConfig.organization.location.country,
    },
    areaServed: seoConfig.organization.serviceArea.map((area) => ({
      "@type": "Place",
      name: area,
    })),
    serviceType: "Vedic Astrology Consultation",
  };
}

export function createServiceSchema(input: {
  name: string;
  description: string;
  path: string;
  locale?: string | null;
  serviceType?: string;
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: input.serviceType ?? input.name,
    provider: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      url: seoConfig.siteUrl,
    },
    areaServed: seoConfig.organization.serviceArea.map((area) => ({
      "@type": "Place",
      name: area,
    })),
    url: getSchemaUrl({
      locale: input.locale,
      path: input.path,
    }),
  };
}

export function createBreadcrumbSchema(input: {
  locale?: string | null;
  explicitLocalePrefix?: boolean;
  items: readonly BreadcrumbItem[];
}): JsonLdRecord {
  const locale = resolveLocale(input.locale);
  const items = input.items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: getSchemaUrl({
      locale,
      path: item.path,
      explicitLocalePrefix: input.explicitLocalePrefix,
    }),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function createArticleSchema(input: {
  title: string;
  description: string;
  path: string;
  locale?: string | null;
  explicitLocalePrefix?: boolean;
  publishedAt: string;
  updatedAt: string;
  imagePath?: string | null;
  category?: string;
  keywords?: readonly string[];
  authorName?: string;
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    inLanguage: toLocaleTag(input.locale),
    articleSection: input.category,
    keywords: input.keywords?.join(", "),
    image: input.imagePath ? buildSeoUrl(input.imagePath) : undefined,
    mainEntityOfPage: getSchemaUrl({
      locale: input.locale,
      path: input.path,
      explicitLocalePrefix: input.explicitLocalePrefix,
    }),
    author: {
      "@type": "Person",
      name: input.authorName ?? seoConfig.organization.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      logo: {
        "@type": "ImageObject",
        url: buildSeoUrl(seoConfig.organization.logoPath),
      },
    },
  };
}

export function createFaqSchema(input: {
  questions: ReadonlyArray<{
    question: string;
    answer: string;
  }>;
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: input.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createProductSchema(input: {
  name: string;
  description: string;
  path: string;
  locale?: string | null;
  imagePath?: string | null;
  currencyCode?: string;
  price?: number;
}): JsonLdRecord {
  const product: JsonLdRecord = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: getSchemaUrl({
      locale: input.locale,
      path: input.path,
    }),
    image: input.imagePath ? buildSeoUrl(input.imagePath) : buildSeoUrl("/og-default.svg"),
    brand: {
      "@type": "Brand",
      name: seoConfig.organization.name,
    },
  };

  if (
    typeof input.price === "number" &&
    Number.isFinite(input.price) &&
    input.price > 0 &&
    input.currencyCode
  ) {
    product.offers = {
      "@type": "Offer",
      price: input.price.toFixed(2),
      priceCurrency: input.currencyCode,
      url: product.url,
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  return product;
}

export function createCollectionPageSchema(input: {
  name: string;
  description: string;
  path: string;
  locale?: string | null;
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: getSchemaUrl({
      locale: input.locale,
      path: input.path,
    }),
    inLanguage: toLocaleTag(input.locale),
    publisher: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      url: seoConfig.siteUrl,
    },
  };
}

export function serializeJsonLd(value: JsonLdRecord | JsonLdRecord[]) {
  return JSON.stringify(value);
}

export function mapLocaleForSchema(locale?: string | null): SupportedLocale {
  return resolveLocale(locale);
}
