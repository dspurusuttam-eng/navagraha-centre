export {
  applyConsentPatch,
  canLoadAds,
  canLoadExternalAnalytics,
  canPersonalizeExperience,
  consentCookieName,
  consentStorageVersion,
  deserializeConsentPreferences,
  getDefaultConsentPreferences,
  hasAdvertisingConsent,
  hasAnalyticsConsent,
  hasPersonalizationConsent,
  normalizeConsentPreferences,
  serializeConsentPreferences,
  stampConsentPreferences,
  type ConsentCategoryKey,
  type ConsentPreferencePatch,
  type ConsentPreferences,
} from "@/lib/consent/consent-preferences";

export {
  getConsentPreferences,
  resetConsentPreferences,
  setConsentPreferences,
} from "@/lib/consent/consent-client";

export {
  getConsentPreferencesFromRequest,
  hasAdvertisingConsentFromRequest,
  hasAnalyticsConsentFromRequest,
  hasPersonalizationConsentFromRequest,
} from "@/lib/consent/consent-server";
