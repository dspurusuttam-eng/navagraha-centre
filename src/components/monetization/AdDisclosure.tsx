import { cn } from "@/lib/cn";
import { globalMonetizationCopy } from "@/modules/localization/copy";

type AdDisclosureProps = {
  label?: string;
  className?: string;
};

export function AdDisclosure({
  label = globalMonetizationCopy.advertisement,
  className,
}: Readonly<AdDisclosureProps>) {
  return (
    <p
      className={cn(
        "text-[0.64rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]",
        className
      )}
    >
      {label}
    </p>
  );
}
