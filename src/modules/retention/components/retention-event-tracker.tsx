"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import type { RetentionDashboardSnapshot } from "@/modules/retention/types";
import type { UserPlanModel } from "@/modules/subscriptions";

type RetentionEventTrackerProps = {
  snapshot: RetentionDashboardSnapshot;
  userPlan: UserPlanModel;
};

export function RetentionEventTracker({
  snapshot,
  userPlan,
}: Readonly<RetentionEventTrackerProps>) {
  useEffect(() => {
    const payload = {
      page: "/dashboard",
      feature: "retention-engine",
      lifecycleStage: snapshot.lifecycleStage,
      planType: userPlan.plan_type,
    };

    trackEvent("daily_insight_view", payload);
    trackEvent("return_prompt_shown", payload);

    if (snapshot.analytics.showChartIncompleteNudge) {
      trackEvent("chart_incomplete_nudge", payload);
    }

    if (snapshot.analytics.showPremiumFollowupNudge) {
      trackEvent("premium_followup_nudge", payload);
    }
  }, [
    snapshot.analytics.showChartIncompleteNudge,
    snapshot.analytics.showPremiumFollowupNudge,
    snapshot.lifecycleStage,
    userPlan.plan_type,
  ]);

  return null;
}
