import "server-only";

import { cookies } from "next/headers";
import {
  canLoadAds,
  canLoadExternalAnalytics,
  canPersonalizeExperience,
  consentCookieName,
  deserializeConsentPreferences,
  type ConsentPreferences,
} from "@/lib/consent/consent-preferences";

export async function getConsentPreferencesFromRequest(): Promise<ConsentPreferences> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(consentCookieName)?.value ?? null;

  return deserializeConsentPreferences(rawValue);
}

export async function hasAnalyticsConsentFromRequest() {
  const preferences = await getConsentPreferencesFromRequest();

  return canLoadExternalAnalytics(preferences);
}

export async function hasAdvertisingConsentFromRequest() {
  const preferences = await getConsentPreferencesFromRequest();

  return canLoadAds(preferences);
}

export async function hasPersonalizationConsentFromRequest() {
  const preferences = await getConsentPreferencesFromRequest();

  return canPersonalizeExperience(preferences);
}
