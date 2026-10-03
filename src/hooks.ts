import { useCallback, useEffect, useRef, useState } from "react";
import { MOTION } from "./tokens";
import { useIsoLayoutEffect } from "./root";

/**
 * Light/dark mode remembered per screen (localStorage). Read BEFORE the first paint —
 * reading it in a normal effect flashes the light mode for people who chose dark.
 */
export function useStoredMode(storageKey: string, initial: "light" | "dark" = "light"): ["light" | "dark", () => void] {
  const [mode, setMode] = useState<"light" | "dark">(initial);
  useIsoLayoutEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === "light" || v === "dark") setMode(v);
    } catch { /* storage unavailable: keep the default */ }
  }, [storageKey]);
  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    try { localStorage.setItem(storageKey, next); } catch { /* switching still works */ }
  };
  return [mode, toggle];
}

/**
 * True for `ms` after the mouse moves (show controls only then). False on first render:
 * a projected screen should never open with buttons on it.
 */
export function useAutoHide(ms: number = MOTION.autoHide): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout> | undefined;
    const wake = () => {
      setVisible(true);
      if (id) clearTimeout(id);
      id = setTimeout(() => setVisible(false), ms);
    };
    window.addEventListener("mousemove", wake);
    return () => { window.removeEventListener("mousemove", wake); if (id) clearTimeout(id); };
  }, [ms]);
  return visible;
}

/** Animate a number from its previous value. `bump` increments each time it settles. */
export function useCountUp(target: number | null | undefined, duration: number = MOTION.countUp): [number, number] {
  const [value, setValue] = useState(target ?? 0);
  const [bump, setBump] = useState(0);
  const fromRef = useRef(target ?? 0);
  useEffect(() => {
    if (target == null) return undefined;
    const from = fromRef.current;
    if (from === target) return undefined;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * e;
      setValue(v);
      fromRef.current = v;
      if (p < 1) raf = requestAnimationFrame(step);
      else { fromRef.current = target; setBump((b) => b + 1); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return [value, bump];
}

/** "Now" in ms, refreshed every `interval`. Pass `skew` (server − client) to follow server time. */
export function useNow(interval = 1000, skew = 0): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now + skew;
}

/**
 * Keyboard shortcuts: `{ f: fn, ArrowRight: fn, " ": fn, Escape: fn }`.
 * Ignored while typing in inputs; Space never scrolls the page.
 */
export function useHotkeys(map: Record<string, (e: KeyboardEvent) => void>, enabled = true): void {
  const ref = useRef(map);
  ref.current = map;
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const fn = ref.current[e.key] || ref.current[e.key.toLowerCase()];
      if (!fn) return;
      if (e.key === " ") e.preventDefault();
      fn(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}

export interface PollingOptions<T> {
  /** Milliseconds between fetches. Default 4000. */
  interval?: number;
  /** Return the server's current time (ISO or ms) from a response to measure clock skew. */
  serverTimeOf?: (data: T) => string | number | null | undefined;
  /** Skip fetching while false (e.g. until the router is ready). Default true. */
  enabled?: boolean;
}

export interface PollingState<T> {
  data: T | null;
  /** Set only when the FIRST load fails (show a full-screen message). */
  error: string | null;
  /** Set when a later refresh fails — keep showing the last data, add a small warning. */
  stale: string | null;
  lastOk: Date | null;
  /** server time − client time (ms). */
  skew: number;
  refresh: () => Promise<void>;
}

/**
 * Re-fetch on an interval — the standard data loop of a live screen.
 *   - A failure after data is on screen keeps the old data (`stale`): a projector
 *     must never go blank because Wi-Fi hiccuped.
 *   - Skips fetching while the tab is hidden.
 *   - Your `fetcher` decides auth: throw an Error with a human message, or redirect.
 */
export function usePolling<T>(fetcher: () => Promise<T>, { interval = 4000, serverTimeOf, enabled = true }: PollingOptions<T> = {}): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState<string | null>(null);
  const [lastOk, setLastOk] = useState<Date | null>(null);
  const [skew, setSkew] = useState(0);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;
  const timeRef = useRef(serverTimeOf);
  timeRef.current = serverTimeOf;
  const hasData = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const body = await fetchRef.current();
      hasData.current = true;
      setData(body);
      const t = timeRef.current?.(body);
      if (t != null) setSkew(new Date(t).getTime() - Date.now());
      setLastOk(new Date());
      setStale(null);
      setError(null);
    } catch (e) {
      const msg = (e as Error)?.message || "Error";
      if (hasData.current) setStale(msg);
      else setError(msg);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    refresh();
    const id = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, interval);
    return () => clearInterval(id);
  }, [enabled, interval, refresh]);

  return { data, error, stale, lastOk, skew, refresh };
}

/** "HH:MM" in a time zone (default: the viewer's). */
export function formatClock(ms: number = Date.now(), timeZone?: string, locale = "ja-JP"): string {
  return new Date(ms).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone });
}

/** Seconds left → "MM:SS" ("H:MM:SS" from one hour). */
export function formatCountdown(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h ? `${h}:` : ""}${mm}:${ss}`;
}

/** Toggle browser fullscreen (bind it to F). */
export function toggleFullscreen(): void {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.();
}
