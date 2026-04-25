"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import { getApiErrorMessage } from "@/lib/api/http";
import type {
  AstrologyCalculatorKey,
  AstrologyCalculatorResult,
} from "@/modules/calculators";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CalculatorApiSuccessPayload = {
  data?: {
    generatedAtUtc: string;
    result: AstrologyCalculatorResult;
  };
};

type CalculatorExecutionData = NonNullable<CalculatorApiSuccessPayload["data"]>;

type DateTimePlaceFormState = {
  date: string;
  time: string;
  place: string;
};

const initialDateTimePlaceState: DateTimePlaceFormState = {
  date: "",
  time: "",
  place: "",
};

const initialDateCheckState = {
  date: "",
  place: "",
};

const initialBirthNumberState = {
  dateOfBirth: "",
};

const initialCompatibilityState = {
  firstDateOfBirth: "",
  secondDateOfBirth: "",
};

const calculatorKeys: AstrologyCalculatorKey[] = [
  "nakshatra",
  "moon-sign",
  "lagna",
  "birth-number",
  "compatibility-quick",
  "date-check",
];

const initialLoadingState = Object.fromEntries(
  calculatorKeys.map((key) => [key, false])
) as Record<AstrologyCalculatorKey, boolean>;

const initialErrorState = Object.fromEntries(
  calculatorKeys.map((key) => [key, null])
) as Record<AstrologyCalculatorKey, string | null>;

const initialResultState = Object.fromEntries(
  calculatorKeys.map((key) => [key, null])
) as Record<AstrologyCalculatorKey, CalculatorExecutionData | null>;

