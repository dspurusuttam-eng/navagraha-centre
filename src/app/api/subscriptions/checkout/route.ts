import { getSession } from "@/modules/auth/server";
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
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | SubscriptionCheckoutPayload
    | null;
  const planType = readPlanType(payload);

  if (!isPaidMonetizationPlanKey(planType)) {
    return Response.json(
      { error: "A payable planType is required. Use PREMIUM or PRO." },
      { status: 400 }
    );
  }

  try {
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
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Subscription checkout initialization failed.",
      },
      { status: 400 }
    );
  }
}
