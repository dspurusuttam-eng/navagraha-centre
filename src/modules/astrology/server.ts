import "server-only";

export {
  createAstrologyService,
  getAstrologyService,
  getDefaultAstrologyProviderKey,
  listAvailableAstrologyProviders,
} from "@/modules/astrology/service";
export type {
  AstrologyProviderKey,
  AstrologyService,
} from "@/modules/astrology/service";
