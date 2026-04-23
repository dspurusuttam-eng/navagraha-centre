// Add new funnel events here, then wire them through `trackEvent` and `/api/analytics/event`.
// Keep payloads behavioral only (never include secrets, passwords, tokens, or raw birth data).
export const trackedEventNames = [
  "page_view",
  "page_visit",
  "cta_click",
  "generate_kundli_click",
  "rashifal_page_view",
  "report_view",
  "consultation_click",
  "shop_interaction",
  "onboarding_start",
  "user_signup",
  "signup_completed",
  "chart_created",
  "kundli_completed",
  "ai_opened",
  "ai_question_submitted",
  "report_preview_opened",
  "consultation_started",
  "daily_insight_view",
  "return_prompt_shown",
  "chart_incomplete_nudge",
  "premium_followup_nudge",
  "assistant_query",
  "premium_click",
  "payment_success",
  "pricing_view",
  "upgrade_prompt_view",
  "plan_selected",
  "upgrade_started",
  "checkout_started",
  "upgrade_completed",
  "premium_feature_unlock",
] as const;

export type TrackedEventName = (typeof trackedEventNames)[number];

export type AnalyticsEventPayloadValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type AnalyticsEventPayload = Record<string, AnalyticsEventPayloadValue>;
