import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/cn";

export type UtilityIconName =
  | "kundli"
  | "compatibility"
  | "rashifal"
  | "panchang"
  | "numerology"
  | "calculators"
  | "muhurta";

type UtilityIconProps = {
  name: UtilityIconName;
  className?: string;
  glyphClassName?: string;
};

function UtilityIconFrame({
  className,
  children,
}: Readonly<{
  className?: string;
  children: ReactNode;
}>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(184,137,67,0.34)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.94)_0%,rgba(247,234,204,0.9)_70%,rgba(238,214,166,0.8)_100%)] text-[rgba(130,86,25,0.92)] shadow-[0_8px_20px_rgba(121,85,33,0.14)] transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_10px_24px_rgba(121,85,33,0.2)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function GlyphBase({
  className,
  children,
}: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function KundliGlyph({ className }: Readonly<{ className?: string }>) {
  return (
    <GlyphBase className={className}>
      <path d="M4 4h16v16H4z" />
      <path d="M4 12h16M12 4v16M4 4l16 16M20 4L4 20" />
      <path d="M12 8.7l.6 1.2 1.3.2-.95.9.23 1.25-1.18-.62-1.18.62.23-1.25-.95-.9 1.3-.2z" />
    </GlyphBase>
  );
}

function CompatibilityGlyph({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <GlyphBase className={className}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M8.2 8.8l.5 1.1 1.2.2-.86.82.2 1.14-1.04-.56-1.04.56.2-1.14-.86-.82 1.2-.2z" />
      <path d="M15.8 8.8l.5 1.1 1.2.2-.86.82.2 1.14-1.04-.56-1.04.56.2-1.14-.86-.82 1.2-.2z" />
      <path d="M12 17.5c-.88-.64-2.8-2.17-2.8-3.65a1.8 1.8 0 0 1 3-1.36 1.8 1.8 0 0 1 3 1.36c0 1.48-1.92 3.01-2.8 3.65z" />
    </GlyphBase>
  );
}

function RashifalGlyph({ className }: Readonly<{ className?: string }>) {
  return (
    <GlyphBase className={className}>
      <circle cx="12" cy="12" r="8.3" />
      <circle cx="12" cy="12" r="5.3" />
      <path d="M12 3.7v1.8M12 18.5v1.8M3.7 12h1.8M18.5 12h1.8M6.14 6.14l1.27 1.27M16.6 16.6l1.27 1.27M17.86 6.14l-1.27 1.27M7.4 16.6l-1.27 1.27" />
      <path d="M12 12l3-1.8" />
      <circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none" />
    </GlyphBase>
  );
}

function PanchangGlyph({ className }: Readonly<{ className?: string }>) {
  return (
    <GlyphBase className={className}>
      <rect x="4.3" y="5.2" width="15.4" height="14" rx="2.2" />
      <path d="M7.8 3.9v2.5M16.2 3.9v2.5M4.3 9.2h15.4" />
      <circle cx="9.3" cy="13.1" r="1.5" />
      <path d="M14.6 14.8a2.2 2.2 0 1 1 1.18-4.06 1.9 1.9 0 1 0 0 3.8 2.18 2.18 0 0 1-1.18.26z" />
      <path d="M17.2 10.9l.22.48.53.08-.39.38.1.55-.46-.25-.46.25.1-.55-.39-.38.53-.08z" />
    </GlyphBase>
  );
}

function NumerologyGlyph({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <GlyphBase className={className}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8 8h8M8 12h8M8 16h8M8 8v8M12 8v8M16 8v8" />
      <circle cx="8" cy="8" r=".6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r=".6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r=".6" fill="currentColor" stroke="none" />
    </GlyphBase>
  );
}

function CalculatorsGlyph({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <GlyphBase className={className}>
      <rect x="4.6" y="4.4" width="10.4" height="15.2" rx="2" />
      <path d="M7 7.4h5.6M7.2 11.1h2M10.2 11.1h2M7.2 14h2M10.2 14h2M7.2 16.9h5" />
      <circle cx="17.8" cy="8.4" r="2.7" />
      <path d="M17.8 6.3v4.2M15.7 8.4h4.2" />
    </GlyphBase>
  );
}

function MuhurtaGlyph({ className }: Readonly<{ className?: string }>) {
  return (
    <GlyphBase className={className}>
      <circle cx="12" cy="10.3" r="5.6" />
      <path d="M12 7.3v3.1l2.1 1.35" />
      <path d="M8.8 18.8h6.4" />
      <path d="M9.8 16.9c.55.22 1.25.33 2.2.33s1.65-.11 2.2-.33" />
      <path d="M12 14.9c-.7-.28-1.4-.9-1.4-1.95 0-.94.62-1.52 1.4-1.85.78.33 1.4.91 1.4 1.85 0 1.05-.7 1.67-1.4 1.95z" />
    </GlyphBase>
  );
}

function UtilityIconGlyph({
  name,
  className,
}: Readonly<{
  name: UtilityIconName;
  className?: string;
}>) {
  switch (name) {
    case "kundli":
      return <KundliGlyph className={className} />;
    case "compatibility":
      return <CompatibilityGlyph className={className} />;
    case "rashifal":
      return <RashifalGlyph className={className} />;
    case "panchang":
      return <PanchangGlyph className={className} />;
    case "numerology":
      return <NumerologyGlyph className={className} />;
    case "calculators":
      return <CalculatorsGlyph className={className} />;
    case "muhurta":
      return <MuhurtaGlyph className={className} />;
    default:
      return <KundliGlyph className={className} />;
  }
}

export function UtilityIcon({
  name,
  className,
  glyphClassName,
}: Readonly<UtilityIconProps>) {
  return (
    <UtilityIconFrame className={className}>
      <UtilityIconGlyph name={name} className={glyphClassName} />
    </UtilityIconFrame>
  );
}
