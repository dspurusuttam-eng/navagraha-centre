"use client";

import { useState, type FormEvent } from "react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics/track-event";
import { getApiErrorMessage } from "@/lib/api/http";
import type { MuhurtaLiteOutput } from "@/modules/muhurta-lite";

type MuhurtaLiteFormState = {
  date: string;
  place: string;
};

type MuhurtaLiteApiSuccessPayload = {
  data?: MuhurtaLiteOutput;
};

function getLocalTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialFormState: MuhurtaLiteFormState = {
  date: getLocalTodayIso(),
  place: "",
};

async function fetchMuhurtaLite(input: MuhurtaLiteFormState) {
  const response = await fetch("/api/astrology/muhurta-lite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | MuhurtaLiteApiSuccessPayload
    | null;

  if (!response.ok) {
    return {
      success: false as const,
      message: getApiErrorMessage(
        payload,
        "Muhurta-lite calculation failed. Please review inputs and retry."
      ),
    };
  }

  if (!payload?.data) {
    return {
      success: false as const,
      message: "Muhurta-lite calculation returned an empty response.",
    };
  }

  return {
    success: true as const,
    data: payload.data,
  };
}

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

export function MuhurtaLiteToolPanel() {
  const [formState, setFormState] = useState<MuhurtaLiteFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<MuhurtaLiteOutput | null>(null);

  function handleInputChange(field: keyof MuhurtaLiteFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function focusDateInput() {
    requestAnimationFrame(() => {
      const dateInput = document.getElementById(
        "muhurta-lite-date"
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
      page: "/muhurta",
      feature: "muhurta-today-shortcut",
    });
    focusDateInput();
  }

  function resetForm() {
    setFormState(initialFormState);
    setResult(null);
    setErrorMessage(null);
    trackEvent("cta_click", {
      page: "/muhurta",
      feature: "muhurta-reset",
    });
  }

  function checkAnotherDate() {
    setResult(null);
    setErrorMessage(null);
    trackEvent("cta_click", {
      page: "/muhurta",
      feature: "muhurta-check-another-date",
    });
    focusDateInput();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const outcome = await fetchMuhurtaLite({
      date: formState.date.trim(),
      place: formState.place.trim(),
    }).catch(() => ({
      success: false as const,
      message: "Muhurta-lite request failed unexpectedly. Please try again.",
    }));

    setIsSubmitting(false);

    if (!outcome.success) {
      setResult(null);
      setErrorMessage(outcome.message);
      trackEvent("cta_click", {
        page: "/muhurta",
        feature: "muhurta-calculate-error",
      });
      return;
    }

    setResult(outcome.data);
    trackEvent("cta_click", {
      page: "/muhurta",
      feature: "muhurta-calculate-success",
    });
  }

  return (
    <div className="space-y-6">
      <Card
        tone="light"
        className="space-y-4 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.95)]"
      >
        <div className="space-y-2">
          <Badge tone="trust">Muhurta-lite Input</Badge>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Enter date and place to generate practical daily timing windows.
            Place input is resolved to coordinates and timezone automatically.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="muhurta-lite-date"
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
                id="muhurta-lite-date"
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
                htmlFor="muhurta-lite-place"
                className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
              >
                Place
              </label>
              <Input
                id="muhurta-lite-place"
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
              {isSubmitting ? "Calculating..." : "Generate Time Tools"}
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
                <Badge tone="accent">Muhurta-lite Result</Badge>
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

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </Card>

          <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
            <div className="space-y-2">
              <Badge tone="neutral">Daily Timing Windows</Badge>
              <h3 className="text-[length:var(--font-size-title-xs)] font-semibold text-[var(--color-ink-strong)]">
                Core Muhurta-lite time tools
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                result.rahu_kaal,
                result.gulika_kaal,
                result.yamaganda,
                result.abhijit_muhurta,
              ].map((item) => (
                <Card
                  key={item.label}
                  tone="light"
                  className="space-y-2 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.86)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                      {item.label.split(":")[0]}
                    </p>
                    <Badge tone={item.category === "caution" ? "neutral" : "trust"}>
                      {item.category === "caution" ? "Caution" : "Supportive"}
                    </Badge>
                  </div>
                  <p className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                    {item.start_local_time} - {item.end_local_time}
                  </p>
                  <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                    {item.start_local_date_time}
                  </p>
                </Card>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <InsightList title="Supportive Windows" items={result.summary.supportive_windows} />
            <InsightList title="Caution Windows" items={result.summary.caution_windows} />
          </div>

          <InsightList
            title="Daily Timing Notes"
            items={result.summary.daily_timing_notes}
          />

          <Card
            tone="accent"
            className="grid gap-5 border-[rgba(184,137,67,0.3)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="space-y-2">
              <Badge tone="accent">Continue Journey</Badge>
              <p className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
                Pair Muhurta-lite with Panchang, Kundli, and NAVAGRAHA AI for deeper context.
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                Time windows support planning, while chart and AI layers improve personalization.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/panchang"
                eventName="cta_click"
                eventPayload={{ page: "/muhurta", feature: "muhurta-result-panchang" }}
                className={buttonStyles({
                  size: "sm",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Open Panchang
              </TrackedLink>
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{ page: "/muhurta", feature: "muhurta-result-kundli" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Your Kundli
              </TrackedLink>
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{ page: "/muhurta", feature: "muhurta-result-ai" }}
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

