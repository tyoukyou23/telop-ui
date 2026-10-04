/**
 * Themes. A theme is two colors that carry meaning — `primary` (structure, the
 * "network color") and `accent` (attention: live, hot, correct) — plus the surfaces
 * for a light and a dark mode.
 *
 * Give `createTheme` just the two brand colors and it derives everything else for both
 * modes: tinted surfaces, readable text on each fill, and dark-mode versions of the brand
 * colors that stay legible on a dark background.
 *
 * Rules that keep the broadcast look intact:
 *   - Exactly two brand colors. Accent is for the 1–3 things that need attention.
 *   - No glow, no gradients (they read as 80s disco on a projector).
 *   - The dark mode is a deep tint of `primary`, not pure black.
 */

import { contrastRatio, ensureContrast, mix, parseColor, readableOn } from "./color";

export interface ModeColors {
  bg: string;
  fg: string;
  primary: string;
  accent: string;
  panel: string;
  /** Text on a `primary` fill. */
  onPrimary: string;
  /** Text on an `accent` fill. Default: white. */
  onAccent?: string;
  /** Secondary text. */
  mute: string;
  /** Empty tracks, dividers, outlines. */
  track: string;
  /** CSS filter applied to a logo in this mode (e.g. invert to white on dark). */
  logoFilter?: string;
}

export interface TelopTheme {
  name: string;
  light: ModeColors;
  dark: ModeColors;
  /** The top color band: [primary share, accent share]. Default 8:2. */
  band?: [number, number];
}

/** Navy + red — the classic news-desk look. The default. */
export const broadcast: TelopTheme = {
  name: "broadcast",
  light: {
    bg: "#f7f7f4", fg: "#14204a", primary: "#1f3b8f", accent: "#d7262e", panel: "#ffffff",
    onPrimary: "#ffffff", mute: "rgba(20,32,74,.55)", track: "rgba(31,59,143,.1)",
  },
  dark: {
    bg: "#0d1938", fg: "#f3f5fb", primary: "#8fa6ec", accent: "#ff5058", panel: "#15244d",
    onPrimary: "#0d1938", mute: "rgba(243,245,251,.6)", track: "rgba(255,255,255,.1)", logoFilter: "brightness(0) invert(1)",
  },
};

/** Ink + orange — a variety-show look. */
export const variety: TelopTheme = {
  name: "variety",
  light: {
    bg: "#faf8f3", fg: "#1c1c1c", primary: "#1c1c1c", accent: "#e85a00", panel: "#ffffff",
    onPrimary: "#ffffff", mute: "rgba(28,28,28,.55)", track: "rgba(28,28,28,.09)",
  },
  dark: {
    bg: "#121212", fg: "#f5f5f5", primary: "#f5f5f5", accent: "#ff7a1a", panel: "#1f1f1f",
    onPrimary: "#121212", onAccent: "#121212", mute: "rgba(245,245,245,.6)", track: "rgba(255,255,255,.1)", logoFilter: "brightness(0) invert(1)",
  },
};

/** Deep green + gold — calm, ceremonial (graduations, awards). */
export const ceremony: TelopTheme = {
  name: "ceremony",
  light: {
    bg: "#f6f5f0", fg: "#14281f", primary: "#1d4d3a", accent: "#a97b25", panel: "#ffffff",
    onPrimary: "#ffffff", mute: "rgba(20,40,31,.55)", track: "rgba(29,77,58,.1)",
  },
  dark: {
    bg: "#0c1f17", fg: "#f2f1ea", primary: "#8fc4ab", accent: "#e0b45a", panel: "#143024",
    onPrimary: "#0c1f17", onAccent: "#0c1f17", mute: "rgba(242,241,234,.6)", track: "rgba(255,255,255,.1)", logoFilter: "brightness(0) invert(1)",
  },
};

export const presets = { broadcast, variety, ceremony };

export type BrandColors = Partial<ModeColors> & Pick<ModeColors, "primary" | "accent">;

/** Paper-white and ink used as the ends of the derived surfaces. */
const PAPER = "#f8f8f5";
const INK = "#0b0c10";

/** The light mode, derived from two colors (anything given in `c` wins). */
function deriveLight(c: BrandColors): ModeColors {
  const bg = c.bg ?? mix(PAPER, c.primary, 0.035);
  const fg = c.fg ?? mix(c.primary, INK, 0.72);
  return {
    bg, fg,
    primary: c.primary,
    accent: c.accent,
    panel: c.panel ?? "#ffffff",
    onPrimary: c.onPrimary ?? readableOn(c.primary),
    onAccent: c.onAccent ?? readableOn(c.accent),
    mute: c.mute ?? `color-mix(in srgb, ${fg} 55%, transparent)`,
    track: c.track ?? `color-mix(in srgb, ${c.primary} 11%, transparent)`,
    logoFilter: c.logoFilter,
  };
}

