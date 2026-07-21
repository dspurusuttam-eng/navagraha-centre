// Push subscription registration. Stores only the Push API delivery triple
// (endpoint + p256dh + auth) and a locale — no account, no identity, no IP.
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const noStore = { "cache-control": "no-store" } as const;
const MAX_ENDPOINT = 1024;
const MAX_KEY = 512;

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      endpoint?: unknown;
      keys?: { p256dh?: unknown; auth?: unknown };
      locale?: unknown;
    } | null;

    const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
    const p256dh = typeof body?.keys?.p256dh === "string" ? body.keys.p256dh : "";
    const auth = typeof body?.keys?.auth === "string" ? body.keys.auth : "";
    const locale =
      typeof body?.locale === "string" && /^[a-z]{2}$/.test(body.locale)
        ? body.locale
        : "en";

    if (
      !endpoint || endpoint.length > MAX_ENDPOINT || !isHttpsUrl(endpoint) ||
      !p256dh || p256dh.length > MAX_KEY ||
      !auth || auth.length > MAX_KEY
    ) {
      return NextResponse.json({ ok: false }, { status: 400, headers: noStore });
    }

    await getPrisma().pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, p256dh, auth, locale },
      update: { p256dh, auth, locale, failCount: 0 },
    });
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null;
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
    if (!endpoint || endpoint.length > MAX_ENDPOINT) {
      return NextResponse.json({ ok: false }, { status: 400, headers: noStore });
    }
    await getPrisma().pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: noStore });
  }
}
