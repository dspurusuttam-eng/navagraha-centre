import { apiErrorResponse } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { normalizeSafeText } from "@/lib/security";
import { processShopPaymentWebhook } from "@/modules/shop/webhook-core";

export const dynamic = "force-dynamic";

function resolveProviderKey(request: Request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("provider");
  const fromHeader = request.headers.get("x-shop-provider");
  const normalized = normalizeSafeText(fromQuery ?? fromHeader ?? "draft-order", {
    fieldName: "Provider key",
    maxLength: 40,
  });

  return normalized.ok ? normalized.data : "draft-order";
}

function resolveSignature(request: Request) {
  return (
    request.headers.get("x-shop-signature") ??
    request.headers.get("x-razorpay-signature") ??
    request.headers.get("stripe-signature")
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > 512_000) {
    return apiErrorResponse({
      statusCode: 413,
      code: "PAYLOAD_TOO_LARGE",
      message: "Webhook payload exceeds the accepted size limit.",
    });
  }

  const rawBody = await request.text();
  let result;

  try {
    result = await processShopPaymentWebhook({
      providerKey: resolveProviderKey(request),
      rawBody,
      signature: resolveSignature(request),
    });
  } catch (error) {
    captureException(error, {
      route: "api.shop.webhooks.payment",
      providerKey: resolveProviderKey(request),
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "WEBHOOK_PROCESSING_FAILED",
      message: "Webhook processing failed unexpectedly.",
    });
  }

  if (result.outcome === "invalid-signature") {
    return Response.json(result, { status: 401 });
  }

  if (result.outcome === "unsupported-provider") {
    return Response.json(result, { status: 400 });
  }

  if (result.outcome === "missing-record") {
    return Response.json(result, { status: 202 });
  }

  if (result.outcome === "ignored") {
    return Response.json(result, { status: 202 });
  }

  return Response.json(result, { status: 200 });
}
