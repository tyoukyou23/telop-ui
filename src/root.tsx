import { createContext, useContext, useEffect, useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { CSS } from "./styles";
import { broadcast, themeVars, type TelopTheme } from "./theme";
import { MESSAGES, type Locale, type Messages } from "./i18n";

/** useLayoutEffect on the client, useEffect on the server (avoids the SSR warning). */
export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const STYLE_ID = "telop-ui-styles";
const FONT_ID = "telop-ui-font";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;1,800&display=swap";

interface Ctx { theme: TelopTheme; mode: "light" | "dark"; messages: Messages }
const TelopContext = createContext<Ctx>({ theme: broadcast, mode: "light", messages: MESSAGES.ja });

/** Current theme, mode and UI strings (for building your own parts). */
export function useTelop(): Ctx {
  return useContext(TelopContext);
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
  loadFont = true, injectStyles = true, paintBody = true, className = "", style, children,
}: TelopRootProps) {
  useIsoLayoutEffect(() => {
    if (!injectStyles || document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, [injectStyles]);

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

  const ctx: Ctx = { theme, mode, messages: { ...MESSAGES[locale], ...messages } };
  return (
    <TelopContext.Provider value={ctx}>
      <div className={`tu-root ${hideCursor ? "is-cursor-hidden" : ""} ${className}`} data-mode={mode}
        style={{ ...(themeVars(theme, mode) as CSSProperties), ...style }}>
        {band && <div className="tu-band"><span /><span /></div>}
        {children}
      </div>
    </TelopContext.Provider>
  );
}