function formatGeneratedAt(utcIso: string) {
  return new Date(utcIso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function runCalculatorRequest(
  calculator: AstrologyCalculatorKey,
  input: Record<string, string>
) {
  const response = await fetch("/api/astrology/calculators", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      calculator,
      input,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | CalculatorApiSuccessPayload
    | null;

  if (!response.ok) {
    return {
      success: false as const,
      message: getApiErrorMessage(
        payload,
        "Calculator request failed. Review inputs and retry."
      ),
    };
  }

  if (!payload?.data?.result) {
    return {
      success: false as const,
      message: "Calculator returned an empty response.",
    };
  }

  return {
    success: true as const,
    data: payload.data,
  };
}

function CalculatorResultView({
  data,
}: Readonly<{ data: CalculatorExecutionData }>) {
  return (
    <div className="space-y-3 rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.9)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone="accent">Result</Badge>
        <span className="text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
          Generated {formatGeneratedAt(data.generatedAtUtc)}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
          {data.result.mainResult.title}
        </p>
        <p className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
          {data.result.mainResult.value}
        </p>
        {data.result.mainResult.accent ? (
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            {data.result.mainResult.accent}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {data.result.supportingDetails.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="rounded-[var(--radius-md)] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,255,255,0.84)] px-3 py-2"
          >
            <p className="text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
              {item.label}
            </p>
            <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[length:var(--font-size-body-sm)] font-medium text-[var(--color-ink-strong)]">
          {data.result.summary.headline}
        </p>
        <ul className="space-y-1">
          {data.result.summary.points.map((point) => (
            <li
              key={point}
              className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
            >
              {point}
            </li>
          ))}
        </ul>
        {data.result.summary.note ? (
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-muted)]">
            {data.result.summary.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function CalculatorsBundlePanel() {
  const [loading, setLoading] = useState(initialLoadingState);
  const [errors, setErrors] = useState(initialErrorState);
  const [results, setResults] = useState(initialResultState);

  const [nakshatraForm, setNakshatraForm] = useState(initialDateTimePlaceState);
  const [moonSignForm, setMoonSignForm] = useState(initialDateTimePlaceState);
  const [lagnaForm, setLagnaForm] = useState(initialDateTimePlaceState);
  const [birthNumberForm, setBirthNumberForm] = useState(initialBirthNumberState);
  const [compatibilityForm, setCompatibilityForm] = useState(
    initialCompatibilityState
  );
  const [dateCheckForm, setDateCheckForm] = useState(initialDateCheckState);

  async function executeCalculator(
    calculator: AstrologyCalculatorKey,
    input: Record<string, string>
  ) {
    trackEvent("calculator_tool_click", {
      page: "/calculators",
      feature: `${calculator}-run`,
      calculator,
    });
    setLoading((current) => ({ ...current, [calculator]: true }));
    setErrors((current) => ({ ...current, [calculator]: null }));

    const result = await runCalculatorRequest(calculator, input).catch(() => ({
      success: false as const,
      message: "Calculator request failed unexpectedly.",
    }));

    setLoading((current) => ({ ...current, [calculator]: false }));

    if (!result.success) {
      setErrors((current) => ({ ...current, [calculator]: result.message }));
      setResults((current) => ({ ...current, [calculator]: null }));
      trackEvent("cta_click", {
        page: "/calculators",
        feature: `${calculator}-error`,
      });
      return;
    }

    setResults((current) => ({ ...current, [calculator]: result.data }));
    trackEvent("cta_click", {
      page: "/calculators",
      feature: `${calculator}-success`,
    });
  }

  function renderError(calculator: AstrologyCalculatorKey) {
    const message = errors[calculator];

    if (!message) {
      return null;
    }

    return (
      <p
        aria-live="polite"
        className="rounded-[var(--radius-md)] border border-[rgba(188,104,104,0.34)] bg-[rgba(244,231,231,0.86)] px-3 py-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]"
      >
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
          <Badge tone="trust">Nakshatra Calculator</Badge>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Get Moon Nakshatra and Pada from date, time, and place.
          </p>
          <form
            className="grid gap-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void executeCalculator("nakshatra", nakshatraForm);
            }}
          >
            <Input
              type="date"
              value={nakshatraForm.date}
              onChange={(event) =>
                setNakshatraForm((current) => ({ ...current, date: event.currentTarget.value }))
              }
              required
            />
            <Input
              type="time"
              value={nakshatraForm.time}
              onChange={(event) =>
                setNakshatraForm((current) => ({ ...current, time: event.currentTarget.value }))
              }
              required
            />
            <Input
              placeholder="City, Region/State, Country"
              value={nakshatraForm.place}
              onChange={(event) =>
                setNakshatraForm((current) => ({ ...current, place: event.currentTarget.value }))
              }
              required
            />
            <Button type="submit" className="w-full" disabled={loading["nakshatra"]}>
              {loading["nakshatra"] ? "Calculating..." : "Calculate Nakshatra"}
            </Button>
          </form>
          {renderError("nakshatra")}
          {results["nakshatra"] ? <CalculatorResultView data={results["nakshatra"]} /> : null}
        </Card>

        <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
          <Badge tone="trust">Moon Sign Calculator</Badge>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Resolve your sidereal Moon sign (Rashi) in one step.
          </p>
          <form
            className="grid gap-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void executeCalculator("moon-sign", moonSignForm);
            }}
          >
            <Input
              type="date"
              value={moonSignForm.date}
              onChange={(event) =>
                setMoonSignForm((current) => ({ ...current, date: event.currentTarget.value }))
              }
              required
            />
            <Input
              type="time"
              value={moonSignForm.time}
              onChange={(event) =>
                setMoonSignForm((current) => ({ ...current, time: event.currentTarget.value }))
              }
              required
            />
            <Input
              placeholder="City, Region/State, Country"
              value={moonSignForm.place}
              onChange={(event) =>
                setMoonSignForm((current) => ({ ...current, place: event.currentTarget.value }))
              }
              required
            />
            <Button type="submit" className="w-full" disabled={loading["moon-sign"]}>
              {loading["moon-sign"] ? "Calculating..." : "Calculate Moon Sign"}
            </Button>
          </form>
          {renderError("moon-sign")}
          {results["moon-sign"] ? <CalculatorResultView data={results["moon-sign"]} /> : null}
        </Card>

        <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
          <Badge tone="trust">Ascendant / Lagna Calculator</Badge>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Calculate Lagna sign and degree from exact birth context.
          </p>
          <form
            className="grid gap-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void executeCalculator("lagna", lagnaForm);
            }}
          >
            <Input
              type="date"
              value={lagnaForm.date}
              onChange={(event) =>
                setLagnaForm((current) => ({ ...current, date: event.currentTarget.value }))
              }
              required
            />
            <Input
              type="time"
              value={lagnaForm.time}
              onChange={(event) =>
                setLagnaForm((current) => ({ ...current, time: event.currentTarget.value }))
              }
              required
            />
            <Input
              placeholder="City, Region/State, Country"
              value={lagnaForm.place}
              onChange={(event) =>
                setLagnaForm((current) => ({ ...current, place: event.currentTarget.value }))
              }
              required
            />
            <Button type="submit" className="w-full" disabled={loading["lagna"]}>
              {loading["lagna"] ? "Calculating..." : "Calculate Lagna"}
            </Button>
          </form>
          {renderError("lagna")}
          {results["lagna"] ? <CalculatorResultView data={results["lagna"]} /> : null}
        </Card>

        <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
          <Badge tone="trust">Birth Number Quick Calculator</Badge>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Get Birth and Destiny numbers quickly using the numerology engine.
          </p>
          <form
            className="grid gap-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void executeCalculator("birth-number", birthNumberForm);
            }}
          >
            <Input
              type="date"
              value={birthNumberForm.dateOfBirth}
              onChange={(event) =>
                setBirthNumberForm({
                  dateOfBirth: event.currentTarget.value,
                })
              }
              required
            />
            <Button type="submit" className="w-full" disabled={loading["birth-number"]}>
              {loading["birth-number"] ? "Calculating..." : "Calculate Birth Number"}
            </Button>
          </form>
          {renderError("birth-number")}
          {results["birth-number"] ? <CalculatorResultView data={results["birth-number"]} /> : null}
        </Card>

        <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
          <Badge tone="trust">Compatibility Quick Score</Badge>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Lightweight compatibility signal using two DOB inputs.
          </p>
          <form
            className="grid gap-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void executeCalculator("compatibility-quick", compatibilityForm);
            }}
          >
            <Input
              type="date"
              value={compatibilityForm.firstDateOfBirth}
              onChange={(event) =>
                setCompatibilityForm((current) => ({
                  ...current,
                  firstDateOfBirth: event.currentTarget.value,
                }))
              }
              required
            />
            <Input
              type="date"
              value={compatibilityForm.secondDateOfBirth}
              onChange={(event) =>
                setCompatibilityForm((current) => ({
                  ...current,
                  secondDateOfBirth: event.currentTarget.value,
                }))
              }
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading["compatibility-quick"]}
            >
              {loading["compatibility-quick"] ? "Calculating..." : "Calculate Quick Score"}
            </Button>
          </form>
          {renderError("compatibility-quick")}
          {results["compatibility-quick"] ? (
            <div className="space-y-3">
              <CalculatorResultView data={results["compatibility-quick"]} />
              <div className="grid gap-2 sm:grid-cols-2">
                <TrackedLink
                  href="/compatibility"
                  eventName="utility_card_click"
                  eventPayload={{
                    page: "/calculators",
                    feature: "compatibility-quick-open-full-tool",
                  }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "tertiary",
                    className: "w-full justify-center",
                  })}
                >
                  Open Full Compatibility
                </TrackedLink>
                <TrackedLink
                  href="/reports"
                  eventName="premium_utility_cta_click"
                  eventPayload={{
                    page: "/calculators",
                    feature: "compatibility-quick-open-report",
                  }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Get Full Compatibility Report
                </TrackedLink>
              </div>
            </div>
          ) : null}
        </Card>

        <Card tone="light" className="space-y-4 border-[rgba(184,137,67,0.24)]">
          <Badge tone="trust">Basic Date Check Utility</Badge>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Daily suitability summary using Panchang context.
          </p>
          <form
            className="grid gap-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void executeCalculator("date-check", dateCheckForm);
            }}
          >
            <Input
              type="date"
              value={dateCheckForm.date}
              onChange={(event) =>
                setDateCheckForm((current) => ({ ...current, date: event.currentTarget.value }))
              }
              required
            />
            <Input
              placeholder="City, Region/State, Country"
              value={dateCheckForm.place}
              onChange={(event) =>
                setDateCheckForm((current) => ({ ...current, place: event.currentTarget.value }))
              }
              required
            />
            <Button type="submit" className="w-full" disabled={loading["date-check"]}>
              {loading["date-check"] ? "Calculating..." : "Check Date Suitability"}
            </Button>
          </form>
          {renderError("date-check")}
          {results["date-check"] ? <CalculatorResultView data={results["date-check"]} /> : null}
        </Card>
      </div>

      <Card
        tone="accent"
        className="grid gap-5 border-[rgba(184,137,67,0.3)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
      >
        <div className="space-y-2">
          <Badge tone="accent">Continue Journey</Badge>
          <p className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
            Move from quick calculators into chart, AI, and deeper premium guidance.
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
            Calculators are designed for practical clarity first, then deeper context if needed.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href="/kundli"
            eventName="cta_click"
            eventPayload={{ page: "/calculators", feature: "calculators-kundli" }}
            className={buttonStyles({
              size: "sm",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Generate Your Kundli
          </TrackedLink>
          <TrackedLink
            href="/ai"
            eventName="cta_click"
            eventPayload={{ page: "/calculators", feature: "calculators-ai" }}
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
  );
}
