"use client";

import { Button } from "@/components/ui/button";

type ConsultationUtilitySelectButtonProps = {
  tierSlug: string;
  utilitySlug: string;
  label: string;
};

function selectJourneyUtility(tierSlug: string, utilitySlug: string) {
  const tierButton = document.querySelector<HTMLButtonElement>(
    `[data-journey-tier="${tierSlug}"]`,
  );

  tierButton?.click();

  window.setTimeout(() => {
    const utilityButton = document.querySelector<HTMLButtonElement>(
      `[data-journey-utility="${utilitySlug}"] button:not(:disabled)`,
    );

    utilityButton?.click();

    window.setTimeout(() => {
      const target =
        document.querySelector<HTMLElement>("[data-journey-vastu-modes]") ??
        document.querySelector<HTMLElement>("[data-journey-case-intake]");

      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const focusTarget =
        target.querySelector<HTMLElement>("textarea, button:not(:disabled)") ?? target;
      focusTarget.focus({ preventScroll: true });
    }, 50);
  }, 50);
}

export function ConsultationUtilitySelectButton({
  label,
  tierSlug,
  utilitySlug,
}: Readonly<ConsultationUtilitySelectButtonProps>) {
  return (
    <Button
      fullWidth
      onClick={() => selectJourneyUtility(tierSlug, utilitySlug)}
      tone={label === "Request Scope Review" ? "secondary" : "accent"}
    >
      {label}
    </Button>
  );
}
