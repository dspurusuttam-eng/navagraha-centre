import {
  apiErrorResponse,
  readJsonObjectBody,
} from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import {
  checkSecurityRateLimit,
  getInvalidInputSafeMessage,
  guardPayloadByteLength,
  guardTrustedOrigin,
  normalizeSafeText,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import { trackPremiumClicked } from "@/modules/conversion/events";
import { generateUserReport } from "@/lib/ai/report-generator";
import { generatePremiumReportForUser } from "@/modules/report";
import { getLocaleDefinition } from "@/modules/localization/config";
import { resolveLocaleFromRequest } from "@/modules/localization/request";

export const dynamic = "force-dynamic";

type PremiumReportRequestPayload = {
  reportType?: unknown;
};

function readReportType(payload: PremiumReportRequestPayload | null) {
  const validated = normalizeSafeText(payload?.reportType ?? "", {
    fieldName: "Report type",
    maxLength: 80,
  });

  return validated.ok ? validated.data : "";
}

export async function POST(request: Request) {
  const originGuard = guardTrustedOrigin(request, {
    allowMissingOrigin: true,
  });

  if (originGuard) {
    return originGuard;
  }

  const payloadGuard = guardPayloadByteLength(request);

  if (payloadGuard) {
    return payloadGuard;
  }

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

  const limit = checkSecurityRateLimit({
    request,
    policyKey: "premium-report-generate",
    identityParts: [session.user.id],
  });

  if (!limit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many premium report requests. Please retry shortly.",
      headers: limit.headers,
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
      message: getInvalidInputSafeMessage(resolveLocaleFromRequest(request)),
      headers: limit.headers,
    });
  }

  try {
    const requestLocale = resolveLocaleFromRequest(request);
    const report = await generateUserReport(
      session.user.id,
      session.user.name,
      getLocaleDefinition(requestLocale).label,
      requestLocale
    );
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
      {
        status: 200,
        headers: limit.headers,
      }
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
      headers: limit.headers,
    });
  }
}
