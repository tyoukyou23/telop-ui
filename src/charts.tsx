import { useEffect, useRef, useState, type ReactNode } from "react";
import { BigNumber } from "./numbers";
import { useMessages, useSpeed } from "./root";
import { MOTION } from "./tokens";

/*
 * Charts. Two colors only: primary for everything, accent for the 1–3 items that need
 * attention (all-accent means nothing stands out). Rank aggregates (questions, schools,
 * regions) — never rank individual people in front of an audience.
 */

export interface RankingRowProps {
  rank: number;
  /** Small code before the text ("Q4"). */
  code?: ReactNode;
  text: ReactNode;
  /** 0–1: bar length; shown as a percentage unless `valueLabel` is given. */
  value: number | null | undefined;
  valueLabel?: ReactNode;
  hot?: boolean;
  compact?: boolean;
  index?: number;
  onClick?: () => void;
}

/** One ranking row: rank box, code, text, growing bar, value. */
export function RankingRow({ rank, code, text, value, valueLabel, hot = false, compact = false, index = 0, onClick }: RankingRowProps) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(value ?? 0), 60 + index * MOTION.stagger);
    return () => clearTimeout(id);
  }, [value, index]);
  const color = hot ? "var(--tu-accent)" : "var(--tu-primary)";
  const body = (
    <>
      <span className={`tu-rank-no ${hot ? "tu-fill-accent" : "tu-fill-primary"}`}><span className="tu-telop-in">{rank}</span></span>
      {code != null && <span className="tu-rank-code">{code}</span>}
      <span className="tu-rank-main">
        <span className="tu-rank-text">{text}</span>
        <span className="tu-rank-track"><span className="tu-rank-fill" style={{ width: `${w * 100}%`, background: color }} /></span>
      </span>
      <span className="tu-rank-value" style={{ color }}>
        {valueLabel ?? (value == null ? "--" : Math.round(value * 100))}
        {valueLabel == null && value != null && <span className="tu-big-unit">%</span>}
      </span>
    </>
  );
  const cls = `tu-rank tu-wipe-fast ${compact ? "is-compact" : ""} ${onClick ? "is-clickable" : ""}`;
  const style = { animationDelay: `${index * (compact ? 15 : MOTION.stagger)}ms` };
  return onClick
    ? <button type="button" className={cls} style={style} onClick={onClick}>{body}</button>
    : <div className={cls} style={style}>{body}</div>;
}

export interface RankingItem { key: string | number; code?: ReactNode; text: ReactNode; value: number | null; valueLabel?: ReactNode }

/**
 * A full ranking (pre-sorted). The top `hotCount` are accent — except a perfect 1.0, which
 * has nothing to draw attention to. With 9+ rows it switches to two compact columns.
 */
export function RankingList({ items, hotCount = 3, onSelect, columns, className = "" }: {
  items: RankingItem[]; hotCount?: number; onSelect?: (item: RankingItem) => void; columns?: number; className?: string;
}) {
  const many = items.length > 8;
  const cols = columns || (many ? 2 : 1);
  const rows = Math.ceil(items.length / cols);
  return (
    <div className={`tu-rank-list ${cols === 1 ? "is-single" : ""} ${className}`}
      style={cols > 1 ? { gridAutoFlow: "column", gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, gridAutoColumns: "minmax(0, 1fr)", columnGap: "3vw" } : undefined}>
      {items.map((it, i) => (
        <RankingRow key={it.key} rank={i + 1} code={it.code} text={it.text} value={it.value} valueLabel={it.valueLabel}
          hot={i < hotCount && it.value !== 1} compact={many} index={i} onClick={onSelect ? () => onSelect(it) : undefined} />
      ))}
    </div>
  );
}

export interface BarItem { key: string | number; label: ReactNode; value: number; display?: ReactNode }

