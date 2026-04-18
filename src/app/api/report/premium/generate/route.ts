import {
  apiErrorResponse,
  readJsonObjectBody,
} from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { getSession } from "@/modules/auth/server";
import { trackPremiumClicked } from "@/modules/conversion/events";
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
  const session = await getSession().catch((error) => {
    captureException(error, {
      route: "api.report.premium.generate",
      stage: "get-session",
    });

    return null;
  });

  if (!session) {
    return apiErrorResponse({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Sign in is required to generate premium reports.",
    });
  }

  const payload = (await readJsonObjectBody(request)) as
    | PremiumReportRequestPayload
    | null;
  const reportType = readReportType(payload);

  if (!reportType) {
    return apiErrorResponse({
      statusCode: 400,
      code: "REPORT_TYPE_REQUIRED",
      message: "Report type is required.",
    });
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

    if (premiumReport.status !== "FULL_ACCESS") {
      trackPremiumClicked({
        userId: session.user.id,
        source: "premium-report-preview",
        reportType: premiumReport.reportType,
      });
    }

    return Response.json(
      {
        status: "ok",
        premiumReport,
      },
      { status: 200 }
    );
  } catch (error) {
    captureException(error, {
      route: "api.report.premium.generate",
      userId: session.user.id,
      reportType,
    });

    return apiErrorResponse({
      statusCode: 500,
      code: "PREMIUM_REPORT_FAILED",
      message: "Premium report generation failed. Please try again.",
    });
  }
}
