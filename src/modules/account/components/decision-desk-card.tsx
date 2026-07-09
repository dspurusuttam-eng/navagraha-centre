"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type DecisionDeskCardInput = {
  latitude: number;
  longitude: number;
  timezone: string;
  locationLabel: string;
};

type DecisionRecordStatus = "planned" | "done" | "skipped";
type DecisionRecordRating =
  | "favourable"
  | "mixed"
  | "avoid_for_now"
  | "consult_recommended";
type DecisionCategory =
  | "general"
  | "travel"
  | "purchase"
  | "business"
  | "career"
  | "family"
  | "puja";

type DecisionDeskRecord = {
  id: string;
  title: string;
  decisionCategory: DecisionCategory | string;
  status: DecisionRecordStatus;
  decisionRating: DecisionRecordRating | string | null;
  date: string;
  timezone: string;
  locationLabel: string | null;
  userNote: string | null;
  outcomeNote: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type DecisionDeskList = {
  records: DecisionDeskRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type DecisionDeskState =
  | { status: "loading" }
  | { status: "ready"; data: DecisionDeskList }
  | { status: "auth"; message: string }
  | { status: "error"; message: string };

const categoryOptions: { value: DecisionCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "travel", label: "Travel" },
  { value: "purchase", label: "Purchase" },
  { value: "business", label: "Business" },
  { value: "career", label: "Career" },
  { value: "family", label: "Family" },
  { value: "puja", label: "Puja" },
];

function isDecisionDeskList(value: unknown): value is DecisionDeskList {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DecisionDeskList>;

  return Boolean(
    Array.isArray(candidate.records) &&
      candidate.pagination &&
      typeof candidate.pagination.total === "number"
  );
}

function isDecisionRecord(value: unknown): value is DecisionDeskRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DecisionDeskRecord>;

  return Boolean(
    typeof candidate.id === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.status === "string" &&
      typeof candidate.date === "string"
  );
}

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate = payload as {
    message?: unknown;
    error?: { message?: unknown };
  };

  if (typeof candidate.message === "string" && candidate.message.trim()) {
    return candidate.message;
  }

  if (
    candidate.error &&
    typeof candidate.error.message === "string" &&
    candidate.error.message.trim()
  ) {
    return candidate.error.message;
  }

  return fallback;
}

function getTodayInTimeZone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return new Date().toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function formatStatus(status: DecisionRecordStatus) {
  switch (status) {
    case "done":
      return "Completed";
    case "skipped":
      return "In review";
    case "planned":
    default:
      return "Open";
  }
}

function formatCategory(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status: DecisionRecordStatus) {
  return status === "done" ? "accent" : "neutral";
}

