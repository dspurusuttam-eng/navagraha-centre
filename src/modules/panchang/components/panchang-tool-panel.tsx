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
              <label
                htmlFor="panchang-date"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
              >
                Date
              </label>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone="accent">Daily Panchang</Badge>
              <p className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.28)] bg-[rgba(255,255,255,0.86)] px-3 py-1 text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                {result.location.display_name}
              </p>
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card tone="light" className="space-y-2 border-[rgba(184,137,67,0.24)]">
              <Badge tone="trust">Tithi</Badge>
              <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                {result.tithi.name}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                {result.tithi.paksha} Paksha ({result.tithi.progress_percent}%)
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

          <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
            <Badge tone="neutral">Daily Guidance Summary</Badge>
            <div className="grid gap-4 md:grid-cols-3">
              <InsightList title="Spiritual Tone" items={result.summary.spiritual_tone} />
              <InsightList title="Caution Areas" items={result.summary.caution_areas} />
              <InsightList title="Suitable Focus" items={result.summary.suitable_focus} />
            </div>
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
