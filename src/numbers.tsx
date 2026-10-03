import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCountUp, formatCountdown } from "./hooks";
import { useMessages } from "./root";
import { NUMBER, resolveSize, type NumberSize } from "./tokens";
import { Telop } from "./text";

type Tone = "primary" | "accent";
const toneColor = (tone?: Tone) => (tone ? `var(--tu-${tone})` : undefined);

export interface BigNumberProps {
  value: number | null | undefined;
  unit?: ReactNode;
  size?: NumberSize | string;
  tone?: Tone;
  /** Shown while `value` is null. Default: the locale's "waiting". */
  placeholder?: ReactNode;
  decimals?: number;
}

/** Bold condensed number. Counts from the previous value and gives a small bump when it lands. */
export function BigNumber({ value, unit, size = "lg", tone, placeholder, decimals = 0 }: BigNumberProps) {
  const m = useMessages();
  const [v, bump] = useCountUp(value);
  const shown = decimals ? v.toFixed(decimals) : Math.round(v);
  return (
    <span key={bump} className={`tu-big ${bump ? "tu-bump" : ""}`} style={{ fontSize: resolveSize(size, NUMBER, "lg"), color: toneColor(tone) }}>
      {value == null ? <span className="tu-big-wait">{placeholder ?? m.waiting}</span> : shown}
      {value != null && unit != null && <span className="tu-big-unit">{unit}</span>}
    </span>
  );
}

export interface StatBlockProps {
  label: ReactNode;
  value: number | null | undefined;
  unit?: ReactNode;
  caption?: ReactNode;
  size?: NumberSize | string;
  tone?: Tone;
  /** stack: label above the number · row: label left, number right (right edges align when stacked). */
  layout?: "stack" | "row";
  /** Entrance delay (ms) for staggering several blocks. */
  delay?: number;
  className?: string;
}

/** A labelled metric: outline telop + big number + caption. */
export function StatBlock({ label, value, unit, caption, size = "lg", tone, layout = "stack", delay = 0, className = "" }: StatBlockProps) {
  if (layout === "row") {
    return (
      <div className={`tu-wipe ${className}`} style={{ animationDelay: `${delay}ms` }}>
        <div className="tu-stat-row">
          <Telop tone="outline" size="sm">{label}</Telop>
          <BigNumber value={value} unit={unit} size={size} tone={tone} />
        </div>
        {caption && <div className="tu-stat-caption is-end">{caption}</div>}
      </div>
    );
  }
  return (
    <div className={`tu-wipe ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <Telop tone="outline" size="sm">{label}</Telop>
      <div className="tu-stat-head"><BigNumber value={value} unit={unit} size={size} tone={tone} /></div>
      {caption && <div className="tu-stat-caption">{caption}</div>}
    </div>
  );
}

/** One segment per person, filled from the left. Shows progress without revealing who. */
export function SegBar({ total, filled, tall = false }: { total: number; filled: number; tall?: boolean }) {
  return (
    <div className={`tu-segs ${tall ? "is-tall" : ""}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`tu-seg ${i < filled ? "is-on" : ""}`} style={{ transitionDelay: `${(i % 6) * 40}ms` }} />
      ))}
    </div>
  );
}

/** Continuous bar (0–1) for amounts that are not countable people (time, completion). */
export function ProgressBar({ value, tone = "primary", height = "1.6vh", className = "" }: { value: number; tone?: Tone; height?: string; className?: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(Math.max(0, Math.min(1, value || 0))), 60);
    return () => clearTimeout(id);
  }, [value]);
  return (
    <div className={`tu-progress ${className}`} style={{ height }}>
      <div className="tu-progress-fill" style={{ width: `${w * 100}%`, background: `var(--tu-${tone})` }} />
    </div>
  );
}

export interface CountdownProps {
  /** Target time (ms). */
  target: number;
  /** Current time (ms) — use `useNow(1000, skew)`. */
  now: number;
  size?: NumberSize | string;
  tone?: Tone;
  /** Shown at zero instead of a frozen 00:00. Default: the locale's "started". */
  done?: ReactNode;
  /** In the last N seconds the number pulses and turns accent (3, 2, 1…). Default 10; 0 to disable. */
  finalSeconds?: number;
}

/** Countdown to a moment. The last seconds pulse; at zero it switches to a word. */
export function Countdown({ target, now, size = "xl", tone = "primary", done, finalSeconds = 10 }: CountdownProps) {
  const m = useMessages();
  const left = Math.ceil((target - now) / 1000);
  const fs = resolveSize(size, NUMBER, "xl");
  if (left <= 0) return <span className="tu-big is-upright tu-beat" style={{ fontSize: fs, color: toneColor(tone) }}>{done ?? m.started}</span>;
  if (finalSeconds && left <= finalSeconds) {
    return <span key={left} className="tu-big tu-beat" style={{ fontSize: fs, color: "var(--tu-accent)" }}>{left}</span>;
  }
  return <span className="tu-big" style={{ fontSize: fs, color: toneColor(tone) }}>{formatCountdown(left)}</span>;
}

