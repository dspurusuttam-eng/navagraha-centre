import { cn } from "@/lib/cn";
import { globalMonetizationCopy } from "@/modules/localization/copy";

type SponsoredDisclosureProps = {
  label?: string;
  description?: string;
  className?: string;
};

export function SponsoredDisclosure({
  label = globalMonetizationCopy.sponsored,
  description = "Recommendations are provided for guidance. Please choose products or services based on your needs and proper consultation.",
  className,
}: Readonly<SponsoredDisclosureProps>) {
  return (
    <p
      className={cn(
        "text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]",
        className
      )}
    >
      {label}: {description}
    </p>
  );
}
