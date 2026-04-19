"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics/track-event";
import {
  getAcquisitionIntentConfig,
  type AcquisitionIntent,
} from "@/modules/acquisition/intents";
import {
  completeBirthOnboarding,
} from "@/modules/onboarding/actions";
import { initialOnboardingActionState } from "@/modules/onboarding/action-state";
import { preferredLanguageOptions } from "@/modules/onboarding/constants";
import { cn } from "@/lib/cn";

type OnboardingWizardProps = {
  defaults: {
    name: string;
    preferredLanguage: string;
    birthDate: string;
    birthTime: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
    latitude: string;
    longitude: string;
  };
  status: {
    hasBirthProfile: boolean;
    hasChart: boolean;
    generatedAtUtc: string | null;
    providerKey: string | null;
    preferredLanguageLabel: string;
  };
  intent?: AcquisitionIntent | null;
};

type InputMode = "auto" | "manual";
type AutofillStatus = "idle" | "resolving" | "resolved" | "error";

type BirthContextAutofillResponse = {
  resolved: {
    displayName: string;
    latitude: number;
    longitude: number;
    timezoneIana: string;
    locationConfidence: "high" | "moderate" | "low";
  };
};

const steps = [
  {
    id: "identity",
    eyebrow: "Step 1",
    title: "Identity and reading language",
    description:
      "Set the name and preferred reading language that should anchor the private member experience.",
    fields: ["name", "preferredLanguage"],
  },
  {
    id: "birth-moment",
    eyebrow: "Step 2",
    title: "Birth date, time, and timezone",
    description:
      "Capture the core birth moment with clean, deterministic inputs for the initial chart.",
    fields: ["birthDate", "birthTime", "timezone"],
  },
  {
    id: "birthplace",
    eyebrow: "Step 3",
    title: "Birthplace and final review",
    description:
      "Store the birthplace profile that will stay attached to the chart record and later consultation flows.",
    fields: ["city", "region", "country", "latitude", "longitude"],
  },
] as const;

function formatCoordinateInput(value: number) {
  return value.toFixed(6);
}

