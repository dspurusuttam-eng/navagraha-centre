import Image from "next/image";
import { cn } from "@/lib/cn";

export type NavagrahaLogoVariant =
  | "header"
  | "mobile"
  | "footer-light"
  | "footer-dark"
  | "emblem-only"
  | "watermark";

type NavagrahaLogoProps = {
  variant?: NavagrahaLogoVariant;
  className?: string;
  priority?: boolean;
};

type VariantConfig = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

const variantMap: Record<NavagrahaLogoVariant, VariantConfig> = {
  header: {
    src: "/brand/navagraha-logo-horizontal.svg",
    width: 312,
    height: 84,
    alt: "NAVAGRAHA CENTRE logo",
  },
  mobile: {
    src: "/brand/navagraha-emblem.svg",
    width: 36,
    height: 36,
    alt: "NAVAGRAHA CENTRE emblem",
  },
  "footer-light": {
    src: "/brand/navagraha-logo-horizontal.svg",
    width: 288,
    height: 76,
    alt: "NAVAGRAHA CENTRE logo",
  },
  "footer-dark": {
    src: "/brand/navagraha-logo-stacked.svg",
    width: 240,
    height: 220,
    alt: "NAVAGRAHA CENTRE logo",
  },
  "emblem-only": {
    src: "/brand/navagraha-emblem.svg",
    width: 42,
    height: 42,
    alt: "NAVAGRAHA CENTRE emblem",
  },
  watermark: {
    src: "/brand/navagraha-watermark.svg",
    width: 420,
    height: 420,
    alt: "NAVAGRAHA watermark",
  },
};

const variantSizes: Record<NavagrahaLogoVariant, string> = {
  header: "(max-width: 1280px) 0px, 312px",
  mobile: "36px",
  "footer-light": "(max-width: 640px) 180px, 288px",
  "footer-dark": "(max-width: 640px) 152px, 184px",
  "emblem-only": "42px",
  watermark: "(max-width: 768px) 220px, 420px",
};

export function NavagrahaLogo({
  variant = "header",
  className,
  priority = false,
}: Readonly<NavagrahaLogoProps>) {
  const config = variantMap[variant];

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      priority={priority}
      className={cn("h-auto max-w-full shrink-0", className)}
      sizes={variantSizes[variant]}
    />
  );
}
