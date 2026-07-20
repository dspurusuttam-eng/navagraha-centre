// Anonymous Like API for published Desk articles.
//
// Privacy: the browser sends an opaque random token it generated itself; the
// server stores only a SHA-256 of it. No account, no IP, no identity, no
// reader profile. Abuse posture: likes are idempotent (unique row per
// article+device, so repeats cannot inflate counts), only PUBLISHED articles
// accept writes, payloads are strictly validated, and a best-effort per-device
// throttle rejects write bursts.
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { PUBLIC_DESK_STATUS } from "@/modules/content/desk-article-core";

export const runtime = "nodejs";

const DEVICE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const SLUG_PATTERN = /^[a-z0-9-]{1,200}$/;

// Best-effort in-instance throttle (serverless instances are short-lived; the
// unique constraint is the real integrity guarantee — this only absorbs bursts).
const WRITE_WINDOW_MS = 60_000;
const WRITES_PER_WINDOW = 12;
const writeLog = new Map<string, number[]>();

function throttled(deviceHash: string): boolean {
  const now = Date.now();
  const entries = (writeLog.get(deviceHash) ?? []).filter(
    (at) => now - at < WRITE_WINDOW_MS
  );
  if (entries.length >= WRITES_PER_WINDOW) {
    writeLog.set(deviceHash, entries);
    return true;
  }
  entries.push(now);
  writeLog.set(deviceHash, entries);
  if (writeLog.size > 5000) writeLog.clear();
  return false;
}

function hashDeviceToken(token: string): string {
  return createHash("sha256").update(`navagraha-like:${token}`).digest("hex");
}

const noStoreHeaders = { "cache-control": "no-store" } as const;

async function findPublishedArticle(slug: string) {
  return getPrisma().article.findFirst({
    where: {
      slug,
      status: PUBLIC_DESK_STATUS,
      publishedAt: { not: null, lte: new Date() },
    },
    select: { id: true },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug") ?? "";
    const token = url.searchParams.get("device") ?? "";
    if (!SLUG_PATTERN.test(slug)) {
      return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
    }

    const article = await findPublishedArticle(slug);
    if (!article) {
      return NextResponse.json({ ok: true, count: 0, liked: false }, { headers: noStoreHeaders });
    }

    const prisma = getPrisma();
    const count = await prisma.articleLike.count({ where: { articleId: article.id } });
    let liked = false;
    if (DEVICE_TOKEN_PATTERN.test(token)) {
      liked = Boolean(
        await prisma.articleLike.findUnique({
          where: {
            articleId_deviceHash: {
              articleId: article.id,
              deviceHash: hashDeviceToken(token),
            },
          },
          select: { id: true },
        })
      );
    }
    return NextResponse.json({ ok: true, count, liked }, { headers: noStoreHeaders });
  } catch {
    // Never leak query/connection detail on the public surface.
    return NextResponse.json({ ok: false }, { status: 500, headers: noStoreHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      slug?: unknown;
      device?: unknown;
      action?: unknown;
    } | null;
    const slug = typeof body?.slug === "string" ? body.slug : "";
    const token = typeof body?.device === "string" ? body.device : "";
    const action = body?.action === "unlike" ? "unlike" : body?.action === "like" ? "like" : null;

    if (!SLUG_PATTERN.test(slug) || !DEVICE_TOKEN_PATTERN.test(token) || !action) {
      return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
    }

    const deviceHash = hashDeviceToken(token);
    if (throttled(deviceHash)) {
      return NextResponse.json({ ok: false }, { status: 429, headers: noStoreHeaders });
    }

    const article = await findPublishedArticle(slug);
    if (!article) {
      // Unpublished/removed content accepts no likes.
      return NextResponse.json({ ok: false }, { status: 404, headers: noStoreHeaders });
    }

    const prisma = getPrisma();
    if (action === "like") {
      await prisma.articleLike.upsert({
        where: { articleId_deviceHash: { articleId: article.id, deviceHash } },
        create: { articleId: article.id, deviceHash },
        update: {},
      });
    } else {
      await prisma.articleLike.deleteMany({
        where: { articleId: article.id, deviceHash },
      });
    }

    const count = await prisma.articleLike.count({ where: { articleId: article.id } });
    return NextResponse.json(
      { ok: true, count, liked: action === "like" },
      { headers: noStoreHeaders }
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: noStoreHeaders });
  }
}
