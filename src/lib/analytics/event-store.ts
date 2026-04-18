import "server-only";

import {
  trackedEventNames,
  type AnalyticsEventPayload,
  type TrackedEventName,
} from "@/lib/analytics/types";

export type AnalyticsEventRecord = {
  id: string;
  event: TrackedEventName;
  payload: AnalyticsEventPayload;
  userId: string | null;
  receivedAtUtc: string;
};

type AnalyticsState = {
  countsByEvent: Record<TrackedEventName, number>;
  recentEvents: AnalyticsEventRecord[];
};

const payloadDenyListPattern =
  /(password|token|secret|cookie|authorization|birth|dob|latitude|longitude)/i;
const maxRecentEvents = 250;

function createInitialCounts() {
  return Object.fromEntries(
    trackedEventNames.map((eventName) => [eventName, 0])
  ) as Record<TrackedEventName, number>;
}

function createInitialState(): AnalyticsState {
  return {
    countsByEvent: createInitialCounts(),
    recentEvents: [],
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __navagrahaAnalyticsState: AnalyticsState | undefined;
}

function getAnalyticsState() {
  if (!globalThis.__navagrahaAnalyticsState) {
    globalThis.__navagrahaAnalyticsState = createInitialState();
  }

  return globalThis.__navagrahaAnalyticsState;
}

export function isTrackedEventName(value: string): value is TrackedEventName {
  return trackedEventNames.includes(value as TrackedEventName);
}

function sanitizePayload(payload: AnalyticsEventPayload): AnalyticsEventPayload {
  const safePayload: AnalyticsEventPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (payloadDenyListPattern.test(key)) {
      continue;
    }

    if (
      value === null ||
      value === undefined ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      safePayload[key] = value;
    }
  }

  return safePayload;
}

function createEventId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function recordAnalyticsEvent(input: {
  event: TrackedEventName;
  payload?: AnalyticsEventPayload;
  userId?: string | null;
}) {
  const receivedAtUtc = new Date().toISOString();
  const payload = sanitizePayload(input.payload ?? {});
  const record: AnalyticsEventRecord = {
    id: createEventId(),
    event: input.event,
    payload,
    userId: input.userId?.trim() || null,
    receivedAtUtc,
  };

  const state = getAnalyticsState();
  state.countsByEvent[input.event] += 1;
  state.recentEvents.unshift(record);

  if (state.recentEvents.length > maxRecentEvents) {
    state.recentEvents = state.recentEvents.slice(0, maxRecentEvents);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics:event]", JSON.stringify(record));
  }

  return record;
}

export function recordAnalyticsEventSafely(input: {
  event: TrackedEventName;
  payload?: AnalyticsEventPayload;
  userId?: string | null;
}) {
  try {
    return recordAnalyticsEvent(input);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics:event:error]", {
        event: input.event,
        message: error instanceof Error ? error.message : "unknown-error",
      });
    }

    return null;
  }
}

export function getAnalyticsSummarySnapshot() {
  const state = getAnalyticsState();
  const counts = { ...state.countsByEvent };

  return {
    generatedAtUtc: new Date().toISOString(),
    counts,
    funnel: {
      visitor: counts.page_view,
      signup: counts.user_signup,
      chart: counts.chart_created,
      assistant: counts.assistant_query,
      premium: counts.premium_click,
      payment: counts.payment_success,
    },
    monetization: {
      pricingView: counts.pricing_view,
      promptView: counts.upgrade_prompt_view,
      planSelected: counts.plan_selected,
      upgradeStarted: counts.upgrade_started,
      upgradeCompleted: counts.upgrade_completed,
    },
    recentEvents: state.recentEvents.slice(0, 25),
  };
}
