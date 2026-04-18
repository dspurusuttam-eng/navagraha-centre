"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { trackEvent } from "@/lib/analytics/track-event";
import {
  getMonetizationUpgradeCopy,
  type MonetizationPlanType,
} from "@/modules/subscriptions/monetization-content";
import type {
  ChartContractErrorResponse,
  ChartContractSuccessResponse,
  UnifiedSiderealChart,
} from "@/modules/astrology/chart-contract-types";
import { NorthIndianChart } from "@/modules/astrology/components/north-indian-chart";

type ChartPanelState =
  | {
      status: "loading";
    }
  | {
      status: "ready";
      chart: UnifiedSiderealChart;
    }
  | {
      status: "empty";
      code: string;
      message: string;
    }
  | {
      status: "error";
      code: string;
      message: string;
    };

function formatSign(sign: string) {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

function formatPlanet(planetName: string) {
  return planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();
}

function formatNakshatra(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function isChartPayload(payload: unknown): payload is ChartContractSuccessResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as { chart?: unknown };

  if (!candidate.chart || typeof candidate.chart !== "object") {
    return false;
  }

  const chart = candidate.chart as UnifiedSiderealChart;

  return Array.isArray(chart.houses) && Array.isArray(chart.planets);
}

function isChartErrorPayload(payload: unknown): payload is ChartContractErrorResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as { error?: unknown };

  return Boolean(
    candidate.error &&
      typeof candidate.error === "object" &&
      typeof (candidate.error as { code?: unknown }).code === "string" &&
      typeof (candidate.error as { message?: unknown }).message === "string"
  );
}

function isChartUnavailableErrorCode(code: string) {
  return (
    code === "MISSING_BIRTH_PROFILE" ||
    code === "MISSING_COORDINATES" ||
    code === "INVALID_COORDINATES" ||
    code === "INVALID_BIRTH_INPUT" ||
    code === "INVALID_BIRTH_CONTEXT"
  );
}

function isPremiumPlanType(planType: MonetizationPlanType) {
  return planType === "PREMIUM" || planType === "PRO";
}

