"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type TodayDecisionCardInput = {
  latitude: number;
  longitude: number;
  timezone: string;
  locationLabel: string;
  locale: string;
};

type TimingBlock = {
  label: string;
  start_local_time: string;
  end_local_time: string;
};

type TodayDecisionData = {
  decisionCategory: string;
  summary: {
    date: string;
    locationLabel: string;
    timezone: string;
  };
  panchang: {
    available: boolean;
    weekday: string;
    tithi: string;
  };
  rahuKaal: TimingBlock;
  yamaganda: TimingBlock;
  gulika: TimingBlock;
  goodTimeBlocks: TimingBlock[];
  avoidTimeBlocks: TimingBlock[];
  decisionRating: string;
};

type TodayDecisionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: TodayDecisionData }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

function isTodayDecisionData(value: unknown): value is TodayDecisionData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TodayDecisionData>;

  return Boolean(
    candidate.summary &&
      candidate.panchang &&
      candidate.rahuKaal &&
      candidate.yamaganda &&
      candidate.gulika &&
      Array.isArray(candidate.goodTimeBlocks) &&
      Array.isArray(candidate.avoidTimeBlocks) &&
      typeof candidate.decisionRating === "string"
  );
}

function formatRating(value: string) {
  switch (value) {
    case "favourable":
      return "Favourable";
    case "mixed":
      return "Mixed";
    case "consult_recommended":
      return "Review carefully";
    case "avoid_for_now":
      return "Caution";
    default:
      return "Calculation";
  }
}

function formatCategory(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatBlock(block: TimingBlock | null | undefined) {
  if (!block) {
    return "Unavailable";
  }

  return `${block.start_local_time} - ${block.end_local_time}`;
}

function DecisionLine({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
      <p className="text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.92rem] leading-[var(--line-height-copy)] text-[#111111]">
        {value}
      </p>
    </div>
  );
}

export function TodayDecisionCard({
  input,
}: Readonly<{
  input: TodayDecisionCardInput | null;
}>) {
  const [state, setState] = useState<TodayDecisionState>({ status: "idle" });
  const requestPayload = useMemo(() => {
    if (!input) {
      return null;
    }

    return {
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      locationLabel: input.locationLabel,
      locale: input.locale,
      decisionCategory: "general",
    };
  }, [input]);

  useEffect(() => {
    if (!requestPayload) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/astrology/today-decision", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          data?: unknown;
          error?: { message?: unknown };
        } | null;

        if (!response.ok) {
          const message =
            typeof payload?.error?.message === "string"
              ? payload.error.message
              : "Today Decision calculation is unavailable.";
          setState({ status: "unavailable", message });
          return;
        }

        if (isTodayDecisionData(payload?.data)) {
          setState({ status: "ready", data: payload.data });
          return;
        }

        setState({
          status: "unavailable",
          message: "Today Decision calculation is unavailable.",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          status: "error",
          message: "Today Decision could not be loaded. Please retry later.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [requestPayload]);

  const displayState: TodayDecisionState = !requestPayload
    ? {
        status: "unavailable",
        message: "Calculation unavailable until saved location details are complete.",
      }
    : state.status === "idle"
      ? { status: "loading" }
      : state;
  const readyData = displayState.status === "ready" ? displayState.data : null;
  const supportiveBlock = readyData?.goodTimeBlocks[0] ?? null;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Today Decision
          </p>
          <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
            Today&apos;s calculation
          </h2>
        </div>
        <Badge tone={displayState.status === "ready" ? "accent" : "neutral"}>
          {displayState.status === "ready"
            ? formatRating(displayState.data.decisionRating)
            : "Pending"}
        </Badge>
      </div>

      {displayState.status === "loading" ? (
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          Loading Today Decision calculation from saved location details.
        </p>
      ) : null}

      {displayState.status === "unavailable" || displayState.status === "error" ? (
        <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Calculation unavailable
          </p>
          <p className="mt-2 break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {displayState.message}
          </p>
        </div>
      ) : null}

      {readyData ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <DecisionLine label="Date / day" value={`${readyData.summary.date} - ${readyData.panchang.weekday}`} />
            <DecisionLine label="Tithi" value={readyData.panchang.tithi} />
            <DecisionLine label="Decision rating" value={formatRating(readyData.decisionRating)} />
            <DecisionLine label="Category" value={formatCategory(readyData.decisionCategory)} />
          </div>

          <div className="grid gap-3">
            <DecisionLine label="Rahu Kaal" value={formatBlock(readyData.rahuKaal)} />
            <DecisionLine label="Yamaganda" value={formatBlock(readyData.yamaganda)} />
            <DecisionLine label="Gulika" value={formatBlock(readyData.gulika)} />
            <DecisionLine
              label={supportiveBlock?.label.split(":")[0] ?? "Favourable window"}
              value={formatBlock(supportiveBlock)}
            />
          </div>

          <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            Based on saved location: {readyData.summary.locationLabel}. Timing windows are calculation references only.
          </p>
        </>
      ) : null}
    </Card>
  );
}