/** Clock for the top-right corner. `stale` greys the live dot (disconnected). */
export function Clock({ time, stale = false, title }: { time: string; stale?: boolean; title?: string }) {
  return (
    <span className="tu-clock" title={title}>
      <span className={`tu-dot ${stale ? "is-off" : "tu-live"}`} />
      <span className="tu-big">{time}</span>
    </span>
  );
}

/* ── DigitRoller ─────────────────────────────────────────────────────── */

const STRIP = Array.from({ length: 40 }, (_, i) => i % 10);

/** One digit column. Always rolls forward (one full turn + the difference), then snaps back silently. */
function RollerDigit({ digit, delay, ms }: { digit: number; delay: number; ms: number }) {
  const [pos, setPos] = useState(10 + digit);
  const [moving, setMoving] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setMoving(true);
    setPos((p) => p + 10 + ((digit - (p % 10) + 10) % 10));
  }, [digit]);
  return (
    <span className="tu-roller-col">
      <span className={`tu-roller-strip ${moving ? "is-moving" : ""}`}
        style={{ transform: `translateY(-${pos}em)`, transitionDelay: `${delay}ms`, ["--tu-roll-ms" as string]: `${ms}ms` }}
        onTransitionEnd={() => { setMoving(false); setPos(10 + digit); }}>
        {STRIP.map((d, i) => <span key={i}>{d}</span>)}
      </span>
    </span>
  );
}

export interface DigitRollerProps {
  value: number;
  /** Pad with leading zeros to at least this many digits (keeps width stable). */
  minDigits?: number;
  size?: NumberSize | string;
  tone?: Tone;
  unit?: ReactNode;
  /** Roll duration per digit (ms). Default 1400. */
  duration?: number;
  /** Thousands separator, e.g. ",". */
  separator?: string;
}

/**
 * Slot-machine counter — every digit spins and lands, right to left. For big reveals
 * ("128 students admitted"). For a number that changes often, use BigNumber instead.
 */
export function DigitRoller({ value, minDigits = 1, size = "xl", tone = "primary", unit, duration = 1400, separator }: DigitRollerProps) {
  const digits = String(Math.max(0, Math.round(value))).padStart(minDigits, "0").split("").map(Number);
  const n = digits.length;
  return (
    <span className="tu-roller" style={{ fontSize: resolveSize(size, NUMBER, "xl"), color: toneColor(tone) }} aria-label={String(value)}>
      {digits.map((d, i) => (
        <span key={n - i} style={{ display: "inline-flex" }}>
          {separator && i > 0 && (n - i) % 3 === 0 && <span className="tu-roller-sep">{separator}</span>}
          <RollerDigit digit={d} delay={(n - 1 - i) * 120} ms={duration} />
        </span>
      ))}
      {unit != null && <span className="tu-big-unit">{unit}</span>}
    </span>
  );
}

/* ── SplitFlap ───────────────────────────────────────────────────────── */

const DEFAULT_FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** One flap: shuffles through random characters, then lands on `char`. */
function Flap({ char, delay, cycles, chars, flipMs }: { char: string; delay: number; cycles: number; chars: string; flipMs: number }) {
  const [shown, setShown] = useState(char);
  const [tick, setTick] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    let i = 0;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1;
      if (i > cycles) { setShown(char); setTick((t) => t + 1); return; }
      setShown(chars[Math.floor(Math.random() * chars.length)]);
      setTick((t) => t + 1);
      id = setTimeout(step, flipMs);
    };
    id = setTimeout(step, delay);
    return () => clearTimeout(id);
  }, [char, delay, cycles, chars, flipMs]);
  const wide = /[^\x00-\xff]/.test(shown);
  return (
    <span className={`tu-flap ${wide ? "is-wide" : ""}`}>
      <span key={tick} className="tu-flap-char" style={{ ["--tu-flap-ms" as string]: `${flipMs}ms` }}>{shown === " " ? " " : shown}</span>
    </span>
  );
}

export interface SplitFlapProps {
  text: string;
  /** Pad/cut to a fixed number of cells (keeps the board from jumping). */
  length?: number;
  size?: string;
  /** Random characters shown while flipping. Default A–Z and 0–9. */
  chars?: string;
  /** How many random flips before landing. Default 6. */
  cycles?: number;
  /** One flip (ms). Default 70. */
  flipMs?: number;
  className?: string;
}

/**
 * Split-flap board (the station departure board). When `text` changes each cell shuffles
 * and lands, left to right. For room numbers, times, short headings — not paragraphs.
 */
export function SplitFlap({ text, length, size = "min(4vw, 6.6vh)", chars = DEFAULT_FLAP_CHARS, cycles = 6, flipMs = 70, className = "" }: SplitFlapProps) {
  let cells = Array.from(text);
  if (length != null) cells = cells.slice(0, length).concat(Array(Math.max(0, length - cells.length)).fill(" "));
  return (
    <span className={`tu-flap-row ${className}`} style={{ fontSize: size }} aria-label={text}>
      {cells.map((c, i) => <Flap key={i} char={c} delay={i * 45} cycles={cycles} chars={chars} flipMs={flipMs} />)}
    </span>
  );
}
