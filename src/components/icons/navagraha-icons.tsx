import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement>;

function Glyph(props: Readonly<GlyphProps>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    />
  );
}

export function HomeIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <path d="m4.5 11.2 7.5-6.4 7.5 6.4" />
      <path d="M6.8 10.2v8.4h10.4v-8.4" />
      <path d="M10 18.6v-4.4h4v4.4" />
    </Glyph>
  );
}

export function KundliIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <rect x="4.7" y="4.7" width="14.6" height="14.6" rx="2" />
      <path d="M4.7 12h14.6M12 4.7v14.6M4.7 4.7l14.6 14.6M19.3 4.7 4.7 19.3" />
    </Glyph>
  );
}

export function AskNIIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="6.8" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21" />
    </Glyph>
  );
}

export function ConsultIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="8.2" r="3" />
      <path d="M5.7 19.2c0-3.2 2.8-5.6 6.3-5.6s6.3 2.4 6.3 5.6" />
    </Glyph>
  );
}

export function AccountIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="8.4" r="3.1" />
      <path d="M6.4 19.4c.7-3.1 2.8-4.9 5.6-4.9s4.9 1.8 5.6 4.9" />
    </Glyph>
  );
}

export function TodayIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <rect x="5" y="6.2" width="14" height="12.8" rx="2" />
      <path d="M8 4.6v3M16 4.6v3M5 10h14" />
      <path d="M9 13.2h2M13 13.2h2M9 16h2M13 16h2" />
    </Glyph>
  );
}

export function LearnIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <path d="M7 5.2h8.8A2.2 2.2 0 0 1 18 7.4v11.4H7a2 2 0 0 1-2-2V7.2a2 2 0 0 1 2-2Z" />
      <path d="M8.2 9h6.4M8.2 12h6.4M8.2 15h4.2" />
    </Glyph>
  );
}

export function ShopIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <path d="M6.4 10.2h11.2L17 19.2H7z" />
      <path d="M8 10.2V8.8c0-2 1.8-3.6 4-3.6s4 1.6 4 3.6v1.4" />
    </Glyph>
  );
}

export function PanchangIcon(props: Readonly<GlyphProps>) {
  return <TodayIcon {...props} />;
}

export function RashifalIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="7.2" />
      <path d="M12 4.8v14.4M4.8 12h14.4M7.1 7.1l9.8 9.8M16.9 7.1l-9.8 9.8" />
    </Glyph>
  );
}

export function MuhuratIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="7.4" />
      <path d="M12 7.2v5l3.2 2" />
      <path d="M7.3 4.8 5.4 6.7M16.7 4.8l1.9 1.9" />
    </Glyph>
  );
}

export function GuidanceIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <path d="M12 3.8 18 6v5.2c0 3.7-2.4 6.8-6 8.9-3.6-2.1-6-5.2-6-8.9V6z" />
      <path d="m9.2 12.1 1.8 1.8 3.9-4" />
    </Glyph>
  );
}

export function PrivateDetailsIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <rect x="6" y="10.3" width="12" height="8.4" rx="2" />
      <path d="M8.4 10.3V8.2a3.6 3.6 0 0 1 7.2 0v2.1" />
      <path d="M12 13.8v1.6" />
    </Glyph>
  );
}

export function NoGuaranteeIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="7.2" />
      <path d="m7 7 10 10" />
      <path d="M9.5 11.4h5" />
    </Glyph>
  );
}

export function AcharyaIcon(props: Readonly<GlyphProps>) {
  return <ConsultIcon {...props} />;
}

export function LagnaIcon(props: Readonly<GlyphProps>) {
  return <KundliIcon {...props} />;
}

export function RashiIcon(props: Readonly<GlyphProps>) {
  return <RashifalIcon {...props} />;
}

export function NavamsaIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <path d="M12 4.5 19 12l-7 7.5L5 12z" />
      <path d="M8.5 12h7M12 8.4v7.2" />
    </Glyph>
  );
}

export function GrahaIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2" />
      <path d="m5.9 5.9 1.6 1.6M16.5 16.5l1.6 1.6M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6" />
    </Glyph>
  );
}

export function DashaIcon(props: Readonly<GlyphProps>) {
  return <MuhuratIcon {...props} />;
}

export function GocharIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="8" cy="12" r="2.8" />
      <circle cx="16" cy="12" r="2.8" />
      <path d="M10.8 12h2.4M16 9.2V6.5h3M8 14.8v2.7H5" />
    </Glyph>
  );
}

export function PlayIcon(props: Readonly<GlyphProps>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="7.4" />
      <path d="m10.2 8.9 5 3.1-5 3.1z" />
    </Glyph>
  );
}