/** The dark mode: a deep tint of primary, with the brand colors lifted until they read on it. */
function deriveDark(light: ModeColors, c: Partial<ModeColors> = {}): ModeColors {
  const bg = c.bg ?? mix(INK, light.primary, 0.16);
  const fg = c.fg ?? mix("#ffffff", light.primary, 0.05);
  const primary = c.primary ?? ensureContrast(light.primary, bg, 4.5, "#ffffff");
  const accent = c.accent ?? ensureContrast(light.accent, bg, 4, "#ffffff");
  return {
    bg, fg, primary, accent,
    panel: c.panel ?? mix(bg, light.primary, 0.14),
    onPrimary: c.onPrimary ?? readableOn(primary, bg),
    onAccent: c.onAccent ?? readableOn(accent, bg),
    mute: c.mute ?? `color-mix(in srgb, ${fg} 60%, transparent)`,
    track: c.track ?? "rgba(255,255,255,.1)",
    logoFilter: c.logoFilter ?? "brightness(0) invert(1)",
  };
}

/**
 * Build a theme from two brand colors:
 *
 *   createTheme("school", { primary: "#25408e", accent: "#d2232a" })
 *
 * Everything else is derived for both modes. Pass any other field to override it, and a
 * third argument to override dark-mode fields. In development, low-contrast combinations
 * are reported once in the console (see `checkTheme`).
 */
export function createTheme(name: string, light: BrandColors, dark?: Partial<ModeColors>): TelopTheme {
  const l = deriveLight(light);
  const theme: TelopTheme = { name, light: l, dark: deriveDark(l, dark) };
  warnOnce(theme);
  return theme;
}

export interface ThemeIssue { mode: "light" | "dark"; what: string; ratio: number; min: number }

/**
 * Contrast problems that would make a screen hard to read from the back of a room.
 * Checks the brand colors against the background and the text on each fill.
 */
export function checkTheme(theme: TelopTheme): ThemeIssue[] {
  const out: ThemeIssue[] = [];
  for (const mode of ["light", "dark"] as const) {
    const c = theme[mode];
    const pairs: Array<[string, string, string, number]> = [
      ["primary on background", c.primary, c.bg, 3],
      ["accent on background", c.accent, c.bg, 3],
      // labels on fills are bold and large on a projector — WCAG "large text" is 3:1
      ["text on primary", c.onPrimary, c.primary, 3],
      ["text on accent", c.onAccent ?? "#ffffff", c.accent, 3],
      ["text on background", c.fg, c.bg, 7],
    ];
    for (const [what, a, b, min] of pairs) {
      if (!parseColor(a) || !parseColor(b)) continue;
      const ratio = contrastRatio(a, b);
      if (ratio < min) out.push({ mode, what, ratio: Math.round(ratio * 10) / 10, min });
    }
  }
  return out;
}

const warned = new Set<string>();
function warnOnce(theme: TelopTheme) {
  const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.NODE_ENV;
  if (env === "production" || warned.has(theme.name)) return;
  const issues = checkTheme(theme);
  if (!issues.length) return;
  warned.add(theme.name);
  // eslint-disable-next-line no-console
  console.warn(`[telop-ui] theme "${theme.name}" may be hard to read on a projector:\n` +
    issues.map((i) => `  ${i.mode}: ${i.what} ${i.ratio}:1 (want ${i.min}:1)`).join("\n"));
}

/** CSS custom properties for a theme + mode (set on the root element). */
export function themeVars(theme: TelopTheme, mode: "light" | "dark"): Record<string, string> {
  const c = theme[mode];
  const [a, b] = theme.band ?? [8, 2];
  return {
    "--tu-bg": c.bg,
    "--tu-fg": c.fg,
    "--tu-primary": c.primary,
    "--tu-accent": c.accent,
    "--tu-panel": c.panel,
    "--tu-on-primary": c.onPrimary,
    "--tu-on-accent": c.onAccent ?? "#ffffff",
    "--tu-mute": c.mute,
    "--tu-track": c.track,
    "--tu-logo-filter": c.logoFilter ?? "none",
    // The band and banners always use the LIGHT-mode brand colors (they are the "network colors")
    "--tu-brand-primary": theme.light.primary,
    "--tu-brand-accent": theme.light.accent,
    "--tu-on-brand-primary": theme.light.onPrimary,
    "--tu-on-brand-accent": theme.light.onAccent ?? "#ffffff",
    "--tu-band-a": String(a),
    "--tu-band-b": String(b),
  };
}
