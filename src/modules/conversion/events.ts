import "server-only";

import { trackServerEvent } from "@/lib/observability";
import type { UserPlanType } from "@/modules/subscriptions";

type ConversionEventName =
  | "chart_created"
  | "assistant_used"
  | "premium_clicked";

type ConversionContext = {
  userId?: string;
  planType?: UserPlanType;
  source?: string;
  reportType?: string;
  providerKey?: string | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

function emitConversionEvent(name: ConversionEventName, context: ConversionContext) {
  trackServerEvent(`conversion.${name}`, {
    userId: context.userId,
    planType: context.planType,
    source: context.source,
    reportType: context.reportType,
    providerKey: context.providerKey,
    ...(context.metadata ?? {}),
  });
}

export function trackChartCreated(context: ConversionContext) {
  emitConversionEvent("chart_created", context);
}

export function trackAssistantUsed(context: ConversionContext) {
  emitConversionEvent("assistant_used", context);
}

export function trackPremiumClicked(context: ConversionContext) {
  emitConversionEvent("premium_clicked", context);
}

