// Server-side web-push delivery. VAPID keys live only in server env; the
// public key alone is exposed to clients (that is its purpose). Dead
// subscriptions (push service answers 404/410) are deleted during a send;
// other failures increment failCount and rows past the threshold are removed.
import "server-only";

import webpush from "web-push";
import { getPrisma } from "@/lib/prisma";

const FAIL_LIMIT = 5;

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(
    "mailto:navagrahacentre.contact@gmail.com",
    publicKey,
    privateKey
  );
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

export type BroadcastResult = {
  total: number;
  succeeded: number;
  failed: number;
  cleaned: number;
};

async function deliver(
  subscription: { id: string; endpoint: string; p256dh: string; auth: string; failCount: number },
  payload: string
): Promise<"ok" | "dead" | "failed"> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      payload,
      { TTL: 24 * 60 * 60 }
    );
    return "ok";
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode: unknown }).statusCode)
        : 0;
    return statusCode === 404 || statusCode === 410 ? "dead" : "failed";
  }
}

/** Send a payload to every stored subscription; prunes dead/failing rows. */
export async function broadcastPush(payload: PushPayload): Promise<BroadcastResult | null> {
  if (!ensureConfigured()) return null;
  const prisma = getPrisma();
  const subscriptions = await prisma.pushSubscription.findMany();
  const body = JSON.stringify(payload);

  let succeeded = 0;
  let failed = 0;
  let cleaned = 0;

  // Modest fan-out in small batches; subscriber counts here are low hundreds at most.
  const BATCH = 20;
  for (let i = 0; i < subscriptions.length; i += BATCH) {
    const slice = subscriptions.slice(i, i + BATCH);
    const outcomes = await Promise.all(slice.map((sub) => deliver(sub, body)));
    for (let j = 0; j < slice.length; j++) {
      const outcome = outcomes[j];
      const sub = slice[j];
      if (outcome === "ok") {
        succeeded += 1;
        if (sub.failCount > 0) {
          await prisma.pushSubscription
            .update({ where: { id: sub.id }, data: { failCount: 0 } })
            .catch(() => {});
        }
      } else if (outcome === "dead") {
        cleaned += 1;
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      } else {
        failed += 1;
        if (sub.failCount + 1 >= FAIL_LIMIT) {
          cleaned += 1;
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          await prisma.pushSubscription
            .update({ where: { id: sub.id }, data: { failCount: { increment: 1 } } })
            .catch(() => {});
        }
      }
    }
  }

  return { total: subscriptions.length, succeeded, failed, cleaned };
}

/** Send only to one stored subscription (admin "test to this device"). */
export async function sendTestPush(endpoint: string, payload: PushPayload): Promise<"ok" | "dead" | "failed" | "unknown" | "unconfigured"> {
  if (!ensureConfigured()) return "unconfigured";
  const subscription = await getPrisma().pushSubscription.findUnique({ where: { endpoint } });
  if (!subscription) return "unknown";
  const outcome = await deliver(subscription, JSON.stringify(payload));
  if (outcome === "dead") {
    await getPrisma().pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
  }
  return outcome;
}
