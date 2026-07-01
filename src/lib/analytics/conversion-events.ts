"use client";

import { trackEvent } from "@/lib/analytics/track-event";
import type {
  AnalyticsEventPayload,
  TrackedEventName,
} from "@/lib/analytics/types";

export type SafeConversionContext = {
  route?: string;
  locale?: string;
  toolKey?: string;
  section?: string;
  cta?: string;
  source?: string;
  status?: string;
  planKey?: string;
};

const maxFieldLength = 120;

function toSafeString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxFieldLength);
}

function toSafePayload(context: SafeConversionContext): AnalyticsEventPayload {
  const payload: AnalyticsEventPayload = {};

  const route = toSafeString(context.route);
  const locale = toSafeString(context.locale);
  const toolKey = toSafeString(context.toolKey);
  const section = toSafeString(context.section);
  const cta = toSafeString(context.cta);
  const source = toSafeString(context.source);
  const status = toSafeString(context.status);
  const planKey = toSafeString(context.planKey);

  if (route) payload.route = route;
  if (locale) payload.locale = locale;
  if (toolKey) payload.toolKey = toolKey;
  if (section) payload.section = section;
  if (cta) payload.cta = cta;
  if (source) payload.source = source;
  if (status) payload.status = status;
  if (planKey) payload.planKey = planKey;

  return payload;
}

function emit(eventName: TrackedEventName, context: SafeConversionContext) {
  trackEvent(eventName, toSafePayload(context), { dispatch: "idle" });
}

export function trackHomepageCtaClick(context: SafeConversionContext) {
  emit("homepage_cta_click", context);
}

export function trackKundliGenerateClick(context: SafeConversionContext) {
  emit("kundli_generate_click", context);
}

export function trackDashboardCheckin(context: SafeConversionContext) {
  emit("dashboard_checkin", context);
}

export function trackRashifalView(context: SafeConversionContext) {
  emit("rashifal_view", context);
}

export function trackPanchangView(context: SafeConversionContext) {
  emit("panchang_view", context);
}

export function trackToolsHubView(context: SafeConversionContext) {
  emit("tools_hub_view", context);
}

export function trackReportPreviewClick(context: SafeConversionContext) {
  emit("report_preview_click", context);
}

export function trackReportUnlockClick(context: SafeConversionContext) {
  emit("report_unlock_click", context);
}

export function trackAiStartClick(context: SafeConversionContext) {
  emit("ai_start_click", context);
}

export function trackConsultationBookClick(context: SafeConversionContext) {
  emit("consultation_book_click", context);
}

export function trackLanguageSwitch(context: SafeConversionContext) {
  emit("language_switch", context);
}

export function trackPwaInstallPrompt(context: SafeConversionContext) {
  emit("pwa_install_prompt", context);
}

export function trackPwaInstallSuccess(context: SafeConversionContext) {
  emit("pwa_install_success", context);
}
