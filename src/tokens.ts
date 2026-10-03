/**
 * Design tokens — the single source of truth for sizes and motion.
 *
 * Every size is `min(Xvw, Yvh)`: the smaller of the two wins, so the layout never
 * overflows on a wide projector or a tall portrait monitor. Pick sizes by NAME;
 * write a raw `min(...)` only when nothing fits.
 */

/** Body text sizes (`<Text variant>`). */
export const TEXT = {
  caption: "min(1vw, 1.7vh)",
  body: "min(1.4vw, 2.4vh)",
  heading: "min(2.2vw, 3.7vh)",
  title: "min(3.5vw, 5.8vh)",
  display: "min(5.4vw, 9vh)",
} as const;

/** Telop (slanted caption box) sizes. */
export const TELOP = {
  xs: "min(1vw, 1.7vh)",
  sm: "min(1.25vw, 2.1vh)",
  md: "min(1.6vw, 2.7vh)",
  lg: "min(1.9vw, 3.2vh)",
  xl: "min(2.4vw, 4vh)",
} as const;

/** Big number sizes. */
export const NUMBER = {
  sm: "min(2.4vw, 4vh)",
  md: "min(3.6vw, 6vh)",
  lg: "min(6vw, 10vh)",
  xl: "min(9vw, 15vh)",
  hero: "min(15vw, 26vh)",
} as const;

/**
 * Motion (ms). Rule of thumb: a whole list must be fully on screen within 0.7s —
 * anything slower reads as "laggy" on a live projector.
 */
export const MOTION = {
  countUp: 750,
  wipe: 450,
  wipeFast: 280,
  stagger: 30,
  ticker: 2600,
  banner: 3400,
  slide: 15000,
  autoHide: 3000,
} as const;

export type TextSize = keyof typeof TEXT;
export type TelopSize = keyof typeof TELOP;
export type NumberSize = keyof typeof NUMBER;

/** Resolve a size name to its CSS value; any other string is passed through. */
export function resolveSize<T extends Record<string, string>>(size: keyof T | string | undefined, table: T, fallback: keyof T): string {
  if (size == null) return table[fallback];
  return (table as Record<string, string>)[size as string] ?? (size as string);
}