export function ChartContractPanel({
  planType,
  upgradeHref,
}: Readonly<{
  planType: MonetizationPlanType;
  upgradeHref: string;
}>) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<ChartPanelState>({
    status: "loading",
  });

  useEffect(() => {
    const abortController = new AbortController();

    async function loadChart() {
      setState({ status: "loading" });

      try {
        const response = await fetch("/api/astrology/chart", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ source: "PROFILE" }),
          signal: abortController.signal,
        });
        const payload = await response.json().catch(() => null);

        if (abortController.signal.aborted) {
          return;
        }

        if (!response.ok) {
          if (isChartErrorPayload(payload)) {
            const nextState: ChartPanelState = isChartUnavailableErrorCode(
              payload.error.code
            )
              ? {
                  status: "empty",
                  code: payload.error.code,
                  message: payload.error.message,
                }
              : {
                  status: "error",
                  code: payload.error.code,
                  message: payload.error.message,
                };

            setState(nextState);
            return;
          }

          setState({
            status: "error",
            code: "CHART_REQUEST_FAILED",
            message:
              "The chart service could not return a valid response. Please try again.",
          });
          return;
        }

        if (!isChartPayload(payload)) {
          setState({
            status: "error",
            code: "INVALID_CHART_PAYLOAD",
            message:
              "The chart response is incomplete. Please retry in a moment.",
          });
          return;
        }

        if (payload.chart.houses.length !== 12 || payload.chart.planets.length === 0) {
          setState({
            status: "empty",
            code: "CHART_UNAVAILABLE",
            message:
              "A complete chart is not available yet. Update onboarding details and regenerate your chart.",
          });
          return;
        }

        setState({
          status: "ready",
          chart: payload.chart,
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          code: "CHART_REQUEST_EXCEPTION",
          message:
            error instanceof Error
              ? error.message
              : "Chart loading failed due to an unknown request error.",
        });
      }
    }

    void loadChart();

    return () => {
      abortController.abort();
    };
  }, [reloadKey]);

  const sortedPlanets = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }

    return [...state.chart.planets].sort((a, b) => a.house - b.house);
  }, [state]);
  const hasPremiumAccess = isPremiumPlanType(planType);
  const chartDepthUpgrade = getMonetizationUpgradeCopy({
    prompt: "chart-depth",
    surface: "protected",
  });
  const visiblePlanets =
    state.status === "ready"
      ? hasPremiumAccess
        ? sortedPlanets
        : sortedPlanets.slice(0, 4)
      : [];
  const hiddenPlanetCount =
    state.status === "ready" && !hasPremiumAccess
      ? Math.max(0, sortedPlanets.length - visiblePlanets.length)
      : 0;

  useEffect(() => {
    if (state.status !== "ready" || hasPremiumAccess) {
      return;
    }

    trackEvent("upgrade_prompt_view", {
      page: "/dashboard/chart",
      feature: "chart-depth-lock",
      plan: planType,
    });
  }, [hasPremiumAccess, planType, state.status]);

  return (
    <Section
      eyebrow="Chart Overview"
      title="Your Kundli is now sourced from the protected chart contract."
      description="This surface renders backend-generated sidereal chart data directly, with deterministic houses and planet placements."
      tone="transparent"
      className="pt-0"
    >
      {state.status === "loading" ? (
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Loading
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Preparing your current birth chart from the protected backend contract.
          </p>
        </Card>
      ) : null}

      {state.status === "empty" ? (
        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Chart Unavailable
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {state.message}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/onboarding"
              className={buttonStyles({ size: "lg" })}
            >
              Complete Birth Onboarding
            </Link>
            <button
              type="button"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
              onClick={() => setReloadKey((current) => current + 1)}
            >
              Retry
            </button>
          </div>
          <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            {state.code}
          </p>
        </Card>
      ) : null}

      {state.status === "error" ? (
        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Chart Request Error
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {state.message}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonStyles({ size: "lg" })}
              onClick={() => setReloadKey((current) => current + 1)}
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              Back To Dashboard
            </Link>
          </div>
          <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
            {state.code}
          </p>
        </Card>
      ) : null}

      {state.status === "ready" ? (
        <div className="space-y-6">
          <Card tone="accent" className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Chart Integrity
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Based on Vedic astrology using sidereal Lahiri ayanamsha.
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Accurate planetary calculations are generated server-side and displayed from your stored chart record.
            </p>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                North Indian View
              </p>
              <NorthIndianChart chart={state.chart} />
            </Card>

            <Card tone="accent" className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Birth Context
              </p>
              <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                <p>
                  Birth moment:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {state.chart.birth_context.date_local}{" "}
                    {state.chart.birth_context.time_local}
                  </span>
                </p>
                <p>
                  Place:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {state.chart.birth_context.place}
                  </span>
                </p>
                <p>
                  Timezone:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {state.chart.birth_context.timezone}
                  </span>
                </p>
                <p>
                  UTC:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {new Date(state.chart.birth_context.birth_utc).toLocaleString(
                      "en-IN",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </span>
                </p>
                <p>
                  Lagna:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {formatSign(state.chart.lagna.sign)}{" "}
                    {state.chart.lagna.degree_in_sign.toFixed(2)} deg
                  </span>
                </p>
                <p>
                  Verification:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {state.chart.verification.verification_status}
                  </span>
                </p>
              </div>
            </Card>
          </div>

          {!hasPremiumAccess ? (
            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {chartDepthUpgrade.title}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {chartDepthUpgrade.message}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={upgradeHref}
                  className={buttonStyles({ size: "lg" })}
                  onClick={() => {
                    trackEvent("premium_click", {
                      page: "/dashboard/chart",
                      feature: "chart-upgrade-primary",
                    });
                    trackEvent("upgrade_started", {
                      page: "/dashboard/chart",
                      surface: "protected",
                      feature: "chart-upgrade-primary",
                      plan: planType,
                    });
                  }}
                >
                  {chartDepthUpgrade.ctaLabel}
                </Link>
                <Link
                  href="/dashboard/ask-my-chart"
                  className={buttonStyles({ size: "lg", tone: "secondary" })}
                  onClick={() => {
                    trackEvent("premium_click", {
                      page: "/dashboard/chart",
                      feature: "chart-upgrade-assistant",
                    });
                  }}
                >
                  Continue with Premium
                </Link>
              </div>
            </Card>
          ) : null}

          <Card className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Planetary Details
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visiblePlanets.map((planet) => (
                <div
                  key={planet.name}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] p-4"
                >
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    {formatPlanet(planet.name)}
                  </p>
                  <p className="mt-1 text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                    {formatSign(planet.sign)} | House {planet.house}
                  </p>
                  <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    {planet.degree_in_sign.toFixed(2)} deg | {formatNakshatra(planet.nakshatra)}{" "}
                    pada {planet.pada}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-[var(--radius-pill)] border border-[color:var(--color-border)] px-2 py-1 text-[0.62rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                      {planet.is_retrograde ? "Retrograde" : "Direct"}
                    </span>
                    <span className="rounded-[var(--radius-pill)] border border-[color:var(--color-border)] px-2 py-1 text-[0.62rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                      {planet.is_combust ? "Combust" : "Not Combust"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {!hasPremiumAccess && hiddenPlanetCount > 0 ? (
              <div className="rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.24)] bg-[rgba(215,187,131,0.08)] px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Locked Deeper Insights
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {hiddenPlanetCount} additional placements and deeper interpretive layers are available in premium mode.
                </p>
                <Link
                  href={upgradeHref}
                  className={buttonStyles({ size: "sm", tone: "secondary" })}
                  onClick={() => {
                    trackEvent("premium_click", {
                      page: "/dashboard/chart",
                      feature: "chart-locked-insights",
                    });
                  }}
                >
                  Get Detailed Career Prediction
                </Link>
              </div>
            ) : null}
          </Card>

          {state.chart.verification.warnings.length ||
          state.chart.verification.errors.length ? (
            <Card className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Verification Notes
              </p>
              <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {state.chart.verification.errors.map((issue) => (
                  <p key={`error-${issue.code}-${issue.message}`}>
                    {issue.code}: {issue.message}
                  </p>
                ))}
                {state.chart.verification.warnings.map((issue) => (
                  <p key={`warning-${issue.code}-${issue.message}`}>
                    {issue.code}: {issue.message}
                  </p>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </Section>
  );
}
