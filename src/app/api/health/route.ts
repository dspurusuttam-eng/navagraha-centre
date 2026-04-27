import { NextResponse } from "next/server";
import { validateLaunchEnvironment } from "@/config/env";
import { sendOpsAlert } from "@/lib/ops-alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  const validation = validateLaunchEnvironment();
  const isProduction = process.env.NODE_ENV === "production";

  if (!validation.valid) {
    await sendOpsAlert({
      title: "Health check failed",
      message: "Launch environment validation failed in /api/health.",
      severity: "critical",
      source: "health-check",
      dedupeKey: "health-check:invalid",
      cooldownMs: 10 * 60 * 1_000,
      context: {
        issues: validation.issues,
      },
    });
  }

  return NextResponse.json(
    {
      ok: validation.valid,
      timestamp: new Date().toISOString(),
      issues: isProduction
        ? validation.issues.map((issue) => ({
            key: issue.key,
            severity: issue.severity,
            message: "Configuration issue detected.",
          }))
        : validation.issues.map((issue) => ({
            key: issue.key,
            severity: issue.severity,
            message: issue.message,
          })),
    },
    {
      status: validation.valid ? 200 : 503,
    }
  );
}
