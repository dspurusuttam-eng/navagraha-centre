import { getSession } from "@/modules/auth/server";
import { generateUserReport } from "@/lib/ai/report-generator";
import { generatePremiumReportForUser } from "@/modules/report";

export const dynamic = "force-dynamic";

type PremiumReportRequestPayload = {
  reportType?: unknown;
};

function readReportType(payload: PremiumReportRequestPayload | null) {
  if (!payload || typeof payload.reportType !== "string") {
    return "";
  }

  return payload.reportType.trim();
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | PremiumReportRequestPayload
    | null;
  const reportType = readReportType(payload);

  if (!reportType) {
    return Response.json(
      { error: "Report type is required." },
      { status: 400 }
    );
  }

  try {
    const report = await generateUserReport(session.user.id, session.user.name);
    const premiumReport = await generatePremiumReportForUser({
      userId: session.user.id,
      reportType,
      chartReport: report.chartReport,
      insights: report.insights,
      currentCycle: report.currentCycle,
    });

    return Response.json(
      {
        status: "ok",
        premiumReport,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Premium report generation failed.",
      },
      { status: 400 }
    );
  }
}
