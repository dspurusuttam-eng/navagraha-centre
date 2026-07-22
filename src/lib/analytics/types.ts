// Add new funnel events here, then wire them through `trackEvent` and `/api/analytics/event`.
// Keep payloads behavioral only (never include secrets, passwords, tokens, or raw birth data).
export const trackedEventNames = [
  "page_view",
  "page_visit",
  "homepage_cta_click",
  "kundli_generate_click",
  "dashboard_checkin",
  "rashifal_view",
  "panchang_view",
  "tools_hub_view",
  "report_preview_click",
  "report_unlock_click",
  "ai_start_click",
  "consultation_book_click",
  "language_switch",
  "pwa_install_prompt",
  "pwa_install_success",
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
  "daily_dashboard_checkin",
  "daily_rashifal_view",
  "rashifal_view",
  "panchang_view",
  "daily_panchang_view",
  "panchang_return_prompt_shown",
  "continue_report_click",
  "continue_ai_click",
  "consultation_followup_click",
  "from_the_desk_read",
  "desk_article_share",
  "notification_bell_open",
  "notification_open",
  "push_subscribed",
  "push_unsubscribed",
  "youtube_video_click",
  "tools_hub_view",
  "utility_card_click",
  "numerology_tool_click",
  "panchang_tool_click",
  "calculator_tool_click",
  "muhurta_tool_click",
  "premium_utility_cta_click",
  "assistant_query",
  // Desk search: records only whether the query matched, plus a normalised
  // term. Rare terms are suppressed at display time by a minimum-count
  // threshold so a single unusual search can never identify anyone.
  "desk_search",
  // Consultation handoff to WhatsApp. Records that a handoff happened -- never
  // the message, which is the reader's private consultation question.
  "consultation_whatsapp_handoff",
  "premium_click",
  "consultation_cta_click",
  "report_cta_click",
  "shop_cta_click",
  "gemstone_guidance_click",
  "premium_ai_cta_click",
  "adsense_slot_view",
  "article_ad_slot_rendered",
  "report_purchase_start",
  "checkout_start",
  "payment_failed",
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
