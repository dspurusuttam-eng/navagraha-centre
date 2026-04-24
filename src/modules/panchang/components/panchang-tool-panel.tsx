"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import { getApiErrorMessage } from "@/lib/api/http";
import type { PanchangContextOutput } from "@/modules/panchang";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PanchangFormState = {
  date: string;
  place: string;
};

type PanchangApiSuccessPayload = {
  data?: PanchangContextOutput;
};

function getLocalTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialFormState: PanchangFormState = {
  date: getLocalTodayIso(),
  place: "",
};

function InsightList({
  title,
  items,
}: Readonly<{ title: string; items: readonly string[] }>) {
  return (
    <Card tone="light" className="space-y-3 border-[rgba(184,137,67,0.22)]">
      <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${title}-${item}`}
            className="rounded-[var(--radius-md)] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,255,255,0.88)] px-3 py-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
          >
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SectionHeading({
  badge,
  title,
  description,
}: Readonly<{ badge: string; title: string; description: string }>) {
  return (
    <div className="space-y-2">
      <Badge tone="neutral">{badge}</Badge>
      <h3 className="text-[length:var(--font-size-title-xs)] font-semibold text-[var(--color-ink-strong)]">
        {title}
      </h3>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
        {description}
      </p>
    </div>
  );
}

function resolveGuidance(result: PanchangContextOutput) {
  const maybeGuidance = (
    result as PanchangContextOutput & {
      guidance?: PanchangContextOutput["guidance"];
    }
  ).guidance;

  if (
    maybeGuidance &&
    Array.isArray(maybeGuidance.spiritual_tone) &&
    Array.isArray(maybeGuidance.suitable_focus) &&
    Array.isArray(maybeGuidance.caution_areas) &&
    Array.isArray(maybeGuidance.observance_hint)
  ) {
    return maybeGuidance;
  }

  return {
    spiritual_tone: result.summary.spiritual_tone,
    suitable_focus: result.summary.suitable_focus,
    caution_areas: result.summary.caution_areas,
    observance_hint: [],
    daily_quality:
      "Balanced and practical; use Panchang guidance with measured judgment.",
    day_feel: "Balanced",
  };
}

function resolveAdvancedTimings(result: PanchangContextOutput) {
  const maybeAdvancedTimings = (
    result as PanchangContextOutput & {
      advanced_timings?: PanchangContextOutput["advanced_timings"];
    }
  ).advanced_timings;

  if (
    maybeAdvancedTimings &&
    maybeAdvancedTimings.rahu_kaal &&
    maybeAdvancedTimings.gulika_kaal &&
    maybeAdvancedTimings.yamaganda &&
    maybeAdvancedTimings.abhijit_muhurta
  ) {
    return maybeAdvancedTimings;
  }

  return null;
}

async function fetchPanchang(input: PanchangFormState) {
  const response = await fetch("/api/astrology/panchang", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => null)) as
    | PanchangApiSuccessPayload
    | null;

  if (!response.ok) {
    return {
      success: false as const,
      message: getApiErrorMessage(
        payload,
        "Panchang calculation failed. Please review inputs and retry."
      ),
    };
  }

  if (!payload?.data) {
    return {
      success: false as const,
      message:
        "Panchang calculation returned an empty response. Please try again.",
    };
  }

  return {
    success: true as const,
    data: payload.data,
  };
}

export function PanchangToolPanel() {
  const [formState, setFormState] = useState<PanchangFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PanchangContextOutput | null>(null);
  const guidance = result ? resolveGuidance(result) : null;
  const advancedTimings = result ? resolveAdvancedTimings(result) : null;

  function handleInputChange(field: keyof PanchangFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setFormState(initialFormState);
    setResult(null);
    setErrorMessage(null);
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-reset",
    });
  }

  function focusDateInput() {
    requestAnimationFrame(() => {
      const dateInput = document.getElementById(
        "panchang-date"
      ) as HTMLInputElement | null;
      dateInput?.focus();
    });
  }

  function applyTodayShortcut() {
    setFormState((current) => ({
      ...current,
      date: getLocalTodayIso(),
    }));
    setResult(null);
    setErrorMessage(null);
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-today-shortcut",
    });
    focusDateInput();
  }

  function checkAnotherDate() {
    setResult(null);
    setErrorMessage(null);
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-check-another-date",
    });
    focusDateInput();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const outcome = await fetchPanchang({
      date: formState.date.trim(),
      place: formState.place.trim(),
    }).catch(() => ({
      success: false as const,
      message: "Panchang request failed unexpectedly. Please try again.",
    }));

    setIsSubmitting(false);

    if (!outcome.success) {
      setResult(null);
      setErrorMessage(outcome.message);
      trackEvent("cta_click", {
        page: "/panchang",
        feature: "panchang-calculate-error",
      });
      return;
    }

    setResult(outcome.data);
    trackEvent("cta_click", {
      page: "/panchang",
      feature: "panchang-calculate-success",
      tithi: outcome.data.tithi.name,
      nakshatra: outcome.data.nakshatra.name,
    });
    trackEvent("panchang_view", {
      page: "/panchang",
      feature: "panchang-tool-result",
      asOfDate: outcome.data.as_of_date,
      timezone: outcome.data.location.timezone_iana,
    });
    trackEvent("daily_panchang_view", {
      page: "/panchang",
      feature: "panchang-tool-result",
      dayFeel: outcome.data.guidance.day_feel,
      tithi: outcome.data.tithi.name,
    });
  }

  return (
    <div className="space-y-6">
      <Card
        tone="light"
        className="space-y-4 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.95)]"
      >
        <div className="space-y-2">
          <Badge tone="trust">Panchang Input</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Enter a date and place (for example: Guwahati, Assam, India). The tool
            resolves timezone and coordinates, then calculates daily Panchang factors.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="panchang-date"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
                >
                  Date
                </label>
                <Button
                  type="button"
                  tone="tertiary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={applyTodayShortcut}
                >
                  Today
                </Button>
              </div>
              <Input
                id="panchang-date"
                name="date"
                type="date"
                value={formState.date}
                onChange={(event) =>
                  handleInputChange("date", event.currentTarget.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="panchang-place"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
              >
                Place
              </label>
              <Input
                id="panchang-place"
                name="place"
                value={formState.place}
                onChange={(event) =>
                  handleInputChange("place", event.currentTarget.value)
                }
                placeholder="City, Region/State, Country"
                required
              />
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                Timezone is auto-resolved from place for location-accurate sunrise and
                sunset.
              </p>
            </div>
          </div>

          {errorMessage ? (
            <p
              aria-live="polite"
              className="rounded-[var(--radius-lg)] border border-[rgba(188,104,104,0.34)] bg-[rgba(244,231,231,0.86)] px-4 py-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-strong)]"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Calculating..." : "Generate Panchang"}
            </Button>
            {result ? (
              <Button
                size="lg"
                type="button"
                tone="secondary"
                className="w-full sm:w-auto"
                onClick={checkAnotherDate}
              >
                Check Another Date
              </Button>
            ) : null}
            <Button
              size="lg"
              type="button"
              tone="secondary"
              className="w-full sm:w-auto"
              onClick={resetForm}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {result ? (
        <div className="space-y-5">
          <Card
            tone="accent"
            className="space-y-5 border-[rgba(184,137,67,0.34)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)]"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone="accent">Daily Panchang</Badge>
                <p className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.28)] bg-[rgba(255,255,255,0.86)] px-3 py-1 text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {result.location.display_name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <p className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.9)] px-3 py-1 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Date: {result.as_of_date}
                </p>
                <p className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.9)] px-3 py-1 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Timezone: {result.location.timezone_iana}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.22)] bg-[rgba(255,255,255,0.88)] p-4">
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Sunrise
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {result.sunrise.local_time}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.22)] bg-[rgba(255,255,255,0.88)] p-4">
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Sunset
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {result.sunset.local_time}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.22)] bg-[rgba(255,255,255,0.88)] p-4">
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Moon Sign
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {result.moon_sign}
                </p>
              </div>
            </div>
          </Card>

          <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
            <SectionHeading
              badge="Core Panchang Values"
              title="Current daily factors"
              description="Core Panchang values are shown in one clear grid for quick interpretation."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <Badge tone="trust">Tithi</Badge>
                <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                  {result.tithi.name}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  Progress {result.tithi.progress_percent}%
                </p>
              </Card>
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <Badge tone="trust">Paksha</Badge>
                <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                  {result.paksha}
                </p>
              </Card>
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <Badge tone="trust">Vara</Badge>
                <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                  {result.vara}
                </p>
              </Card>
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <Badge tone="trust">Nakshatra</Badge>
                <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                  {result.nakshatra.name}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  Pada {result.nakshatra.pada} ({result.nakshatra.progress_percent}%)
                </p>
              </Card>
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <Badge tone="trust">Yoga</Badge>
                <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                  {result.yoga.name}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  Progress {result.yoga.progress_percent}%
                </p>
              </Card>
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <Badge tone="trust">Karana</Badge>
                <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                  {result.karana.name}
                </p>
              </Card>
            </div>
          </Card>

          <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
            <SectionHeading
              badge="Transitions"
              title="Next Panchang transitions"
              description="Upcoming transition timings help plan the day with better timing awareness."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "Next Tithi Change",
                  value: result.transitions.next_tithi_change.local_date_time,
                  meta: result.transitions.next_tithi_change.local_time,
                },
                {
                  label: "Next Nakshatra Change",
                  value: result.transitions.next_nakshatra_change.local_date_time,
                  meta: result.transitions.next_nakshatra_change.local_time,
                },
                {
                  label: "Next Yoga Change",
                  value: result.transitions.next_yoga_change.local_date_time,
                  meta: result.transitions.next_yoga_change.local_time,
                },
                {
                  label: "Next Karana Change",
                  value: result.transitions.next_karana_change.local_date_time,
                  meta: result.transitions.next_karana_change.local_time,
                },
              ].map((transition) => (
                <Card
                  key={transition.label}
                  tone="light"
                  className="space-y-2 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.86)]"
                >
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                    {transition.label}
                  </p>
                  <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                    {transition.value}
                  </p>
                  <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                    Local time: {transition.meta}
                  </p>
                </Card>
              ))}
            </div>
          </Card>

          {advancedTimings ? (
            <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
              <SectionHeading
                badge="Advanced Timings"
                title="Daily spiritual timing windows"
                description="These windows are practical timing references and should be used with calm judgment."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Rahu Kaal",
                    value: advancedTimings.rahu_kaal,
                  },
                  {
                    label: "Gulika Kaal",
                    value: advancedTimings.gulika_kaal,
                  },
                  {
                    label: "Yamaganda",
                    value: advancedTimings.yamaganda,
                  },
                  {
                    label: "Abhijit Muhurta",
                    value: advancedTimings.abhijit_muhurta,
                  },
                ].map((item) => (
                  <Card
                    key={item.label}
                    tone="light"
                    className="space-y-2 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.86)]"
                  >
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                      {item.label}
                    </p>
                    <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                      {item.value.start_local_time} - {item.value.end_local_time}
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                      {item.value.start_local_date_time}
                    </p>
                  </Card>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InsightList
                  title="Auspicious Window"
                  items={advancedTimings.timing_summary.auspicious_windows}
                />
                <InsightList
                  title="Caution Windows"
                  items={advancedTimings.timing_summary.caution_windows}
                />
              </div>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {advancedTimings.timing_summary.note}
              </p>
            </Card>
          ) : null}

          <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
            <SectionHeading
              badge="Daily Guidance"
              title="Structured daily guidance"
              description="Conservative guidance based on the current Panchang state and transitions."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Day Feel
                </p>
                <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                  {guidance?.day_feel}
                </p>
              </Card>
              <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Overall Daily Quality
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-strong)]">
                  {guidance?.daily_quality}
                </p>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <InsightList title="Spiritual Tone" items={guidance?.spiritual_tone ?? []} />
              <InsightList title="Caution Areas" items={guidance?.caution_areas ?? []} />
              <InsightList title="Suitable Focus" items={guidance?.suitable_focus ?? []} />
            </div>
            {(guidance?.observance_hint.length ?? 0) > 0 ? (
              <InsightList
                title="Observance Hints"
                items={guidance?.observance_hint ?? []}
              />
            ) : null}
          </Card>

          <Card
            tone="accent"
            className="grid gap-5 border-[rgba(184,137,67,0.3)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="space-y-2">
              <Badge tone="accent">Continue Journey</Badge>
              <p className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
                Continue from daily Panchang into Kundli, Rashifal, and NAVAGRAHA AI.
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                Panchang gives day structure. Chart and AI layers add deeper personal context.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{
                  page: "/panchang",
                  feature: "panchang-result-kundli",
                }}
                className={buttonStyles({
                  size: "sm",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Your Kundli
              </TrackedLink>
              <TrackedLink
                href="/rashifal"
                eventName="cta_click"
                eventPayload={{
                  page: "/panchang",
                  feature: "panchang-result-rashifal",
                }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Check Rashifal
              </TrackedLink>
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{
                  page: "/panchang",
                  feature: "panchang-result-ai",
                }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Try NAVAGRAHA AI
              </TrackedLink>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
