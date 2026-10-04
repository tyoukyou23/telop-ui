/**
 * Small color helpers for building themes from two brand colors. No dependencies.
 * Only hex (#rgb / #rrggbb) and rgb()/rgba() are understood; anything else (CSS variables,
 * named colors) is passed through untouched and skips the contrast math.
 */

export type RGB = [number, number, number];

export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase();
  let m = /^#([0-9a-f]{3})$/.exec(s);
  if (m) return [0, 1, 2].map((i) => parseInt(m![1][i] + m![1][i], 16)) as RGB;
  m = /^#([0-9a-f]{6})$/.exec(s);
  if (m) return [0, 2, 4].map((i) => parseInt(m![1].slice(i, i + 2), 16)) as RGB;
  m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(s);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null;
}

export function toHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function luminance(c: string | RGB): number {
  const rgb = typeof c === "string" ? parseColor(c) : c;
  if (!rgb) return 0.5;
  const [r, g, b] = rgb.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1–21. 4.5 for body text, 3 for large text and bold shapes. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mix `a` toward `b` by t (0 = a, 1 = b). Falls back to CSS color-mix for colors it cannot parse. */
export function mix(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return `color-mix(in srgb, ${b} ${Math.round(t * 100)}%, ${a})`;
  return toHex([0, 1, 2].map((i) => ca[i] + (cb[i] - ca[i]) * t) as RGB);
}

/**
 * Text color for a fill. White is preferred while it reaches `minLight` (TV captions are
 * white on colored bars; 3:1 is enough for bold, large text); otherwise the better of the two.
 */
export function readableOn(bg: string, dark = "#111318", light = "#ffffff", minLight = 3): string {
  const onLight = contrastRatio(bg, light);
  if (onLight >= minLight) return light;
  return onLight >= contrastRatio(bg, dark) ? light : dark;
}

/**
 * The smallest move of `color` toward `toward` that reaches `ratio` against `bg`.
 * Used to make a brand color readable on the other mode's background.
 */
export function ensureContrast(color: string, bg: string, ratio: number, toward: string): string {
  if (!parseColor(color) || !parseColor(bg)) return color;
  if (contrastRatio(color, bg) >= ratio) return color;
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const c = mix(color, toward, t);
    if (contrastRatio(c, bg) >= ratio) return c;
  }
  return toward;
}
