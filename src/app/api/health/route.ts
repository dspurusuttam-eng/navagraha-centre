import { NextResponse } from "next/server";
import { validateLaunchEnvironment } from "@/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const validation = validateLaunchEnvironment();

  return NextResponse.json(
    {
      ok: validation.valid,
      timestamp: new Date().toISOString(),
      issues: validation.issues.map((issue) => ({
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
