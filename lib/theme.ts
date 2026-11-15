/**
 * Flight Journal theme — dark cockpit style.
 *
 * Near-black backgrounds, cyan accent (sky / glass), amber for warnings,
 * red for expired currency. High contrast, readable at a glance on the
 * ramp or in the cockpit — no decoration that costs legibility.
 */
export const COLORS = {
  bg: "#05070D",
  panel: "#0D1526",
  panel2: "#111C33",
  input: "#0A1220",
  border: "#1E2A44",
  text: "#FFFFFF",
  muted: "#8A94A8",
  faint: "#5A6478",
  accent: "#22D3EE",
  accentDim: "#0E7490",
  good: "#4ADE80",
  warn: "#F59E0B",
  bad: "#F87171",
  pro: "#F5C518",
} as const;

export const FONT = {
  regular: "System",
  mono: "Menlo",
} as const;

/** Status colors for currency cards. */
export const STATUS_COLORS = {
  current: COLORS.good,
  warning: COLORS.warn,
  expired: COLORS.bad,
} as const;
