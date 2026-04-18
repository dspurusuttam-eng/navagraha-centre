// Add new funnel events here, then wire them through `trackEvent` and `/api/analytics/event`.
// Keep payloads behavioral only (never include secrets, passwords, tokens, or raw birth data).
export const trackedEventNames = [
  "page_view",
  "user_signup",
  "chart_created",
  "assistant_query",
  "premium_click",
  "payment_success",
  "pricing_view",
  "upgrade_prompt_view",
  "plan_selected",
  "upgrade_started",
  "upgrade_completed",
] as const;

export type TrackedEventName = (typeof trackedEventNames)[number];

export type AnalyticsEventPayloadValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type AnalyticsEventPayload = Record<string, AnalyticsEventPayloadValue>;
