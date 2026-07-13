export const PREMIUM_PANCHANG_ADAPTER_VERSION =
  "card9-premium-panchang-adapter/v1" as const;

export type PremiumPanchangAdapterRequest = {
  adapterVersion: typeof PREMIUM_PANCHANG_ADAPTER_VERSION;
};
