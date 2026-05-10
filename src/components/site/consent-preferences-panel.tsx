"use client";

import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  resetConsentPreferences,
  useConsentPreferences,
  setConsentPreferences,
} from "@/lib/consent/consent-client";

const consentItems = [
  {
    key: "analytics",
    label: "Analytics",
    description: "Helps us measure visits, tools, and public page engagement.",
  },
  {
    key: "advertising",
    label: "Advertising",
    description: "Allows ad features only when monetization is enabled later.",
  },
  {
    key: "personalization",
    label: "Personalization",
    description: "Lets the site tailor non-sensitive interface behavior.",
  },
] as const;

export function ConsentPreferencesPanel() {
  const preferences = useConsentPreferences();
  const [isSaving, setIsSaving] = useState(false);

  const activeLabels = consentItems
    .filter((item) => Boolean(preferences[item.key]))
    .map((item) => item.label);

  const statusLabel =
    activeLabels.length > 0 ? activeLabels.join(", ") : "Necessary only";

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Consent Preferences
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
          Manage analytics and advertising consent without sharing private astrology data.
        </h2>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Necessary cookies remain enabled. Analytics, advertising, and personalization stay off until you opt in.
        </p>
      </div>

      <div className="grid gap-3">
        {consentItems.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-3"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[color:var(--color-border)] text-[color:var(--color-accent)]"
              checked={preferences[item.key]}
              onChange={(event) => {
                setConsentPreferences({
                  analytics:
                    item.key === "analytics"
                      ? event.target.checked
                      : preferences.analytics,
                  advertising:
                    item.key === "advertising"
                      ? event.target.checked
                      : preferences.advertising,
                  personalization:
                    item.key === "personalization"
                      ? event.target.checked
                      : preferences.personalization,
                });
              }}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[color:var(--color-foreground)]">
                {item.label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-[color:var(--color-muted)]">
                {item.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonStyles({ size: "sm" })}
          disabled={isSaving}
          onClick={() => {
            setIsSaving(true);
            try {
              setConsentPreferences({
                analytics: preferences.analytics,
                advertising: preferences.advertising,
                personalization: preferences.personalization,
              });
            } finally {
              setIsSaving(false);
            }
          }}
        >
          Save preferences
        </button>
        <button
          type="button"
          className={buttonStyles({ size: "sm", tone: "secondary" })}
          disabled={isSaving}
          onClick={() => {
            setIsSaving(true);
            try {
              resetConsentPreferences();
            } finally {
              setIsSaving(false);
            }
          }}
        >
          Necessary only
        </button>
      </div>

      <p className="text-xs text-[color:var(--color-muted)]">
        Current status: <span className="text-[color:var(--color-foreground)]">{statusLabel}</span>
      </p>
    </Card>
  );
}
