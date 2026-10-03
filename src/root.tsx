import { createContext, useContext, useEffect, useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { CSS } from "./styles";
import { broadcast, themeVars, type TelopTheme } from "./theme";
import { MESSAGES, type Locale, type Messages } from "./i18n";

/** useLayoutEffect on the client, useEffect on the server (avoids the SSR warning). */
export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const STYLE_ID = "telop-ui-styles";
const FONT_ID = "telop-ui-font";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;1,800&display=swap";

export type Shape = "slant" | "square" | "round";
export type Motion = "calm" | "normal" | "snappy";
export type Density = "comfortable" | "compact";

/** Duration multiplier per motion setting — the CSS uses the same numbers (--tu-speed). */
export const SPEED: Record<Motion, number> = { calm: 1.6, normal: 1, snappy: 0.6 };

interface Ctx { theme: TelopTheme; mode: "light" | "dark"; messages: Messages; shape: Shape; motion: Motion; density: Density }
const TelopContext = createContext<Ctx>({
  theme: broadcast, mode: "light", messages: MESSAGES.ja, shape: "slant", motion: "normal", density: "comfortable",
});

/** Current theme, mode and UI strings (for building your own parts). */
export function useTelop(): Ctx {
  return useContext(TelopContext);
}

/**
 * Multiply a JS duration (ms) by the current motion setting. Use it for any timer that
 * waits for a CSS animation, so the two stay in step at every speed.
 */
export function useSpeed(): number {
  return SPEED[useContext(TelopContext).motion];
}

/** The library's own UI strings for the current locale. */
export function useMessages(): Messages {
  return useContext(TelopContext).messages;
}

export interface TelopRootProps {
  /** A preset (`presets.broadcast`…) or your own `createTheme(...)`. Default: broadcast. */
  theme?: TelopTheme;
  /** Light (default) or dark — dark is for dim rooms and projectors with poor contrast. */
  mode?: "light" | "dark";
  /** Built-in strings: "ja" (default) | "en" | "zh". */
  locale?: Locale;
  /** Override any built-in string. */
  messages?: Partial<Messages>;
  /** Show the brand color band at the top edge. Default true. */
  band?: boolean;
  /** Box shape for every part: slanted (TV, default), square, or rounded. */
  shape?: Shape;
  /** Animation speed for every part: calm (ceremonies), normal, snappy (variety). */
  motion?: Motion;
  /** Spacing in lists and panels: comfortable (default) or compact (more on one screen). */
  density?: Density;
  /** Hide the mouse cursor (projecting: hide it while controls are hidden). */
  hideCursor?: boolean;
  /** Load the numeral font (Barlow Condensed) from Google Fonts. Default true. */
  loadFont?: boolean;
  /** Inject the stylesheet automatically. Set false if you import `telop-ui/styles.css`. Default true. */
  injectStyles?: boolean;
  /** Also paint <body> (visible when the page overscrolls). Default true. */
  paintBody?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * The outermost wrapper of every telop-ui screen. Provides theme, mode and strings,
 * injects the CSS once, and draws the brand band.
 */
export function TelopRoot({
  theme = broadcast, mode = "light", locale = "ja", messages, band = true, hideCursor = false,
  shape = "slant", motion = "normal", density = "comfortable",
  loadFont = true, injectStyles = true, paintBody = true, className = "", style, children,
}: TelopRootProps) {
  useIsoLayoutEffect(() => {
    if (!injectStyles) return;
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    // Replace a stale copy too (hot reload, or two versions of the library on one page),
    // otherwise CSS changes never reach a page that is already open.
    if (el.textContent !== CSS) el.textContent = CSS;
  }, [injectStyles, CSS]);

  useEffect(() => {
    if (!loadFont || document.getElementById(FONT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, [loadFont]);

  // Paint <body> before the first paint, otherwise a dark screen flashes light at the edges.
  useIsoLayoutEffect(() => {
    if (!paintBody) return undefined;
    const prev = document.body.style.background;
    document.body.style.background = theme[mode].bg;
    return () => { document.body.style.background = prev; };
  }, [paintBody, theme, mode]);

  const ctx: Ctx = { theme, mode, messages: { ...MESSAGES[locale], ...messages }, shape, motion, density };
  return (
    <TelopContext.Provider value={ctx}>
      <div className={`tu-root ${hideCursor ? "is-cursor-hidden" : ""} ${className}`} data-mode={mode}
        data-shape={shape} data-motion={motion} data-density={density}
        style={{ ...(themeVars(theme, mode) as CSSProperties), ...style }}>
        {band && <div className="tu-band"><span /><span /></div>}
        {children}
      </div>
    </TelopContext.Provider>
  );
}
