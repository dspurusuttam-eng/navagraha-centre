import type { Metadata } from "next";
import { seoConfig, buildLocalizedSeoPath, buildSeoUrl } from "@/lib/seo/seo-config";
import {
  defaultLocale,
  getLiveLocales,
  getLocaleOgCode,
  resolveLocale,
  type SupportedLocale,
} from "@/modules/localization/config";

type RobotsDirectives = NonNullable<Metadata["robots"]>;

type SharedMetadataInput = {
  title: string;
  description: string;
  path: string;
  locale?: string | null;
  explicitLocalePrefix?: boolean;
  keywords?: readonly string[];
  imagePath?: string | null;
  index?: boolean;
  alternatesByLocale?: Partial<Record<SupportedLocale, string>>;
  robots?: RobotsDirectives;
};

type ArticleMetadataInput = SharedMetadataInput & {
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

type AlternatesInput = {
  path: string;
  locale?: string | null;
  explicitLocalePrefix?: boolean;
  alternatesByLocale?: Partial<Record<SupportedLocale, string>>;
};

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function shouldIndexPath(path: string) {
  return !(
    path.startsWith("/dashboard") ||
    path.startsWith("/settings") ||
    path.startsWith("/sign-") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/style-guide") ||
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/private") ||
    path.startsWith("/users") ||
    path.startsWith("/shop/cart")
  );
}

function getImageUrl(path?: string | null) {
  if (path === null) {
    return undefined;
  }

  const normalized = path?.trim() || seoConfig.defaultOpenGraphImage;
  return buildSeoUrl(normalized);
}

export function createCanonicalUrl(input: {
  path: string;
  locale?: string | null;
  explicitLocalePrefix?: boolean;
}) {
  const locale = resolveLocale(input.locale);
  const canonicalPath = buildLocalizedSeoPath({
    locale,
    pathname: normalizePath(input.path),
    forcePrefix: Boolean(input.explicitLocalePrefix) || locale !== defaultLocale,
  });

  return buildSeoUrl(canonicalPath);
}

export function createLocalizedAlternates(input: AlternatesInput) {
  const locale = resolveLocale(input.locale);
  const fallbackPath =
    input.alternatesByLocale?.[defaultLocale] ?? normalizePath(input.path);
  const languages: Record<string, string> = {};

  for (const localeDefinition of getLiveLocales()) {
    const targetPath =
      input.alternatesByLocale?.[localeDefinition.code] ?? fallbackPath;
    const localizedPath = buildLocalizedSeoPath({
      locale: localeDefinition.code,
      pathname: normalizePath(targetPath),
      forcePrefix: true,
    });

    languages[localeDefinition.hreflang] = buildSeoUrl(localizedPath);
  }

  languages["x-default"] = buildSeoUrl(normalizePath(fallbackPath));

  return {
    canonical: createCanonicalUrl({
      path: input.alternatesByLocale?.[locale] ?? fallbackPath,
      locale,
      explicitLocalePrefix: input.explicitLocalePrefix,
    }),
    languages,
  };
}

export function createOpenGraphMetadata(input: {
  title: string;
  description: string;
  url: string;
  locale?: string | null;
  type?: "website" | "article";
  imagePath?: string | null;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}) {
  return {
    title: input.title,
    description: input.description,
    url: input.url,
    siteName: seoConfig.siteName,
    type: input.type ?? "website",
    locale: getLocaleOgCode(input.locale),
    images: getImageUrl(input.imagePath)
      ? [
          {
            url: getImageUrl(input.imagePath)!,
            alt: `${seoConfig.siteName} preview image`,
          },
        ]
      : undefined,
    publishedTime: input.publishedTime,
    modifiedTime: input.modifiedTime,
    authors: input.authors,
  } satisfies NonNullable<Metadata["openGraph"]>;
}

export function createTwitterMetadata(input: {
  title: string;
  description: string;
  imagePath?: string | null;
}) {
  return {
    card: "summary_large_image",
    title: input.title,
    description: input.description,
    images: getImageUrl(input.imagePath) ? [getImageUrl(input.imagePath)!] : undefined,
    creator: seoConfig.twitterHandle || undefined,
    site: seoConfig.twitterHandle || undefined,
  } satisfies NonNullable<Metadata["twitter"]>;
}

export function createPageMetadata(input: SharedMetadataInput): Metadata {
  const normalizedPath = normalizePath(input.path);
  const locale = resolveLocale(input.locale);
  const alternates = createLocalizedAlternates({
    path: normalizedPath,
    locale,
    explicitLocalePrefix: input.explicitLocalePrefix,
    alternatesByLocale: input.alternatesByLocale,
  });
  const shouldIndex = input.index ?? shouldIndexPath(normalizedPath);
  const keywords = [...seoConfig.brandKeywords, ...(input.keywords ?? [])];

  return {
    title: input.title,
    description: input.description,
    keywords,
    alternates,
    robots:
      input.robots ??
      ({
        index: shouldIndex,
        follow: shouldIndex,
      } satisfies RobotsDirectives),
    openGraph: createOpenGraphMetadata({
      title: input.title,
      description: input.description,
      url: alternates.canonical,
      locale,
      type: "website",
      imagePath: input.imagePath,
    }),
    twitter: createTwitterMetadata({
      title: input.title,
      description: input.description,
      imagePath: input.imagePath,
    }),
  };
}

export function createToolMetadata(input: SharedMetadataInput): Metadata {
  return createPageMetadata(input);
}

export function createArticleMetadata(input: ArticleMetadataInput): Metadata {
  const normalizedPath = normalizePath(input.path);
  const locale = resolveLocale(input.locale);
  const alternates = createLocalizedAlternates({
    path: normalizedPath,
    locale,
    explicitLocalePrefix: input.explicitLocalePrefix,
    alternatesByLocale: input.alternatesByLocale,
  });
  const shouldIndex = input.index ?? shouldIndexPath(normalizedPath);
  const keywords = [...seoConfig.brandKeywords, ...(input.keywords ?? [])];

  return {
    title: input.title,
    description: input.description,
    keywords,
    alternates,
    robots:
      input.robots ??
      ({
        index: shouldIndex,
        follow: shouldIndex,
      } satisfies RobotsDirectives),
    openGraph: createOpenGraphMetadata({
      title: input.title,
      description: input.description,
      url: alternates.canonical,
      locale,
      type: "article",
      imagePath: input.imagePath,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      authors: input.authors,
    }),
    twitter: createTwitterMetadata({
      title: input.title,
      description: input.description,
      imagePath: input.imagePath,
    }),
    authors: (input.authors ?? [seoConfig.organization.authorName]).map((name) => ({
      name,
    })),
  };
}
