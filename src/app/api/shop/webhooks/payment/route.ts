import { processShopPaymentWebhook } from "@/modules/shop/webhook-core";

export const dynamic = "force-dynamic";

function resolveProviderKey(request: Request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("provider");
  const fromHeader = request.headers.get("x-shop-provider");

  return fromQuery ?? fromHeader ?? "draft-order";
}

function resolveSignature(request: Request) {
  return (
    request.headers.get("x-shop-signature") ??
    request.headers.get("stripe-signature")
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let result;

  try {
    result = await processShopPaymentWebhook({
      providerKey: resolveProviderKey(request),
      rawBody,
      signature: resolveSignature(request),
    });
  } catch {
    return Response.json(
      {
        outcome: "ignored",
        providerKey: "unknown",
        message: "Webhook processing failed unexpectedly.",
      },
      { status: 500 }
    );
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
