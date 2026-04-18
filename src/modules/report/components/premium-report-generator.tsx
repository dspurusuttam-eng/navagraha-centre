"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics/track-event";
import { getApiErrorMessage } from "@/lib/api/http";
import { getMonetizationUpgradeCopy } from "@/modules/subscriptions/monetization-content";

type PremiumReportType = "CAREER" | "MARRIAGE" | "FINANCE" | "HEALTH";

type PremiumReportOutput = {
  reportType: PremiumReportType;
  status: "PREVIEW_LOCKED" | "FULL_ACCESS" | "LIMIT_REACHED";
  title: string;
  preview: string;
  fullReportSections: Array<{
    title: string;
    content: string;
  }>;
  message: string;
  upgradeHref: string | null;
};

const premiumReportOptions: Array<{
  key: PremiumReportType;
  title: string;
}> = [
  { key: "CAREER", title: "Career Report" },
  { key: "MARRIAGE", title: "Marriage Report" },
  { key: "FINANCE", title: "Finance Report" },
  { key: "HEALTH", title: "Health Report" },
];

function getUpgradeCtaLabel(reportType: PremiumReportType) {
  switch (reportType) {
    case "CAREER":
      return "Get Detailed Career Prediction";
    case "MARRIAGE":
      return "View Full Compatibility Analysis";
    default:
      return "Unlock Full Report";
  }
}

export function PremiumReportGenerator() {
  const [activeType, setActiveType] = useState<PremiumReportType>("CAREER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PremiumReportOutput | null>(null);
  const previewUpgradeCopy = getMonetizationUpgradeCopy({
    prompt: "report-preview",
    surface: "protected",
  });
  const limitUpgradeCopy = getMonetizationUpgradeCopy({
    prompt: "report-limit",
    surface: "protected",
  });

  useEffect(() => {
    if (!result || result.status === "FULL_ACCESS") {
      return;
    }

    trackEvent("upgrade_prompt_view", {
      page: "/dashboard/report",
      feature: `premium-report-${result.status.toLowerCase()}`,
      reportType: result.reportType,
    });
  }, [result]);

  async function generateReport(reportType: PremiumReportType) {
    if (isLoading) {
      return;
    }

    setActiveType(reportType);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/report/premium/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType,
        }),
      });

      const payload = (await response.json()) as {
        status?: string;
        premiumReport?: PremiumReportOutput;
      };

      if (!response.ok || !payload.premiumReport) {
        throw new Error(
          getApiErrorMessage(payload, "Premium report request failed.")
        );
      }

      setResult(payload.premiumReport);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Premium report request failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Premium Report Generator
        </p>
        <h2
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          Generate focused report previews with premium unlock.
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {premiumReportOptions.map((option) => (
          <Button
            key={option.key}
            tone={activeType === option.key ? "accent" : "secondary"}
            size="sm"
            onClick={() => {
              void generateReport(option.key);
            }}
            disabled={isLoading}
          >
            {option.title}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Generating report preview...
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[var(--radius-xl)] border border-[rgba(214,116,90,0.32)] bg-[rgba(214,116,90,0.08)] px-4 py-4">
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
            {error}
          </p>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{result.title}</Badge>
            <Badge tone="neutral">{result.status}</Badge>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {result.preview}
          </p>
          {result.status !== "FULL_ACCESS" ? (
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {result.status === "LIMIT_REACHED"
                ? limitUpgradeCopy.message
                : previewUpgradeCopy.message}
            </p>
          ) : null}
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
            {result.message}
          </p>

          {result.status === "FULL_ACCESS" ? (
            <div className="space-y-3">
              {result.fullReportSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                >
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    {section.title}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {result.upgradeHref ? (
            <Link
              href={result.upgradeHref}
              className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-foreground)] transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)]"
              onClick={() => {
                trackEvent("premium_click", {
                  page: "/dashboard/report",
                  feature: `premium-report-${result.reportType.toLowerCase()}`,
                });
                trackEvent("upgrade_started", {
                  page: "/dashboard/report",
                  feature: `premium-report-${result.status.toLowerCase()}`,
                });
              }}
            >
              {getUpgradeCtaLabel(result.reportType)}
            </Link>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
