"use client";

import {
  applyConsentPatch,
  consentCookieName,
  deserializeConsentPreferences,
  getDefaultConsentPreferences,
  serializeConsentPreferences,
  type ConsentPreferencePatch,
  type ConsentPreferences,
} from "@/lib/consent/consent-preferences";

function readCookieValue(cookieName: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${encodeURIComponent(cookieName)}=`;
  const parts = document.cookie.split(/;\s*/);

  for (const part of parts) {
    if (part.startsWith(cookiePrefix)) {
      return part.slice(cookiePrefix.length);
    }

    if (part.startsWith(`${cookieName}=`)) {
      return part.slice(cookieName.length + 1);
    }
  }

  return null;
}

function writeCookieValue(
  cookieName: string,
  rawValue: string,
  maxAgeSeconds = 60 * 60 * 24 * 365
) {
  if (typeof document === "undefined") {
    return;
  }

  const isSecure = window.location.protocol === "https:";
  const cookieParts = [
    `${encodeURIComponent(cookieName)}=${rawValue}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isSecure) {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
}

export function getConsentPreferences(): ConsentPreferences {
  if (typeof window === "undefined") {
    return getDefaultConsentPreferences();
  }

  return deserializeConsentPreferences(readCookieValue(consentCookieName));
}

export function setConsentPreferences(
  patch: ConsentPreferencePatch
): ConsentPreferences {
  const current = getConsentPreferences();
  const next = applyConsentPatch(current, patch);

  writeCookieValue(
    consentCookieName,
    serializeConsentPreferences({
      ...next,
      updatedAtUtc: new Date().toISOString(),
    })
  );

  return {
    ...next,
    updatedAtUtc: new Date().toISOString(),
  };
}

export function resetConsentPreferences(): ConsentPreferences {
  const next = getDefaultConsentPreferences();
  const stamped = {
    ...next,
    updatedAtUtc: new Date().toISOString(),
  } satisfies ConsentPreferences;

  writeCookieValue(consentCookieName, serializeConsentPreferences(stamped));

  return stamped;
}

