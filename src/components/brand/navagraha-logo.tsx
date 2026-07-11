import Image from "next/image";
import { cn } from "@/lib/cn";

export type NavagrahaLogoVariant =
  | "header"
  | "mobile"
  | "footer-light"
  | "footer-dark"
  | "emblem-only"
  | "auth"
  | "onboarding"
  | "watermark";

type NavagrahaLogoProps = {
  variant?: NavagrahaLogoVariant;
  displaySize?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
};

type VariantConfig = {
  displaySize: number;
  sizes: string;
};

const variantMap: Record<NavagrahaLogoVariant, VariantConfig> = {
  header: {
    displaySize: 48,
    sizes: "48px",
  },
  mobile: {
    displaySize: 36,
    sizes: "36px",
  },
  "footer-light": {
    displaySize: 56,
    sizes: "56px",
  },
  "footer-dark": {
    displaySize: 64,
    sizes: "64px",
  },
  "emblem-only": {
    displaySize: 48,
    sizes: "48px",
  },
  auth: {
    displaySize: 88,
    sizes: "(max-width: 640px) 72px, 88px",
  },
  onboarding: {
    displaySize: 72,
    sizes: "72px",
  },
  watermark: {
    displaySize: 96,
    sizes: "96px",
  },
};

const generatedSizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512] as const;

function getLogoAssetSize(displaySize: number) {
  return (
    generatedSizes.find((size) => size >= displaySize * 1.5) ??
    generatedSizes[generatedSizes.length - 1]
  );
}

export function NavagrahaLogo({
  variant = "header",
  displaySize,
  alt = "NAVAGRAHA CENTRE",
  className,
  priority = false,
}: Readonly<NavagrahaLogoProps>) {
  const config = variantMap[variant];
  const resolvedDisplaySize = displaySize ?? config.displaySize;
  const assetSize = getLogoAssetSize(resolvedDisplaySize);

  return (
    <Image
      src={`/brand/navagraha-centre-logo-${assetSize}.png`}
      alt={alt}
      width={assetSize}
      height={assetSize}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
      sizes={config.sizes}
      style={{
        width: resolvedDisplaySize,
        height: resolvedDisplaySize,
      }}
    />
  );
}