/** Horizontal bars: label · bar · value. `highlight` keys are accent. */
export function BarList({ items, max, highlight = [], unit = "", labelWidth = "28%", className = "" }: {
  items: BarItem[]; max?: number; highlight?: Array<string | number>; unit?: ReactNode; labelWidth?: string; className?: string;
}) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value || 0));
  const [grow, setGrow] = useState(false);
  useEffect(() => { const id = setTimeout(() => setGrow(true), 60); return () => clearTimeout(id); }, []);
  return (
    <div className={className} style={{ ["--tu-bar-label" as string]: labelWidth }}>
      {items.map((it, i) => {
        const hot = highlight.includes(it.key);
        const color = hot ? "var(--tu-accent)" : "var(--tu-primary)";
        return (
          <div key={it.key} className="tu-bar-row tu-wipe-fast" style={{ animationDelay: `${i * MOTION.stagger}ms` }}>
            <span className="tu-bar-label" style={{ color: hot ? color : undefined }}>{it.label}</span>
            <div className="tu-progress" style={{ height: "min(1.6vw, 2.6vh)" }}>
              <div className="tu-progress-fill" style={{ width: grow ? `${Math.max(0, (it.value || 0) / top) * 100}%` : "0%", background: color, transitionDelay: `${i * MOTION.stagger}ms` }} />
            </div>
            <span className="tu-bar-value tu-big" style={{ color }}>{it.display ?? <>{it.value}<span className="tu-big-unit">{unit}</span></>}</span>
          </div>
        );
      })}
    </div>
  );
}

// Tints of primary for stacked parts (one hue, decreasing strength)
const TINTS = [100, 72, 50, 34, 22];

