import type { ReactNode, SVGProps } from "react";

export type NavagrahaPremiumIconName =
  | "kundli"
  | "panchang"
  | "rashifal"
  | "numerology";

type NavagrahaPremiumIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: NavagrahaPremiumIconName;
  size?: number | string;
};

type IconGlyphProps = SVGProps<SVGSVGElement>;

const GOLD = "#A87922";
const GOLD_DARK = "#8A641D";
const GOLD_LIGHT = "#E6C46A";
const GREEN = "#2F8A2F";
const GREEN_LIGHT = "#3DAA35";
const PEARL = "rgba(255,255,255,0.96)";
const PEARL_WARM = "rgba(250,246,235,0.92)";
const SHADOW = "rgba(138,100,29,0.24)";
const YANTRA_GOLD = "#C9A24B";
const YANTRA_YELLOW = "#E4AE18";
const YANTRA_CORAL = "#C94A42";
const YANTRA_CREAM = "#FFFDF8";
const YANTRA_INK = "#111111";

function IconSvg({
  children,
  ...props
}: Readonly<IconGlyphProps & { children: ReactNode }>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

function PearlBase() {
  return (
    <>
      <circle cx="34.6" cy="35.2" r="24.6" fill={SHADOW} opacity="0.42" />
      <circle cx="31.2" cy="29.6" r="24.8" fill={PEARL} />
      <circle cx="31.2" cy="29.6" r="21.2" fill={PEARL_WARM} opacity="0.28" />
      <path
        d="M14.6 27.4c2.8-9.8 10.9-15.4 21.3-14.5"
        stroke="white"
        strokeWidth="4"
        opacity="0.9"
      />
      <path
        d="M48.1 44.8c-4.2 5-10.2 7.8-17 7.4"
        stroke={SHADOW}
        strokeWidth="3"
        opacity="0.72"
      />
    </>
  );
}

export function PremiumKundliIcon(props: Readonly<IconGlyphProps>) {
  return (
    <IconSvg {...props}>
      <rect
        x="9"
        y="9"
        width="46"
        height="46"
        rx="7.5"
        fill={YANTRA_CREAM}
        stroke={YANTRA_GOLD}
        strokeWidth="3.2"
      />
      <rect
        x="12.2"
        y="12.2"
        width="39.6"
        height="39.6"
        rx="3.2"
        fill={YANTRA_CREAM}
        stroke={YANTRA_INK}
        strokeWidth="1.8"
      />
      <rect x="13.2" y="13.2" width="12.55" height="12.55" fill={YANTRA_CORAL} />
      <rect x="25.75" y="13.2" width="12.5" height="12.55" fill={YANTRA_YELLOW} />
      <rect x="38.25" y="13.2" width="12.55" height="12.55" fill={YANTRA_CORAL} />
      <rect x="13.2" y="25.75" width="12.55" height="12.5" fill={YANTRA_YELLOW} />
      <rect x="25.75" y="25.75" width="12.5" height="12.5" fill={YANTRA_CREAM} />
      <rect x="38.25" y="25.75" width="12.55" height="12.5" fill={YANTRA_YELLOW} />
      <rect x="13.2" y="38.25" width="12.55" height="12.55" fill={YANTRA_CORAL} />
      <rect x="25.75" y="38.25" width="12.5" height="12.55" fill={YANTRA_YELLOW} />
      <rect x="38.25" y="38.25" width="12.55" height="12.55" fill={YANTRA_CORAL} />
      <path
        d="M25.75 13.2v37.6M38.25 13.2v37.6M13.2 25.75h37.6M13.2 38.25h37.6"
        stroke={YANTRA_INK}
        strokeWidth="1.9"
      />
      <path
        d="M13.8 13.8 25.75 25.75M50.2 13.8 38.25 25.75M13.8 50.2 25.75 38.25M50.2 50.2 38.25 38.25"
        stroke={YANTRA_INK}
        strokeWidth="1.85"
      />
      <rect
        x="25.75"
        y="25.75"
        width="12.5"
        height="12.5"
        fill={YANTRA_CREAM}
        stroke={YANTRA_INK}
        strokeWidth="1.9"
      />
      <path
        d="M28.6 34.2c1.1 2.2 4.9 2.3 6.4.1 1.3-1.9-.3-4.2-2.7-3.8-1.8.3-2.9 1.7-3.4 3.4"
        stroke={YANTRA_GOLD}
        strokeWidth="1.9"
      />
      <path d="M35.2 30.1c1.7.7 2.8 2 3 3.7" stroke={YANTRA_GOLD} strokeWidth="1.65" />
      <path d="M29.4 28.8c1.4 1.2 3.5 1.2 5 0" stroke={YANTRA_GOLD} strokeWidth="1.7" />
      <circle cx="32" cy="27.3" r="1.35" fill={YANTRA_GOLD} />
    </IconSvg>
  );
}

export function PremiumPanchangIcon(props: Readonly<IconGlyphProps>) {
  return (
    <IconSvg {...props}>
      <PearlBase />
      <path
        d="M21.1 20.2h23.7a4.8 4.8 0 0 1 4.8 4.8v21.6a4.8 4.8 0 0 1-4.8 4.8H21.1a4.8 4.8 0 0 1-4.8-4.8V25a4.8 4.8 0 0 1 4.8-4.8Z"
        fill={SHADOW}
        opacity="0.52"
      />
      <path
        d="M20 17.6h24a4.7 4.7 0 0 1 4.7 4.7v23a4.7 4.7 0 0 1-4.7 4.7H20a4.7 4.7 0 0 1-4.7-4.7v-23a4.7 4.7 0 0 1 4.7-4.7Z"
        fill="rgba(255,255,255,0.76)"
        stroke={GOLD_DARK}
        strokeWidth="3.35"
      />
      <path d="M23.5 13.6v8.3M40.5 13.6v8.3" stroke={GOLD_DARK} strokeWidth="3.4" />
      <path d="M18 27.2h28" stroke={GOLD_LIGHT} strokeWidth="3" />
      <path
        d="M31.2 32a7.2 7.2 0 0 0 7.3 8.9 7.1 7.1 0 1 1-7.3-11.9 7.3 7.3 0 0 0 0 3Z"
        fill="rgba(168,121,34,0.2)"
        stroke={GOLD_DARK}
        strokeWidth="2.75"
      />
      <circle cx="39.3" cy="34" r="3.1" fill={GOLD_LIGHT} />
      <circle cx="44.2" cy="23.6" r="3.05" fill={GREEN} />
      <path d="M23.2 43.6h8.2M35.9 43.6h6.3" stroke={GOLD} strokeWidth="2.75" />
    </IconSvg>
  );
}

export function PremiumRashifalIcon(props: Readonly<IconGlyphProps>) {
  return (
    <IconSvg {...props}>
      <PearlBase />
      <circle cx="33.6" cy="33.6" r="18.7" fill={SHADOW} opacity="0.52" />
      <circle
        cx="32"
        cy="32"
        r="18.8"
        fill="rgba(255,255,255,0.72)"
        stroke={GOLD_DARK}
        strokeWidth="3.35"
      />
      <circle cx="32" cy="32" r="8.9" stroke={GOLD} strokeWidth="2.85" />
      <path
        d="M32 13.2v6.4M32 44.4v6.4M13.2 32h6.4M44.4 32h6.4M18.7 18.7l4.6 4.6M40.7 40.7l4.6 4.6M45.3 18.7l-4.6 4.6M23.3 40.7l-4.6 4.6"
        stroke={GOLD}
        strokeWidth="2.8"
      />
      <path d="M21.2 18.2c4.4-3 10.1-3.9 15.6-2.4" stroke={GOLD_LIGHT} strokeWidth="2.7" />
      <path d="M40.1 17.6a18.6 18.6 0 0 1 7.3 7.2" stroke={GREEN} strokeWidth="4.1" />
      <circle cx="32" cy="32" r="4" fill={GOLD_DARK} />
      <path d="m32 25.5 1.8 4 4.3.4-3.2 2.8 1 4.2-3.9-2.2-3.9 2.2 1-4.2-3.2-2.8 4.3-.4z" fill={GOLD_LIGHT} opacity="0.98" />
      <circle cx="46.8" cy="25.2" r="2.65" fill={GREEN_LIGHT} />
    </IconSvg>
  );
}

export function PremiumNumerologyIcon(props: Readonly<IconGlyphProps>) {
  return (
    <IconSvg {...props}>
      <PearlBase />
      <rect x="19" y="19" width="30" height="30" rx="5.8" fill={SHADOW} opacity="0.52" />
      <rect
        x="16.5"
        y="16.5"
        width="31"
        height="31"
        rx="6"
        fill="rgba(255,255,255,0.75)"
        stroke={GOLD_DARK}
        strokeWidth="3.35"
      />
      <path d="M26.8 16.8v30.4M37.2 16.8v30.4M16.8 26.8h30.4M16.8 37.2h30.4" stroke={GOLD} strokeWidth="2.65" />
      <path d="M20.3 22.6c2.5-2.8 6.2-4.2 10.2-4.1" stroke={GOLD_LIGHT} strokeWidth="2.65" />
      <circle cx="22" cy="22" r="2.25" fill={GOLD_DARK} />
      <circle cx="32" cy="22" r="1.95" fill={GOLD} />
      <circle cx="42" cy="22" r="2.25" fill={GOLD_DARK} />
      <circle cx="22" cy="32" r="1.95" fill={GOLD} />
      <rect x="28.7" y="28.7" width="6.6" height="6.6" rx="2.1" fill={GREEN} />
      <circle cx="32" cy="32" r="1.8" fill={GREEN_LIGHT} />
      <circle cx="42" cy="32" r="1.95" fill={GOLD} />
      <circle cx="22" cy="42" r="2.25" fill={GOLD_DARK} />
      <circle cx="32" cy="42" r="1.95" fill={GOLD} />
      <circle cx="42" cy="42" r="2.25" fill={GOLD_DARK} />
      <path d="M28.4 50.3h7.2" stroke={GOLD_LIGHT} strokeWidth="2.7" />
    </IconSvg>
  );
}

export function NavagrahaPremiumIcon({
  name,
  size = 56,
  style,
  ...props
}: Readonly<NavagrahaPremiumIconProps>) {
  const iconStyle = {
    width: size,
    height: size,
    ...style,
  };

  if (name === "kundli") {
    return <PremiumKundliIcon style={iconStyle} {...props} />;
  }

  if (name === "panchang") {
    return <PremiumPanchangIcon style={iconStyle} {...props} />;
  }

  if (name === "rashifal") {
    return <PremiumRashifalIcon style={iconStyle} {...props} />;
  }

  return <PremiumNumerologyIcon style={iconStyle} {...props} />;
}