export function OnboardingWizard({
  defaults,
  status,
  intent = null,
}: Readonly<OnboardingWizardProps>) {
  const [stepIndex, setStepIndex] = useState(0);
  const [birthDate, setBirthDate] = useState(defaults.birthDate);
  const [birthTime, setBirthTime] = useState(defaults.birthTime);
  const [city, setCity] = useState(defaults.city);
  const [region, setRegion] = useState(defaults.region);
  const [country, setCountry] = useState(defaults.country);
  const [timezone, setTimezone] = useState(defaults.timezone);
  const [latitude, setLatitude] = useState(defaults.latitude);
  const [longitude, setLongitude] = useState(defaults.longitude);
  const [timezoneMode, setTimezoneMode] = useState<InputMode>("auto");
  const [coordinatesMode, setCoordinatesMode] = useState<InputMode>("auto");
  const [autofillStatus, setAutofillStatus] = useState<AutofillStatus>("idle");
  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const [resolvedPlaceLabel, setResolvedPlaceLabel] = useState<string | null>(
    null
  );
  const [state, formAction, isPending] = useActionState(
    completeBirthOnboarding,
    initialOnboardingActionState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const autofillAbortControllerRef = useRef<AbortController | null>(null);
  const lastAutofillKeyRef = useRef<string | null>(null);
  const chartCreatedTrackedRef = useRef(false);
  const onboardingStartTrackedRef = useRef(false);
  const router = useRouter();
  const intentConfig = intent ? getAcquisitionIntentConfig(intent) : null;

  useEffect(() => {
    if (onboardingStartTrackedRef.current) {
      return;
    }

    onboardingStartTrackedRef.current = true;
    trackEvent("onboarding_start", {
      page: "/dashboard/onboarding",
      feature: intent ? `acquisition-${intent}` : "member-onboarding",
      intent: intent ?? "general",
    });
  }, [intent]);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      if (!chartCreatedTrackedRef.current) {
        chartCreatedTrackedRef.current = true;
        trackEvent("chart_created", {
          page: "/dashboard/onboarding",
          feature: "birth-onboarding",
          intent: intent ?? "general",
        });
      }

      startTransition(() => {
        router.push(state.redirectTo!);
      });
    }
  }, [router, state.redirectTo, state.status]);

  useEffect(() => {
    return () => {
      autofillAbortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (timezoneMode === "manual" && coordinatesMode === "manual") {
      if (autofillAbortControllerRef.current) {
        autofillAbortControllerRef.current.abort();
      }
      return;
    }

    const hasPlace = Boolean(city.trim() && country.trim());
    const hasBirthMoment = Boolean(birthDate.trim() && birthTime.trim());

    if (!hasPlace || !hasBirthMoment) {
      return;
    }

    const requestKey = [
      birthDate.trim(),
      birthTime.trim(),
      city.trim(),
      region.trim(),
      country.trim(),
      timezoneMode,
      coordinatesMode,
    ].join("|");

    if (lastAutofillKeyRef.current === requestKey) {
      return;
    }

    const timeoutHandle = setTimeout(async () => {
      autofillAbortControllerRef.current?.abort();

      const abortController = new AbortController();
      autofillAbortControllerRef.current = abortController;

      setAutofillStatus("resolving");
      setAutofillMessage("Resolving timezone and coordinates from location...");

      try {
        const response = await fetch("/api/astrology/birth-context/resolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortController.signal,
          body: JSON.stringify({
            birthDate,
            birthTime,
            city,
            region,
            country,
          }),
        });

        const payload = (await response
          .json()
          .catch(() => null)) as
          | BirthContextAutofillResponse
          | {
              error?: {
                message?: string;
              };
            }
          | null;

        if (!response.ok) {
          throw new Error(
            payload &&
              "error" in payload &&
              payload.error?.message &&
              payload.error.message.trim()
              ? payload.error.message
              : "Automatic location resolution could not complete. You can continue with manual timezone and coordinates."
          );
        }

        if (
          !payload ||
          !("resolved" in payload) ||
          !payload.resolved?.timezoneIana
        ) {
          throw new Error(
            "Automatic location resolution returned an incomplete response."
          );
        }

        if (timezoneMode === "auto") {
          setTimezone(payload.resolved.timezoneIana);
        }

        if (coordinatesMode === "auto") {
          setLatitude(formatCoordinateInput(payload.resolved.latitude));
          setLongitude(formatCoordinateInput(payload.resolved.longitude));
        }

        setResolvedPlaceLabel(payload.resolved.displayName);
        setAutofillStatus("resolved");
        setAutofillMessage("Timezone and coordinates were auto-filled.");
        lastAutofillKeyRef.current = requestKey;
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setAutofillStatus("error");
        setAutofillMessage(
          error instanceof Error
            ? error.message
            : "Automatic location resolution is unavailable. You can continue with manual timezone and coordinates."
        );
        setResolvedPlaceLabel(null);
      }
    }, 450);

    return () => {
      clearTimeout(timeoutHandle);
    };
  }, [birthDate, birthTime, city, region, country, timezoneMode, coordinatesMode]);

  function validateCurrentStep() {
    const form = formRef.current;

    if (!form) {
      return true;
    }

    return steps[stepIndex].fields.every((fieldName) => {
      const field = form.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >(`[name="${fieldName}"]`);

      if (!field) {
        return true;
      }

      return field.reportValidity();
    });
  }

  function goToNextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  const step = steps[stepIndex];
  const progressPercent = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
      <form ref={formRef} action={formAction} className="space-y-6">
        <input type="hidden" name="timezoneMode" value={timezoneMode} />
        <input type="hidden" name="coordinatesMode" value={coordinatesMode} />
        <Card className="space-y-6">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {step.eyebrow}
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {step.title}
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {step.description}
            </p>
            {intentConfig ? (
              <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                <span className="text-[color:var(--color-foreground)]">
                  {intentConfig.label}:
                </span>{" "}
                {intentConfig.onboardingDescription}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Progress
              </p>
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                Step {stepIndex + 1} of {steps.length}
              </p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.08)]">
              <div
                className="h-full rounded-full bg-[color:var(--color-accent)] transition-all [transition-duration:var(--motion-duration-base)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div
              className={cn("grid gap-5", step.id !== "identity" && "hidden")}
            >
              <div className="space-y-2">
                <label
                  htmlFor="onboarding-name"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Full Name
                </label>
                <Input
                  id="onboarding-name"
                  name="name"
                  defaultValue={defaults.name}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-language"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Preferred Language
                </label>
                <Select
                  id="onboarding-language"
                  name="preferredLanguage"
                  defaultValue={defaults.preferredLanguage}
                  required
                >
                  {preferredLanguageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-5 md:grid-cols-2",
                step.id !== "birth-moment" && "hidden"
              )}
            >
              <div className="space-y-2">
                <label
                  htmlFor="onboarding-birth-date"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Birth Date
                </label>
                <Input
                  id="onboarding-birth-date"
                  name="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(event) => {
                    setBirthDate(event.target.value);
                    lastAutofillKeyRef.current = null;
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-birth-time"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Birth Time
                </label>
                <Input
                  id="onboarding-birth-time"
                  name="birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(event) => {
                    setBirthTime(event.target.value);
                    lastAutofillKeyRef.current = null;
                  }}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="onboarding-timezone"
                    className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                  >
                    Timezone
                  </label>
                  <button
                    type="button"
                    className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-foreground)]"
                    onClick={() => {
                      setTimezoneMode((current) =>
                        current === "manual" ? "auto" : "manual"
                      );
                      lastAutofillKeyRef.current = null;
                    }}
                  >
                    {timezoneMode === "manual"
                      ? "Use auto timezone"
                      : "Edit timezone manually"}
                  </button>
                </div>
                <Input
                  id="onboarding-timezone"
                  name="timezone"
                  value={timezone}
                  onChange={(event) => {
                    setTimezone(event.target.value);
                  }}
                  placeholder="Asia/Kolkata"
                  readOnly={timezoneMode === "auto"}
                  required={timezoneMode === "manual"}
                />
                <p className="text-[0.72rem] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {timezoneMode === "auto"
                    ? "Timezone is auto-derived from the resolved birth location."
                    : "Manual timezone override is enabled."}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-5 md:grid-cols-2",
                step.id !== "birthplace" && "hidden"
              )}
            >
              <div className="space-y-2">
                <label
                  htmlFor="onboarding-city"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Birth City
                </label>
                <Input
                  id="onboarding-city"
                  name="city"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    lastAutofillKeyRef.current = null;
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-region"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Region
                </label>
                <Input
                  id="onboarding-region"
                  name="region"
                  value={region}
                  onChange={(event) => {
                    setRegion(event.target.value);
                    lastAutofillKeyRef.current = null;
                  }}
                  placeholder="State or province"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="onboarding-country"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Country
                </label>
                <Input
                  id="onboarding-country"
                  name="country"
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                    lastAutofillKeyRef.current = null;
                  }}
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Coordinates
                </p>
                <button
                  type="button"
                  className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-foreground)]"
                  onClick={() => {
                    setCoordinatesMode((current) =>
                      current === "manual" ? "auto" : "manual"
                    );
                    lastAutofillKeyRef.current = null;
                  }}
                >
                  {coordinatesMode === "manual"
                    ? "Use auto coordinates"
                    : "Edit coordinates manually"}
                </button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-latitude"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Latitude
                </label>
                <Input
                  id="onboarding-latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(event) => {
                    setLatitude(event.target.value);
                  }}
                  readOnly={coordinatesMode === "auto"}
                  placeholder="26.1445"
                  required={coordinatesMode === "manual"}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="onboarding-longitude"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Longitude
                </label>
                <Input
                  id="onboarding-longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(event) => {
                    setLongitude(event.target.value);
                  }}
                  readOnly={coordinatesMode === "auto"}
                  placeholder="91.7362"
                  required={coordinatesMode === "manual"}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <p className="text-[0.72rem] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {coordinatesMode === "auto"
                    ? "Latitude and longitude are auto-derived from the resolved birth location."
                    : "Manual coordinate override is enabled."}
                </p>
                {resolvedPlaceLabel ? (
                  <p className="text-[0.72rem] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    Resolved place:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {resolvedPlaceLabel}
                    </span>
                  </p>
                ) : null}
                {autofillMessage && step.id === "birthplace" ? (
                  <p
                    className="rounded-[var(--radius-lg)] border px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
                    style={{
                      borderColor:
                        autofillStatus === "error"
                          ? "rgba(205,143,143,0.35)"
                          : "rgba(215,187,131,0.25)",
                      background:
                        autofillStatus === "error"
                          ? "rgba(90,30,30,0.2)"
                          : "rgba(215,187,131,0.08)",
                    }}
                  >
                    {autofillMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {state.message ? (
            <p
              aria-live="polite"
              className="rounded-[var(--radius-lg)] border px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
              style={{
                borderColor:
                  state.status === "error"
                    ? "rgba(205,143,143,0.35)"
                    : "rgba(215,187,131,0.25)",
                background:
                  state.status === "error"
                    ? "rgba(90,30,30,0.2)"
                    : "rgba(215,187,131,0.08)",
              }}
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                tone="ghost"
                disabled={stepIndex === 0 || isPending}
                onClick={() =>
                  setStepIndex((current) => Math.max(current - 1, 0))
                }
              >
                Back
              </Button>

              {stepIndex < steps.length - 1 ? (
                <Button
                  type="button"
                  tone="secondary"
                  disabled={isPending}
                  onClick={goToNextStep}
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending
                    ? "Generating Chart..."
                    : "Save and Generate Chart"}
                </Button>
              )}
            </div>

            <Link
              href="/dashboard/chart"
              className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-foreground)]"
            >
              View current chart overview
            </Link>
          </div>
        </Card>
      </form>

      <div className="space-y-6">
        <Card tone="accent" className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Current Status
            </p>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              A private chart foundation with calm structure.
            </h3>
          </div>

          <div className="space-y-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {intentConfig ? (
              <p>
                Current intent:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {intentConfig.label}
                </span>
              </p>
            ) : null}
            <p>
              Preferred language:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.preferredLanguageLabel}
              </span>
            </p>
            <p>
              Birth profile:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.hasBirthProfile ? "Saved" : "Not added yet"}
              </span>
            </p>
            <p>
              Initial chart:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.hasChart ? "Ready" : "Pending"}
              </span>
            </p>
            <p>
              Provider:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {status.providerKey ?? "Will be selected after save"}
              </span>
            </p>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            What happens next
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {intentConfig ? (
              <p>{intentConfig.onboardingTitle}</p>
            ) : null}
            <p>
              The wizard stores a primary birth profile on your protected
              account.
            </p>
            <p>
              The initial chart is generated server-side from the exact birth
              coordinates and attached to your member record for later phases.
            </p>
            <p>
              After save, you will be taken directly to the chart overview page.
            </p>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Trust
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>Birth details are stored on your protected account only.</p>
            <p>Timezone and coordinates are auto-resolved for calculation accuracy.</p>
            <p>Manual overrides stay optional for advanced correction needs.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
