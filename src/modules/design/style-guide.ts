export type TokenSpec = {
  name: string;
  cssVar: string;
  value: string;
  note: string;
};

export const colorTokens: TokenSpec[] = [
  {
    name: "Surface",
    cssVar: "--color-surface",
    value: "#fffdf8",
    note: "Primary white-ivory canvas for public surfaces.",
  },
  {
    name: "Elevated Surface",
    cssVar: "--color-surface-elevated",
    value: "#faf6ee",
    note: "Secondary warm-neutral plane for layered sections.",
  },
  {
    name: "Panel",
    cssVar: "--color-panel",
    value: "rgba(255, 251, 244, 0.95)",
    note: "Default premium container treatment on light pages.",
  },
  {
    name: "Accent",
    cssVar: "--color-accent",
    value: "#b88943",
    note: "Restrained gold for focus and action.",
  },
  {
    name: "Foreground",
    cssVar: "--color-foreground",
    value: "#2b241d",
    note: "Primary ink tone for premium readability.",
  },
  {
    name: "Muted",
    cssVar: "--color-muted",
    value: "#6a5d4f",
    note: "Supportive copy with a calm editorial tone.",
  },
];

export const spacingTokens: TokenSpec[] = [
  {
    name: "Space 2",
    cssVar: "--space-2",
    value: "0.5rem",
    note: "Tight UI spacing.",
  },
  {
    name: "Space 4",
    cssVar: "--space-4",
    value: "1rem",
    note: "Compact internal rhythm.",
  },
  {
    name: "Space 6",
    cssVar: "--space-6",
    value: "1.5rem",
    note: "Default component padding.",
  },
  {
    name: "Space 10",
    cssVar: "--space-10",
    value: "2.5rem",
    note: "Section gutters.",
  },
  {
    name: "Space 14",
    cssVar: "--space-14",
    value: "5rem",
    note: "Hero and page spacing.",
  },
];

export const radiusTokens: TokenSpec[] = [
  {
    name: "Radius LG",
    cssVar: "--radius-lg",
    value: "1.25rem",
    note: "Form and control edges.",
  },
  {
    name: "Radius XL",
    cssVar: "--radius-xl",
    value: "1.75rem",
    note: "Content modules and callouts.",
  },
  {
    name: "Radius 2XL",
    cssVar: "--radius-2xl",
    value: "2.5rem",
    note: "Premium panels and hero cards.",
  },
  {
    name: "Radius Pill",
    cssVar: "--radius-pill",
    value: "999px",
    note: "Buttons, badges, and navigation chips.",
  },
];

export const shadowTokens: TokenSpec[] = [
  {
    name: "Shadow SM",
    cssVar: "--shadow-sm",
    value: "0 12px 32px rgba(85,67,40,0.12)",
    note: "Subtle depth for controls.",
  },
  {
    name: "Shadow MD",
    cssVar: "--shadow-md",
    value: "0 18px 52px rgba(85,67,40,0.16)",
    note: "Default panel shadow.",
  },
  {
    name: "Shadow LG",
    cssVar: "--shadow-lg",
    value: "0 26px 72px rgba(85,67,40,0.2)",
    note: "Hover lift on premium surfaces.",
  },
  {
    name: "Glow",
    cssVar: "--shadow-glow",
    value: "0 14px 40px rgba(184,137,67,0.22)",
    note: "Warm emphasis for primary actions.",
  },
];

export const typographyTokens: TokenSpec[] = [
  {
    name: "Display XL",
    cssVar: "--font-size-display-xl",
    value: "clamp(3.5rem, 8vw, 6.75rem)",
    note: "Poster-scale brand statements.",
  },
  {
    name: "Display LG",
    cssVar: "--font-size-display-lg",
    value: "clamp(2.85rem, 6vw, 5rem)",
    note: "Page hero headlines.",
  },
  {
    name: "Title LG",
    cssVar: "--font-size-title-lg",
    value: "clamp(1.8rem, 3vw, 2.7rem)",
    note: "Section titles.",
  },
  {
    name: "Body LG",
    cssVar: "--font-size-body-lg",
    value: "1.125rem",
    note: "Primary editorial paragraph size.",
  },
];

export const motionTokens: TokenSpec[] = [
  {
    name: "Fast",
    cssVar: "--motion-duration-fast",
    value: "180ms",
    note: "Micro-feedback for chips and badges.",
  },
  {
    name: "Base",
    cssVar: "--motion-duration-base",
    value: "280ms",
    note: "Default UI transitions.",
  },
  {
    name: "Slow",
    cssVar: "--motion-duration-slow",
    value: "520ms",
    note: "Atmospheric motion on larger surfaces.",
  },
];