/** One bar split into parts (composition by region, course…). Tints of primary + one accent part. */
export function StackedBar({ parts, highlight, legend = true, unit, className = "" }: {
  parts: Array<{ key: string | number; label: ReactNode; value: number }>; highlight?: string | number; legend?: boolean; unit?: ReactNode; className?: string;
}) {
  const m = useMessages();
  const [grow, setGrow] = useState(false);
  useEffect(() => { const id = setTimeout(() => setGrow(true), 80); return () => clearTimeout(id); }, []);
  const total = parts.reduce((a, p) => a + (p.value || 0), 0) || 1;
  const fill = (key: string | number, i: number) => (key === highlight ? "var(--tu-accent)" : `color-mix(in srgb, var(--tu-primary) ${TINTS[i % TINTS.length]}%, var(--tu-panel))`);
  return (
    <div className={className}>
      <div className="tu-stack">
        {parts.map((p, i) => (
          <div key={p.key} className="tu-stack-part" style={{ flexGrow: grow ? (p.value || 0) : 0, background: fill(p.key, i) }}>
            {(p.value || 0) / total >= 0.08 && <span>{p.label}</span>}
          </div>
        ))}
      </div>
      {legend && (
        <div className="tu-legend">
          {parts.map((p, i) => (
            <span key={p.key} className="tu-legend-item">
              <span className="tu-legend-swatch" style={{ background: fill(p.key, i) }} />
              {p.label}<b className="tu-big">{p.value}</b><span className="tu-muted">{unit ?? m.people}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** A rubber stamp ("Correct") pressed onto its positioned parent. */
export function Stamp({ children }: { children?: ReactNode }) {
  const m = useMessages();
  return <span className="tu-stamp">{children ?? m.correct}</span>;
}

export interface ChoiceOption { key: string | number; mark: ReactNode; count: number }

/**
 * How many picked each option. `revealed` turns the answer accent, stamps it and dims the
 * rest. Changing `resetKey` regrows the bars from zero (next question).
 */
export function ChoiceBars({ options, total, highlightKey, revealed = false, stampText, unit, resetKey }: {
  options: ChoiceOption[]; total: number; highlightKey?: string | number; revealed?: boolean; stampText?: ReactNode; unit?: ReactNode; resetKey?: unknown;
}) {
  const m = useMessages();
  const [grow, setGrow] = useState(false);
  useEffect(() => {
    setGrow(false);
    const id = setTimeout(() => setGrow(true), 220);
    return () => clearTimeout(id);
  }, [resetKey]);
  return (
    <div className="tu-choices">
      {options.map((o, i) => {
        const r = total ? (o.count || 0) / total : 0;
        const hit = o.key === highlightKey;
        return (
          <div key={o.key} className={`tu-choice tu-wipe ${revealed && !hit ? "is-dim" : ""}`} style={{ animationDelay: `${120 + i * 60}ms` }}>
            <span className="tu-opt-mark">{o.mark}</span>
            <div className="tu-opt-track">
              <div className="tu-opt-fill" style={{ width: grow ? `${Math.max(r * 100, 0.6)}%` : "0%", background: revealed && hit ? "var(--tu-accent)" : "var(--tu-primary)" }} />
            </div>
            <span className="tu-opt-num">
              <BigNumber value={grow ? Math.round(r * 100) : 0} unit="%" size="min(4.6vw, 7.6vh)" />
              <span className="tu-opt-count">{o.count || 0}{unit ?? m.people}</span>
            </span>
            {revealed && hit && <Stamp>{stampText}</Stamp>}
          </div>
        );
      })}
    </div>
  );
}

/* ── RankingRace ─────────────────────────────────────────────────────── */

export interface RaceItem { key: string | number; label: ReactNode; value: number }

/**
 * Live ranking where rows SLIDE to their new place as values change (votes, tallies).
 * Sorted for you; the top `hotCount` are accent. `rowHeight` fixes the spacing.
 */
export function RankingRace({ items, hotCount = 1, max, unit, rowHeight = "min(5vw, 8.4vh)", labelWidth = "26%", className = "" }: {
  items: RaceItem[]; hotCount?: number; max?: number; unit?: ReactNode; rowHeight?: string; labelWidth?: string; className?: string;
}) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const order = new Map(sorted.map((it, i) => [it.key, i]));
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className={`tu-race ${className}`} style={{ height: `calc(${rowHeight} * ${items.length})`, ["--tu-race-label" as string]: labelWidth }}>
      {/* Render in a STABLE order (by key) so React moves rows instead of re-creating them. */}
      {items.map((it) => {
        const i = order.get(it.key) ?? 0;
        const hot = i < hotCount;
        const color = hot ? "var(--tu-accent)" : "var(--tu-primary)";
        return (
          <div key={it.key} className="tu-race-row" style={{ top: `calc(${rowHeight} * ${i})`, height: rowHeight }}>
            <span className={`tu-rank-no ${hot ? "tu-fill-accent" : "tu-fill-primary"}`}><span className="tu-telop-in">{i + 1}</span></span>
            <span className="tu-race-label">{it.label}</span>
            <div className="tu-progress" style={{ height: `calc(${rowHeight} * .32)` }}>
              <div className="tu-progress-fill" style={{ width: `${Math.max(0, it.value / top) * 100}%`, background: color }} />
            </div>
            <span className="tu-race-value"><BigNumber value={it.value} unit={unit} size="inherit" tone={hot ? "accent" : "primary"} /></span>
          </div>
        );
      })}
    </div>
  );
}

/* ── DrumrollReveal ──────────────────────────────────────────────────── */

export interface DrumrollProps {
  options: Array<{ key: string | number; label: ReactNode }>;
  /** The key it lands on. */
  answer: string | number;
  /** Start the drumroll when this becomes true. */
  play: boolean;
  /** Total drumroll time (ms). Default 2800. */
  duration?: number;
  columns?: number;
  stampText?: ReactNode;
  onDone?: () => void;
  className?: string;
}

/**
 * Quiz-show reveal: the highlight races across the options, slows down, and lands on the
 * answer — which then turns accent and gets a stamp. Set `play` to start; reset it to rewind.
 */
export function DrumrollReveal({ options, answer, play, duration: baseDuration = 2800, columns, stampText, onDone, className = "" }: DrumrollProps) {
  const duration = baseDuration * useSpeed();
  const [lit, setLit] = useState<number | null>(null);
  const [landed, setLanded] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  // Depend on the keys, not the array: callers usually pass a fresh literal every render,
  // and restarting on each render would keep it spinning forever.
  const keys = options.map((o) => String(o.key)).join("\u0000");
  useEffect(() => {
    setLanded(false);
    if (!play) { setLit(null); return undefined; }
    const list = keys.split("\u0000");
    const n = list.length;
    const target = Math.max(0, list.indexOf(String(answer)));
    // Enough steps to feel like a spin, ending exactly on the answer.
    const steps = n * 3 + ((target - (n * 3) % n) + n) % n;
    // Delays grow quadratically: fast at first, slowing into the landing.
    const weights = Array.from({ length: steps }, (_, i) => 1 + 6 * Math.pow(i / steps, 2));
    const scale = duration / weights.reduce((a, b) => a + b, 0);
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let t = 0;
    for (let i = 0; i < steps; i++) {
      t += weights[i] * scale;
      const idx = (i + 1) % n;
      timers.push(setTimeout(() => setLit(idx), t));
    }
    timers.push(setTimeout(() => { setLit(target); setLanded(true); doneRef.current?.(); }, t + 120));
    return () => timers.forEach(clearTimeout);
  }, [play, answer, duration, keys]);
  const cols = columns || Math.min(options.length, 4);
  return (
    <div className={`tu-drum ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {options.map((o, i) => {
        const isAnswer = o.key === answer;
        const cls = landed ? (isAnswer ? "is-hit" : "is-dim") : lit === i ? "is-lit" : "";
        return (
          <div key={o.key} className={`tu-drum-item ${cls}`}>
            {o.label}
            {landed && isAnswer && <Stamp>{stampText}</Stamp>}
          </div>
        );
      })}
    </div>
  );
}
