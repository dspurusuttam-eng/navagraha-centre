import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import { seoConfig } from "@/lib/seo/seo-config";
import { resolveLocale } from "@/modules/localization/config";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  locale?: string | null;
  explicitLocalePrefix?: boolean;
  index?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  locale,
  explicitLocalePrefix,
  index,
}: PageMetadataInput): Metadata {
  return createPageMetadata({
    title,
    description,
    path,
    keywords,
    locale,
    explicitLocalePrefix,
    index,
  });
}

export function buildLocalizedRootMetadata(input: {
  locale?: string | null;
  title: string;
  description: string;
  path?: string;
  explicitLocalePrefix?: boolean;
}) {
  const resolvedLocale = resolveLocale(input.locale);
  const path = input.path ?? "/";

  return {
    ...createPageMetadata({
      title: input.title,
      description: input.description,
      path,
      locale: resolvedLocale,
      explicitLocalePrefix: input.explicitLocalePrefix,
      index: true,
    }),
    title: {
      default: input.title,
      template: seoConfig.titleTemplate,
    },
  } satisfies Metadata;
}
