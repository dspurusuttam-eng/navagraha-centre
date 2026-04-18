import {
  apiErrorResponse,
  readJsonObjectBody,
} from "@/lib/api/http";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { captureException, trackServerEvent } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import { trackPremiumClicked } from "@/modules/conversion/events";
import { recordAnalyticsEventSafely } from "@/lib/analytics/event-store";
import {
  initializeSubscriptionCheckout,
  isPaidMonetizationPlanKey,
} from "@/modules/subscriptions/payment-plans";

export const dynamic = "force-dynamic";

type SubscriptionCheckoutPayload = {
  planType?: unknown;
};

function readPlanType(payload: SubscriptionCheckoutPayload | null) {
  if (!payload || typeof payload.planType !== "string") {
    return "";
  }

  return payload.planType.trim().toUpperCase();
}

export async function POST(request: Request) {
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.subscriptions.checkout",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to start subscription checkout.",
    });
  }

  const limit = checkRateLimit({
    key: buildRateLimitKey([
      "api-subscriptions-checkout",
      session.user.id,
      getClientAddress(request),
    ]),
    limit: 10,
    windowMs: 10 * 60 * 1_000,
  });

  if (!limit.allowed) {
    trackServerEvent(
      "subscription-checkout.rate-limited",
      {
        userId: session.user.id,
      },
      "warning"
    );

    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message:
        "Too many subscription checkout attempts. Please wait and try again.",
      headers: getRateLimitHeaders(limit),
    });
  }

  const payload = (await readJsonObjectBody(request)) as
    | SubscriptionCheckoutPayload
    | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Checkout payload must be a JSON object.",
      headers: getRateLimitHeaders(limit),
    });
  }

  const planType = readPlanType(payload);

  if (!isPaidMonetizationPlanKey(planType)) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_PLAN_TYPE",
      message: "A payable planType is required. Use PREMIUM or PRO.",
      headers: getRateLimitHeaders(limit),
    });
  }

  try {
    recordAnalyticsEventSafely({
      event: "plan_selected",
      userId: session.user.id,
      payload: {
        page: "/settings",
        surface: "protected",
        plan: planType,
        feature: "subscription-checkout-init",
      },
    });
    recordAnalyticsEventSafely({
      event: "upgrade_started",
      userId: session.user.id,
      payload: {
        page: "/settings",
        surface: "protected",
        plan: planType,
        feature: "subscription-checkout-init",
      },
    });
    trackPremiumClicked({
      userId: session.user.id,
      source: "subscription-checkout-init",
      planType,
    });

    const checkout = await initializeSubscriptionCheckout({
      userId: session.user.id,
      planKey: planType,
      customerEmail: session.user.email,
      customerName: session.user.name,
      billingTimezone: "Asia/Kolkata",
    });

    return Response.json(
      {
        status: "ok",
        ...checkout,
      },
      {
        status: 201,
        headers: getRateLimitHeaders(limit),
      }
    );
  } catch (error) {
    captureException(error, {
      route: "api.subscriptions.checkout",
      userId: session.user.id,
      planType,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "CHECKOUT_INIT_FAILED",
      message: "Subscription checkout initialization failed.",
      headers: getRateLimitHeaders(limit),
    });
  }
}
