import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

type AdminMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function buildAdminMetadata(input: AdminMetadataInput): Metadata {
  const metadata = buildPageMetadata(input);

  return {
    ...metadata,
    robots: {
      index: false,
      follow: false,
    },
  };
}
