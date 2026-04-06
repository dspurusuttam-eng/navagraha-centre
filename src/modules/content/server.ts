import "server-only";

import { catalogContentAdapter } from "@/modules/content/adapter";

export function getContentAdapter() {
  return catalogContentAdapter;
}
