"use server";

// Founder-gated push notification actions: broadcast a published article once,
// and send a test push to the caller's own device subscription.
import { getPrisma } from "@/lib/prisma";
import { broadcastPush, sendTestPush } from "@/lib/push/web-push";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { hasAdminAccess } from "@/modules/admin/permissions";
import { seoConfig } from "@/lib/seo/seo-config";

export type NotifyState = {
  ok: boolean;
  message: string;
};

async function requireFounder(): Promise<boolean> {
  const session = await getAdminPageSessionOrNull();
  return Boolean(session && hasAdminAccess(session.adminRoles, ["founder"]));
}

/**
 * Broadcast "new article" to every subscriber. Guarded by:
 *  - Founder-only server authorization,
 *  - article must currently be PUBLISHED (drafts/failed publications can never notify),
 *  - one broadcast per article ever (unique NotificationSend.articleId).
 */
export async function notifyReadersOfArticle(articleId: string): Promise<NotifyState> {
  if (!(await requireFounder())) {
    return { ok: false, message: "Not authorised." };
  }
  const id = typeof articleId === "string" ? articleId.slice(0, 64) : "";
  if (!id) return { ok: false, message: "Missing article." };

  const prisma = getPrisma();
  const article = await prisma.article.findFirst({
    where: { id, status: "PUBLISHED", publishedAt: { not: null } },
    select: { id: true, title: true, slug: true, excerpt: true, summary: true },
  });
  if (!article) {
    return { ok: false, message: "Only a published article can be announced." };
  }

  const existing = await prisma.notificationSend.findUnique({ where: { articleId: id } });
  if (existing) {
    return {
      ok: false,
      message: `Already announced on ${existing.createdAt.toISOString().slice(0, 16).replace("T", " ")} (sent to ${existing.total}).`,
    };
  }

  const url = `${seoConfig.siteUrl}/from-the-desk/${article.slug}`;
  const result = await broadcastPush({
    title: article.title.slice(0, 120),
    body: (article.summary ?? article.excerpt ?? "New article from the Desk.").slice(0, 180),
    url,
  });
  if (!result) {
    return { ok: false, message: "Push is not configured on the server." };
  }

  await prisma.notificationSend.create({
    data: {
      articleId: id,
      title: article.title.slice(0, 200),
      url,
      total: result.total,
      succeeded: result.succeeded,
      failed: result.failed,
    },
  });

  return {
    ok: true,
    message: `Announced to ${result.total} subscriber(s): ${result.succeeded} delivered, ${result.failed} failed, ${result.cleaned} stale removed.`,
  };
}

/** Send a test push only to the endpoint belonging to the caller's device. */
export async function sendTestNotification(endpoint: string): Promise<NotifyState> {
  if (!(await requireFounder())) {
    return { ok: false, message: "Not authorised." };
  }
  const value = typeof endpoint === "string" ? endpoint.slice(0, 1024) : "";
  if (!value) {
    return { ok: false, message: "Enable notifications on this device first, then retry." };
  }
  const outcome = await sendTestPush(value, {
    title: "NAVAGRAHA ADMIN test",
    body: "Push notifications are working on this device.",
    url: "/from-the-desk",
  });
  if (outcome === "ok") return { ok: true, message: "Test notification sent to this device." };
  if (outcome === "unknown") return { ok: false, message: "This device is not subscribed. Tap Enable Notifications in the bell first." };
  if (outcome === "unconfigured") return { ok: false, message: "Push is not configured on the server." };
  return { ok: false, message: "Delivery failed — try again." };
}
