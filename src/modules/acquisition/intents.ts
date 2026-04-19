export const acquisitionIntentConfig = {
  "free-kundli-online": {
    label: "Free Kundli Online",
    ctaLabel: "Generate Your Kundli",
    onboardingTitle: "Start with a complete Kundli foundation.",
    onboardingDescription:
      "Complete your birth profile once, then continue into your saved chart and protected astrology surfaces.",
  },
  "kundli-by-date-of-birth": {
    label: "Kundli by Date of Birth",
    ctaLabel: "Build My Birth Chart",
    onboardingTitle: "Use your birth details to build a validated chart.",
    onboardingDescription:
      "Add birth date, time, and place so the chart pipeline can resolve location, timezone, and sidereal positions correctly.",
  },
  "marriage-compatibility": {
    label: "Marriage Compatibility",
    ctaLabel: "Check Compatibility",
    onboardingTitle: "Prepare the chart context for compatibility review.",
    onboardingDescription:
      "Finish your chart setup first so later compatibility guidance and consultation routing stay grounded in saved chart context.",
  },
  "career-prediction": {
    label: "Career Prediction",
    ctaLabel: "Start Career Reading",
    onboardingTitle: "Create the chart context for career interpretation.",
    onboardingDescription:
      "This onboarding flow prepares the chart foundation used for career-focused assistant, report, and premium depth surfaces.",
  },
  "daily-rashifal": {
    label: "Daily Rashifal",
    ctaLabel: "Get Daily Rashifal",
    onboardingTitle: "Turn daily curiosity into chart-aware guidance.",
    onboardingDescription:
      "Once your chart is saved, daily and current-cycle guidance can stay tied to your actual birth context instead of generic text.",
  },
  "love-horoscope": {
    label: "Love Horoscope",
    ctaLabel: "See Love Insights",
    onboardingTitle: "Build the chart base for relationship insight.",
    onboardingDescription:
      "Save your core birth details once so later love, compatibility, and follow-up guidance can stay consistent across the app.",
  },
} as const;

export type AcquisitionIntent = keyof typeof acquisitionIntentConfig;

export function isAcquisitionIntent(
  value: string | null | undefined
): value is AcquisitionIntent {
  return Boolean(value && value in acquisitionIntentConfig);
}

export function getAcquisitionIntent(
  value: string | null | undefined
): AcquisitionIntent | null {
  return isAcquisitionIntent(value) ? value : null;
}

export function getAcquisitionIntentConfig(intent: AcquisitionIntent) {
  return acquisitionIntentConfig[intent];
}

export function buildAcquisitionOnboardingPath(intent: AcquisitionIntent) {
  return `/dashboard/onboarding?intent=${intent}`;
}

export function buildAcquisitionSignUpPath(intent: AcquisitionIntent) {
  const next = buildAcquisitionOnboardingPath(intent);
  return `/sign-up?intent=${intent}&next=${encodeURIComponent(next)}`;
}

export function buildAcquisitionSignInPath(intent: AcquisitionIntent) {
  const next = buildAcquisitionOnboardingPath(intent);
  return `/sign-in?intent=${intent}&next=${encodeURIComponent(next)}`;
}