export function DecisionDeskCard({
  input,
}: Readonly<{
  input: DecisionDeskCardInput | null;
}>) {
  const [state, setState] = useState<DecisionDeskState>({ status: "loading" });
  const [title, setTitle] = useState("");
  const [decisionCategory, setDecisionCategory] =
    useState<DecisionCategory>("general");
  const [isCreating, setIsCreating] = useState(false);
  const [busyRecordId, setBusyRecordId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const canCreate = Boolean(input);

  const loadRecords = useCallback((signal?: AbortSignal) => {
    fetch("/api/decision-desk/records?pageSize=6", { signal })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { decisionDesk?: unknown }
          | unknown;

        if (response.status === 401) {
          setState({
            status: "auth",
            message: "Sign in to use Decision Desk",
          });
          return;
        }

        if (!response.ok) {
          setState({
            status: "error",
            message: getApiMessage(
              payload,
              "Decision Desk records could not be loaded."
            ),
          });
          return;
        }

        const decisionDesk =
          payload && typeof payload === "object"
            ? (payload as { decisionDesk?: unknown }).decisionDesk
            : null;

        if (isDecisionDeskList(decisionDesk)) {
          setState({ status: "ready", data: decisionDesk });
          return;
        }

        setState({
          status: "error",
          message: "Decision Desk records could not be loaded.",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          status: "error",
          message: "Decision Desk records could not be loaded.",
        });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRecords(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadRecords]);

  const records = state.status === "ready" ? state.data.records : [];
  const total = state.status === "ready" ? state.data.pagination.total : 0;
  const today = useMemo(
    () => getTodayInTimeZone(input?.timezone ?? "Asia/Kolkata"),
    [input?.timezone]
  );

  async function createRecord() {
    const trimmedTitle = title.trim();

    if (!input || !trimmedTitle) {
      setActionMessage(
        input
          ? "Decision title is required."
          : "Saved location details are required before creating a decision."
      );
      return;
    }

    setIsCreating(true);
    setActionMessage(null);

    const response = await fetch("/api/decision-desk/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trimmedTitle,
        decisionCategory,
        status: "planned",
        date: today,
        timezone: input.timezone,
        latitude: input.latitude,
        longitude: input.longitude,
        locationLabel: input.locationLabel,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      record?: unknown;
    } | null;

    setIsCreating(false);

    if (!response.ok || !isDecisionRecord(payload?.record)) {
      setActionMessage(
        getApiMessage(payload, "Decision record could not be created.")
      );
      return;
    }

    setTitle("");
    setDecisionCategory("general");
    loadRecords();
  }

  async function updateStatus(record: DecisionDeskRecord, status: DecisionRecordStatus) {
    setBusyRecordId(record.id);
    setActionMessage(null);

    const response = await fetch(`/api/decision-desk/records/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await response.json().catch(() => null)) as {
      record?: unknown;
    } | null;

    setBusyRecordId(null);

    if (!response.ok || !isDecisionRecord(payload?.record)) {
      setActionMessage(
        getApiMessage(payload, "Decision record could not be updated.")
      );
      return;
    }

    loadRecords();
  }

  async function deleteRecord(record: DecisionDeskRecord) {
    setBusyRecordId(record.id);
    setActionMessage(null);

    const response = await fetch(`/api/decision-desk/records/${record.id}`, {
      method: "DELETE",
    });
    const payload = await response.json().catch(() => null);

    setBusyRecordId(null);

    if (!response.ok) {
      setActionMessage(
        getApiMessage(payload, "Decision record could not be removed.")
      );
      return;
    }

    loadRecords();
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            Decision Desk
          </p>
          <h2 className="break-words text-[length:var(--font-size-title-sm)] text-[#111111]">
            Saved decisions
          </h2>
        </div>
        <Badge tone={records.length ? "accent" : "neutral"}>
          {total ? `${total}` : "Open"}
        </Badge>
      </div>

      <div className="space-y-3 rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
        <div className="grid gap-3">
          <label className="grid gap-1 text-[length:var(--font-size-body-sm)] text-[#111111]">
            <span className="text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Decision title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              placeholder="Create decision"
              className="min-h-11 rounded-[var(--radius-lg)] border border-[#EAEAEA] bg-white px-3 text-[#111111] outline-none transition focus:border-[#C89B2C] focus:ring-2 focus:ring-[rgba(200,155,44,0.18)]"
            />
          </label>

          <label className="grid gap-1 text-[length:var(--font-size-body-sm)] text-[#111111]">
            <span className="text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Status
            </span>
            <select
              value={decisionCategory}
              onChange={(event) =>
                setDecisionCategory(event.target.value as DecisionCategory)
              }
              className="min-h-11 rounded-[var(--radius-lg)] border border-[#EAEAEA] bg-white px-3 text-[#111111] outline-none transition focus:border-[#C89B2C] focus:ring-2 focus:ring-[rgba(200,155,44,0.18)]"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={createRecord}
          disabled={!canCreate || isCreating}
          className={buttonStyles({
            size: "sm",
            tone: "secondary",
            className: "w-full disabled:pointer-events-none disabled:opacity-50",
          })}
        >
          {isCreating ? "Saving" : "Create decision"}
        </button>

        {!canCreate ? (
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            Saved location details are required before creating a decision.
          </p>
        ) : null}
      </div>

      {actionMessage ? (
        <p className="break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          {actionMessage}
        </p>
      ) : null}

      {state.status === "loading" ? (
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          Loading Decision Desk records.
        </p>
      ) : null}

      {state.status === "auth" || state.status === "error" ? (
        <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            {state.status === "auth" ? "Sign in" : "Status"}
          </p>
          <p className="mt-2 break-words text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {state.message}
          </p>
        </div>
      ) : null}

      {state.status === "ready" && records.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
            No saved decisions yet
          </p>
          <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            Create a simple decision record when you want to track a choice.
          </p>
        </div>
      ) : null}

      {records.length ? (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="space-y-3 rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-[0.95rem] font-semibold text-[#111111]">
                    {record.title}
                  </p>
                  <p className="mt-1 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                    {formatCategory(record.decisionCategory)} - {formatDate(record.date)}
                  </p>
                </div>
                <Badge tone={statusTone(record.status)}>
                  {formatStatus(record.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {record.status !== "done" ? (
                  <button
                    type="button"
                    onClick={() => updateStatus(record, "done")}
                    disabled={busyRecordId === record.id}
                    className={buttonStyles({
                      size: "sm",
                      tone: "secondary",
                      className: "disabled:pointer-events-none disabled:opacity-50",
                    })}
                  >
                    Completed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateStatus(record, "planned")}
                    disabled={busyRecordId === record.id}
                    className={buttonStyles({
                      size: "sm",
                      tone: "ghost",
                      className: "disabled:pointer-events-none disabled:opacity-50",
                    })}
                  >
                    Open
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteRecord(record)}
                  disabled={busyRecordId === record.id}
                  className={buttonStyles({
                    size: "sm",
                    tone: "ghost",
                    className: "disabled:pointer-events-none disabled:opacity-50",
                  })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
