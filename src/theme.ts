/**
 * Themes. A theme is two colors that carry meaning — `primary` (structure, the
 * "network color") and `accent` (attention: live, hot, correct) — plus the surfaces
 * for a light and a dark mode.
 *
 * Rules that keep the broadcast look intact:
 *   - Exactly two brand colors. Accent is for the 1–3 things that need attention.
 *   - No glow, no gradients (they read as 80s disco on a projector).
 *   - The dark mode is a deep tint of `primary`, not pure black.
 */

export interface ModeColors {
  bg: string;
  fg: string;
  primary: string;
  accent: string;
  panel: string;
  /** Text on a `primary` fill. */
  onPrimary: string;
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
    bg: "#faf8f3", fg: "#1c1c1c", primary: "#1c1c1c", accent: "#ff6a00", panel: "#ffffff",
    onPrimary: "#ffffff", mute: "rgba(28,28,28,.55)", track: "rgba(28,28,28,.09)",
  },
  dark: {
    bg: "#121212", fg: "#f5f5f5", primary: "#f5f5f5", accent: "#ff7a1a", panel: "#1f1f1f",
    onPrimary: "#121212", mute: "rgba(245,245,245,.6)", track: "rgba(255,255,255,.1)", logoFilter: "brightness(0) invert(1)",
  },
};

/** Deep green + gold — calm, ceremonial (graduations, awards). */
export const ceremony: TelopTheme = {
  name: "ceremony",
  light: {
    bg: "#f6f5f0", fg: "#14281f", primary: "#1d4d3a", accent: "#b8862b", panel: "#ffffff",
    onPrimary: "#ffffff", mute: "rgba(20,40,31,.55)", track: "rgba(29,77,58,.1)",
  },
  dark: {
    bg: "#0c1f17", fg: "#f2f1ea", primary: "#8fc4ab", accent: "#e0b45a", panel: "#143024",
    onPrimary: "#0c1f17", mute: "rgba(242,241,234,.6)", track: "rgba(255,255,255,.1)", logoFilter: "brightness(0) invert(1)",
  },
};

export const presets = { broadcast, variety, ceremony };

/**
 * Build a theme from two brand colors. The surfaces are derived; pass `dark` to
 * fine-tune the dark mode (light-on-dark versions of your colors usually need tuning).
 */
export function createTheme(name: string, light: Partial<ModeColors> & Pick<ModeColors, "primary" | "accent">, dark?: Partial<ModeColors>): TelopTheme {
  const l: ModeColors = {
    ...broadcast.light,
    track: `color-mix(in srgb, ${light.primary} 10%, transparent)`,
    ...light,
  };
  return { name, light: l, dark: { ...broadcast.dark, ...dark } };
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
    "--tu-mute": c.mute,
    "--tu-track": c.track,
    "--tu-logo-filter": c.logoFilter ?? "none",
    // The band and banners always use the LIGHT-mode brand colors (they are the "network colors")
    "--tu-brand-primary": theme.light.primary,
    "--tu-brand-accent": theme.light.accent,
    "--tu-band-a": String(a),
    "--tu-band-b": String(b),
  };
}
